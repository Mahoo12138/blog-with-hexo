---
title: 前端面试总结之 React Hooks
date: 2023-03-19 10:30:21
categories: 
- 学习笔记
tags:
- React
---

## 类组件的不足

- **状态逻辑难复用：** 在组件之间复用状态逻辑很难，可能要用到 **render props** （**渲染属性**）或者 **HOC**（**高阶组件**），但无论是渲染属性，还是高阶组件，都会在原先的组件外包裹一层父容器（一般都是 div 元素），**导致层级冗余**。例如一个 4 层嵌套的`HOC`组件：

  ```js
  export default withStyle(style)(connect(/*...*/)(withRouter(App)))
  ```

- 趋向复杂难以维护：

  - 在生命周期函数中混杂不相干的逻辑（如：在 `componentDidMount` 中注册事件以及其他的逻辑，在 `componentWillUnmount` 中卸载事件，这样分散不集中的写法，很容易写出 bug ）
  - 类组件中到处都是对状态的访问和处理，导致组件难以拆分成更小的组件；

- `this` 指向问题：父组件给子组件传递函数时，必须绑定 this，虽然可以通过箭头函数解决，但是复杂度仍在：即 react 中的组件四种绑定 this 方法（前提：子组件内部做了性能优化，如(**React.PureComponent**)）：

  > 与普通组件的区别在于它实现了一个浅比较的 shouldComponentUpdate 生命周期方法。当 props 或 state 发生变化时，React 会调用 shouldComponentUpdate 方法来决定是否需要重新渲染组件。

  1. **在构造函数中绑定 this**：那么每次父组件刷新的时候，如果传递给子组件其他的 props 值不变，那么子组件就不会刷新；

  2. 第二种是**在 render() 函数里面绑定 this**：因为 **bind 函数会返回一个新的函数**，所以每次父组件刷新时，都会重新生成一个函数，即使父组件传递给子组件其他的 props 值不变，子组件每次都会刷新；

  3. 第三种是**使用箭头函数**：父组件刷新的时候，即使两个箭头函数的函数体是一样的，都会生成一个新的箭头函数，所以子组件每次都会刷新；

  4. 第四种是**使用类的静态属性：原理和第一种方法差不多，比第一种更简洁**

     

```js
class App extends React.Component<any, any> {
    handleClick2;

    constructor(props) {
        super(props);
        this.state = {
            num: 1,
            title: ' react study'
        };
        this.handleClick2 = this.handleClick1.bind(this);
    }

    handleClick1() {
        this.setState({
            num: this.state.num + 1,
        })
    }

    handleClick3 = () => {
        this.setState({
            num: this.state.num + 1,
        })
    };

    render() {
        return (<div>
            <h2>Ann, {this.state.num}</h2>
            <button onClick={this.handleClick2}>btn1</button>
            <button onClick={this.handleClick1.bind(this)}>btn2</button>
            <button onClick={() => this.handleClick1()}>btn3</button>
            <button onClick={this.handleClick3}>btn4</button>
        </div>)
    }
}
```

## Hooks 优势

- 能优化类组件的三大问题；
- 能在无需修改组件结构的情况下复用状态逻辑（自定义 Hooks ）；
- 能将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据）；
- **副作用的关注点分离**：**副作用指那些没有发生在数据向视图转换过程中的逻辑，如 `ajax` 请求、访问原生`dom` 元素、本地持久化缓存、绑定/解绑事件、添加订阅、设置定时器、记录日志等**。以往这些副作用都是写在类组件生命周期函数中的。而 `useEffect` 在全部渲染完毕后才会执行，`useLayoutEffect` 会在浏览器 `layout` 之后，`painting` 之前执行。

> - **只能在函数内部的最外层调用 Hook，不要在循环、条件判断或者子函数中调用**
> - 只能在 React 的**函数组件**中调用 Hook，不要在其他 JavaScript 函数中调用

## useState

**React 假设当你多次调用 useState 的时候，你能保证每次渲染时它们的*调用顺序*是不变的。**

通过在函数组件里调用它来给组件添加一些内部 state，React会 **在重复渲染时保留这个 state**

useState 唯一的参数就是初始 state

**useState 会返回一个数组**：**一个 state，一个更新 state 的函数**

- 在初始化渲染期间，返回的状态 (state) 与传入的第一个参数 (initialState) 值相同
- 你可以在事件处理函数中或其他一些地方调用这个函数。它类似 class 组件的 this.setState，但是它**不会把新的 state 和旧的 state 进行合并，而是直接替换**

### 每次渲染都是独立的闭包

- 每一次渲染都有它自己的 Props 和 State
- 每一次渲染都有它自己的事件处理函数
- 当点击更新状态的时候，函数组件都会重新被调用，那么每次渲染都是独立的，取到的值不会受后面操作的影响

### 函数式更新

- **如果新的 state 需要通过使用先前的 state 计算得出，那么可以将回调函数当做参数传递给 setState。该回调函数将接收先前的 state，而不是使用函数触发时的 state，之后返回一个更新后的值。**

### 惰性初始化 state

- **initialState 参数只会在组件的初始化渲染中起作用，后续渲染时会被忽略**
- **如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用**

### Object.is （浅比较）

- Hook 内部使用 Object.is 来比较新/旧 state 是否相等
- **与 class 组件中的 setState 方法不同，如果你修改状态的时候，传的状态值没有变化，则不重新渲染**
- **与 class 组件中的 setState 方法不同，useState 不会自动合并更新对象。你可以用函数式的 setState 结合展开运算符来达到合并更新对象的效果**

### 减少渲染次数

