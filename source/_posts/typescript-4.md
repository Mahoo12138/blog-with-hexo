---
title: TypeScript学习-04-项目接口开发
date: 2021-11-27 22:43:35
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 装饰器实现路由

在`src/`主目录下，新建目录`controller`，并创建两个文件`LoginController.ts`和`decorators.ts`；

在`decorators.ts`文件中，在方法的装饰器上定义元数据，值为路由的链接：

```typescript
import "reflect-metadata";
import { Router } from "express";

export const router = Router();

export function controller(target: any) {
  // 类构造器拿到的是构造函数
  for (let key in target.prototype) {
    const path = Reflect.getMetadata("path", target.prototype, key);
    const hander = target.prototype[key];
    if(path){
      router.use(path,hander)
    }
  }
}

export function get(path: string) {
  // 方法装饰器拿到的是原型对象
  return function (target: any, key: string) {
    Reflect.defineMetadata("path", path, target, key);
  };
}
```

在`LoginController.ts`中，设置构造器，也可以将`controller`构造器设为工厂构造器，依次可配置每个请求地址的前缀：

```typescript
@controller
class LoginController {
    @get("/")
    home(req: Request, res: Response) {
        const isLogin = req.session ? req.session.login : false;
        if (isLogin) {
            res.send('...');
        } else {
            res.send('...');
        }
    }
}
```

###  多种请求方法

除了基本的`get`方法，还有`post`装饰器，解决方法很简单，可以在定义元数据时，多一个对方法的定义：

```typescript
export function post(path: string) {
  return function (target: any, key: string) {
    Reflect.defineMetadata('path', path, target, key);
    Reflect.defineMetadata('method', 'post', target, key);
  };
}
```

而在`controller`装饰器中，只需要对方法类型做一下判断即可：

```typescript
enum Method {
  get = "get",
  post = "post",
}

export function controller(target: any) {
    // ...
    const method:Method = Reflect.getMetadata("method", target.prototype, key);
    if (path && method) {
        router[method](path, hander);
    }
}
```

注意上述代码中的`Method`类型，对请求方法做一个枚举，因为`getMetadata`获取的数据是`any`类型，而在`router[method]`表达式中需要字符串类型，这是为了更好的类型推断； 

如果在此基础上，还需要引入`delete`，`put`等方法的装饰器，那就还需要再复制粘贴代码进行改动，这未免显得太不够优雅，我们可以定义一个函数进行统一创建：

```typescript
const getRequestDecorator = (method: Method) => {
  return function (path: string) {
    return function (target: any, key: string) {
      Reflect.defineMetadata("path", path, target, key);
      Reflect.defineMetadata("method", method, target, key);
    };
  };
};

export const get = getRequestDecorator(Method.get);
```

## 装饰器添加中间件

完成上述的操作后，原先的爬虫程序就只剩下爬取数据和展示数据的接口没有迁移了，我们可以注意到，这两个接口其实与登录并无关系，那么可以新建`CrowllerController.ts`；除此之外，这两个接口与之前的接口不通之处在于，它们使用了自定义的中间件来检验是否已登录；这里我们可以使用`use`装饰器对中间件进行处理：

```typescript
export function use(middleware: RequestHandler) {
    return function (target: any, key: string) {
        Reflect.defineMetadata("middleware", middleware, target, key);
    };
}
```

同样的，在方法中定义了装饰器后，我们需要去类装饰器中进行处理：

```typescript
export function controller(target: any) {
    // ...
    const middleware = Reflect.getMetadata("middleware", target.prototype, key);
	// ...
    if (middleware) {
        router[method](path, middleware, hander);
    } else {
        router[method](path, hander);
    }
}
```

### 添加多个中间件

需要设置多个中间件时，只需要将中间件作为数组进行定义即可：

```typescript
export function use(middleware: RequestHandler) {
  return function (target: any, key: string) {
    const middlewares:RequestHandler[] = Reflect.getMetadata("middlewares",target, key) || [];
    middlewares.push(middleware);
    Reflect.defineMetadata("middlewares", middlewares, target, key);
  };
}
```

在`controller`装饰器中，只需要对数组进行展开即可：

```typescript
export function controller(target: any) {
    // ...
    const middlewares:RequestHandler[] = Reflect.getMetadata("middlewares", target.prototype, key);
    if (middlewares && middlewares.length) {
        router[method](path, ...middlewares, hander);
    } else {
        router[method](path, hander);
    }
}
```



## 代码结构优化 

经过上述的编码，我们可以发现很多问题，例如路由的创建其实是在`decorator.ts`文件中创建的，这显然与它的用途杂糅了，我们可以在根目录创建一个`router.ts`，并处理好引用包即可：

```typescript
import { Router } from "express";

const router = Router();

export default router;
```

其次则可以将`decorator.ts`内的内容根据不同作用进行划分，新建`decorator`文件夹及`controller.ts` 、`request.ts`、 `use.ts`三个文件分别对应三种装饰器，并作代码划分；

继而在`decorator`文件夹内，新建`index.ts`作为引用入口文件：

```typescript
import "reflect-metadata";

export * from "./controller";
export * from "./request";
export * from "./use";
```

这样处理之后，目录结构会清晰很多，且导入包时也更统一，如在`LoginController`中导入时，直接导入目录`decorator`即可，会自动导入下面的`index.ts`文件：

```typescript
import { controller, get, post } from "../decorator";
```

