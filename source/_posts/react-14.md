---
title: 前端学习之React项目实战Ⅱ
date: 2022-02-01 18:02:04
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 异步加载处理

为了能够精准的控制和获取异步加载的状态，可以自定义一个处理的Hook，如下：

```tsx
import { useState } from "react";

interface State<D> {
  error: Error | null;
  data: D | null;
  stat: "idle" | "loading" | "error" | "success";
}

const defaultInitialState: State<null> = {
  stat: "idle",
  data: null,
  error: null,
};

const defaultConfig = {
  throwOnError: false,
};

export const useAsync = <D>(
  initialState?: State<D>,
  initialConfig?: typeof defaultConfig
) => {
  const config = { ...defaultConfig, ...initialConfig };
  const [state, setState] = useState<State<D>>({
    ...defaultInitialState,
    ...initialState,
  });

  const setData = (data: D) => {
    setState({
      data,
      stat: "success",
      error: null,
    });
  };

  const setError = (error: Error) => {
    setState({
      error,
      data: null,
      stat: "error",
    });
  };

  const run = (promise: Promise<D>) => {
    if (!promise || !promise.then) {
      throw new Error("需要传入 Promise 类型参数");
    }
    setState({ ...state, stat: "loading" });
    return promise
      .then((data) => {
        setData(data);
        return data;
      })
      .catch((error) => {
        setError(error);
        // catch 会捕获异常，不会续传
        // return error;
        if (config.throwOnError) {
          return Promise.reject(error);
        }
        return error;
      });
  };

  return {
    isIdel: state.stat === "idle",
    isLoading: state.stat === "loading",
    isError: state.stat === "error",
    isSuccess: state.stat === "success",
    run,
    setData,
    setError,
    ...state,
  };
};
```

`useAsync`可以传入初始状态和配置两个参数，配置中的`throwOnError`为`true`用于处理同步逻辑，用`Promise.reject(error)`抛出错误，异步时，将错误直接放到`State`状态中；

### 登录注册页面

登录注册时的 loading 和错误处理即可借助于自定义的 `useAsync`，为了可以将捕获的错误显示在页面上，需要在上层组件上对登录注册页面传递一个`onError`：

```tsx
const [error, setError] = useState<Error | null>(null);

return (
    {/* ... */}
    {error ? (
    <Typography.Text type="danger">{error.message}</Typography.Text>
		 ) : null}
	{isLogin ? (
    	<RegisterPage onError={setError} />
		   ) : (
    	<LoginPage onError={setError} />
	)}
)
```

页面中，将登录注册的逻辑传入`run`中处理，并在`Button`中设定 loading 加载的 `flag`：

```tsx
const { run, isLoading } = useAsync(undefined, { throwOnError: true });
const handleSubmit = async (values: {
                            username: string;
                            password: string;
                            }) => {
    try {
        await run(login(values));
    } catch (e) {
        onError(e as Error);
    }
};

return (
    {/* ... */}
    <LongButton loading={isLoading} type="primary" htmlType="submit">
        登录
    </LongButton>
)
```

### 工程列表获取

同样的，工程列表的也可以用 `useAsync` 进行封装，而且可以更一步封装，将所有的逻辑都封装到一个自定义Hook文件中，通过`useAsync`提供的返回值作为返回值：

```tsx
export const useProjects = (param?: Partial<Project>) => {
  const request = useHttp();

  const { run, ...result } = useAsync<Project[]>();

  useEffect(() => {
    run(request("projects", { param: cleanObject(param || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);

  return result;
};
```

### 用户数据获取

在页面刷新时，会短暂跳出登录注册时的页面，我们需要用加载的动画来替代；其次若发生了错误，需要全屏显示出来，可添加一些自定义组件：

```tsx
const FullPage = styled.div`
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
`;

export const FullPageLoading = () => (
  <FullPage>
    <Spin size="large"></Spin>
  </FullPage>
);

export const FullPageErrorFallback = ({ error }: { error: Error | null }) => (
  <FullPage>
    <DevTools />
    <Card>
      <Typography.Text type="danger">{error?.message}</Typography.Text>
    </Card>
  </FullPage>
);
```

为了避免全屏的错误提示影响后端工具的操作（控制台工具不会渲染），需要添加上`<DevTools />`，之后同样的，将异步处理交由`useAsync`代办：

```tsx
const {
    run,
    error,
    isIdel,
    isError,
    isLoading,
    data: user,
    setData: setUser,
} = useAsync<User | null>();

run(bootstrapUser());

if (isIdel || isLoading) {
    return <FullPageLoading />;
}
if (isError) {
    return <FullPageErrorFallback error={error} />;
}
```

