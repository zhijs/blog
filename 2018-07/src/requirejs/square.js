define([
  './add',
  './decrease'
], function(add, decrease) {
   let square = function (a, b) {
     return add(a, b) * decrease(a, b);
   }
   return square;
});