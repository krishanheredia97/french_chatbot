document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const difficultyButtons = document.querySelectorAll('.difficulty-button');
    
    let currentDifficulty = '';

    difficultyButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentDifficulty = this.dataset.level;
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            addMessage('System', `Difficulty set to ${currentDifficulty}`);
        });
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('You', message);
            userInput.value = '';

            if (!currentDifficulty) {
                addMessage('System', 'Please choose a difficulty level: A1 or A2');
                return;
            }

            fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, difficulty: currentDifficulty }),
            })
            .then(response => response.json())
            .then(data => {
                const botResponse = data.response;
                const parts = botResponse.split('\n');
                
                parts.forEach(part => {
                    if (part.startsWith('French response:')) {
                        addMessage('Bot', part.replace('French response:', '').trim());
                    } else if (part.startsWith('Correction:')) {
                        addMessage('Correction', part.replace('Correction:', '').trim());
                    } else if (part.startsWith('Explanation:')) {
                        addMessage('Explanation', part.replace('Explanation:', '').trim());
                    }
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                addMessage('System', 'An error occurred. Please try again.');
            });
        }
    }

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender.toLowerCase());
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});