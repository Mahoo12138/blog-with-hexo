---
title: Flutter 入门学习之按钮
date: 2021-01-07 10:13:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

按钮的使用大致相同，无非样式和各种交互的回调，这里以 TextButton 为例：

```dart
TextButton(
  child: Text('TextButton'),
  // onPressed 为点击回调，onLongPress 为长按回调
  onPressed: () {},
  onLongPress: (){},
  style: ButtonStyle(
    foregroundColor: MaterialStateProperty.all(Colors.cyan),
    textStyle: MaterialStateProperty.all(TextStyle(fontSize: 20)),
  ),
)
```

> **注意**：字体颜色的设置不通过**textStyle** 设置，而是通过 **foregroundColor**

样式的构造函数如下：

```dart
const ButtonStyle({
  this.textStyle, //字体
  this.backgroundColor, //背景色
  this.foregroundColor, //前景色
  this.overlayColor, // 高亮色，按钮处于focused, hovered, or pressed时的颜色
  this.shadowColor, // 阴影颜色
  this.elevation, // 阴影值
  this.padding, // 内距
  this.minimumSize, //最小尺寸
  this.side, //边框
  this.shape, //形状
  this.mouseCursor, //鼠标指针的光标进入或悬停在此按钮的[InkWell]上时。
  this.visualDensity, // 按钮布局的紧凑程度
  this.tapTargetSize, // 响应触摸的区域
  this.animationDuration, //[shape]和[elevation]的动画更改的持续时间。
  this.enableFeedback, // 检测到的手势是否应提供声音和/或触觉反馈。例如，在Android上，点击会产生咔哒声，启用反馈后，长按会产生短暂的振动。通常，组件默认值为true。
});

```

shape 属性可用的值举例：

+ BeveledRectangleBorder	尖端斜角
+ CircleBorder    圆形
+ RoundedRectangleBorder   圆角
+ StadiumBorder   半圆角（腰圆）

其他的按钮还有：

+ RaisedButton（Material 风格凸起的按钮，1.22版本前，不建议使用，使用 ElevatedButton）
+ FlatButton （ Material 风格扁平的按钮，1.22版本前，推荐使用 TextButton）
+ OutlinedButton（带边框的按钮，1.22 前有 OutlineButton）
+ IconButton（图标按钮）
+ DropdownButton（Material Style 下拉菜单按钮）
+ PopupMenuButton（菜单选择框按钮）
+ FloatingActionButton（悬浮按钮）

1.22 以后出现的新按钮，可以作统一全局的样式管理：

```dart
MaterialApp(
  title: 'Flutter Demo',
  theme: ThemeData(
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle()
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle()
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle()
    )
  ),
  home: MyHomePage(title: 'Flutter Demo Home Page'),
)
```





