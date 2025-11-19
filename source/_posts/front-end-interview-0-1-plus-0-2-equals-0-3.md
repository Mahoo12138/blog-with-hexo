---
title: 一道前端面试题：如何判断 0.1 + 0.2 与 0.3 相等？
date: 2025-06-28 23:12:32
tags: ["JavaScript", "IEEE754"]
---

## 前言

在 JavaScript 中，有一个经典的前端面试题：**为什么 0.1 + 0.2 不等于 0.3？** 如果你尝试在控制台中输入以下代码：

```javascript
console.log(0.1 + 0.2 === 0.3); // false
console.log(0.1 + 0.2); // 0.30000000000000004
```

你会惊讶地发现结果是`false`！这个看似简单的计算却揭示了计算机科学中一个深层次的问题——**浮点数精度问题**。

这个问题不仅存在于 JavaScript 中，几乎所有使用 IEEE 754 浮点数标准的编程语言都会遇到：

```javascript
// JavaScript
console.log(0.1 + 0.2); // 0.30000000000000004

// Python
# 0.1 + 0.2 = 0.30000000000000004

// Java
// 0.1 + 0.2 = 0.30000000000000004
```

本文将带你深入探讨这个问题的本质，并提供专业级的解决方案。

## 问题根源：IEEE 754 浮点数标准

ECMAScript 中的 Number 类型使用 **IEEE754** 标准来表示整数和浮点数值。所谓 IEEE754 标准，全称 IEEE 二进制浮点数算术标准，这个标准定义了表示浮点数的格式等内容。

在 IEEE754 中，规定了四种表示浮点数值的方式：单精确度（32 位）、双精确度（64 位）、延伸单精确度、与延伸双精确度。像 ECMAScript 采用的就是双精确度，也就是说，会用 64 位来储存一个浮点数。

### 二进制表示基础

要理解 IEEE 754 浮点数的存储机制，我们首先需要了解十进制数是如何被转换为二进制。IEEE 754 标准的核心就是将数值转换为二进制形式，然后按照特定的格式存储。

#### 整数转二进制

首先看一个简单的例子：1020 转二进制

```
1020 = 1×2^9 + 1×2^8 + 1×2^7 + 1×2^6 + 1×2^5 + 1×2^4 + 1×2^3 + 1×2^2 + 0×2^1 + 0×2^0
     = 512 + 256 + 128 + 64 + 32 + 16 + 8 + 4 + 0 + 0
     = 1020
```

所以 1020 的二进制表示为：`1111111100`。

#### 小数转二进制：0.75 的精确表示

0.75 转二进制的推导过程：

```
0.75 = a×2^(-1) + b×2^(-2) + c×2^(-3) + d×2^(-4) + ...
```

其中 a、b、c、d...只能是 0 或 1。

**推导步骤：**

1. **第一步：** 0.75 × 2 = 1.5

   - 整数部分：1 → a = 1
   - 小数部分：0.5

2. **第二步：** 0.5 × 2 = 1.0
   - 整数部分：1 → b = 1
   - 小数部分：0.0（结束）

所以 0.75 的二进制表示为：`0.11`

**验证：** 0.11₂ = 1×2^(-1) + 1×2^(-2) = 0.5 + 0.25 = 0.75 ✓

#### 小数转二进制：0.1 的无限循环

现在来看 0.1 转二进制的推导过程：

```
0.1 = a×2^(-1) + b×2^(-2) + c×2^(-3) + d×2^(-4) + ...
```

**详细推导步骤：**

1. **第一步：** 0.1 × 2 = 0.2

   - 整数部分：0 → a = 0
   - 小数部分：0.2

2. **第二步：** 0.2 × 2 = 0.4

   - 整数部分：0 → b = 0
   - 小数部分：0.4

3. **第三步：** 0.4 × 2 = 0.8

   - 整数部分：0 → c = 0
   - 小数部分：0.8

4. **第四步：** 0.8 × 2 = 1.6

   - 整数部分：1 → d = 1
   - 小数部分：0.6

