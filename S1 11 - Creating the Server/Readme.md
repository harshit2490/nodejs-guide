<div align="center">

|                                        ← Previous                                         | [📑 Table of Contents](../README.md#part-3) |                                             Next →                                              |
| :---------------------------------------------------------------------------------------: | :-----------------------------------------: | :---------------------------------------------------------------------------------------------: |
| [Chapter 10: Thread pool in libuv](../S1%2010%20-%20Thread%20pool%20in%20libuv/Readme.md) |                                             | [Chapter 12: Databases SQL and NoSQL](../S1%2012%20-%20Databases%20SQL%20and%20NoSQL/Readme.md) |

</div>

---

# Chapter 11 — Creating the Server &nbsp;

> **Season 1** | Part III - Servers & Databases
> [🎬 Link](https://namastedev.com/learn/namaste-node/creating-a-server)

---

<a id="key-topics"></a>

### Topics Covering

> 1. [What is a Server? (Hardware vs Software)](#topic-1)
> 2. [Client-Server Architecture](#topic-2)
> 3. [Ports & Multiple Servers](#topic-3)
> 4. [Socket vs WebSocket](#topic-4)
> 5. [Creating an HTTP Server with Node.js](#topic-5)
> 6. [URL-Based Routing](#topic-6)
> 7. [From Node.js HTTP to Express](#topic-7)

---

<a id="topic-1"></a>

## 1. [What is a Server? (Hardware vs Software)](#key-topics)

The term "server" can mean two different things depending on context:

| Aspect                            | Description                                                                                                              | Example                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| **Hardware (Physical Server)**    | A physical machine (computer) with CPU, RAM, storage that provides resources to other computers (clients) over a network | A rack-mounted machine in a data center |
| **Software (Server Application)** | A program/application running on a machine that **listens for requests** and sends back responses                        | Node.js HTTP server, Apache, Nginx      |

```
When someone says "deploy your app on a server":
────────────────────────────────────────────────

  Layer 1: Hardware (Physical Machine)
      │   CPU, RAM, Storage, Network Card
      ▼
  Layer 2: Operating System (Linux/Windows)
      │   Manages hardware resources
      ▼
  Layer 3: Server Software (Node.js / Apache / Nginx)
      │   Listens for incoming requests
      ▼
  Layer 4: Your Application Code
          Handles business logic, sends responses
```

> 💡 When we say "creating a server" in Node.js, we mean creating a **software server** — a program that listens on a specific port for incoming network requests and responds to them.

---

<a id="topic-2"></a>

## 2. [Client-Server Architecture](#key-topics)

A **client** is anyone (or any device) that sends a request to a server to get data or perform an action. The most common client is a **web browser**.

```
Client-Server Request Flow:
────────────────────────────────────────────────

  ┌─────────────┐               ┌─────────────┐
  │   Client    │               │   Server    │
  │ (Browser)   │               │  (Node.js)  │
  │             │ ── Socket ──> │             │
  │ IP: x.x.x   │  Connection   │ IP: y.y.y   │
  │             │               │ Port: 3000  │
  └─────────────┘               └─────────────┘

  Step 1: Client opens a socket connection to the server
  Step 2: Client sends a request (e.g., GET /index.html)
  Step 3: Server processes the request
  Step 4: Server sends back the response (HTML, JSON, etc.)
  Step 5: Socket connection is closed

  For the next request → a NEW socket connection is created
```

### Multiple Clients

A server can handle **multiple clients simultaneously**. Each client creates its own socket connection:

```
Multiple Clients Connecting:
───────────────────────────────────────────

  Client 1 ── Socket 1 ───┐
                          │
  Client 2 ── Socket 2 ───┼──▶ Server (Node.js)
                          │     Port 3000
  Client 3 ── Socket 3 ───┘

  Each socket is independent.
  After data is received, the connection closes.
  New request = New socket connection.
```

> 💡 Every client has an **IP address**, and every server has an **IP address**. The socket connection bridges them. In Node.js, libuv handles these connections efficiently using OS-level async mechanisms (`epoll`/`kqueue`/`IOCP`) — no thread-per-connection needed (recall Chapter 10).

---

<a id="topic-3"></a>

## 3. [Ports & Multiple Servers](#key-topics)

A **port** is a number (0–65535) that identifies a specific application/server running on a machine. Think of it as a door number on a building — the IP address is the building address, and the port tells you which specific office to go to.

```
One Machine, Multiple Servers:
────────────────────────────────────────────────

  Server Machine: IP 102.209.1.3
  ┌────────────────────────────────────────┐
  │                                        │
  │  Port 3000 → Node.js App (API Server)  │
  │  Port 5432 → PostgreSQL Database       │
  │  Port 6379 → Redis Cache               │
  │  Port 8080 → Admin Dashboard           │
  │                                        │
  └────────────────────────────────────────┘

  Client request to: 102.209.1.3:3000
  → Routes to the Node.js App

  Client request to: 102.209.1.3:8080
  → Routes to the Admin Dashboard
```

| Port Range  | Category                        | Example                                                |
| ----------- | ------------------------------- | ------------------------------------------------------ |
| 0–1023      | **Well-Known Ports** (reserved) | 80 (HTTP), 443 (HTTPS), 22 (SSH)                       |
| 1024–49151  | **Registered Ports**            | 3000 (dev servers), 5432 (PostgreSQL), 27017 (MongoDB) |
| 49152–65535 | **Dynamic/Private Ports**       | Ephemeral ports assigned by OS for client connections  |

> 💡 Yes, you can create **multiple HTTP servers** on the same machine! Each one just needs a **unique port number**. The combination of `IP:Port` uniquely identifies which server a request should be routed to.

---

<a id="topic-4"></a>

## 4. [Socket vs WebSocket](#key-topics)

These are two different communication mechanisms — don't confuse them:

| Feature           | Socket (HTTP)                                                 | WebSocket                                                    |
| ----------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| **Connection**    | Short-lived — opens, sends request, receives response, closes | Persistent — stays open for continuous communication         |
| **Communication** | One-way per cycle (client asks, server responds)              | Bidirectional — both can send data at any time               |
| **Overhead**      | New connection for each request (TCP handshake every time)    | Single handshake, then continuous low-overhead frames        |
| **Use Case**      | REST APIs, loading web pages, standard HTTP requests          | Chat apps, online gaming, live dashboards, real-time updates |
| **Protocol**      | HTTP/HTTPS                                                    | ws:// or wss://                                              |

```
Socket (HTTP) — Request-Response Cycle:
────────────────────────────────────────────

  Client           Server
    │                 │
    │── CONNECT ───▶ │  (TCP handshake)
    │                 │
    │── REQUEST ───▶ │  (GET /data)
    │                 │
    │ ◀── RESPONSE ──│  (200 OK + data)
    │                 │
    │─── CLOSE ────▶ │  (Connection ends)
    │                 │
    │  Next request? New connection!
    │

WebSocket — Persistent Connection:
────────────────────────────────────────────

  Client           Server
    │                 │
    │─── UPGRADE ───▶ │  (HTTP → WebSocket handshake)
    │                 │
    │ ◀─── DATA ─────│  (Server pushes data)
    │                 │
    │──── DATA ────▶ │  (Client sends data)
    │                 │
    │ ◀─── DATA ─────│  (Server pushes again)
    │                 │
    │──── DATA ────▶ │  (Client sends again)
    │                 │
    │  Connection stays OPEN!
    │  Either side can send at any time.
```

> 💡 "Socket" in client-server communication refers to a **TCP socket** (short-lived, request-response). "WebSocket" is a **separate protocol** that upgrades an HTTP connection to a persistent, bidirectional channel. Don't confuse the two!

---

<a id="topic-5"></a>

## 5. [Creating an HTTP Server with Node.js](#key-topics)

Node.js provides the built-in `http` module to create HTTP servers. No external packages needed!

### Basic HTTP Server

```
const http = require("node:http");
const port = 999;

const server = http.createServer(function (req, res) {
  res.end("Server Created");
});

server.listen(port, () => {
  console.log("Server running on port " + port);
});
```

<details>
<summary><strong>How to Run (Click to Expand)</strong></summary>

```
# Terminal
node Server.js

# Output:
# Server running on port 999

# Now open browser:
# http://localhost:999
# You'll see: "Server Created"
```

```
What happens when you run this code:
────────────────────────────────────────────
  1. require("node:http")
     → Loads Node.js built-in HTTP module

  2. http.createServer(callback)
     → Creates an HTTP server instance
     → The callback runs for EVERY incoming request
     → callback receives: req (request), res (response)

  3. res.end("Server Created")
     → Sends the string as the response body
     → Ends the response (connection closes)

  4. server.listen(999, callback)
     → Starts listening on port 999
     → The callback runs once when server starts
     → Server is now ready to accept requests!
```

</details>

### Key Objects

| Object                  | What It Contains                           | Common Properties                                               |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `req` (IncomingMessage) | Information about the **incoming request** | `req.url`, `req.method`, `req.headers`                          |
| `res` (ServerResponse)  | Methods to build and send the **response** | `res.end()`, `res.write()`, `res.setHeader()`, `res.statusCode` |

> 💡 `http.createServer()` returns a **server object**. The callback function you pass to it is called the **request handler** — it fires for **every single HTTP request** the server receives.

---

<a id="topic-6"></a>

## 6. [URL-Based Routing](#key-topics)

You can serve different responses based on the **URL** the client requests using `req.url`:

> 📁 Practice file: [`Server.js`](./Code/Server.js)

```
const http = require("node:http");
const port = 999;

const server = http.createServer(function (req, res) {
  if (req.url === "/getSecretData") {
    res.end("You are a human and the secret so chill");
  }
  res.end("Server Created");
});

server.listen(port, () => {
  console.log("Server running on port " + port);
});
```

<details>
<summary><strong>Output (Click to View)</strong></summary>

```
Visit: http://localhost:999/
→ Response: "Server Created"

Visit: http://localhost:999/getSecretData
→ Response: "You are a human and the secret so chill"

Visit: http://localhost:999/anything-else
→ Response: "Server Created" (default fallback)
```

</details>

```
How URL Routing Works:
────────────────────────────────────────

  Incoming Request
        │
        ▼
  req.url === "/getSecretData" ?
        │
    ┌───┴────┐
   YES        NO
    │        │
    ▼        ▼
  "secret"  "Server Created"
  response   (default response)
```

> ⚠️ **Note:** In the code above, when `req.url === "/getSecretData"`, the response is sent via `res.end()`, but execution continues to the next `res.end()`. In practice, you should use `return` or `else` to prevent sending the response twice. Node.js may log a warning: "Cannot set headers after they are sent to the client."

---

<a id="topic-7"></a>

## 7. [From Node.js HTTP to Express](#key-topics)

While Node.js's built-in `http` module works for creating servers, it becomes **verbose and tedious** for real applications. Imagine writing `if/else` blocks for 50+ routes!

```
Raw Node.js HTTP (what we learned):
─────────────────────────────────────────────

  ✔ You must manually parse req.url
  ✔ You must manually set status codes
  ✔ You must manually set headers
  ✔ You must manually handle each route with if/else
  ✔ No built-in middleware, body parsing, etc.

Express (what we'll learn next):
─────────────────────────────────────────────

  ✔ Clean routing: app.get("/route", handler)
  ✔ Built-in middleware support
  ✔ Automatic header management
  ✔ Body parsing, static files, error handling
  ✔ Thousands of community middleware packages
```

**Express is a framework built on top of Node.js** that simplifies server creation. Under the hood, Express still uses the `http` module — it just provides a cleaner API on top of it.

```
// Raw Node.js HTTP (verbose)
if (req.url === "/users" && req.method === "GET") {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ users: [] }));
}

// Express (clean and simple)
app.get("/users", (req, res) => {
  res.json({ users: [] });
});
```

> 💡 Understanding the raw `http` module is essential before using Express. Express is **not magic** — it's a wrapper around the same `http.createServer()` we just learned. Knowing the fundamentals makes debugging and advanced usage much easier.

---

### Practice File

| File                            | What It Demonstrates                                                 |
| ------------------------------- | -------------------------------------------------------------------- |
| [`Server.js`](./Code/Server.js) | Basic HTTP server with URL-based routing using `http.createServer()` |

---

### Common Misconceptions

| Misconception                                   | Reality                                                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ❌ "Node.js IS the server"                      | ✅ Node.js is a **runtime environment**. You create a server **using** Node.js with the `http` module. Node.js provides the tools; your code creates the server |
| ❌ "You need Express to create a server"        | ✅ Node.js has a **built-in `http` module** that can create HTTP servers. Express is a convenience framework built **on top** of it                             |
| ❌ "A socket connection stays open forever"     | ✅ Regular HTTP sockets are **short-lived** — they close after each request-response cycle. Only **WebSockets** maintain persistent connections                 |
| ❌ "Socket and WebSocket are the same thing"    | ✅ A **socket** is a TCP connection (short-lived, request-response). A **WebSocket** is a separate protocol for persistent, bidirectional communication         |
| ❌ "Each server needs its own physical machine" | ✅ A single machine can run **multiple servers** on different ports. The **port number** distinguishes which server handles each request                        |
| ❌ "`res.end()` stops code execution"           | ✅ `res.end()` sends the response but **does NOT stop** the function. Code after it still runs. Use `return` to prevent double responses                        |
| ❌ "`localhost` means the internet"             | ✅ `localhost` (127.0.0.1) is a **loopback address** — it points to your own machine. It's only accessible from your computer, not the internet                 |

<div style="font-size: 22px; color: red">
<details>
  <summary><strong>Interview Questions (Click to View)</strong></summary>
  <div style="font-size: 0.9rem; color: black; background:#fff; border:2px solid red; border-radius: 10px;">

- **Q1: What is the difference between a hardware server and a software server?**
  - A: A **hardware server** is a physical machine (CPU, RAM, storage) that hosts applications. A **software server** is a program (like a Node.js HTTP server) that runs on that machine and handles incoming requests. When we "create a server" in Node.js, we create a software server.

- **Q2: How does `http.createServer()` work in Node.js?**
  - A: `http.createServer(callback)` creates an HTTP server instance. The `callback` function is the **request handler** — it receives two arguments: `req` (IncomingMessage with request details like URL, method, headers) and `res` (ServerResponse with methods to send data back). The handler fires for every incoming HTTP request.

- **Q3: What is the role of a port number?**
  - A: A port number (0–65535) identifies a **specific application** running on a machine. The combination of `IP:Port` uniquely routes requests to the correct server. A single machine can run multiple servers, each on a different port (e.g., 3000 for API, 5432 for database, 8080 for admin).

- **Q4: What is the difference between a Socket and a WebSocket?**
  - A: A **socket** (TCP socket) is a short-lived connection used for HTTP request-response cycles — it opens, transfers data, and closes. A **WebSocket** is a persistent, bidirectional protocol that keeps the connection open, allowing both client and server to send data at any time. WebSockets upgrade from HTTP via a handshake. Use cases: sockets for REST APIs, WebSockets for chat apps and real-time updates.

- **Q5: Why should you learn the raw `http` module before Express?**
  - A: Express is built **on top of** `http.createServer()`. Understanding the raw module helps you: (1) Debug issues that Express abstracts away, (2) Understand what Express does under the hood, (3) Build custom server logic when Express's conventions don't fit, (4) Answer interview questions about Node.js fundamentals.

- **Q6: What is `localhost` and what does it resolve to?**
  - A: `localhost` resolves to the **loopback IP address** `127.0.0.1`. It refers to **your own machine** and is only accessible locally. When you run a server on `localhost:3000`, only your computer can access it — other devices on the network cannot (unless you bind to `0.0.0.0` or your network IP).

- **Q7: What happens if you call `res.end()` more than once?**
  - A: Node.js throws a warning: "Cannot set headers after they are sent to the client." The first `res.end()` sends the response and closes the connection. Any subsequent `res.end()` calls are invalid. To prevent this, use `return res.end()` or proper `if/else` branching.

- **Q8: Can you create multiple HTTP servers in a single Node.js application?**
  - A: Yes! You can call `http.createServer()` multiple times and `listen()` on different ports. Each server instance is independent and handles its own requests. For example, one server on port 3000 for the API and another on port 3001 for health checks.

    </div>
  </details>
  </div>

### Key Takeaways

- A **server** can mean hardware (physical machine) or software (a program that handles requests) — in Node.js, we create **software servers**
- **Client-Server Architecture**: Clients open socket connections to servers, send requests, receive responses, and close the connection
- **Port numbers** (0–65535) identify which application on a machine should handle a request — `IP:Port` is the full address
- **Socket** = short-lived TCP connection for HTTP request-response. **WebSocket** = persistent bidirectional connection for real-time apps
- `http.createServer(callback)` creates a server. The `callback` receives `req` (request details) and `res` (response methods)
- `req.url` lets you implement **URL-based routing** — serve different responses for different endpoints
- `res.end()` sends the response but does **NOT** stop function execution — use `return` to prevent double responses
- **Express** is a framework built on top of the `http` module — it simplifies routing, middleware, and response handling
- Understanding raw `http` first is essential — Express is not magic, it's a convenience layer

---

<div align="center">

|                                        ← Previous                                         | [📑 Table of Contents](../README.md#part-3) |                                             Next →                                              |
| :---------------------------------------------------------------------------------------: | :-----------------------------------------: | :---------------------------------------------------------------------------------------------: |
| [Chapter 10: Thread pool in libuv](../S1%2010%20-%20Thread%20pool%20in%20libuv/Readme.md) |                                             | [Chapter 12: Databases SQL and NoSQL](../S1%2012%20-%20Databases%20SQL%20and%20NoSQL/Readme.md) |

</div>
