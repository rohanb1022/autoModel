require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function test() {
    // Some versions of the SDK allow passing apiVersion in the second argument of getGenerativeModel
    // or as a property in the first
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    try {
        const result = await model.generateContent("Say 'API v1 is working'");
        const response = await result.response.text();
        fs.writeFileSync('full_error.txt', "SUCCESS: " + response);
        console.log("SUCCESS: " + response);
    } catch (err) {
        fs.writeFileSync('full_error.txt', "ERROR: " + err.message);
        console.error("ERROR:", err.message);
    }
}

test();
