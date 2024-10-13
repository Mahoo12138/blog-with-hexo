---
title: 前端入门之双飞翼布局与圣杯布局
date: 2019-12-23 22:10:21
categories: 
- 学习笔记
tags:
- 前端
- CSS布局
---

## 双飞翼布局 & 圣杯布局

圣杯布局、双飞翼布局都是前端工程师必须要掌握的布局方法，从效果上看，它们是一样的，都是左右两栏宽度固定，中间宽度自适应的三栏布局。

还有一些细节要求如：

+ 中间部分属于内容中心，在DOM结构上优先，以便提前渲染；
+ 且三栏可以任意次序定义；

圣杯布局来源于文章 [In Search of the Holy Grail](https://alistapart.com/article/holygrail)，而双飞翼布局来源于淘宝UED。虽然两者的实现方法略有差异，但精髓也还是一样的。

### 圣杯布局

在圣杯布局中，整个DOM结构由`container`包裹的`center`,`left`,`right`三列构成，其中`center`要定义在最前面；

```html
<div id="header">Header</div>
<div id="container">
  <div id="center" class="column">Middle</div>
  <div id="left" class="column">Left</div>
  <div id="right" class="column">Right</div>
</div>
<div id="footer">Footer</div>
```

我们取左侧的固定宽度为 200px，右侧的固定宽度为 300px，并在`container`两侧预留出空间：

```css
#container {
  padding-left: 200px; 
  padding-right: 300px;
}
```

之后再设置三栏的背景色和宽度，然后设置浮动，且配置顶栏底栏并清除浮动：

```css
#left {
    background-color: #f2f;
    width: 200px;
}
#right {
    background-color: #ff2;
    width: 300px;
}
#center{
    background-color: #2ff;
    width: 100%;
}
#container class="column" {
    float: left;
}

#header,
#footer {
    height: 120px;
    background-color: grey;
    clear: both;
}
```

根据浮动的特性，且`center`设置了宽度100%，虽有 `Padding`属性占据的空白，但其并不会破坏盒子，所以占据了第一行的所有空间，所以`left`和`right`就会被“挤”到第二行。

> 这里插一句，当页面宽度变小至 Center 宽度小于 Left 和 Right 宽度总和时，Right 会继续“换行”，它们三栏都在 Container 内，并且 Center 是占满 Container 的，此时宽度已不满足 Left 和 Right 并列了；

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/frontend/20210822080159.png)

接下来我们要将下一行的内容放到左右侧栏去，过程可分为两部，先来 Left：

1. 使用**负外边距**的方法，将其移动到上一行，这里使用边距是相对父元素进行计算，所以 -100% 直接移到父元素起始处；

2. 使用**相对定位**，再准确移动到预留的左侧位置；

```css
#left {
  width: 200px; 
  margin-left: -100%;
  position: relative;
  right: 200px;
}
```

而右栏就比较简单了，直接负外边距移动即可：

```css
#right {
  background-color: #ff2;
  width: 300px;
  margin-right: -300px;
}
```

> 插一句我对负边距的理解，以这个 Right 为例：
>
> 对于这样一个浮动元素，其实和正常文档流是一样的，只不过这个流是浮动的，而且可以指定左右；当设置 width: 300px; 的 Right 的右边距为 -300px 时，该元素的实体占位其实已经没有了，只剩下了原占位大小并浮着的表面，占位没有了，Right 的父元素 Container 就没必要换行了，但是这个浮动的表面要随着浮动文档流掉落下来，也就填满了预留的位置；

到这里圣杯布局就大致完成了，但还有一些细节可以深究：

#### 页面最小宽度

当浏览器窗口变小到一定程度时，元素中的布局可能会发生变化，圣杯布局也就不那么圣杯了，具体是什么程度呢？我们来看看；

浏览器窗口变化时，Center 的宽度会自适应，只要找到不变就是影响的因素了，即 Center 父元素 Container 设置的左右的 Padding，一共为 200 + 300 = 500 px，但是经实测当页面宽度小于 700px 布局会失效，也就是还有 200px 哪里的问题，很快我们就会想到 Left 在进行相对定位时是没有脱离当前的文档流的，Left 位置还是原来的位置，如下图，宽度继续缩小，直到 Left 和 Right 重合，二者都会被挤到第二行：

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/frontend/20230610183729.png)

