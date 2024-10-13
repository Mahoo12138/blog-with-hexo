---
title: 简单入门CSS预处理器Less和Sass
date: 2020-03-08 16:00:21
categories: 
- 学习笔记
tags:
- Less
- Sass
---

Sass和Less都属于CSS预处理器，CSS预处理器定义了一种新的语言，其基本的思想是，用一种特殊的语言，为CSS增加一些编程的特性，如变量、语句，函数、继承等概念。将CSS作为目标生成文件，然后开发者就只要使用这种语言进行CSS的编码开发工作。目前比较流行的有[**Sass**](https://sass-lang.com/)、[**less**](http://lesscss.org/)和**stylus**，我主要学习前两种。

## 注释

在 less 和 Sass 中，单行的注释是不会被编译到 CSS 文件中的；

只有多行注释，也就是 CSS 中原本的代码注释，才会被编译生成到 CSS 文件中。

## 变量，插值，作用域

在 less 使用`@`定义变量，而在 Sass 中则使用`$`定义变量；

当把属性作为变量时，这也就是插值。插值的操作与定义变量略有不同，只是在引用变量时需要加上`@`和`{}`，而且选择器中也可以使用插值；Sass 中，使用`#`和`{}`完成插值操作，不过带上了变量前的`$`；

作用域很好理解，就像 Javascript 的那种变量的就近查找原则，也就是在`.box1`中的**width**和**height**属性的值都为**200px**，会优先在选择器内查找变量；Sass 唯一的不同之处在于`width:100px`而`height:200px`，这个顺序有差别。

```less
@number: 100px;
@key: height;
@i: 2;

.box1{
    // 作用域
    width: @number;
    @number: 200px;
    @{key}: @number;
}
.box@{i}{
    
}
```

```scss
$number: 100px;
$key: height;

.box1{
    width: $number;
    $number: 200px;
    #{$key}: $number;
}
```

## 选择器嵌套，伪类嵌套，属性嵌套(Sass)

**选择器嵌套**在CSS预编译中很常见，因为在编写带有很多子元素且一级一级嵌套的元素的样式时，往往需要很多选择器，在一级一级选择时，选择器不可避免会重复编写，而选择器的嵌套则可以一次性编写，但是编译产生的 css 还是css的语法，这样提高开发效率；在 Sass 中是完全一样的

```less
// less 代码
ul{
    list-style: none;
    li{
        float: left;
        div{
            margin: 10px;
        }
        p{
            font-size: 16px;
        }
    }
}
```

```css
/* 编译生成的css */
ul {
  list-style: none;
}
ul li {
  float: left;
}
ul li div {
  margin: 10px;
}
ul li p {
  font-size: 16px;
}
```

**伪类嵌套**也就是在选择器内部编写其伪类的样式，只需要在伪类前添加`&`即可，Sass 也是完全一样的：

```less
div{
    &:hover{
        color: red;
    }
    img{}
}
```

**属性嵌套**是在编写一些围绕某种属性的样式时，可以嵌套，在 Less 中不支持，具体可以看代码：

```scss
// scss 文件
div{
    font: {
        size: 16px;
        weight: bold;
        family: 微软雅黑;
    }
}
```

```css
/* 编译生成的css */
@charset "UTF-8";
div {
  font-size: 16px;
  font-weight: bold;
  font-family: 微软雅黑;
}
```

注意`:`后的空格不能少，否则会编译错误

## 运算，单位，转义，颜色

在变量使用时，可以对其做需要的运算，而涉及到不同的单位的量运算时，会以第一个变量为基准进行转化，而转义则是将某个代码段不经过编译直接输出到 CSS 中，颜色的RGB值也是可以进行运算的；

```less
// less 文件
@num: 100px;

.box2{
    width: @num * 3;
    height: @num + 10em;
    margin: 10em + @num;
    padding: 20px / 2;
    padding: ~"20px / 2";
    color: #101010 * 2;
}
```

```css
/* 编译生成的css */
.box2 {
  width: 300px;
  height: 110px;
  margin: 110em;
  padding: 10px;
  padding: 20px / 2;
  color: #202020;
}
```

在 Sass 中单位不同，是不能进行运算的，而且默认`/`是分割的操作不进行运算，如果需要做运算需要用`()`做转义；

```scss
// scss 文件
$num: 100px;

.box2{
    width: $num * 3;
    // height: $num + 10em;
    padding: 20px / 2;
    padding: (20px / 2);
    color: #010101 * 3;
}
```

## 内置和自定义函数

```less
// less 和 Sass 文件
.box {
    width: round(3.5px);
    height: percentage(0.2);
}
```

```css
/* 编译生成的css */
.box {
    width: 4px;
    height: 20%;
}
```

 对于 Less 和 Sass 中的内置函数，并不是完全通用，可以在官方的API文档查询所需函数。

----

在 Sass 中还可以自定义函数，使用参考一下代码：

```scss
@function sum($n, $m){
    @return $n + $m
}

.box {
    width: sum(2px + 3px);
}
```

## 混入，命名空间，继承

当编写一个样式时，可以像函数一样在另一个样式中引入，称为混入，当样式选择器添加了`()`，如==.hide()==，则其原本的样式不会在编译后的 css 文件中复现，而且当添加了括号时，还可以进行传参操作：

```less
// less 文件
.show {
    display: block;
}
.hide(@color) {
    display: none;
    color: @color;
}

.box {
    width: 100px;
    .show;
    .hide(red);
}
```

```css
/* 编译生成的 css */
.show {
    display: block;
}
.box {
    width: 100px;
    display: block;
    display: none;
    color: red;
}
```

在 Sass 中并不是类似选择器的方式编写混入，而是使用关键词`mixin`标记混入的样式，用`include`引入混入样式，同样的可以添加`()`进行传参：

```scss
// scss 文件
@mixin show {
    display: bolck;
}
@mixin hide($color) {
	display: none;
    color: red;
}


.box {
    width: 100px;
    @include show;
    @include hide(red);
}
```

```css
/* 编译生成的 css */

.box {
    width: 100px;
    display: block;
    display: none;
    color: red;
}
```

-----

Less 中的命名空间是针对混入的一个扩展，上述代码中的混入都是在全局中定义的，而命名空间的引入，可以定义多个混入，可以更灵活的开发：

```less
#name(){
    .show {
        display: inline-block;
        width: 100px;
    }
}
.box {
    #name.show;
}
```

---

继承跟混入形式和功能上都很相像，不过会更精简代码：

```less
// less 文件
.both {
    display: block;
}

.box1{
    &:extend(.both);
}
.box2{
    &:extend(.both);
}
```

```css
/* 编译生成的 css */
.both,.box1,.box2{
    display: block;
}
```

---

```scss
// scss 文件
.both {
    display: block;
}

.box1{
    @extend .both;
}
.box2{
    @extend .both;
}
```

在 Scss 中大致类似的用法，不过可以将`.both`改成`%both`，这样 both 样式就不会在 css 文件中编译生成了。

## 合并，媒体查询

```less
// less 文件
.box {
    background+: url(a.png); 
    background+: url(b.png); 
	transform+_: scale(2);
    transform+_: rotate(30deg);
}
```

```scss
// scss 文件
$background: {
    a: url(a.png),
    b: url(b.png)
};
$transform: {
    a: scale(2),
    b: roate(30deg)
};

.box {
	background: map-values($background);
    transform: zip(map-values($transform)...); 
}
```

```css
/* 编译生成的 css */
.box {
	background: url(a.png), url(b.png);
    transform: scale(2) rotate(30reg);
}
```

----

```less
// less & scss 文件
.box {
    width: 200px;
    @media all and (min-width: 768px){
        width: 600px;
    }
    @media all and (min-width: 1440px){
        width: 900px;
    }
}
```

```css
/* 编译生成的 css */
.box {
	width: 200px;
}
@media all and (min-width: 768px){
    .box{
        width: 600px;
    }
}
@media all and (min-width: 1440px){
    .box {
        width: 900px;
    }
}
```

## 条件，导入，循环

