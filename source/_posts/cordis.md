---
title: 写框架的框架—— Cordis 源码解析 （个人向）
date: 2024-10-17 21:00:03
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/phone.png
tags: 
- Ubuntu
- OrangePi
categories:
- 技术教程
---

## 前言

1. 拉取代码

    ```bash
    $ git clone git@github.com:cordiverse/cordis.git
    ```

2. 拉取依赖

   ```bash
   # 仓库默认使用 yarn 作为包管理器，不折腾
   $ yarn
   ```

3. 预编译工作区子包

   ```	bash
   # 对应命令为 yarn yakumo build
   $ yarn build
   ```

项目结构：

+ `cordis`：Meta-Framework for Modern JavaScript Applications
+ `@cordisjs/core`：↑
+ `create-cordis`：Setup a Cordis application
+ `@cordisjs/plugin-hmr`：Hot Module Replacement Plugin for Cordis、
+ `@cordisjs/loader`：Loader for cordis
+ `@cordisjs/logger`：Logger service for cordis
+ `@cordisjs/schema`：Schema service for cordis
+ `@cordisjs/timer`：Timer service for cordis

主要依赖：

+ `c8`：output coverage reports using Node.js' built in coverage.
+ `esbuild`：An extremely fast bundler for the web.
+ `esbuild-register`：Transpile JSX, TypeScript and esnext features on the fly with esbuild.
+ `mocha`：simple, flexible, fun javascript test framework for node.js & the browser.
+ `shx`：Portable Shell Commands for Node.
+ `tsx`：TypeScript Execute | The easiest way to run TypeScript in Node.js.
+ `yakumo`：Manage complex workspaces with ease.
+ `yml-register`：Hooks into Node's require function to load `.yaml` and `.yml` files.

---