5. **第五步：** 0.6 × 2 = 1.2

   - 整数部分：1 → e = 1
   - 小数部分：0.2

6. **第六步：** 0.2 × 2 = 0.4
   - 整数部分：0 → f = 0
   - 小数部分：0.4

**发现问题！** 第六步的小数部分又回到了 0.2，这意味着接下来的步骤会重复前面的模式。

**完整循环模式：**

```
0.1 × 2 = 0.2  → a = 0, 剩余 0.2
0.2 × 2 = 0.4  → b = 0, 剩余 0.4
0.4 × 2 = 0.8  → c = 0, 剩余 0.8
0.8 × 2 = 1.6  → d = 1, 剩余 0.6
0.6 × 2 = 1.2  → e = 1, 剩余 0.2
0.2 × 2 = 0.4  → f = 0, 剩余 0.4  ← 开始循环
0.4 × 2 = 0.8  → g = 0, 剩余 0.8
0.8 × 2 = 1.6  → h = 1, 剩余 0.6
0.6 × 2 = 1.2  → i = 1, 剩余 0.2
...
```

所以 0.1 的二进制表示为：`0.00011001100110011...`（无限循环）

**循环节：** `0011` 重复出现

#### 0.2 的二进制表示

同理，0.2 的推导过程：

```
0.2 × 2 = 0.4  → a = 0, 剩余 0.4
0.4 × 2 = 0.8  → b = 0, 剩余 0.8
0.8 × 2 = 1.6  → c = 1, 剩余 0.6
0.6 × 2 = 1.2  → d = 1, 剩余 0.2
0.2 × 2 = 0.4  → e = 0, 剩余 0.4  ← 开始循环
...
```

所以 0.2 的二进制表示为：`0.0011001100110011...`（无限循环）

**循环节：** `0011` 重复出现

#### 数学原理：为什么会出现循环？

这个问题可以从数学角度解释：

**定理：** 一个十进制小数能精确表示为有限位二进制小数，当且仅当该小数可以表示为 `p/2^n` 的形式（其中 p 是整数，n 是非负整数）。

**证明：**

- 如果小数可以表示为 `p/2^n`，那么它一定能精确转换为有限位二进制小数
- 反之，如果小数不能表示为这种形式，那么它必然会产生无限循环

**举例：**

- 0.75 = 3/4 = 3/2² → 可以精确表示
- 0.1 = 1/10 = 1/(2×5) → 分母包含质因子 5，不能表示为 `p/2^n` 的形式，所以会产生循环

**常见循环模式：**

```javascript
// 一些常见小数的二进制表示
console.log(parseFloat(0.1).toString(2)); // 0.0001100110011001100110011001100110011001100110011001101
console.log(parseFloat(0.2).toString(2)); // 0.001100110011001100110011001100110011001100110011001101
console.log(parseFloat(0.3).toString(2)); // 0.010011001100110011001100110011001100110011001100110011
console.log(parseFloat(0.4).toString(2)); // 0.01100110011001100110011001100110011001100110011001101
console.log(parseFloat(0.5).toString(2)); // 0.1
console.log(parseFloat(0.75).toString(2)); // 0.11
```

### JavaScript 中的数值表示

JavaScript 只有一种数值类型：`Number`，即刚刚说到的 IEEE 754 双精度浮点数。其使用 64 位来储存一个浮点数，结构如下：

```
符号位(1位) | 指数位(11位) | 尾数位(52位)
```

**详细结构解析：**

- **符号位 (Sign)**：0 表示正数，1 表示负数
- **指数位 (Exponent)**：11 位，使用偏移量编码，偏移值为 1023
- **尾数位 (Fraction)**：52 位，存储规格化后的尾数部分

**数值计算公式：**

```
V = (-1)^S × (1 + F) × 2^(E - 1023)
```

其中：

- S：符号位
- E：指数位（存储值）
- F：尾数位（二进制小数）

