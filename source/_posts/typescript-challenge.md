---
title: TypeScript学习-类型体操训练
date: 2022-4-21 15:12:52
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 基础知识

**类型**可以简单看成一个值的集合，在做类型运算的时，可分为两类：

+ 包含一个元素的类型（值）：`0`，`"foo"`；
+ 包含多个（无限个）元素的类型：`number`， `string`；

还有两个特殊的类型：`any`  全集，`never`  空集；

---

交叉类型，可把现有的类型合并为新的类型，如`type A = B & C;`，A 可同时获得 B 和 C 的所有属性；当存在相同属性而类型不一致时，会得到`never`类型；

当同种属性其一被`readonly`修饰时，由于是交叉会取合并类型，即`readonly`会被“覆盖”；[相关说明](https://github.com/microsoft/TypeScript/issues/45122)

按照我的理解，`readonly`是在编译类型检查时把`setter`屏蔽了，类似于`const`，简单来看，可看作被修饰的属性没有`setter`。那么联合类型则是取相同（`getter`）的，交叉类型则是全都取（`getter & setter`）。

```typescript
type P1 = Pick<{ readonly p: any } | { p: any }, "p">	// { readonly p: any; }
type P2 = Pick<{ readonly p: any } & { p: any }, "p">	// { p: any; }
```

---

`A extends B ? C : D` 的意义是判断 `A` 集合是否为 `B` 集合的子集，如果是那么返回 `C` 否则返回 `D`；以此可以引申出对值和类型的运算：

+ 判断值是否相等：`===`；
+ 判断值是否属于某个类型：`typeof`；

---

`type A<B, C> = D` ，自定义类型，可以当作是一个**函数**，等号左边泛型可进行输入作为*函数参数*，等号右边是输出，也就是会返回的类型；

---

`type ParamType<T> = T extends (...args: infer P) => any ? P : T;`，意为如果 `T` 能赋值给 `(...args: infer P) => any`，则结果是 `(...args: infer P) => any` 类型中的参数 `P`，否则返回为 `T`，`infer P` 表示待推断的函数参数；`infer`可以类比纯函数式语言中的声明局部变量；

貌似`infer`有点像 ES6 中的解构，实际上，这种称为**模式匹配**：也就是拿到匹配后确切的值后再拆解；



## 工具泛型

### Partial

```typescript
/**
 * Make all properties in T optional
 */
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

将传入的属性变为可选类型，代码的核心在于 `keyof` 和 `in`，`keyof` 用于取得一个接口所有 `key` 值（联合类型），而`in`是用于迭代联合类型中的所有元素，用于在[映射类型(Mapped Types)](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)中，上述代码`[P in keyof T]?: T[P]	`即为一个映射类型；

而且`in`关键字还能用于在[类型守卫](https://github.com/microsoft/TypeScript/pull/15256)上，例如：

```typescript
interface A {
  x: number;
}
interface B {
  y: string;
}
let q: A | B = ...;
if ('x' in q) {
  // q: A
} else {
  // q: B
}
```

回到正题，在映射类型`Partial`通过传入泛型\<T\>，获取的 T 的 key 的联合类型，然后迭代成一个新的类型，新的类型的 key 还是对应着T类型中的 value，不过都变为了可选属性。

### Required

```typescript
/**
 * Make all properties in T required
 */
type Required<T> = {
    [P in keyof T]-?: T[P];
};
```

将 T 中的类型都变成必选类型，其中`-`符号表示移除某个[映射修饰符(Mapping Modifiers)](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#mapping-modifiers)，如`?`可选，`readonly`只读，如上的`Partial`则为未指定情况，假定为`+`；

### Readonly

```typescript
/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
};
```

将所有属性设置为只读，若设置为`-readonly`，则为移除属性的 Readonly 修饰符； 

### Pick

```typescript
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
```

从 T 中挑选出一组 key 存在于联合类型 K 中的属性，简而言之，就是从 T 中选择几个指定的属性；

这里指定传入类型时使用了`extends`作为判断的标准，必须满足`keyof T`，即 K 必须是 T 的 key 才行；

内部又是一个映射类型，将欲选出的属性（key 和 value）作为新类型返回；

### Record

```typescript
/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
```

构造一个属性类型为 K，值类型为 T 的类型；注意这有个 `keyof any` 很耐人寻味，首先我们能看到 K 在满足`extends keyof any`时的类型为`string | number | symbol`，这正是 ts 中允许被作为对象的索引的类型，这样我们就能明白了：对 `any` 取 `keyof `操作，可以得到所有的索引的类型，毕竟是 **any** ，这样也就限制住了 K 的类型。

另一个需要注意的地方，若多个 `Record` 泛型进行交叉时，`Record` 若有相同的 key，不同的 value，则会 value 会被推导为 `never` ：

```typescript
type testRecord = Record<string, string> & Record<string,number>
type result = testRecord1 extends Record<string,never> ? "yes" : "no"	// yes
```

也可以写一个泛型工具对交叉类型进行合并，可以查看的更直观：

```typescript
export type MergeInsertions<T> =
  T extends object
    ? { [K in keyof T]: MergeInsertions<T[K]> }
    : T
