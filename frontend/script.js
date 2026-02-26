const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    // We use innerText for user messages to avoid XSS
    msg.innerText = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot typing";
    loadingDiv.innerHTML = `<span></span><span></span><span></span>`;
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const res = await fetch("http://127.0.0.1:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await res.json();
        if (loadingDiv.parentNode) chatBox.removeChild(loadingDiv);

        // const aiResponse = data.reply; 

        // // 1. INTRO BUBBLE
        // if (aiResponse.intro) {
        //     const introMsg = document.createElement("div");
        //     introMsg.className = "message bot";
        //     introMsg.innerHTML = marked.parse(aiResponse.intro); 
        //     chatBox.appendChild(introMsg);
        // }

        // // 2. PRODUCT CARDS (Middle)
        // if (aiResponse.products && aiResponse.products.length > 0) {
        //     aiResponse.products.forEach(product => {
        //         const card = document.createElement("div");
        //         card.className = "product-card";
        //         card.innerHTML = `
        //             <div class="sale-badge">SALE</div>
        //             <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
        //             <div class="card-info">
        //                 <h3>${product.name}</h3>
        //                 <div class="price-row">
        //                     <span class="price">$${product.price}</span>
        //                     <span class="thc-badge">${product.thc || 'N/A'} THC</span>
        //                 </div>
        //                 <a href="${product.url}" target="_blank" class="buy-btn">View Product</a>
        //             </div>
        //         `;
        //         chatBox.appendChild(card);
        //     });
        // }

        // // 3. CONCLUSION BUBBLE (End)
        // if (aiResponse.conclusion) {
        //     const outroMsg = document.createElement("div");
        //     outroMsg.className = "message bot";
        //     outroMsg.innerHTML = marked.parse(aiResponse.conclusion);
        //     chatBox.appendChild(outroMsg);
        // }

        // const aiResponse = data.reply; 

        // // Check if we have products to show
        // const hasProducts = aiResponse.products && aiResponse.products.length > 0;

        // // 1. Handle the Text (Merge if no products, split if there are products)
        // if (hasProducts) {
        //     // Split: Intro appears BEFORE cards
        //     if (aiResponse.intro) {
        //         const introMsg = document.createElement("div");
        //         introMsg.className = "message bot";
        //         introMsg.innerHTML = marked.parse(aiResponse.intro);
        //         chatBox.appendChild(introMsg);
        //     }
        // } else {
        //     // Merged: Everything in one bubble for simple chat/greetings
        //     const combinedText = `${aiResponse.intro || ""} ${aiResponse.conclusion || ""}`.trim();
        //     if (combinedText) {
        //         const mergedMsg = document.createElement("div");
        //         mergedMsg.className = "message bot";
        //         mergedMsg.innerHTML = marked.parse(combinedText);
        //         chatBox.appendChild(mergedMsg);
        //     }
        // }

        // // 2. Build the Product Cards
        // if (hasProducts) {
        //     aiResponse.products.forEach(product => {
        //         const card = document.createElement("div");
        //         card.className = "product-card";
        //         card.innerHTML = `
        //             <div class="sale-badge">SALE</div>
        //             <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
        //             <div class="card-info">
        //                 <h3>${product.name}</h3>
        //                 <div class="price-row">
        //                     <span class="price">$${product.price}</span>
        //                     <span class="thc-badge">${product.thc || 'N/A'} THC</span>
        //                 </div>
        //                 <a href="${product.url}" target="_blank" class="buy-btn">View Product</a>
        //             </div>
        //         `;
        //         chatBox.appendChild(card);
        //     });

        //     // 3. CONCLUSION (Only if we had products, show it AFTER the cards)
        //     if (aiResponse.conclusion) {
        //         const outroMsg = document.createElement("div");
        //         outroMsg.className = "message bot";
        //         outroMsg.innerHTML = marked.parse(aiResponse.conclusion);
        //         chatBox.appendChild(outroMsg);
        //     }
        // }

        const aiResponse = data.reply;
const hasProducts = aiResponse.products && aiResponse.products.length > 0;

if (!hasProducts) {
    // MERGED BUBBLE: For simple greetings or chat
    const mergedText = `${aiResponse.intro || ""} ${aiResponse.conclusion || ""}`.trim();
    if (mergedText) {
        const msgDiv = document.createElement("div");
        msgDiv.className = "message bot";
        msgDiv.innerHTML = marked.parse(mergedText);
        chatBox.appendChild(msgDiv);
    }
} else {
    // SPLIT BUBBLE: Intro -> Products -> Conclusion
    if (aiResponse.intro) {
        const introDiv = document.createElement("div");
        introDiv.className = "message bot";
        introDiv.innerHTML = marked.parse(aiResponse.intro);
        chatBox.appendChild(introDiv);
    }

    aiResponse.products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="sale-badge">SALE</div>
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150'">
            <div class="card-info">
                <h3>${product.name}</h3>
                <div class="price-row">
                    <span class="price">$${product.price}</span>
                    <span class="thc-badge">${product.thc || 'N/A'} THC</span>
                </div>
                <a href="${product.url}" target="_blank" class="buy-btn">View Product</a>
            </div>
        `;
        chatBox.appendChild(card);
    });

    if (aiResponse.conclusion) {
        const outroDiv = document.createElement("div");
        outroDiv.className = "message bot";
        outroDiv.style.marginTop = "8px";
        outroDiv.innerHTML = marked.parse(aiResponse.conclusion);
        chatBox.appendChild(outroDiv);
    }
}

    } catch (err) {
        if (loadingDiv.parentNode) chatBox.removeChild(loadingDiv);
        console.error("Chat Error:", err);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
} 

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); 
        sendMessage();
    }
});