简单来理解，这就是二进制的科学计数法，只不过做了一些特定调整，只存储了式子中变化的一些值。

比如 -1020，用科学计数法表示就是 $$-1 * 10^3 * 1.02$$，对于二进制也是一样，以 0.1 的二进制 0.00011001100110011…… 这个数可以表示为 $$1 * 2^{-4} * 1.1001100110011……$$。

不看前面的符号位，只看后面的部分，所有的浮点数都可以表示为 `1.xxxx * 2^xxx` 的形式，前面的一定是 `1.xxx`，所以干脆就不存储这个 1 了，直接存后面的 `xxxxx`，这也就是尾数位 (Fraction) 。

而 `2^xxx` ，例如 1020.75，对应二进制数就是 1111111100.11，对应二进制科学计数法就是 $$1 * 1.11111110011 * 2^9$$，指数值就是 9，而如果是 0.1 ，对应二进制是 1 _ $$1.1001100110011…… _ 2^{-4}$$， 指数值就是 -4，也就是说，指数值既可能是负数，又可能是正数。

假如用 8 位来存储指数值，如果只有正数的话，储存的值的范围是 0 ~ 254，而如果要储存正负数的话，值的范围就是 -127~127，在存储的时候，把**要存储的数字加上 127**，这样当我们存 -127 的时候，我们存 0，当存 127 的时候，存 254，这样就解决了存负数的问题。对应的，当取值的时候，我们再减去 127。

所以，实际存储的值与真正参与计算的值是有一个偏移值的，8 位存储时则为 127，而 IEEE 754 使用 11 位存储指数值，对于 11 位来说，偏移值是 $$2^{(11-1)} - 1 = 1023$$。

### 精度误差的实际计算

让我们看看 0.1 和 0.2 在内存中的实际表示：

```javascript
// 0.1的64位表示
console.log(parseFloat(0.1).toString(2));
// 0.0001100110011001100110011001100110011001100110011001101

// 0.2的64位表示
console.log(parseFloat(0.2).toString(2));
// 0.001100110011001100110011001100110011001100110011001101

console.log(0.1 + 0.2);
// 0.30000000000000004

console.log(0.1 + 0.2 - 0.3);
// 5.551115123125783e-17

// 使用 toPrecision 查看完整精度
console.log((0.1 + 0.2).toPrecision(21));
// 0.300000000000000044409

console.log((0.3).toPrecision(21));
// 0.299999999999999988898
```

这个微小的误差（约 5.55e-17 ）导致直接比较失败。

## 初级解决方案：容差阈值比较

### Number.EPSILON 简介

ES6 引入了`Number.EPSILON`，表示 1 与大于 1 的最小浮点数之间的差值（约 2.22e-16）。这是基于 1 的最小精度单位。

```javascript
// Number.EPSILON的数学定义
Number.EPSILON === Math.pow(2, -52); // true
Number.EPSILON === 2.220446049250313e-16; // true

// 它是1与大于1的最小浮点数之间的差值
console.log(1 + Number.EPSILON > 1); // true
console.log(1 + Number.EPSILON / 2 > 1); // false
```

当表示 **1.0** 这个数值时：

- 符号位 = 0（正数）
- 指数位 = `1023`（偏移量编码）
- 尾数位 = 全 `0`（52 个 0）

```
0 01111111111 0000000000000000000000000000000000000000000000000000
```

在 1 的基础上，通过将尾数最低位设为 `1`，得到：

```
0 01111111111 0000000000000000000000000000000000000000000000000001
```

这个值 = $$1+2^{52}$$ ≈ `1.0000000000000002`，也就是说其本质上是 **浮点数在量级 1 时的最小可表示步长**。

如果算术运算的数量级在 `1` 附近，那么 `Number.EPSILON` 常数通常是一个合理的误差阈值。

### 基础比较函数

```javascript
function simpleFloatEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}

// 测试
console.log(simpleFloatEqual(0.1 + 0.2, 0.3)); // true
console.log(simpleFloatEqual(1.0, 1.0 + Number.EPSILON / 2)); // true
console.log(simpleFloatEqual(1.0, 1.0 + Number.EPSILON)); // false
```

