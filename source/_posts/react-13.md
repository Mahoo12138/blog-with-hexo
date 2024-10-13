---
title: 前端学习之React项目实战Ⅰ
date: 2022-01-18 15:32:51
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 项目创建

使用 `react-create-app`初始化项目后：

+ `react-app-env.d`用于引入预先定义好的类型

+ `reportWebVitals.ts`用于埋点上报；
+ `setupTests.ts`用于配置单元测试，默认使用 `testing-library`进行测试；

### 基础配置

+ 在`tsconfig.json`里，在`compilerOptions`下添加配置：`baseUrl: "./src"`；将引入模块的绝对路径设置为 **./scr**；
+ 添加插件包：[Prettier](https://prettier.io/)，配置参考官方文档：
  + `npm install --save-dev --save-exact prettier`
  + 创建配置文件`.prettierrc.json`和忽略文件` .prettierignore `
  + 手动格式化命令：`npx prettier --write .`；
  + 配置 Commit 时自动格式化：`Pre-commit Hook`，使用命令：`npx mrm@2 lint-staged`，然后会在`package.json`中配置对各种后缀名文件的支持；
  + 因使用 `react-create-app`初始化项目自带 ESLint ，需要安装[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier#installation)才能让它们更和谐地工作，之后在`package.json --> eslintConfig --> extends`添加**"prettier"**，以覆盖原来的规则；

+ 安装工具，确保每次提交的 Commit comment 符合一定的规范，否则提交失败：
  + `npm install --save-dev @commitlint/config-conventional @commitlint/cli`
  + `echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js`
  + `npx husky add .husky/commit-msg \"npx --no -- commitlint --edit '$1'\"`
  + 查看对应提交规则：[conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
+ Mock 数据的配置：使用 [json-server](https://github.com/typicode/json-server)，快速地创建 REST API：
  + 安装：`npm install -g json-server`
  + 配置：新建文件夹`__json_server_mock__`，创建数据文件`db.json`，填充数据；
  + 使用：`json-server --watch __json_server_mock__/db.json`

> + `--save-dev/-D`：安装到开发环境依赖；
> + `--save-optional/-O`：安装到可选环境依赖；
> + `--save-exact/-E`：精确安装

## 工程列表

主页面：

```react
export const ProjectListPage = () => {
  const [param, setParam] = useState({
    name: "",
    personID: ""
  })
  const [list, setList] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetch(`${apiUrl}/users`).then(async response => {
      if(response.ok){
        setUsers(await response.json())
      }
    })
  }, [])  // 只触发一次
  return (<div>
    <SearchPanel param={param} setParam={setParam} users={users} setUsers={setUsers}/>
    <List list={list} users={users}/>
  </div>)
}
```

搜索框和下拉选择框：

```react
const SearchPanel = ({param,setParam,users,setUsers}) => {
  return (
    <div>
      <input type="text" value={param.name} onChange={e => setParam({...param, name:e.target.value})}></input>
      <select value={param.personID} onChange={e => setParam({...param,personId: e.target.value})}>
        <option value={''}>负责人</option>
        {
          users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)
        }
      </select>
    </div>
  )
}
```

工程列表：

```react
const List = ({list,users}) => {
  return (
    <table>
      <thead>
        <tr><th>名称</th><th>负责人</th></tr>
      </thead>
      <tbody>
        {
          list.map(project => (<tr key={project.id}>
            <td>{project.name}</td>
            <td>{users.find(user => user.id === project.personId)?.name || '未知'}</td>
          </tr>))
        }
      </tbody>
    </table>
  )
}
```

### 接口配置

+ 在`src`下，创建两个文件`.env`，`.env.development`，对应生产和开发环境；
+ 开发环境下，添加内容：`REACT_APP_API_URL=http://localhost:3001`；
+ 使用：`const apiUrl = process.env.REACT_APP_API_URL`；

### 工具函数

在请求数据时，如搜索框和下拉框当有一处为空时，会给后端造成疑惑，是请求该字段为空的数据还是忽略该数据，这样的情况最好在前端避免，需要写一些工具代码进行处理：

```react
export const isFalsy = (value) => value === 0 ? false : !value

export const cleanObject = (obj) => {
  const result = { ...obj }
  Object.keys(result).forEach(key => {
    const value = result[key]
    if (isFalsy(value)) {
      delete result[key]
    }
  })
  return result
}
```

### 参数查询

安装参数拼接处理的外部库：`qs`；使用工具函数处理查询的数据：

```react
useEffect(() => {
    fetch(`${apiUrl}/projects?${qs.stringify(cleanObject(param))}`)
        .then(async response => {
            if(response.ok){
                setList(await response.json())
            }
    })
}, [param])
```

## 自定义 Hook

### useMount

```react
export const useMount = (callback) => {
  useEffect(() => {
    callback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
```

当我们需要一个`useEffect`只在组件挂载时执行一次时，需要在其第二个参数中传入空数组，但这样语义性并不强，所以可以封装一个`useMount`，传入需要执行的回调函数即可；

### useDebounce

Debounce 也就是防抖动，是处理一些需要短暂延时后再进行的操作，例如搜索框的内容提示等；以下是类似的案例，对搜索框发送请求进行 debounce：

```react
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(timeout)
    }
  }, [value, delay])

  return debouncedValue
}
```

## 登录页面

```react
import React, { FormEvent } from "react";

export const LoginPage = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const login = (param: { username: string; password: string }) => {
      fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(param),
      }).then(async (response) => {
        if (response.ok) {}
      });
    };
    e.preventDefault();
    const username = (e.currentTarget.elements[0] as HTMLInputElement).value;
    const password = (e.currentTarget.elements[1] as HTMLInputElement).value;
    login({ username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">用户名</label>
        <input type="text" id={"username"}></input>
      </div>
      <div>
        <label htmlFor="password">密码</label>
        <input type="password" id={"password"}></input>
      </div>
      <button type="submit">登录</button>
    </form>
  );
};

```

这里我们再继续使用 `json server`作为后端，之后会使用另外的插件，由于 `json server`仅支持 RestAPI 风格，对登录验证这样的业务，需要进行中间件注入；

### json server 中间件

创建文件`__json_server_mock__/middleware.js`：

```js
module.exports = (req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    if (req.body.username === 'mahoo12138' && req.body.password === 'xm12345678') {
      return res.status(200).json({
        user: {
          token: '12345'
        }
      })
    } else {
      return res.status(400).json({ message: '用户名或密码错误' })
    }
  }
  next()
}
```

注入中间件，在启动代码中修改为如下代码：

```bash
json-server --watch __json_server_mock__/db.json --port 3001 --middlewares ./__json_server_mock__/middleware.js
```

### context 存储全局状态

首先，为了更好地专注地进行学习，将使用另一个专用的插件 **jira-dev-tool** 作为后端，使用`npx imooc-jira-tool`进行安装，使用方法：

```react
import { loadDevTools } from "jira-dev-tool";

loadDevTools(() => {
  ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
```

**jira-dev-tool**使用本地的 localStorage 作为存储，需要与之建立联系并操作 Token；真实开发过程中往往会使用第三方或自研的SDK，往往不需要下列代码：

```jsx
export const localStorageKey = "__auth_provider_token__";

export const getToken = () => window.localStorage.getItem(localStorageKey);

export const handleUserResponse = ({ user }: { user: User }) => {
  window.localStorage.setItem(localStorageKey, user.token || "");
  return user;
};

export const login = (param: { username: string; password: string }) => {
  return fetch(`${apiUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(param),
  }).then(async (response) => {
    if (response.ok) {
      return handleUserResponse(await response.json());
    } else {
      return Promise.reject(param);		// throw new Error() 类似于
    }
  });
};

export const logout = async () =>
  window.localStorage.removeItem(localStorageKey);
```

之后，利用上述的代码，封装一个提供登录注册数据持久化的 ContextProvider ，且通过自定义的 useAuth 还能在任意子组件获取到该 Context ：

```jsx
import * as auth from "auth-provider";

interface AuthForm {
  username: string;
  password: string;
}

const AuthContext = React.createContext<
  | {
      user: User | null;
      login: (form: AuthForm) => Promise<void>;
      register: (form: AuthForm) => Promise<void>;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);

AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (form: AuthForm) => auth.login(form).then((u) => setUser(u));
  const register = (form: AuthForm) => auth.register(form).then(setUser); // point free
  const logout = () => auth.logout().then(() => setUser(null));

  return (
    <AuthContext.Provider
      children={children}
      value={{ user, login, register, logout }}
    />
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
};
```

### 项目结构优化

```tsx
function App() {
  const { user } = useAuth();
  return (
    <div className="App">
      {/* <ProjectListPage /> */}
      {user ? <AuthenticateApp /> : <UnAuthenticateApp />}
    </div>
  );
}
```

将页面分为登录和未登录后两个部分，登录后即是项目列表页面，未登录包括注册登录页面：

```tsx
export const UnAuthenticateApp = () => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <div>
      {isLogin ? <LoginPage /> : <RegisterPage />}
      <button onClick={(e) => setIsLogin(!isLogin)}>切换</button>
    </div>
  );
};
```

## 页面样式

### 引入 Ant Design

+ 安装：`npm i antd`

+ 引入样式文件：`import "antd/dist/antd.less";`

+ 主题配置：需要修改`create-react-app` 的默认配置，使用 [craco](https://github.com/gsoft-inc/craco) （一个对 create-react-app 进行自定义配置的社区解决方案）

  + 安装：`npm i @craco/craco craco-less` ，定义主题需要用到 [less-loader ](https://github.com/webpack-contrib/less-loader/)提供的 less 变量覆盖功能

  + 修改启动脚本命令为：`"start": "craco start"`，替代`react-scripts`；

  + 创建一个 `craco.config.js` 用于修改默认配置：

    ```js
    const CracoLessPlugin = require('craco-less');
    
    module.exports = {
      plugins: [
        {
          plugin: CracoLessPlugin,
          options: {
            lessLoaderOptions: {
              lessOptions: {
                modifyVars: { '@primary-color': '#1DA57A' },
                javascriptEnabled: true,
              },
            },
          },
        },
      ],
    };
    ```

  + 利用 [less-loader](https://github.com/webpack/less-loader#less-options) 的 `modifyVars` 来进行主题配置，可参考 [配置主题](https://ant.design/docs/react/customize-theme-cn) 文档，

### 使用 Emotion 模块

安装：`npm i @emotion/react @emotion/styled`

#### 新增普通css组件

```react
// 引入emotion
import styled from "@emotion/styled”;
// 使用emotion 创建css组件
const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
`;
```

#### 使用行内样式

首先，需要在代码文件顶端添加：`/* @jsxImportSource @emotion/react */`，标识当前组件用了emotion行内样式；使用如下：

```jsx
<Form css={{ marginBottom: "2rem", ">*": "" }} layout={"inline"}>
	{/*...*/}
</Form>
```

#### 给已存在组件加样式

```react
// Card 是antd已存在的组件
const ShadowCard = styled(Card)`
    width: 40rem;
    min-height: 56rem;
    padding: 3.2rem 4rem;
    border-radius: 0.3rem;
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 10px;
    text-align: center;
`;
```

### 配置基础全局样式

```css
html {
  font-size: 62.5%;
  /* 默认字体大小是16px */
  /* 16 * 62.5% = 10px，即 1rem = 10px */
}
html body #root .App {
  /* 将页面的高度限制在整个视口的高度 */
  min-height: 100vh;
}
```

