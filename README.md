# 🚀 The Complete Node.js Guide — Beginner to Advanced

> A deep, chapter-wise reference for mastering **Node.js** concepts. Every concept ships with a concise definition, interview Q&A, and code. Based on the Namaste Node.js series by Akshay Saini.

![Node.js](https://img.shields.io/badge/Node.js-green?style=for-the-badge&logo=node.js&logoColor=white)
![Interview](https://img.shields.io/badge/Interview-Ready-4CAF50?style=for-the-badge)
![Seasons](https://img.shields.io/badge/Seasons-3-13C3FF?style=for-the-badge)
![Chapters](https://img.shields.io/badge/Chapters-35-FF6B6B?style=for-the-badge)

---

## 📑 Table of Contents

## 🎬 Season 1 — Node.js Core

<a id="part-1"></a>

#### Part I — Node.js Fundamentals & Modules

| #   | Chapter                                                                            | Key Concepts                                                                                    |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | [Introduction to NodeJs](./S1%2001%20-%20Introduction%20to%20NodeJs/Readme.md)     | What is Node.js, History, Use cases, Why Node.js, V8 Engine introduction                        |
| 2   | [JS on the Server](./S1%2002%20-%20JS%20on%20the%20Server/Readme.md)               | Browser vs Server JS, Global object, Running JS files via terminal                              |
| 3   | [Writing First Code](./S1%2003%20-%20Writing%20First%20Code/Readme.md)             | Creating and executing JS files in Node.js, REPL, Basic console logs                            |
| 4   | [module.export & require](./S1%2004%20-%20module.export%20%26%20require/Readme.md) | CommonJS modules, `module.exports`, `require()` function, local vs core modules, module caching |

<a id="part-2"></a>

#### Part II — Node.js Architecture & Internals

| #   | Chapter                                                                                                    | Key Concepts                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 5   | [Diving into NodeJs Repo](./S1%2005%20-%20Diving%20into%20NodeJs%20Repo/Readme.md)                         | Exploring Node.js source code, C++ bindings, core modules implementation                                            |
| 6   | [libuv & async IO](./S1%2006%20-%20libuv%20%26%20async%20IO/Readme.md)                                     | What is libuv, Asynchronous I/O, Event-driven architecture, Non-blocking I/O                                        |
| 7   | [sync, async, setTimeout Zero-Code](./S1%2007%20-%20sync%2C%20async%2C%20setTimeout%20Zero-Code/Readme.md) | Synchronous vs Asynchronous code, Call stack, `setTimeout` execution flow in Node.js                                |
| 8   | [Deep dive into v8 JS Engine](./S1%2008%20-%20Deep%20dive%20into%20v8%20JS%20Engine/Readme.md)             | V8 architecture, JIT compilation, Garbage collection, Ignition and TurboFan                                         |
| 9   | [libuv and event loop](./S1%2009%20-%20libuv%20and%20event%20loop/Readme.md)                               | Node.js Event Loop phases (Timers, Pending Callbacks, Idle/Prepare, Poll, Check, Close Callbacks), Microtask queues |
| 10  | [Thread pool in libuv](./S1%2010%20-%20Thread%20pool%20in%20libuv/Readme.md)                               | UV_THREADPOOL_SIZE, Worker threads for heavy tasks (Crypto, File System, DNS, Zlib)                                 |

<a id="part-3"></a>

#### Part III — Servers & Databases

| #   | Chapter                                                                                            | Key Concepts                                                                                              |
| --- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 11  | [Creating the Server](./S1%2011%20-%20Creating%20the%20Server/Readme.md)                           | `http` module, `createServer`, Request and Response objects, listening on ports                           |
| 12  | [Databases SQL and NoSQL](./S1%2012%20-%20Databases%20SQL%20and%20NoSQL/Readme.md)                 | SQL vs NoSQL differences, Document-based vs Relational databases, Use cases for MongoDB vs PostgreSQL     |
| 13  | [Creating a database & mongodb](./S1%2013%20-%20Creating%20a%20database%20%26%20mongodb/Readme.md) | Setting up MongoDB, Collections and Documents, Connecting Node.js to MongoDB using native driver/mongoose |

---

## 🎬 Season 2 — Building a Real Project

<a id="part-4"></a>

#### Part IV — Project Setup & Architecture

| #   | Chapter                                                                                                                                            | Key Concepts                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 14  | [Microservices vs Monolith - How to build a Project](./S2%2014%20-%20Microservices%20vs%20Monolith%20-%20How%20to%20build%20a%20Project/Readme.md) | Monolithic vs Microservices architecture, Pros and Cons, Choosing architecture for projects |
| 15  | [Features HLD LLD and Planning](./S2%2015%20-%20Features%20HLD%20LLD%20and%20Planning/Readme.md)                                                   | High Level Design (HLD), Low Level Design (LLD), System design basics, Project scoping      |

<a id="part-5"></a>

#### Part V — Express & Middleware

| #   | Chapter                                                                                          | Key Concepts                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| 16  | [Creating Our Express Server](./S2%2016%20-%20Creating%20Our%20Express%20Server/Readme.md)       | Setting up Express.js, `app.listen()`, Express vs Core `http`, Basic setup                                          |
| 17  | [Routing and Request Handlers](./S2%2017%20-%20Routing%20and%20Request%20Handlers/Readme.md)     | Express Router, Route parameters (`req.params`), Query strings (`req.query`), HTTP Methods (GET, POST, PUT, DELETE) |
| 18  | [Middlewares and Error Handlers](./S2%2018%20-%20Middlewares%20and%20Error%20Handlers/Readme.md) | `app.use()`, Next function (`next()`), Global middlewares, Error-handling middlewares (`err, req, res, next`)       |

<a id="part-6"></a>

#### Part VI — Data Modeling & APIs

| #   | Chapter                                                                                                                | Key Concepts                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 19  | [Database Schema Models and Mongoose](./S2%2019%20-%20Database%20Schema%20Models%20and%20Mongoose/Readme.md)           | Mongoose introduction, Schemas, Models, `mongoose.connect()`, Default values                    |
| 20  | [Diving into APIs](./S2%2020%20-%20Diving%20into%20APIs/Readme.md)                                                     | RESTful API principles, CRUD operations, Sending JSON responses, Status codes                   |
| 21  | [Data Sanitization and Schema Validations](./S2%2021%20-%20Data%20Sanitization%20and%20Schema%20Validations/Readme.md) | Validating inputs, Mongoose built-in validators, Custom validators, Sanitizing request payloads |

<a id="part-7"></a>

#### Part VII — Security & Authentication

| #   | Chapter                                                                                              | Key Concepts                                                                      |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 22  | [Encrypting Passwords](./S2%2022%20-%20Encrypting%20Passwords/Readme.md)                             | bcrypt, Hashing vs Encryption, Salt rounds, Mongoose `pre('save')` hooks          |
| 23  | [Authentication, JWT and Cookies](./S2%2023%20-%20Authentication%2C%20JWT%20and%20Cookies/Readme.md) | JSON Web Tokens (JWT), Access vs Refresh tokens, Cookie parsing, Auth middlewares |

<a id="part-8"></a>

#### Part VIII — Advanced APIs, Queries & Pagination

| #   | Chapter                                                                                                                           | Key Concepts                                                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 24  | [Diving into the APIs and Express Router](./S2%2024%20-%20Diving%20into%20the%20APIs%20and%20Express%20Router/Readme.md)          | Express Router deep dive, separating routes, modular API structure                |
| 25  | [Logical DB Query and Compound Indexes](./S2%2025%20-%20Logical%20DB%20Query%20and%20Compound%20Indexes/Readme.md)                | MongoDB logical operators ($and, $or), Compound Indexes, query optimization       |
| 26  | [ref, Populate and Thought Process](./S2%2026%20-%20ref%2C%20Populate%20and%20Thought%20Process%20of%20Writing%20API's/Readme.md) | Mongoose `populate()`, referencing other collections, API design thought process  |
| 27  | [Building Feed API and Pagination](./S2%2027%20-%20Building%20Feed%20API%20and%20Pagination/Readme.md)                            | `skip()` and `limit()`, implementing pagination, building scalable feed endpoints |

<a id="part-9"></a>

#### Part IX — Frontend & UI Development

| #   | Chapter                                                                      | Key Concepts                                                               |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 28  | [DevTinder UI Part-I](./S2%2028%20-%20DevTinder%20UI%20Part-I/Readme.md)     | Frontend setup, React/Vite basics, UI architecture, initial project layout |
| 29  | [DevTinder UI Part-II](./S2%2029%20-%20DevTinder%20UI%20Part-II/Readme.md)   | Routing in React, state management, building core components               |
| 30  | [DevTinder UI Part-III](./S2%2030%20-%20DevTinder%20UI%20Part-III/Readme.md) | API integration, fetching data from backend, handling loading/error states |
| 31  | [DevTinder UI Part-IV](./S2%2031%20-%20DevTinder%20UI%20Part-IV/Readme.md)   | User authentication on frontend, protected routes, JWT storage             |
| 32  | [DevTinder UI Part-V](./S2%2032%20-%20DevTinder%20UI%20Part-V/Readme.md)     | Polishing UI, advanced state, final features and end-to-end integration    |

---

## 🎬 Season 3 — Production & Deployment

<a id="part-10"></a>

#### Part X — Cloud & Deployment

| #   | Chapter                                                                                                                            | Key Concepts                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 33  | [Launching AWS Instance and deploying frontend](./S3%2033%20-%20Launching%20AWS%20Instance%20and%20deploying%20frontend/Readme.md) | AWS EC2 basics, security groups, SSH access, building and deploying React app  |
| 34  | [Nginx and backend Node App Development](./S3%2034%20-%20Nginx%20and%20backend%20Node%20App%20Development/Readme.md)               | Reverse proxy with Nginx, PM2 process manager, running Node.js in background   |
| 35  | [Adding a Custom Domain Name](./S3%2035%20-%20Adding%20a%20Custom%20Domain%20Name/Readme.md)                                       | DNS records (A/CNAME), Route53/Cloudflare, configuring Nginx for custom domain |

---

<div align="center">

### 🎉 You've completed the Node.js journey!

Generated with ❤️ for Node.js developers — happy coding!

</div>
