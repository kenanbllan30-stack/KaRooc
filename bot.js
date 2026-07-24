const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const ADMIN_CHAT_ID = '7956980808'; // الـ ID الخاص بك لاستلام إشعارات الشحن

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

// تشغيل بوت تليجرام
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

// تخزين مؤقت لحالة المستخدمين (لعمليات الشحن)
const userStates = {};

function sendMainMenu(chatId, userName) {
  const text = `أهلاً فيك يا ${userName} بـ KaRooc 🎮\nجاهز تلعبها صح؟\n\n⚡ شحن وتعبئة رصيد\n💸 سحب فوري\n\nاختر ما يناسبك من القائمة 👇`;
  
  const keyboard = {
    reply_markup: {
      keyboard: [
        [{ text: '⚡ شحن الرصيد (شام كاش / سيرياتيل) ⚡' }],
        [{ text: '🎮 الدخول إلى الألعاب مباشرة 🎮' }],
        [{ text: '📂 حسابي ورصيدي 📂' }],
        [{ text: '🤖 الدعم الفني 🤖' }]
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
  else if (text === '⚡ شحن الرصيد (شام كاش / سيرياتيل) ⚡') {
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
    bot.sendMessage(chatId, `اختر طريقة الدفع المناسبة لشحن حسابك 👇`, keyboard);
  }
  else if (text === '💳 شام كاش (Cham Cash)') {
    userStates[chatId] = { method: 'Cham Cash' };
    bot.sendMessage(chatId, `💳 **شحن عبر شام كاش**\n\nمعرف الحساب المحول إليه:\n\`B38774eaac6e58f5f1e26d79a5f2522a\`\n\nالرجاء تحويل المبلغ المطلوب إلى الحساب أعلاه، ثم **أرسل هنا في الصندوق رقم الحوالة أو تفاصيل التحويل** ليتم تحويلها للإدارة فوراً ⏳`, { parse_mode: 'Markdown' });
  }
  else if (text === '📱 سيرياتيل كاش (Syriatel Cash)') {
    userStates[chatId] = { method: 'Syriatel Cash' };
    bot.sendMessage(chatId, `📱 **شحن عبر سيرياتيل كاش**\n\nرقم الحساب المحول إليه:\n\`57480992\`\n\nالرجاء تحويل المبلغ إلى الرقم أعلاه، ثم **أرسل هنا رقم الحوالة أو تفاصيل التحويل** ليتم تحويلها للإدارة فوراً ⏳`, { parse_mode: 'Markdown' });
  }
  else if (text === '📂 حسابي ورصيدي 📂') {
    bot.sendMessage(chatId, `📂 **معلومات حسابك:**\n- الـ ID الخاص بك: \`${chatId}\`\n- الرصيد الحقيقي: \`5000 ل.س\`\n\nيمكنك اللعب والشحن في أي وقت!`, { parse_mode: 'Markdown' });
  }
  else if (text === '🎮 الدخول إلى الألعاب مباشرة 🎮') {
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
    // إذا كان المستخدم في حالة إرسال إيصال أو رقم حوالة
    if (userStates[chatId]) {
      const paymentMethod = userStates[chatId].method;
      
      // إبلاغ المستخدم بأن الطلب وصل
      bot.sendMessage(chatId, `✅ **تم إرسال طلب الشحن بنجاح إلى الإدارة!**\nطريقة الدفع: ${paymentMethod}\nالتفاصيل: ${text}\n\nيرجى الانتظار قليلاً ليتم التحقق وإضافة الرصيد لحسابك 🚀`);

      // إعادة توجيه الطلب إليك كمسؤول (Admin)
      const adminMsg = `🔔 **طلب شحن جديد بانتظار الاعتماد!**\n\n👤 اسم المستخدم: ${userName}\n🆔 رقم الـ ID: \`${chatId}\`\n💳 طريقة الدفع: ${paymentMethod}\n📝 التفاصيل / رقم الحوالة: \`${text}\``;
      
      bot.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' });

      delete userStates[chatId];
    } else {
      bot.sendMessage(chatId, `أهلاً بك! اضغط /start للرجوع للقائمة الرئيسية.`);
    }
  }
});

console.log('Bot with Admin Notifications is running...');
                
