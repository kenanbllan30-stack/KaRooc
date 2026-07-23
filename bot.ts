import TelegramBot from "node-telegram-bot-api";
import { db, telegramUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const token = process.env["TELEGRAM_BOT_TOKEN"];
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
}

const bot = new TelegramBot(token, { polling: true });

logger.info("Telegram bot started (polling mode)");

// ── bot commands menu ─────────────────────────────────────────────────────────

bot.setMyCommands([
  { command: "start",   description: "بدء الاستخدام" },
  { command: "balance", description: "رصيدي" },
  { command: "luck",    description: "جرب حظك" },
  { command: "daily",   description: "مكافأة يومية" },
  { command: "games",   description: "العاب" },
]).catch((err) => logger.error({ err }, "Failed to set bot commands"));

// ── helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateUser(
  telegramId: bigint,
  username: string | undefined,
  firstName: string | undefined,
) {
  const [existing] = await db
    .select()
    .from(telegramUsersTable)
    .where(eq(telegramUsersTable.telegramId, telegramId));

  if (existing) return existing;

  const [created] = await db
    .insert(telegramUsersTable)
    .values({ telegramId, username, firstName, balance: 1000 })
    .returning();

  return created;
}

function name(msg: TelegramBot.Message): string {
  return msg.from?.first_name ?? "Player";
}

// ── /start ───────────────────────────────────────────────────────────────────

const MAIN_KEYBOARD: TelegramBot.ReplyKeyboardMarkup = {
  keyboard: [
    [{ text: "ألعاب 🎮🔥" }],
    [{ text: "شحن رصيد في البوت 📥" }, { text: "سحب رصيد من البوت 📤" }],
    [{ text: "كود هدية 🎁" }, { text: "اهداء رصيد 🎁" }],
    [{ text: "تواصل مع الدعم ✉️" }],
    [{ text: "الاحالات 💰" }, { text: "السجل 🔄" }],
    [{ text: "العروض ⭐" }],
  ],
  resize_keyboard: true,
  persistent: true,
};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await getOrCreateUser(
      BigInt(msg.from!.id),
      msg.from?.username,
      msg.from?.first_name,
    );
    await bot.sendMessage(
      chatId,
      `🎮 *مرحباً ${name(msg)}!*\n\n` +
        `رصيدك الحالي: 💰 *${user.balance} عملة*\n\n` +
        `اختر من القائمة أدناه:`,
      {
        parse_mode: "Markdown",
        reply_markup: MAIN_KEYBOARD,
      },
    );
  } catch (err) {
    logger.error({ err }, "Error in /start handler");
  }
});

// ── ألعاب button ─────────────────────────────────────────────────────────────

bot.on("message", async (msg) => {
  if (msg.text !== "ألعاب 🎮🔥") return;
  const chatId = msg.chat.id;
  try {
    const inlineKeyboard: TelegramBot.InlineKeyboardButton[][] = [];

    // Built-in slots TWA (only when a public URL is available)
    if (TWA_URL) {
      inlineKeyboard.push([
        {
          text: "🎰 اضغط هنا للبدء باللعب 🎮",
          web_app: { url: TWA_URL },
        },
      ]);
    }

    // External game links
    inlineKeyboard.push(
      [
        { text: "⚡ Zeus Slots", url: "https://casino.guru/zeus-free-online-slot" },
        { text: "🃏 Slotomania",  url: "https://www.slotomania.com/" },
      ],
      [
        { text: "🌟 Book of Dead", url: "https://casino.guru/book-of-dead-free-online-slot" },
        { text: "🦁 Big Cat King", url: "https://casino.guru/big-cat-king-megaways-free-online-slot" },
      ],
    );

    await bot.sendMessage(
      chatId,
      `🎮 *اختر لعبتك المفضلة وابدأ اللعب الآن!*`,
      {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: inlineKeyboard },
      },
    );
  } catch (err) {
    logger.error({ err }, "Error in ألعاب handler");
  }
});

// ── /balance ─────────────────────────────────────────────────────────────────

bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const user = await getOrCreateUser(
      BigInt(msg.from!.id),
      msg.from?.username,
      msg.from?.first_name,
    );
    await bot.sendMessage(
      chatId,
      `💰 *${name(msg)}'s Balance*\n\n${user.balance.toLocaleString()} coins`,
      { parse_mode: "Markdown" },
    );
  } catch (err) {
    logger.error({ err }, "Error in /balance handler");
  }
});

// ── /luck ────────────────────────────────────────────────────────────────────

const LUCK_EMOJIS_WIN = ["🍀", "🎉", "🌟", "🎊", "✨"];
const LUCK_EMOJIS_LOSE = ["😢", "💀", "🌧️", "😬", "🫠"];

