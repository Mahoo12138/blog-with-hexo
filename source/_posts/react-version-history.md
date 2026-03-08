---
title: React 16 → 19：六年演进全记录
date: 2026-03-08 17:32:43
categories: 
- 学习笔记
tags:
- React
---

> 从 Fiber 重写到 Server Components，React 在过去六年完成了一次彻底的范式转型。本文系统梳理 React 16 至 19.x 各主要版本的核心变化，帮你建立完整的版本认知地图。

---

## 目录

- [React 16：Fiber 重写时代（2017–2019）](#react-16)
- [React 17：过渡版本（2020）](#react-17)
- [React 18：并发时代（2022）](#react-18)
- [React 19：Actions 与 Server Components（2024）](#react-19)
- [React 19.2：Activity 与 Effect Events（2025）](#react-192)
- [版本演进总结](#总结)

---

## React 16

**发布时间：** 2017.09 ~ 2019.02（16.0 → 16.14）  
**核心主题：** Fiber 架构重写，功能爆发期

### 架构革新：Fiber 引擎

React 16 最重要的改动是从头重写了核心调度算法，引入 **Fiber 协调引擎**。Fiber 将渲染任务拆分为可中断的小单元，支持增量渲染——高优先级任务（如用户输入）可以打断低优先级的渲染工作，为后续的并发特性奠定了基础。

同时，`render()` 不再限制只能返回单个元素，现可返回**数组、字符串、数字、Portals、布尔值、null**，减少了大量多余的包裹节点。

### 新功能一览

**Fragments（16.2）**

```jsx
// 无需额外 DOM 节点的多子元素返回
return (
  <>
    <Child1 />
    <Child2 />
  </>
);
```

**Error Boundaries**

通过 `componentDidCatch` 捕获子组件树内的 JS 错误，展示降级 UI，避免整个应用崩溃：

```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    logErrorToService(error, info);
  }
  render() {
    if (this.state.hasError) return <h1>出错了</h1>;
    return this.props.children;
  }
}
```

**Portals**

将子组件渲染到父组件 DOM 层级之外，完美解决 Modal、Tooltip 的 z-index 场景：

```jsx
ReactDOM.createPortal(children, document.getElementById('modal-root'));
```

**新 Context API（16.3）**

`React.createContext` 取代旧版 context，支持 Provider / Consumer 模式：

```jsx
const ThemeContext = React.createContext('light');
// <ThemeContext.Provider value="dark">...</ThemeContext.Provider>
```

**forwardRef（16.3）**

允许父组件通过 `React.forwardRef` 将 ref 穿透到函数子组件内部的 DOM 节点，解决组件库封装 ref 的痛点。

**React.lazy + Suspense（16.6）**

```jsx
const MyComp = React.lazy(() => import('./MyComp'));

<Suspense fallback={<Spinner />}>
  <MyComp />
</Suspense>
```

代码分割与懒加载的官方方案，配合动态 `import()` 减少首屏 bundle 体积。

**React.memo（16.6）**

函数组件的 `PureComponent` 等价物，对 props 进行浅比较，避免不必要的重渲染。

**Hooks（16.8）⭐ 里程碑**

React 历史上影响最深远的更新，引入了完整的 Hooks API：

| Hook | 用途 |
|------|------|
| `useState` | 组件状态 |
| `useEffect` | 副作用处理 |
| `useContext` | 读取 Context |
| `useReducer` | 复杂状态逻辑 |
| `useMemo` / `useCallback` | 性能记忆化 |
| `useRef` | DOM 引用 / 持久值 |

函数组件从此拥有了完整的状态与生命周期能力，类组件的使用频率随之大幅下降。

### 生命周期调整（16.3）

| 新增（推荐） | 废弃（加 UNSAFE_ 前缀） |
|-------------|------------------------|
| `getDerivedStateFromProps` | `UNSAFE_componentWillMount` |
| `getSnapshotBeforeUpdate` | `UNSAFE_componentWillReceiveProps` |
| `componentDidCatch` | `UNSAFE_componentWillUpdate` |

> **为什么废弃？** Fiber 的异步渲染可能多次调用这些生命周期，产生不确定的副作用。新 API 具有确定性，与并发渲染兼容。

### 其他值得关注

- **MIT 重新授权**：从 BSD+Patents 改为 MIT，消除企业使用的法律顾虑
- **SSR 流式渲染**：新增 `renderToNodeStream`，加快 TTFB
- **Profiler API（16.5）**：`<Profiler>` 组件精确测量渲染耗时

---

## React 17

**发布时间：** 2020.10  
**核心主题：** 垫脚石，为 React 18 清障

React 17 是 React 历史上**唯一一个没有引入新开发者特性**的主版本，所有改动都是底层基础设施升级。

### 核心变化

**事件委托目标变更**

React 的事件委托从挂载到 `document` 改为挂载到**根 DOM 容器**。这一改动是支持多版本共存的关键，避免不同版本 React 的事件处理相互干扰：

```
React 16: document.addEventListener(...)
React 17: rootContainer.addEventListener(...)
```

**渐进式升级支持**

可以在同一页面上嵌套不同版本的 React（如 React 18 + React 17），为大型应用逐步迁移提供了可能。

**新 JSX Transform**

无需在每个文件中手动 `import React`，Babel/TypeScript 自动处理转换：

```jsx
// React 17 之前
import React from 'react';
function App() { return <div />; }

// React 17 之后（无需 import）
function App() { return <div />; }
```

**合成事件池化取消**

移除了令人困惑的 SyntheticEvent 池化机制，异步访问事件属性不再需要 `e.persist()`：

```jsx
// 以前需要
handleChange(e) {
  e.persist(); // 否则异步回调拿不到 e.target.value
  setTimeout(() => console.log(e.target.value), 100);
}

// React 17 之后，可直接访问
handleChange(e) {
  setTimeout(() => console.log(e.target.value), 100);
}
```

**useEffect 清理时机修复**

清理函数执行改为异步，与 effect 本身保持一致，解决了卸载时同步清理可能导致的性能问题。

---

## React 18

**发布时间：** 2022.03（18.0）/ 2022.06（18.2）  
**核心主题：** 并发渲染正式稳定

### 并发渲染核心

React 18 的核心是将酝酿多年的**并发渲染器（Concurrent Renderer）正式稳定**。React 可以在后台同时准备多个版本的 UI，根据优先级决定何时呈现，彻底改变了单一同步渲染流水线的模式。

启用并发特性需要使用新入口：

```jsx
// React 17
ReactDOM.render(<App />, container);

// React 18（启用并发特性）
const root = ReactDOM.createRoot(container);
root.render(<App />);
```

### useTransition / startTransition

将状态更新标记为"非紧急过渡"，紧急更新（打字、点击）可以打断非紧急更新（搜索结果渲染）：

```jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // 紧急：立即更新输入框
    startTransition(() => {
      setResults(searchDatabase(e.target.value)); // 非紧急：可被打断
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultList data={results} />}
    </>
  );
}
```

### useDeferredValue

延迟更新某个值，在高频输入时先渲染旧值，空闲时再更新到最新值：

```jsx
const deferredQuery = useDeferredValue(query);
// 将 deferredQuery 传给渲染开销大的组件
```

### 自动批处理（Auto Batching）

React 17 及之前，只有 React 事件处理器内的多次 setState 会自动批处理。React 18 将批处理扩展到所有场景：

```jsx
// React 18 之后，这三次 setState 只触发一次重渲染
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  setName('new name');
}, 1000);
```

如需退出自动批处理，可使用 `flushSync`。

### 新 Hooks

**useId**

生成在服务端和客户端稳定一致的唯一 ID，解决 SSR hydration 时的 ID 不匹配问题：

```jsx
function LabelledInput() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
```

**useSyncExternalStore**

供外部状态管理库（Redux、Zustand 等）安全订阅外部 store 的官方 Hook，保证并发模式下数据一致性：

```jsx
const count = useSyncExternalStore(
  store.subscribe,
  store.getSnapshot,
  store.getServerSnapshot // SSR 时使用
);
```

**useInsertionEffect**

专为 CSS-in-JS 库设计，在 DOM 变更前同步注入样式，解决并发模式下样式注入的时序问题（主要供库作者使用）。

### SSR 流式渲染增强

全新的 `renderToPipeableStream` 支持服务端流式发送 HTML，并配合 Suspense 实现**选择性 hydration**——慢数据不阻塞快内容，用户可以优先与已加载部分交互：

```jsx
// 服务端
const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() { pipe(response); }
});

// 客户端
hydrateRoot(document, <App />);
```

### Strict Mode 行为变化

开发模式下，Strict Mode 会刻意**挂载 → 卸载 → 再挂载**每个组件，检测副作用是否正确清理，帮助开发者提前发现并发模式下的潜在问题。

---

## React 19

**发布时间：** 2024.12  
**核心主题：** Actions 范式 + Server Components 稳定

### Actions：异步状态新范式

React 19 引入了 **Actions** 的概念——`startTransition` 现在支持异步函数，React 自动管理 pending 状态、错误处理、乐观更新：

```jsx
// 之前：需要手动管理多个状态
const [isPending, setIsPending] = useState(false);
const [error, setError] = useState(null);

async function handleSubmit() {
  setIsPending(true);
  try {
    await submitForm(data);
  } catch (e) {
    setError(e.message);
  } finally {
    setIsPending(false);
  }
}

// React 19 Actions：自动管理
async function submitAction(formData) {
  await submitForm(formData); // React 自动处理 pending/error
}
```

### 新 Hooks

**useActionState**

接收一个 Action 函数，集中管理执行结果与 pending 状态：

```jsx
const [state, submitAction, isPending] = useActionState(
  async (prevState, formData) => {
    const result = await submitForm(formData);
    return result;
  },
  initialState
);
```

**useOptimistic**

在请求完成前立即乐观更新 UI，若请求失败自动回滚：

```jsx
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, { ...newItem, sending: true }]
);

async function handleAdd(item) {
  addOptimistic(item);       // 立即更新 UI
  await saveToServer(item);  // 等待服务器确认
}
```

**useFormStatus**

子组件可直接读取父 `<form>` 的状态，无需 prop drilling：

```jsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? '提交中...' : '提交'}</button>;
}
```

### use() API

在渲染时直接读取 Promise 或 Context，与 Suspense 协作：

```jsx
// 读取 Promise
function UserCard({ userPromise }) {
  const user = use(userPromise); // Suspense 处理 loading 状态
  return <div>{user.name}</div>;
}

// 读取 Context（可在条件语句中使用，这是 useContext 做不到的）
function Component({ show }) {
  if (show) {
    const theme = use(ThemeContext);
    return <div style={{ color: theme.color }} />;
  }
  return null;
}
```

### React Server Components（RSC）正式稳定

Server Components 允许组件直接在服务器上运行：

- **零 bundle 体积**：服务端组件代码不发送到客户端
- **直接访问后端资源**：数据库、文件系统、内部 API
- **配合 Server Actions**：带 `"use server"` 指令的函数可从客户端直接调用

```jsx
// server-component.jsx（服务端，零 bundle）
async function UserProfile({ id }) {
  const user = await db.user.findById(id); // 直接查数据库
  return <div>{user.name}</div>;
}

// server-action.js
'use server';
export async function updateUser(formData) {
  await db.user.update({ name: formData.get('name') });
}
```

### ref 作为普通 prop

函数组件**不再需要 forwardRef 包裹**，ref 可以直接作为普通 prop 传递：

```jsx
// React 19 之前
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);

// React 19 之后
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### 内置 Document Metadata 支持

可在组件中直接渲染 `<title>`、`<meta>`、`<link>` 等标签，React 自动将其提升到 `<head>`，无需第三方库：

```jsx
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <article>{post.content}</article>
    </>
  );
}
```

### Breaking Changes

| 变化 | 说明 |
|------|------|
| 移除 `propTypes` / `defaultProps`（函数组件） | 使用 TypeScript 类型替代 |
| 移除遗留 Context API（contextTypes） | 使用新 Context API |
| 移除字符串 Refs | 使用 `createRef` 或 `useRef` |
| 移除 `ReactDOM.render()` / `ReactDOM.hydrate()` | 使用 `createRoot` / `hydrateRoot` |
| `forwardRef` 标记为 deprecated | 直接使用 ref prop |

---

## React 19.2

**发布时间：** 2025.10.01（最新稳定版 19.2.3）  
**核心主题：** Activity 组件 + Effect Events + 性能工具

### `<Activity />` 组件

替代条件渲染的新原语，`mode="hidden"` 时隐藏内容并暂停 Effects，但**保留组件状态**；`mode="visible"` 时恢复。非常适合 Tab 切换、路由预加载等场景：

```jsx
<Activity mode={tab === 'home' ? 'visible' : 'hidden'}>
  <HomePage />
</Activity>
<Activity mode={tab === 'settings' ? 'visible' : 'hidden'}>
  <SettingsPage />
</Activity>
```

与 `{show && <Component />}` 的区别：后者卸载后状态丢失，而 Activity 在隐藏时保留所有状态，切换回来无需重新初始化。

### useEffectEvent

从 Effect 中提取"事件逻辑"，创建始终读取最新 props/state 但不触发 Effect 重跑的稳定回调：

```jsx
function ChatRoom({ roomId, onMessage }) {
  // onMessage 变化不会导致 effect 重连
  const handleMessage = useEffectEvent((msg) => {
    onMessage(msg); // 始终是最新的 onMessage
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on('message', handleMessage);
    return () => connection.disconnect();
  }, [roomId]); // 只依赖 roomId，而不是 onMessage
}
```

这彻底解决了 useEffect 依赖数组与响应性之间长期以来的冲突。

### Partial Pre-rendering（PPR）

允许在同一路由中混合静态预渲染和动态内容——静态壳立即送达，动态部分通过 Suspense 流式补充，兼顾速度与数据新鲜度。

### React Performance Tracks

在 Chrome DevTools Performance 面板新增 **React 专属轨道**，直观展示组件调度、渲染时序与并发优先级，大幅降低性能调优门槛。

### 安全修复

- **CVE-2025-55182**：React Server Components RCE 漏洞修复（19.2.1）
- **React Server Components DoS 漏洞**修复（19.2.3）

> ⚠️ 建议所有使用 React Server Components 的项目立即升级到 19.2.3。

---

## 总结

React 六年演进可以归纳为三条主线：

**1. 渲染能力的持续增强**

Fiber（可中断）→ Concurrent Renderer（优先级调度）→ Server Components（服务端渲染新范式）→ Activity（状态保留的显隐控制）

**2. 开发体验的持续简化**

类组件 + 生命周期 → Hooks → Actions（自动管理 pending/error）→ useEffectEvent（简化副作用依赖管理）

**3. 全栈能力的逐步下沉**

前端渲染 → SSR 流式输出 → Server Components + Server Actions → PPR（静态/动态混合渲染）

从 React 16 到 19，每一个主版本都在为下一个版本做铺垫，整体路线清晰且连贯。理解这条演进脉络，不仅有助于做好版本升级决策，也能帮助我们更深入地理解每个 API 设计背后的真正意图。

---

*最后更新：2025 年 10 月 | 最新版本：React 19.2.3*
