---
title: 前端学习之React中的路由
date: 2020-09-27 15:32:16
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## React 路由介绍

前端路由就是一套映射规则，是URL路径与组件的对应关系，实现从一个页面到另一个页面的跳转；

###  Router 组件

使用 React Router API 中的两种类型的路由：

- BrowserRouter
- HashRouter

```
// <BrowserRouter>
http://example.com/about
// <HashRouter>
http://example.com/#/about
```

`<BrowserRouter>` 在两者中会更受欢迎些，因为它使用的是 [HTML5 History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API) 来保持应用的页面与 URL 同步，而 `<HashRouter>` 则使用的是 URL 的哈希部分（`window.location.hash`，其原理就是监听哈希值的改变进行对应的渲染）。如果你的代码运行在不支持 `History API` 的传统浏览器上，你应该使用 `<HashRouter>` ，否则 `<BrowserRouter>` 对于大多数情况来说是更好的选择。

> `history` 这个库可以让你在 JavaScript 运行的任何地方都能轻松地管理回话历史，`history` 对象抽象化了各个环境中的差异，并提供了最简单易用的的 API 来给你管理历史堆栈、导航，并保持会话之间的持久化状态。 

#### BrowserRouter：

`BrowserRouter` 要求服务端对发送的不同的 URL 都要返回对应的 HTML，比如说现在有如下两个 URL 发送 GET 请求到服务端：

```html
http://example.com/home 
http://example.com/about
```

那么这个时候服务端拿到的是完整的 URL，这时候服务端就必须分别对 `/home` 和 `/about` 做处理并返回相应的 HTML 来给到客户端渲染。这个带来的影响就是，如果你切换到某个服务端没有做相应处理的页面路由，比如：

```html
http://example.com/article
```

如果你在 SPA 中写了这部分路由要渲染的页面，在页面无刷新情况下跳转是没啥问题的。但是如果你直接在此路由下进行页面的**刷新**，就会得到一个 404。 

#### HashRouter

`HashRouter` 在 URL 中使用哈希符号（`#`）来使服务端忽略 `#` 后面所有的 URL 内容，比如你在浏览器地址栏中直接输入以下 URL：

```html
http://example.com/#/home 
http://example.com/#/about
```

服务端拿到的只会是 `http://example.com/` ，这样服务端只需要对这个路由做处理并返回 HTML，然后后面的路由 `/home` 或 `/about` 将全部交给客户端（也就是我们的 SPA 应用）来处理并渲染对应的页面。所以你在任意的路由进行页面的**刷新**都不会是 404。

### Link 和 Route 组件

如果当前的位置 pathname 与路由的路径 path 匹配，就会渲染对应的 UI。理想情况下，`<Route>` 组件应该有一个名为 `path` 的属性，如果路径名称与当前位置匹配，它就会被渲染。

`<Link>` 组件被用来在页面之间进行导航，它其实就是 HTML 中的 `<a>` 标签的上层封装，不过在其源码中使用 `event.preventDefault` **禁止了其默认行为**，然后使用 [history API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API) 自己实现了跳转。我们都知道，如果使用 `<a>` 标签去进行导航的话，整个页面都会被刷新，这是我们不希望看到的，当然，跳转到首页这种行为是推荐使用 `<a>` 标签的；

### Switch 组件

当多个 `<Route>` 被一起使用时，所有匹配到的路由都会被渲染，因为路由默认是模糊匹配的；使用 `<Switch>` ，只有第一个与当前 URL 匹配到的子 `<Route>` 才会被渲染；

## 路由基本使用

+ 安装：`npm install react-router-dom`

+ 导入路由的三个核心组件：BrowserRouter，Route，Link：

  ```jsx
  import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
  ```

+ 使用 Router 组件包裹整个应用；

  ```jsx
  const App = () => (
    <Router>
      <div>
        <h1>路由基本使用</h1>
      </div>
    </Router>
  )
  ```

+ 使用 Link 组件作为导航菜单（路由入口），最终会被渲染为 a 元素： 

  ```jsx
  <Link to="/first">页面 1</Link>
  ```

  `NavLink`是类似于`Link`，可以设置属性`activeStyle`或是`activeClassName`设置样式；

+ 使用 Route 组件配置路由规则和要展示的内容（路由出口）

  ```jsx
  <Route path="/first" component={First}></Route>		// First 组件
  ```

+ 使用 Switch  对路由做排他处理，将`Route`包裹在`Switch`内部，只要路由匹配到了一个其他的都不在匹配；通常情况下，还需要一个默认匹配的路由：

  > 最新的Router V6 中，`<Switch>`重命名为`<Routes>`，路由中的属性`component`重命名为`element`；

  ```react
  <Route
      path="*"
      element={
          <main><p>There's nothing here!</p></main>
      }
      />
  </Route>
  ```

## 动态路由

我们以一个常见的场景演示一下动态路由，即商城的商品详情页面：

```jsx
<Router>
  <div>
    <h1>动态路由使用</h1>
    <List/>
    <Route path='/detail/:id' component={Detail}></Route>
  </div>
</Router>

class List extends Component{
    render(){
        return(
            <>
                <h2>列表页</h2>
                <ul>
                    <li><Link to='/detail/1'>一号商品页面</Link></li>
                    <li><Link to='/detail/2'>二号商品页面</Link></li>
                    <li><Link to='/detail/3'>三号商品页面</Link></li>
                </ul>
            </>
        )
    }
}
class Detail extends React.Component {
    componentDidMount(){
        console.log(this.props.match.params.id)
    }
    render() {
        return (
            <div>
                <h2>商品详情页面</h2>
                <h4>{"请求获取" + this.props.match.params.id + "号页面数据"}</h4>
            </div>
        )
    }
}
```

## 权限路由

### ~~Redirect 组件~~

> 最新的React-router-dom v6升级改动中，将`Redirect`移除了，替代方案是引入`Navigate`标签；

与服务端的重定向类似，React Router 的 [Redirect component](https://reactrouter.com/web/api/Redirect) 将会用一个新的位置替换历史栈中的当前位置，新的位置是由 `to` 属性来指向的。那么接下来我就会向大家介绍如何使用 `<Redirect>` ：

```jsx
<Redirect to={{ pathname: '/login', state: { from: location }}}
```

如果有人试图在未登录状态下访问 `/admin` 路由，他就会被重定向到 `/login` 路由，关于当前位置的信息是由 `state` 属性进行传递的，这样做是为了在用户登录成功之后，用户又可以被重定向到他试图访问的路由页面。

### 自定义路由

如果我们需要决定一个路由是否应该被渲染，那么编写一个自定义路由是个好办法：

```jsx
const PrivateRoute = ({ component: Component, ...rest }) => {
  const location = useLocation();

  return (
    <Route {...rest}>
      {isLogin === true ? (
        <Component />
      ) : (
        <Redirect to={{ pathname: "/login", state: { from: location } }} />
      )}
    </Route>
  );
};

export default PrivateRoute;
```

## 编程式导航



## 默认路由



## 匹配模式



## 统一管理路由

React Router 也能像 Vue Router 一样在单独的文件中管理路由，需要安装包：`react-router-config` ;





[^参考]: [React Router 5 完整指南 - 掘金 (juejin.cn)](https://juejin.cn/post/6966242922278682632)