学习源码时，刚拿到一个全新的框架项目，不像常规的业务代码项目，往往抽象程序时是很高的，我的经验是，首先是略读一遍项目文档：[介绍 | Cordis](https://cordis.moe/zh-CN/guide/)，之后针对代码细节回顾文档内容。

当前 Cordis 文档尚未完善，不过已有的内容已经够我理解一段时间了。

扫一眼项目结构和依赖后，可以聚焦到项目的单元测试代码，能最快的了解到整个项目，各个模块单元的情况或者说作用责任。

注意到，在 `package.json` 确实存在多条用于测试的命令，其中：`yarn yakumo mocha --import tsx`，执行后发现，只打印了：

```bash
⚡Mahoo12138 ❯❯ yarn test
unknown command: mocha
```

好像有什么不对劲的地方，保持好奇心，继续试验了其他几条：

+ `shx rm -rf coverage && c8 -r text yarn test`
+ `...`

执行后都打印了 `unknown command: mocha`，但是也如期输出了测试覆盖率，代码逻辑是正常运行的。

接着我们直接对每个用例进行测试：

```bash
$ npx mocha ./**/tests/*.spec.ts --require esbuild-register
```

也都正常输出，那么项目的基本配置应该没问题，可以针对每个测试项进行分析和学习了。

## section: Association

### case: service injection

```typescript
// packages\core\tests\associate.spec.ts

const root = new Context()

class Foo extends Service {
    qux = 1
    constructor(ctx: Context) {
        super(ctx, 'foo', true)
    }
}

class FooBar extends Service {
    constructor(ctx: Context) {
        super(ctx, 'foo.bar', true)
    }
}

root.plugin(Foo)
const fork = root.plugin(FooBar)
expect(root.foo).to.be.instanceof(Foo)
expect(root.foo.bar).to.be.instanceof(FooBar)
expect(root.foo.qux).to.equal(1)
fork.dispose()
expect(root.foo.bar).to.be.undefined
```

#### Context

首先创建了一个 Context 对象：

```typescript
export class Context {
    constructor(config?: any) {
        config = resolveConfig(this.constructor, config)
        this[symbols.store] = Object.create(null)
        this[symbols.isolate] = Object.create(null)
        this[symbols.internal] = Object.create(null)
        this[symbols.intercept] = Object.create(null)
        const self: Context = new Proxy(this, ReflectService.handler)
        self.root = self
        self.reflect = new ReflectService(self)
        self.registry = new Registry(self, config)
        self.lifecycle = new Lifecycle(self)

        const attach = (internal: Context[typeof symbols.internal]) => {
            if (!internal) return
            attach(Object.getPrototypeOf(internal))
            for (const key of Object.getOwnPropertyNames(internal)) {
                const constructor = internal[key]['prototype']?.constructor
                if (!constructor) continue
                self[internal[key]['key']] = new constructor(self, config)
                defineProperty(self[internal[key]['key']], 'ctx', self)
            }
        }
        attach(this[symbols.internal])
        return self
    }
}

export function resolveConfig(plugin: any, config: any) {
  const schema = plugin['Config'] || plugin['schema']
  if (schema && plugin['schema'] !== false) config = schema(config)
  return config ?? {}
}

export function defineProperty<T, K extends keyof any>(object: T, key: K, value: any) {
  return Object.defineProperty(object, key, { writable: true, value, enumerable: false })
}
```

- 接收一个可选的 `config` 配置参数，并调用了`resolveConfig`，且这里是把 Context 当作一个插件传入，解析其`Config`和`schema`，生成一个 `config`；
- 然后创建一些内部存储对象，如 `store`、`isolate`、`internal` 和 `intercept`，使用`Object.create(null)`，确保了对象的纯洁性，是没有原型链的。
- 接着，它创建一个 `Proxy` 对象，且传入 `this`，也就是拦截属性访问，交由 `ReflectService.handler`处理。
- 执行它初始化 `ReflectService`、`Registry` 和 `Lifecycle`，并将它们挂载到 `context` 实例上，这里其实就已经在执行 `ReflectService.handler` 中的 `set` 逻辑了 。
- 其中 `self.root = self` 这一行很重要，对于使用 `new` 创建出来的 `Context` 会有该属性标记，即 root Context；
- 最后，递归调用 `attach`函数，附加内部服务来完成上下文对象的初始化。

可以看看 `ReflectService.handler` 内的逻辑：

```typescript
class ReflectService {
    static handler: ProxyHandler<Context> = {
        set: (target, prop, value, ctx: Context) => {
            if (typeof prop !== 'string') return Reflect.set(target, prop, value, ctx)

            const [name, internal] = ReflectService.resolveInject(target, prop)
            if (!internal) {
                // TODO warning
                return Reflect.set(target, name, value, ctx)
            }
            if (internal.type === 'accessor') {
                if (!internal.set) return false
                return internal.set.call(ctx, value, ctx[symbols.receiver])
            } else {
                ctx.reflect.set(name, value)
                return true
            }
        },
    }
    static resolveInject(ctx: Context, name: string) {
        let internal = ctx[symbols.internal][name]
        while (internal?.type === 'alias') {
            name = internal.name
            internal = ctx[symbols.internal][name]
        }
        return [name, internal] as const
    },
}
```

`ReflectService.resolveInject` 用于获取`ctx[symbols.internal]`中传入的`name` 属性，针对`internal?.type === 'alias'` 做了递进获取；

`ReflectService.handler.set` 根据`props`和`internal`处理了属性赋值的多种情况，根据已有的代码信息还不好理解其作用。

#### ReflectService

```typescript
class ReflectService {
    constructor(public ctx: Context) {
        defineProperty(this, symbols.tracker, {
            associate: 'reflect',
            property: 'ctx',
        })

        this._mixin(
            'reflect', ['get', 'set', 'provide', 'accessor', 'mixin', 'alias'])
        this._mixin('scope', ['config', 'runtime', 'effect', 'collect', 'accept', 'decline'])
        this._mixin('registry', ['using', 'inject', 'plugin'])
        this._mixin(
            'lifecycle', ['on', 'once', 'parallel', 'emit', 'serial', 'bail', 'start', 'stop'])
    }
    _mixin(source: any, mixins: string[] | Dict<string>) {
        const entries = Array.isArray(mixins) ? mixins.map(key => [key, key]) : Object.entries(mixins)
        const getTarget = typeof source === 'string' ? (ctx: Context) => ctx[source] : () => source
        const disposables = entries.map(([key, value]) => {
            return this._accessor(value, {
                get(receiver) {
                    const service = getTarget(this)
                    if (isNullable(service)) return service
                    const mixin = receiver ? withProps(receiver, service) : service
                    const value = Reflect.get(service, key, mixin)
                    if (typeof value !== 'function') return value
                    return value.bind(mixin ?? service)
                },
                set(value, receiver) {
                    const service = getTarget(this)
                    const mixin = receiver ? withProps(receiver, service) : service
                    return Reflect.set(service, key, value, mixin)
                },
            })
        })
        return () => disposables.forEach(dispose => dispose())
    }
    _accessor(name: string, options: Omit<Context.Internal.Accessor, 'type'>) {
        const internal = this.ctx.root[symbols.internal]
        if (name in internal) return () => {}
        internal[name] = { type: 'accessor', ...options }
        return () => delete internal[name]
    }
}

export function withProps(target: any, props?: {}) {
  if (!props) return target
  return new Proxy(target, {
    get: (target, prop, receiver) => {
      if (prop in props && prop !== 'constructor') return Reflect.get(props, prop, receiver)
      return Reflect.get(target, prop, receiver)
    },
    set: (target, prop, value, receiver) => {
      if (prop in props && prop !== 'constructor') return Reflect.set(props, prop, value, receiver)
      return Reflect.set(target, prop, value, receiver)
    },
  })
}
```

构造函数中，通过调用 `this._mixin` 方法，对 reflect，scope，registry，lifecycle 这几个对象中的多个方法调用了 `this._accessor` 方法：

+ 获取了`this.ctx.root[symbols.internal]`；
+ 将`internal[name]`设置为 `type=accessor` 的`get/set`的对象；

// TODO get/set

其中这里的 `get/set` 也就是 `ReflectService.handler`的 `get/set` 进行 `internal.set/get.call`调用时的函数。

#### Registry

`Context` 构造时，也初始化了一个 `Registry` 对象：

```typescript
class Registry<C extends Context = Context> {
    private _counter = 0
    private _internal = new Map<Function, MainScope<C>>()
    protected context: Context

    constructor(public ctx: C, config: any) {
        defineProperty(this, symbols.tracker, {
            associate: 'registry',
            property: 'ctx',
        })

        this.context = ctx
        const runtime = new MainScope(ctx, null!, config)
        ctx.scope = runtime
        runtime.ctx = ctx
        runtime.status = ScopeStatus.ACTIVE
        this.set(null!, runtime)
    }
    set(plugin: Plugin, state: MainScope<C>) {
        const key = this.resolve(plugin)
        this._internal.set(key!, state)
    }
    resolve(plugin: Plugin, assert = false): Function | undefined {
        // Allow `null` as a special case.
        if (plugin === null) return plugin
        // ...
    }
}
```

创建了一个 `MainScope` 对象赋值到 `ctx.scope`，初始化 `MainScope` 的状态，然后 `null`  这个特殊键及 `MainScope` 存入 `_internal` 中。

#### MainScope

`Registry` 构造时，`plugin` 传入的是 `null`，

```typescript
export class MainScope<C extends Context = Context> extends EffectScope<C> {
    name?: string

    constructor(ctx: C, public plugin: Plugin, config: any, error?: any) {
        super(ctx, config)
        if (!plugin) {
            this.name = 'root'
            this.isActive = true
        } else {
            this.setup()
            this.init(error)
        }
    }
}
```

`MainScope` 继承自 `EffectScope`：

```typescript
export abstract class EffectScope<C extends Context = Context> {
    public uid: number | null
    public ctx: C
    public isActive = false
    protected proxy: any
    
    constructor(public parent: C, public config: C['config']) {
        this.uid = parent.registry ? parent.registry.counter : 0
        this.ctx = this.context = parent.extend({ scope: this })
        this.proxy = new Proxy({}, {
            get: (target, key) => Reflect.get(this.config, key),
        })
    }
}
```

`parent.extend({ scope: this })`调用后，执行的代码量非常多，整体看下来，是根据 `ctx[symbols.shadow]`和`[symbols.tracker]`返回 `context` 或基于其的一个 `Proxy` 对象，以及还有 `{ scope: this }` 的 `MainScope` ，需要理解 `Traceable` 这个概念才能搞懂这里代码的作用。

```typescript
export class Context {
    extend(meta = {}): this {
        const source = Reflect.getOwnPropertyDescriptor(this, symbols.shadow)?.value
        const self = Object.assign(Object.create(getTraceable(this, this)), meta)
        if (!source) return self
        return Object.assign(Object.create(self), { [symbols.shadow]: source })
    }
}

export function getTraceable<T>(ctx: Context, value: T, noTrap?: boolean): T {
  if (!isObject(value)) return value
  if (Object.hasOwn(value, symbols.shadow)) {
    return Object.getPrototypeOf(value)
  }
  const tracker = value[symbols.tracker]
  if (!tracker) return value
  return createTraceable(ctx, value, tracker, noTrap)
}
```

实际调试中发现，对于 root 级 Context ，`getTraceable` 倒数第二行返回了， `createTraceable` 并未调用到，也不考虑其逻辑。

#### Lifecycle

```typescript
class Lifecycle {
  constructor(private ctx: Context) {
    defineProperty(this, symbols.tracker, {
      associate: 'lifecycle',
      property: 'ctx',
    })

    ctx.scope.leak(this.on('internal/listener', function () {}))

    for (const level of ['info', 'error', 'warning']) {
      ctx.scope.leak(this.on(`internal/${level}`, (format, ...param) => {}))
    }

    // non-reusable plugin forks are not responsive to isolated service changes
    ctx.scope.leak(
      this.on('internal/before-service', function (this: Context, name) {}, {
        global: true,
      }),
    )
    // ...
  }
}
```

`Lifecycle`  构造函数中调用了`this.on` 注册了多个事件监听，且也都将解除绑定的 `dispose` 函数传入了`ctx.scope.leak` 方法；

```typescript
export abstract class EffectScope<C extends Context = Context> {
    leak<T>(disposable: T) {
        return defineProperty(disposable, Context.static, this)
    }
    collect(label: string, callback: () => any) {
        const dispose = defineProperty(() => {
            remove(this.disposables, dispose)
            return callback()
        }, 'name', label)
        this.disposables.push(dispose)
        return dispose
    }
}
```

`leak` 方法的逻辑很简单，就是在销毁函数 `dispose(able)` 上挂载 `MainScope` 。

```typescript
class Lifecycle {
    on(name: string, listener: (...args: any) => any, options?: boolean | EventOptions) {
        if (typeof options !== 'object') {
            options = { prepend: options }
        }

        // handle special events
        this.ctx.scope.assertActive()
        listener = this.ctx.reflect.bind(listener)
        const result = this.bail(this.ctx, 'internal/listener', name, listener, options)
        if (result) return result

        const hooks = this._hooks[name] ||= []
        const label = typeof name === 'string' ? `event <${name}>` : 'event (Symbol)'
        return this.register(label, hooks, listener, options)
    }
    bail(...args: any[]) {
        for (const result of this.dispatch('bail', args)) {
            if (isBailed(result)) return result
        }
    }
    * dispatch(type: string, args: any[]) {
        const thisArg = typeof args[0] === 'object' || typeof args[0] === 'function' 
        ? args.shift() : null
        const name = args.shift()
        if (name !== 'internal/event') {
            this.emit('internal/event', type, name, args, thisArg)
        }
        for (const hook of this.filterHooks(this._hooks[name] || [], thisArg)) {
            yield hook.callback.apply(thisArg, args)
        }
    }
    emit(...args: any[]) {
        Array.from(this.dispatch('emit', args))
    }
    filterHooks(hooks: Hook[], thisArg?: object) {
        thisArg = getTraceable(this.ctx, thisArg)
        return hooks.slice().filter((hook) => {
            const filter = thisArg?.[Context.filter]
            return hook.global || !filter || filter.call(thisArg, hook.ctx)
        })
    }
    register(label: string, hooks: Hook[], callback: any, options: EventOptions) {
        const method = options.prepend ? 'unshift' : 'push'
        hooks[method]({ ctx: this.ctx, callback, ...options })
        return this.ctx.scope.collect(label, () => this.unregister(hooks, callback))
    }

}
```

再来看看 `Lifecycle.on` 方法：

+ 对传入的 `listener` 调用 `ReflectService.bind` ，跟 `getTraceable` 有关；
+ 接着调用 `bail` 方法，前两个参数是固定的 `this.ctx` 和 `'internal/listener'`
  + 其内部再调用了 `dispatch` 生成器函数，使用 `isBailed` 判断真值则返回；
  + 生成器内部，获取首个对象类型的参数作为 `thisArg`，存在则将第二个参数作为 `name`；
  + 其次，所有 `name` 不为 `internal/event` 的调用，都会调用`emit`方法，且事件名为 `'internal/event'`，递归调用 `dispatch`；
  + 最后，通过`filterHooks` 方法筛选一遍 `this._hooks['internal/listener']`，返回 `hook.callback` 执行结果；

+ 若 `bail` 结果有值，则返回；否则直接获取 `_hooks[name]`，调用 `register` 方法；
+ `register` 方法内，则将 `listener` 放入对应的 `hooks` 数组中，并通过 `EffectScope` 收集了 `unregister`方法；
  + `collect` 方法的实现，我觉得很巧妙，又很自然；
  + 定义了一个 `dispose` 函数，函数体则是将从数组 `disposables` 中移除，并返回`unregister`回调执行结果；
  + 然后将 `dispose` push 到 `disposables` 数组中，返回 `dispose` 函数，即为 `leak` 的参数；

整体上来看，`on` 方法执行时，会调用 `bail` 做一个前置操作，包括：

+ 触发 `internal/event` 事件，以及 `internal/listener` 事件；
+ 如果有返回值，那就终止 `on` 后续事件注册的 `register` 方法执行；

// TODO trace bind

```typescript
class ReflectService {
    trace<T>(value: T) {
        return getTraceable(this.ctx, value)
    }

    bind<T extends Function>(callback: T) {
        return new Proxy(callback, {
            apply: (target, thisArg, args) => {
                return target.apply(
                    this.trace(thisArg), 
                    args.map(arg => this.trace(arg))
                )
            },
        })
    }
}
```

