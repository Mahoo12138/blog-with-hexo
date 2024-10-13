---
title: Flutter 入门学习之Text文本相关组件
date: 2021-01-04 15:13:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

上代码即可：

```dart
body: Center(
    child: SizedBox(
        height: 60,
        width: 200,
        child: Container(
            // 将整个Container看成坐标系，中心则为(0,0)，alignment设置将child放置在(0,0)
            alignment: Alignment(0,0),
            color: Colors.yellow,
            child: Text(
                "Text Demo Page Text Demo Page Text Demo Page Text Demo Page Text Demo Page Text Demo Page Text Demo Page",
                // 限制最大的显示行数
                maxLines: 2,
                // 设置溢出的显示方式
                // ellipsis: 显示省略号；clip：裁剪；fade：透明化
                overflow: TextOverflow.ellipsis,
                // 与 maxLines 和 overflow 互斥（设置此两项，则 softWrap 失效），设置是否换行
                softWrap: true,
                // 设置文字对齐方式 
                textAlign: TextAlign.center,
                // 设置文字绘制方向
                textDirection: TextDirection.rtl,
                // 文本字体缩放倍数,值为 double 型,通过媒体查询环境可得，总之就是手机像素密度大小
                textScaleFactor: 1.0,
                // 设置文字的样式
				style: TextStyle(
                    color: Colors.deepPurple,
                    fontSize: 20,
                    decoration: TextDecoration.underline,	// 字体的装饰，上划线下划线删除线等
                    decorationColor: Colors.black,			// 装饰的类型，波浪线短横线点线等
                    decorationStyle: TextDecorationStyle.wavy,
                    backgroundColor: Colors.pink,
                    fontWeight: FontWeight.bold,	// 字体粗细
                    fontStyle: FontStyle.italic,	// 字体样式，斜体
					letterSpacing: 2.0,				// 用于设置字母之间的距离
                    wordSpacing: 4.0				// 单词间距
                    height: 2.0						// 行高倍数

              ),
            ),
        ),
    ),
),
```

富文本组件：

```dart
child: Text.rich(
    TextSpan(
        text: "hello ",
        style: TextStyle(color: Colors.green),
        children: [
            TextSpan(
                text: "world ", style: TextStyle(color: Colors.pink)),
            TextSpan(
                text: "world ", style: TextStyle(color: Colors.blue)),
            TextSpan(
                text: "world !",
                style: TextStyle(color: Colors.cyan),
                //设置点击事件,使用识别器
                recognizer: TapGestureRecognizer()..onTap = () {
                    print("点击了该文本！");
                })
        ],
    ),
),
```

文本输入框：

```dart

```