bot.onText(/\/luck/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const telegramId = BigInt(msg.from!.id);
    const user = await getOrCreateUser(
      telegramId,
      msg.from?.username,
      msg.from?.first_name,
    );

    const win = Math.random() >= 0.5;
    const amount = Math.floor(Math.random() * 151) + 50; // 50–200
    const newBalance = win
      ? user.balance + amount
      : Math.max(0, user.balance - amount);

    await db
      .update(telegramUsersTable)
      .set({ balance: newBalance })
      .where(eq(telegramUsersTable.telegramId, telegramId));

    const emoji =
      win
        ? LUCK_EMOJIS_WIN[Math.floor(Math.random() * LUCK_EMOJIS_WIN.length)]
        : LUCK_EMOJIS_LOSE[Math.floor(Math.random() * LUCK_EMOJIS_LOSE.length)];

    const result = win
      ? `${emoji} *Lucky!* You won *+${amount} coins*!`
      : `${emoji} *Bad luck!* You lost *${amount} coins*.`;

    await bot.sendMessage(
      chatId,
      `${result}\n\n💰 Balance: ${newBalance.toLocaleString()} coins`,
      { parse_mode: "Markdown" },
    );
  } catch (err) {
    logger.error({ err }, "Error in /luck handler");
  }
});

// ── /daily ───────────────────────────────────────────────────────────────────

const DAILY_REWARD_MIN = 100;
const DAILY_REWARD_MAX = 500;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

bot.onText(/\/daily/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const telegramId = BigInt(msg.from!.id);
    const user = await getOrCreateUser(
      telegramId,
      msg.from?.username,
      msg.from?.first_name,
    );

    const now = new Date();

    if (user.lastDaily) {
      const elapsed = now.getTime() - user.lastDaily.getTime();
      if (elapsed < COOLDOWN_MS) {
        const remaining = COOLDOWN_MS - elapsed;
        const h = Math.floor(remaining / 3_600_000);
        const m = Math.floor((remaining % 3_600_000) / 60_000);
        await bot.sendMessage(
          chatId,
          `⏰ Already claimed today!\n\nCome back in *${h}h ${m}m* for your next reward.`,
          { parse_mode: "Markdown" },
        );
        return;
      }
    }

    const reward =
      Math.floor(Math.random() * (DAILY_REWARD_MAX - DAILY_REWARD_MIN + 1)) +
      DAILY_REWARD_MIN;
    const newBalance = user.balance + reward;

    await db
      .update(telegramUsersTable)
      .set({ balance: newBalance, lastDaily: now })
      .where(eq(telegramUsersTable.telegramId, telegramId));

    await bot.sendMessage(
      chatId,
      `🎁 *Daily reward claimed!*\n\n+${reward} coins added to your wallet.\n💰 Balance: ${newBalance.toLocaleString()} coins`,
      { parse_mode: "Markdown" },
    );
  } catch (err) {
    logger.error({ err }, "Error in /daily handler");
  }
});

// ── /games ───────────────────────────────────────────────────────────────────

const devDomain = process.env["REPLIT_DEV_DOMAIN"];
const TWA_URL = devDomain
  ? `https://${devDomain}/slots-game/`
  : null;

bot.onText(/\/games/, async (msg) => {
  const chatId = msg.chat.id;

  const inlineKeyboard: TelegramBot.InlineKeyboardButton[][] = [];

  // Row 1: built-in TWA slots (only shown when a public URL is available)
  if (TWA_URL) {
    inlineKeyboard.push([
      {
        text: "🎰 Play Slots (Mini App)",
        web_app: { url: TWA_URL },
      },
    ]);
  }

  // Row 2: external game links
  inlineKeyboard.push([
    {
      text: "⚡ Zeus Slots (Demo)",
      url: "https://casino.guru/zeus-free-online-slot",
    },
    {
      text: "🃏 Slotomania",
      url: "https://www.slotomania.com/",
    },
  ]);

  inlineKeyboard.push([
    {
      text: "🌟 Book of Dead (Demo)",
      url: "https://casino.guru/book-of-dead-free-online-slot",
    },
    {
      text: "🦁 Big Cat King (Demo)",
      url: "https://casino.guru/big-cat-king-megaways-free-online-slot",
    },
  ]);

  await bot.sendMessage(
    chatId,
    `🎮 *Game Arcade*\n\nPick a game to play:`,
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: inlineKeyboard },
    },
  );
});

bot.on("polling_error", (err) => {
  logger.error({ err }, "Telegram polling error");
});

export default bot;
