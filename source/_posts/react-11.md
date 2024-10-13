---
title: 前端学习之React中的Redux使用
date: 2020-09-27 22:52:12
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
- Redux
---

##  Redux 简介

React 是一个 UI 视图层框架，并不是 Web 应用的完整解决方案。有两个方面没涉及：

+ 代码结构

+ 组件之间的通信

正因如此，仅靠 React 很难写大型应用，2014年 Facebook 提出了 Flux 架构（一种思想，专门解决软件的结构问题，跟MVC 架构是同一类）的概念，引发了很多的实现。2015年，更优雅的 Redux 出现；

### 三大原则

- 单一数据源，即整个应用的 `state` 保存在唯一的一棵对象树中，使得同构应用变得容易且易于保存对象状态（持久化）；
- 状态只读，即 `state` 不能被修改；
- 通过 `纯函数` 来返回新状态以完成修改。

> 纯函数，指的是，只要是同样的输入，必定得到同样的输出；
>
> 纯函数是函数式编程的概念，必须遵守以下一些约束。
>
> + 不得改写参数
> + 不能调用系统 I/O 的API
> + 不能调用`Date.now()`或者`Math.random()`等不纯的方法，因为每次会得到不一样的结果

## Redux 使用

在学习使用 Redux 时，我们以一个具体的例子来学习，如一个 Todo 待办事项的页面；

### 构建基本结构

① 安装 Ant design UI库：`npm install antd`；

② 在页面 .css 文件中引入 antd 的样式文件`@import '~antd/dist/antd.css';`

③ 引入 antd 组件，编写页面结构：

```jsx
import React, { Component } from 'react'
import { Input, Button, List } from 'antd';

class App extends Component {
  state = {
    data: ['React', 'Vue', 'Angular']
  }
  render() {
    return (
      <div className="App">
        <Input 
          placeholder="Input your TodoList" 
          style={{ width: "80%", marginRight: "5px" }}>
        </Input>
        <Button type="primary" style={{ width: "19%"}}>OK</Button>
        <List
          bordered
          style={{marginTop:"15px"}}
          dataSource={this.state.data}
          renderItem={item => (
            <List.Item> {item} </List.Item>
          )}
        />
      </div>
    )
  }
}

export default App;
```

### Store 的创建

+ Store 就是保存数据的地方，正如其名，可以把它看成一个仓库，整个应用只能有一个 Store；

+ Reducer 是一个函数，它接受 Action 和当前 State 作为参数，返回一个新的 State；

+ Store 对象包含所有数据，某个时点的数据则为 State，当前时刻的 State，可以通过`store.getState()`拿到

