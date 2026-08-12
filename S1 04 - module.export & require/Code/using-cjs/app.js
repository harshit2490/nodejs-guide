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

const jsonData = require("./data.json"); // // importing json file

console.log("jsonData: ", jsonData);
