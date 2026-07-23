const TelegramBot = require('node-telegram-bot-api');

// جلب التوكن الخاص بالبوت من إعدادات البيئة في Render
const token = process.env.TELEGRAM_BOT_TOKEN;

// التأكد من وجود التوكن
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'صديقي';
  
  bot.sendMessage(chatId, `أهلاً بك يا ${userName}! البوت يعمل بنجاح على السيرفر 🚀`);
});

console.log('Bot is running successfully and waiting for messages...');
