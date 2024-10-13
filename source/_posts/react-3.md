---
title: 前端学习之React中的组件
date: 2020-09-13 22:12:23
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 组件简介

+ 组件是React的一等公民，使用React就是在用组件

+ 组件表示页面中的部分功能

+ 组合多个组件实现完整的页面

+ 功能特点：可复用、独立、可组合

## 组件的创建方式

### 使用函数创建组件

+ 函数名称首位必须是大写字母；
+ 函数组件必须有返回值，表示组件的结构；

+ 返回值为 null ，则不渲染任何内容；
+ 渲染时用函数名作为标签名使用；

```jsx
function Hello(){
  return <div>Hello World!</div>
}
ReactDOM.render(
  <Hello/>,
  document.getElementById('root')
);
```

### 使用类创建组件 

+  类名称首位也必须大写；

+ 使用ES6的 class 创建组件，需要继承自 React.Component 父类；
+ 需要提供`render`方法，并必须有返回值描述组件结构；

```jsx
class Hello extends React.Component{
  render = () => (<div>Hello World</div>) 
}
ReactDOM.render(
  <Hello/>,
  document.getElementById('root')
);
```

  ### 抽离组件为单独JS文件

```jsx
// Hello.js
const Hello = () =>(
  <div>Hello World</div>
);

export default Hello;
```

若是类组件，需要在组件 Js 文件中导入 **React**；

```jsx
// index.js
import Hello form './Hello'
ReactDOM.render(
  <Hello/>,
  document.getElementById('root')
);
```

## 有状态 / 无状态组件

函数组件又叫无状态组建，类组件又叫有状态组件，状态即数据；

+ 函数组件没有自己的状态，只负责数据展示；
+ 类组件有自己的状态，负责更新UI，让页面动态变化；

### state 的基本使用

通过一个计数器的案例，可以清晰了解使用方式：

```jsx
class Counter extends React.Component {
  constructor() {
    super()
    this.state = {
      count: 0
    }
  }
  render() {
    return (<div>
        <p>计数器: </p>
        <button onClick={() => {
            this.setState({
              count: this.state.count + 1
            })
          }}> {this.state.count}</button>
      </div>)
  }
}
```

+ `state`是一个组件私有的存储数据的对象；
+ `setState({state})`修改状态，不能直接修改 **state** 的值；`setState()`的作用是修改 `state`更新UI，这是数据驱动视图思想的体现；

### 事件绑定 this 指向

当将JSX中的逻辑代码抽离到单独的函数方法时，会报错调用了 **undefined** 的 `setState`方法，也就是函数内没有 组件 this 这个上下文；

可直接使用箭头函数

可以通过`Function.Prototype.bind()`在构造函数中绑定

```jsx
class Counter extends React.Component{
  constructor() {
    this.click = this.click.bind(this)
  }
  click(){
    this.setState({
      count: this.state.count + 1
    })
  }
  render(){
    return <button onClick={this.click}> {this.state.count}</button>
  }
}
```

## 受控 / 非受控组件

### 受控组件

在 HTML 中，表单元素（如`<input>`、 `<textarea>` 和 `<select>`）是根据用户输入进行更新数据的,也就是自己维护着一个 state,而在 React 中，可变状态（mutable state）通常保存在组件的 state 属性中，并且只能通过使用 `setState()`来更新。

 React 将 state 和表单元素的 value 结合起来,使 state 成为“唯一数据源”。被 React 以这种方式控制取值的表单输入元素就叫做**受控组件**。

```jsx
class Form extends React.Component{
    constructor(){
        super()
        this.state = {
            txt: ''
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event){
        this.setState({
            txt: event.target.value
        })
    }
    render(){
        return (
            <input type='text' value={this.state.txt} onChange={this.handleChange}>
            </input>
        )
    }
}
```

#### 多表单元素优化

1. 给表单元素添加 `name`属性，名称与 `state `相同；
2. 根据表单元素类型获取对应值；
3. 在事件处理程序中通过`[name]`来修改对应的 `state`；

 ```jsx
 class Form extends React.Component{
     constructor(){
         super()
         this.state = {
             text: '',
             content: '',
             fruit: 'orange',
             isMarried: false
         }
         this.handleChange = this.handleChange.bind(this)
     }
     handleChange(event){
         const target = event.target
         const value = target.type === 'checkbox' ? target.checked : target.value
         const name = target.name
 
         this.setState({
             [name]: value
         })
     }
     render(){
         return (
             <div>
             <input name="text" type='text' value={this.state.text} onChange={this.handleChange}/>
             <textarea name="content" type="text" value={this.state.content} onChange={this.handleChange}></textarea>
             <select name="fruit" value={this.state.fruit} onChange={this.handleChange}>
                 <option value="apple">苹果</option>
                 <option value="orange">橘子</option>
             </select>
             <input name="isMarried" type="checkbox" checked={this.state.isMarried} onChange={this.handleChange}/>
 
             </div>
         )
     }
 }
 ```

> 这里使用了 ES6 计算属性名称的语法更新给定输入名称对应的 state 值：
>
> ```js
> var partialState = {};
> partialState[name] = value;
> this.setState(partialState);
> ```

### 非受控组件

借助于 `ref`（获取DOM或组件），使用原生DOM方式来获取表单元素值：

+ 调用 `React.createRef()`方法创建一个 `ref `对象；

  ```jsx
  constructor(){
    super()
    this.textRef = React.createRef()
  }
  ```

+ 将创建好的 `ref `对象添加到文本框中；

  ```jsx
  <input type="text" ref={this.txtRef}/>
  ```

+ 通过 `ref` 对象获取到文本框的值；

  ```jsx
  console.log(this.txtRef.current.value)
  ```



