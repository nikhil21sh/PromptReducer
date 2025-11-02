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

console.log("ML Background worker initialized.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "test_model") {
        (async function () {
            try {
                let extractor = await PipelineSingleton.getInstance();
                let output = await extractor(request.text, { pooling: 'mean', normalize: true });
                sendResponse({ status: "success", vectorLength: output.data.length });
            } catch (error) {
                sendResponse({ status: "error", message: error.toString() });
            }
        })();
        return true; 
    }
});