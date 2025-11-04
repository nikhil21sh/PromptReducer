console.log("Compressor Content Script loaded.");

function runCompressionTest(longPrompt) {
    console.log("Original Prompt Length:", longPrompt.length);
    
    // We pass the action 'compress' and tell it to drop the worst 40% (0.4)
    chrome.runtime.sendMessage({ action: "compress", text: longPrompt, ratio: 0.4 }, (response) => {
        if (response && response.status === "success") {
            console.log("Compression Complete!");
            console.log(`Shrunk from ${response.originalLength} to ${response.compressedLength} characters.`);
            console.log("--- Compressed Result ---");
            console.log(response.compressedText);
        } else {
            console.error("Compression failed:", response?.message);
        }
    });
}

const bloatedPrompt = `
I need you to write a Python script for me. It is really important that the script runs very fast. 
I have a deadline coming up on Friday and my boss is going to be really mad if I don't get this done. 
The script needs to read a CSV file called "data.csv". I love using Python because it is so easy to read. 
After it reads the CSV file, it should filter out any rows where the "status" column is "inactive". 
Please make sure the code has comments. The weather is really nice outside today, I wish I was outside. 
Finally, save the filtered data to a new file called "clean_data.csv". Thank you so much for your help!
`;

runCompressionTest(bloatedPrompt);