---
title: Flutter 入门学习之动画
date: 2021-02-08 12:13:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## AnimatedWidget

> 当给定的`Listenable`的值改变时重新构建的部件。

但需要为某一个Widget实现动画时，更多的情况是无状态的Widget，此时使用 **AnimatedWidget** 即可实现动画，只需继承并实现`build()`函数即可。**AnimatedWidget** 主要通过 **Listenable** 来监听小部件动画，主要是 **Animation** 对象，也包括**ChangeNotifier** 和 **ValueNotifier**。

+ **AnimatedWidget** 是一个抽象类，不能直接使用，但用众多子类可使用；

+ **AnimatedWidget** 内部已封装好 **setState()** 状态更新Widget ，无需用户手动调用监听；

### 代码示例

这里我们直接贴出官方库的实例代码分析即可：代码中，绿色的 **Container** 容器动画会在 10 秒内从 0° 旋转到 360°，并且传入了动画控制器作为 **listenable**，可对动画进行复杂控制，Flutter 将此定义为**显式动画**，而**隐式动画组件**是只需提供给组件动画开始、结束值。

```dart
import 'dart:math' as math;

class SpinningContainer extends AnimatedWidget {
    const SpinningContainer({Key key, AnimationController controller})
        : super(key: key, listenable: controller);

    Animation<double> get _progress => listenable;

    @override
    Widget build(BuildContext context) {
        return Transform.rotate(
            angle: _progress.value * 2.0 * math.pi,
            child: child: Container(width: 200.0, height: 200.0, color: Colors.green),
        )y;
    }
}

// 使用
@override
void initState() {
    _controller = AnimationController(
        duration: const Duration(seconds: 10),
        vsync: this,
    )..repeat();
    super.initState();
}
SpinningContainer(controller: _controller);
```





