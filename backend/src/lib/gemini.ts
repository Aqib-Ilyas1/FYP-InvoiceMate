import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const generativeModel = genAI.getGenerativeModel({
  // model: "gemini-1.5-flash",
  model: "gemini-3-flash-preview",
});
