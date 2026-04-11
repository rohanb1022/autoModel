require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The listModels method might not be on the main genAI object in all versions
        // but let's try the common way
        const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).listModels();
        console.log(models);
    } catch (err) {
        // If that fails, try a direct fetch or check the SDK docs if available
        console.error("ListModels failed:", err.message);
    }
}

test();
