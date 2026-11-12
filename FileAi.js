import { GoogleGenAI } from "@google/genai";
import path from "node:path";

const ai = new GoogleGenAI({});
const ROOT = process.cwd(); // tools can only touch files inside this folder

// Keep every path inside ROOT
function safePath(p) {
  const full = path.resolve(ROOT, p);
  if (!full.startsWith(ROOT)) throw new Error("Path is outside working directory");
  return full;
}


