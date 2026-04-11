require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    try {
        const result = await model.generateContent("Say 'Gemini 2.5 is working'");
        const response = await result.response.text();
        fs.writeFileSync('full_error.txt', "SUCCESS: " + response);
        console.log("SUCCESS: " + response);
    } catch (err) {
        fs.writeFileSync('full_error.txt', "ERROR: " + err.message);
        console.error("ERROR:", err.message);
    }
}

test();
