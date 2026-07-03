import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key found.");
  process.exit(1);
}

const ai = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
];

async function testQuota() {
  console.log("=== Testing Quota on different Gemini models ===");
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, respond with 1 word.");
      console.log(`✅ Success for ${modelName}: "${result.response.text().trim()}"`);
    } catch (err) {
      console.log(`❌ Failed for ${modelName}: ${err.message}`);
    }
  }
}

testQuota();
