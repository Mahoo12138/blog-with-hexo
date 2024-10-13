---
title: 安卓开发学习之 Gradle 摸爬打滚记录
date: 2024-05-09 23:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 技术教程
tags:
- Android
- Gradle
---

# 安卓开发学习之 Gradle 摸爬打滚记录

## Connection refused: no further information

在 Gradle task 执行过程中，出现这种问题，基本会打印出网络问题或使用的代理无法连接，如果是代理问题，如：

```text
Got socket exception during request. It might be caused by SSL misconfiguration
    > Connect to 127.0.0.1:10809 [/127.0.0.1] failed: Connection refused: no further information
```

这个就很明显了，检查以下路径下的配置文件：

+ 当前工程 project 目录下的 `gradle.properties`；
+ 当前用户目录下的 `.gradle\gradle.properties`

是否存在类似的配置：

```toml
systemProp.http.proxyHost=127.0.0.1
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7890
systemProp.http.proxyPort=7890
```

按当前系统具体情况进行修改即可。
