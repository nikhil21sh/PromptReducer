console.log("Compressor Content Script loaded. (Loop-Free Version)");

// 1. The React-Safe Text Updater
function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    if (valueSetter) {
        valueSetter.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// 2. The Safe Injection Function
function injectCompressorButton(textarea) {
    // THE LOCK: If we already stamped this textarea, stop immediately to prevent infinite loops!
    if (textarea.dataset.compressorInjected === "true") return;
    
    // Stamp it!
    textarea.dataset.compressorInjected = "true";

    // Create a UNIQUE button for this specific textarea
    const btn = document.createElement("button");
    btn.innerHTML = "🪄 Compress";
    btn.className = "llm-compressor-btn"; // Using a class makes it easier to style later
    btn.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        padding: 6px 12px;
        background-color: #6366f1;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    // Attach the click listener
    btn.addEventListener("click", async (e) => {
        e.preventDefault(); 
        
        if (!textarea.value) return;

        const originalText = textarea.value;
        const originalButtonText = btn.innerHTML;
        
        btn.innerHTML = "⏳ Compressing...";
        btn.disabled = true;

        // Call our ML backend
        chrome.runtime.sendMessage({ action: "compress", text: originalText, ratio: 0.3 }, (response) => {
            if (response && response.status === "success") {
                setNativeValue(textarea, response.compressedText);
                console.log(`Shrunk from ${response.originalLength} to ${response.compressedLength} chars.`);
            } else {
                console.error("Compression failed", response?.message);
            }
            btn.innerHTML = originalButtonText;
            btn.disabled = false;
        });
    });

    // Safely inject it
    textarea.parentElement.style.position = "relative";
    textarea.parentElement.appendChild(btn);
}

// 3. The Optimized Observer
const observer = new MutationObserver(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach(textarea => {
        injectCompressorButton(textarea);
    });
});

// Start watching
observer.observe(document.body, { childList: true, subtree: true });

// Run it once immediately just in case the textarea loaded before the observer started
document.querySelectorAll("textarea").forEach(textarea => injectCompressorButton(textarea));