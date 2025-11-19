---
title: JavaScript 初始化二维数组的陷阱
date: 2025-05-28 19:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags:
  - JavaScript
---

## 问题场景

最近写 TypeScript 时，需要初始化一个二维数组。比如在实现"矩阵置零"算法时，你可能写过类似这样的代码：

```typescript
const row = 3;
const col = 3;
const matrix_copy: number[][] = new Array(row).fill([]);
```

这段代码看似合理，但实际上存在一个**隐藏的陷阱**：所有子数组都是**同一个数组的引用**！

## 问题分析

当你使用 `new Array(row).fill([])` 时：

1. `[]` 只被创建一次
2. 这个空数组的引用被复制到二维数组的每个位置
3. 修改 `matrix_copy[0][0]` 会同时影响 `matrix_copy[1][0]`，`matrix_copy[2][0]` 等

我首先实现的暴力算法，也就是 O(mn) 的空间复杂度，需要拷贝一个原矩阵。初始化数组都是同一个引用，导致了后续的赋值都错乱，且把 0 都覆盖了，结果最后输出的矩阵中全是 1 😄。

## 解决方案

### 方法 1：使用 `Array.from`

```typescript
const matrix_copy = Array.from({ length: row }, () => []);
```

- `Array.from` 会为每个元素执行回调函数
- 每次执行 `() => []` 都会创建一个新的空数组

### 方法 2：使用 `map`

```typescript
const matrix_copy = new Array(row).fill(null).map(() => []);
```

- 先用 `null` 填充数组
- 然后通过 `map` 为每个元素创建新数组

## 实际应用

在矩阵算法中，正确的初始化方式应该是：

```typescript
export const violent = (matrix: number[][]) => {
  const row = matrix.length;
  const col = matrix[0].length;
  // 正确初始化二维数组
  const matrix_copy = Array.from({ length: row }, () => new Array(col));

  // 复制矩阵
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < col; j++) {
      matrix_copy[i][j] = matrix[i][j];
    }
  }
  // ...其他逻辑
};
```

## 总结

在 JavaScript/TypeScript 中初始化二维数组时：

1. 避免使用 `fill([])`，因为它会共享引用
2. 推荐使用 `Array.from` 或 `map` 方法
3. 确保每个子数组都是独立的新实例
