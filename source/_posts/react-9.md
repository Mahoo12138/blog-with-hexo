---
title: 前端学习之React报错指北
date: 2020-09-13 16:52:33
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

> Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.

报错含义大概是：超出最大更新深度。 当组件在 componentWillUpdate 或 componentDidUpdate 中重复调用 setState 时，就会发生这种情况。 React 限制嵌套更新的数量以防止无限循环。

```jsx
render() {
  return (
    <div className="child">子组件
      <button onClick={this.props.getData(this.state.data)}>发送数据</button>
    </div>
  )
}
// 父组件传来的函数
receiveData = (params) => {
  this.setState({
    data: params
  })
  console.log(`params`, params)
}
```

因为在按钮的事件里，我们给函数传参，加了括号`this.props.getData(this.state.data)`，代表函数立即执行；

在`render()`中是不能使用`setState`的，因为`setState`造成`state`改变，`state`改变就会重新渲染`render`，每次`render`又会`setState`，就会造成页面死循环。

想想就很容易理解，所以解决这个问题，应该传入一个函数指针，可以写成箭头函数，或者在组件里再添加一个方法：

```jsx
emitData = ()=>{
  this.props.getData(this.state.data)
}
<button onClick={this.emitData}>发送数据</button>
```

