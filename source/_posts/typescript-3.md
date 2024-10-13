---
title: TypeScript学习-03-语法进阶
date: 2021-11-26 16:52:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 枚举

枚举是组织收集有关联变量的一种方式，可以清晰地表达意图或创建一组有区别的用例，使用`enum`定义枚举类型：

```typescript
enum Day {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}
```

默认从 0 开始递增的数字集合，称之为**数字枚举**；

数字枚举在定义值时，可以使用计算值和常量，且该字段后面紧接着的字段必须设置初始值；

定义值是字符串字面量的枚举称为字符串枚举，字符串枚举值要求**每个字段的值都必须是字符串字面量，或者是该枚举值中另一个字符串枚举成员；**字符串枚举允许提供一个运行时有意义的并且可读的值，独立于枚举成员的名字。

对于枚举类型的值，可以分开进行声明，编译时会对枚举值进行**合并操作**；在枚举的延续块中，必须重新初始化第一个成员，否则会报错；

### 数字类型作为标志

```typescript
enum AnimalFlags {
  None        = 0,		// 0000
  HasClaws    = 1 << 0,	// 0001
  CanFly      = 1 << 1,	// 0010
  EatsFish    = 1 << 2,	// 0100
  Endangered  = 1 << 3	// 1000
}
```

使用 `|=` 来添加一个标志，组合使用 `&=` 和 `~` 来清理一个标志，`|` 来合并标志：

```typescript
var animal = { flags: AnimalFlags.None };					// 0000
animal.flags |= AnimalFlags.HasClaws;						// 0001
animal.flags &= ~AnimalFlags.HasClaws;						// 0000
animal.flags |= AnimalFlags.HasClaws | AnimalFlags.CanFly;	// 0011
```

### 枚举成员类型

字面量枚举成员是指不带有初始值的常量枚举成员，或者是值被初始化为

- 任何字符串字面量（例如： `"foo"`， `"bar"`， `"baz"`）
- 任何数字字面量（例如： `1`, `100`）
- 应用了一元 `-`符号的数字字面量（例如： `-1`, `-100`）

当所有枚举成员都拥有字面量枚举值时，枚举成员则成为了类型，而枚举类型本身变成了每个枚举成员的联合；

### 有静态方法的枚举

可以使用 `enum` + `namespace` 的声明的方式向枚举类型添加静态方法；

## 泛型

设计泛型的关键目的是在成员之间提供有意义的约束，这些成员可以是：

- 类的实例成员
- 类的方法
- 函数参数
- 函数返回值

### 泛型约束

 ```typescript
 interface Lengthwise {
   length: number;
 }
 
 function loggingIdentity<T extends Lengthwise>(arg: T): T {
   console.log(arg.length);
   return arg;
 }
 ```

泛型被定义了约束后，不再适用于任意类型，传入符合约束类型的值，必须包含特定的属性：

```typescript
loggingIdentity({length: 10, value: 3});
```

### 在泛型里使用类类型

在TypeScript使用泛型创建**工厂函数**时，需要引用构造函数的类类型。比如，

```typescript
function create<T>(c: {new(): T; }): T {
    return new c();
}
```

`create`函数需要传入一个对象或者说类，其中的`new()`表示类的构造函数，且返回的类型是`create`指定的泛型，`create`函数内部即实例化了`c`对象并返回，以此创建了一个工厂函数；

## 类型系统

