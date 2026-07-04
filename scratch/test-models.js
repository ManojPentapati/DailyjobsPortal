import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const response = await model.generateContent("Say hello in one word.");
    console.log(`✅ Model ${modelName}: Success! Response: "${response.response.text().trim()}"`);
    return true;
  } catch (error) {
    console.log(`❌ Model ${modelName}: Failed! Error: ${error.message}`);
    return false;
  }
}

async function run() {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
  ];

  console.log("TESTING MODELS...");
  for (const m of models) {
    await testModel(m);
  }
}

run();
