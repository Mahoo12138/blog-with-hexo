---
title: Flutter 入门学习之配置路由
date: 2020-11-20 15:34:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## 配置路由

### 404路由的配置

话不多说，直接贴代码：

```dart
// App 主界面
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      routes: {
         // 配置初始界面的第一种方式
         // '/': (BuildContext context) => MyHomePage(title: 'Flutter Demo Home Page'),
        '/home': (BuildContext context) => MyHomePage(title: 'Flutter Demo Home Page'),
        '/1': (BuildContext context) => FirstPage(),
      },         
      // 配置初始界面的第一种方式
      // home: MyHomePage(title: 'Flutter Demo Home Page'),
      // 第三种方式
      initialRoute: '/home',
      // 配置错误路由（路由表中没有的）
      onGenerateRoute: (RouteSettings settings){
        return MaterialPageRoute(builder: (BuildContext context) => ErrorPage());
      },
// ... 
}
```

在 MyHomePage 内添加几个按钮：

```dart
children: <Widget>[
    Text(
        '路由测试',
    ),
    RaisedButton(
        child: Text('打开首界面'),
        onPressed: () {
            Navigator.of(context).pushNamed('/1');
        }),
    RaisedButton(
        child: Text('不存在界面'),
        onPressed: () {
            Navigator.of(context).pushNamed('/2');
        })
],
```

### 路由观察者的配置

```dart
// App 主界面
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // ...
      onGenerateRoute: (RouteSettings settings){
        return MaterialPageRoute(builder: (BuildContext context) => ErrorPage());
      },
      // 配置路由观察者
      navigatorObservers: [
        MyNavigatorObserver(),
      ],
       
    )
  }
}
```

创建文件 `my_navigator_observer.dart`，观察者类需要继承自 `NavigatorObserver`，根据需求重写几个方式：

```dart
import 'package:flutter/material.dart';

class MyNavigatorObserver extends NavigatorObserver{
  @override
  void didPush(Route route, Route previousRoute) {

    print("Push Route:" + route.settings.toString());
    print("Push Route:" + route.settings.name.toString());

    if(previousRoute!=null){
      print("Push PreRoute:" + previousRoute.settings.toString());
      print("Push PreRoute:" + previousRoute.settings.name.toString());
    }
    super.didPush(route, previousRoute);
  }
  @override
  void didPop(Route route, Route previousRoute) {
    // TODO: implement didPop
    super.didPop(route, previousRoute);
  }
}
```

在每次执行了 Push 方法时都会回调 didPush() 等方法。 

