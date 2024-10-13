---
title: Flutter 入门学习之Tab导航栏
date: 2020-12-31 21:34:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## Scaffold

`Scaffold` 实现了 Material 风格的基本布局结构，它提供了展示`drawers`(抽屉栏)、`snackbars`（通知条）和`bottomsheets`（上滑栏）的功能，基本用法如下：

```dart
Scaffold(
    //设置AppBar栏 
    appBar: AppBar(
        // 左边的按钮
        //leading: Icon(Icons.menu),
        leading: Builder(
          builder: (BuildContext ctx) => IconButton(
              icon: Icon(Icons.menu),
              onPressed: () {
                print("Open Drawer!");
                Scaffold.of(ctx).openDrawer();
              }),
        ),
        // 导航栏底部显示 一个类似 Tab 的导航条
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(28.0),
          child: Container(
            height: 28.0,
            color: Colors.yellow,
          ),
        ),
        // 中间的文字
        title: Text("Flutter Demo"),
        //右侧的内容，为数组，可设置多个
        actions: [
          IconButton(icon: Icon(Icons.search), onPressed: (){print("hello");}),
          IconButton(icon: Icon(Icons.email), onPressed: null),
          IconButton(icon: Icon(Icons.near_me), onPressed: null),
        ],
    ),
    //设置从左和右出现的抽屉栏
    drawer: Drawer(),
  	endDrawer: Drawer(),
    //配置位置
    floatingActionButtonLocation: FloatingActionButtonLocation.miniStartFloat,
    //设置悬浮按钮，默认显示在右下角
    floatingActionButton: FloatingActionButton(
    	tooltip: 'FAButton',
        foregroundColor: Colors.cyan,
        splashColor: Colors.redAccent,
        backgroundColor: Colors.green,
        child: Icon(Icons.add),
		elevation: 10,
        highlightElevation: 5,
    ),
    // 设置背景颜色
    backgroundColor: Color.fromRGBO(244, 245, 245, 1.0),
    // 位于悬浮按钮底端的底栏，可以显示多个部件
   persistentFooterButtons: [
        FlatButton(onPressed: (){}, child: Text("开启")),
        Text("全体起立！")
      ],
);
```

### 圆点指示器

在 AppBar 的 bottom 内添加 TabPageSelector 圆点指示器，绑定控制器 _tabController：

```dart
appBar: AppBar(
    title: Text("第一个界面"),
    bottom: PreferredSize(
        preferredSize: Size.fromHeight(28.0),
        child: TabPageSelector(
            controller: _tabController,
            color: Colors.blue,
            selectedColor: Colors.pink,
        ),
    ),
),
```

控制器需要声明及初始化：

```dart
class _FirstPageState extends State<FirstPage> with TickerProviderStateMixin {

    TabController _tabController;
    @override
    void initState() {
        _tabController = TabController(length: 4, vsync: this);
        super.initState();
    }
//...
}
```

在 Scaffold 的 body 中，配置 Tab 的几个界面：

```dart
body: TabBarView(
    controller: _tabController,
    children: [
        Center(child: Text("页面1"),),
        Center(child: Text("页面2"),),
        Center(child: Text("页面3"),),
        Center(child: Text("页面4"),),
    ],
),
```

当然，常用的做法是使用 TabBar ：

```dart
bottom: TabBar(
    controller: _tabController,
    tabs: [
        Tab(text: "标签一",),
        Tab(text: "标签二",),
        Tab(text: "标签三",),
        Tab(text: "标签四",),
    ],
),
```



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
