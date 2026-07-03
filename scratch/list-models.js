import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env file.");
  process.exit(1);
}

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await axios.get(url);
    console.log("=== Supported Gemini Models on your API Key ===");
    res.data.models.forEach((m) => {
      console.log(`- Model: ${m.name.replace("models/", "")}`);
      console.log(`  DisplayName: ${m.displayName}`);
      console.log(`  Supported Actions: ${m.supportedGenerationMethods.join(", ")}`);
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error("Failed to list models:", err.response?.data || err.message);
  }
}

listModels();
