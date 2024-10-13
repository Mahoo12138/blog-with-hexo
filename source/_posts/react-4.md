---
title: 前端学习之React中的事件处理
date: 2020-09-15 23:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 事件处理简介

React 元素的事件处理和 DOM 元素的很相似，但是有一点语法上的不同：

+ React 事件命名采取驼峰式，不是纯小写；
+ 在`{}`中传入一个函数作为事件处理函数，而不是一个字符串；

```jsx
function Event(){
  function click(){
    console.log("Mouse Clicked!");
  }
  return <button onClick={click}>EventBtn</button>
}

class Hello extends React.Component{
  click(){
    console.log("Mouse Clicked!")
  }
  render(){
    return  (<button onClick={this.click}>HelloBtn</button>) 
  }
}

ReactDOM.render(
  <div>
    <Event/>
    <Hello/>
  </div>,
  document.getElementById('root')
);
```

## 事件对象

可以通过事件处理程序的参数获取到事件对象；

React 中的事件对象叫做：合成事件（对象），合成事件：兼容所有浏览器，无需担心浏览器兼容问题；

```jsx
function handleClick(e){
  e.preventDefault()
  console.log('事件对象',e)
}
<a onClick={handleClick}>Button</a>
```

例如，对于一个 a 标签可以通过事件对象阻止其默认行为：

```jsx
class Label extends React.Component{
  click(e){
    e.preventDefault()
    console.log("Not goto link")
  }
  render(){
    return  (<a href="https://www.mahoo12138.cn/" onClick={this.click}>Blog</a>) 
  }
}
```