### 局限性：量级问题

固定使用`Number.EPSILON`只适用于接近 1 的数值。对于其他量级的数值：

```javascript
// 大数值测试 - 错误结果
const bigNum = 1e16;
console.log(simpleFloatEqual(bigNum, bigNum + 1)); // true，错误！

// 小数值测试 - 过于严格
const smallNum = 1e-20;
console.log(simpleFloatEqual(smallNum, smallNum * 1.1)); // false，过于严格

// 不同量级对比
console.log(simpleFloatEqual(2.0, 2.0 + Number.EPSILON)); // false
console.log(simpleFloatEqual(0.5, 0.5 + Number.EPSILON)); // false
```

## 高级解决方案：动态容差与 ULP 概念

### 理解 ULP（Unit in the Last Place）

ULP 是当前区间的最小可表示单位，随数值大小动态变化。这是 IEEE 754 标准的核心概念。

**ULP 计算原理：**

- 对于数值 x，其 `ULP = 2^(exponent(x) - 52)`
- 其中`exponent(x)`是 x 的指数部分

### 基于 ULP 的动态比较函数

```javascript
function floatEqual(a, b, toleranceFactor = 1) {
  // 处理特殊值
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;

  // 完全相等（包括+0/-0）
  if (a === b) return true;

  // 计算差值
  const diff = Math.abs(a - b);

  // 处理接近零的情况
  if (Math.abs(a) < Number.MIN_VALUE || Math.abs(b) < Number.MIN_VALUE) {
    return diff < Number.EPSILON * toleranceFactor;
  }

  // 获取两数中较大的指数
  const exp = Math.max(getExponent(a), getExponent(b));

  // 计算该指数区间的理论最小精度单位
  const ulp = Math.pow(2, exp) * Number.EPSILON;

  // 比较
  return diff <= ulp * toleranceFactor;
}

// 获取浮点数指数部分
function getExponent(x) {
  if (x === 0) return 0;
  const float64 = new Float64Array(1);
  float64[0] = x;
  const view = new DataView(float64.buffer);
  const bits = view.getBigUint64(0, true);
  return Number((bits >> 52n) & 0x7ffn) - 1023;
}

// 获取数值的ULP
function getULP(x) {
  if (x === 0) return Number.MIN_VALUE;
  const exp = getExponent(x);
  return Math.pow(2, exp) * Number.EPSILON;
}
```

### 实现解析

1. **特殊值处理**：正确处理`NaN`、`Infinity`等边界情况
2. **零值安全**：接近零时使用固定容差，避免计算溢出
3. **指数计算**：通过 Float64Array 直接访问内存中的指数位
4. **动态 ULP**：根据数值量级计算最小精度单位
5. **容差系数**：允许调整精度要求（默认 1 个 ULP）

### 性能优化简化版

对于性能敏感场景，可使用近似算法：

```javascript
function fastFloatEqual(a, b, factor = 2) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;

  const diff = Math.abs(a - b);

  // 接近零时的特殊处理
  if (diff < Number.EPSILON) return true;

  // 基于较大值计算容差
  const max = Math.max(Math.abs(a), Math.abs(b));
  return diff <= max * Number.EPSILON * factor;
}

// 更简单的版本，适用于大多数场景
function simpleFloatEqual(a, b, factor = 2) {
  return (
    Math.abs(a - b) <=
    Math.max(Math.abs(a), Math.abs(b)) * Number.EPSILON * factor
  );
}
```

### 测试验证

