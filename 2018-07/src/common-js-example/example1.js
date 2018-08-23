var obj = {
  a: 1
}
function incCounter() {
  obj.a = obj.a + 1;
}
module.exports = {
  obj: obj,
  incCounter: incCounter,
};