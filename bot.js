const TelegramBot = require('node-telegram-bot-api');

// جلب التوكن الخاص بالبوت من إعدادات البيئة في Render
const token = process.env.TELEGRAM_BOT_TOKEN;

// التأكد من وجود التوكن
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables!');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// دالة القائمة الرئيسية
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

// دالة قائمة حساب KaRooc الفرعية (الخيارات الخمسة المطلوبة)
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

// التعامل مع الأوامر والرسائل وأزرار القوائم
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userName = msg.from.first_name || 'صديقي';

  if (!text) return;

  // 1. أمر البداية
  if (text === '/start') {
    sendMainMenu(chatId, userName);
  } 
  
  // 2. زر حساب KaRooc / حسابي (يفتح القائمة الفرعية ذات الخيارات الخمسة)
  else if (text === '⚡ حساب KaRooc وشحنه ⚡' || text === '📂 حسابي 📂') {
    sendAccountMenu(chatId);
  }
  
  // 3. العودة للقائمة الرئيسية
  else if (text === '🏠 القائمة الرئيسية' || text === '🏠 5. القائمة الرئيسية') {
    sendMainMenu(chatId, userName);
  }
  
  // 4. الخيارات الخمسة الخاصة بحساب KaRooc
  else if (text === '💳 1. شحن في الموقع') {
    bot.sendMessage(chatId, `💳 **شحن في الموقع:**\nالرجاء إرسال المبلغ المراد شحنه ورقم المعرف (ID) الخاص بك لتتم عملية الشحن بنجاح.`);
  }
  else if (text === '💰 2. شحن كامل الرصيد') {
    bot.sendMessage(chatId, `💰 **شحن كامل الرصيد:**\nتم استلام طلبك لشحن كامل رصيد المحفظة. جاري المعالجة... ⏳`);
  }
  else if (text === '📤 3. سحب من الموقع') {
    bot.sendMessage(chatId, `📤 **سحب من الموقع:**\nأرسل المبلغ الذي تود سحبه وطريقة الدفع المناسبة لك.`);
  }
  else if (text === '💸 4. سحب كامل الرصيد') {
    bot.sendMessage(chatId, `💸 **سحب كامل الرصيد:**\nتم تقديم طلب سحب رصيدك بالكامل. سيتم التحويل قريباً جداً 🚀`);
  }
  
  // 5. الأزرار الأخرى في القائمة الرئيسية وفائدتها
  else if (text === '📝 التقديم لوكالة 📝') {
    bot.sendMessage(chatId, `📝 **التقديم لوكالة KaRooc:**\nانضم إلينا الآن وكن جزءاً من فريق الوكلاء. يرجى إرسال اسمك، وسيلتك للتواصل، وخبرتك السابقة.`);
  }
  else if (text === '🎮 الدخول إلى الألعاب مباشرة 🎮') {
    bot.sendMessage(chatId, `🎮 **منصة الألعاب المباشرة:**\nاضغط على الرابط أدناه لدخول الألعاب وبدء الربح فوراً:\n🔗 https://karooc-1.onrender.com`);
  }
  else if (text === '🎁 الهدايا والتحويل 🎁') {
    bot.sendMessage(chatId, `🎁 **قسم الهدايا والتحويلات:**\nيمكنك الآن إرسال الهدايا والأرصدة لأصدقائك عبر البوت بكل سهولة ومان. أرسل ID الصديق للبدء.`);
  }
  else if (text === '🎡 عجلة الحظ 🎡') {
    bot.sendMessage(chatId, `🎡 **عجلة الحظ اليومية:**\nجرب حظك الآن واحصل على جوائز ومكافآت قيّمة! \n(جاري إطلاق العجلة قريباً انتظرنا 🌟)`);
  }
  else if (text === '🤖 الدعم 🤖') {
    bot.sendMessage(chatId, `🤖 **فريق الدعم الفني:**\nإذا واجهتك أي مشكلة أو استفسار، تواصل مع الإدارة مباشرة عبر الزر أدناه:\n💬 @Support_KaRooc`);
  }
  
  // أي نص عشوائي آخر
  else {
    bot.sendMessage(chatId, `أهلاً بك يا ${userName}! البوت يعمل بكفاءة 🚀\nاضغط على الأزرار في الأسفل أو اكتب /start للرجوع للقائمة الرئيسية.`);
  }
});

console.log('Bot is running successfully and waiting for messages...');
      
