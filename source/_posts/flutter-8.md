---
title: Flutter 入门学习之本地存储
date: 2021-01-15 10:43:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## 什么是 shared_preferences

shared_preferences是Flutter社区开发的一个本地数据存取插件，它有以下特性：

- 简单的，异步的，持久化的key-value存储系统；
- 在Android上它是基于 SharedPreferences 的；
- 在iOS上它是基于[NSUserDefaults](https://coding.imooc.com/class/321.html?mc_marking=f0d19be86650c0e77daa6fe37e140ded&mc_channel=shouji)的；

## 如何使用 shared_preferences

首先在pubspec.yaml文件中添加：

```dart
dependencies:
  shared_preferences: any
```


在需要用到的文件中导入：

```dart
import 'package:shared_preferences/shared_preferences.dart';
```

基本使用：

```dart
/// 存储数据
_saveData(Number data) async {
    // 因为SharedPreferences的存贮也是一个轻量级的耗时操作，所以需要在异步中进行的。
  SharedPreferences prefs = await SharedPreferences.getInstance();
  
  await prefs.setInt('number', data);
}
/// 读取数据
Number _getData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
	var data = prefs.getInt('number') ?? 0;
	return data;
}
/// 删除数据
_deleteData() {
  	SharedPreferences prefs = await SharedPreferences.getInstance();
	prefs.remove('number');  
}
```

## 常用 API

如上述代码，`shared_preferences`支持 int, double, bool, string 与 stringList 类型的数据存储；