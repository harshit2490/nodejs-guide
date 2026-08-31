<div align="center">

|                                        ← Previous                                        | [📑 Table of Contents](../README.md#part-2) |                                        Next →                                         |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------: | :-----------------------------------------------------------------------------------: |
| [Chapter 9: libuv and event loop](../S1%2009%20-%20libuv%20and%20event%20loop/Readme.md) |                                             | [Chapter 11: Creating the Server](../S1%2011%20-%20Creating%20the%20Server/Readme.md) |

</div>

---

# Chapter 10 — Thread Pool in libuv &nbsp;

> **Season 1** | Part II — Node.js Architecture & Internals
> [🎬 Link](https://namastedev.com/learn/namaste-node/thread-pool-in-libuv)

---

<a id="key-topics"></a>

### Topics Covering

> 1. [What is the Thread Pool & Why Does libuv Need It?](#topic-1)
> 2. [Which Operations Use the Thread Pool?](#topic-2)
> 3. [Thread Pool Size & `UV_THREADPOOL_SIZE`](#topic-3)
> 4. [Networking — Why It Does NOT Use the Thread Pool](#topic-4)
> 5. [OS-Level Async Mechanisms (`epoll`, `kqueue`, `IOCP`)](#topic-5)
> 6. [Golden Rules — Don’t Block the Main Thread](#topic-6)
> 7. [Code Example: Thread Pool in Action](#topic-7)
> 8. [File Descriptors & Socket Descriptors](#topic-8)
> 9. [Event Emitters](#topic-9)
> 10. [Streams & Buffers](#topic-10)
> 11. [Pipes in Node.js](#topic-11)

---

<a id="topic-1"></a>

## 1. [What is the Thread Pool & Why Does libuv Need It?](#key-topics)

![Thread Pool Diagram](./1.%20Threadpool%20diagram.png)

The **thread pool** is a set of worker threads managed by libuv that handle operations which **cannot be done asynchronously at the OS level**. Not every OS provides truly async APIs for all operations — for example, file system calls on most platforms are inherently blocking. libuv solves this by offloading these blocking operations to background threads.

```
Your JavaScript Code (Main Thread — V8)
        │
        │ fs.readFile() / crypto.pbkdf2()
        ▼
┌──────────────────────────────────┐
│        libuv Event Loop          │
│   (runs on the main thread)      │
└───────────────┬──────────────────┘
                │
                │ "This operation needs a thread"
                ▼
┌──────────────────────────────────┐
│       libuv Thread Pool          │
│                                  │
│  ┌────────┐ ┌────────┐           │
│  │Thread 1│ │Thread 2│           │
│  └────┬───┘ └────┬───┘           │
│  ┌────┴───┐ ┌────┴───┐           │
│  │Thread 3│ │Thread 4│           │
│  └────────┘ └────────┘           │
│                                  │
│  Default: 4 threads              │
│  Max: 1024 threads               │
└───────────────┬──────────────────┘
                │
                │ System call (read, write, hash...)
                ▼
┌──────────────────────────────────┐
│      Operating System Kernel     │
└──────────────────────────────────┘
```

**How it works step-by-step:**

1. V8 encounters an async call (e.g., `fs.readFile()`) and hands it to libuv
2. libuv assigns the operation to an **available thread** in the pool
3. That thread makes the **blocking system call** to the OS
4. While the thread is busy, **the main thread continues** executing JavaScript
5. When the OS completes the operation, the thread is **freed** and the **callback is queued**
6. The event loop picks up the callback and executes it on the main thread

> 💡 The thread pool is what allows Node.js to remain "non-blocking" even for inherently blocking operations like file I/O and crypto.

---

<a id="topic-2"></a>

## 2. [Which Operations Use the Thread Pool?](#key-topics)

Not everything in libuv uses the thread pool. Only operations that **lack native OS async support** are routed through it:

| Uses Thread Pool ✅                  | Does NOT Use Thread Pool ❌                    |
| ------------------------------------ | ---------------------------------------------- |
| `fs.*` (file system operations)      | `http` / `https` (networking)                  |
| `crypto.pbkdf2()`, `crypto.scrypt()` | `net` (TCP sockets)                            |
| `crypto.randomBytes()`               | `dgram` (UDP sockets)                          |
| `dns.lookup()` (uses OS resolver)    | `dns.resolve()` (uses c-ares, not thread pool) |
| `zlib` (compression/decompression)   | Timers (`setTimeout`, `setInterval`)           |
| Some `child_process` operations      | `setImmediate`, `process.nextTick`             |
| User-defined `worker_threads` tasks  | Pipe operations                                |

```
                    libuv decides:
                        │
          ┌─────────────┴──────────────┐
          │                            │
    Uses Thread Pool              Uses OS Async
    (no OS async API)             (kernel support)
          │                            │
    ┌─────┴─────┐              ┌───────┴───────┐
    │ fs.*      │              │ TCP/UDP       │
    │ crypto.*  │              │ HTTP/HTTPS    │
    │ dns.lookup│              │ dns.resolve   │
    │ zlib.*    │              │ Pipes         │
    └───────────┘              └───────────────┘
```

> ⚠️ **Key Insight:** `dns.lookup()` uses the thread pool (because it calls the OS resolver via `getaddrinfo`), but `dns.resolve()` uses **c-ares** (a C library for async DNS) and does NOT use the thread pool.

---

<a id="topic-3"></a>

## 3. [Thread Pool Size & `UV_THREADPOOL_SIZE`](#key-topics)

By default, libuv creates a thread pool with **4 threads**. You can increase this up to **1024 threads** using the `UV_THREADPOOL_SIZE` environment variable.

```
Default Thread Pool (4 threads):
─────────────────────────────────
  Task 1 → Thread 1  ✅ Running
  Task 2 → Thread 2  ✅ Running
  Task 3 → Thread 3  ✅ Running
  Task 4 → Thread 4  ✅ Running
  Task 5 → ⏳ WAITING (no free thread — queued until one finishes)
```

#### How to Change Thread Pool Size

```javascript
// Set BEFORE any async operation — must be at the very top of your app
process.env.UV_THREADPOOL_SIZE = 8;

// OR set via command line:
// UV_THREADPOOL_SIZE=8 node app.js
```

| Setting      | Value  | When to Use                                              |
| ------------ | ------ | -------------------------------------------------------- |
| **Default**  | `4`    | Most applications — sufficient for typical workloads     |
| **Increase** | `8–16` | Heavy file I/O or crypto operations running in parallel  |
| **Max**      | `1024` | Extreme cases only — more threads = more memory overhead |

> ⚠️ **Important:** `UV_THREADPOOL_SIZE` must be set **before** any async operation is triggered. Setting it after the thread pool is created has **no effect**. Best practice: set it at the very first line of your entry file or via environment variable.

#### What Happens When All Threads Are Busy?

```
Thread Pool (size = 4) with 5 tasks:
──────────────────────────────────────

Time 0ms:    Task 1 → Thread 1  ⏳
             Task 2 → Thread 2  ⏳
             Task 3 → Thread 3  ⏳
             Task 4 → Thread 4  ⏳
             Task 5 → 🔴 QUEUED (waiting for a free thread)

Time ~500ms: Task 1 → Thread 1  ✅ Done! → Thread 1 freed
             Task 5 → Thread 1  ⏳ Now assigned to freed thread

Time ~500ms: Tasks 2, 3, 4 also finish around the same time
             → All threads free
```

> 💡 The first 4 tasks run **simultaneously** (one per thread). The 5th task waits in a queue until a thread becomes available. This is why you'll see the first 4 crypto keys generate at roughly the same time, and the 5th one completes slightly later.

---

<a id="topic-4"></a>

## 4. [Networking — Why It Does NOT Use the Thread Pool](#key-topics)

A common misconception is that all async operations in Node.js use the thread pool. **Networking operations do NOT use the thread pool** — they use native OS async mechanisms instead.

### The Problem with Thread-Per-Connection

```
Naive approach (one thread per connection):
─────────────────────────────────────────────
  Request 1 → Thread 1  ⏳ Waiting for data...
  Request 2 → Thread 2  ⏳ Waiting for data...
  Request 3 → Thread 3  ⏳ Waiting for data...
  ...
  Request 10,000 → ❌ Thread exhaustion!
                    (Each thread uses ~2MB of memory)
                    → 10,000 × 2MB = 20GB of RAM just for threads!
```

This approach is **impractical** for servers handling thousands of concurrent connections.

### The Solution: OS-Level Async I/O

Instead, libuv uses the operating system's **kernel-level notification mechanisms** to monitor thousands of connections with just **one or a few threads**:

```
OS Async approach (epoll/kqueue/IOCP):
────────────────────────────────────────
  Request 1   ─┐
  Request 2   ─┤
  Request 3   ─┤
  ...         ─┼──→ Single epoll/kqueue descriptor
  Request 10K ─┘         │
                         │ OS kernel monitors ALL sockets
                         │ and notifies libuv when data arrives
                         ▼
                    Event Loop handles callbacks
                    (no thread needed per connection!)
```

> 💡 This is why Node.js can handle **tens of thousands of concurrent connections** with minimal memory — it relies on the OS kernel to do the heavy lifting for networking.

---

<a id="topic-5"></a>

## 5. [OS-Level Async Mechanisms (`epoll`, `kqueue`, `IOCP`)](#key-topics)

Each operating system provides its own mechanism for efficiently monitoring multiple I/O sources:

| OS              | Mechanism                     | How It Works                                                                                                             |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Linux**       | `epoll`                       | Monitors multiple file descriptors (sockets) for activity. Uses a **Red-Black tree** internally for efficient management |
| **macOS / BSD** | `kqueue`                      | Similar to epoll — event notification for sockets, files, processes, signals                                             |
| **Windows**     | `IOCP` (I/O Completion Ports) | Windows' async I/O mechanism — uses a completion port model                                                              |

```
How epoll works (Linux):
─────────────────────────────────────────
  1. Create an epoll descriptor
  2. Register sockets (file descriptors) with epoll
  3. Call epoll_wait() — blocks until activity detected
  4. OS kernel monitors ALL registered sockets
  5. When data arrives on any socket → kernel wakes up epoll
  6. libuv handles the callback in the event loop

  Data Structure: Red-Black Tree (O(log n) insertion/lookup)
```

> 💡 libuv **abstracts these OS differences** — you write the same JavaScript code regardless of whether it runs on Linux (epoll), macOS (kqueue), or Windows (IOCP). This is one of libuv's most important roles.

### Data Structures Used Internally

| Component                   | Data Structure     | Why                                                                                     |
| --------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| `epoll` (socket management) | **Red-Black Tree** | Efficient O(log n) insertion, deletion, and lookup of file descriptors                  |
| `timers` (setTimeout, etc.) | **Min-Heap**       | Efficiently find the timer that expires soonest (O(1) for minimum, O(log n) for insert) |

---

<a id="topic-6"></a>

## 6. [Golden Rules — Don’t Block the Main Thread](#key-topics)

Since JavaScript runs on a **single main thread**, blocking it means **the entire application freezes** — no new requests can be handled, no callbacks executed, no timers fired.

### ❌ What Blocks the Main Thread

| Anti-Pattern                                                            | Why It's Dangerous                                                           |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Using `sync` methods (`fs.readFileSync`, `crypto.pbkdf2Sync`)           | Blocks the main thread until the operation completes — no other code can run |
| Heavy JSON operations (`JSON.parse` / `JSON.stringify` on huge objects) | These run synchronously on the main thread — large objects can take 100ms+   |
| Complex Regular Expressions                                             | Catastrophic backtracking can freeze the thread for seconds or more          |
| Complex calculations / CPU-bound loops                                  | Infinite or very large loops block execution entirely                        |
| Synchronous iteration over massive datasets                             | `Array.map()` / `Array.filter()` on millions of items blocks the thread      |

### ✅ Best Practices

```
┌─────────────────────────────────────────────────────┐
│              GOLDEN RULES FOR NODE.JS               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. DON'T block the main thread                     │
│     → Use async versions of I/O methods             │
│     → Offload CPU work to worker_threads            │
│                                                     │
│  2. DON'T use sync methods in production            │
│     → fs.readFileSync ❌ → fs.readFile ✅          │
│     → crypto.pbkdf2Sync ❌ → crypto.pbkdf2 ✅      │
│                                                     │
│  3. DON'T parse huge JSON on the main thread        │
│     → Use streaming JSON parsers for large data     │
│                                                     │
│  4. DON'T write complex RegEx without testing       │
│     → Test with worst-case inputs first             │
│                                                     │
│  5. DON'T run infinite/huge loops                   │
│     → Break large tasks into chunks                 │
│     → Use setImmediate() to yield back              │
│                                                     │
│  6. Data Structures matter                          │
│     → epoll uses Red-Black Tree                     │
│     → timers use Min-Heap                           │
│     → Choose the right structure for your data      │
│                                                     │
│  7. There's always lots to learn 🚀                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

<a id="topic-7"></a>

## 7. [Code Example: Thread Pool in Action](#key-topics)

> 📁 Practice file: [`ThreadPool.js`](./Code/ThreadPool.js)

This example demonstrates the thread pool's behavior with 5 parallel `crypto.pbkdf2()` calls and a custom pool size of 5:

```javascript
const fs = require("fs");
const crypto = require("crypto");

process.env.UV_THREADPOOL_SIZE = 5;

//The 4 keys will generate first and after that remaining one will be generated
// after some time because nodejs has only 4 threads at a time
crypto.pbkdf2("Harshit", "salt", 500000, 10, "sha512", (err, key) => {
  console.log("1st key generated below:");
  console.log(key);
});

crypto.pbkdf2("Harshit", "salt", 500000, 10, "sha512", (err, key) => {
  console.log("2 nd key generated below:");
  console.log(key);
});

crypto.pbkdf2("Harshit", "salt", 500000, 10, "sha512", (err, key) => {
  console.log("3 nd key generated below:");
  console.log(key);
});

crypto.pbkdf2("Harshit", "salt", 500000, 10, "sha512", (err, key) => {
  console.log("4 nd key generated below:");
  console.log(key);
});

crypto.pbkdf2("Harshit", "salt", 500000, 10, "sha512", (err, key) => {
  console.log("5 nd key generated below:");
  console.log(key);
});
```

<details>
<summary><strong>Output (Click to View Answer)</strong></summary>

With `UV_THREADPOOL_SIZE = 5` — all 5 keys generate at roughly the **same time** because each gets its own thread:

```
1st key generated below:
<Buffer ...>
3 nd key generated below:
<Buffer ...>
2 nd key generated below:
<Buffer ...>
5 nd key generated below:
<Buffer ...>
4 nd key generated below:
<Buffer ...>
```

> ⚠️ The order may vary (threads complete at slightly different times), but all 5 finish approximately together.

**Now try with the default pool size (4):**

Remove or comment out `process.env.UV_THREADPOOL_SIZE = 5;` and run again:

```
1st key generated below:    ← These 4 finish together (1 thread each)
2 nd key generated below:
4 nd key generated below:
3 nd key generated below:
                            ← slight delay here
5 nd key generated below:   ← 5th waits for a thread to free up
```

The first 4 complete simultaneously (4 threads), and the 5th completes slightly later because it had to **wait in the queue** until a thread became available.

</details>

---

<a id="topic-8"></a>

## 8. [File Descriptors & Socket Descriptors](#key-topics)

**File Descriptors (FDs)** are integral to Unix-like operating systems (Linux, macOS). They are integer identifiers that the OS kernel assigns to every open file, socket, pipe, or other I/O resource.

```
File Descriptor Table (per process):
────────────────────────────────────
  FD 0  →  stdin   (standard input)
  FD 1  →  stdout  (standard output)
  FD 2  →  stderr  (standard error)
  FD 3  →  open file (e.g., file.txt)
  FD 4  →  socket  (e.g., TCP connection)
  FD 5  →  pipe    (e.g., IPC channel)
  ...
```

**Socket Descriptors** are a special type of file descriptor used specifically for **network connections**. In Unix, "everything is a file" — so a network socket is also accessed through a file descriptor.

| Concept               | What It Is                                       | Example                       |
| --------------------- | ------------------------------------------------ | ----------------------------- |
| **File Descriptor**   | Integer handle to any open I/O resource          | `fd = 3` for an open file     |
| **Socket Descriptor** | File descriptor specifically for network sockets | `fd = 4` for a TCP connection |

> 💡 This is why `epoll` can monitor both files and sockets — they're both just file descriptors to the OS kernel. When libuv uses `epoll` to monitor incoming HTTP connections, it's watching socket descriptors (which are file descriptors) for activity.

---

<a id="topic-9"></a>

## 9. [Event Emitters](#key-topics)

**Event Emitters** are a core pattern in Node.js for handling asynchronous events. They allow objects to **emit named events** that other parts of the application can listen to.

```javascript
const EventEmitter = require("events");

// Create an emitter instance
const myEmitter = new EventEmitter();

// Register a listener for "data" event
myEmitter.on("data", (msg) => {
  console.log("Received:", msg);
});

// Emit the event
myEmitter.emit("data", "Hello from EventEmitter!");
// Output: Received: Hello from EventEmitter!
```

```
How Event Emitters work:
──────────────────────────────────────
  emitter.on("event", callback)    ← Register listener
  emitter.emit("event", data)      ← Trigger event
  emitter.once("event", callback)  ← Listen only once
  emitter.off("event", callback)   ← Remove listener

  Many Node.js core modules extend EventEmitter:
  • http.Server  (emits "request", "connection")
  • fs.ReadStream (emits "data", "end", "error")
  • net.Socket   (emits "data", "close", "error")
```

> 💡 Event Emitters are the backbone of Node.js's event-driven architecture. The event loop, streams, HTTP servers — all internally use EventEmitter to communicate asynchronously.

---

<a id="topic-10"></a>

## 10. [Streams & Buffers](#key-topics)

### Streams

**Streams** are objects that let you read or write data **continuously in chunks**, rather than loading everything into memory at once. This is crucial for handling large files or data efficiently.

| Stream Type   | Purpose                          | Example                                         |
| ------------- | -------------------------------- | ----------------------------------------------- |
| **Readable**  | Read data from a source          | `fs.createReadStream()`, `http.IncomingMessage` |
| **Writable**  | Write data to a destination      | `fs.createWriteStream()`, `http.ServerResponse` |
| **Duplex**    | Both read and write              | `net.Socket`, TCP sockets                       |
| **Transform** | Modify data as it passes through | `zlib.createGzip()`, compression streams        |

```
Without Streams (bad for large files):
──────────────────────────────────
  [2GB File] ───→ Load ALL into RAM ───→ Process
                  ❌ 2GB in memory!

With Streams (efficient):
──────────────────────────────────
  [2GB File] ───→ Chunk 1 (64KB) ───→ Process ───→ Free
             ───→ Chunk 2 (64KB) ───→ Process ───→ Free
             ───→ Chunk 3 (64KB) ───→ Process ───→ Free
                  ✅ Only ~64KB in memory!
```

### Buffers

**Buffers** are used to handle **binary data** in Node.js. They represent raw memory allocations and are useful for operations involving binary data (file reading, network communication, crypto).

```javascript
// Creating a Buffer
const buf = Buffer.from("Hello Node.js");
console.log(buf); // <Buffer 48 65 6c 6c 6f 20 4e 6f 64 65 2e 6a 73>
console.log(buf.toString()); // "Hello Node.js"

// Allocate a buffer of 10 bytes
const buf2 = Buffer.alloc(10);
```

> 💡 When you read a file with `fs.readFile()`, the callback receives a **Buffer** (not a string). This is because files contain raw bytes — you need to call `.toString()` to convert it to readable text.

---

<a id="topic-11"></a>

## 11. [Pipes in Node.js](#key-topics)

**Pipes** simplify the process of connecting a **Readable stream** to a **Writable stream**. Instead of manually handling `data` events and writing to the destination, `.pipe()` does it automatically.

```javascript
const fs = require("fs");

// Without pipe (manual handling):
const readable = fs.createReadStream("input.txt");
const writable = fs.createWriteStream("output.txt");
readable.on("data", (chunk) => writable.write(chunk));
readable.on("end", () => writable.end());

// With pipe (clean and simple):
fs.createReadStream("input.txt").pipe(fs.createWriteStream("output.txt"));
```

```
How Pipes work:
────────────────────────────────────────────
  Readable Stream ──.pipe()──▶ Writable Stream
       │                            │
    Reads chunks                Writes chunks
    automatically               automatically
       │                            │
    Handles backpressure        Handles drain
    (pauses if destination      (resumes when
     is overwhelmed)             ready for more)

  You can also chain pipes:
  readStream.pipe(gzip).pipe(writeStream)
     Read  ──→  Compress  ──→  Write
```

> 💡 Pipes automatically handle **backpressure** — if the writable stream can't keep up with the readable stream, the pipe will pause the readable stream until the writable is ready. This prevents memory overflow.

---

### Common Mistakes

| Mistake                                                             | Why It's Wrong                                                                                                                                            |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "All async operations in Node.js use the thread pool"               | ❌ Only operations without native OS async support use the thread pool. **Networking uses `epoll`/`kqueue`/`IOCP`** — not the thread pool                 |
| "Node.js is single-threaded, so it can only do one thing at a time" | ❌ The **main JavaScript thread** is single-threaded, but libuv's **thread pool** enables parallel execution of I/O and crypto operations                 |
| "Increasing thread pool size always improves performance"           | ❌ More threads = more **memory overhead** and **context-switching** cost. Beyond a certain point, performance degrades. Match pool size to your workload |
| "Setting `UV_THREADPOOL_SIZE` anywhere in code works"               | ❌ It must be set **before any async operation** is called — ideally at the very first line. Once the pool is created, the size is fixed                  |
| "`dns.lookup()` and `dns.resolve()` work the same way"              | ❌ `dns.lookup()` uses the **thread pool** (OS resolver via `getaddrinfo`), while `dns.resolve()` uses **c-ares** (no thread pool)                        |
| "HTTP requests consume threads from the pool"                       | ❌ Networking (HTTP/TCP/UDP) uses **OS-level async** (`epoll`/`kqueue`/`IOCP`) — zero thread pool threads consumed                                        |

<div style="font-size: 22px; color: red">
<details>
  <summary><strong>Interview Questions (Click to View)</strong></summary>
  <div style="font-size: 0.9rem; color: black; background:#fff; border:2px solid red; border-radius: 10px;">

- **Q: What is the thread pool in libuv and why does it exist?**
  - A: The thread pool is a set of worker threads (default 4, max 1024) managed by libuv. It exists because not all operating systems provide truly asynchronous APIs for all operations. File system calls, crypto operations, and DNS lookups are inherently blocking — the thread pool runs these in background threads so the main JavaScript thread isn't blocked.

- **Q: What is the default thread pool size and how do you change it?**
  - A: The default size is **4 threads**. You can change it by setting `process.env.UV_THREADPOOL_SIZE = N` (max 1024) at the very top of your entry file, or via the command line: `UV_THREADPOOL_SIZE=8 node app.js`. It must be set **before** any async operation is triggered.

- **Q: Which operations use the thread pool and which don't?**
  - A: **Uses thread pool:** `fs.*` (file system), `crypto.pbkdf2()`, `crypto.scrypt()`, `crypto.randomBytes()`, `dns.lookup()`, `zlib.*`. **Does NOT use thread pool:** Networking (HTTP, TCP, UDP), `dns.resolve()` (uses c-ares), timers (`setTimeout`, `setImmediate`), `process.nextTick()`.

- **Q: Why don't networking operations use the thread pool?**
  - A: Because operating systems provide efficient kernel-level async I/O mechanisms — `epoll` (Linux), `kqueue` (macOS), `IOCP` (Windows). These can monitor thousands of sockets simultaneously with just one or a few threads, making thread-per-connection unnecessary. This is how Node.js handles tens of thousands of concurrent connections efficiently.

- **Q: What is `epoll` and why is it important for Node.js?**
  - A: `epoll` is a Linux kernel mechanism for efficiently monitoring multiple file descriptors (sockets) for I/O activity. Instead of creating a thread per connection, `epoll` uses a single descriptor to monitor thousands of sockets. The kernel notifies libuv when any socket has data available. Internally, `epoll` uses a **Red-Black tree** for O(log n) management. libuv abstracts `epoll` (Linux), `kqueue` (macOS), and `IOCP` (Windows) behind a unified API.

- **Q: What happens when all thread pool threads are busy?**
  - A: New operations that need the thread pool are **queued** and wait until a thread becomes free. For example, with 4 threads and 5 crypto operations, the first 4 run in parallel (one per thread), and the 5th waits until one of the first 4 completes. This can cause performance bottlenecks if the pool size is too small for the workload.

- **Q: What are the golden rules to avoid blocking the main thread?**
  - A: (1) Never use `sync` methods in production (use async versions). (2) Don't parse/stringify huge JSON objects on the main thread. (3) Avoid complex regular expressions that can cause catastrophic backtracking. (4) Don't run CPU-intensive calculations on the main thread — use `worker_threads`. (5) Break large loops into chunks using `setImmediate()` to yield back to the event loop.

- **Q: What data structures does libuv use internally?**
  - A: `epoll` uses a **Red-Black tree** for efficient O(log n) management of file descriptors. Timers (`setTimeout`, `setInterval`) use a **Min-Heap** to efficiently find the timer with the shortest remaining time (O(1) for minimum, O(log n) for insertion).

    </div>
  </details>
  </div>

### Key Takeaways

- libuv's **thread pool** handles operations that lack native OS async support — `fs.*`, `crypto.*`, `dns.lookup()`, `zlib.*`
- Default thread pool size is **4 threads** — configurable up to **1024** via `UV_THREADPOOL_SIZE`
- **Networking** (HTTP, TCP, UDP) does **NOT** use the thread pool — it uses OS-level async I/O (`epoll`/`kqueue`/`IOCP`)
- `epoll` (Linux), `kqueue` (macOS), and `IOCP` (Windows) allow monitoring **thousands of connections** without thread-per-connection overhead
- When all threads are busy, new thread pool operations are **queued** — causing potential bottlenecks
- `dns.lookup()` uses the thread pool; `dns.resolve()` uses c-ares (no thread pool)
- **Never block the main thread** — avoid sync methods, heavy JSON ops, complex RegEx, and CPU-bound loops
- Internal data structures: `epoll` → **Red-Black tree**, `timers` → **Min-Heap**

---

<div align="center">

|                                        ← Previous                                        | [📑 Table of Contents](../README.md#part-2) |                                        Next →                                         |
| :--------------------------------------------------------------------------------------: | :-----------------------------------------: | :-----------------------------------------------------------------------------------: |
| [Chapter 9: libuv and event loop](../S1%2009%20-%20libuv%20and%20event%20loop/Readme.md) |                                             | [Chapter 11: Creating the Server](../S1%2011%20-%20Creating%20the%20Server/Readme.md) |

</div>
