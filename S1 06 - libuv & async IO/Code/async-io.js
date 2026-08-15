// ===== ASYNCHRONOUS — Tasks overlap =====
console.log("\n=== Async Demo ===");
console.time("async-total");

fs.readFile("./file1.txt", "utf-8", (err, data) => {
  console.log("Async: File 1 read");
});

fs.readFile("./file2.txt", "utf-8", (err, data) => {
  console.log("Async: File 2 read");
});

crypto.pbkdf2("password", "salt", 100000, 64, "sha512", (err, key) => {
  console.log("Async: Hash generated");
  console.timeEnd("async-total");
});

console.log("Async: All tasks delegated, moving on!");
// async-total: ~300ms (tasks run concurrently via thread pool!)
