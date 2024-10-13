---
title: Flutter 入门学习之底部导航栏
date: 2020-11-20 15:34:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## MaterialApp

在学习 Flutter 的过程中我们第一个看见的控件应该就是`MaterialApp`，毕竟创建一个新的Flutter项目的时候，项目第一个组件就是`MaterialApp`，这是一个Material风格的根控件，一般用于**void main() {runApp(MyApp());}** 中 `runApp()` 类的`build()`方法返回的控件，基本用法如下：

```dart
MaterialApp(
    debugShowCheckedModeBanner: false,	//隐藏右上角的DEBUG标签
    title: 'Flutter Demo',	//在安卓任务管理窗口中所显示的应用名字，与iOS端无关
    /// iOS端中，任务视图名称配置于ios/Runner/Base.lproj/info.plist 文件中的CFBundleDisplay键或者CFBoundName键的值中
    theme: ThemeData(		//设置整个App的主题
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
    ),
    darkTheme: ThemeData(
      primaryColor: Colors.red
  	),
    home: home: IndexPage(),
);
```

在上述代码的 **home: IndexPage()**  处，笔者对组件做了一个分离，IndexPage() 组件内为`Scaffold` 。

### ThemeData的配置

+ primarySwatch：程序导航栏和浮动按钮颜色
+ brightness：程序的亮色/暗色
+ primaryColor：程序主背景色，若不配置，则默认为 primarySwatch
+ accentColor：程序前景色，例如：进度条前景色，开关选择颜色，单选框选中颜色，输入框光标的颜色
+ appBarTheme: 顾名思义，
  + elevation，设置阴影高度，默认 8.0
  + iconTheme: 设置 AppBar 内的 icon 的主题如 size，color，opacity等
  + actionsIconTheme：配置 AppBar 右侧 icon 样式
+ iconTheme：配置程序的 icon 样式，主要用于画布canvas和card中
+ primaryIconTheme：主要用于primaryColor颜色对比下的Icon的颜色，如某一视图背景颜色为primaryColor，primaryIconTheme则配置该视图内的Icon的主题
+ buttonTheme：配置应用程序内的按钮的主题

## BottomNavigationBar

`BottomNavigationBar` 和 `BottomNavigationBarItem`配合`Scaffold`控件使用可以实现底部导航效果，类似于微信底部的导航效果，以下是一个简单的底部导航栏实例：

1. 在项目 **Lib** 目录中，新建 **Pages** 包，在其中新建三个界面，分别是`home_page.dart` ，`other_page.dart`， `profile_page.dart` ，当然上文中出现 `index_pages.dart` 也放在这里，在 `index_pages.dart` 中引入：

   ```dart
   import 'home_page.dart';
   import 'other_page.dart';
   import 'profile_page.dart';
   ```

2. 在`index_pages.dart`内的`IndexPage`（StatefulWidget）类中 **BottomNavigationBarItem** 列表，定义界面列表以及当前显示界面的**索引**：

   ```dart
   final List<BottomNavigationBarItem> bottomTabs = [
       BottomNavigationBarItem(
           //未选中图标
           icon: Icon(CupertinoIcons.home),
           //选中时控件
           activeIcon: Icon(CupertinoIcons.scope),
           //选中时导航栏背景颜色
           backgroundColor: Colors.redAccent,
           //显示的文字
           label: "主页"
       ),
       BottomNavigationBarItem(
           icon: Icon(CupertinoIcons.cart),
           backgroundColor: Colors.deepPurpleAccent,
           label: "其他"
       ),
       BottomNavigationBarItem(
           icon: Icon(CupertinoIcons.profile_circled),
           backgroundColor: Colors.amber,
           label: "我的"
       ),
   ];
   
   final List tabBodies = [
       HomePage(),
       OtherPage(),
       ProfilePage()
   ];
   
   int currentIndex = 0;
   var currentPage;
   ```

3. 在 `IndexPage`类的状态类 `_IndexPageState` (extends State\<IndexPage\>) 中重写`build`方法：

   ```dart
     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: Text("Flutter Demo"),
         ),
         backgroundColor: Color.fromRGBO(244, 245, 245, 1.0),
         bottomNavigationBar: BottomNavigationBar(
           //底栏切换的样式
           type: BottomNavigationBarType.fixed,
           //当前的序列
           currentIndex: currentIndex,
           //颜色设置
           selectedItemColor: Theme.of(context).primaryColor,
       	unselectedItemColor: Colors.grey,
   		//底栏子项的列表
           items: bottomTabs,
           //每个子项点击触发的方法
           onTap: (index){
             setState(() {
               //方法触发后，必须调用setState()方法重新绘制UI
               currentIndex = index;
               //将点击的子项的索引作为当前显示的索引，并切换索引对应的视图界面
               currentPage = tabBodies[currentIndex];
             });
           },
         ),
         //显示的界面
         body: currentPage,
       );
     }
   ```

   关于 BottomNavigationBarItem 切换的显示模式，默认 3-5 个时采用`fixed`模式，4 个时默认采用`shifting`模式，当然，是可以指定的。

