<div align="center">

|                                     ← Previous                                     | [⬆ Back to TOC](../README.md#part-1) |                                             Next →                                             |
| :--------------------------------------------------------------------------------: | :----------------------------------: | :--------------------------------------------------------------------------------------------: |
| [Chapter 3: Writing First Code](../S1%2003%20-%20Writing%20First%20Code/Readme.md) |                                      | [Chapter 5: Diving into NodeJs Repo](../S1%2005%20-%20Diving%20into%20NodeJs%20Repo/Readme.md) |

</div>

---

# Chapter 4 — module.exports & require &nbsp;

> **Season 1** | Part I — Node.js Fundamentals & Modules
> [🎬Link](https://namastedev.com/learn/namaste-node/module_export-require)

---

### What is the Module System?

In Node.js, every file is treated as a **separate module**. Variables, functions, and classes defined in one file are **private** by default — they cannot be accessed from another file unless explicitly **exported**. The `module.exports` object is the mechanism to expose code, and the `require()` function is the mechanism to import it.

This is the **CommonJS (CJS)** module system — Node.js's original and default module system.

> 💡 Modules solve the problem of **global namespace pollution**. Without modules, all variables would leak into the global scope — exactly what happens with `<script>` tags in browsers without ES Modules.

### How It Works

#### The Module Wrapper Function (IIFE)

Before executing your code, Node.js **wraps every file** in a function called the **Module Wrapper**:

```javascript
// What YOU write:
const x = 10;
console.log(x);

// What Node.js ACTUALLY executes:
(function (exports, require, module, __filename, __dirname) {
  const x = 10;
  console.log(x);
});
```

This wrapper provides **five parameters** that are available in every module:

| Parameter    | Type     | What It Is                                                           |
| ------------ | -------- | -------------------------------------------------------------------- |
| `exports`    | Object   | Shorthand reference to `module.exports` (same object initially)      |
| `require`    | Function | Function to import other modules                                     |
| `module`     | Object   | Reference to the current module (has `.exports`, `.id`, `.filename`) |
| `__filename` | String   | Absolute path of the current file                                    |
| `__dirname`  | String   | Absolute path of the directory containing the current file           |

```javascript
// wrapper-demo.js
console.log(__filename); // C:\Users\harshit\project\wrapper-demo.js
console.log(__dirname); // C:\Users\harshit\project
console.log(module); // Module { id: '.', path: '...', exports: {}, ... }
console.log(typeof require); // "function"
console.log(exports === module.exports); // true (initially!)
```

> 💡 This IIFE is why top-level variables in Node.js are **not global** — they're scoped to the wrapper function. This is fundamentally different from browser `<script>` tags where `var` leaks to `window`.

#### Three Types of Modules

| Type              | How to Require                | Example                            | Where It Lives                      |
| ----------------- | ----------------------------- | ---------------------------------- | ----------------------------------- |
| **Core Modules**  | Name only (no path)           | `require("fs")`, `require("http")` | Built into Node.js binary           |
| **Local Modules** | Relative path (`./` or `../`) | `require("./utils")`               | Your project files                  |
| **Third-Party**   | Name only (no path)           | `require("express")`               | `node_modules/` (installed via NPM) |

```javascript
// Core module — built into Node.js
const fs = require("fs");
const path = require("path");

// Local module — your own file
const utils = require("./utils"); // ./utils.js
const config = require("../config"); // ../config.js

// Third-party module — installed via npm
const express = require("express"); // node_modules/express
const lodash = require("lodash"); // node_modules/lodash
```

#### The `require()` Resolution Algorithm

When you call `require(X)`, Node.js follows a **5-step algorithm** to find the module:

```
require("X")
    │
    ├─ 1. Is X a core module? (fs, http, path, etc.)
    │     → YES: Return the core module. DONE.
    │
    ├─ 2. Does X start with "./" or "../" or "/"?
    │     → YES: It's a local file.
    │        a. Try X (exact path)
    │        b. Try X.js
    │        c. Try X.json
    │        d. Try X/index.js
    │        → Return the first match. DONE.
    │
    ├─ 3. Look for X in node_modules/
    │     → Search in current dir's node_modules/
    │     → Then parent dir's node_modules/
    │     → Then grandparent's... (walks up to root)
    │     → Return if found. DONE.
    │
    ├─ 4. Is X a directory with package.json "main" field?
    │     → YES: Load the file specified in "main". DONE.
    │
    └─ 5. Nothing found?
          → Throw Error: Cannot find module 'X'
```

#### Module Caching

Node.js **caches** modules after the first `require()` call. Subsequent `require()` calls return the **same cached object** — the module code is **NOT re-executed**.

```javascript
// counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count,
};
```

```javascript
// app.js
const counter1 = require("./counter");
const counter2 = require("./counter"); // Same cached object!

counter1.increment();
counter1.increment();

console.log(counter1.getCount()); // 2
console.log(counter2.getCount()); // 2  ← Same object!
console.log(counter1 === counter2); // true ← Proof it's cached
```

**How caching works:**

```
First require("./counter"):
  1. Resolve path → C:\project\counter.js
  2. Load file → Execute code
  3. Cache module.exports in require.cache
  4. Return module.exports

Second require("./counter"):
  1. Resolve path → C:\project\counter.js
  2. Check require.cache → FOUND!
  3. Return cached module.exports (skip execution)
```

```javascript
// Inspect the cache
console.log(require.cache);
// {
//   'C:\\project\\counter.js': Module { exports: { increment, getCount }, ... },
//   ...
// }

// Force re-execution by deleting cache (rarely needed)
delete require.cache[require.resolve("./counter")];
```

> 💡 Module caching means every module is essentially a **singleton**. This is why a database connection module works — you `require()` it in multiple files but they all share the **same** connection instance.

#### Circular Dependencies

What happens when Module A requires Module B, and Module B requires Module A?

```javascript
// a.js
console.log("a.js starts");
const b = require("./b");
console.log("In a.js, b.loaded =", b.loaded);
module.exports = { loaded: true };
console.log("a.js ends");
```

```javascript
// b.js
console.log("b.js starts");
const a = require("./a"); // Gets the PARTIAL exports of a.js (what was exported so far)
console.log("In b.js, a.loaded =", a.loaded);
module.exports = { loaded: true };
console.log("b.js ends");
```

```bash
node a.js
# a.js starts
# b.js starts
# In b.js, a.loaded = undefined    ← a.js hasn't finished yet!
# b.js ends
# In a.js, b.loaded = true
# a.js ends
```

> ⚠️ Node.js handles circular dependencies by returning the **partially completed** `module.exports` of the unfinished module. This prevents infinite loops but can lead to `undefined` values if you're not careful.

#### CommonJS vs ES Modules

| Feature                 | CommonJS (CJS)                 | ES Modules (ESM)                                            |
| ----------------------- | ------------------------------ | ----------------------------------------------------------- |
| **Syntax**              | `require()` / `module.exports` | `import` / `export`                                         |
| **File Extension**      | `.js` or `.cjs`                | `.mjs` or `.js` (with `"type": "module"` in `package.json`) |
| **Loading**             | **Synchronous** (blocking)     | **Asynchronous** (non-blocking)                             |
| **When Resolved**       | At **runtime** (dynamic)       | At **parse time** (static)                                  |
| **Top-Level `await`**   | ❌ Not supported               | ✅ Supported                                                |
| **Conditional Import**  | ✅ `if (x) require("y")`       | ❌ `import` must be at top level                            |
| **`this` at Top Level** | `module.exports`               | `undefined`                                                 |
| **Default in Node.js**  | ✅ Default                     | Opt-in via `.mjs` or `package.json`                         |

---

### Code Example

#### 1. CommonJS Module Demo (`using-cjs/`)

```
using-cjs/
├── package.json              ("type": "commonjs")
├── app.js                    (entry point)
├── data.json                 (JSON module — auto-parsed)
└── calculate/
    ├── index.js              (barrel file — binds all functions)
    ├── sum.js                (exports sum function)
    ├── multiply.js           (exports multiply function)
    └── isPrime.js            (exports isPrime function)
```

```json
// package.json
{
  "type": "commonjs",
  "main": "app.js"
}
```

```javascript
// calculate/sum.js — Exporting a single function
function sum(a, b) {
  console.log("inside sum function");
  return a + b;
}

module.exports = { sum };
```

```javascript
// calculate/multiply.js — Exporting a single function
function multiply(a, b) {
  console.log("inside multiply function");
  return a * b;
}

module.exports = { multiply };
```

```javascript
// calculate/isPrime.js — Exporting a single function
function isPrime(p) {
  console.log("inside isPrime function");
  for (var i = 2; i < p; i++) {
    if (p % i == 0) {
      return false;
    }
  }
  return true;
}

module.exports = { isPrime };
```

```javascript
// calculate/index.js — Barrel file (binds all functions together)
// Binding of a functions...
const { sum } = require("./sum");
const { multiply } = require("./multiply");
const { isPrime } = require("./isPrime");

module.exports = { sum, multiply, isPrime };
```

```json
// data.json — JSON files are auto-parsed by require()
{
  "name": "Harshit Singh",
  "age": 25,
  "city": "Noida",
  "contact": {
    "email": "xyz@email.com",
    "phone": 9876543210
  },
  "skills": ["JS", "HTML", "CSS", "NODE JS"]
}
```

```javascript
// app.js — The entry point, importing everything using require()
// Common JS Module Used - require, module.exports
// Every node project/file is called as a module

var app = "app file executed...";
console.log(app);

const { sum, multiply, isPrime } = require("./calculate/index"); // require is used to import a module

var a = 3;
var b = 8;
var p = 7;

console.log(sum(a, b));
console.log(multiply(a, b));
console.log(isPrime(p));

const jsonData = require("./data.json"); // importing json file

console.log("jsonData: ", jsonData);
```

**Output:**

```
app file executed...
inside sum function
11
inside multiply function
24
inside isPrime function
true
jsonData:  {
  name: 'Harshit Singh',
  age: 25,
  city: 'Noida',
  contact: { email: 'xyz@email.com', phone: 9876543210 },
  skills: [ 'JS', 'HTML', 'CSS', 'NODE JS' ]
}
```

---

#### 2. ES Modules Demo (`using-mjs/`)

```
using-mjs/
├── package.json              ("type": "module")
├── app.js                    (entry point)
├── data.json                 (JSON module — imported with assertion)
└── calculate/
    ├── index.js              (barrel file — binds all functions)
    ├── sum.js                (exports sum function)
    ├── multiply.js           (exports multiply function)
    └── isPrime.js            (exports isPrime function)
```

```json
// package.json — "type": "module" enables ES Module syntax
{
  "type": "module",
  "main": "app.js"
}
```

```javascript
// calculate/sum.js — Named export directly on the function
export function sum(a, b) {
  console.log("inside sum function");
  return a + b;
}
```

```javascript
// calculate/multiply.js — Named export directly on the function
export function multiply(a, b) {
  console.log("inside multiply function");
  return a * b;
}
```

```javascript
// calculate/isPrime.js — Named export directly on the function
export function isPrime(p) {
  console.log("inside isPrime function");
  for (var i = 2; i < p; i++) {
    if (p % i == 0) {
      return false;
    }
  }
  return true;
}
```

```javascript
// calculate/index.js — Barrel file (binds all functions together)
// Binding of a functions...
import { sum } from "./sum.js";
import { multiply } from "./multiply.js";
import { isPrime } from "./isPrime.js";

export { sum, multiply, isPrime };
```

```json
// data.json
{
  "name": "Harshit Singh",
  "age": 25,
  "city": "Noida",
  "contact": {
    "email": "xyz@email.com",
    "phone": 9876543210
  },
  "skills": ["JS", "HTML", "CSS", "NODE JS"]
}
```

```javascript
// app.js — The entry point, importing everything using import
// ES Module Used - import, export
// Every node project/file is called as a module

var app = "app file executed...";
console.log(app);

import { sum, multiply, isPrime } from "./calculate/index.js"; // import is used to import a module

var a = 3;
var b = 8;
var p = 7;

console.log(sum(a, b));
console.log(multiply(a, b));
console.log(isPrime(p));

import jsonData from "./data.json" with { type: "json" }; // importing json file

console.log("jsonData: ", jsonData);
```

**Output:**

```
app file executed...
inside sum function
11
inside multiply function
24
inside isPrime function
true
jsonData:  {
  name: 'Harshit Singh',
  age: 25,
  city: 'Noida',
  contact: { email: 'xyz@email.com', phone: 9876543210 },
  skills: [ 'JS', 'HTML', 'CSS', 'NODE JS' ]
}
```

> 💡 **Key Differences to Notice:** In CJS, functions are defined normally and exported via `module.exports = { ... }`. In ESM, functions use `export` keyword directly. CJS uses `require()` while ESM uses `import`. For JSON files, CJS uses `require("./data.json")` while ESM uses `import ... with { type: "json" }`. ESM also requires `.js` file extensions in import paths.

### Common Mistakes

| Mistake                                           | Why It's Wrong                                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| "Using `exports = { ... }` to export an object"   | ❌ This reassigns the local `exports` variable. Node.js returns `module.exports`, not `exports`. Use `module.exports = { ... }`    |
| "Module code runs every time you `require()` it"  | ❌ Module code runs **only once**. After that, `require()` returns the **cached** `module.exports` object                          |
| "Forgetting `./` when requiring local files"      | ❌ Without `./`, Node.js thinks it's a core module or `node_modules` package — throws `Cannot find module` error                   |
| "`require()` is asynchronous like `import`"       | ❌ `require()` is **synchronous** — it blocks execution until the module is loaded. ES `import` is asynchronous                    |
| "Variables not exported are shared between files" | ❌ Each module has its own scope (thanks to the IIFE wrapper). Only `module.exports` properties are shared                         |
| "Circular dependencies crash Node.js"             | ❌ Node.js handles them by returning the **partial** `module.exports` of the unfinished module — no crash, but may get `undefined` |

<div style="font-size: 22px; color: red">
<details>
  <summary><strong>Interview Questions (Click to View)</strong></summary>
  <div style="font-size: 0.9rem; color: black; background:#fff; border:2px solid red; border-radius: 10px;">

- **Q: What is the CommonJS module system?**
  - A: CommonJS (CJS) is Node.js's default module system. It uses `require()` to import modules and `module.exports` to export them. Loading is synchronous and resolution happens at runtime. Every file is treated as a separate module with its own scope.

- **Q: What is the module wrapper function?**
  - A: Before executing any file, Node.js wraps the code in an IIFE: `(function(exports, require, module, __filename, __dirname) { ... })`. This provides module scope isolation and injects the five module-system variables.

- **Q: What is the difference between `exports` and `module.exports`?**
  - A: `exports` is initially a reference to `module.exports` — they point to the same object. You can add properties to `exports` (e.g., `exports.x = 5`), but if you **reassign** `exports` (e.g., `exports = { x: 5 }`), it breaks the reference. Node.js always returns `module.exports` from `require()`, so always use `module.exports` when exporting a whole object or function.

- **Q: How does `require()` resolve modules?**
  - A: It follows a 5-step algorithm: (1) Check if it's a core module, (2) If path starts with `./`/`../`, load as a local file (try `.js`, `.json`, `/index.js`), (3) Search `node_modules/` directories walking up the file tree, (4) Check `package.json` "main" field if it's a directory, (5) Throw `Cannot find module` if nothing matches.

- **Q: What is module caching in Node.js?**
  - A: After the first `require()` call, the module's `module.exports` is cached in `require.cache`. Subsequent `require()` calls return the cached object without re-executing the module code. This makes modules behave as singletons.

- **Q: How does Node.js handle circular dependencies?**
  - A: When Module A requires Module B and Module B requires Module A, Node.js returns the **partially completed** `module.exports` of Module A to Module B. This prevents infinite loops but can result in `undefined` values for exports that haven't been assigned yet.

- **Q: What is the difference between CommonJS and ES Modules?**
  - A: CommonJS uses `require()`/`module.exports`, loads synchronously at runtime, and is Node.js's default. ES Modules use `import`/`export`, load asynchronously at parse time, support top-level `await`, and require `.mjs` extension or `"type": "module"` in `package.json`.

- **Q: Can you conditionally import a module in CommonJS?**
  - A: Yes. Since `require()` is a regular function that runs at runtime, you can use it inside `if` blocks or functions: `if (condition) { const m = require("./m"); }`. This is not possible with ES Module `import` statements, which must be at the top level.

- **Q: What are `__filename` and `__dirname`?**
  - A: `__filename` is the absolute path of the current file, and `__dirname` is the absolute path of the directory containing the current file. Both are injected by the module wrapper function and are available in every CommonJS module.

- **Q: Can you `require()` a JSON file?**
  - A: Yes. `require("./config.json")` automatically parses the JSON and returns a JavaScript object. No need for `fs.readFile` + `JSON.parse` for static JSON configuration files.

    </div>
  </details>
  </div>

### Key Takeaways

- Every Node.js file is a **module** — variables are private by default (scoped by the IIFE wrapper)
- Node.js wraps every file in `(function(exports, require, module, __filename, __dirname) { ... })`
- Use `module.exports` to export, `require()` to import — this is the **CommonJS** system
- **Never reassign `exports`** directly — always use `module.exports` when exporting a whole value
- Three types of modules: **Core** (`fs`, `path`), **Local** (`./utils`), **Third-party** (`express`)
- `require()` follows a **5-step resolution algorithm** — core → local file → `node_modules/` → `package.json` main → error
- Modules are **cached after first load** — `require()` returns the same object every time (singleton pattern)
- **Circular dependencies** don't crash — Node.js returns partially completed exports (but beware of `undefined`)
- **CommonJS** = synchronous, runtime resolution; **ES Modules** = asynchronous, parse-time resolution
- JSON files can be `require()`-ed directly — auto-parsed into JS objects

---

<div align="center">

|                                     ← Previous                                     | [⬆ Back to TOC](../README.md#part-1) |                                             Next →                                             |
| :--------------------------------------------------------------------------------: | :----------------------------------: | :--------------------------------------------------------------------------------------------: |
| [Chapter 3: Writing First Code](../S1%2003%20-%20Writing%20First%20Code/Readme.md) |                                      | [Chapter 5: Diving into NodeJs Repo](../S1%2005%20-%20Diving%20into%20NodeJs%20Repo/Readme.md) |

</div>
