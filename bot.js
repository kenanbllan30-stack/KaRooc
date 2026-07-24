const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set!');
  process.exit(1);
}

// تشغيل سيرفر الويب Express للموقع والألعاب
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Web server is running on port ${PORT}`);
});

// تشغيل بوت تليجرام مع تعطيل أي تضارب محتمل في الاتصال
const bot = new TelegramBot(token, { 
  polling: {
    interval: 2000,
    autoStart: true,
    params: {
      timeout: 10
    }
  } 
});

// التعامل مع أخطاء البوت بصمت لكي لا يتوقف السيرفر
bot.on('polling_error', (error) => {
  if (error.code === 'ETELEGRAM' && error.message.includes('409 Conflict')) {
    console.log('تحذير: جلسة أخرى للبوت تعمل، جاري تجاهل التضارب المؤقت...');
    return;
  }
  console.error('Polling error:', error.code);
});

// رابط الموقع الخاص بك على Render
const WEBSITE_URL = process.env.RENDER_EXTERNAL_URL || `https://karooc-1.onrender.com`;

function sendMainMenu(chatId, userName) {
  const text = `أهلاً فيك يا ${userName} بـ KaRooc 🎮\nجاهز تلعبها صح؟\n\n⚡ شحن سريع\n💸 سحب فوري\n🎁 عروض دايمة\n\nبلّش هلا واختار اللي يناسبك من القائمة 👇`;
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '⚡ حساب KaRooc وشحنه ⚡' }],
        [{ text: '📝 التقديم لوكالة 📝' }],
        [{ text: '🎮 الدخول إلى الألعاب مباشرة 🎮' }],
        [{ text: '🎁 الهدايا والتحويل 🎁' }],
        [{ text: '🎡 عجلة الحظ 🎡' }, { text: '📂 حسابي 📂' }],
        [{ text: '🤖 الدعم 🤖' }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, keyboard);
}

function sendAccountMenu(chatId) {
  const text = `📂 **إدارة حساب KaRooc**\nاختر العملية التي تريد إجراؤها من القائمة أدناه 👇`;
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '💳 1. شحن في الموقع' }],
        [{ text: '💰 2. شحن كامل الرصيد' }],
        [{ text: '📤 3. سحب من الموقع' }],
        [{ text: '💸 4. سحب كامل الرصيد' }],
        [{ text: '🏠 5. القائمة الرئيسية' }]
      ],
      resize_keyboard: true
    }
  };

  bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...keyboard });
}

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userName = msg.from.first_name || 'صديقي';

  if (!text) return;

  if (text === '/start') {
    sendMainMenu(chatId, userName);
  } 
  else if (text === '⚡ حساب KaRooc وشحنه ⚡' || text === '📂 حسابي 📂') {
    sendAccountMenu(chatId);
  }
  else if (text === '🏠 القائمة الرئيسية' || text === '🏠 5. القائمة الرئيسية') {
    sendMainMenu(chatId, userName);
  }
  else if (text === '💳 1. شحن في الموقع') {
    bot.sendMessage(chatId, `💳 **شحن في الموقع:**\nأرسل المبلغ ورقم المعرف (ID) الخاص بك لشحن الحقيقي.`);
  }
  else if (text === '💰 2. شحن كامل الرصيد') {
    bot.sendMessage(chatId, `💰 **شحن كامل الرصيد:** جاري معالجة طلبك... ⏳`);
  }
  else if (text === '📤 3. سحب من الموقع') {
    bot.sendMessage(chatId, `📤 **سحب من الموقع:** أرسل المبلغ المراد سحبه.`);
  }
  else if (text === '💸 4. سحب كامل الرصيد') {
    bot.sendMessage(chatId, `💸 **سحب كامل الرصيد:** تم استلام طلب السحب بنجاح 🚀`);
  }
  else if (text === '📝 التقديم لوكالة 📝') {
    bot.sendMessage(chatId, `📝 **التقديم لوكالة KaRooc:** أرسل تفاصيلك ومعلومات التواصل للانضمام.`);
  }
  else if (text === '🎮 الدخول إلى الألعاب مباشرة 🎮') {
    bot.sendMessage(chatId, `🎮 **منصة ألعاب KaRooc الحية:**\nاضغط على الزر أدناه لفتح منصة الألعاب ولعب الألعاب المتاحة بالرصيد الحقيقي أو التجريبي 👇`, {
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
  else if (text === '🎁 الهدايا والتحويل 🎁') {
    bot.sendMessage(chatId, `🎁 **الهدايا والتحويل:** أرسل ID الصديق للتحويل.`);
  }
  else if (text === '🎡 عجلة الحظ 🎡') {
    bot.sendMessage(chatId, `🎡 **عجلة الحظ:** جاري إطلاقها قريباً 🌟`);
  }
  else if (text === '🤖 الدعم 🤖') {
    bot.sendMessage(chatId, `🤖 **الدعم الفني:** تواصل معنا عبر: @Support_KaRooc`);
  }
  else {
    bot.sendMessage(chatId, `أهلاً بك يا ${userName}! اضغط /start للرجوع للقائمة الرئيسية.`);
  }
});

console.log('Bot and Web Server are running successfully...');
    
