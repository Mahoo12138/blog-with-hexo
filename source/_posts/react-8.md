---
title: React学习之Reac原理解密
date: 2020-09-30 21:32:44
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
---

## setState() 详解

###  更新数据是异步的

```jsx
this.state = {count: 1}
this.setState({count: this.state.count + 1})
console.log(this.state.count)		// 1
```

可以将 `setState()` 视为**请求**而不是立即更新组件的命令，给我们的启示是，在更新状态时，后面的 `setState()` 不要依赖于前面的`setState()`；而且多次调用，只会触发一次重新渲染；

例如，如果父组件和子组件在同一个 **click** 事件中都调用了`setState` ，这样就可以确保子组件不会被重新渲染两次，React 会将该 state “冲洗” 到浏览器事件结束的时候，再统一地进行更新。这种机制可以在大型应用中得到很好的性能提升。

### 推荐语法

+ state：表示最新的 state
+ props：表示最新的 props

这样的传入回调的语法即可保证每次拿到的 state 都是最新的，则可实现`setState`叠加更新数据请求了：

```jsx
this.setState((state, props)=>{
  return {
    count: state.count + 1
  }
})
```

### 回调函数

`setState`还有第二个参数，为一个回调函数，可在状态更新（页面重新渲染后），立即执行某个操作：

```jsx
this.setState(
	(state, props)=>{},
  ()=>{console.log("OK")}
)
```

## JSX 语法转化过程

+ JSX 仅仅是`createElement()`方法的语法糖(简化语法)

+ JSX 语法被`@babel/preset-react`插件编译为`createElement()`方法

+ React 元素是一个对象，用来描述你希望在屏幕上看到的内容

## 组件的更新机制



## 组件性能优化

+ 减轻 state ：只存储跟组件渲染相关的数据；反之，不用做渲染的数据则不要放在 state 中；
+ 需要在多个方法中共享的数据且又不涉及渲染的数据，可直接存储在组件实例`this`中；
+ 避免不必要的组件重新渲染：使用生命周期钩子函数`shouldComponentUpdate(nextProps, nextState)`根据业务是否返回 **false**；
+ 使用`PureComponent`，自动加载`shouldComponentUpdate`函数，当组件更新时，`shouldComponentUpdate`对 props 和 state 进行了一层**浅比较**，如果都没有发生改变，render方法就不会触发，省去Virtual DOM的生成和对比过程；
+ 浅比较（shallow compare）只对象的引用（地址）是否相同；所以对于引用类型应该创建新的数据而不是修改原数据；

## 虚拟DOM和Diff算法

虚拟DOM：本质上是一个 JS 对象，用于描述在屏幕上看到的内容；

+ 初次渲染时，React会根据初始 state (Model) ，创建一个虚拟DOM对象(树)。

+ 根据虚拟DOM生成真正的DOM，渲染到页面中。

+ 当数据变化后（setState()），重新根据新的数据，创建新的虚拟DOM对象(树)。
+ 与上一次得到的虚拟DOM对象，使用`Diff`算法对比(找不同) ，得到需要更新的内容。
+ 最终，React 只将变化的内容更新(patch)到DOM中，重新渲染到页面。

  