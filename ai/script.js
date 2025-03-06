const WORKER_URL = 'https://sweet-dew-4bd0.lidichu.workers.dev';
let conversationHistory = [];

function startNewChat() {
  conversationHistory = [];
  document.getElementById('chat-messages').innerHTML = `
    <div class="message bot">
      <div class="avatar">箏</div>
      <div class="message-content">
        您好！我是箏心古箏助手。我可以回答關於古箏的各種問題，包括：
        <br>• 古箏基礎知識和歷史
        <br>• 演奏技巧和練習方法
        <br>• 曲目推薦和解析
        <br>• 樂器保養建議
        <br>請問有什麼我可以幫您的嗎？
      </div>
    </div>
  `;
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  
  if (message === '') return;

  appendMessage(message, 'user');
  
  input.value = '';
  input.disabled = true;
  const sendButton = document.querySelector('.send-button');
  sendButton.disabled = true;

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: conversationHistory
      })
    });

    const data = await response.json();
    
    if (data.success) {
      conversationHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      );
      
      appendMessage(data.response, 'bot');
    } else {
      appendMessage('抱歉，處理您的請求時發生錯誤：' + (data.error || '未知錯誤'), 'bot');
    }

  } catch (error) {
    console.error('Error:', error);
    appendMessage('抱歉，系統暫時無法處理您的請求，請稍後再試。', 'bot');
  } finally {
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }
}

function appendMessage(content, type) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = type === 'bot' ? '箏' : '我';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.innerHTML = content.replace(/\n/g, '<br>');
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 自動調整輸入框高度
document.getElementById('user-input').addEventListener('input', function() {
  this.style.height = '60px';
  this.style.height = (this.scrollHeight > 150 ? 150 : this.scrollHeight) + 'px';
});
