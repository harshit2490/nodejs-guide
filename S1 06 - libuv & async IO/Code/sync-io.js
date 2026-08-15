const fs = require("fs");
const crypto = require("crypto");

// ===== SYNCHRONOUS — Everything blocks =====
console.log("=== Sync Demo ===");
console.time("sync-total");

const data1 = fs.readFileSync("./file1.txt", "utf-8"); // Block
console.log("Sync: File 1 read");

const data2 = fs.readFileSync("./file2.txt", "utf-8"); // Block
console.log("Sync: File 2 read");

const hash = crypto.pbkdf2Sync("password", "salt", 100000, 64, "sha512");
console.log("Sync: Hash generated"); // Block

console.timeEnd("sync-total");
// sync-total: ~800ms (all tasks run sequentially)
