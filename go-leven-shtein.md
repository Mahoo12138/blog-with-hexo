---
title: Golang 计算 Levenshtein 距离
date: 2023-03-05 10:10:13
author: Mahoo12138
tags: 
- Golang
categories:
- 算法学习
---

## 简介

**莱文斯坦距离**，又称 **Levenshtein 距离**，是[编辑距离](https://zh.wikipedia.org/wiki/編輯距離)的一种。指两个字串之间，由一个转成另一个所需的最少编辑操作次数。常用于在命令行程序中，对错误的输入进行检测纠正，如 git ：

```bash
$ git statux
$ git: 'statux' is not a git command. See 'git --help'.

The most similar command is
        status
```

除此之外，其他主要的应用场景有：`DNA`分析，语音识别，抄袭侦测等。

允许的编辑操作包括：

1. 将一个字符替换成另一个字符
2. 插入一个字符
3. 删除一个字符

将“kitten”一字转成“sitting”的莱文斯坦距离为 3：

1. **k**itten → **s**itten （k→s）
2. sitt**e**n → sitt**i**n （e→i）
3. sittin → sittin**g** （插入g）

俄罗斯科学家[弗拉基米尔·莱文斯坦](https://zh.wikipedia.org/w/index.php?title=弗拉基米尔·莱文斯坦&action=edit&redlink=1)在1965年提出这个概念。

如果分别用 $\left| a \right|$ 和 $\left| b \right|$表示 a，b 两个字符串的长度，那么它们的列文斯坦距离为 ${\rm{le}}{{\rm{v}}_{a,b}}(\left| a \right|,\left| b \right|)$ ，它符合：
$$
{{\rm{lev}}_{a,b}}(i,j) = \left\{ {\begin{array}{@{}l*{20}{c}}
{\begin{array}{@{}l*{20}{c}}
{\max (i,j)} &&&&&&&&&&&\ \  {{\rm{if}}\min (i,j)=0}
\end{array}}\\
{\begin{array}{*{20}{c}}
{\min \left\{ {\begin{array}{@{}l*{20}{c}}
{{{\rm{lev}}_{a,b}}(i - 1,j) + 1}\\
{{{\rm{lev}}_{a,b}}(i,j - 1) + 1}\\
{{{\rm{lev}}_{a,b}}(i - 1,j - 1) + {1_{({a_i} \ne {b_j})}}}
\end{array}} \right.} & {{\rm{otherwise}}{\rm{.}}}
\end{array}}
\end{array}} \right.
$$
$1_{({a_i} \ne {b_j})}$ 是一个[指示函数](https://zh.wikipedia.org/wiki/指示函数)（**indicator** **function**），当 $({a_i} \ne {b_j})$时，其值为 0，其他时候它等于 1 。

${{\rm{lev}}_{a,b}}(i,j)$ 表示 $a$ 的前 $i$ 个字符与 $b$ 的前 $j$ 个字符之间的列文斯坦距离。（ $i$ 和 $j$ 都是从1 开始的下标)。

注意：$\rm{min}$ 运算中的第一个公式代表（ 从 $a$  中）删除字符（以到达  $b$ ）；第二个公式代表插入字符；第三个代表替换（取决于当前字符是否相同)。

## 详解

当两个字符串中某一个长度为 0 时，另一个无论填充还是删除，距离都是取其长度，也就是两个字符串长度的最大值；

当两个字符串都不为空串时，取以下三种情况的最小值：

1. 将字符串 $a$ 的第 $i$ 个字符删除，计算与 b 串的距离：${\rm{lev}}_{a,b}(i - 1,j) + 1$，使得它与第二个字符串中的一个字符相匹配；这里加一，是因为，a 串与删除后的子串与 b 串分别计算距离，差值仅为 1，即表示执行了一次删除操作；
2. 将一个字符插入到字符串 $a$ 的第 $i$ 个位置，计算与 b 串的距离：${{\rm{lev}}_{a,b}}(i,j - 1) + 1$，加 1 表示执行了一次插入操作；
3. 将字符串 $a$ 的第 $i$ 个字符替换成字符串 $b$ 的第 $j$ 个字符，计算距离：${{{\rm{lev}}_{a,b}}(i - 1,j - 1) + {1_{({a_i} \ne {b_j})}}}$，仅当删除的字符不相同才加一，因为不同的话，还需要一次替换操作；

Levenshtein 距离的数值包含几个上下界限：

- 距离最小是两个字符串之间的长度的差值；
- 距离最大是两个字符串中较长字符串的长度；
- 当且仅当字符串相同时长度为 0；
- 当字符串的长度相同时，距离的最大长度是[汉明距离](https://zh.wikipedia.org/wiki/汉明距离)（Hamming distance）；
- 两个字符串之间的距离小于等于与另外一个字符串距离之和（三角形等式 a+b<c）；

## 实现

### 递归实现

```go
package main

import (
	"fmt"
)

func main() {
	word1 := "kitten"
	word2 := "sitting"
	distance := levenshteinDistance(word1, word2)
	fmt.Printf("Levenshtein distance between %s and %s is %d\n", word1, word2, distance)
}

func levenshteinDistance(s, t string) int {
	if len(s) == 0 {
		return len(t)
	}
	if len(t) == 0 {
		return len(s)
	}

	if s[0] == t[0] {
		return levenshteinDistance(s[1:], t[1:])
	}

	insert := levenshteinDistance(s, t[1:])
	delete := levenshteinDistance(s[1:], t)
	replace := levenshteinDistance(s[1:], t[1:])

	min := insert
	if delete < min {
		min = delete
	}
	if replace < min {
		min = replace
	}

	return min + 1
}

```



1. 插入操作（Insertion）：将一个字符插入到第一个字符串中，使得它与第二个字符串中的一个字符相匹配。这可以通过在第一个字符串中插入一个字符来实现。在公式中表示为 $d_{i, j-1}+1$，其中 $d_{i, j-1}$ 表示第一个字符串中到第 $i$ 个字符为止，第二个字符串中到第 $j-1$ 个字符为止的距离，加 1 表示执行了一次插入操作。
2. 删除操作（Deletion）：从第一个字符串中删除一个字符，使得它与第二个字符串中的一个字符相匹配。这可以通过删除第一个字符串中的一个字符来实现。在公式中表示为 $d_{i-1, j}+1$，其中 $d_{i-1, j}$ 表示第一个字符串中到第 $i-1$ 个字符为止，第二个字符串中到第 $j$ 个字符为止的距离，加 1 表示执行了一次删除操作。
3. 替换操作（Substitution）：将第一个字符串中的一个字符替换为另一个字符，使得它与第二个字符串中的一个字符相匹配。这可以通过在第一个字符串中替换一个字符来实现。在公式中表示为 $d_{i-1, j-1}+cost$，其中 $d_{i-1, j-1}$ 表示第一个字符串中到第 $i-1$ 个字符为止，第二个字符串中到第 $j-1$ 个字符为止的距离，$cost$ 表示替换的代价，如果第一个字符串中第 $i$ 个字符和第二个字符串中第 $j$ 个字符相同，则 $cost$ 为 0，否则 $cost$ 为 1。

迭代实现：

```go
func levenshteinDistance(s, t string) int {
    // initialize the matrix
    m := make([][]int, len(s)+1)
    for i := range m {
        m[i] = make([]int, len(t)+1)
        m[i][0] = i
    }
    for j := 1; j <= len(t); j++ {
        m[0][j] = j
    }

    // fill in the matrix
    for i := 1; i <= len(s); i++ {
        for j := 1; j <= len(t); j++ {
            var substitutionCost int
            if s[i-1] == t[j-1] {
                substitutionCost = 0
            } else {
                substitutionCost = 1
            }
            deletionCost := m[i-1][j] + 1
            insertionCost := m[i][j-1] + 1
            substitutionOrMatchCost := m[i-1][j-1] + substitutionCost
            m[i][j] = min(deletionCost, insertionCost, substitutionOrMatchCost)
        }
    }

    // return the bottom-right element
    return m[len(s)][len(t)]
}

func min(x, y, z int) int {
    if x < y {
        if x < z {
            return x
        }
        return z
    }
    if y < z {
        return y
    }
    return z
}
```

+ [浅谈Levenshtein Distance莱文斯坦距离算法 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/507830576)
+ [Levenshtein Distance（编辑距离）算法与使用场景 - throwable - 博客园 (cnblogs.com)](https://www.cnblogs.com/throwable/p/12445082.html#levenshtein-distance公式定义)
