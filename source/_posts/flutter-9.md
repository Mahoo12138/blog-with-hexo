---
title: Flutter 学习实践之Banner轮播图
date: 2021-02-02 11:43:24
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/flutter.png
tags: 
- Flutter
categories: 
- 学习笔记
---

## PageView

PageView控件可以实现一个“图片轮播”的效果，PageView不仅可以水平滑动也可以垂直滑动。

```text
PageView({
    Key key,
    this.scrollDirection = Axis.horizontal,
    this.reverse = false,
    PageController controller,
    this.physics,
    this.pageSnapping = true,
    this.onPageChanged,
    List<Widget> children = const <Widget>[],
    this.dragStartBehavior = DragStartBehavior.start,
  })
```

- `scrollDirection `，滚动方向；

- `reverse`，子视图倒置展示；

- `pageSnapping `，默认为 true，让 pageView 具有分页效果，滚到超到View页面一半，就会滚动到下一页，小于则停留在当前页；设置为 false，则滚到哪里算哪里，没有分页效果。

- `onPageChanged`，滚动会在回调中得到当前的索引值，默认从 0 开始，0，1，2...

- `PageController`，是描述 pageView 子视图的 widget：

    ```text
    PageController({
        this.initialPage = 0,
        this.keepPage = true,
        this.viewportFraction = 1.0,
      })
    ```

- `initialPage`，表示当前加载第几页，默认显示第一个视图，可自定义设置索引值；

- `keepPage`，是否保持已经渲染过的页面；

- `viewportFraction`，视图默认 100% 撑开显示，0 - 1，如果当前滚动方向为水平方向，会以宽度的%比，来缩放视图；如果当前滚动方向为垂直方向，会以高度的%比，来缩放视图

简单使用如下：

```dart
final List descriptions = [
    'banner 0',
    'banner 1',
    'banner 2',
];

Container(
    height: 200,
    child: PageView(
        children: [
            Card(
                color: Colors.cyanAccent,
                child: buildItemPage(0),
            ),
            Card(
                color: Colors.red,
                child: buildItemPage(1),
            ),
            Card(
                color: Colors.yellow,
                child: buildItemPage(2),
            )
        ],
    ),
);
}

Widget buildItemPage(int index) {
    return Container(
        alignment: Alignment.center,
        child: Text(descriptions[index]),
    );
}
```

## PageView.builder

按需加载内容和视图数量：

```text
PageView.builder(
	itemBuilder: _pageItemBuilder,
	itemCount: posts.length,
);
```

一般巧用取模来实现**无限滚动**的效果：

```dart
final List descriptions = [
    'banner 0',
    'banner 1',
    'banner 2',
];

Container(
    height: 200,
    child: PageView.builder(
        controller: PageController(
            viewportFraction: 0.9
        ),
        itemBuilder: (context,index){
            return buildItemPage(index % descriptions.length);
        },
        itemCount: 10000,
    ),
);

Widget buildItemPage(int index) {
    return Card(
        color: Colors.lightBlue,
        child: Container(
            alignment: Alignment.center,
            child: Text(descriptions[index]),
        )

    );
}
```

## 实现指示器

常见的 Banner 轮播图都会有页面的指示器，一般显示总数和当前位置，可以通过`onPageChanged`回调确定当前页数并更新指示器。

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/20210203093305.png)

### 原点型

```dart
Stack(
    children: [
        PageView.builder(
            controller: PageController(viewportFraction: 0.9),
            itemBuilder: (context, index) {
                return buildItemPage(index % descriptions.length);
            },
            itemCount: 10000,
            onPageChanged: (index){
                setState(() {
                    _currentDotIndex = index % descriptions.length;
                });
            },
        ),
        Positioned(
            left: 0,
            right: 0,
            bottom: 20,
            child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                    descriptions.length,
                    (index) => Container(
                        margin: EdgeInsets.symmetric(horizontal: 5),
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: (_currentDotIndex == index)
                            ? Colors.deepPurpleAccent
                            : Colors.white),
                    )),
            ))
    ],
)
```

### 数字型

```dart
Stack(
    children: [
        PageView.builder(
            controller: PageController(viewportFraction: 0.9),
            itemBuilder: (context, index) {
                return buildItemPage(index % descriptions.length);
            },
            itemCount: 10000,
            onPageChanged: (index){
                setState(() {
                    _currentNumIndex = index % descriptions.length;
                });
            },
        ),
        Positioned(
            right: 45,
            bottom: 20,
            child: Container(
                alignment: Alignment.center,
                width: 50,
                height: 24,
                decoration: BoxDecoration(
                    color: Colors.grey[200].withOpacity(0.5),
                    borderRadius: BorderRadius.all(Radius.circular(12))
                ),
                child: Text('${_currentNumIndex + 1}/${descriptions.length}',style: TextStyle(fontSize: 12,),textAlign: TextAlign.center,),
            ))
    ],
)
```

## 自动轮播

常见的轮播图往往都有自动轮播这一需求，在 Flutter 中可以使用 Timer 定时器来实现。在组件的 `dispose()` 方法需要检查定时器，然后取消定时器，防止内存泄漏。通过 PageController 在每一次定时回调中调用其 `nextPage() `方法，切换下一页，值得注意的是，不同的 PageView 不能使用同一个 PageController 控制器。

```dart
PageController _pageController;
Timer _timer;

@override
void initState() {
    _pageController = PageController(viewportFraction: 0.9);
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
        _pageController.nextPage(
            duration: Duration(milliseconds: 400), curve: Curves.linear);
    });
    super.initState();
}

@override
void dispose() {
    if (_timer.isActive) {
        _timer.cancel();
    }
    super.dispose();
}

PageView.builder(
    controller: _pageController,
)
```

### 优化轮播

当实现好自动轮播后，在实际交互中是非常不理想的，轮播会一直持续，不会响应点击触摸等手势，需要进一步优化：

```dart
GestureDetector(
    child: buildItemPage(index % descriptions.length),
    onTap: () {
        startBannerLoop();
    },
    onTapDown: (detail) {
        stopBannerLoop();
    },
    onTapCancel: () {
        startBannerLoop();
    },
);


void stopBannerLoop() {
    if (_timer.isActive) {
        _timer.cancel();
    }
}

void startBannerLoop() {
    _timer = Timer.periodic(Duration(seconds: 3), (timer) {
        _pageController.nextPage(
            duration: Duration(milliseconds: 400), curve: Curves.linear);
    });
}
```

