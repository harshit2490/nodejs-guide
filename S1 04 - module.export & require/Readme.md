<div align="center">

|                                     ← Previous                                     | [⬆ Back to TOC](../README.md#part-1) |                                             Next →                                             |
| :--------------------------------------------------------------------------------: | :----------------------------------: | :--------------------------------------------------------------------------------------------: |
| [Chapter 3: Writing First Code](../S1%2003%20-%20Writing%20First%20Code/Readme.md) |                                      | [Chapter 5: Diving into NodeJs Repo](../S1%2005%20-%20Diving%20into%20NodeJs%20Repo/Readme.md) |

</div>

---

# Chapter 4 — module.exports & require &nbsp;

> **Season 1** | Part I — Node.js Fundamentals & Modules

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

```javascript
// File extension is optional for .js and .json
require("./utils"); // Resolves to ./utils.js
require("./data"); // Resolves to ./data.json (if no .js exists)
require("./lib"); // Resolves to ./lib/index.js (if lib is a directory)
```

#### Exporting from a Module

##### Exporting a Single Value

```javascript
// greet.js — Export a single function
function greet(name) {
  return `Hello, ${name}!`;
}

module.exports = greet;
```

```javascript
// app.js — Import the single export
const greet = require("./greet");
console.log(greet("Akshay")); // "Hello, Akshay!"
```

##### Exporting Multiple Values

```javascript
// utils.js — Export multiple functions/values
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const PI = 3.14159;

module.exports = { add, subtract, PI };
```

```javascript
// app.js — Import with destructuring
const { add, subtract, PI } = require("./utils");
console.log(add(5, 3)); // 8
console.log(subtract(10, 4)); // 6
console.log(PI); // 3.14159
```

##### Exporting a Class

```javascript
// User.js
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  greet() {
    return `Hi, I'm ${this.name} (${this.age})`;
  }
}

module.exports = User;
```

```javascript
// app.js
const User = require("./User");
const u = new User("Harshit", 25);
console.log(u.greet()); // "Hi, I'm Harshit (25)"
```

#### `exports` vs `module.exports` — The Gotcha ⚠️

`exports` is a **shorthand reference** to `module.exports`. Initially, they point to the **same object**:

```javascript
console.log(exports === module.exports); // true
```

**✅ This works** — adding properties to `exports`:

```javascript
// utils.js
exports.add = (a, b) => a + b;
exports.subtract = (a, b) => a - b;
// Both are on module.exports because exports === module.exports
```

**❌ This BREAKS** — reassigning `exports`:

```javascript
// broken.js
exports = { add: (a, b) => a + b }; // ❌ BROKEN!
// This reassigns the local `exports` variable
// module.exports is still {} (empty)
```

**The Rule:**

| Operation                       | Works? | Why                                                           |
| ------------------------------- | ------ | ------------------------------------------------------------- |
| `exports.x = value`             | ✅     | Adds property to the shared object                            |
| `module.exports.x = value`      | ✅     | Same effect — adds property to the shared object              |
| `module.exports = { x: value }` | ✅     | Replaces the entire export (this is what gets returned)       |
| `exports = { x: value }`        | ❌     | Only reassigns the local variable, `module.exports` unchanged |

> 💡 **Golden Rule**: When in doubt, always use `module.exports`. Node.js returns **`module.exports`** from `require()`, never `exports`.

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

```javascript
// ===== CommonJS (.js / .cjs) =====
const fs = require("fs");
const { add } = require("./utils");
module.exports = { myFunction };

// ===== ES Modules (.mjs or "type": "module") =====
import fs from "fs";
import { add } from "./utils.mjs";
export function myFunction() {
  /* ... */
}
export default myFunction;
```

### Code Example

#### Complete Module System Demo

```
project/
├── app.js          (entry point)
├── math.js         (local module — exports functions)
├── config.json     (JSON module — auto-parsed)
└── logger.js       (local module — exports class)
```

```javascript
// math.js — Exporting multiple functions
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;

// Using module.exports (the correct way for multiple exports)
module.exports = { add, subtract, multiply };
```

```json
// config.json — JSON files are auto-parsed by require()
{
  "appName": "Namaste Node",
  "version": "1.0.0",
  "debug": true
}
```

```javascript
// logger.js — Exporting a class
class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }
  log(msg) {
    console.log(`[${this.prefix}] ${msg}`);
  }
  error(msg) {
    console.error(`[${this.prefix} ERROR] ${msg}`);
  }
}

module.exports = Logger;
```

```javascript
// app.js — The entry point, importing everything
const { add, subtract, multiply } = require("./math"); // Local module
const config = require("./config.json"); // JSON module
const Logger = require("./logger"); // Local module (class)
const path = require("path"); // Core module
const fs = require("fs"); // Core module

// Use imported modules
const logger = new Logger(config.appName);

logger.log(`App: ${config.appName} v${config.version}`);
logger.log(`5 + 3 = ${add(5, 3)}`);
logger.log(`10 - 4 = ${subtract(10, 4)}`);
logger.log(`6 * 7 = ${multiply(6, 7)}`);
logger.log(`Debug mode: ${config.debug}`);
logger.log(`Current dir: ${__dirname}`);
logger.log(`Current file: ${path.basename(__filename)}`);

// Prove module caching
const math1 = require("./math");
const math2 = require("./math");
logger.log(`Same cached module? ${math1 === math2}`); // true
```

**Output:**

```
[Namaste Node] App: Namaste Node v1.0.0
[Namaste Node] 5 + 3 = 8
[Namaste Node] 10 - 4 = 6
[Namaste Node] 6 * 7 = 42
[Namaste Node] Debug mode: true
[Namaste Node] Current dir: C:\Users\harshit\project
[Namaste Node] Current file: app.js
[Namaste Node] Same cached module? true
```

#### The `module` Object — What It Contains

```javascript
// inspect-module.js
console.log(module);
```

```bash
node inspect-module.js
# Module {
#   id: '.',                    ← '.' means this is the entry point
#   path: 'C:\\project',
#   exports: {},                ← What this module exports
#   filename: 'C:\\project\\inspect-module.js',
#   loaded: false,              ← true after fully loaded
#   children: [],               ← Modules this file required
#   paths: [                    ← Where Node.js searches for node_modules
#     'C:\\project\\node_modules',
#     'C:\\node_modules',
#     'C:\\node_modules'
#   ]
# }
```

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
