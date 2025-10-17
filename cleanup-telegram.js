// Cleanup script to stop any running telegram polling and setup webhook
const TELEGRAM_BOT_TOKEN = '7769777050:AAF3xPnqJL8Pr0NgjEp7-2dvI0MpRKyQNQU';

async function cleanup() {
  console.log('🧹 Cleaning up Telegram bot...');
  
  try {
    // First, delete any existing webhook
    const deleteResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST'
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('🗑️ Webhook deletion result:', deleteResult);
    
    // Stop any running polling by calling getUpdates once
    const stopResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=-1&limit=1`, {
      method: 'POST'
    });
    
    const stopResult = await stopResponse.json();
    console.log('🛑 Stop polling result:', stopResult);
    
    console.log('✅ Telegram cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };