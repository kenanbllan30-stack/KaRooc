const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const ADMIN_CHAT_ID = '7956980808';

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set!');
  process.exit(1);
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}`);
});

const bot = new TelegramBot(token, { 
  polling: {
    interval: 2000,
    autoStart: true,
    params: { timeout: 10 }
  } 
});

bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    return;
  }
});

const WEBSITE_URL = process.env.RENDER_EXTERNAL_URL || `https://karooc-1.onrender.com`;
const userStates = {};

function sendMainMenu(chatId, userName) {
  const text = `أهلاً فيك يا ${userName} بـ KaRooc 🎮\nجاهز تلعبها صح؟\n\nاختر ما يناسبك من القائمة أدناه 👇`;
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '⚡ شحن الرصيد ⚡' }, { text: '💸 سحب الأرباح 💸' }],
        [{ text: '🔥 العروض الحصرية 🔥' }, { text: '🎡 عجلة الحظ 🎡' }],
        [{ text: '🎮 الدخول إلى الألعاب 🎮' }],
        [{ text: '📂 حسابي ورصيدي 📂' }, { text: '🤖 الدعم الفني 🤖' }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, keyboard);
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userName = msg.from.first_name || 'صديقي';

  if (!text) return;

  if (text === '/start') {
    delete userStates[chatId];
    sendMainMenu(chatId, userName);
  } 
  else if (text === '🏠 القائمة الرئيسية') {
    delete userStates[chatId];
    sendMainMenu(chatId, userName);
  }
  else if (text === '⚡ شحن الرصيد ⚡') {
    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '💳 شام كاش (Cham Cash)' }],
          [{ text: '📱 سيرياتيل كاش (Syriatel Cash)' }],
          [{ text: '🏠 القائمة الرئيسية' }]
        ],
        resize_keyboard: true
      }
    };
    bot.sendMessage(chatId, `💳 اختر طريقة الدفع المناسبة لشحن حسابك:\n*(ملاحظة: استفد من عروض الاسترداد الحصرية عند الشحن!)*`, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
  }
  else if (text === '💳 شام كاش (Cham Cash)') {
    userStates[chatId] = { method: 'Cham Cash', type: 'deposit' };
    bot.sendMessage(chatId, `💳 **شحن عبر شام كاش**\n\nمعرف الحساب المحول إليه:\n\`B38774eaac6e58f5f1e26d79a5f2522a\`\n\nالرجاء تحويل المبلغ المطلوب، ثم **أرسل هنا رقم الحوالة أو صورة الإيصال** ليتم إضافة رصيدك فوراً ⏳`, { parse_mode: 'Markdown' });
  }
  else if (text === '📱 سيرياتيل كاش (Syriatel Cash)') {
    userStates[chatId] = { method: 'Syriatel Cash', type: 'deposit' };
    bot.sendMessage(chatId, `📱 **شحن عبر سيرياتيل كاش**\n\nرقم الحساب المحول إليه:\n\`57480992\`\n\nالرجاء تحويل المبلغ، ثم **أرسل هنا رقم الحوالة أو تفاصيل التحويل** ليتم تأكيد الشحن ⏳`, { parse_mode: 'Markdown' });
  }
  else if (text === '💸 سحب الأرباح 💸') {
    const keyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '💸 سحب عبر شام كاش' }, { text: '💸 سحب عبر سيرياتيل كاش' }],
          [{ text: '🏠 القائمة الرئيسية' }]
        ],
        resize_keyboard: true
      }
    };
    bot.sendMessage(chatId, `💸 **قسم سحب الأرباح الفوري:**\nاختر طريقة السحب المفضلة لديك (سحب من دون أي نسبة اقتطاع!):\n\nأرسل لنا طريقة السحب والقدر المراد سحبه مع الـ ID الخاص بك.`, { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup });
  }
  else if (text === '💸 سحب عبر شام كاش' || text === '💸 سحب عبر سيرياتيل كاش') {
    const method = text.includes('شام') ? 'شام كاش للسحب' : 'سيرياتيل كاش للسحب';
    userStates[chatId] = { method: method, type: 'withdraw' };
    bot.sendMessage(chatId, `📝 **طلب سحب أرباح (${method})**\n\nالرجاء إرسال **رقم حسابك أو رقم هاتفك المحول إليه + المبلغ المراد سحبُه** في رسالة واحدة هنا 👇\n*(ملاحظة: السحب يتم بدون أي نسبة اقتطاع!)*`, { parse_mode: 'Markdown' });
  }
  else if (text === '🔥 العروض الحصرية 🔥') {
    bot.sendMessage(chatId, `🔥 **عرض الاسترداد الخرافي (10%)!** 🔥\n\nلا تخسر فرصتك المضاعفة! احصل على **استرداد نقدي بنسبة 10%** على كل عملية شحن أو تدوير تقوم بها داخل المنصة.\n\n💰 اشحن الآن وضاعف حماسك وأموالك فوراً!\n\nاضغط هنا للبدء والشحن 👇`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 استغل العرض واشحن الآن',
              web_app: { url: WEBSITE_URL }
            }
          ]
        ]
      }
    });
  }
  else if (text === '🎡 عجلة الحظ 🎡') {
    bot.sendMessage(chatId, `🎡 **عجلة الحظ الكبرى!** 🎡\n\nاختبر حظك الآن واربح جوائز فورية وقيمة:\n✨ استرداد بنسبة 25%\n✨ إضافة 1000 ل.س رصيد مجاني\n✨ إضافة 5000 ل.س رصيد مجاني\n✨ سحب أرباح من دون أي نسبة اقتطاع!\n\nاضغط على الزر أدناه لفتح العجلة وتدويرها الآن 👇`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎯 افتح عجلة الحظ الآن',
              web_app: { url: WEBSITE_URL + '#wheel' }
            }
          ]
        ]
      }
    });
  }
  else if (text === '📂 حسابي ورصيدي 📂') {
    bot.sendMessage(chatId, `📂 **معلومات حسابك:**\n- الـ ID الخاص بك: \`${chatId}\`\n- الرصيد الحقيقي: \`5000 ل.س\`\n- حالة العروض: مفعلة (استرداد 10% + سحب بدون نسبة)\n\nيمكنك اللعب والشحن في أي وقت!`, { parse_mode: 'Markdown' });
  }
  else if (text === '🎮 الدخول إلى الألعاب 🎮') {
    bot.sendMessage(chatId, `🎮 **منصة ألعاب KaRooc الحية:**\nاضغط على الزر أدناه لفتح الألعاب واللعب برصيدك الحقيقي 👇`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 افتح منصة الألعاب الآن',
              web_app: { url: WEBSITE_URL }
            }
          ]
        ]
      }
    });
  }
  else if (text === '🤖 الدعم الفني 🤖') {
    bot.sendMessage(chatId, `🤖 **الدعم الفني:** للتواصل واستفسارات الشحن والسحب: @Support_KaRooc`);
  }
  else {
    if (userStates[chatId]) {
      const state = userStates[chatId];
      if (state.type === 'deposit') {
        bot.sendMessage(chatId, `✅ **تم استلام طلب الشحن بنجاح!**\nطريقة الدفع: ${state.method}\nالتفاصيل: ${text}\n\nجاري التحقق من الحوالة وإضافة الرصيد لحسابك مع الاسترداد 🚀`);
        const adminMsg = `🔔 **طلب شحن جديد بانتظار الاعتماد!**\n\n👤 المستخدم: ${userName}\n🆔 الـ ID: \`${chatId}\`\n💳 الطريقة: ${state.method}\n📝 التفاصيل: \`${text}\``;
        bot.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' });
      } else if (state.type === 'withdraw') {
        bot.sendMessage(chatId, `✅ **تم استلام طلب السحب بنجاح!**\nالطريقة: ${state.method}\nالتفاصيل: ${text}\n\nسيتم تدقيق الطلب وتحويل المبلغ (بدون أي اقتطاع نسبة) خلال وقت قصير 💸`);
        const adminMsg = `💸 **طلب سحب أرباح جديد!**\n\n👤 المستخدم: ${userName}\n🆔 الـ ID: \`${chatId}\`\n💳 الطريقة: ${state.method}\n📝 التفاصيل ورقم الحساب: \`${text}\``;
        bot.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' });
      }
      delete userStates[chatId];
    } else {
      bot.sendMessage(chatId, `أهلاً بك! اضغط /start للرجوع للقائمة الرئيسية.`);
    }
  }
});

console.log('Bot with Final Separated Buttons is running...');
    