## 捕获边界错误

> 在渲染阶段或者在其他非网络请求的异步阶段，错误如何处理呢？
>
> + 渲染阶段出现未捕获的异常，整个 React 组件树都会被卸载，显示空白页面；
> + 异步抛出异常（如事件处理），页面不会受影响；

**错误边界**，是一种 React 组件，可捕获并打印发生在其子组件树任何位置的 JavaScript 错误；接下来的学习中，我会简单地实现一个这样的组件；

React 规定了，若一个 class 组件中，定义了`static getDerivedStateFromError()`或者`componenDidCatch()`这两个生命周期方法中任意一个，则该组件就是一个错误边界。

```typescript
import React from 'react';

type FallbackRender = (props: {error: Error | null}) => React.ReactNode

export class ErrorBoundary  extends React.Component<React.PropsWithChildren<{fallbackRender: FallbackRender}>> {

  state = {error: null}

  // 当子组件抛出异常时，这里会接收到并且调用该静态方法，返回的值会赋给 state
  static getDerivedStateFromError(error: Error){
      return {error}
  }

  render(): React.ReactNode {
      const {error} = this.state;
      const {fallbackRender, children} = this.props;
      if(error){
        return fallbackRender({error})
      }
      return children;
  }
}
```

完成之后，在 App 组件中，作为子组件把整个 app 内容包裹起来，当遇到渲染错误时，都会以全局错误页面的形式展示错误信息：

```react
function App() {
  const { user } = useAuth();
  return (
    <div className="App">
      <ErrorBoundary fallbackRender={FullPageErrorFallback}>
      {user ? <AuthenticateApp /> : <UnAuthenticateApp />}
      </ErrorBoundary>
    </div>
  );
}
```

