---
title: TypeScript学习-01-基础语法
date: 2021-11-21 21:12:23
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 前言

TypeScript 是一种由微软开发的自由和开源的编程语言。它是 JavaScript 的一个超集，而且本质上向这个语言添加了可选的**静态类型**和基于**类的面向对象**编程。

JavaScript是弱类型，而 TypeScript 提供了一套静态检测机制，所以具有以下优势：

+ 开发过程中，发现潜在的问题；
+ 更友好的编辑器代码提示；
+ 代码语义更清晰易懂；

除此之外，相对于JS，TS 还有一下特点：

+ 支持最新的 ECMAScript 新特性；
+ 支持后端语言中的特性 (枚举、泛型、类型转换、命名空间、声明文件、类、接口等)；

 ### 安装与编译

```bash
 npm install -g typescript
 npm install -g ts-node
```

全局安装上述的两个包后，就可以使用 Code Runner 插件直接运行 `.ts`文件了；

## TypeScript 基础类型

基础类型有：boolean，number，string，void，underfined，symbol，null； 

```typescript
let count: number = 123;
```

将定义与赋值，分成两行代码，则无法推测类型：

```typescript
let count;		// any, 应该 let count:number; 
conut = 123;
```

当变量类型确实需要改变时，可以使用`|`分隔：

```typescript
let temp: number | string = 123;
temp = '456';
```

默认情况下 `null` 和 `undefined` 是所有类型的子类型， 即可以把 `null` 和 `undefined` 赋值给其他类型。

## TypeScript 接口

 在 TypeScript 中，接口（Interfaces）来同于定义对象类型的关键字，这可能与面向对象语言中的接口有些差别，TypeScript 中的接口非常灵活，除了可用于对「**类的一部分行为进行抽象**」以外，也常用于对「**对象的形状**」进行描述；

```typescript
interface Person {
    name: string;
    age: number;
};
let mahoo: Person = {
    name: 'mahoo',
    age: 21
};
```

接口一般首字母大写，定义的变量必须与接口保持一致，可在属性名后添加修饰符`?`设置该属性为可选，也能在属性名前添加`readonly`修饰符表示为只读属性，还可以通过**索引签名**的形式，设置其他任意属性：

```typescript
interface Person {
    readonly name: string;
    age?: number;
    [propName: string]: string;
};
```

能够“通过索引得到”的类型，比如`a[10]`或`user["name"]`，可索引类型具有一个 *索引签名*，它描述了对象索引的类型，还有相应的索引返回值类型；

TypeScript支持两种索引签名：字符串和数字。 可以同时使用两种类型的索引，但是数字索引的返回值必须是字符串索引返回值类型的子类型；

这是因为当使用 `number`来索引时，JavaScript会将它转换成`string`然后再去索引对象；

### 接口与类型别名的区别

接口和类型别名都可以用来描述对象的形状或函数签名，与接口类型不一样，类型别名可以用于一些其他类型，比如原始类型、联合类型和元组；

接口和类型别名都能够被扩展，且接口可以扩展类型别名，而反过来不行；

接口可以定义多次，会被自动合并为单个接口；

类可以相同的方式实现接口或类型别名，但类不能实现使用类型别名定义的联合类型；

## TypeScript 数组

数组的定义有两种方式：

```typescript
let arr1: string[] = ["1","2"];
let arr2: Array<string> = ["1","2"]；
```

数组的类型决定了数组内只能存放该类型的数据，也同样可以使用多个类型，称为联合类型：

```typescript
const arr: (number | string)[] = [1, '2', 3];
const objArr: {name: string, age: number}[] = [{name: "mahoo", age: 21}];
```

上述的对象数组类型中的`{name: string, age: number}[]`缺少可读性，可使用类型别名，关键字`type`：

```typescript
type User = {name: string, age: number};
const objArr: User[] = [{name: "mahoo", age: 21}];
```

> 这里有要注意的一点细节，当存在 class 类，具有 User 类型**相同数据结构**时，数组内部类型推断同样认可；

数组同样是能够“通过索引得到”的类型，这类可索引类型具有一个**索引签名**，

## TypeScript 元组

TypeScript 中元组的概念是一个长度固定，类型确定的数组：

```typescript
const userInfo:[string, string, number] = ['mahoo', 'male', 21]
```

> 元组的应用场景，一般在直接读取数据库、读取`.csv`文件使用该数据类型；

## TypeScript 函数

```typescript
const func = (str: string):number => {return str.length}
const func: (str: string) => number = (str) => {return str.length}
```

一般情况，函数都返回值类型都是可以自动推断的，一些情况如：

```typescript
const rawData = '{"name": "mahoo"}'
const newData = JSON.parse(rawData)		// const newData: any
```

可以自定义类型，进行标注：

```typescript
interface Person{ name: 'string' }
const newData: Person = JSON.parse(rawData)
```

### 参数类型和返回类型

```typescript
function add(x:number, y:number):string{
    return x + y + ''
}
```

### 可选参数及默认参数

```typescript
```

## TypeScript 类

关于类的介绍，无需多言，这里只关注一些独特的细节点：

+ 在 TypeScript 里，成员都默认为 `public`；
+  `readonly`关键字将属性设置为只读的，且只读属性必须在声明时或构造函数里被初始化；
+ 构造函数参数中定义属性，称为*参数属性*，可方便地在一个地方定义并初始化一个成员；
+ 只带有 `get`不带有 `set`的属性自动被推断为 `readonly`；
+ `abstract`关键字用于定义抽象类和在抽象类内部定义抽象方法，不同于接口，抽象类可以包含实现；





 