TypeScript使用 [duck-typing]([鸭子类型 - 维基百科，自由的百科全书 (wikipedia.org)](https://zh.wikipedia.org/wiki/鸭子类型)) （也叫做结构类型系统，Structural type system）的方法来比较一个对象和其他对象，方法是检查两个对象是否具有相同的类型匹配名称。与之相反的是标明类型系统 （Nominative type system），表示类型若要相等，就必须具有相同的“名字”；

> 在这种风格中，一个对象有效的语义，不是由继承自特定的类或实现特定的接口，而是由"当前方法和属性的集合"决定。这个概念的名字来源于由[詹姆斯·惠特科姆·莱利](https://zh.wikipedia.org/w/index.php?title=詹姆斯·惠特科姆·莱利&action=edit&redlink=1)提出的[鸭子测试](https://zh.wikipedia.org/wiki/鸭子测试)，“鸭子测试”可以这样表述：
>
> “当看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为鸭子。”

### 索引类型

`keyof` 用于**索引类型查询操作符**，它会返回其后参数类型的键值组成的字面量类型(literal types)：

```typescript
interface foo {
  a: number;
  b: string;
}

type AB = keyof foo; // "a" | "b"
```

> 字面量类型包括字符串字面量、数字字面量、布尔值字面量。

### 映射类型



### 条件类型

TS 在 2.8 中引入了条件类型表达式，使用关键词 `extends`，形如：

```typescript
T extends U ? X : Y
```

简单来说，即 T 类型被U类型所限制住，T 必须为 U 的子集类型；



## 命名空间

用`namespace`关键字创建命名空间，命名空间内的可以定义类，函数和接口等，而想让它们再外部也能访问到需要使用`export`导出：

```typescript
namespace Utility {
  export function log(msg) {
    console.log(msg);
  }
  export function error(msg) {
    console.log(msg);
  }
}

// usage
Utility.log('Call me');
Utility.error('maybe');
```

命名空间可以分割在多个文件中，它们是可以合并的，不同文件之间存在依赖关系，需要加入了引用标签来告诉编译器文件之间的关联；

```ty
/// <reference path="Namespace.ts" />
```

当操作命名空间中的内容时，可以使用`import`为其取一个别名：

```typescript
namespace Shapes {
    export class Triangle { }
    export class Square { }
}
import triangle = Shapes.Triangle;
```

## 装饰器

目前 typescript 版本 4.1 装饰器仍是一项实验性特性，之后的版本中可能会发生改变；Javascript 规范里的装饰器目前处在 [建议征集的第二阶段](https://link.segmentfault.com/?enc=4m%2FXBcfeohg7YXijaq%2Ftfw%3D%3D.TsI206OuLG3jW69AunLAqgWyWC3Z3ucYNdHBCh%2F%2Br47GvbJPWIJpSbgs%2FxJDRAPC)，也就意味着不能在原生代码中直接使用，浏览器暂不支持。

> 装饰者模式（Decorator Pattern）也称为装饰器模式，在不改变对象自身的基础上，动态增加额外的职责。属于结构型模式的一种；
>
> 使用装饰者模式的优点：能够很好的抽象代码，把对象核心职责和要装饰的功能分开了，最适合用来包装可能会多处复用的逻辑

装饰器是一种特殊的表达式声明，可以被附加到类声明、方法、 访问符(getter/setter)、属性和参数上，对应着的可分为类装饰器（Class decorators）、属性装饰器（Property decorators）、方法装饰器（Method decorators）、参数装饰器（Parameter decorators）；

```typescript
declare type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;
declare type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
declare type MethodDecorator = <T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
declare type ParameterDecorator = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
```

装饰器使用时形如`@expression`，该表达式求值后必须为一个函数，它会在运行时被调用，被装饰的内容作为参数传入；

若要启用实验性的装饰器特性，必须启用 `experimentalDecorators` 编译器选项：

```json
{
  "compilerOptions": {
     "target": "ES5",
     "experimentalDecorators": true
   }
}
```

装饰器的执行顺序为：首先执行属性装饰器，然后执行方法装饰器，其次是方法参数装饰器，最后是类装饰器；

多个装饰器组合在一起，在运行时，要注意，调用顺序是 **从下至上** 依次调用，类似于栈，先进后出；

### 装饰器工厂

但需要给装饰器传入参数时，可借助装饰器工厂这种方法，其本质上是一个高阶函数，传参返回的函数才作为装饰器函数；

当装饰的是装饰器工厂函数时，他们会从上到下依次执行，而内部返回的真正的装饰器函数还是会从下到上执行；

### 类装饰器

顾名思义，作用在类声明上的装饰器，可以用来监视，修改或替换类定义。类装饰器表达式会在运行时当作函数被调用，**类的构造函数作为其唯一的参数**。

当我们声明一个类时，装饰器就会被调用，而不是等到类实例化的时候；当装饰一个类的时候，装饰器并不会对该类的子类生效；

如果装饰函数有返回值，该返回值会重新定义这个类，也就是说当装饰函数有返回值时，其实是生成了一个新类，该新类通过返回值来定义；

### 方法装饰器

方法装饰器用于覆写一个方法，改变它的执行流程，以及在它执行前后额外运行一些代码，作用在类的方法上，会被应用到方法的 *属性描述符*（描述对象）上，可以用来监视，修改或者替换方法定义，有静态方法和原型方法：

+ 作用在静态方法上，装饰器函数接收的是类构造函数；

+ 作用在原型方法上，装饰器函数接收的是**原型对象**；

另外传入下列2个参数：

1. 成员的名字。
2. 成员的*属性描述符*（描述对象）。

如果方法装饰器返回一个值，会作为方法的*属性描述符*，代码输出目标版本小于`ES5`返回值会被忽略；

### 属性装饰器

作用在类中定义的属性上，这些属性不是原型上的属性，而是通过类实例化得到的实例对象上的属性，接收两个参数：

+ 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象；
+ 该属性成员的名字；

没有属性描述对象，这与TypeScript是如何初始化属性装饰器的有关；目前没有办法在定义一个原型对象的成员时描述一个实例属性；属性装饰器极其有用，因为它**可以监听对象状态的变化**；

### 参数装饰器

参数装饰器应用于类构造函数或方法声明，以修饰类的构造函数中的参数，以及类中其他普通函数中的参数。该装饰器在类的方法被调用的时候执行，并传入下列3个参数：

1. 对于静态成员来说是类的构造函数，对于实例成员是类的原型对象；
2. 该参数所在的函数的函数名；
3. 参数在函数参数列表中的索引；

参数装饰器的返回值会被忽略，

### 元数据反射

反射，就是在运行时动态获取一个对象的一切信息如方法、属性等，特点在于动态**类型反推导**。在 TypeScript 中，反射的原理是通过设计阶段对对象注入元数据信息，在运行阶段读取注入的元数据，从而得到对象信息；

反射可以获取对象的类型，成员/静态属性的信息(类型)，方法的参数类型、返回类型；

TypeScript 结合自身静态类型语言的特点，为使用了装饰器的代码声明注入了 3 组元数据：

- `design:type`: 成员类型；
- `design:paramtypes`: 成员所有参数类型；
- `design:returntype`: 成员返回类型；

元数据反射也是实验性 API，需要启用这个实验性特性：

 ```json
 {
     "compilerOptions": {
         "target": "ES5",
         "emitDecoratorMetadata": true
     }
 }
 ```

还需要安装插件：`npm i reflect-metadata --save`：

```typescript
import 'reflect-metadata'

function log(target: Object, key: string, descriptor: any) {
  // 获取成员类型
  let type = Reflect.getMetadata('design:type', target, key)
  // 获取成员参数类型
  let paramtypes = Reflect.getMetadata('design:paramtypes', target, key)
  // 获取成员返回类型
  let returntype = Reflect.getMetadata('design:returntype', target, key)
  // 获取所有元数据 key (由 TypeScript 注入)
  let keys = Reflect.getMetadataKeys(target, key)

  console.log(keys) // [ 'design:returntype', 'design:paramtypes', 'design:type' ]
  // 成员类型
  console.log(type) // Function
  // 参数类型
  console.log(paramtypes) // [String]
  // 成员返回类型
  console.log(returntype) // String

  var originalMethod = descriptor.value; 

  descriptor.value =  function (...args: any[]) {
      // 将“foo”函数的参数列表转化为字符串
      var a = args.map(a => JSON.stringify(a)).join();
      // 调用 foo() 并获取它的返回值
      var result = originalMethod.apply(this, args);
      // 将返回的结果转成字符串
      var r = JSON.stringify(result);
      // 打印日志
      console.log(`Call: ${key}(${a}) => ${r}`);
      // 返回调用 foo 的结果
      return result;
  }
  // 返回已编辑的描述符
  return descriptor;
}

class C {
  @log
  foo(n: number) {
      return n * 2;
  }
}

const c = new C() 
c.foo(2)
```

我们通过这个例子，对上述内容做一个彻底的分析，以下是编译生成的 es5 的 JavaScript 代码：

```js
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function log(target, key, descriptor) {
    // 获取成员类型
    var type = Reflect.getMetadata('design:type', target, key);
    // 获取成员参数类型
    var paramtypes = Reflect.getMetadata('design:paramtypes', target, key);
    // 获取成员返回类型
    var returntype = Reflect.getMetadata('design:returntype', target, key);
    // 获取所有元数据 key (由 TypeScript 注入)
    var keys = Reflect.getMetadataKeys(target, key);
    console.log(keys); // [ 'design:returntype', 'design:paramtypes', 'design:type' ]
    // 成员类型
    console.log(type); // Function
    // 参数类型
    console.log(paramtypes); // [String]
    // 成员返回类型
    console.log(returntype); // String
    var originalMethod = descriptor.value;
    descriptor.value = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // 将“foo”函数的参数列表转化为字符串
        var a = args.map(function (a) { return JSON.stringify(a); }).join();
        // 调用 foo() 并获取它的返回值
        var result = originalMethod.apply(this, args);
        // 将返回的结果转成字符串
        var r = JSON.stringify(result);
        // 打印日志
        console.log("Call: " + key + "(" + a + ") => " + r);
        // 返回调用 foo 的结果
        return result;
    };
    // 返回已编辑的描述符
    return descriptor;
}
var C = /** @class */ (function () {
    function C() {
    }
    C.prototype.foo = function (n) {
        return n * 2;
    };
    __decorate([
        log,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Number]),
        __metadata("design:returntype", void 0)
    ], C.prototype, "foo", null);
    return C;
}());
var c = new C();
c.foo(2);
```

> Function：全局对象， `Function` 对象没有自己的属性和方法，它本身也是一个函数，会从原型链上继承；
>
> void 0：**`void` 运算符**对表达式求值，返回 `undefined`；

代码清晰明了，在类定义时，通过`__decorate`函数将四个装饰器添加到了类中，第一个是我们自己的`log`装饰器，另外三个是用于类型反射的元数据装饰器；

先来看看`__decorate`函数究竟是怎么回事：

```js
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc){}
```

这行代码使用了或操作符（`||`），以确保若函数`__decorate`已被创建，其将不会被重写；

```js
{
    var c = arguments.length, 
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") 
        r = Reflect.decorate(decorators, target, key, desc);
    else 
        for (var i = decorators.length - 1; i >= 0; i--) 
            if (d = decorators[i]) 
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
```

首先，把参数数量赋值给了`c`，根据参数数量 `c`的值，决定什么值赋给`r`，在例子中，函数`__decorate`传入了 4 个参数，先判断 `c < 3`，接着判断`desc === null`，即把`Object.getOwnPropertyDescriptor(target, key)`的值同时赋给了`r`和`desc` ，`d`变量暂时没用到，做一个声明；

接下来，先判断了 `Reflect`相关的内容是否存在，我们先假设没有引入相关内容，看一下代码：

+ 对`decorators`数组内的装饰器做一个遍历；
+ 判断`d = decorators[i]`的值，做下一步操作，而由`__metadata`函数，做没有引入`Reflect`相关的内容，会直接不执行`if`内的`return`，无返回值，而返回的实际上是`undefined`，所以会忽略执行；
+ 只有`log`装饰器赋值给`d`，之后同样是做一些判断，最后执行`r = d(target, key, r)`；
+ 最后做判断，并执行`Object.defineProperty(target, key, r)`，最后返回`r`；

如果我们对`Object.getOwnPropertyDescriptor`和`Object.defineProperty`方法不陌生，那么这个过程具体完成了什么事情，应该是有个大体了解的，即通过更改描述符的形式对装饰器的内容进行了注入；

当引入了 `Reflect`相关内容时，会执行`r = Reflect.decorate(decorators, target, key, desc);`首先应该先搞清楚另外三个装饰器是如何产生的，对应代码`Reflect.metadata(k, v)`，我们一起来看看源代码：

```js
function metadata(metadataKey, metadataValue) {
    function decorator(target, propertyKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
            throw new TypeError();
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    return decorator;
}
```

也就是说，三个元数据装饰器本质上也是函数即`decorator(target, propertyKey)`，这是必然的，因为装饰器本身就是函数；接着回到`__decorate`函数内：

```js
function decorate(decorators, target, propertyKey, attributes) {
    if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators))
            throw new TypeError();
        if (!IsObject(target))
            throw new TypeError();
        if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
            throw new TypeError();
        if (IsNull(attributes))
            attributes = undefined;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
    }
    else {
        if (!IsArray(decorators))
            throw new TypeError();
        if (!IsConstructor(target))
            throw new TypeError();
        return DecorateConstructor(decorators, target);
    }
}
```

首先，做了一些基本的类型判断，之后对传入的`key`做了一个 `ToPropertyKey`合法化处理，转换成字符串；之后进入`DecorateProperty`函数：

```js
function DecorateProperty(decorators, target, propertyKey, descriptor) {
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        var decorated = decorator(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
            if (!IsObject(decorated))
                throw new TypeError();
            descriptor = decorated;
        }
    }
    return descriptor;
}
```

在其中，对所有的装饰器进行了遍历执行，特别的，对于元数据的装饰器`decorator(target, propertyKey)`是只有两个形参的，回顾上面的源代码，进行参数校验后调用了函数`OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey)`:

```js
function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
    var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
    metadataMap.set(MetadataKey, MetadataValue);
}
```

上述函数内，调用`GetOrCreateMetadataMap()`获取了`metadataMap`继而`get()`设置了元数据，我们继续深挖：

```js
function GetOrCreateMetadataMap(O, P, Create) {
    var targetMetadata = Metadata.get(O);
    if (IsUndefined(targetMetadata)) {
        if (!Create)
            return undefined;
        targetMetadata = new _Map();
        Metadata.set(O, targetMetadata);
    }
    var metadataMap = targetMetadata.get(P);
    if (IsUndefined(metadataMap)) {
        if (!Create)
            return undefined;
        metadataMap = new _Map();
        targetMetadata.set(P, metadataMap);
    }
    return metadataMap;
}
```

在上面的函数内，将装饰器的目标对象作为键，从`Metadata`获取到了其对应的元数据`targetMetadata`，并做了校验，若为 undefined 则重新创建；类似的，将参数`P`（propertyKey：'foo'）作为键获取到了对应的元数据`metadataMap`；可以查看源代码，查看类型的定义，这里做了一些兼容性适配；

```js
var functionPrototype = Object.getPrototypeOf(Function);
var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
var Metadata = new _WeakMap();
```

> 关于这些类型定义和一些概念，可以查看MDN文档：
>
> + [带键的集合 - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Keyed_collections#weakmap对象)；
> + [Polyfill - 术语表 | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Glossary/Polyfill)；

经过上述的分析，装饰器的实现的分析，应该大致有个了解了，当然我们只是那方法的装饰器做了例子，其他的装饰器也是大同小异；
