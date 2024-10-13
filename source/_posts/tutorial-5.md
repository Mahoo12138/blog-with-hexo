---
title: 关于WSL Ubuntu 20.04使用VScode连接报错的解决方法
date: 2022-07-22 09:00:26
categories:
- 技术教程
tags:
- WSL
- Vscode
---

在子系统安装完成并配置好 ssh 后，使用 Vscode Remote 连接安装 Vscode Server 时报错，报错信息如下：

```bash
> tar --version:
[08:48:37.512] > tar (GNU tar) 1.34
> Copyright (C) 2021 Free Software Foundation, Inc.
> License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>. 
> This is free software: you are free to change and redistribute it.
> There is NO WARRANTY, to the extent permitted by law.
> 
> Written by John Gilmore and Jay Fenlason.
[08:48:37.539] > /usr/bin/gzip: 1: ELF: not found
> /usr/bin/gzip: 3: : not found
> /usr/bin/gzip: 4: Syntax error: "(" unexpected
> tar: Child returned status 2
> tar: Error is not recoverable: exiting now
[08:48:37.547] > 
[08:48:37.604] > ERROR: tar exited with non-0 exit code: 0
> Already attempted local download, failing
```

报错信息很直观，大概率是因为 vscode-server.tar.gz 下载后通过`gzip`解压失败导致的，初步怀疑是网络原因，进行了多次下载且搜索了[microsoft/WSL · Issue #4461  ](https://github.com/microsoft/WSL/issues/4461)后排除了网络原因，并确定是当前版本安装的 gzip 的问题：

```bash
$ gzip
-bash: /usr/bin/gzip: cannot execute binary file: Exec format error
$ apt list gzip
Listing... Done
gzip/jammy,now 1.10-4ubuntu4 amd64 [installed]
```

索性开源社区已经给出了解决方案，安装一个旧版本的 [gzip-1.9-3](https://launchpad.net/ubuntu/disco/amd64/gzip/1.9-3)：

```bash
$ wget http://launchpadlibrarian.net/406169458/gzip_1.9-3_amd64.deb
$ sudo dpkg -i ./gzip_1.9-3_amd64.deb
$ sudo apt-mark hold gzip	# 取消更新
$ sudo apt-mark unhold gzip # 恢复更新
```



