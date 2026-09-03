<div align="center">

| ← Previous | [⬆ Back to TOC](../README.md#part-1) |                                      Next →                                      |
| :--------: | :----------------------------------: | :------------------------------------------------------------------------------: |
|     —      |                                      | [Chapter 2: JS on the Server](../S1%2002%20-%20JS%20on%20the%20Server/Readme.md) |

</div>

---

# Chapter 1 — Introduction to Node.js &nbsp;

> **Season 1** | Part I — Node.js Fundamentals & Modules
> [🎬Link](https://namastedev.com/learn/namaste-node/introduction-to-nodejs)

---

<a id="key-topics"></a>

### Topics Covering

> 1. [Development History & Timeline of Node.js](#topic-1)
> 2. [What is Node.js? & Core Architecture](#topic-2)
> 3. [Key Features of Node.js](#topic-3)
> 4. [Node.js vs Browser JavaScript](#topic-4)
> 5. [Why Was Node.js Created? (The C10K Problem)](#topic-5)
> 6. [Code Examples: `process`, REPL & Async I/O](#topic-6)

---

<a id="topic-1"></a>

## 1. [Development History & Timeline of Node.js](#key-topics)

![](./History%20of%20Nodejs.png)

#### Timeline

| Year | Event                                                                                                    |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 2009 | **Ryan Dahl** creates Node.js. Initially experiments with **SpiderMonkey**, then adopts **V8 engine**    |
| 2009 | Project originally named **web.js**, renamed to **Node.js** to reflect broader potential                 |
| 2009 | **Joyent** (technology company) sponsors and supports Node.js development                                |
| 2010 | **NPM** (Node Package Manager) is introduced — developed by **Isaac Z. Schlueter**                       |
| 2011 | Microsoft collaborates to bring Node.js and NPM to **Windows** (initially macOS/Linux only)              |
| 2012 | Ryan Dahl steps down; **Isaac Z. Schlueter** (NPM creator) takes over Node.js leadership                 |
| 2014 | **Fedor Indutny** forks Node.js → creates **io.js** due to governance disagreements                      |
| 2015 | Node.js and io.js communities reunify under the **Node.js Foundation**                                   |
| 2019 | **JS Foundation** + **Node.js Foundation** merge → **OpenJS Foundation** for community-driven governance |

---

<a id="topic-2"></a>

## 2. [What is Node.js? & Core Architecture](#key-topics)

**Node.js is a cross-platform, open-source JavaScript runtime environment** that executes JavaScript code outside of a web browser. It is built on Chrome's **V8 JavaScript engine** — the same engine that powers Google Chrome — and extended with **libuv**, a C library for asynchronous I/O, enabling Node.js to perform file system operations, networking, and more without blocking the main thread.

> 💡 Node.js is **not** a language, **not** a framework, and **not** a library. It is a **runtime environment** — a place where JavaScript code can run.

### Core Architecture

Node.js combines two powerful components:

| Component     | What It Is                                   | Role in Node.js                                                                    |
| ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| **V8 Engine** | Google's open-source JavaScript engine (C++) | Parses and executes JavaScript code, compiles JS to machine code via JIT           |
| **libuv**     | Cross-platform async I/O library (C)         | Handles file system, networking, timers, child processes — provides the Event Loop |

Together, they give JavaScript the ability to:

- Access the **file system** (`fs` module)
- Create **HTTP servers** (`http` module)
- Interact with **databases**, **operating system**, and **network**
- Run **asynchronous, non-blocking** operations efficiently

---

<a id="topic-3"></a>

## 3. [Key Features of Node.js](#key-topics)

### 1. Event-Driven Architecture

Node.js follows an **event-driven architecture**, where the flow of the program is determined by events (user actions, sensor outputs, messages from other programs, etc.). Instead of waiting for tasks to complete sequentially, Node.js registers callbacks and moves on — responding when the event completes.

```
   Request comes in
        │
        ▼
   ┌─────────────┐
   │  Event Loop  │ ◄── Continuously checks for pending events
   └──────┬──────┘
          │
    ┌─────┴─────┐
    ▼           ▼
 Callbacks   New I/O ops
 (execute)   (delegate to libuv)
```

---

### 2. Non-Blocking I/O (Asynchronous I/O)

Traditional servers (like Apache) use a **blocking model** — each request occupies a thread, and while waiting for I/O (database query, file read), that thread sits idle.

Node.js uses **non-blocking I/O** — it delegates I/O tasks to the OS/libuv and continues processing. When the I/O completes, a callback is triggered.

| Model                   | How It Handles I/O                 | Concurrency                |
| ----------------------- | ---------------------------------- | -------------------------- |
| **Blocking (Apache)**   | Thread waits until I/O completes   | One thread per connection  |
| **Non-Blocking (Node)** | Delegates I/O, continues execution | Single thread + Event Loop |

---

### 3. Single-Threaded (with Multi-Threaded Support)

Node.js runs JavaScript on a **single thread** (the Event Loop), but offloads heavy operations (crypto, file I/O, DNS lookups) to a **thread pool** managed by libuv (default 4 threads).

---

<a id="topic-4"></a>

## 4. [Node.js vs Browser JavaScript](#key-topics)

| Feature                | Browser JS                          | Node.js                                 |
| ---------------------- | ----------------------------------- | --------------------------------------- |
| **Engine**             | V8 (Chrome), SpiderMonkey (Firefox) | V8                                      |
| **Global Object**      | `window`                            | `global` / `globalThis`                 |
| **DOM Access**         | ✅ Yes (`document`, `window`)       | ❌ No DOM                               |
| **File System Access** | ❌ No (sandboxed)                   | ✅ Yes (`fs` module)                    |
| **Module System**      | ES Modules (`import`/`export`)      | CommonJS (`require`) + ES Modules       |
| **HTTP Server**        | ❌ Cannot create servers            | ✅ Built-in `http` module               |
| **Use Case**           | Frontend, UI interactions           | Backend, APIs, CLI tools, microservices |

<a id="topic-5"></a>

## 5. [Why Was Node.js Created? (The C10K Problem)](#key-topics)

Before Node.js, web servers like **Apache HTTP Server** used a **thread-per-connection** model:

```
Apache Model (Blocking):
─────────────────────────────────
Client 1 → Thread 1 → [WAITING for DB...] → Response
Client 2 → Thread 2 → [WAITING for File...] → Response
Client 3 → Thread 3 → [WAITING for API...] → Response
...
Client 10,000 → ❌ No threads available! (Thread exhaustion)
```

Ryan Dahl's insight: **Most of the time, threads are idle waiting for I/O.** Why not use a single thread that never waits?

```
Node.js Model (Non-Blocking):
─────────────────────────────────
Client 1 ─┐
Client 2 ─┤
Client 3 ─┼──→ Single Thread (Event Loop) ──→ Delegates I/O to OS/libuv
...       ─┤                                    ──→ Handles callbacks when ready
Client 10,000 ─┘
```

<a id="topic-6"></a>

## 6. [Code Examples: `process`, REPL & Async I/O](#key-topics)

```javascript
// ✅ Checking your Node.js environment
console.log("Hello from Node.js!");
console.log("Node.js Version:", process.version); // e.g., v20.11.0
console.log("Platform:", process.platform); // e.g., win32, linux, darwin
console.log("Architecture:", process.arch); // e.g., x64, arm64
console.log("Current Directory:", process.cwd());
```

**Run it:**

```bash
node app.js
```

**Output:**

```
Hello from Node.js!
Node.js Version: v20.11.0
Platform: win32
Architecture: x64
Current Directory: C:\Users\harshit\projects
```

#### Exploring the `process` Object

The `process` object is a **global** in Node.js (no `require` needed). It provides information about the current Node.js process:

```javascript
// process is a global object — available everywhere in Node.js
console.log(typeof process); // "object"
console.log(typeof window); // "undefined" — no DOM in Node.js!

// Key properties
console.log(process.pid); // Process ID
console.log(process.env.PATH); // Environment variable
console.log(process.argv); // Command-line arguments
```

#### Node.js REPL (Read-Eval-Print Loop)

```bash
$ node
> 2 + 3
5
> "Hello" + " " + "Node"
'Hello Node'
> const greet = (name) => `Namaste, ${name}!`
undefined
> greet("Akshay")
'Namaste, Akshay!'
> .exit
```

> 💡 The **REPL** is Node.js's interactive shell — similar to the browser console but running in your terminal.

#### Non-Blocking I/O Demo

```javascript
const fs = require("fs");

console.log("1 — Start");

// Non-blocking (async) file read
fs.readFile("./data.txt", "utf-8", (err, data) => {
  if (err) throw err;
  console.log("2 — File content:", data);
});

console.log("3 — End");
```

**Output:**

```
1 — Start
3 — End
2 — File content: (contents of data.txt)
```

> ⚠️ Notice **"3 — End"** prints before **"2 — File content"**. This is non-blocking I/O in action — Node.js doesn't wait for the file to be read. It delegates the task and moves on.

---

### Common Misconceptions

| Misconception                                                    | Reality                                                                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ❌ "Node.js is a programming language"                            | ✅ Node.js is a **runtime environment**. The language is JavaScript                                                     |
| ❌ "Node.js is a framework like Express"                          | ✅ Node.js is a **runtime**. Express is a framework built **on top of** Node.js                                         |
| ❌ "Node.js is single-threaded, so it can't handle many requests" | ✅ Single-threaded refers to the **Event Loop**. Heavy I/O is offloaded to libuv's **thread pool** and the OS           |
| ❌ "Node.js is only for web servers"                              | ✅ Node.js powers CLI tools, desktop apps (Electron), IoT, real-time apps, build tools, and more                        |
| ❌ "Node.js created NPM"                                          | ✅ NPM was created by **Isaac Z. Schlueter** in 2010 as a separate project, later bundled with Node.js                  |
| ❌ "Blocking and non-blocking produce different results"          | ✅ Both produce the **same result** — the difference is in **when** and **how** the result is delivered (sync vs async) |

<div style="font-size: 22px; color: red">
<details>
  <summary><strong>Interview Questions (Click to View)</strong></summary>
  <div style="font-size: 0.9rem; color: black; background:#fff; border:2px solid red; border-radius: 10px;">

- **Q: What is Node.js?**
  - A: Node.js is a cross-platform, open-source JavaScript runtime environment built on Chrome's V8 engine. It allows JavaScript to run outside the browser and is designed for building scalable network applications using non-blocking, event-driven I/O.

- **Q: Is Node.js single-threaded? Explain.**
  - A: Yes, the **Event Loop** (the main execution thread) is single-threaded. However, Node.js uses **libuv's thread pool** (default 4 threads) to handle CPU-intensive operations like crypto, file system, and DNS lookups. So it's "single-threaded" for JavaScript execution but multi-threaded under the hood for I/O.

- **Q: What is the difference between blocking and non-blocking I/O?**
  - A: **Blocking I/O** halts execution until the operation completes (e.g., `fs.readFileSync`). **Non-blocking I/O** delegates the operation and continues execution — a callback is invoked when the operation finishes (e.g., `fs.readFile`).

- **Q: Why was Node.js created?**
  - A: Ryan Dahl created Node.js in 2009 to solve the **C10K problem** — handling 10,000+ concurrent connections efficiently. Traditional servers like Apache used one thread per connection (blocking), leading to thread exhaustion. Node.js uses a single-threaded Event Loop with non-blocking I/O to handle massive concurrency with minimal resources.

- **Q: What is the V8 engine?**
  - A: V8 is Google's open-source JavaScript engine written in C++. It compiles JavaScript directly to machine code using **JIT (Just-In-Time) compilation**, making it extremely fast. Node.js uses V8 to execute JavaScript outside the browser.

- **Q: What is libuv and why does Node.js need it?**
  - A: libuv is a C library that provides Node.js with its **Event Loop**, **thread pool**, and cross-platform **asynchronous I/O** capabilities. V8 alone can only execute JavaScript — libuv gives Node.js the ability to interact with the file system, network, timers, and OS.

- **Q: What is NPM?**
  - A: NPM (Node Package Manager) is the default package manager for Node.js. It provides a CLI tool and an online registry of over 2 million packages. Developers use it to install, share, and manage project dependencies.

- **Q: What is the `process` object in Node.js?**
  - A: `process` is a global object in Node.js that provides information and control over the current Node.js process. It gives access to environment variables (`process.env`), command-line arguments (`process.argv`), the current working directory (`process.cwd()`), and the ability to exit (`process.exit()`).

- **Q: What is the difference between Node.js and browser JavaScript?**
  - A: Browser JS has access to the DOM (`document`, `window`) but no file system access. Node.js has no DOM but provides file system (`fs`), networking (`http`), and OS-level APIs. Browser uses `window` as the global object; Node uses `global`/`globalThis`.

- **Q: What is the OpenJS Foundation?**
  - A: The OpenJS Foundation was formed in 2019 by merging the Node.js Foundation and the JS Foundation. It provides community-driven governance and stewardship for Node.js and other JavaScript projects.

    </div>
  </details>
  </div>

### Key Takeaways

- Node.js is a **runtime environment** — not a language, framework, or library
- Built on **V8 engine** (JavaScript execution) + **libuv** (async I/O, Event Loop, thread pool)
- Uses **event-driven, non-blocking I/O** — ideal for I/O-heavy, concurrent applications
- JavaScript runs on a **single thread** (Event Loop), but heavy I/O is offloaded to **libuv's thread pool**
- Created by **Ryan Dahl** in **2009** to solve the limitations of thread-per-connection servers
- **NPM** (2010) is the world's largest package registry, bundled with every Node.js installation
- Governed by the **OpenJS Foundation** (since 2019) with strong community support
- The `process` object is Node.js's equivalent of the browser's `window` — a global entry point to the runtime

---

<div align="center">

| ← Previous | [⬆ Back to TOC](../README.md#part-1) |                                      Next →                                      |
| :--------: | :----------------------------------: | :------------------------------------------------------------------------------: |
|     —      |                                      | [Chapter 2: JS on the Server](../S1%2002%20-%20JS%20on%20the%20Server/Readme.md) |

</div>
