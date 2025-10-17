// Test Telegram Bot API
const TELEGRAM_CONFIG = {
  BOT_TOKEN: '7769777050:AAF3xPnqJL8Pr0NgjEp7-2dvI0MpRKyQNQU',
  CHAT_ID: '7121003638'
};

async function testTelegramBot() {
  console.log('🤖 Testing Telegram Bot...');
  
  // Test 1: Check bot info
  try {
    console.log('📡 Checking bot info...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();
    
    if (botInfo.ok) {
      console.log('✅ Bot is valid:', botInfo.result.username);
    } else {
      console.log('❌ Bot error:', botInfo.description);
      return;
    }
  } catch (error) {
    console.log('❌ Network error checking bot:', error.message);
    return;
  }
  
  // Test 2: Send test message
  try {
    console.log('💬 Sending test message...');
    const testMessage = `🧪 Тестовое сообщение\n\n📅 Время: ${new Date().toLocaleString('ru-RU')}\n🚀 Статус: Telegram интеграция работает!`;
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML'
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Message sent successfully!');
      console.log('📱 Message ID:', result.result.message_id);
    } else {
      console.log('❌ Failed to send message:', result.description);
      console.log('🔍 Error code:', result.error_code);
      
      // Common error explanations
      if (result.error_code === 400) {
        console.log('💡 Possible reasons: Invalid chat_id or bot blocked by user');
      } else if (result.error_code === 401) {
        console.log('💡 Possible reasons: Invalid bot token');
      } else if (result.error_code === 403) {
        console.log('💡 Possible reasons: Bot blocked by user or kicked from group');
      }
    }
  } catch (error) {
    console.log('❌ Network error sending message:', error.message);
  }
}

// Test 3: Get chat info
async function getChatInfo() {
  try {
    console.log('🔍 Getting chat info...');
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.CHAT_ID
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Chat info:', {
        type: result.result.type,
        title: result.result.title || result.result.first_name,
        username: result.result.username
      });
    } else {
      console.log('❌ Failed to get chat info:', result.description);
    }
  } catch (error) {
    console.log('❌ Error getting chat info:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Telegram integration tests...');
testTelegramBot().then(() => {
  return getChatInfo();
}).then(() => {
  console.log('🏁 Tests completed!');
});