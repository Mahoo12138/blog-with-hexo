---
title: Flutter 进阶学习之画板
date: 2021-01-07 10:13:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## 简单介绍

`CustomPaint `可以称之为动画鼻祖，它可以实现任何酷炫的动画和效果。CustomPaint 本身没有动画属性，仅仅是绘制属性，一般情况下，CustomPaint 会和动画控制配合使用，达到理想的效果；CustomPaint 继承自`SingleChildRenderObjectWidget`，所以不能用 `setState()` 来刷新。

```dart
const CustomPaint({
    Key key,
    this.painter,
    this.foregroundPainter,
    this.size = Size.zero,
    this.isComplex = false,
    this.willChange = false,
    Widget child,
}) 
```

其中：

- painter 就是我们的主绘制工具，它是一个 CustomPainter 画笔角色；
- foregroundPainter 是用来绘制前景的工具；
- size 为画布大小，这个 size 会传递给 Painter；
- isComplex 和 willChange 是告诉 Flutter 你的 CustomPaint 是否复杂到需要使用 cache 相关的功能；
- child 属性我们一般不填，即使想要在 CustomPaint 上添加一些其他的布局，也不建议放在 child 属性中，很难得到想要的结果。

## 基本使用

CustomPaint 的用法非常简单，绘制的代码写在我们的自定义 CustomPainter 中，如下：

```dart
CustomPaint(
  painter: MyCustomPainter(),
)
```

```dart
class MyCustomPainter extends CustomPainter {
  /// 重写绘制流程函数，当前什么也没做
  @override
  void paint(Canvas canvas, Size size) {}
    
  /// 重写控制自定义 View 是否需要重绘的函数，返回 false 代表这个 View 在构建完成后不需要重绘
  /// 也就是当该实例内属性变化时返回 true。
  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
```

当然，还可以设置画笔的一些属性：

```dart
class MyCustomPainter extends CustomPainter {
    /// ...
    Paint _paint = Paint()
        ..color = Colors.blue			///	画笔颜色
        ..style = PaintingStyle.stroke	/// 画笔样式
        ..strokeWidth = 12.0
        ..isAntiAlias = true;			/// 抗锯齿
}
```

`PaintingStyle.stroke` 指的是直接将画笔画在路径的边缘，例如绘制一个圆时，只是边缘有画笔的轨迹，而不是绘制出一个圆饼；`strokeWidth`即为绘制的宽度。

### 绘制点

```dart
@override
void paint(Canvas canvas, Size size) {
    var points = [
        Offset(0, 0),
        Offset(0, 100),
        Offset(0, 200),
        Offset(0, 300),
        Offset(0, 400),
        Offset(0, 500),
        Offset(0, 600),
    ];
    canvas.drawPoints(PointMode.points, points, _paint);
}
```

![](D:\Mahoo12138\Workbench\临时文件\image-20210123171107807.png)

`PointMode`定义了一组坐标怎样解释，有 3 种模式：

- points：点，单独将这些点绘制
- lines：将 2 个点绘制为线段，如果点的个数为奇数，最后一个点将会被忽略
- polygon：将整个点绘制为一条线

### 绘制线

 ```dart
canvas.drawLine(Offset(50, 50),Offset(200, 200), _paint);
 ```

![](D:\Mahoo12138\Workbench\临时文件\image-20210123172700178.png)

### 绘制路径

```dart
void paint(Canvas canvas, Size size) {
    var _path = Path()
        ..moveTo(0, 0)
        ..lineTo(100, 100)
        ..lineTo(-150, 400)
        ..close();
    canvas.drawPath(_path, _paint);
}
```

![](D:\Mahoo12138\Workbench\临时文件\image-20210123180942770.png)

> 这里注意`Paint.style`，还可以设置为`PaintingStyle.fill`，可将路径包围的范围填充。



### 绘制各种形状

#### 绘制圆形

```dart
canvas.drawCircle(Offset(0, size.height/2), 50, _paint);
```

#### 绘制椭圆

```dart
canvas.drawOval(Rect.fromLTRB(-200, 100, 200, 300), _paint);
```

> 在矩形内画椭圆，如果矩形为正方形，则椭圆为圆。

#### 绘制弧

```dart
canvas.drawArc(Rect.fromLTRB(-200, 0, 100, 300), 0, pi/2, true, _paint);
```

#### 绘制圆角矩形

```dart
canvas.drawRRect(RRect.fromLTRBR(-200, 200, 200, 400, Radius.circular(10)), _paint);
```



