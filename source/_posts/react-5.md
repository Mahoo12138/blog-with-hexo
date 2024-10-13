---
title: 前端学习之React中的组件通信
date: 2020-09-19 16:18:58
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 组件接收数据

组件是封闭的，要接收外部数据应该通过 props 来实现；

在组件中，通过标签给添加属性传递数据，而接收数据时，函数组件通过参数 `props `接收，类组件通过 `this.props` 接收；

+ 可以给组件传递任何数据类型的数据，包括 JSX 结构的表达式；
+ props 是只读的对象，无法修改属性，会报错；
+ 使用类组件，若有构造函数，应该将 props 传递给 super() ，否则无法在构造函数中获取到 props ；

```jsx
class Commu extends React.Component{
    render(){
        this.props.fn()
        console.log(`props`, this.props)
        return (
            <div>
                name: {this.props.name}
                {this.props.tag}
            </div>
        )
    }
}

ReactDOM.render(
  <Commu
    name="jack"
    age={22}
    color={["red", "yellow", "blue"]}
    fn={() => { console.log(`function`) }}
    tag={<p>I am p tag</p>}
  />,
  document.getElementById('root')
);
```

### props 深入

1. `children`属性：表述组件标签的子节点，和 props 一样，其值可以是任意值

     ```jsx
     function Hello(props){
       return (
       	<div>组件的子节点：{props.children}</div>
         // 组件的子节点：我是子节点
       )
     }
     <Hello>我是子节点</Hello>
     ```

2. `props `校验：当组件传入的数据不对时，会报错；可使用校验机制，明确指出 props 类型格式等，可以捕获导致的错误，给出明确的提示，需要安装依赖包 **prop-types**； 

   ```jsx
   App.propTypes ={
     // 组件名赋值属性 propTypes
     colors: PropTypes.array
   }
   ```

   常见类型：array，bool，func，number，object，string

   React元素类型：element，必填项：isRequired，特定结构的对象：shape({})

3. `props `默认值： 给组件 props 传入默认值，未设置 props 时生效，使用场景有分页组件的默认显示条数；

   ```jsx
   App.defaultProps = {
     pageSize: 10
   }
   ```

4. 

## 三种组件通讯

### 父子组件通信

+ 父组件提供传递的 state 数据
+ 给子组件添加属性，值为 state 中的数据
+ 子组件通过 props 属性接收到传递的数据

### 子父组件通信

大致的思想是，利用回调函数，父组件提供回调作为子组件的参数 props ，子组件调用，将要传递的数据作为回调函数的参数；

父组件提供回调函数，用于接收数据，该函数作为属性传递给子组件：

```jsx
class Parent extends React.Component {
  state={
    data: ''
  }
	receiveData = (params) => {
  	this.setState({
    	data: params
  	})
	}
  render() {
    return (
      <div className="parent">
        父组件 data:{this.state.data}
        <Child getData={this.receiveData}/>
      </div>
    )
  }
}
```

子组件通过 props 调用回调函数，并将要传递的数据作为参数传入：

```jsx
class Child extends React.Component {
  state={
    data: "data from child"
  }
	emitData = ()=>{
  	this.props.getData(this.state.data)
	}
	render() {
    return (
      <div className="child">子组件
        <button onClick={this.emitData}>发送数据</button>
      </div>
    )
	}
}
```

### 兄弟组件通信

基本思想：状态提升，将兄弟组件需要共享的状态，提升到最近的公共父组件中，由公共父组件管理这个状态：

+ 提供共享的状态
+ 提供操作共享状态的方法

拿之前的计数器例子来说，我们使用两个子组件显示计数状态，将状态存储在父组件：

```jsx
class Child1 extends React.Component {
  handleAdd = ()=>{
    this.props.add()
  }
  render() {
    return (
      <div>
        子计数器1：{this.props.count}
        <button onClick={this.handleAdd}>+1</button>
      </div>
    )
  }
}
class Child2 extends React.Component {
  handleAdd = () =>{
    this.props.add()
  }
  render() {
    return (
      <div>
        子计数器2：{this.props.count}
        <button onClick={this.handleAdd}>+1</button>
      </div>
    )
  }
}

class Counter extends React.Component {
  state ={
    count: 0
  }
  change= () => {
    this.setState({
      count: this.state.count + 1
    })
  }
  render() {
    return (<div>
        <Child1 add={this.change} count={this.state.count}/>
        <Child2 add={this.change} count={this.state.count}/>
      </div>)
}
```