```javascript
// 基础测试
console.log(floatEqual(0.1 + 0.2, 0.3)); // true

// 不同量级测试
console.log(floatEqual(1e16, 1e16 + 1)); // false (正确)
console.log(floatEqual(3.0, 3.0 + 4e-16)); // true (ULP=4.44e-16)
console.log(floatEqual(0.75, 0.75 + 1e-16)); // true (ULP=1.11e-16)

// 边界测试
console.log(floatEqual(Number.MIN_VALUE, Number.MIN_VALUE)); // true
console.log(floatEqual(Infinity, Infinity)); // true
console.log(floatEqual(NaN, NaN)); // false (符合标准)
console.log(floatEqual(+0, -0)); // true

// 实际应用测试
console.log(floatEqual(Math.PI, 3.141592653589793)); // true
console.log(floatEqual(Math.sqrt(2), 1.4142135623730951)); // true
```

## 其他语言的处理方式

不同语言提供了类似机制处理浮点数比较：

**Java:**

```java
// 使用Math.ulp()方法
public static boolean floatEquals(double a, double b, int tolerance) {
    return Math.abs(a - b) <= Math.ulp(a) * tolerance;
}

// 使用BigDecimal进行精确计算
BigDecimal bd1 = new BigDecimal("0.1");
BigDecimal bd2 = new BigDecimal("0.2");
BigDecimal result = bd1.add(bd2);
System.out.println(result.equals(new BigDecimal("0.3"))); // true
```

**C++:**

```cpp
#include <cmath>
#include <limits>

bool floatEquals(double a, double b, int tolerance = 1) {
    if (std::isnan(a) || std::isnan(b)) return false;
    if (std::isinf(a) || std::isinf(b)) return a == b;

    double diff = std::fabs(a - b);
    double ulp = std::nextafter(a, b) - a;
    return diff <= ulp * tolerance;
}
```

**Python:**

```python
import math

def float_equal(a, b, tolerance_factor=1):
    if not (math.isfinite(a) and math.isfinite(b)):
        return a == b

    if a == b:
        return True

    diff = abs(a - b)
    ulp = math.ulp(a)
    return diff <= ulp * tolerance_factor

# 使用decimal模块进行精确计算
from decimal import Decimal, getcontext
getcontext().prec = 28  # 设置精度

a = Decimal('0.1')
b = Decimal('0.2')
result = a + b
print(result == Decimal('0.3'))  # True
```

## JavaScript 开源库的浮点数处理

在实际项目中，我们通常会使用成熟的数学库来处理浮点数精度问题。让我们分析几个主流库的实现原理，并基于它们的核心思想实现一个简单可用的 demo。

### 主流库分析

#### 1. **decimal.js** - 基于字符串的精确计算

decimal.js 是 JavaScript 中最流行的精确数学库之一，其核心思想是：

- 将数字转换为字符串处理，避免浮点数精度损失
- 实现完整的十进制运算，包括加减乘除、幂运算等
- 支持任意精度设置

#### 2. **big.js** - 轻量级精确计算

big.js 是 decimal.js 的轻量级版本，专注于：

- 更小的包体积（约 6KB）
- 简化的 API 设计
- 保持核心精度功能

#### 3. **mathjs** - 综合数学库

mathjs 提供了更全面的数学功能：

- 支持多种数据类型（Number、BigNumber、Fraction）
- 可配置的精度和数字类型
- 丰富的数学函数库

### 核心实现原理

这些库的共同核心原理是：

1. **字符串表示**：将数字转换为字符串，避免 IEEE 754 精度问题
2. **整数运算**：将小数转换为整数进行运算，最后再转换回小数
3. **精度控制**：通过配置控制计算精度和舍入模式
4. **溢出处理**：处理大数运算时的溢出问题

### Demo 实现

基于上述原理，我们实现一个简化版的精确计算库：

