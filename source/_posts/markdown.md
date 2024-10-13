---
title: 码字语法三千，我只取一瓢
date: 2019-12-04 21:02:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/markdown.png
categories: 
- 学习笔记
tags:
- Markdown
- LaTeX
---

## 插入复杂表格

1. 利用 **Excel** 将表格绘制完成

2. 选择导出保存为`.html/.htm`网页文档格式

3. 用文本编辑器打开，拷贝`table`标签内容即可

4. 若需要居中表格，可为 table 标签添加样式属性

   ```html
   <table style="margin: 0 auto">表格内容</table>
   ```

## 文档脚注

```markdown
这是一个链接到黄同学博客的脚注[^1]。
[^1]: http://www.mahoo.design
```

效果：这是一个链接到老黄博客的脚注[^1]。

[^1]: http://www.mahoo.design

## 字体，颜色，大小

```html
<font face="黑体">我是黑体字</font>
<font face="微软雅黑">我是微软雅黑</font>
<font face="STCAIYUN">我是华文彩云</font>
<font color=red>我是红色</font>
<font color=#008000>我是绿色</font>
<font color=Blue>我是蓝色</font>
<font size=5>我是尺寸为5</font>
<font face="黑体" color=green size=5>我是黑体，绿色，尺寸为5</font>
```

<font face="黑体">我是黑体字</font>
<font face="微软雅黑">我是微软雅黑</font>
<font face="STCAIYUN">我是华文彩云</font>
<font color=red>我是红色</font>
<font color=#008000>我是绿色</font>
<font color=Blue>我是蓝色</font>
<font size=5>我是尺寸为5</font>
<font face="黑体" color=green size=5>我是黑体，绿色，尺寸为5</font>

## Latex 数学公式

### 上下标

1. 上标符号，符号：`^`，如：$x^4$            (x^4)
2. 下标符号，符号：`_`，如：$x_1$            (x_1)
3. 组合符号，符号：`{}`，如：${16}_{8}A{2}_{2}$         ({16}\_{8}A{2}\_{2})
4. 取反，符号：`\prime`，如$D^\prime$

### 四则运算

1. 加法运算，符号：`+`，如：$x+y=z$
2. 减法运算，符号：`-`，如：$x-y=z$
3. 加减运算，符号：`\pm`，如：$x \pm y=z$
4. 减加运算，符号：`\mp`，如：$x \mp y=z$
5. 乘法运算，符号：`\times`，如：$x \times y=z$
6. 点乘运算，符号：`\cdot`，如：$x \cdot y=z$
7. 星乘运算，符号：`\ast`，如：$x \ast y=z$
8. 除法运算，符号：`\div`，如：$x \div y=z$
9. 斜法运算，符号：`/`，如：$x/y=z$
10. 分式表示，符号：`\frac{分子}{分母}`，如：$\frac{x+y}{y+z}$
11. 分式表示，符号：`{分子} \over {分母}`，如：${x+y} \over {y+z}$
12. 绝对值表示，符号：`||`，如：$|x+y|$

### 逻辑运算

1. 等于运算，符号：`=`，如：$x+y=z$
2. 大于运算，符号：`>`，如：$x+y>z$
3. 小于运算，符号：`<`，如：$x+y<z$
4. 大于等于运算，符号：`\geq`，如：$x+y \geq z$
5. 小于等于运算，符号：`\leq`，如：$x+y \leq z$
6. 不等于运算，符号：`\neq`，如：$x+y \neq z$
7. 不大于等于运算，符号：`\ngeq`，如：$x+y \ngeq z$
8. 不大于等于运算，符号：`\not\geq`，如：$x+y \not\geq z$
9. 不小于等于运算，符号：`\nleq`，如：$x+y \nleq z$
10. 不小于等于运算，符号：`\not\leq`，如：$x+y \not\leq z$
11. 约等于运算，符号：`\approx`，如：$x+y \approx z$
12. 恒定等于运算，符号：`\equiv`，如：$x+y \equiv z$
13. 远远大于运算，符号：`\gg`，如：$a \gg b$
14. 远远小于运算，符号：`\ll`，如：$a \ll b$

### 累加累乘

