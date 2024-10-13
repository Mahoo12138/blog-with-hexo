---
title: 前端学习之React中的Hooks学习
date: 2020-10-18 23:32:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 什么是 Hooks

Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性；

Hook 本质是一个特殊的函数，它可以让你“钩入” React 的特性。例如，`useState` 是允许你在 React 函数组件中添加 state 的 Hook；

Hooks 没有做破坏性改动，是完全向后兼容，而且是可选择的，也就是说没必要使用 Hooks 重构之前的应用；

Hooks 采取渐进式的使用策略，也就是说没有计划从 React 中移除 class，且将继续为 class 组件提供支持；

## 为什么使用 Hooks

+ **在组件之间复用状态逻辑很难**，Hook 使你在无需修改组件结构的情况下复用状态逻辑；
+ **复杂组件变得难以理解**，Hook 将组件中相互关联的部分拆分成更小的函数（比如设置订阅或请求数据）；
+ **难以理解的 class**，Hook 使你在非 class 的情况下可以使用更多的 React 特性；

## 常用的 Hook

### useState

```react
const [count, setCount] = useState(0);
```

参数：定义状态的初始化值，可直接传递状态，如初始状态需要复杂计算获得也可以传递返回状态的函数；

返回值：一个数组，包含将创建的状态和更新状态的函数，该函数可传入新的状态或接受旧状态返回新状态的函数；

> 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略；
>
> 如果需要多个状态，则调用多次`useState`函数即可，通常**不必**使用多个 state 变量。State 变量可以很好地存储对象和数组；

### useEffect

```react
useEffect(() => {
    document.title = `You clicked ${count} times`;
}, [count]);
```

参数：第一个参数是一个包含命令式、且可能有**副作用**代码的函数，会在执行 DOM 更新后被调用；其二是一个数组，此参数来控制包裹的函数 effect 是否执行，可以提升一定的性能；传入空的依赖数组 `[]`，意味着该 Effect Hook 只会在组件挂载时运行一次；

> 若第二个参数不传递，则该Effect每次组件刷新都会执行，相当于类组件中的`componentDidMount`和`componentDidupdate`生命周期的结合；

大多情况下，我们希望在组件加载和更新时执行同样的操作，而类组件则需要`componentDidMount`和`componentDidupdate`中执行重复的代码才能完成需求；

对于需要清除的 effect，如订阅外部数据源，与监听事件等操作，为防止内存泄露，在类组件中通常会在 `componentDidMount` 中设置订阅，并在 `componentWillUnmount` 中清除；这是很紧密的逻辑却被这两个生命周期函数强行给拆分了；useEffect 的设计给出了优雅的解决：

```react
useEffect(() => {
    element.addEventListener("click", function(){ alert("Hello World!"); });
    return () => {
        element.removeEventListener("click", myFunction);
    };
});
```

> 这就相当于将 `componentWillUnmount`生命周期也结合了；

总结，通过 useEffect 可以告诉 React 组件需要在渲染后执行某些操作，也能在组件卸载时执行操作；

此外，可创建多个 Effect Hook 将类组件生命周期中多个不同的业务逻辑进行分离；

> 注意，因为副效应函数默认是每次渲染都会执行，其**清理函数**（回调函数返回的函数）在*每次副效应函数重新执行之前，也会执行一次*，用来清理上一次渲染的副效应；故清理函数在每次重新渲染时都会执行而不是只在卸载组件的时候执行一次；这可以帮助我们创建 bug 更少的组件；

### useContext

```react
const ThemeContext = React.createContext(...);
const value = useContext(ThemeContext);
```

接收一个 context 对象（`React.createContext` 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 `<ThemeContext.Provider>` 的 `value` prop 决定。

+  `<ThemeContext.Provider>` 更新时，该 Hook 会触发重渲染；
+ `useContext` 的参数必须是 *context 对象本身*；

### useReducer

```react
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

参数：其一为 reducer 纯函数，其二是是初始的state，最后可以修改初始state，将初始 state 设置为 init(initialArg)；

useState 的加强版，适用于 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等情况；

如果 Reducer Hook 的返回值与当前 state 相同，React 将跳过子组件的渲染及副作用的执行；

### useCallback

```react
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

`useCallback` 把内联回调函数及依赖项数组作为参数传入，返回原函数的[memoized](https://link.segmentfault.com/?enc=2EiR0R0Nh3eghxaOnbtttA%3D%3D.5hxAjOyHvCPeuKfuvcmHuc4AbdU75%2B7JThTarg29kc2WibVENbIzlGv3wKFeAFzR)函数，在依赖项 a 和 b 都没有改变时，总是返回同一个函数；`useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`；

> **记忆化**（英语：memoization）是一种提高计算机程序执行速度的优化技术。通过储存大计算量函数的返回值，当这个结果再次被需要时将其从缓存提取，而不用再次计算来节省计算时间。
>
> 记忆化是一种典型的在计算时间与电脑存储器空间之中获取平衡的方案；

### useMemo

```react
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

把“创建”函数和依赖项数组作为参数传入 `useMemo`，与 `useCallback` 类似，返回一个 memoized 函数执行结果（值）；如果没有提供依赖项数组，`useMemo` 在每次渲染时都会计算新的值；

### useRef

```react
const refContainer = useRef(initialValue);
```

类似 `react.createRef()`，`useRef` 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传入的参数（`initialValue`）。返回的 ref 对象在组件的整个生命周期内持续存在；

### useImperativeMethods

`useImperativeMethods` 提供了父组件直接调用子组件实例方法的能力，应当与 [`forwardRef`](https://zh-hans.reactjs.org/docs/react-api.html#reactforwardref) 一起使用：

```react
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);
```

## Hooks 使用规则

+ 只在函数内部最顶层使用 Hook，不要在循环，条件或嵌套函数中调用 Hook；
+ 只在 React 函数中调用 Hook，不要在普通的 JavaScript 函数中调用 Hook；

> 单个组件中编写多个`hook`，它们的每次**调用顺序是由书写的位置决定**的，它的内部实现其实是一个链表式的调用。如果不能保证每次的渲染的位置一致就不能保证它能正常的工作。

## 自定义 Hook

自定义 Hook 是一个函数，其名称以 “`use`” 开头，函数内部可以调用其他的 Hook；

用于封装需要调用 Hooks 的逻辑，可在多个组件中共享使用；