document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('ratio-slider');
    const display = document.getElementById('ratio-display');

    // 1. Load the saved ratio when the popup opens (default to 30 if none exists)
    chrome.storage.local.get(['compressionRatio'], (result) => {
        const savedRatio = result.compressionRatio || 30;
        slider.value = savedRatio;
        display.innerText = `${savedRatio}%`;
    });

    // 2. Listen for changes on the slider
    slider.addEventListener('input', (e) => {
        const newRatio = e.target.value;
        display.innerText = `${newRatio}%`;
        
        // 3. Save the new ratio to Chrome Storage instantly
        chrome.storage.local.set({ compressionRatio: parseInt(newRatio) });
    });
});