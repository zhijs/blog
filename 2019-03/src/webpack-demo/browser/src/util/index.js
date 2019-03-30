var {helloLog} = require('./log')

exports.add = function (a, b) {
  helloLog(`index ${a} + ${b}`)
  return a +　b;
}

// exports.decrease = function(a, b) {
//   return a - b;
// }