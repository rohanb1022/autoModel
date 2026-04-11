require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const result = await model.generateContent("Hello");
        const response = await result.response.text();
        fs.writeFileSync('full_error.txt', "SUCCESS: " + response);
    } catch (err) {
        fs.writeFileSync('full_error.txt', "ERROR: " + err.message + "\nSTACK: " + err.stack);
    }
}

test();
