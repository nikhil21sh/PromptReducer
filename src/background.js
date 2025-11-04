import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
class PipelineSingleton {
    static task = 'feature-extraction'; 
    static model = 'Xenova/all-MiniLM-L6-v2'; 
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

console.log("ML Background worker initialized.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "compress") {
        (async function () {
            try {
                let extractor = await PipelineSingleton.getInstance();
                let text = request.text;
                let ratio = request.ratio || 0.3; // Default: drop the bottom 30%

                // 1. Split prompt into sentences (basic regex for punctuation)
                let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                if (sentences.length <= 2) {
                    return sendResponse({ status: "success", originalLength: text.length, compressedText: text }); // Too short to compress
                }

                // 2. Get the embedding for the entire prompt (The "Core Meaning")
                let docOutput = await extractor(text, { pooling: 'mean', normalize: true });
                let docVector = Array.from(docOutput.data);

                // 3. Score each sentence against the core meaning
                let scoredSentences = [];
                for (let i = 0; i < sentences.length; i++) {
                    let sentence = sentences[i].trim();
                    let sentOutput = await extractor(sentence, { pooling: 'mean', normalize: true });
                    let sentVector = Array.from(sentOutput.data);
                    
                    let score = cosineSimilarity(docVector, sentVector);
                    
                    // We save the original index so we can put them back in the right order later!
                    scoredSentences.push({ text: sentence, score: score, originalIndex: i });
                }

                // 4. Sort by score (lowest first) and calculate how many to drop
                scoredSentences.sort((a, b) => a.score - b.score);
                let dropCount = Math.floor(sentences.length * ratio);

                // 5. Slice off the lowest scoring sentences, sort the survivors back to their original order
                let survivors = scoredSentences.slice(dropCount);
                survivors.sort((a, b) => a.originalIndex - b.originalIndex);

                // 6. Reconstruct the prompt
                let compressedText = survivors.map(s => s.text).join(" ");
                
                sendResponse({ 
                    status: "success", 
                    originalLength: text.length,
                    compressedLength: compressedText.length,
                    compressedText: compressedText 
                });

            } catch (error) {
                console.error(error);
                sendResponse({ status: "error", message: error.toString() });
            }
        })();
        return true; 
    }
});