上述造的轮子，已有更好的开源实现：[bvaughn/react-error-boundary: Simple reusable React error boundary component ](https://github.com/bvaughn/react-error-boundary)，API 是类似的，它的实现更加完善；

## 动态修改标题

### 使用 react-helmet

安装第三方包：[nfl/react-helmet: A document head manager for React](https://github.com/nfl/react-helmet)

在页面组件内插入，即可修改页面的 head：

```react
<Helmet>
    <meta charSet="utf-8" />
    <title>My Title</title>
    <link rel="canonical" href="http://mysite.com/example" />
</Helmet>
```

### useRef 封装 useDocumentTitle

使用`useEffect`只要在参数 title 改变时，一并把页面标题改变即可；

```react
export const useDocumentTitle = (title: string) => {
  useEffect(()=>{
    document.title = title
  }, [title])
}
```

但是这样的设计，每次 title 赋值以后，必须在每个页面都指定 title，进入新页面时才会随之改变，若没有指定的页面，则还是原来的 title；

我们能不能在页面返回时，还原成原来的 title 呢？当然，我们可以在页面标题更改前，将 title 存储，并在页面挂载时恢复即可；

```react
export const useDocumentTitle = (
    title: string,
    keepOnUnmount: boolean = true
) => {
    const oldTitle = document.title;

    useEffect(() => {
        document.title = title;
    }, [title]);
 
    useEffect(() => {
        return () => {
            if (!keepOnUnmount) {
                document.title = oldTitle;
            }
        };
    });
};
```

页面初次渲染时，`useDocumentTitle`调用拿到当前 title 并保存到 oldTitle，之后每一次渲染都会改变 oldTitle，那么为什么页面渲染时，还能复原最初的 title 呢？这是因为由于**闭包**的缘故，`useEffect`内部返回的回调函数拿到的 oldTitle 其实是页面初次渲染时的 title，这也得益于`useEffect`没有设置依赖项，否则每次的回调函数都会因为依赖项更改而重新生成。

不过，这样的代码会显示警告，React 会提示将`useEffect`内部用到的变量作为依赖项，而且，代码含义并不直观，这里就需要 React 自带的 `useRef`Hook来解决问题了；

> `useRef`返回一个可变的 ref 对象，其`.current`属性被初始化为传入的参数，返回的 ref 对象在组件的生命周期内保持不变；

## 列表详情路由

安装： `npm install react-router-dom@6`，

### Router 

**`Router`在`react-router`内部主要用于提供全局的路由导航对象（一般由`history`库提供）以及当前的路由导航状态，在项目中使用时一般是必须并且唯一的。**

不过我们一般不会直接使用该组件，更多会使用已经封装好路由导航对象的`BrowserRouter`（`react-router-dom`包引入）、`HashRouter`（`react-router-dom`包引入）和`MemoryRouter`（`react-router`包引入）。

### Routes

对应的是之前的`Switch`组件，它实现了相对路由和链接、自动路由排名、嵌套路由和布局等功能。使用`Routes`将`Route`包裹起来作为`children`传入；

### Route

它负责渲染 React 组件的 UI，props 包含 path 和 element 属性，指定 URL 和 对应的页面组件；

### Link

类似于 `Route`，用于页面内进行导航的组件，to 属性指定跳转的 URL；

### Navigate

用于代替原`Redirect`组件，该组件一渲染就会发生跳转，可用做默认路由，通常放在最后，之前的路由都没有匹配则渲染`Navigate`中的 URL；props 包含属性 replace 指定跳转模式 PUSH | REPLACE；

### 项目路由设置

综上所述，我们在 App 中定义以下路由： 

```react
<Router>
    <Routes>
        <Route path={"/projects"} element={<ProjectListPage />} />
        <Route path={"/projects/:projectId/*"} element={<ProjectPage />} />
        {/* 默认路由 */}
        <Route path='*' element={<Navigate to={"/projects"}/>}/>
    </Routes>
</Router>
```

并将数据项中的名称设置为导航路由：

```react
{
    title: "项目",
    // dataIndex: "name",
    render(value, project) {
        return <Link to={String(project.id)}>{project.name}</Link>;
    },
    sorter: (a, b) => a.name.localeCompare(b.name),
},
```

新建的`ProjectPage`页面中，依照业务还需要两个子路由**看板**和**任务组**，我们先粗略的写好：

```react
const ProjectPage = () => {
  return <div>
    <h1>Project</h1>
    <Link to={"kanban"}>看板</Link>
    <Link to={"epic"}>任务组</Link>
    <Routes>
      <Route path='kanban' element={<KanbanPage/>}/>
      <Route path='epic' element={<EpicPage/>}/>
    </Routes>
  </div>;
};
```

#### 重置根路由

通常情况下，当我们点击页面的 Logo 时，页面会刷新并回到根路由根路由，我们来实现这个功能：

```react
export const resetRoute =() => window.location.href = window.location.origin;

<Button type='link' onClick={resetRoute} style={{"padding":0}}>
    <Logo width={"18rem"} color={"rgb(38,132,255)"} />
</Button>
```

在 *utils.ts*中，封装一个重置的函数，之后把 Logo 用按钮包裹，并设置点击事件函数即可；

## URL 状态管理

我们想实现在页面中进行数据筛选时，根据判断条件 URL也随之改变，继而达到一个URL状态管理的效果，而每次打开此URL数据的筛选情况能够复现；首先，我们自定义一个`useUrlQueryParam`的Hook，该Hook会提取URL查询的值并返回：

```typescript
/**
 * @description 返回页面URL中指定键的值
 * @param keys
 */
export const useUrlQueryParam = <K extends string>(keys: K[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  return [
    keys.reduce((prev, key) => {
      return {...prev, [key]: searchParams.get(key) || ''}
    }, {} as {[key in K]: string}),
    setSearchParams
  ] as const
}
```

之后在 project-list 中，从`useUrlQueryParam`中取 param ：

```react
const [param] = useUrlQueryParam(['name','personId'])
```

这样下来，我们的页面会陷入**无限的循环渲染**，寻找其发生原因对于没有经验的我们来说十分困难，这里可以利用一个第三方库：[welldone-software/why-did-you-render](https://github.com/welldone-software/why-did-you-render)帮助我们检测是什么在造成循环渲染；

### 循环渲染检测

安装后，在根目录新建 *wdyr.ts*，之后在入口文件 *index.tsx*中，在 React 导入前导入（最前方）：

```typescript
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
      // 是否监测所有组件
    trackAllPureComponents: fasle,
  });
}
// first import
import './wdyr';
```

由于我们刚才循环渲染的组件是 ProjectList 没必要设置检测全部组件，所以在 ProjectList 上添加一个静态属性`whyDidYouRender`，即可开启对其监测：

```typescript
export const ProjectListPage = () => {/* ... */};
ProjectListPage.whyDidYouRender = true;
```

检测后会发现控制台提示如下，相信大家心里都有了答案：

> different objects that are equal by value: **prev "**: {name: 'xxxx', personId: '123'}

原因应该是`useUrlQueryParam`返回的值，每次都不一样（地址），导致页面刷新，所以有必要使用另一个 React Hook 即`useMemo`包裹，判断依赖改变时才执行函数：

```typescript
useMemo(
    () => keys.reduce((prev, key) => {
    		return { ...prev, [key]: searchParams.get(key) || ''}
		},{} as { [key in K]: string }), 
    [searchParams]
)
```

> 从上面的代码，我们可以了解到，基本类型可以放到依赖里，组件状态可以放到依赖里；

获取到 URL 查询的参数，这还只是一半，还需要对参数进行设置，我们修改`useUrlQueryParam`的返回值：

```typescript
return [
    /* useMemo */,
    (params: Partial<{[key in K]:unknown}>) => {
        const o = cleanObject({...Object.fromEntries(searchParams), ...params})
        // 当 personId 为 0，无意义，可直接删除
        if(o.personId ===0) delete o.personId
        setSearchParams(o as URLSearchParamsInit)
    }
] as const
```

以上步骤完成后，我们也可以对 param 的操作做进一步封装，在当前目录新建 *utils.ts*：

```typescript
export const useProjectQueryParam  = () => {
  const [param, setParam] = useUrlQueryParam(["name","personId"])
  return[
    {...param, personId: Number(param.personId) || undefined},   // 0 => undefined
    setParam
  ] as const 
}

// 原处更改调用
const [param, setParam] = useProjectQueryParam()
const { isLoading, error, data } = useProjects(useDebounce(param, 300));
```

## ID 类型问题

我们注意到，服务端返回的值例如 id 通常为 number 类型，而经过在 select 和 option 这个 html 组合一顿操作会变成 string 类型，这样会造成类型不匹配，导致页面出现错误的渲染，我们可以每次都在组件回调中，将类型做转换，但这样十分不优雅，封装一个是 select 更好的选择：

1. 首先是组件的 Props 这里的 select 使用 antd 的组件，所以需要透传其原有的 props：

   ```react
   type SelectProps = React.ComponentProps<typeof Select>;
   
   interface IdSelectProps
     extends Omit<SelectProps, "value" | "options" | "onChange"> {
     value: Raw | undefined | null;
     onChange: (value?: number) => void;
     defaultOptionName?: string;
     options?: { name: string; id: number }[];
   }
   ```

2. 我们在`onChange`回调中作为了类型的转换，转换为数字：

   ```react
   const toNumber = (value: unknown) => (isNaN(Number(value)) ? 0 : Number(value));
   
   export const IdSelect = (props: IdSelectProps) => {
     const { value, onChange, defaultOptionName, options, ...restProps } = props;
     return (
       <Select
         value={toNumber(value)}
         onChange={(v) => onChange(toNumber(v))}
         {...restProps}
       >
         {defaultOptionName ? (
           <Select.Option value={0}>defaultOptionName</Select.Option>
         ) : null}
         {options?.map((option) => (
           <Select.Option key={option.id} value={option.id}>
             {option.name}
           </Select.Option>
         ))}
       </Select>
     );
   };
   ```

### 封装 UserSelect

之后，我们利用以及写好的 IdSelect 来实现我们的用户选择：

```react
export const UserSelect = (props: React.ComponentProps<typeof IdSelect>) => {
  const {data: users} = useUsers()
  return <IdSelect options={users || []} {...props }></IdSelect>
}
```

完成这里还有一个小问题，当刷新页面还未获取到数据（options 为空）时，select 处会显示数字，这也很简单，在IdSelect 的 value 处做一个判断即可：

```react
<Select value={options?.length ? toNumber(value) : 0}></Select>
```

## 编辑项目列表

### 添加收藏一栏

根据业务需求，在项目列表应有一个收藏加星的按钮，我们打算使用 antd 内的 Rate 组件作为显示的按钮，需要适当做一些调整：

```react
// 封装新的组件时，第一步几乎是声明 props 类型
interface PinProps extends React.ComponentProps<typeof Rate> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void
}

export const Pin = (props: PinProps) => {
  const {checked, onCheckedChange, ...restProps } = props
  return <Rate
    count={1}
    value={checked ? 1 : 0}
    onChange={num => onCheckedChange?.(!!num)}
    {...restProps}
  ></Rate>
}
```

例如：显示的星星数量只为一，且需要定义新的属性用于将 0 / 1 转换到布尔值，相应的改变的回调函数也要做调整，之后即是在数据列表添加了，再次之前我们需要想好如何设计编辑 project 的 hook，因为是在`onCheckedChange`回调中进行的，是无法直接使用的，所以依旧原来的套路，在组件初始时调用 Hook，返回编辑相关内容，以下是编辑的 Hook 代码，添加删除可以类似修改：

```react
export const useEditProject = () => {
  const { run, ...asyncResult } = useAsync()
  const client = useHttp()

  const mutate = (params: Partial<Project>) => {
    return client(`projects/${params.id}`, {
      method: 'PATCH',
      data: params
    })
  }
  return {mutate, ...asyncResult}
}
```

有了上面的设计，之后的操作就好办了，直接新增一个数据项，调用`useEditProject`返回的函数即可：

```react
const List = ({ users, ...props }: ListProps) => {
  const { mutate } = useEditProject();
  const pinProject = (id: number) => (pin: boolean) => mutate({id,pin})
  
  return (
    <Table
      rowKey={"id"}
      columns={[{
          title: <Pin checked={true} disabled={true} />,
          render(value, project) {
            return (
              <Pin
                checked={project.pin}
                // onCheckedChange={(pin) => mutate({ id: project.id, pin })}
                // 柯里化
                onCheckedChange={pinProject(project.id)}
              />
            );
          },
      }]}
    ></Table>
  );
};
```

### 编辑后刷新列表

如何做到，收藏操作后刷新页面？一种思路是，将获取数据的`useProjects`内部返回一个函数，提供给外界调用，实现刷新，例如：

```react
const { isLoading, error, data, retry } = useProjects(useDebounce(param, 300));
```

要想实现刷新数据，则需要再次执行`useProjects`内的`useEffect`内的函数：

```react
useEffect(() => {
    run(request("projects", { data: cleanObject(param || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [param]);
```

而在`useProjects`内部异步操作由`useAsync`实现，可否能在`useAsync`内下点功夫：数据的请求通过`run`执行，能否在`run`内部做些工作呢？简单的思路是，在`Promise`传入时保存下来：

```react
const [retry, setRetry] = useState(() => () => {
});

const run = (...) => {
    //...
    setRetry(()=>{return ()=>run(promise)})
}
```

但是这样的编码看起来没有问题，实则犯了一个大忌，因为此时传入的`Promise`内部并没有原始网络请求的代码，它只是一个保存着未来到达的数据的容器，简而言之，下一次再次运行此处保存的`Promise`时，只会拿到上次的数据，而没有做新的数据请求，这样页面是不会触发刷新的；

既然这样，那把网络请求也放进去不就得了，那我们试试看，要在`useProjects`内动手脚：

```react
const useProjects = (...) => {
    const fetchPorjects = () =>
    request("projects", { data: cleanObject(param || {}) });
    
    useEffect(() => {
    run(fetchPorjects(), { retry: fetchPorjects });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param]);
}
```

我们在传入原有`Promise`的基础上，再向run函数传入了一个配置对象（`runConfig`），里面放置了网络请求的函数，之后在`setRetry`时返回一个运行该配置对象内函数的`run`函数即可：

```react
setRetry(() => {
    return () => {
        if (runConfig?.retry) {
            run(runConfig.retry(), runConfig);
        }
    };
});
```

返回的函数内部，`run`运行时也把原来的配置对象传入了，保存以便再次刷新；

### 优化异步请求

在此，我们要针对一个常见的异步请求错误进行优化，例如当异步网络请求进行时，我们卸载网络请求发起的组件后，控制台会有如下报错，在项目中，可加大网络请求时长，在刷新退出到登录页面复现错误：

> Warning: Can't perform a React state update on an **unmounted component**. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

我们可以定义一个新的 Hook 来解决这个问题，这个 Hook 的主要功能是返回逐渐的挂载状态：

```react
export const useMountedRef = () => {
    const mountedRef = useRef(false)
    useEffect(()=>{
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    })
    return mountedRef
}
```

接着，只需要在`run`函数内部的`setData`前进行判断即可：

```react
if (mountedRef.current) setData(data);
```



### 解决遗留问题

之前`useEffect`中的依赖问题，我们都是使用注释的方式给镇压住，现在是解决这个问题的时机了，需要一个 React 中的 Hook 即 useCallback，例如：

```react
useEffect(() => {
    run(fetchPorjects(), { retry: fetchPorjects });
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [param]);
```

此处我们可以将 run 函数放入 useCallback 中，useCallback 第二个参数需要传入依赖，根据代码提示可将`[config.throwOnError, mountedRef, setData, state]`传入，然后可将`setData`和`useHttp`的`request`也用`useCallback`包裹，不过这样操作下来页面仍然出现卡死循环，其实原因是在于我们的`state`，因为`run`函数运行时`setState`会改变`state`触发刷新，且`state`又在依赖中，即又会导致 `run` 重新运行，则导致无限循环。解决方式是在`setState`内传入函数参数：

```react
setState((prevState)=>{...prevState, stat: ""})
```
