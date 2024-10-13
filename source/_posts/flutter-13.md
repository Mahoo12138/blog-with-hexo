---
title: Flutter 开发之动态更新Dialog中的状态
date: 2021-03-18 10:13:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 技术教程
---

## 需求分析

之前在写一个登录页面的 demo 时，点击登录按钮，发送网络请求，并且弹出包含进度条的 Dialog，异步进行的网络请求得到结果后，根据请求结果动态更新 Dialog 的状态

一般的想法就是，使用 **setState** 状态，但实际情况下，Dialog 的状态并不会得到更新，于是开始查看**Dialog** 和 **showDialog** 的源码，在**showDialog**的源码中发现了一些端倪：

```dart
Future<T?> showDialog<T>({
  required BuildContext context,
  // ...
}) {
  // ...
  return Navigator.of(context, rootNavigator: useRootNavigator).push<T>(DialogRoute<T>(
    context: context,
	// ...
  ));
}
```

在调用了 `showDialog` 方法后，实际上是进行了**路由跳转**的，这是对比安卓原生的一个很大区别，所以用 `Navigator.pop`关闭 Dialog；所以当收到请求结果后，进行的 setState 其实更新的是上一个路由界面的状态，也就不会对 Dialog 的状态进行更新。

## 解决方法

同样的，在`dialog.dart`源码 **showDialog **方法的注释部分也获悉到了正统的解决方法：

```dart
/// This function takes a `builder` which typically builds a [Dialog] widget.
/// Content below the dialog is dimmed with a [ModalBarrier]. The widget
/// returned by the `builder` does not share a context with the location that
/// `showDialog` is originally called from. Use a [StatefulBuilder] or a
/// custom [StatefulWidget] if the dialog needs to update dynamically.
```

核心部分的简单翻译就是，**showDialog **的 builder 返回的 widget 没有共享 **showDialog **原来被调用的位置的 context，可以用 `StatefulBuilder` 或自定义 一个`StatefulWidget`来自动更新 Dialog。

**StatefulBuilder** 的 builder 参数是一个`StatefulWidgetBuilder` 类型的函数，第一个参数是 context，第二个参数是 setState 函数，也就可以通过这个函数来刷新 Dialog。

```dart
typedef StatefulWidgetBuilder = Widget Function(BuildContext context, StateSetter setState);
```

## 测试代码

我们可以简单模拟一个网络请求操作，来验证该方法是否可行。

构建一个基本的主页面，一个按钮，点击后发起网络操作，显示 Dialog，其`_buildLoginDialog()` 函数根据标志 **flag**  返回对应的内容：

```dart
int flag = 0;

Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(
              onPressed: () {
                showDialog(
                    context: context,
                    builder: (context) {
                      return StatefulBuilder(builder: (context, state){
                        if (mounted && flag == 0 ){
                          _login(state);
                        }
                        return Dialog(
                          child: _buildLoginDialog(),
                        );

                      });
                    });
              },
              child: Text("测试"),
            )
          ],
        ),
      ),
    );
  }
```

以下是`_buildLoginDialog() `代码实现：

```dart
_buildLoginDialog() {
  if (flag != 0) {
    if (flag < 0) {
      return Container(
        height: 200,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [Text("用户名或密码错误")],
        ),
      );
    } else {
      return Container(
        height: 200,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 50,
              height: 50,
              child: CircularProgressIndicator(),
            ),
            Padding(
              padding: EdgeInsets.all(13),
              child: Text("登录成功！"),
            )
          ],
        ),
      );
    }
  } else {
    return Container(
      height: 200,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 50,
            height: 50,
            child: CircularProgressIndicator(),
          ),
          Padding(
            padding: EdgeInsets.all(13),
            child: Text("登陆中"),
          )
        ],
      ),
    );
  }
}
```

需要将 **state** 函数传入网络请求函数，进行页面状态更新：

```dart
_login(state) async {
  print("请求数据前：" + flag.toString());
  await Future.delayed(Duration(seconds: 3), () {
    print("延时三秒后请求数据");
  });
  state(() {
    flag = 1;
    print("请求数据后：" + flag.toString());
  });
}
```

