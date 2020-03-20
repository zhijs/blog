### 二分查找
- 条件
排序好的数组

- 思路
通过每次取中间元素和目标元素对比，判断元素所在的区间，持续缩小区间，直到结束。

- 实现
```javascript
function binarySearch(arr, tar) {
  const len = arr.length
  const mid = Math.floor(len/2) // 注意这里必须要 floor, 因为当 len = 1, 的时候， fllor 才能得到该元素
  if (tar < arr[0] || tar > arr[len -1]) {
    return false  
  } else if (tar > arr[mid]) {
    return binarySearch(arr.slice(mid),tar)
  } else if(tar < arr[mid]) {
    return binarySearch(arr.slice(0, mid), tar) 
  } 
  return true
} 
```
### 二维数组二分查找
- 条件 
二维数组从左到右，从上到下的为有序
eg:
```javascript
[
  [1, 3, 5],
  [2, 4, 6],
  [3, 5, 7]
]
```
- 思路
二分二维数组对角线元素

- 实现
```javascript
function binarySearch2(arr, target) {
  
}
```






