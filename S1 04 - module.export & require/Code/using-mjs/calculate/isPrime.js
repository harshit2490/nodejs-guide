export function isPrime(p) {
  console.log("inside isPrime function");
  for (var i = 2; i < p; i++) {
    if (p % i == 0) {
      return false;
    }
  }
  return true;
}
