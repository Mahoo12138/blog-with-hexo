---
title: hexo使用的不完全填坑指南
date: 2019-10-10 22:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---

## 在内容里 # 不要与 { 紧挨着

例如我的问题：

```
$\color{black}{red}$
```

出现错误时，黑色我用的是`#000`而不是`black`，然后在执行`hexo g`会有如下报错：

```shell
Template render error: (unknown path)
  Error: expected end of comment, got end of file
  ...
```

我的解决方法很特殊，一般只在{ 与 # 之间添加一个空格即可。

## 尽量不要将`{和{`连接在一起

+ 报错信息

  ```shell
  Template render error: (unknown path) [Line XX, Column XX]
    expected variable end
    ...
  ```

  后面还会附带文章的html代码，指出错误所在的准确位置；

+ 报错原因

  ```markdown
  机器周期=$12\times{ {1}\over{12}}MHz$=$1\mu{s}$。 
  ```

  经过查阅后发现， hexo 的文章渲染使用的是 `Nunjucks` ，因为在使用`mathjax`公式，造成了`{ {`重叠，而它会在生成文章时将那几个大括号识别成自己的语法，这样就会报错。。

+ 解决方法

  我的解决方法很弱智，但是有用，**在`{和{`间添加空格**，OK！