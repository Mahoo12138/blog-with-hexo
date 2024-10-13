---
title: 利用ADB将安卓投屏到电脑进行调试开发
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
date: 2020-04-27 10:01:25
categories: 
- 技术教程
tags:
- adb
- Android
---

保证手机与电脑在同一个局域网下，然后查看手机的IP地址：

## 投屏准备

数据线连接手机，并确保手机与电脑在同一个局域网下，然后查看手机的IP地址

+ 通过设置-WLAN，查看当前WiF信息详细，查看IP地址
+ 通过adb命令查看：`adb shell netcfg`

在电脑cmd中，ping一下手机的IP地址，再次检查是否同一局域网

开启adb调式端口 `adb tcpip 5555`，并通过IP连接安卓手机：

```bash
adb connect <android-ip>
```

连接成功后显示`connected to 192.168.0.104:5555`

## 软件投屏

在大佬博客上，下载其开发的投屏软件：[安卓投屏助手(ARDC)最新版](https://www.cnblogs.com/we-hjb/p/10989928.html)

打开软件后，自动连接，开始投屏，还有各种玩法，自行摸索

## 使用问题

+ cannot connect to 192.168.0.104:5555: 由于目标计算机积极拒绝，无法连接。 (10061)

  1. 使用数据线连接手机

  2. 进入手机shell，如`Termux` 输入命令：

     ```shell
     # 打开adb网络调式，并设置端口
     setprop service.adb.tcp.port 5555
     ```

  3. 重新投屏即可