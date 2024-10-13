---
title: Google Drive 调用 IDM 下载大文件
date: 2020-08-22 13:00:43
categories:
- 技术教程
---

最近在用 Google Drive 收集一些好东西，但是下载的时候由于文件过大的限制还是其他原因，遇到了一些问题：

![image-20200822134231583](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/image-20200822134231583.png)

在网上找到了解决方法，在这里记录一下：

+ 右键点击文件，选择**添加星标**
+ 在页面左栏的`已加星标`中，找到文件；右键点击文件**复制**，建立副本
+ 之后就可以下载创建的副本了

但是下载**默认调用系统浏览器**进行下载，对于一些大文件，IDM 才算的上是称手的工具，利用 IDM 的浏览器插件也是无法调动 IDM 的，而当用浏览器下载的链接往 IDM 里添加任务，这当然是行不通的，总之无法获取到文件直链，网上也有很多方法，可以自行搜索，不过我都嫌太麻烦了，因为IDM 自带的小功能就能解决这个问题：

+ 找到 IDM  的快捷键，并作如下设置：

  ![image-20200822135133027](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/image-20200822135133027.png)

+ 在下载副本文件时，会弹出警示框，显示**无法对文件作病毒扫描**，此时，按住`Alt`，再点击`仍然下载`

  ![image-20200822135756432](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/image-20200822135756432.png)

+ 当捕获到的下载文件消息中含有**副本**二字时，则可以正常下载了：

  ![image-20200822140007653](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/image-20200822140007653.png)

