// 使用
console.log(document.currentScript);
require.config({
  baseUrl: './',
  paths: {
    'square': 'square'
  }
});

require(['square'], function(math) {
  console.log(square(6, 3))
});