---
title: 前端学习之React中的CSS动画效果
date: 2020-09-27 22:52:12
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
- CSS
---

## CSS 过渡动画

创建一个组件，包含一个按钮和文本，点击按钮实现，文本的显示和隐藏：

```jsx
class App extends React.Component{
  click(){
    console.log("Animation")
    this.setState({
      flag: !this.state.flag
    })
  }
  constructor(){
    super()
    this.state = {
      flag: true
    }
    this.click = this.click.bind(this)
  }
  render(){
    return  (
      <Fragment>
        <p className={this.state.flag ? 'show' : 'hide'}>Hello World</p>
        <button onClick={this.click}>Toggle</button>
      </Fragment>
    ) 
  }
}
```

以下是CSS样式代码：

```css
.show{
  opacity: 1;
  transition: all 500ms ease-in;
}
.hide{
  opacity: 0;
  transition: all 500ms ease-in;
}
```

## CSS 动画效果

同样是上面的显示和消失效果，只需要修改CSS样式文件：

```jsx
.show{
  opacity: 1;
  animation: show-item 2s ease-in forwards;
}
.hide{
  opacity: 0;
  animation: hide-item 2s ease-in forwards;
}

@keyframes show-item {
  0%{
    opacity: 0;
    color: chartreuse;
  }
  50%{
    opacity: 0.5;
    color: blueviolet;
  }
  100%{
    opacity: 1;
    color: red;
  }
}

@keyframes hide-item {
  0%{
    opacity: 1;
    color: chartreuse;
  }
  50%{
    opacity: 0.5;
    color: blueviolet;
  }
  100%{
    opacity: 0;
    color: red;
  }
}
```

## react-transition-group 实现动画

安装：`npm install react-transition-group --save`，该模块提供了四种组件，其中`Transition`是平台无关的基组件，其他三个都是衍生出来的具有特定功能的组件：

- [Transition](https://reactcommunity.org/react-transition-group/transition)
- [CSSTransition](https://reactcommunity.org/react-transition-group/css-transition)
- [SwitchTransition](https://reactcommunity.org/react-transition-group/switch-transition)
- [TransitionGroup](https://reactcommunity.org/react-transition-group/transition-group)

实现最基本的动画，只需要引入`CSSTransition`组件包裹需要动画效果的组件，该组件有很多 props 属性，先学习一些最基本的：

+ `classNames`：指定该组件动画所使用的类前缀 `prefix`；

+ `in`：当`in`为 **true** 时，会添加类`prefix-enter`，下一帧则会添加`prefix-enter-active`，`CSSTransition`会在 `example-enter-active`添加前，强制触发回流；相应的，当`in`为 **false** 时，对应的则是类`prefix-exit`等
+ `timeout`：动画执行的时间，单位毫秒，可指定所有动画统一时长，可以传入对象，分别指定；

同样以上面的按钮文字作为案例：

```jsx
<Fragment>
  <CSSTransition
    classNames="hello"
    timeout={1000}
    in={this.state.flag}
    >
    <p>Hello World</p>
  </CSSTransition>
  <button onClick={this.click}>Toggle</button>
</Fragment>
```

当使用`CSSTransition`组件后，内部需要动画的组件，会在特定的时刻绑定到下面的 CSS 类：

```css
/* 入场动画第一帧 */
.hello-enter {
  opacity: 0;
}
.hello-enter-active {
  opacity: 1;
  color: blue;
  transition: all 3s ease-in;
}
.hello-enter-done {
  opacity: 1;
  color: blue;
}
.hello-exit {
  opacity: 1;
  color: blue;
}

.hello-exit-active {
  opacity: 1;
  color: red;
  transition: all 3s ease-in;
}
.hello-exit-done {
  opacity: 0;
}
```

点击按钮（in: flase => true）后 hello 文本渐渐浮现，且逐渐变成蓝色；再次点击按钮（in: true => flase），文本从蓝色逐渐变为红色，并渐渐消隐；

但是我们会发现一个问题，当修改样式文件保存刷新以后，文本没有上述 CSS 中任一个类，是原始的样式；所以就有这样的一个 props 属性 `appear`，它决定着`enter`动画开始前的组件的样式动画，不管`in`的值如何，例如：

```css
.hello-appear{
  opacity: 1;
  color: fuchsia;
}
.hello-appear-active{
  opacity: 0;
  color:yellow;
  transition: all 3s ease-in;
}
.hello-appear-done{
  opacity: 0;
}
```

这样的话，当我们每次刷新时，文本都会紫色变黄，渐隐，不过，需要`in`属性是设置为 **true** 的，`appear `才生效；`hello-appear-done`之后，`hello-enter-done`类会覆盖样式；

### 钩子函数

`react-transition-group`除了可以动态改变样式，实现动画之外，还提供了多个钩子函数如：**onEnter**，**onEntering**，**onEntered**，以及相应的 **exit** 系钩子，钩子函数的第一个参数是一个 html 元素，**enter** 系钩子还有第二个参数，表明当前是否是在挂载阶段，因为`appear`阶段也会触发 **enter** 系钩子函数；

### 多个组件动画

若有一个列表组件，需要在增加元素和删除元素时，都加上动画，那么`<TransitionGroup>`就排上用场了；

+ 

用法比较简单，一气呵成：

```jsx
class App extends React.Component {
  click() {
    this.setState((prevState)=>{
      return {
        list: [...prevState.list,"item"]
      }
    })
  }
  constructor() {
    super()
    this.state = {
      list: []
    }
    this.click = this.click.bind(this)
  }
  render() {
    return (
      <Fragment>
        <TransitionGroup>
          {
            this.state.list.map((item, index)=>
              <CSSTransition
                key={index}
                classNames="hello"
                timeout={3000}
            	>
              	<div>{item}</div>
            	</CSSTransition>
            )
          }
        </TransitionGroup>
        <button onClick={this.click}>Toggle</button>
      </Fragment>
    )
  }
}
```