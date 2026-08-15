// The core pattern:
// **register a callback**
// **do other things**
// **callback fires when event occurs**
const EventEmitter = require("events");
const emitter = new EventEmitter();

// --- Event Types (Best Practices) ---
// Use descriptive event names (kebab-case is common)
emitter.on("user-registered", (user) => {
  console.log("New user registered:", user.email);
});

emitter.on("order-placed", (order) => {
  console.log("Order placed:", order.id);
});

// Emit events with payloads (data objects)
const newUser = { id: 1, email: "harshit@gmail.com", role: "admin" };
emitter.emit("user-registered", newUser);
// Output: New user registered: [EMAIL_ADDRESS]

const newOrder = { id: 101, userId: 1, amount: 99.99 };
emitter.emit("order-placed", newOrder);
// Output: Order placed: 101
