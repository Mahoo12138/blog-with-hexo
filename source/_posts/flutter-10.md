---
title: Flutter 入门学习之进度条
date: 2021-02-04 22:43:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## LinearProgressIndicator

```dart
LinearProgressIndicator({
    Key key,
    double value,
    Color backgroundColor,
    Animation<Color> valueColor,
    this.minHeight,
    String semanticsLabel,
    String semanticsValue,
}) 
```

+ `value`：表示当前的进度，取值范围为[0,1]；如果`value`为`null`时则指示器会执行一个循环动画（模糊进度）；当`value`不为`null`时，指示器为一个具体进度的进度条；

+ `backgroundColor`：设置背景颜色；
+ `valueColor`：指示器的进度条颜色；值得注意的是，该值类型是`Animation<Color>`，这允许我们对进度条的颜色也可以指定动画。如果不需要动画，也就是使用一种固定的颜色，此时我们可以通过`AlwaysStoppedAnimation`来指定。

## CircularProgressIndicator

```dart
const CircularProgressIndicator({
    Key key,
    double value,
    Color backgroundColor,
    Animation<Color> valueColor,
    this.strokeWidth = 4.0,
    String semanticsLabel,
    String semanticsValue,
})
```

+ `strokeWidth` 表示圆形进度条的粗细；

使用大体上和`LinearProgressIndicator`一致。

## 进度条动画

```dart
LinearProgressIndicator(
    backgroundColor: Colors.grey[200],
    valueColor: ColorTween(begin: Colors.grey, end: Colors.blue)
    .animate(_animationController), // 从灰色变成蓝色
    value: _animationController.value,
),
```

## 案例实践

### Visibility

```dart
Visibility({
    Key key,
    @required this.child,
    this.replacement = const SizedBox.shrink(),//不可见时显示的组件（当maintainState=false）
    this.visible = true,//子组件是否可见，默认true（可见）
    this.maintainState = false,//不可见时是否维持状态，默认为false
    this.maintainAnimation = false,//不可见时，是否维持子组件中的动画
    this.maintainSize = false,//不可见时是否留有空间
    this.maintainSemantics = false,//不可见时是否维持它的语义
    this.maintainInteractivity = false,//不可见时是否具有交互性
  })
```

Visibility 使用简单，不做过多介绍，值得注意的一点就是除了[`visible`]参数外，其他的参数不宜做动态的更改，否则会引起子组件的子树重建，导致其中的状态丢失。

简单的实践一个耗时任务的进度条的显示与隐藏：

```dart
// 默认不显示进度条
bool _isDelay = false;

Column(
    children: [
        RaisedButton(
            // 按钮点击后改变状态
            onPressed: _delay,
            color: Colors.deepPurpleAccent,
            child: Text("发起耗时任务"),
        ),
        Visibility(
            visible: !_isDelay,
            child: Text("当前未发起耗时任务"),
        ),
        Visibility(
            visible: _isDelay,
            child: LinearProgressIndicator(
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation(Colors.blue),
            ),
        )  
    ]
)


_delay() async {
    // 显示进度条
    _isDelay = ! _isDelay;
    Future.delayed(Duration(seconds: 3), () {
        // 3s 后隐藏进度条
        _isDelay = ! _isDelay;
    });
}
```

