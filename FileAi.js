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


const functionDeclarations = [
  {
    name: "read_file",
    description: "Read the text content of a file.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        file_path: { type: Type.STRING, description: "Path of the file to read, e.g. src/index.js" },
      },
      required: ["file_path"],
    },
  },
]