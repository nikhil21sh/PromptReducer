console.log("Content Script loaded. Triggering ML Engine...");

function testMLEngine(sampleText) {
    chrome.runtime.sendMessage({ action: "test_model", text: sampleText }, (response) => {
        if (response && response.status === "success") {
            console.log("Model successfully processed the text! Vector dimensions:", response.vectorLength);
        } else {
            console.error("Model failed:", response?.message);
        }
    });
}

testMLEngine("Hello AI, this is my first in-browser inference.");