### 跨组件通信——Context

1. 使用`React.createContext()` 创建 **Provider**（提供数据）和 **Consumer**（消费数据）两个组件；

   ```jsx
   const {Provider, Consumer} = React.createContext()
   ```

2. 使用 **Provider** 作为父节点，并将要传递的数据设为 value；

   ```jsx
   <Provider value="mahoo12138">
     <div className="App">
       <Child1/>
     </div>
   </Provider>
   ```

3. 设置 Consumer 组件接收数据；

   ```jsx
   <Consumer>
     {data => 
     	<div className="child">{data}</div>
     }
   </Consumer>
   ```

一个简单的嵌套组件的Demo如下：

```jsx
const { Provider, Consumer } = React.createContext()

export default class App extends Component {
  render() {
    return (
      <Provider value="mahoo12138">
        <div className="app">
          <Node />
        </div>
      </Provider>
    )
  }
}
class Node extends Component {
  render() {
    return (
      <div className="node">
        <SubNode />
      </div>
    )
  }
}
class SubNode extends Component {
  render() {
    return (
      <div className="subnode">
        <Child />
      </div>
    )
  }
}

class Child extends Component {
  render() {
    return (
      <div>
        <Consumer>
          {data => 
          <div className="child">
          子节点:{data}
        </div>
          }
        </Consumer></div>
    )
  }
}
```

## 组件的生命周期

组件的生命周期：组件从被创建到挂载到页面中运行，再到组件不用时卸载的过程，只有类组件才有生命周期；

生命周期中的每个阶段总是伴随着一些方法调用，这些方法就是生命周期的钩子函数，这为开发者在不同阶段操作组件提供了时机；

组件的生命周期有助于理解组件的运行方式，完成更复杂的组件功能，分析组件错误的原因等；

![新的生命周期](D:\Mahoo12138\Picture\Development\react\2021071322465195.png)

### 创建时——挂载阶段

1. `constructor()`：初始化 state ，为事件处理函数绑定 this；
2.  `render()`：创建 jsx ，渲染 UI，注意不能在该钩子函数内调用 `setState()`；
3. `componentDidMount()`：发起网络请求，操作定时器，DOM等；

> `getDerivedStateFromProps` 会在调用 render 方法之前调用，并且在初始挂载及后续更新时都会被调用。它应返回一个对象来更新 state，如果返回 `null` 则不更新任何内容；
>
> 该钩子函数使用场景有限，适合 state 的值在任何时候都取决于 props 时。例如，实现 `<Transition>` 组件可能很方便，该组件会比较当前组件与下一组件，以决定针对哪些组件进行转场动画。

### 更新时——更新阶段

当 `props `改变、`setState()`和`forceUpdate()`方法调用时，进入更新阶段；

在`componentDidUpdate()`中调用`setState()`方法时，需要做逻辑判断否则也会导致循环调用；

> `getSnapshotBeforeUpdate()` 在最近一次渲染输出（提交到 DOM 节点）之前调用。它使得组件能在发生更改之前从 DOM 中捕获一些信息（例如，滚动位置）。此生命周期方法的任何返回值将作为参数传递给 `componentDidUpdate()`。
>
> `shouldComponentUpdate(nextProps,nextState)`主要用于性能优化(部分更新)，是唯一用于控制组件重新渲染的生命周期，由于在react中，setState以后，state发生变化，组件会进入重新渲染的流程，在这里return false可以阻止组件的更新；
>
> 因为react父组件的重新渲染会导致其所有子组件的重新渲染，这个时候其实我们是不需要所有子组件都跟着重新渲染的，因此需要在子组件的该生命周期中做判断；

### 卸载时——卸载阶段

当组件从页面中消失时，即进入卸载阶段，触发钩子函数`componentWillUnmount`，一般执行一些清理工作（如清除定时器）；