- **默认情况，只要父组件状态变了（不管子组件依不依赖该状态），子组件也会重新渲染**
- 一般的优化：
  1. **类组件**：可以使用 `pureComponent` ；
  2. **函数组件**：使用 `React.memo` ，将函数组件传递给 `memo` 之后，就会返回一个新的组件，新组件的功能：**如果接受到的属性不变，则不重新渲染函数**；
- **但是怎么保证属性不会变尼？这里使用 useState ，每次更新都是独立的**，`const [number,setNumber] = useState(0)` **也就是说每次都会生成一个新的值（哪怕这个值没有变化），即使使用了 `React.memo` ，也还是会重新渲染**

### 源码参考

```js
function useState(initialState) {
    currentHookNameInDev = 'useState';
    mountHookTypesDev();
    var prevDispatcher = ReactCurrentDispatcher$1.current;
    ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnMountInDEV;

    try {
        return mountState(initialState);
    } finally {
        ReactCurrentDispatcher$1.current = prevDispatcher;
    }
}
function mountState(initialState) {
    var hook = mountWorkInProgressHook();

    if (typeof initialState === 'function') {
        initialState = initialState();
    }

    hook.memoizedState = hook.baseState = initialState;
    var queue = {
        pending: null,
        interleaved: null,
        lanes: NoLanes,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialState
    };
    hook.queue = queue;
    var dispatch = queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber$1, queue);
    return [hook.memoizedState, dispatch];
}
function mountWorkInProgressHook() {
    var hook = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
    };

    if (workInProgressHook === null) {
        // This is the first hook in the list
        currentlyRenderingFiber$1.memoizedState = workInProgressHook = hook;
    } else {
        // Append to the end of the list
        workInProgressHook = workInProgressHook.next = hook;
    }

    return workInProgressHook;
}

function dispatchSetState(fiber, queue, action) {
  {
    if (typeof arguments[3] === 'function') {
      error("State updates from the useState() and useReducer() Hooks don't support the " + 'second callback argument. To execute a side effect after ' + 'rendering, declare it in the component body with useEffect().');
    }
  }

  var lane = requestUpdateLane(fiber);
  var update = {
    lane: lane,
    action: action,
    hasEagerState: false,
    eagerState: null,
    next: null
  };

  if (isRenderPhaseUpdate(fiber)) {
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    var alternate = fiber.alternate;

    if (fiber.lanes === NoLanes && (alternate === null || alternate.lanes === NoLanes)) {
      // The queue is currently empty, which means we can eagerly compute the
      // next state before entering the render phase. If the new state is the
      // same as the current state, we may be able to bail out entirely.
      var lastRenderedReducer = queue.lastRenderedReducer;

      if (lastRenderedReducer !== null) {
        var prevDispatcher;

        {
          prevDispatcher = ReactCurrentDispatcher$1.current;
          ReactCurrentDispatcher$1.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }

        try {
          var currentState = queue.lastRenderedState;
          var eagerState = lastRenderedReducer(currentState, action); // Stash the eagerly computed state, and the reducer used to compute
          // it, on the update object. If the reducer hasn't changed by the
          // time we enter the render phase, then the eager state can be used
          // without calling the reducer again.

          update.hasEagerState = true;
          update.eagerState = eagerState;

          if (objectIs(eagerState, currentState)) {
            // Fast path. We can bail out without scheduling React to re-render.
            // It's still possible that we'll need to rebase this update later,
            // if the component re-renders for a different reason and by that
            // time the reducer has changed.
            // TODO: Do we still need to entangle transitions in this case?
            enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update, lane);
            return;
          }
        } catch (error) {// Suppress the error. It will throw again in the render phase.
        } finally {
          {
            ReactCurrentDispatcher$1.current = prevDispatcher;
          }
        }
      }
    }

    var root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);

    if (root !== null) {
      var eventTime = requestEventTime();
      scheduleUpdateOnFiber(root, fiber, lane, eventTime);
      entangleTransitionUpdate(root, queue, lane);
    }
  }
  markUpdateInDevTools(fiber, lane);
}
```

### 手写链表实现

```js
import React from 'react';
import ReactDOM from 'react-dom';

let firstWorkInProgressHook = { memoizedState: null, next: null };
let workInProgressHook;

function useState(initState) {
  let currentHook = workInProgressHook.next ? workInProgressHook.next : { memoizedState: initState, next: null };

  function setState(newState) {
    currentHook.memoizedState = newState;
    render();
  }
  // 这就是为什么 useState 书写顺序很重要的原因
  // 假如某个 useState 没有执行，会导致指针移动出错，数据存取出错
  if (workInProgressHook.next) {
    // 这里只有组件刷新的时候，才会进入
    // 根据书写顺序来取对应的值
    // console.log(workInProgressHook);
    workInProgressHook = workInProgressHook.next;
  } else {
    // 只有在组件初始化加载时，才会进入
    // 根据书写顺序，存储对应的数据
    // 将 firstWorkInProgressHook 变成一个链表结构
    workInProgressHook.next = currentHook;
    // 将 workInProgressHook 指向 {memoizedState: initState, next: null}
    workInProgressHook = currentHook;
    // console.log(firstWorkInProgressHook);
  }
  return [currentHook.memoizedState, setState];
}

function Counter() {
  // 每次组件重新渲染的时候，这里的 useState 都会重新执行
  const [name, setName] = useState('计数器');
  const [number, setNumber] = useState(0);
  return (
    <>
      <p>{name}:{number}</p>
      <button onClick={() => setName('新计数器' + Date.now())}>新计数器</button>
      <button onClick={() => setNumber(number + 1)}>+</button>
    </>
  )
}

export function render() {
  // 每次重新渲染的时候，都将 workInProgressHook 指向 firstWorkInProgressHook
  workInProgressHook = firstWorkInProgressHook;
  ReactDOM.render(<Counter />, document.getElementById('state'));
}
```