也就是说 Center 自适应不能小于位于 Center 位置的 Left 所占位置的大小，也就是那 200px ：故我们需要设置：

> 窗口小于 min-width 宽度后，元素不再自适应，而是被遮挡；

```css
body {
    min-width: 700px;
}
```

#### 假的等高

在实现上述布局后，都会存在一个问题，即三栏内容高度不一致时，高度会被最高的一列撑开，其余列并不会适应填充：

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/frontend/20210822080208.png)

这样看起来确实有失偏颇，常用的方法是设计一个**假等高布局**，即内外边距底部分别设置正负值：

```css
#container {
    padding-left: 200px;
    padding-right: 300px;
    overflow: hidden;
}

#container class="column" {
    float: left;
    padding-bottom: 5000px;
    margin-bottom: -5000px;
}
```

- 不考虑可扩展性，只需要将`padding-bottom/margin-bottom` ，设置为最高列与最低列相差高度值，就可以得到等高效果。
- 考虑扩展性，为了防止将来可能某列高度大量的增加或减少，所以设置了一个比较大的值。

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/frontend/20210822080216.png)

> 1. 盒子模型：background 会填充内边距 padding，而不会填充外边距 margin 。margin具有坍塌性，可以设置负值；
> 2. overflow:hidden; ：设置overflow属性为hidden，这样会让父容器产生BFC（Block Fromatting Context 块级格式化上下文）效果，消除float带来的影响。同时，根据需要，会截取内容以适应填充框，将超出容器的部分隐藏；

### 双飞翼布局

双飞翼布局的DOM结构与圣杯布局的区别是只用`container`包裹住 Center 布局，另外将`.column`类从`center`移至`container`上：

```html
<div id="header">Header</div>
<div id="container" class="column">
  <div id="center">
    中
  </div>
</div>
<div id="left" class="column">左</div>
<div id="right" class="column">右</div>
<div id="footer" >Footer</div>
```

类似于圣杯布局，先设置各列的宽度与浮动，并且为左右两列预留出空间，以及为`footer`设置浮动清除，这里粗暴解决，直接 Header 和 Footer 一起：

```css
.column{
    float: left;
}

#container {
    width: 100%;
}

#left {
    background-color: #2f2;
    width: 200px;
}
#right {
    background-color: #22f;
    width: 300px;
}
#center {
    background-color: #f22;
    margin-left: 200px;
    margin-right: 300px;
}
#header,
#footer {
    height: 120px;
    background-color: grey;
    clear: both;
}
```

> 这里对 Center 设置左右的边距是非常重要的，内容的显示不会被左右两栏所覆盖，导致显示不全；

同样，直接将其余列通过负边距移动到预定的位置：

```css
#left {
    background-color: #2f2;
    width: 200px;
    margin-left: -100%;
}
#right {
    background-color: #22f;
    width: 300px;
    margin-left: -300px;
}
```

双飞翼布局在浏览器窗口缩小时，并不会出现布局崩溃，但到了一定程度， Center 会被覆盖，可以给其一定宽度，如 200px，200px + 200px + 300px = 700px，即设置布局最小宽度：

```css
body {
  min-width: 700px;
}
```

### 二者区别

圣杯布局和双飞翼布局解决问题的方案在前一半是相同的，也就是三栏全部float浮动，但左右两栏加上负margin让其跟中间栏div并排，以形成三栏布局。

**不同在于解决”中间栏div内容不被遮挡“问题的思路不一样**：圣杯布局，为了中间div内容不被遮挡，将中间div设置了左右padding-left和padding-right后，将左右两个div用相对布局position: relative并分别配合right和left属性，以便左右两栏div移动后不遮挡中间div。

双飞翼布局，为了中间div内容不被遮挡，直接在中间div内部创建子div用于放置内容，在该子div里用margin-left和margin-right为左右两栏div留出位置。多了1个div，少用大致4个css属性（圣杯布局中间divpadding-left和padding-right这2个属性，加上左右两个div用相对布局position: relative及对应的right和left共4个属性，一共6个；而双飞翼布局子div里用margin-left和margin-right共2个属性，6-2=4），个人感觉比圣杯布局思路更直接和简洁一点。
