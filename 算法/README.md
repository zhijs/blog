### 链表倒序输出
- 思路
从头遍历链表，压栈，最后弹栈。

```javascript
function ListNode(x){
    this.val = x;
    this.next = null;
}

function backList (head) {
  let stack = []
  let temp = head
  while (temp) {
    stack.push(temp.val)
    temp = temp.next  
  }
  for (stack.length) {
    console.log(stack.pop())  
  }
}
```

### 链表反转
- 思路
从头遍历，逐个反转, 需要三个变量

```javascript
function ReverseList(pHead)
{
  if (!pHead) {
    return null    
  }
  if (!pHead.next) {
    return pHead    
  }
   let left = pHead
   let middle = pHead.next
   let right = middle.next
   left.next = null
   while(right) {
     middle.next = left
     left = middle
     middle = right
     right = right.next
   }
    middle.next = left
    return middle
}
```

### 排序链表合并(合并后的链表也是排序的)
- 思路
假设 链表1: 1->3->5->7, 链表2：2->4->6->8
则：
1. 链表中头结点较小的作为起始节点即是 1
2. 下一个节点为 2 和 3 中较小节点，即是 2, 1->2
3. 下一个节点为 3 和 4 中较小节点，即是 3，1->2->3
4. 重复上述步骤知道一个链表为空

```javascript
/*function ListNode(x){
    this.val = x;
    this.next = null;
}*/
function Merge(pHead1, pHead2)
{
    // write code here
    if (pHead1 === null) {
      return pHead2    
    }
    if (pHead2 === null) {
      return pHead1   
    }
    let newHead = null
    // newHead 用于最后输出
    newHead = pHead1.val > pHead2.val ? pHead2 : pHead1

    // preNode 用于保存上一个排序的节点
    let preNode = pHead1.val > pHead2.val ? pHead2 : pHead1

    // pTemp1 和 pTemp2 用于保存需要比较的两个节点
    let pTemp1 = pHead1
    let pTemp2 = pHead2
    if (newHead === pTemp1) {
      pTemp1 = pHead1.next   
    } else {
      pTemp2 = pHead2.next
    }
    while(pTemp1 && pTemp2) {
        if (pTemp1.val > pTemp2.val) {
          preNode.next = pTemp2
          preNode = pTemp2
          pTemp2 = pTemp2.next
        } else {
          preNode.next = pTemp1
          preNode = pTemp1
          pTemp1 = pTemp1.next 
        }  
    }
    // 某个链表较短的情况
    if (!pTemp1) {
      preNode.next = pTemp2    
    } else if (!pTemp2) {
      preNode.next = pTemp1   
    }
    return newHead
}
```

### 二叉树的前序遍历
- 思路
用队列实现，eg:
```javascript

/**
    1
   / \
  2   3
 / \  / \
4  5  6  7

 1. 队列 [1]
 2. 队列的节点 [1] 出队, 输出 1，并将 节点 1 的左右节点入队 [3, 2]
 3. 队列节点 2 出队，输出 2， 并将节点 2 的左右节点入队 [5, 4, 3]
 4. 队列节点 3 出队，输出 3，并将节点 3 的左右节点入队 [7, 6, 5, 4, 3]
 ......
 直到 队列为空
*/

 if (!root) {
      return []
    }
    let ret = []
    let queque = [root]
    while(queque.length) {
      let node = queque.pop()
      ret.push(node.val)
      if (node.left) {
        queque.unshift(node.left)    
      }
      if (node.right) {
        queque.unshift(node.right)    
      }
    }
    return ret
```


### 二叉树最大最小深度计算
```javascript
// 递归
function maxDepth(root) {
  if (!root) {
    return 0    
  }
  return 1 + Math.max(maxDepth(root.left),maxDepth(root.right))
}

// 广度优先搜索
function getMaxDepth(pRoot) {
   let arr = [pRoot]
    let depth = 0
    while (arr.length) {
      let len = arr.length
      if (len) {
        depth++  
      }
      let child = []
      for (let i = 0; i < len; i++) {
        let node = arr.pop()
        if (node.left) {
          child.push(node.left)
        }
        if (node.right) {
          child.push(node.right)      
        }
      }
      arr.push(...child)
    }
    return depth  
}
```

### 二叉树查询指定的大小的路径
- 思路
对于查询路径方面的，最好可以从栈方面考虑，其次是递归

下题是给定二叉树，打印出二叉树中结点值的和为输入整数的所有路径

通过栈 + 元素是否被访问来进行遍历。

eg:
```javascript
/*
    1
   / \
  2   3
 / \  / \
4  5  6  3

找出改二叉树的节点和为 7 的所有路径，从图上可以看出，和为 7 的路径有:
[1, 2, 5], [1, 3, 3]

那么我们通过栈来找出这些路经
1. 首先从根节点到左子树入栈
[
 4
 2
 1
]

此时，4 没有左子树和右子树，即为叶子节点，计算该路径的值，发现是 7 符合

2. 4 退栈，并设置为已访问 node4.visited = true, 防止再次进入 4 节点

3. 此时栈顶为 2 元素，尝试访问左子树，发现被 visited, 访问右子树 节点 5，发现是叶子节点，再次形成一个路径，计算值，并设置为 visited;

4. 节点 5 退栈，栈顶为 2， 尝试访问右子树，发现被 visited, 尝试访问左子树，发现被 visited, 此时 2 退栈

.... 依次类推

**/
```
```javascript
function FindPath(root, expectNumber)
{
    // write code here
    if (!root) {
      return []
    }
    var result = []
    var stack = [root]
    while(stack.length) {
     let node = stack[stack.length - 1]
     if (node.left && !node.left.visited) {
       stack.push(node.left)    
     } else if (node.right && !node.right.visited) {
       stack.push(node.right)
     } else if(!node.left && !node.right){ // 到达叶子节点
       let sum = 0
       var list = stack.map((node) => {
         // 设置叶子节点为被计算过的，防止重复进入计算
         sum = sum + node.val
         return node.val
       })
       stack[stack.length - 1].visited = true
       if (sum === expectNumber) {
         result.push(list)    
       }
       // 回退一个节点
       stack.pop()
     } else {
       // 回退一个节点
       stack[stack.length - 1].visited = true
       stack.pop()
     }
    }
    return result
}
```






