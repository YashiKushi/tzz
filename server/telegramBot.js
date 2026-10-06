const TelegramBot = require('node-telegram-bot-api');
const db = require('./db');

let botInstance = null;
const userStates = new Map(); // Stores user conversation state

function initBot(token, onNewLead) {
  if (!token || token.trim() === '') {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не задан. Бот не запущен. Вы можете протестировать создание лида в интерфейсе или через симулятор.');
    return null;
  }

  try {
    const bot = new TelegramBot(token, { polling: true });
    botInstance = bot;

    console.log('🤖 Telegram Бот успешно запущен и слушаёт сообщения...');

    // Command /start or restart
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      userStates.set(chatId, { step: 'AWAITING_NAME' });

      bot.sendMessage(
        chatId,
        `👋 **Здравствуйте! Вас приветствует менеджер агентства.**\n\nДавайте оформим вашу заявку за 3 быстрых шага.\n\n**Шаг 1 из 3:** Как к вам обращаться? (Введите ваше имя)`
      );
    });

    // General message handler for multi-step form
    bot.on('message', (msg) => {
      // Ignore commands starting with /
      if (msg.text && msg.text.startsWith('/')) return;

      const chatId = msg.chat.id;
      const state = userStates.get(chatId);

      if (!state) {
        // If user sends message without /start
        userStates.set(chatId, { step: 'AWAITING_NAME' });
        bot.sendMessage(
          chatId,
          `👋 Здравствуйте! Давайте оформим ваш запрос.\n\n**Шаг 1 из 3:** Введите ваше имя:`
        );
        return;
      }

      if (state.step === 'AWAITING_NAME') {
        state.name = msg.text.trim();
        state.step = 'AWAITING_CONTACT';
        userStates.set(chatId, state);

        bot.sendMessage(
          chatId,
          `Приятно познакомиться, **${state.name}**!\n\n**Шаг 2 из 3:** Оставьте удобный контакт для связи (телефон, e-mail или нажмите кнопку ниже, чтобы поделиться контактом Telegram):`,
          {
            reply_markup: {
              keyboard: [
                [{ text: '📱 Поделиться контактом Telegram', request_contact: true }]
              ],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          }
        );
      } else if (state.step === 'AWAITING_CONTACT') {
        let contactInfo = '';
        if (msg.contact) {
          contactInfo = msg.contact.phone_number;
          if (!contactInfo.startsWith('+')) contactInfo = '+' + contactInfo;
        } else {
          contactInfo = msg.text.trim();
        }

        state.contact = contactInfo;
        if (msg.from && msg.from.username) {
          state.contact += ` (@${msg.from.username})`;
        }

        state.step = 'AWAITING_REQUEST';
        userStates.set(chatId, state);

        bot.sendMessage(
          chatId,
          `Принято! 🎯\n\n**Шаг 3 из 3:** Опишите кратко ваш запрос или задачу (что нужно сделать, сроки, пожелания):`,
          {
            reply_markup: {
              remove_keyboard: true
            }
          }
        );
      } else if (state.step === 'AWAITING_REQUEST') {
        state.request = msg.text.trim();

        // Create lead in Database
        const newLead = db.addLead({
          name: state.name,
          contact: state.contact,
          request: state.request,
          source: 'Telegram Bot',
          status: 'new',
          tags: ['Telegram Bot', 'Новый лид'],
          tgUserId: msg.from ? msg.from.id : null,
          tgUsername: msg.from ? msg.from.username : null,
          notes: `Заявка принята ботом в ${new Date().toLocaleTimeString('ru-RU')}`
        });

        // Clear user state
        userStates.delete(chatId);

        // Notify client
        bot.sendMessage(
          chatId,
          `🎉 **Заявка успешно отправлена!**\n\n` +
          `• Имя: ${newLead.name}\n` +
          `• Контакт: ${newLead.contact}\n` +
          `• Запрос: ${newLead.request}\n\n` +
          `Наш менеджер уже увидел заявку в CRM и свяжется с вами в ближайшее время!`
        );

        // Notify app event callback for SSE broadcast
        if (onNewLead) {
          onNewLead(newLead);
        }
      }
    });

    return bot;
  } catch (err) {
    console.error('Ошибка инициализации Telegram бота:', err.message);
    return null;
  }
}

function notifyStatusChange(tgUserId, statusName) {
  if (!botInstance || !tgUserId) return;
  try {
    botInstance.sendMessage(
      tgUserId,
      `🔔 **Обновление по вашей заявке!**\nСтатус вашей заявки изменен на: **${statusName}**`
    );
  } catch (err) {
    console.error('Не удалось отправить уведомление пользователю в TG:', err.message);
  }
}

module.exports = {
  initBot,
  notifyStatusChange
};
