---
title: 选择排序
---
## 概述

选择排序作为一种基础的比较排序算法，其思想早在计算机科学初期（20 世纪 50 年代）就被广泛使用。它**没有单一的明确发明者**，而是算法设计中自然形成的方法。名称源于算法重复"选择"最小（或最大）元素的特性。

虽然时间复杂度为 O(n²)，但因其**实现简单、交换次数少**（最多 n-1 次交换），在内存写入成本高的场景（如闪存）仍有应用价值。后续改进包括**堆排序**（利用堆结构优化选择过程）和**锦标赛排序**等变体。



## **核心思想**

1. **分区概念**：将数组分为**已排序区**（左）和**未排序区**（右）
2. **查找极值**：遍历未排序区，找到最小元素（升序）
3. **交换位置**：将找到的最小元素与未排序区的第一个元素交换
4. **边界移动**：将已排序区向右扩展一个位置
5. **重复执行**：重复上述过程直到整个数组有序



## 代码实现

```typescript
function selectionSort(arr: number[]): number[] {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        // 1. 在未排序区查找最小值索引
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // 2. 将最小值交换到未排序区开头
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
        // 此时 arr[0..i] 已排序
    }
    return arr;
}
```

## 复杂度分析

| 条件     | 时间复杂度 | 空间复杂度 | 稳定性 |
| -------- | ---------- | ---------- | ------ |
| 最好情况 | 𝑂(n²)      | 𝑂(1)       | 不稳定 |
| 平均情况 | 𝑂(n²)      | 𝑂(1)       | 不稳定 |
| 最坏情况 | 𝑂(n²)      | 𝑂(1)       | 不稳定 |

- 每次都要遍历整个未排序部分找最小值，共需 $n(n - 1)/2$ 次比较。
- 交换次数为 `O(n)`，少于冒泡排序。
- 不是稳定排序：交换可能改变相等元素的顺序。

## 扩展变体

### 稳定选择排序

+ 通过在找到最小元素后**插入**而非交换，保持相等元素的顺序，避免破坏稳定性。

+ 插入方式需向右移动中间元素，代价是时间。

```typescript
function stableSelectionSort(arr: number[]): number[] {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        const minValue = arr[minIndex];

        // 将最小值插入到位置 i，其他元素右移
        for (let k = minIndex; k > i; k--) {
            arr[k] = arr[k - 1];
        }

        arr[i] = minValue;
    }

    return arr;
}
```

### 双向选择排序

- 每轮同时选出最小值与最大值，分别放置两端，减少轮数。
- 从 n 轮降至约 n/2 轮。

```typescript
function bidirectionalSelectionSort(arr: number[]): number[] {
    let start = 0;
    let end = arr.length - 1;

    while (start < end) {
        let minIndex = start;
        let maxIndex = start;

        for (let i = start; i <= end; i++) {
            if (arr[i] < arr[minIndex]) {
                minIndex = i;
            }
            if (arr[i] > arr[maxIndex]) {
                maxIndex = i;
            }
        }

        // 将最小值放到起始位置
        if (minIndex !== start) {
            [arr[start], arr[minIndex]] = [arr[minIndex], arr[start]];
            // 如果最大值被换走了，更新其索引
            if (maxIndex === start) maxIndex = minIndex;
        }

        // 将最大值放到结束位置
        if (maxIndex !== end) {
            [arr[end], arr[maxIndex]] = [arr[maxIndex], arr[end]];
        }

        start++;
        end--;
    }

    return arr;
}
```

### 递归选择排序

- 每轮递归地寻找最小元素，置于首位。
- 教学意义大于性能。

```typescript
function recursiveSelectionSort(arr: number[], start: number = 0): number[] {
    const n = arr.length;

    if (start >= n - 1) return arr;

    let minIndex = start;
    for (let i = start + 1; i < n; i++) {
        if (arr[i] < arr[minIndex]) {
            minIndex = i;
        }
    }

    if (minIndex !== start) {
        [arr[start], arr[minIndex]] = [arr[minIndex], arr[start]];
    }

    return recursiveSelectionSort(arr, start + 1);
}
```

