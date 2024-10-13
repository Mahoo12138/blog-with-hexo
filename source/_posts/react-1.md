---
title: 前端学习之 React 简介与基本使用
date: 2020-09-10 17:12:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 什么是 React

React 是一个用来构建用户界面（HTML 页面）的 JavaScript 库，如果从 MVC的角度看，React仅仅是视图层，也就是只负责视图的渲染，而并非完整的M和C的功能；

React 来源于 FaceBook 的内部项目，并于 2013 年 5 月开源；

### 特点

+ **声明式**：只需要描述的UI（HTML）形式，框架负责渲染并根据数据实时更新；
+ **基于组件**：是框架中最重要的内容，一个页面由多个组件组合或复用构成；
+ **一次学习，跨平台编写**：可开发Web应用，移动端APP；
+ 可以与其他框架并存，单向数据流，视图层框架，函数式编程

## React 基本使用

### 安装

```bash
npm i react react-dom
```

+ react 包是核心，提供创建元素，组件等功能；
+ react-dom 包提供DOM相关功能；

### 使用

1. 引入 js 文件

   ```html
   <script src="./node_modules/react/umd/react.development.js"></script>
   <script src="./node_modules/react-dom/umd/react-dom.development.js"></script>
   ```

2. 创建 react 元素，该方法了解即可：

   ```js
   // 参数: 标签, 属性, 子节点
   const title = React.createElement('h1',{id: 'title   '},'Hello World')
   ```

3. 渲染 React 元素，重要方法：

   ```js
   // 需要在页面中加入root元素: <div id="root"></div>
   ReactDOM.render(title,document.getElementById('root'))
   ```

## React 脚手架使用

### 脚手架意义

+ 脚手架是现代Web应用开发的必备
+ 充分利用Webpack，Babel，ESLint等工具辅助项目开发
+ 零配置，无需手动配置繁琐的工具即可使用
+ 关注业务，而不是工具配置

### 脚手架初始化项目

```bash
# 初始化项目
npx create-react-app my-app
# 启动项目
npm start # yarn start
```

> npm 从v5.2.0版开始，增加了 npx 命令：
>
> 目的：提升包内提供的命令行工具的使用体验；
>
> + **调用项目安装的模块**：之前是需要先安装脚手架包，再使用包中提供的命令；
> + **避免全局安装模块**：在运行全局模块指令时，会下载到一个临时目录，使用以后再删除；
>
> 原理：npx 的原理很简单，就是运行的时候，会到`node_modules/.bin`路径和环境变量`$PATH`里面，检查命令是否存在；
>
> 一些参数：
>
> + `--no-install`：强制使用本地模块，不下载远程模块，如果本地不存在该模块，就会报错；
> + `--ignore-existing`：强制安装使用远程模块；

### 脚手架中使用

```js
// 导入包后,步骤相同
import React from 'react';
import ReactDOM from 'react-dom';
```

