require('dotenv').config();
const generateInsights = require('./services/geminiServices');

async function test() {
    console.log("Testing Gemini with API Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    const data = {
        datasetName: "test.csv",
        problemType: "classification",
        bestModel: "Random Forest",
        accuracy: 0.95
    };
    try {
        const insights = await generateInsights(data);
        console.log("--- INSIGHTS ---");
        console.log(insights);
        console.log("----------------");
    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
