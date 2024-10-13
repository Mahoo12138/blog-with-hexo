---
title: 香橙派 5P Ubuntu 22.04 安装 Home Assistant Supervised
date: 2024-10-10 21:23:23
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/phone.png
tags: 
- Ubuntu
- Home Assistant
- OrangePi
categories:
- 技术教程
---

一切的起因都是因为我使用 Docker 安装的 HA 没法使用蓝牙，所以我想着是不是容器版的 HA 是不是不支持蓝牙（脑子抽了）要不换成别的版本试试，也就有了这篇博客的记录。

首先看官方文档👀，根据 [Home Assistant Supervised 官方安装指南](https://github.com/home-assistant/architecture/blob/master/adr/0014-home-assistant-supervised.md)，只能安装在 Debian 12 Bookworm 上 (no derivatives 没错，就是连 Ubuntu 也不行)，虽然说 OrangePi 官方提供了 Debian 的系统镜像，但博主已经在 Ubuntu 上深耕多年，暂且不想脱离温柔乡，所以开始了网上寻找线索，试着突破这个限制。

一开始找到了一个在 Gist 上找了个一键安装脚本，结果由于其中有一行通过 curl 读取远程网络配置写入本地的`/etc/NetworkManager/NetworkManager.conf`，然后由于链接中的源文件丢失，写入了一行 `404: Not Found`，这还是后来才发现的；当时我一下就傻了，`NetworkManager.service` 怎么还出问题了，我首先就是重启该服务，试了几遍不管用，那这样我只好重启大法了，结果糟糕了，我直接连不上 ssh 了，怎么把这茬给忘了。

之后把香橙派接上显示器，在网上找了半天的排查方法，通过命令查询到对应的日志：

```bash
 $ journalctl -u NetworkManager -b
```

才定位到是`/etc/NetworkManager/NetworkManager.conf`的问题，接着照着相关文档，删除设备网卡状态管理文件：

```bash
sudo rm -rf /var/lib/NetworkManager/NetworkManager.state
```

然后重启网络服务，网络状态会刷新并写入上述配置文件：

```bash
sudo service network-manager start
```

后续算是找到个靠谱的安装方法[^1]，照着流程，先安装相关依赖包：

```bash
apt install \
apparmor \
jq \
wget \
curl \
udisks2 \
libglib2.0-bin \
network-manager \
dbus \
lsb-release \
systemd-journal-remote -y
```

然后打开香橙派官方提供的系统配置工具：

```bash
$ rangepi-config
```

在 System → Bootenv 中，追加以下内容

```
extraargs=apparmor=1 security=apparmor
systemd.unified_cgroup_hierarchy=0
```

分别是开启  AppArmor 和 CGroupV1 的支持，之后重启系统，生效配置。

> AppArmor (Application Armor)是 Linux 内核的一个安全模块，AppArmor 允许系统管理员将每个程序与一个安全配置文件关联，从而限制程序的功能。AppArmor 是与 SELinux 类似的一个访问控制系统，通过它你可以指定程序可以读、写或运行哪些文件，是否可以打开网络端口等。

再是安装 Docker，就跳过了，开始安装 HA：

```bash
$ wget https://github.com/home-assistant/os-agent/releases/download/1.6.0/os-agent_1.5.1_linux_aarch64.deb
$ dpkg -i os-agent_1.6.0_linux_aarch64.deb
```

这里出现了问题了，也就是开头提到的，报错：

```
[error] Ubuntu 20.04.5 LTS is not supported!
```

这里绕过的方法有两种，一是原教程评论区中提到的修改`/etc/os-release`文件，对，就是手动修改系统定义的配置：

```diff
- PRETTY_NAME="Ubuntu 22.04.5 LTS"
+ PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
```

另一种就是在 HA 官方论坛，有老六发现的方法[^2]：

```bash
$ sudo BYPASS_OS_CHECK=true dpkg -i homeassistant-supervised.deb
```

没错，通过逆向分析了 `homeassistant-supervised.deb` 找到了官方留下的后门。

之后就是一路绿灯，成功地进入到了 `http://localhost:8123`。

然后还是有问题，不过问题不大，初始化程序检测到 Docker 中部署了 unhealthy 的镜像，先删除就好了。

```
Error installing Home Assistant
Found image in unhealthy image list 'portainer/portainer-ce' on the host
```

最后终于是进去了，不过蓝牙还是不能使用，这让我重新开始思考这个问题，是的，在使用 Docker 部署 HA 时，我已经挂载了蓝牙相关设备了：

```bash
$ sudo docker run -d \
	#...
    -v /dev:/dev \
    -v /run/dbus:/run/dbus \
    -v /var/run/dbus:/var/run/dbus \
    homeassistant/home-assistant:2024.5
```

 然后现在这确实跟安装的版本没多大关系，所以我将问题方向转移到蓝牙本身上来，先使用管理工具查看蓝牙设备：

```bash
$ rfkill list all

0: tpacpi_bluetooth_sw: Bluetooth
    Soft blocked: yes
    Hard blocked: no
```

> `rfkill`命令来自英文词组 *radio frequency kill* 的缩写，其功能是管理系统中的蓝牙和 Wi-Fi 设备，是一个内核级别的管理工具。

哇，蓝牙竟然没开，真相大白了（**Soft blocked: yes**：表示蓝牙设备当前被软件禁用，**Hard blocked: no**：表示蓝牙设备没有被硬件禁用，即物理开关处于开启状态，没有物理阻塞）。

接着自然是使用命令，解除软件阻塞：

```bash
$ rfkill unblock 0
```

最后还是决定换回 Docker 安装的 HA，以下是卸载脚本：

```bash
#!/usr/bin/env bash
sudo systemctl disable apparmor
sudo systemctl disable hassio-apparmor.service
sudo systemctl disable hassio-supervisor.service

sudo systemctl daemon-reload
sudo systemctl reset-failed

sudo rm /etc/systemd/system/hassio-supervisor.service
sudo rm /etc/systemd/system/hassio-apparmor.service

# sudo docker kill $(sudo docker ps -q) && sudo docker rm $(sudo docker ps -a -q) 
sudo rm -rf /usr/share/hassio

sudo rm /usr/sbin/hassio-apparmor
sudo rm /usr/sbin/hassio-supervisor
sudo rm /usr/bin/ha
```

注释的命令是删除全部 Docker 的容器，如果是才装的 Docker 那就全一并删除了（博主就是觉得 Supervised 版太散了，安装了一堆容器，才放弃的，重回 Docker 版）。



### 参考

[^1]:[Install Home Assistant on OrangePi 5 ](https://gist.github.com/renatoccosta/c30f0b4216c8caaf1f202b0a0561b5d3)
[^2]: [Install on Unbuntu 20.04.5 or 22.04.1](https://community.home-assistant.io/t/install-on-unbuntu-20-04-5-or-22-04-1/524361/5)