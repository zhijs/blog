// 使用
console.log(document.currentScript);

require(['square'], function(square) {
  console.log(square(6, 3))
});