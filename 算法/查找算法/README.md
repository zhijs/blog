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
### 有序二维数组查找
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
target 目标元素先和第一行最后一个比较，如果 target 较大，则第一行排除，此时 行数 ++， 如果 target 较小，则该列排除，此时 列数 ++
直到行数达到最大，或者列数到达第一列，或者找到元素结束。  

- 实现
```javascript
function 2ArrayFind(arr, target) {
  let row_num = arr.length;
  let colum_num = arr[0].length
  let cur_row = 0
  let cur_colum = colum_num - 1
  let flag = false
  while (cur_row <= row_num - 1 && cur_colum >= 0) {
    let endValue = arr[cur_row][cur_colum]
    if (endValue < target) {
      cur_row ++  
    }else if(endValue > target) {
      cur_colum --
    } else {
      flag  =true
      break  
    }
  }
  return flag
}
```
