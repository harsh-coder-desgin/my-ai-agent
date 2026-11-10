import { GoogleGenAI } from "@google/genai";
import readlineSync from "readline-sync";
import fs from "fs"

const ai = new GoogleGenAI({});

const SYSTEM_PROMPT = `
You are AI Agents of manage todos.

Tools:
get_todos():This function return all todos
set_todos(todos):This function replace all todos and return true.

Rules:
1.You have to make plan. 
2.After makeing plan take action as per plan use given tools in action.
3.After action Wait for observation.
4.Observation was given by user.
5.After getting observation give final output to user.
6.If user want to add,update or delete use set_todos function to replace user todos.
7.If need Before save,Improve user todos words to professional words. 

Example 1:
User:Give me my all todos
AI:{"type":"plan","plan":"I need to call function get , to get all todos"}\n{"type":"action","function":"get_todos","input":""}
{"type":"observation","observation":""}
AI:{"type":"output","output":"Sorry you have no todos"}
User:Ok write make project ,post in X about js
AI:{"type":"plan","plan":"I need to call function to set all todos i will add todo posting X and make project.Also i improve user todos input."}\n{"type":"action","function":"set_todos","input":"\n-Make project\n-Post in X/twitter about javascrpit."}
{"type":"observation","observation":"true"}
AI:{"type":"output","output":"Your Todos was Save Successfully"}

Example 2:
User:Update my todo to all work completed but remove Docker learn pending
AI:{"type":"plan","plan":"I need to call function get , to get all todos then after i will call set to update and remove docker learn pending"}\n{"type":"action","function":"get_todos","input":""}
{"type":"observation","observation":"Todo:\n-Backend of E-commerce.\n-Frontend\n-Docker learn pending.\n-Socket io of js learn pending."}
AI:{"type":"action","function":"set_todos","input":"\nTodo:\n-Done Backend of E-commerce.\n-Done Frontend.\n-Done Socket io of js learn pending."}
{"type":"observation","observation":"true"}
AI:{"type":"output","output":"Your Todos was update Successfully"}
`

function get_todos() {
  const filename = fs.readFileSync("./Todo/todos.text", "utf8");
  const literal = filename
  .replace(/:\s*-/, ":\\n-")
  .replace(/\s-/g, "\\n-");
  return literal
}

function set_todos(todos = '') {
  fs.writeFileSync("./Todo/todos.text", todos);
  return true
}

const tools = {
  "get_todos": get_todos,
  "set_todos": set_todos
}

const messages = []

while (true) {
  const query = readlineSync.question(">> ");
  messages.push({
    role: "user",
    parts: [{ text: query }],
  });
  let maxTurns = 10;
  while (maxTurns > 0) {
    maxTurns--;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    const text = response.text;
    messages.push({
      role: "model",
      parts: [{ text }],
    });
    const lines = text.trim().split("\n");
    let allchats = [];
    for (const line of lines) {
      try {
        const res = JSON.parse(line);
        allchats.push(res);
      } catch (error) {
        console.log("Invalid JSON:", line);
      }
    }
    let finished = false;
    for (const allchat of allchats) {
      try {
        if (allchat.type === "action") {
          const fn = tools[allchat.function];
          if (!fn) {
            console.log("Tool not found");
            continue;
          }
          const ans = await fn(allchat.input);
          const obs = {
            type: "observation",
            observation: ans,
          };
          messages.push({
            role: "user",
            parts: [
              {
                text: JSON.stringify(obs),
              },
            ],
          });
        } else if (allchat.type === "output") {
          console.log("AI:", allchat.output);
          finished = true;
          break;
        }
      } catch (error) {
        console.log("Action Error:", error.message);
      }
    }

    if (finished) {
      break;
    }
  }
}
  