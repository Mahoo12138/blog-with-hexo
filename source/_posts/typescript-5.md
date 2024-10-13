---
title: TypeScript学习-05-项目前端开发
date: 2021-11-30 23:39:18
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 初始化项目

```bash
npx create-react-app crowller-frontend --template typescript
```

使用脚手架`create-react-app`工具初始化项目，并设定模板为`typescript`类型，当使用各种外部依赖时，关于`typescript`的使用可查看文档，其中都会有栏目**在 TypeScript 中使用**，说明了如何在联动`typescript`；

为了简化UI开发，使用第三发的组件库：

```bash
npm install antd --save
```

并在启动文件代码顶部中，引入对应的样式文件：

```typescript
import 'antd/dist/antd.css';
```

## 页面开发

依照后端的开发进程，我们主要是有两个页面：登录和主页，在`src/`下，新建`pages`目录，并创建对应目录：`Login` &`Home`，做好结构划分；

### 登录页

```typescript
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import "./Login.css";

const LoginForm = () => {
  const onFinish = (values: {}) => {
    console.log("Received values of form: ", values);
  };

  return (
    <div className="login-page">
      <Form
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "请输入密码！",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
```

登录页简单起见，只写了一个卡片，内部是一个输入框和登录按钮；

### 主页及数据

状态数据`inited`和`isLogin`判断是否登录跳转页面，页面由三个按钮和数据图表组成，

```typescript
interface CourseItem {
  title: string;
  count: number;
}

interface State {
  inited: boolean;
  isLogin: boolean;
  data: {
    [key: string]: CourseItem[];
  };
}
class Home extends Component {
  state: State = {
    inited: false,
    isLogin: true,
    data: {},
  };

  render() {
    const { isLogin, inited } = this.state;
    if (isLogin) {
      if (inited) {
        return (
          <div className="home-page">
            <div className="button-list">
              <Row>
                <Col span={8}>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={this.handleCrowller}
                  >
                    爬取
                  </Button>
                </Col>
                <Col span={8}>
                  <Button type="primary" size="middle">
                    展示
                  </Button>
                </Col>
                <Col span={8}>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={this.handleLogout}
                  >
                    退出
                  </Button>
                </Col>
              </Row>
            </div>
            <ReactECharts option={this.getOption()} />
          </div>
        );
      } else {
        return null;
      }
    } else {
      return <Navigate to="/login" />;
    }
  }
}
```

按钮的点击事件和生命周期函数，按钮点击分别触发爬取数据和退出登录，生命周期函数中检测登录，跳转页面：

```typescript
componentDidMount() {
    axios.get("/api/islogin").then(({ data }) => {
        if (!data.data) {
            this.setState({ isLogin: false });
        } else {
            this.setState({ inited: true });
        }
    });
    axios.get("/api/show").then(({ data }) => {
        this.setState({
            data,
        });
    });
}

handleCrowller = () => {
    axios.get("/api/data").then(({ data }) => {
        if (data.data) {
            message.success("爬取成功");
        }
    });
};

handleLogout = () => {
    axios.get("/api/logout").then(({ data }) => {
        console.log(data);
        if (data.data) {
            this.setState({ isLogin: false });
        } else {
            message.error("退出失败");
        }
    });
};
```

### 路由配置

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
```

## 数据可视化

安装依赖，以及简单使用：

```bash
npm install --save echarts-for-react
npm install --save echarts
```

```typescript
import ReactECharts from 'echarts-for-react';

<ReactECharts option={this.getOption()} />
```

查看官网给出的[示例]([Examples - Apache ECharts](https://echarts.apache.org/examples/zh/editor.html?c=line-stack))，选取符合要求的折线图表，并对数据进行处理：

```typescript
getOption() {
    const { data } = this.state;
    const courseNames: string[] = [];
    const times: string[] = [];
    const tempData: {
        [key: string]: number[];
    } = {};
    for (let i in data) {
        const item = data[i];
        times.push(moment(Number(i)).format("MM-DD HH:mm"));
        item.forEach((innerItem) => {
            const { title, count } = innerItem;
            if (courseNames.indexOf(title) === -1) {
                courseNames.push(title);
            }
            tempData[title]
                ? tempData[title].push(count)
            : (tempData[title] = [count]);
        });
    }
    const seriesData = [];
    for (let i in tempData) {
        seriesData.push({
            name: i,
            type: "line",
            data: tempData[i],
        });
    }
    return {
        title: {
            text: "学习人数",
        },
        tooltip: {
            trigger: "axis",
        },
        legend: {
            data: courseNames,
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: times,
        },
        yAxis: {
            type: "value",
        },
        series: seriesData,
    };
}
```

## 简单优化

新建`request.ts`文件，对网络请求的结果做一层提取，没必要反复做`data.data`的操作：

```typescript
import axios from "axios";

const http = axios.create({ baseURL: "/" });

http.interceptors.response.use((response) => {
  return response.data;
});

export default http;
```





