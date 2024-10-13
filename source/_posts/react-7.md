---
title: 前端学习之React中的组件复用
date: 2020-09-22 23:42:23
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

##  render props 模式

**render prop** 是指一种在 React 组件的 render 方法使用一个值为函数的 prop （该函数返回一个React 元素）以共享代码的简单技术；

+ 在需要被复用的组件内，提供复用的状态逻辑代码，如状态和操作状态的方法；
+ 将复用的状态作为传入组件的 render 方法的参数，暴露到组件外；
+ 组件使用时，传入 React 元素，并根据状态做各种不同需求的定制；

```jsx
<Mouse render={mouse => (
    <Component {...this.props} mouse={mouse} />
  )}/>
```

### children 代替 render 属性

使用 children 子节点作为函数传入，更显直观，也就是直接放置到元素的*内部*：

```jsx
<Mouse>
  {mouse => (
    <p>鼠标的位置是 {mouse.x}，{mouse.y}</p>
  )}
</Mouse>
```

由此我们可以想到在 Context 传参时的 Consumer，也是一种使用 children 的 render props 模式的做法；

### children 校验

推荐使用 propsTypes 给 render props 模式添加 props 校验：

```jsx
Mouse.propTypes = {
  children: PropTypes.func.isRequired
};
```

## 高阶组件（HOC）

高阶组件（Higher-Order Component）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式（包装/装饰模式）；

实际上，高阶组件是一个**参数为组件，返回值为新组件的函数**，  其内部会创建一个类组件，在类组件中土工复用的状态逻辑，通过 props 将复用状态传递给被包装组件；

+ 创建一个函数，名称约定以 with 开头；
+ 指定函数参数，参数应该以大写字母开头（作为要渲染的组件）；
+ 在函数内部创建一个类组件，提供父用的状态逻辑代码，并返回；
+ 在新创建的类组件中，渲染参数组件，同时将状态通过 props 传递到参数组件；
+ 调用高阶组件，传入需要增强的组件，把返回值作为组件渲染；

```jsx
function withMouse(WrappedComponent){
  class Mouse extends React.Component{
    state = {}
 		render(){
      return <WrappedComponent {...this.state}/>
    }
  }
}
const MousePosition = withMouse(Position);
// <MousePosition/>
```

### 设置 displayName 

同一个高阶组件，装饰/包装后的组件，在渲染到页面后，其组件名称是相同的，因为默认情况下，React 使用组件名称作为 displayName；

为了更好地使用 React Developer Tools 工具进行调试，我们需要区分这些组件：

```jsx
Mouse.displayName = `WithMouse${getDisplayName(WrappedComponent)}`
function getDisplayName(WrappedComponent){
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}
```

### 无法透传 props

在使用高阶组件返回的组件时，如果传入了 props，高阶组件内部并没有将该props 继续传入到内部的类组件，而是只传递了 state ，解决方法也很简单，一起传入即可：

```jsx
render(){
  return <WrappedComponent {...this.state} {...this.props}/>
}
```