```

### Exclude

```typescript
/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U> = T extends U ? never : T;
```

与 Pick 相反，Exclude 用于在 T 中排除可分配给 U 的子类型；这里有一个很重要的概念，**分发条件类型**（Distributive Conditional Types），上述的 Exclude 类型若 T 被指定为**联合类型**，则构成了分配条件类型，官网的一个例子如下：

```typescript
type ToArray<Type> = Type extends any ? Type[] : never;
type StrArrOrNumArr = ToArray<string | number>;	 // string[] | number[]
```

总结来说就是`extends`会将联合类型拆开，分别传入类型定义，如此的设定可以让我们过滤联合类型的特定成员。通常，联合类型是默认分配的，但是能通过`[]`将`extends`两边的泛型参数包裹起来，如：

```typescript
type P<T> = [T] extends [any] ? string : number;
```

这里有一个特殊情况，就是 `never`，如下：

```typescript
type P<T> = T extends any ? string : number;

type Test1 = never extends any ? string : number; // string
type Test2 = P<never> // never
```

`Test1`的结果是因为`string`是任何类型的子类型，返回`string`，；

`Test2`的结果是`never`，在此情况下，`never` 被认为是空的联合类型，因为没有联合项可以分配，即`P<T>`的表达式其实根本就没有执行，也就类似于没有返回值的函数，是 never 类型；

### ThisType

ThisType 的作用是可以在对象字面量中指定 this 的类型。ThisType 不返回转换后的类型，而是通过 ThisType 的泛型参数指定 this 的类型；

> 注意：如果你想使用这个工具类型，那么需要在 **tsconfig.json** 中开启 `noImplicitThis` 配置；

```typescript
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>; // methods 中 this 的类型是 D & M
};
function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  let data: object = desc.data || {};
  let methods: object = desc.methods || {};
  return { ...data, ...methods } as D & M;
}
const obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // this => D & M
      this.y += dy; // this => D & M
    },
  },
});
obj.x = 10;
obj.y = 20;
obj.moveBy(5, 5);
```

`methods` 属性的 `this` 类型为 `D & M`，在上下文中指代 `{ x: number, y: number } & { moveBy(dx: number, dy: number): void }`。这是官方文档中的例子，看起来其实并不直观；

简单来说，对某一个对象进行`& ThisType<SomeType>`那么就能指定该对象中 this 的类型为`SomeType`；

ThisType 工具类型实际上只是提供了一个空的泛型接口，仅可以在对象字面量上下文中被 TypeScript 识别，也就是说该类型的作用相当于任意空接口。

```typescript
interface ThisType<T> {}
```

## 类型体操

### [hard-tuple-to-enum-object](https://github.com/type-challenges/type-challenges/blob/main/questions/00472-hard-tuple-to-enum-object/README.md)

传入一个元组，将元组转换为枚举对象，如果第二个参数为 true，那么值应该是数字字面量

```typescript
type Format<T extends readonly string[], P extends any[] = []>
	= T extends readonly [infer R, ...infer S]
	? S extends readonly any[]
		? [[R, P["length"]], ...Format<S, [...P, any]>]
  		: []
	: []

type Enum<T extends readonly string[], F extends Boolean = false> = {
  readonly [K in Format<T>[number] as Capitalize<K[0]>]: F extends true ? K[1] : K[0]
}

Enum<["macOS", "Windows", "Linux"]>
// -> { readonly MacOS: "macOS", readonly Windows: "Windows", readonly Linux: "Linux" }
Enum<["macOS", "Windows", "Linux"], true>
// -> { readonly MacOS: 0, readonly Windows: 1, readonly Linux: 2 }
```

首先来看`Format`泛型，传入一个字符串数组和 any 数组，内部是一个递归，作用是提取到传入的元组的值及其序列。

首先会使用`infer`推导提取第一个元素`R`，以及剩余元素`S`，然后根据`S`是否为空判断是否终止递归；终止返回空数组，否则返回一个数组，内部也是数组结构，内部第一个数组`[R, P["length"]]`包括第一个元素和传入的数组`P`的长度，因为默认是传入空数组的，所以第一个元素的该值是 0；之后是递归的操作，会将剩余元素`S`以及`[...P, any]`传入`Format`中，`[...P, any]`这个操作可谓一绝，直接将数组元素加一，然后之后的元素进行`P["length"]`推导时即完成了枚举类型的递增操作。

有了上述的基础操作，那么`Enum`操作就简单了。按照题目要求，传入数组和布尔值。`Format<T>[number]`拿到`Format`匹配结果的数组元素的联合类型，`as`操作符对`in`遍历联合类型的结果做一个转换，即取到`[0]`的值并利用内置的`Capitalize`工具泛型将字符串的首字母大写。最后则是判断`F`，返回`K[1]`或`K[0]`。

当然也没必要这么复杂地将元组格式化成新的数据结构，简单地拿到每一个值的就很够的了：

```typescript
type FindIndex<T extends readonly any[], K, A extends any[] = []> 
	= T extends readonly [infer H, ...infer R] 
	? [H] extends [K] 
		? A["length"] 
		: FindIndex<R, K, [...A, any]> 
	: -1;

type Enum<T extends readonly string[], N extends boolean = false> = {
  readonly [k in T[number] as `${Capitalize<k>}`]: N extends false ? k : FindIndex<T, k>;
}
```

