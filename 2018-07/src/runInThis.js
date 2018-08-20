const vm = require('vm');
let result = vm.runInThisContext(`(function (exports, require, modules, __filename, __dirname) {
  exports.add = function (a, b) { 
    return a + b;
  }
})`, { filename: 'runInThis', lineOffset: 0 })
console.log(result.toString())