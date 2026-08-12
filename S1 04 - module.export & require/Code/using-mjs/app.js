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
