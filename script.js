const chatMessages = document.getElementById('chat-messages');
const userMessageInput = document.getElementById('user-message');
const ProductList = document.getElementById('Product-list');

// Product category links
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

  if (message.includes("pvc")) {
    fetchProductData("PVC");
    return "Fetching PVC data... ⏳";
  } else if (message.includes("pp")) {
    fetchProductData("PP");
    return "Fetching PP data... ⏳";
  }else if (message.includes("ps")) {
  fetchProductData("PS");
  return "Fetching PS data... ⏳";
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

function populateProductList() {
  Object.keys(polymerPages).forEach(category => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = polymerPages[category];
    link.target = '_blank';
    link.textContent = category;
    li.appendChild(link);
    ProductList.appendChild(li);
  });
}

userMessageInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

addMessage("Hi there! 👋 I'm PolyBot, your friendly assistant for product prices. Ask about Polymer, Energy, Crude, and more.");
populateProductList();

// ====== Fetch Product Data and Create Unique Elements ======
function fetchProductData(productName) {
  fetch("https://saptechno-001-site7.anytempurl.com/api/AjaxAPI/MagicSearch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputdata: productName })
  })
    .then(res => res.json())
    .then(json => {
      const raw = json[0]?.data;
      if (!raw) return addMessage("No data found in response.");

      const entries = [];
      const matches = raw.match(/<tr>.*?<\/tr>/g);
      if (!matches) return addMessage("No table rows found in data.");

      matches.forEach(row => {
        const nameMatches = [...row.matchAll(/<name>(.*?)<\/name>/gi)];
        const unitMatch = row.match(/<Unit>(.*?)<\/Unit>/);
        const dateMatch = row.match(/<Date>(.*?)<\/Date>/);
        const pricesMatch = row.match(/<prices>(\[.*?\])<\/prices>/);

       const cleanedName = nameMatches.length > 0
  ? nameMatches.map(m => m[1].trim()).join(' ').replace(/^(PVC|PP|PS)\s+/i, '')
  : 'PVC';


        if (pricesMatch) {
          try {
            const prices = JSON.parse(pricesMatch[1]);
            prices.forEach(p => {
              entries.push({
                Product: cleanedName,
                Unit: unitMatch?.[1] || '',
                Date: dateMatch?.[1] || '',
                Price: p.price,
                OneMonth: p.OneMonthPrice,
                ThreeMonth: p.threeMonthPrice,
                SixMonth: p.SixMonthPrice,
                OneYear: p.OneyearPrice,
                ThreeYear: p.threeyearPrice
              });
            });
          } catch (err) {
            console.error('Error parsing prices:', err);
          }
        }
      });

      if (entries.length === 0) return addMessage("No structured price data found.");

      const uniqueId = `graph-${Date.now()}`;

      // Generate HTML with dynamic IDs
      let html = `
        <div class="table-container" id="table-${uniqueId}">
          <table class="styled-table">
            <thead>
              <tr>
                <th>Product</th><th>Unit</th><th>Date</th><th>Price</th>
                <th>1 Month</th><th>3 Months</th><th>6 Months</th><th>1 Year</th><th>3 Years</th>
              </tr>
            </thead>
            <tbody>`;

      entries.forEach(e => {
        html += `<tr>
          <td>${e.Product}</td><td>${e.Unit}</td><td>${e.Date}</td><td>${e.Price}</td>
          <td>${e.OneMonth}</td><td>${e.ThreeMonth}</td><td>${e.SixMonth}</td>
          <td>${e.OneYear}</td><td>${e.ThreeYear}</td>
        </tr>`;
      });

      html += `</tbody></table>
        <button onclick="document.getElementById('graph-${uniqueId}').style.display='block'" class="toggle-btn">📊 Show Graph</button>
        </div>
        <div id="graph-${uniqueId}" style="display:none; margin-top:10px;">
          <canvas id="canvas-${uniqueId}" width="600" height="300"></canvas>
          <button onclick="document.getElementById('graph-${uniqueId}').style.display='none'" class="toggle-btn">📋 Hide Graph</button>
        </div>`;

      addMessage(html);
      setTimeout(() => drawGraph(entries, `canvas-${uniqueId}`), 200);
    })
    .catch(err => {
      console.error("Error fetching  data:", err);
      addMessage("Error fetching  data.");
    });
}

// ====== Draw Graph with Custom Canvas ID ======
function drawGraph(data, canvasId) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  const labels = ["1 Month", "3 Months", "6 Months", "1 Year", "3 Years"];
  const colors = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949"];

  const datasets = data.map((product, index) => ({
    label: product.Product,
    data: [
      parseFloat(product.OneMonth || 0),
      parseFloat(product.ThreeMonth || 0),
      parseFloat(product.SixMonth || 0),
      parseFloat(product.OneYear || 0),
      parseFloat(product.ThreeYear || 0)
    ],
    borderColor: colors[index % colors.length],
    fill: false,
    tension: 0.3
  }));

  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { display: true, title: { display: true, text: 'Time Duration' } },
        y: { display: true, title: { display: true, text: 'Price Value' }, beginAtZero: false }
      }
    }
  });
}

// ====== Speech Recognition ======
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  let isRecording = false;

  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  window.startRecording = function () {
    const micBtn = document.querySelector(".mic-button");
    const stopBtn = document.getElementById("stop-button");

    if (isRecording) return;

    recognition.start();
    micBtn.classList.add("recording");
    stopBtn.style.display = "inline-block";
    isRecording = true;
  };

  window.stopRecording = function () {
    recognition.stop();
    document.querySelector(".mic-button").classList.remove("recording");
    document.getElementById("stop-button").style.display = "none";
    isRecording = false;
  };

  recognition.onspeechend = function () {
    setTimeout(() => {
      if (isRecording) {
        recognition.stop();
        document.querySelector(".mic-button").classList.remove("recording");
        document.getElementById("stop-button").style.display = "none";
        isRecording = false;
      }
    }, 3000);
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    const inputBox = document.getElementById("user-message");
    inputBox.value += (inputBox.value.trim() ? ' ' : '') + transcript;
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
    stopRecording();
  };

} else {
  alert("Sorry, your browser doesn't support Speech Recognition.");
}


// ====== chat history ======
let currentChatId = null;

function startNewChat() {
  currentChatId = `chat-${Date.now()}`;
  localStorage.setItem("currentChatId", currentChatId);
  localStorage.setItem(currentChatId, JSON.stringify([])); // empty array
  document.getElementById('chat-messages').innerHTML = '';
  addMessage("New chat started. 👋 Ask about a category like 'PVC' or 'Crude'.");
  loadChatHistoryList();
}


