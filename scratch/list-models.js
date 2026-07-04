import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

async function run() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const { data } = await axios.get(url);
    console.log("SUCCESSFULLY LISTED MODELS:");
    for (const model of data.models || []) {
      console.log(`- Name: ${model.name} (${model.displayName})`);
    }
  } catch (error) {
    console.error("Error listing models:", error.response ? error.response.data : error.message);
  }
}

run();
