// ✅ The Promise-based, modern approach (Node 15+)
// This is what you should use in real applications

// import fs from "fs"; // OR use this if your project is using ES6 modules
const fs = require("fs");

const readFilePromise = (filename, encoding) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

// Using async/await
async function fsRead() {
  try {
    console.time("fs-read");
    const [data1, data2] = await Promise.all([
      readFilePromise("./file1.txt", "utf-8"),
      readFilePromise("./file2.txt", "utf-8"),
    ]);
    console.log("Promise: Both files read", { data1, data2 });
    console.timeEnd("fs-read");
  } catch (error) {
    console.error("Error reading files:", error);
  }
}
fsRead();