```javascript
/**
 * 最小可用精确计算库
 * 基于字符串处理和整数运算原理
 */
class PreciseMath {
  constructor(precision = 20) {
    this.precision = precision;
    this.roundingMode = "round"; // round, floor, ceil
  }

  /**
   * 将数字转换为字符串，处理科学计数法
   */
  _normalize(num) {
    if (typeof num === "string") return num;

    // 处理科学计数法
    const str = num.toString();
    if (str.includes("e") || str.includes("E")) {
      const [mantissa, exponent] = str.split(/[eE]/);
      const exp = parseInt(exponent);

      if (exp > 0) {
        return (
          mantissa.replace(".", "") +
          "0".repeat(exp - (mantissa.length - mantissa.indexOf(".") - 1))
        );
      } else {
        return "0." + "0".repeat(-exp - 1) + mantissa.replace(".", "");
      }
    }

    return str;
  }

  /**
   * 将小数转换为整数进行运算
   * 例如：0.1 + 0.2 => (1 * 10^1 + 2 * 10^1) / 10^1
   */
  _toInteger(num) {
    const str = this._normalize(num);
    const parts = str.split(".");

    if (parts.length === 1) {
      return {
        value: parts[0],
        scale: 0,
      };
    }

    return {
      value: parts[0] + parts[1],
      scale: parts[1].length,
    };
  }

  /**
   * 对齐两个数的精度
   */
  _align(a, b) {
    const maxScale = Math.max(a.scale, b.scale);

    return {
      a: {
        value: a.value + "0".repeat(maxScale - a.scale),
        scale: maxScale,
      },
      b: {
        value: b.value + "0".repeat(maxScale - b.scale),
        scale: maxScale,
      },
    };
  }

  /**
   * 字符串加法
   */
  _addStrings(a, b) {
    const maxLen = Math.max(a.length, b.length);
    a = a.padStart(maxLen, "0");
    b = b.padStart(maxLen, "0");

    let carry = 0;
    let result = "";

    for (let i = maxLen - 1; i >= 0; i--) {
      const sum = parseInt(a[i]) + parseInt(b[i]) + carry;
      result = (sum % 10) + result;
      carry = Math.floor(sum / 10);
    }

    if (carry > 0) {
      result = carry + result;
    }

    return result;
  }

  /**
   * 字符串减法
   */
  _subtractStrings(a, b) {
    const maxLen = Math.max(a.length, b.length);
    a = a.padStart(maxLen, "0");
    b = b.padStart(maxLen, "0");

    let borrow = 0;
    let result = "";

    for (let i = maxLen - 1; i >= 0; i--) {
      let diff = parseInt(a[i]) - parseInt(b[i]) - borrow;

      if (diff < 0) {
        diff += 10;
        borrow = 1;
      } else {
        borrow = 0;
      }

      result = diff + result;
    }

    // 移除前导零
    result = result.replace(/^0+/, "") || "0";
    return result;
  }

  /**
   * 格式化结果
   */
  _formatResult(value, scale) {
    if (scale === 0) return value;

    // 确保有足够的小数位
    while (value.length <= scale) {
      value = "0" + value;
    }

    const integerPart = value.slice(0, -scale);
    const decimalPart = value.slice(-scale);

    return (integerPart || "0") + "." + decimalPart;
  }

  /**
   * 精确加法
   */
  add(a, b) {
    const aInt = this._toInteger(a);
    const bInt = this._toInteger(b);
    const aligned = this._align(aInt, bInt);

    const result = this._addStrings(aligned.a.value, aligned.b.value);
    return this._formatResult(result, aligned.a.scale);
  }

  /**
   * 精确减法
   */
  subtract(a, b) {
    const aInt = this._toInteger(a);
    const bInt = this._toInteger(b);
    const aligned = this._align(aInt, bInt);

    const result = this._subtractStrings(aligned.a.value, aligned.b.value);
    return this._formatResult(result, aligned.a.scale);
  }

  /**
   * 精确比较
   */
  equals(a, b) {
    return this.add(a, "0") === this.add(b, "0");
  }

  /**
   * 精确乘法（简化版）
   */
  multiply(a, b) {
    const aInt = this._toInteger(a);
    const bInt = this._toInteger(b);

    // 简化的乘法实现
    const result = (parseInt(aInt.value) * parseInt(bInt.value)).toString();
    const scale = aInt.scale + bInt.scale;

    return this._formatResult(result, scale);
  }
}

// 使用示例
const math = new PreciseMath();

console.log("=== 精确计算测试 ===");
console.log("0.1 + 0.2 =", math.add("0.1", "0.2")); // 0.3
console.log(
  "0.1 + 0.2 === 0.3:",
  math.equals("0.1", math.subtract("0.3", "0.2"))
); // true

console.log("\n=== 大数测试 ===");
console.log("1e16 + 1 =", math.add("10000000000000000", "1")); // 10000000000000001
console.log(
  "1e16 + 1 === 1e16:",
  math.equals("10000000000000000", "10000000000000001")
); // false

console.log("\n=== 科学计数法测试 ===");
console.log("1e-10 + 1e-10 =", math.add("0.0000000001", "0.0000000001")); // 0.0000000002

console.log("\n=== 与原生比较 ===");
console.log("原生: 0.1 + 0.2 =", 0.1 + 0.2);
console.log("精确: 0.1 + 0.2 =", math.add("0.1", "0.2"));
```