| 符号                           | 代码                            |
| ------------------------------ | ------------------------------- |
| $$\sum_{i=1}^n \frac{1}{i^2}$$ | `$\sum_{i=1}^n \frac{1}{i^2}$`  |
| $\prod_{i=1}^n \frac{1}{i^2}$  | `$\prod_{i=1}^n \frac{1}{i^2}$` |
| $\bigcup_{i=1}^{2} R$          | `$\bigcup_{i=1}^{2} R$`         |
| $\bigcap_{i=1}^{2} R$          | `$\bigcap_{i=1}^{2} R$`         |

### 积分运算

1. 积分符号 $\int$ ：`$\int$`

2. 双重积分符号$\iint$：`$\iint$`

3. 三重积分符号$\iiint$：`$\iiint$`

4. 曲线积分$\oint$：`$\oint$`

   实例：$\int_0^1 {x^2} \,{\rm d}x$      ——`$\int_0^1 {x^2} \,{\rm d}x$`

### 多行格式

1. $$y =\begin{cases} a \\ b \\ c\end{cases}$$ 		`y =\begin{cases} a \\ b \\ c\end{cases}`

2. `\begin{cases}
    1+1/2+\underbrace{1/3+1/4}_{>1/2}+
       \underbrace{1/5+1/6+1/7+1/8}_{>1/2}+\cdots
    \end{cases}`
   $$
   \begin{cases}
     1+1/2+\underbrace{1/3+1/4}_{>1/2}+
          \underbrace{1/5+1/6+1/7+1/8}_{>1/2}+\cdots
   \end{cases}
   $$


### 其他格式

1. $\mathop{\arg\min}\limits_{\theta}$：`$\mathop{\arg\min}\limits_{\theta}$`
2. 

### 特殊符号

| 符号                       | 实现                         | 描述       |
| -------------------------- | ---------------------------- | ---------- |
| $\bigotimes$               | `$\bigotimes$`               | 克罗内克积 |
| ⨁                          | `$\bigoplus$`                | 异或       |
| $\ldots$                   | `$\ldots$`                   | 省略号     |
| $\angle 30^\circ$          | `$\angle 30^\circ$`          | 角度       |
| $\uparrow$                 | `$\uparrow$`                 | 向上       |
| $\downarrow$               | `$\downarrow$`               | 向下       |
| $\leftarrow$               | `$\leftarrow$`               | 向左       |
| $\rightarrow$              | `$\rightarrow$`              | 向右       |
| $${\lim_{x \to +\infty}}$$ | `$${\lim_{x \to +\infty}}$$` | 极限       |

### 希腊字母

| 字母      | 实现       | 字母       | 实现       |
| --------- | ---------- | ---------- | ---------- |
| A         | `A`        | α          | `\alhpa`   |
| B         | `B`        | β          | `\beta`    |
| Γ         | `\Gamma`   | γ          | `\gamma`   |
| Δ         | `\Delta`   | δ          | `\delta`   |
| E         | `E`        | ϵ          | `\epsilon` |
| Z         | `Z`        | ζ          | `\zeta`    |
| H         | `H`        | η          | `\eta`     |
| Θ         | `\Theta`   | θ          | `\theta`   |
| I         | `I`        | ι          | `\iota`    |
| K         | `K`        | κ          | `\kappa`   |
| Λ         | `\Lambda`  | λ          | `\lambda`  |
| M         | `M`        | $\mu$      | `\mu`      |
| N         | `N`        | $\nu$      | `\nu`      |
| Ξ         | `\Xi`      | ξ          | `\xi`      |
| O         | `O`        | $\omicron$ | `\omicron` |
| Π         | `\Pi`      | π          | `\pi`      |
| P         | `P`        | ρ          | `\rho`     |
| Σ         | `\Sigma`   | $\sigma$   | `\sigma`   |
| T         | `T`        | τ          | `\tau`     |
| Υ         | `\Upsilon` | υ          | `\upsilon` |
| $\Phi$    | `\Phi`     | $\phi$     | `\phi`     |
| $\Chi$    | `\Chi`     | $\chi$     | `\chi`     |
| $\Psi$    | `\Psi`     | $\psi$     | `\psi`     |
| Ω         | `\Omega`   | $\omega$   | `\omega`   |
| $\varphi$ | `\varphi`  | $\varrho$  | `\varrho`  |

#### 其他字体

空心体：`\mathbb{R}`：$\mathbb{R}$

斜体：`\mathcal{R}`：$\mathcal{R}$

花体：`\mathscr{R}`：$\mathscr{R}$

### 其他

取消斜体：`$\rm {x+y}$`，$\rm {x+y}$

加粗字体：`$\textbf {x+y}$`，$\textbf  {x+y}$