+ Action 是一个对象，其`type`属性是必须的，表示 Action 的名称。其他属性可以自由设置；Action 就是表示 State 需要改动的通知；

  > Action 属性设置社区有一个规范可以参考：
  >
  > [redux-utilities/flux-standard-action: A human-friendly standard for Flux action objects.](https://github.com/redux-utilities/flux-standard-action)

① 在项目*src*目录下，创建文件夹 **store**，并新建文件 index.js 和 reducer.js；

② 编写如下代码：

```jsx
// index.js
import createStore from 'redux'
import reducer from './reducer'

const store = createStore(reducer)
export default store;

// reducer.js
const initialData = {
    inputValue: '',
    list: [],
}
const reducer = (state = initialData, action) => {
    return state;
}
export default reducer;
```

整个应用的初始状态，可以作为 State 的默认值，如上述例子中的 **initialData**；

### Action 和 Reducer 的编写

+ `store.dispatch()`是 View 发出 Action 的唯一方法，接受一个 Action 对象作为参数；
+ `store.subscribe()`设置监听函数，一旦 store 中的 State 发生变化，就自动执行这个函数；

上述代码的输入框，还没有正常输入的功能，当前的需求是，将输入框的值绑定到 store 内的 inputValue 上；

① 在输入框上，绑定值和函数：

```jsx
<Input value={this.state.inputValue} onChange={this.handleInputChange}></Input>
```

② 编写函数，并绑定到 this：

```jsx
handleInputChange(e){
  const action = {
    type: "change_input_value",
    payload: e.target.value
  }
  store.dispatch(action)
}
```

③ `store.dispatch`发送过来一个新的 Action，就会自动调用 Reducer，重新编写 reducer.js：

```jsx
const reducer = (state = initialData, action) => {
    if (action.type === "change_input_value"){
        return {
            inputValue: action.payload,
            list: state.list
        }
    }
    return state;
}
```

④ 虽然 store 中的数据已经改变，但是页面还没有更新， 在监听函数中更新 View 即可：

```jsx
constructor() {
  store.subscribe(this.handleStoreChange)
}
handleStoreChange(){
  this.setState(store.getState())
}
```

`store.subscribe`方法返回一个函数，调用这个函数就可以解除监听。

```jsx
let unsubscribe = store.subscribe();
unsubscribe();
```

### ActionTypes & actionCreator

继续完善小项目功能，添加和删除列表：

```jsx
if (action.type === "add_todo_item"){
  return {
    inputValue: state.inputValue,
    list: [...state.list, state.inputValue]
  }
}
if (action.type === "del_todo_item"){
  console.log(state.list)
  const newState = Object.assign({},state)
  newState.list.splice(action.payload,1)
  return newState
}
```

当业务变得复杂，Action 类型会非常多，且 type 还容易出现拼写错误，可以拆分 Action 到一个单独的文件：

```jsx
// actionTypes.js

export const CHANGE_INPUT_VALUE = 'change_input_value'
export const ADD_TODO_ITEM = 'add_todo_item'
export const DEL_TODO_ITEM = 'del_todo_item'
```

 此外，还可进一步封装一个 actionCreator 对 Action 进行统一管理：

```jsx
// actionCreator.js

import * as aTypes from './actionTypes'

export const getInputChangeAction = (value) => ({
    type: aTypes.CHANGE_INPUT_VALUE,
    payload: value
})
export const getAddItemAction = () => ({
    type: aTypes.ADD_TODO_ITEM,
})
export const getDelItemAction = (value) => ({
    type: aTypes.DEL_TODO_ITEM,
    payload: value
})
```

那么发送 Action 和 Reducer 处理则变为：

```jsx
const action = getDelItemAction(index)
store.dispatch(action)

if (action.type === aTypes.DEL_TODO_ITEM){}
```

### Redux 浏览器插件

① 进入 Chrome 或者 Edge 浏览器扩展商店，搜索 **Redux devtools**，安装即可；

② 在 src/index.js 修改代码：

```jsx
const store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
```

## Redux 中间件

> **中间件**（Middleware）是介于应用系统和系统软件之间的一类软件，它使用系统软件所提供的基础服务（功能），衔接网络上应用系统的各个部分或不同的应用，能够达到资源共享、功能共享的目的；

前文已经了解了`Redux`整个工作流程，当`action`发出之后，`reducer`立即算出`state`，整个过程是一个同步的操作，那么如果需要支持异步操作，或者支持错误处理、日志监控，这个过程就可以用上中间件；

`Redux`中，中间件就是放在就是在`dispatch`过程，在分发`action`进行拦截处理；

### Redux-thunk 实现异步操作

在 React 的 Web 应用中，想要发送 AjaX 请求获取数据，常见的做法是在生命周期函数发起请求：

```jsx
componentDidMount(){
  // list.json: ["vue","react","angular"]
  axios.get('/list.json').then((res)=>{
    const action = getInitListAction(res.data)
    store.dispatch(action)
  })
}
```

当业务过于复杂，`componentDidMount`生命周期函数中代码过多时，会影响组件的性能，可见部分代码抽离出组件，Redux-thunk 则可以帮助完成这个需求；

Redux-thunk 可以在编写 Action Creator 时返回一个函数而非 Action 对象，该函数接受 **store** 的 `dispatch` and `getState` 方法作为参数；中间件能够延缓 Action 的 dispatch 或可以在特定的条件才 dispatch，这样即可在该函数中完成耗时的异步操作了：

```jsx
export const getInitList = () => (
  (dispatch, getState) => {
    axios.get('/list.json').then((res) => {
      const action = getInitListAction(res.data)
      dispatch(action)
    })
  }
)
```

返回类型为函数的 Action 同样可以被 dispatch ，这完全得益于中间件 thunk，所以在组件中我们如下处理即可：

```jsx
componentDidMount(){
  const action = getInitList()
  store.dispatch(action)
}
```

在 Redux-Thunk 2.1.0 之后还支持在使用中间件时使用`withExtraArgument`注入一个自定义参数：

```jsx
const store = createStore(
  reducer,
  applyMiddleware(thunk.withExtraArgument(api)),
);

const getInitList = () => (
  (dispatch, getState, api) => {
    console.log(api)
  }
)
```

### 中间件与浏览器扩展

当我们在使用 Thunk 中间件时，就可以发现，代码将 Redux Devtools （这也是一个中间件）的内容去掉了，这肯定不是因为不支持多个中间件同时使用，而是需要特定的方式进行组合：

```jsx
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunk))
);
```

> 可参考：[compose | Redux](https://redux.js.org/api/compose)，[reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools/tree/main/extension)；

### Redux-Saga 的使用

① 安装，并在*/src/store/index.js*中配置，类似于 Redux-Thunk：

```js
import createSagaMiddleWare from 'redux-saga'
const store = createStore(
    reducer,
    composeEnhancers(applyMiddleware(saga))
);
```

② 新建 *./src/sagas.js*文件：

 ```jsx
 function* getInitList() {
     const res = yield axios.get('/list.json');
     const action = getInitListAction(res.data)
     yield put(action)
 }
 
 function* todoSaga() {
     yield takeEvery(INITIAL_LIST_SAGA, getInitList);
 }
 ```

③ 在 *store/index.js* 中导入，运行：

```jsx
import todoSaga from './saga'
// ...
saga.run(todoSaga);
```

> 更多使用，查看[Redux-Saga - An intuitive Redux side effect manager. ](https://redux-saga.js.org/)

## Redux 核心

React-Redux 将所有组件分成两大类：**UI 组件**（presentational component）和**容器组件**（container component）。

UI 组件有以下几个特征：

+ 只负责 UI 的呈现，不带有任何业务逻辑

+ 没有状态（即不使用`this.state`这个变量）

+ 所有数据都由参数（`this.props`）提供

+ 不使用任何 Redux 的 API

容器组件的特征恰恰相反：

- 负责管理数据和业务逻辑，不负责 UI 的呈现
- 带有内部状态
- 使用 Redux 的 API

React-Redux 规定，所有的 UI 组件都由用户提供，容器组件则是由 React-Redux 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。

### connect() 方法

React-Redux 提供`connect`方法，用于从 UI 组件生成容器组件，为了定义业务逻辑，方法需要传入两个参数：

1. `mapStateToProps`： 输入逻辑，外部的数据（即`state`对象）如何转换为 UI 组件的参数；
2. `mapDispatchToProps`：输出逻辑，用户发出的动作如何变为 Action 对象，从 UI 组件传出去；

### Provider 组件

React-Redux 提供`Provider`组件，可以让容器组件拿到`state`，只需要在根组件外面包一层，根组件的所有子组件就默认都可以拿到`state`了。

### TodoList 完善

了解了上面的基础，我们就可以将 TodoList 这个小项目利用 Redux 的思想进行改造了；

① 使用 Provider 可以让容器组件拿到`state`：

```jsx
import {Provider} from 'react-redux'
import store from './store'


ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);
```

② 将 TodoList 组件 UI 化，将内部 state 和逻辑分离出来，通过 props 获取：

```jsx
class App extends Component {
  render() {
    const {
      inputValue,list,handleInputChange,
      handleBtnClick,handleListClick} 
    = this.props
    return (
      <div className="App">
        <Input
          value={inputValue}
          placeholder="Input your TodoList"
          style={{ width: "80%", marginRight: "5px" }}
          onChange={handleInputChange}
        ></Input>
        <Button type="primary" style={{ width: "19%" }} onClick={handleBtnClick}>OK</Button>
        <List
          bordered
          style={{ marginTop: "15px" }}
          dataSource={list}
          renderItem={(item,index) => (
            <List.Item onClick={()=>{handleListClick(index)}}>
              {item}
            </List.Item>
          )}
        />
      </div>
    )
  }
  componentDidMount(){
    const action = getInitListSaga()
    store.dispatch(action)
  }
}
```

③ 编写 state 以及处理逻辑和 props 的映射，且将 Todolist 通过 connect 转换成容器组件：

```jsx
const mapStateToProps = (state)=>{
  return {
    inputValue: state.inputValue,
    list: state.list,
  }
}
const mapDispatchToProps = (dispatch)=>{
  return {
    handleInputChange(e){
      const action = getInputChangeAction(e.target.value)
      dispatch(action)
    },
    handleBtnClick(){
      const action = getAddItemAction()
      dispatch(action)
    },
    handleListClick(index){
      const action = getDelItemAction(index)
      dispatch(action)
    }
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(App);
```

