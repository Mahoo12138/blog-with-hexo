---
title: React 18 中 StrictMode 下重复渲染组件
date: 2022-07-30 12:58:05
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 技术教程
tags:
- React
- 前端
---

## 前言

当升级到最新的 React 18 后，在分析测试代码时，常遇到组件渲染两次的情况。调试了很久，发现是`React.StrictMode`的问题；

当然，之后我去谷歌搜索时，发现早已有人注意到了这个行为，不过他们在 `React` 官方仓库上发起 [issue](https://github.com/facebook/react/issues/24467)，把这当做一个 bug 上报，React 社区维护人员给出了相关文档说明。

## 什么是 React.StrictMode

`React.StrictMode` 是在 2018 年的 16.3.0 版本中引入的组件。一开始，它只用在类组件中，而在 16.8.0 中，它对 hook 同样适用。以下是官方文档中的说明：

> `StrictMode` 是一个用来突出显示应用程序中潜在问题的工具。与 `Fragment` 一样，`StrictMode` 不会渲染任何可见的 UI。它为其后代元素触发额外的检查和警告。

总之，严格模式检查是为了开发者更好的编写 React 而出现的，且仅在开发模式下运行，更具体的使用场景可以查阅官方文档；

## 为什么会渲染两次呢

我们从使用 `React.StrictMode` 中获得的好处之一是，它帮助我们检测到渲染期生命周期的预期之外的副作用。

`React.StrictMode` 不能马上检测到副作用，但是它可以通过故意调用一些关键函数两次，来帮助我们发现副作用。

这些函数有:

- 类组件 `constructor`、`render` 以及 `shouldComponentUpdate` 方法
- 类组件静态 `getDerivedStateFromProps` 方法
- 方法组件的方法体
- 状态更新函数 (`setState` 的第一个参数)
- 传给 `useState`、`useMemo`、或 `useReducer` 的函数

此外在[官方文档 - 确保可复用的 state](https://zh-hans.reactjs.org/docs/strict-mode.html#ensuring-reusable-state) 中也提到了一个问题：

> 在未来，我们希望增加一个功能，允许 React 在保留 state 的同时对 UI 进行增删。例如，当用户从当前屏幕的标签离开并返回时，React 应该能立即展示之前屏幕的内容。为了做到这一点，React 支持使用卸载前已有的组件状态重新挂载到树上。

为了帮助解决这些问题，React 18 为严格模式引入了一个全新的仅用于开发环境的检查操作。每当第一次安装组件时，**这个新的检查将自动卸载并重新安装每个组件，并在第二次挂载时恢复之前的 state**。