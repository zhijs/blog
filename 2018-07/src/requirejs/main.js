// 使用
require.config({
  baseUrl: './',
  paths: {
    'add': 'math'
  }
});

require(['math'], function(math) {
  console.log(math.add(2, 3))
});