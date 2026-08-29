<div align="center">

|                                    ← Previous                                    | [⬆ Back to TOC](../README.md#part-1) |                                             Next →                                             |
| :------------------------------------------------------------------------------: | :----------------------------------: | :--------------------------------------------------------------------------------------------: |
| [Chapter 2: JS on the Server](../S1%2002%20-%20JS%20on%20the%20Server/Readme.md) |                                      | [Chapter 4: module.export & require](../S1%2004%20-%20module.export%20%26%20require/Readme.md) |

</div>

---

# Chapter 3 — Writing First Code &nbsp;

> **Season 1** | Part I — Node.js Fundamentals & Modules
> [🎬Link](https://namastedev.com/learn/namaste-node/lets-write-code)

---

<a id="key-topics"></a>

### Topics Covering

> 1. [Downloading, Installing & Verifying Node.js](#topic-1)
> 2. [Four Ways to Run JavaScript in Node.js](#topic-2)
> 3. [Deep Dive: The Node.js REPL](#topic-3)
> 4. [The `console` Object — Beyond `console.log`](#topic-4)
> 5. [Code Examples: Exploring Node.js, REPL & CLI Arguments](#topic-5)

---

### What is "Writing First Code" About?

This chapter covers the practical foundations of working with Node.js — from **installing** it on your machine, to **writing and executing JavaScript files**, to exploring the **REPL** (Read-Eval-Print Loop) and mastering **`console`** methods. By the end, you'll know every way to run JavaScript outside the browser.

<a id="topic-1"></a>

## 1. [Downloading, Installing & Verifying Node.js](#key-topics)

##### Step 1: Download

1. Visit [https://nodejs.org](https://nodejs.org)
2. You'll see two versions:

| Version     | Best For                              | Stability      |
| ----------- | ------------------------------------- | -------------- |
| **LTS**     | Production apps, learning, most users | ✅ Most stable |
| **Current** | Experimenting with latest features    | ⚠️ Less stable |

> 💡 Always choose **LTS** unless you have a specific reason to use Current.

##### Step 2: Install

1. Run the downloaded installer
2. Follow the wizard — accept defaults
3. **Critical**: Ensure **"Add to PATH"** is checked (allows `node` command in terminal)

##### Step 3: Verify

```bash
# Check Node.js version
node -v
# v20.11.0

# Check NPM version (bundled with Node.js)
npm -v
# 10.2.4
```

If both commands return version numbers, Node.js is installed correctly.

<a id="topic-2"></a>

## 2. [Four Ways to Run JavaScript in Node.js](#key-topics)

| Method           | Command                           | Best For                                  |
| ---------------- | --------------------------------- | ----------------------------------------- |
| **File**         | `node app.js`                     | Writing real programs and scripts         |
| **Inline**       | `node -e "console.log('Hi')"`     | Quick one-liners, shell scripting         |
| **REPL**         | `node` (enter interactive mode)   | Experimenting, testing snippets, learning |
| **Stdin (Pipe)** | `echo "console.log(1+1)" \| node` | Piping code from other commands           |

##### Method 1: Running a JavaScript File

This is the most common way to use Node.js in real projects.

```bash
# Create a file
echo console.log("Hello from Node.js!") > app.js

# Run it
node app.js
# Output: Hello from Node.js!
```

**In VS Code:**

1. Create a new file → Save as `app.js`
2. Write your code:
   ```javascript
   console.log("Hello, World!");
   ```
3. Open terminal (`Ctrl + ~`) → Run: `node app.js`

##### Method 2: Inline Execution

```bash
# Execute JavaScript directly from the command line
node -e "console.log(2 + 3)"
# Output: 5

# Multi-statement inline
node -e "const x = 10; const y = 20; console.log(x + y)"
# Output: 30
```

##### Method 3: REPL (Read-Eval-Print Loop)

```bash
# Start the REPL
node
```

The REPL is an interactive shell that:

1. **R**eads your input
2. **E**valuates the expression
3. **P**rints the result
4. **L**oops back — waits for more input

```bash
$ node
Welcome to Node.js v20.11.0.
Type ".help" for more information.

> 2 + 3
5
> "Hello" + " " + "Node"
'Hello Node'
> Math.random()
0.7234567891234
> const greet = (name) => `Namaste, ${name}!`
undefined
> greet("Akshay")
'Namaste, Akshay!'
>
```

##### Method 4: Stdin (Piped Input)

```bash
# Pipe code from echo
echo "console.log('Piped!')" | node
# Output: Piped!

# Pipe from a file without using `node filename`
cat app.js | node
```

<a id="topic-3"></a>

## 3. [Deep Dive: The Node.js REPL](#key-topics)

The REPL is more powerful than it looks. Here are its key features:

##### The Underscore `_` Variable

`_` always holds the **result of the last expression**:

```bash
> 5 + 10
15
> _ * 2
30
> "Result was: " + _
'Result was: 30'
```

##### REPL Dot Commands

| Command      | What It Does                                                   |
| ------------ | -------------------------------------------------------------- |
| `.help`      | Shows all available REPL commands                              |
| `.exit`      | Exits the REPL (same as `Ctrl + D` or typing `process.exit()`) |
| `.break`     | Cancels the current multi-line input                           |
| `.clear`     | Resets the REPL context (clears all variables)                 |
| `.save file` | Saves the current REPL session to a file                       |
| `.load file` | Loads and executes a file in the REPL                          |
| `.editor`    | Enters multi-line editor mode                                  |

##### Multi-Line Editor Mode

```bash
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)

function add(a, b) {
  return a + b;
}

console.log(add(3, 4));

// Press Ctrl+D
7
```

##### Tab Completion

Press `Tab` in the REPL to auto-complete:

```bash
> cons  [TAB]
# Suggests: console, const

> console.  [TAB]
# Shows all console methods: log, error, warn, table, time, timeEnd, dir, ...

> process.  [TAB]
# Shows all process properties: env, argv, cwd, exit, pid, ...
```

> 💡 Double-tap `Tab` on an empty line to see **all available globals** — every function, object, and class available in Node.js.

##### REPL vs Browser Console

| Feature                  | Browser Console         | Node.js REPL         |
| ------------------------ | ----------------------- | -------------------- |
| **DOM access**           | ✅ `document`, `window` | ❌ Not available     |
| **File system**          | ❌ Sandboxed            | ✅ `require("fs")`   |
| **Multi-line editor**    | ✅ Shift+Enter          | ✅ `.editor` command |
| **Save session**         | ❌ No                   | ✅ `.save filename`  |
| **Last result variable** | ✅ `$_`                 | ✅ `_`               |
| **Tab completion**       | ✅ Yes                  | ✅ Yes               |
| **Exit**                 | Close browser tab       | `.exit` or `Ctrl+D`  |

<a id="topic-4"></a>

## 4. [The `console` Object — Beyond `console.log`](#key-topics)

Node.js inherits the familiar `console` object but also adds some powerful methods:

| Method                   | What It Does                                                 |
| ------------------------ | ------------------------------------------------------------ |
| `console.log()`          | Prints to **stdout** — general output                        |
| `console.error()`        | Prints to **stderr** — for errors (different stream)         |
| `console.warn()`         | Prints to **stderr** — for warnings                          |
| `console.table()`        | Displays data in a formatted **table**                       |
| `console.time(label)`    | Starts a **timer** with a label                              |
| `console.timeEnd(label)` | Stops the timer and prints elapsed time                      |
| `console.dir(obj)`       | Prints object with **syntax highlighting** and depth control |
| `console.count(label)`   | Counts how many times a label has been logged                |
| `console.clear()`        | Clears the terminal screen                                   |
| `console.assert()`       | Prints error only if assertion **fails**                     |
| `console.trace()`        | Prints the **call stack trace**                              |

<a id="topic-5"></a>

## 5. [Code Examples: Exploring Node.js, REPL & CLI Arguments](#key-topics)

#### First Real Script — Exploring Node.js

```javascript
// first.js — Run with: node first.js

// Basic output
console.log("=== Welcome to Node.js ===");
console.log("Node Version:", process.version);
console.log("Current Directory:", process.cwd());

// Console methods showcase
console.warn("⚠️  This is a warning (goes to stderr)");
console.error("❌ This is an error (goes to stderr)");

// console.table — perfect for structured data
const chapters = [
  { chapter: 1, title: "Introduction to NodeJs", status: "✅ Done" },
  { chapter: 2, title: "JS on the Server", status: "✅ Done" },
  { chapter: 3, title: "Writing First Code", status: "🔄 Current" },
];
console.table(chapters);

// console.time — measure execution speed
console.time("loop-timer");
let sum = 0;
for (let i = 0; i < 1_000_000; i++) {
  sum += i;
}
console.timeEnd("loop-timer");
console.log("Sum of 1 to 999,999:", sum);

// console.count — track how many times something happens
for (let i = 0; i < 3; i++) {
  console.count("iteration");
}

// console.assert — only prints when condition is FALSE
console.assert(5 > 3, "This won't print — assertion passed");
console.assert(5 < 3, "This WILL print — 5 is not less than 3");
```

**Output:**

```
=== Welcome to Node.js ===
Node Version: v20.11.0
Current Directory: C:\Users\harshit\projects
⚠️  This is a warning (goes to stderr)
❌ This is an error (goes to stderr)
┌─────────┬─────────┬───────────────────────────┬──────────────┐
│ (index) │ chapter │          title            │   status     │
├─────────┼─────────┼───────────────────────────┼──────────────┤
│    0    │    1    │ 'Introduction to NodeJs'  │ '✅ Done'   │
│    1    │    2    │ 'JS on the Server'        │ '✅ Done'   │
│    2    │    3    │ 'Writing First Code'      │ '🔄 Current'│
└─────────┴─────────┴───────────────────────────┴──────────────┘
loop-timer: 5.123ms
Sum of 1 to 999,999: 499999500000
iteration: 1
iteration: 2
iteration: 3
Assertion failed: This WILL print — 5 is not less than 3
```

#### REPL Session Example

```bash
$ node
> const fs = require("fs")
undefined
> fs.writeFileSync("hello.txt", "Hello from REPL!")
undefined
> fs.readFileSync("hello.txt", "utf-8")
'Hello from REPL!'
> .save session.js
Session saved to: session.js
> .exit
```

#### Command-Line Arguments

```javascript
// args.js — Run with: node args.js Harshit 25
console.log("All arguments:", process.argv);
console.log("Script name:", process.argv[1]);
console.log("Your name:", process.argv[2]);
console.log("Your age:", process.argv[3]);
```

```bash
node args.js Harshit 25
# All arguments: ['C:\\...\\node.exe', 'C:\\...\\args.js', 'Harshit', '25']
# Script name: C:\...\args.js
# Your name: Harshit
# Your age: 25
```

> 💡 `process.argv[0]` is always the path to `node`, `process.argv[1]` is the script path, and your custom arguments start from `process.argv[2]`.

### Common Mistakes

| Mistake                                                  | Why It's Wrong                                                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| "I can run JS files by double-clicking them"             | ❌ `.js` files need to be executed via `node filename.js` in a terminal. Double-clicking opens them in a text editor    |
| "The REPL and running a file are the same thing"         | ❌ REPL is **interactive** (one expression at a time). Files are executed **start to finish** in one go                 |
| "`console.log` and `console.error` go to the same place" | ❌ `console.log` writes to **stdout**, while `console.error` and `console.warn` write to **stderr** — different streams |
| "Node.js REPL is just like the browser console"          | ❌ Similar but different — REPL has `.save`, `.load`, `.editor` mode, and no DOM access. Browser console has DOM + `$_` |
| "You need to install `console` in Node.js"               | ❌ `console` is a **global** — available everywhere without `require()`                                                 |
| "`process.argv` starts with my arguments"                | ❌ `argv[0]` = node path, `argv[1]` = script path. Your arguments start from `argv[2]`                                  |

<div style="font-size: 22px; color: red">
<details>
  <summary><strong>Interview Questions (Click to View)</strong></summary>
  <div style="font-size: 0.9rem; color: black; background:#fff; border:2px solid red; border-radius: 10px;">

- **Q: How do you run a JavaScript file in Node.js?**
  - A: Using the command `node filename.js` in the terminal. Node.js reads the file, compiles it via V8, and executes it. The file must have valid JavaScript code.

- **Q: What is the Node.js REPL?**
  - A: REPL stands for **Read-Eval-Print-Loop**. It's an interactive shell that reads JavaScript expressions, evaluates them, prints the result, and loops for more input. Start it by typing `node` in the terminal with no arguments.

- **Q: What does the `_` (underscore) variable hold in the REPL?**
  - A: It holds the **result of the last evaluated expression**. For example, after typing `5 + 10` and getting `15`, typing `_ * 2` returns `30`.

- **Q: What is the difference between `console.log()` and `console.error()`?**
  - A: `console.log()` writes to **stdout** (standard output), while `console.error()` writes to **stderr** (standard error). They appear the same in the terminal, but they are separate streams — useful for piping and log management.

- **Q: What are the different ways to execute JavaScript in Node.js?**
  - A: Four ways: (1) **File** — `node app.js`, (2) **Inline** — `node -e "code"`, (3) **REPL** — type `node` to enter interactive mode, (4) **Stdin** — pipe code via `echo "code" | node`.

- **Q: What is `process.argv` and how does it work?**
  - A: `process.argv` is an array containing command-line arguments. `argv[0]` is the path to the Node.js executable, `argv[1]` is the path to the script, and `argv[2]` onwards are the user-provided arguments.

- **Q: How do you check if Node.js is installed correctly?**
  - A: Run `node -v` in the terminal. If it returns a version number (e.g., `v20.11.0`), Node.js is installed. Also run `npm -v` to verify NPM is available.

- **Q: What does `console.table()` do?**
  - A: It takes an array or object and displays it as a **formatted table** in the terminal — much more readable than `console.log()` for structured data.

- **Q: How do you write and execute multi-line code in the REPL?**
  - A: Use the `.editor` command to enter multi-line editor mode. Write your code, then press `Ctrl+D` to execute it, or `Ctrl+C` to cancel.

- **Q: What is the difference between LTS and Current versions of Node.js?**
  - A: **LTS (Long-Term Support)** is the stable release recommended for production and most users — it receives bug fixes and security updates for 30 months. **Current** has the newest features but may be less stable and has a shorter support window.

    </div>
  </details>
  </div>

### Key Takeaways

- Install Node.js from [nodejs.org](https://nodejs.org) — always pick the **LTS** version for stability
- Verify installation with `node -v` and `npm -v`
- **Four ways to run JS**: file (`node app.js`), inline (`node -e`), REPL (`node`), and stdin pipe
- The **REPL** is a powerful interactive tool — use `.help`, `.editor`, `.save`, `.load`, and `_` (last result)
- `console.log` → **stdout**, `console.error`/`console.warn` → **stderr** — different output streams
- Use `console.table()` for structured data, `console.time()`/`console.timeEnd()` for performance measurement
- `process.argv` gives command-line arguments — your args start from index `[2]`
- The REPL supports **Tab completion** — double-tap `Tab` to explore all available globals

---

<div align="center">

|                                    ← Previous                                    | [⬆ Back to TOC](../README.md#part-1) |                                             Next →                                             |
| :------------------------------------------------------------------------------: | :----------------------------------: | :--------------------------------------------------------------------------------------------: |
| [Chapter 2: JS on the Server](../S1%2002%20-%20JS%20on%20the%20Server/Readme.md) |                                      | [Chapter 4: module.export & require](../S1%2004%20-%20module.export%20%26%20require/Readme.md) |

</div>
