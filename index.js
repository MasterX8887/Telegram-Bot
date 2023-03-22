const TelegramBotAPI = require('node-telegram-bot-api');
const bot = new TelegramBotAPI('6243893491:AAEhBsrXstW8b6eC5Vss1Ludnf387AuWiLw', { polling: true });

let generatedNumbers = [];
let userCount = 12;
let userChances = {};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;

  // Check if the user is an admin
  const chatMember = await bot.getChatMember(chatId, userId);
  const isAdmin = chatMember.status === 'administrator' || chatMember.status === 'creator';

  if (messageText === '/start') {
    if (!isAdmin) {
      bot.sendMessage(chatId, 'Only admins can start this bot.');
      return;
    }

    bot.sendPhoto(chatId, 'bot.png', {
      caption: `Welcome! , Click the button to get your Lucky number:`,
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Get Your Lucky number',
            callback_data: 'generate_number'
          }
        ]]
      }
    });
  }
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (generatedNumbers.length >= userCount) {
    bot.answerCallbackQuery(query.id, `Sorry, all numbers have been generated.`);
    return;
  }

  if (!userChances[userId]) {
    userChances[userId] = 1;
  } else if (userChances[userId] >= 1) {
    bot.answerCallbackQuery(query.id, `Sorry, you've already used your chance.`);
    return;
  }

  let randomNum = Math.floor(Math.random() * userCount) + 1;

  while (generatedNumbers.includes(randomNum)) {
    randomNum = Math.floor(Math.random() * userCount) + 1;
  }

  generatedNumbers.push(randomNum);
  userChances[userId] += 1;

  bot.answerCallbackQuery(query.id, `Your Lucky number is ${randomNum}`);
  bot.sendMessage(chatId, `@${query.from.username}! Your Lucky number is ${randomNum}`);
});
