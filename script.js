const chatMessages = document.getElementById('chat-messages');
const userMessageInput = document.getElementById('user-message');
const destinationList = document.getElementById('destination-list');

// Define product category links
const polymerPages = {
  "Polymer": "https://polymer-tau.vercel.app/products?cId=1&pId=22",
  "Energy": "https://polymer-tau.vercel.app/products?cId=2&pId=23",
  "Feedstock": "https://polymer-tau.vercel.app/products?cId=3&pId=24",
  "Polymer Engg.": "https://polymer-tau.vercel.app/products?cId=4&pId=25",
  "Aromatics": "https://polymer-tau.vercel.app/products?cId=5&pId=26",
  "Synthetic Rubber": "https://polymer-tau.vercel.app/products?cId=6&pId=27",
  "Recycle Plastic": "https://polymer-tau.vercel.app/products?cId=7&pId=28",
  "Crude/Naptha": "https://polymer-tau.vercel.app/products?cId=8&pId=29",
  "News": "https://polymer-tau.vercel.app/user/news?region=southeast-asia&type=pvc"
};

function addMessage(message, isUser = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
  messageElement.innerHTML = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function botResponse(message) {
  message = message.toLowerCase();

  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! 👋 I’m PolyBot, your assistant for Polymer Market categories. You can ask me things like 'Show me Crude prices' or 'Energy products'. 📈";
  }

  for (const [category, url] of Object.entries(polymerPages)) {
    if (message.includes(category.toLowerCase())) {
      return `Here's the latest on <strong>${category}</strong>: <a href="${url}" target="_blank">Click here to view</a> 🔗`;
    }
  }

  return "Sorry, I didn’t understand that. Please ask about any of these categories: " + Object.keys(polymerPages).join(', ');
}

function sendMessage() {
  const message = userMessageInput.value.trim();
  if (message) {
    addMessage(message, true);
    userMessageInput.value = '';
    setTimeout(() => {
      const response = botResponse(message);
      addMessage(response);
    }, 500);
  }
}

function populateDestinationList() {
  Object.keys(polymerPages).forEach(category => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = polymerPages[category];
    link.target = '_blank';
    link.textContent = category;
    li.appendChild(link);
    destinationList.appendChild(li);
  });
}

userMessageInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// Welcome message and list population
addMessage("Hi there! 👋 I'm PolyBot, your friendly assistant for product prices. Ask about Polymer, Energy, Crude, and more.");
populateDestinationList();

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

 function startRecording() {
  const micBtn = document.querySelector(".mic-button");
  micBtn.classList.add("recording");
  recognition.start();

  recognition.onend = () => {
    micBtn.classList.remove("recording");
  };
}

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-message").value = transcript;
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
  };

} else {
  alert("Sorry, your browser doesn't support Speech Recognition.");
}
