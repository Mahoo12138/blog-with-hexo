---
title: 使用 Tasker 自动播放 QQ 音乐歌单
date: 2022-10-09 21:00:12
categories:
- 技术教程
tags:
- Tasker
---

最近突然有这么个想法，想在早上快起床的时候，也就是闹钟响之前的那段时间，自动播放一些轻柔的音乐，比如[班得瑞](https://zh.m.wikipedia.org/zh-hans/班得瑞_(音乐项目))之类的，可以闭着眼睛享受一下上班前这段闲暇时光；

## 获取打开链接

首先，我们现在 QQ 音乐内创建好自己的一个歌单，然后点击页面内的**分享**按钮，复制链接，然后在浏览器打开；

在网页中，打开该歌单后，页面可能会自动弹出询问的 Dialog 确认是否在 App 中查看，如果没有弹出，可手动点击，页面中的在 App 中打开的按钮。

打开页面时，则可以复制我们的歌单的直达链接了。

注意这里需要特定的浏览器，才能显示并能复制歌单的直达链接，这里推荐使用 [Alook](https://coolapk.com/apk/alook.browser) 浏览器，方便快捷。

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/tasker/step-1.jpg" alt="获取快捷链接" style="zoom: 50%;" />

## 设置定时任务

有了，直达链接，我们就可以放开手干活了，这里需要两个工具：

+ Tasker：一款非常优秀的，全面的自动化工具，几乎无所不能；
+ TouchTask：Tasker 体系下的一个插件，用于实现自动化点击；

上述工具都能在博主的 Onedrive 站点中分享了，[戳我](https://yun.mahoo12138.cn/zh-CN/%F0%9F%94%A7Apps/%E3%80%90%E8%87%AA%E5%8A%A8%E5%8C%96%E5%B7%A5%E5%85%B7%E3%80%91Tasker%20%E5%8F%8A%E6%8F%92%E4%BB%B6/)查看下载；

### 设置触发条件

进入 Tasker 后，首先新建一个配置文件 【Profile】，选择时间【Time】，指定任务触发的具体时间，这样第一步也就完成了；

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/tasker/step-2.jpg" alt="新建配置任务" style="zoom:67%;" />

### 配置触发任务

配置文件新建后，会立刻要求设置一个任务【Task】，可以选择新建一个【New Task】，并输入备注名称，也可以直接确定，作为这个配置文件专属的匿名任务；

进入配置任务，先新建一个浏览 URL 【Browse URL】的操作【Action】，在此则把我们获取到的歌单直达链接粘贴进去即可；

然后，我们需要根据自身手机具体情况，设置一定的缓冲等待时间，这样之后的点击任务才能有效的执行；

选择任务【Task】-> 等待【Wait】，可以先点击任务配置页面左下方的手动执行按钮，实测一下，QQ 音乐在冷启动时进入我们的歌单所花费的时间，注意是冷启动，也就是 QQ 音乐在完全停止的情况下；

最后，则是我们的压轴任务【TouchTask】，同样的，我们新建一个任务操作，选择插件【Plugin】，并点击主角【TouchTask】，进入插件配置后，点击【Configuration】后的 Icon 进行新建，以下是具体配置项：

+ **操作 Action**：选择【Tap】，这里我们主要需要点击歌单内的**全部播放按钮**实现播放；
+ **选择方式 Selection method**：即进行 Tap 点击时，目标的选择方式，我们选择【Text】，因为 QQ 音乐或者说是鹅厂家好几款 App 都是其自研的跨端框架开发的，内部其实是 WebView，也就是网页，无法使用 ID 进行 View 筛选；
+ **选择点 Selection point**：也就是上一个配置项的具体值，输入【全部播放】；
+ 其他的可选选项，可根据自己需求酌情配置；

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/tasker/step-3.jpg" alt="任务配置详情" style="zoom:67%;" />

到这里，整个自动播放的操作已经完全实现了，其他一些细节例如文字提示，音量，自动停止播放，都可以根据自己需求配置。
