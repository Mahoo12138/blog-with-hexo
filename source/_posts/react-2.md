---
title: 前端学习之React中的JSX
date: 2020-09-11 15:42:04
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## JSX的基本使用

> 为什么不使用`React.createElement()`？
>
> + 繁琐不够简洁
> + 结构不够直观，无法一眼看出
> + 不够优雅，用户体验差

 **JSX** 是 **JavaScript XML** 的简写，表示在 JavaScript 代码中写 XML（HTML）格式的代码；

```jsx
const title = <h1>Hello JSX</h1>
ReactDOM.render(
  title,
  document.getElementById('root')
);
```

**为什么脚手架中可以使用JSX语法？**

+ JSX 并不是标准的 ECMAScript 语法，是其的扩展；
+ 需要 Babel 编译处理后，才能在浏览器环境中使用；
+ create-react-app 脚手架中默认有编译的配置，无需手动设置；
+ 编译JSX语法的包为：[@babel/preset-react]()

使用 JSX 语法的几个注意点：

+ JSX中React元素使用驼峰命名法，还有一些特殊属性：class => className，for  => htmlFor，tabindex => tabIndex；
+  没有子节点的React元素可用`/>`结束；
+ 推荐使用小括号包裹 JSX，避免 JS 中的自动插入分号陷阱；
+ 使用 JSX 返回的组件必须为单个 html 元素，也可以使用 `Fragment`作为占位符包裹； 

## JSX中使用JS表达式

使用`{}`在JSX中嵌入Javascript表达式：

```jsx
let name = "Mahoo"
const title = <h1>Hello {name}</h1>
```

在`{}`可以使用任何合法的JavaScript表达式；

比较特殊的像函数表达式，以及JSX自身也是表达式；不过，对象却是一个例外，一般在JSX中作为元素样式属性；

JSX 中不能出现语句如`if`，`for`等条件，循环语句，会编译错误；

## JSX的条件渲染

条件渲染：根据条件渲染特定的JSX结构

适用场景：Loading 的加载

可通过`if/else`语句，三元运算符和逻辑与运算符实现条件渲染：

```jsx
const isLoading = false
const loadData = () => {
  if (isLoading) {
    return <div>Loading</div>
  }else{
    return (isLoading)?(<div>Loading...</div>)
    									:(!isLoading && (<div>Loading Over</div>))
  }
}
```

## JSX的列表渲染

如果需要渲染一组数据，可使用数组的`map()`方法；

原则：`map()`遍历谁，就给谁添加 key 属性；

注意渲染列表时，应该添加 key 属性，并且保证属性的值要唯一，尽量避免使用所应好作为 key ；

```jsx
const songs = [
  {id:1,name:'彩虹'},
  {id:2,name:'七里香'},
  {id:3,name:'黑色幽默'},
]
const list = (
  <ul>
    {songs.map(item => (<li key={item.id}>{item.name}</li>))}
  </ul>
)
```

## JSX的样式处理

1. 行内样式 —— style

   ```jsx
   <h1 style={{color: 'red',backgroudColor: 'blue'}}>Hello</h1>
   ```

2. 类名 —— className

   ```jsx
   import './index.css';
   const title = (
     <h1 className="title">Hello</h1>
   )
   ```

> React 完全利用 Js 语言自身的能力来编写 UI，而不是造轮子增强 HTML 功能；

