---
title: 香橙派5P折腾踩坑记录一揽子
date: 2023-10-07 22:18:14
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/phone.png
tags: 
- Linux
- Docker
categories:
- 技术教程
---

## Navicat 连接postgresql时出现‘datlastsysoid does not exist‘报错

安装了最新的 Postgres 15 ，但该版本从表中删除了 `datlastsysoid` 字段，因此 Navicat 15.0.29 或 16.1 之前的任何版本都在连接执行查询时，会报错，要么升级 Navicat，要么修改这条查询语句，

+  找到 Navicat 安装路径下的**libcc.dll**，最好备份一下，以防万一；
+ 使用十六进制工具，如 [WinHex v20.0](https://www.52pojie.cn/thread-1252078-1-1.html) 或在线的 [HexEd.it](https://hexed.it/) 的也行；
+ 搜索`SELECT DISTINCT datlastsysoid`”，并替换为`SELECT DISTINCT dattablespace`。