### 高级功能扩展

基于上述基础实现，我们可以进一步扩展：

```javascript
/**
 * 扩展功能：支持更多运算和配置
 */
class AdvancedPreciseMath extends PreciseMath {
  constructor(precision = 20, roundingMode = "round") {
    super(precision);
    this.roundingMode = roundingMode;
  }

  /**
   * 设置舍入模式
   */
  setRoundingMode(mode) {
    this.roundingMode = mode;
    return this;
  }

  /**
   * 舍入到指定精度
   */
  round(value, precision) {
    const parts = value.split(".");
    if (parts.length === 1 || parts[1].length <= precision) {
      return value;
    }

    const integerPart = parts[0];
    const decimalPart = parts[1];
    const significant = decimalPart.slice(0, precision);
    const nextDigit = parseInt(decimalPart[precision] || "0");

    let rounded;
    switch (this.roundingMode) {
      case "floor":
        rounded = significant;
        break;
      case "ceil":
        rounded =
          nextDigit > 0 ? this._addStrings(significant, "1") : significant;
        break;
      case "round":
      default:
        rounded =
          nextDigit >= 5 ? this._addStrings(significant, "1") : significant;
        break;
    }

    return this._formatResult(integerPart + rounded, precision);
  }

  /**
   * 格式化输出
   */
  format(value, options = {}) {
    const {
      precision = this.precision,
      notation = "standard", // standard, scientific, engineering
      minFractionDigits = 0,
      maxFractionDigits = precision,
    } = options;

    let result = this.round(value, precision);

    // 处理科学计数法
    if (notation === "scientific" && Math.abs(parseFloat(result)) >= 1e6) {
      const num = parseFloat(result);
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const mantissa = num / Math.pow(10, exp);
      return `${mantissa.toFixed(6)}e${exp}`;
    }

    return result;
  }
}

// 高级功能测试
const advancedMath = new AdvancedPreciseMath(10, "round");

console.log("\n=== 高级功能测试 ===");
console.log("舍入测试 (round):", advancedMath.round("3.14159265359", 3)); // 3.142
console.log(
  "舍入测试 (floor):",
  advancedMath.setRoundingMode("floor").round("3.14159265359", 3)
); // 3.141
console.log(
  "舍入测试 (ceil):",
  advancedMath.setRoundingMode("ceil").round("3.14159265359", 3)
); // 3.142

console.log(
  "格式化测试:",
  advancedMath.format("3.14159265359", { precision: 4 })
); // 3.1416
```

这个 demo 基本展示了主流数学库的核心原理，虽然功能简化，但足以处理大多数常见的浮点数精度问题。在实际项目中，建议根据具体需求选择合适的成熟库。

## 总结

通过本文的深入探讨，我们全面解析了 JavaScript 中 `0.1 + 0.2 !== 0.3` 这个经典问题的本质和解决方案。

浮点数精度问题虽然看似简单，但涉及计算机科学、数学和工程实践的多个层面。通过深入理解其原理并掌握相应的解决方案，我们可以在实际开发中避免这类问题，写出更加健壮和可靠的代码。
