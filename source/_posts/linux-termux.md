---
title: 关于我用旧手机折腾服务器的过程全纪实
date: 2022-01-20 22:18:14
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/phone.png
tags: 
- 旧手机
- Linux
- Termux
categories:
- 技术教程
---

## 前言

最近，作为钉子户的我的 OnePlus5-cheeseburger 突然直接屏幕漏液了，一会就完全黑了，不知道是进水了，还是磕磕碰碰了，毕竟是裸奔的，旧的不去新的不来，索性直接下单了一个新的，旧的留来折腾算了，还换啥屏幕总成；

因为之前有折腾过 Note4X-mido 的体验，SD625 性能还是太拉了，跑一些程序启动都慢，这次我特意去对比了 Raspberry Pi 4B 的BCM2711，宏观看起来，SD835领先的，此时我脑子里的想法如汩汩清泉涌流……

## 使用到的软件

+ Termux - https://github.com/termux/termux-app)
+ Termux:Boot - (https://github.com/termux/termux-boot)
+ BusyBox - https://github.com/meefik/busybox/releases 
+ Linux Deploy - https://github.com/meefik/linuxdeploy/releases
+ Genymobile/scrcpy - https://github.com/Genymobile/scrcpy

## 使用 Termux 终端

Termux 的强大之处就不用我多说，不仅仅是一个终端，而且还可以跟 Tasker 以及Termux:API 联动实现丰富的功能，轻松实现普通的服务器做不到的一些功能；

### 1. 更换国内软件源

```bash
sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/termux-packages-24 stable main@' $PREFIX/etc/apt/sources.list

sed -i 's@^\(deb.*games stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/game-packages-24 games stable@' $PREFIX/etc/apt/sources.list.d/game.list

sed -i 's@^\(deb.*science stable\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/science-packages-24 science stable@' $PREFIX/etc/apt/sources.list.d/science.list

pkg update
```

### 2. 安装基本工具

```bash
pkg update
pkg install vim curl wget git tree openssh -y
```

#### 其他软件

默认情况下，Termux 的软件源只提供较新的版本，例如 Python，可以在[Termux-pod/termux-pod](https://github.com/Termux-pod/termux-pod)找到旧版本的备份，下载下来后，使用命令安装：

```bash
dpkg -i /path/filename.deb
```

### 3. 使用 SSH 连接手机

SSH 连接通常有两种，一是通过密码认证连接，二是通过公私钥连接，不过公私钥太麻烦，这里用密码认证；手机上面低的端口有安全限制，默认的 sshd 默认的服务端口号为 8022：

```bash
passwd 		# 设置新密码
sshd		# 开启ssh服务
pkill sshd	# 停止ssh服务
```

> Termux 下的 SSH 默认配置文件的路径为 `$PREFIX/etc/ssh/sshd_config`

### 4. 修改连接问候语

连接上系统时的问候语是一个文本文件，保存在`$PREFIX/etc/motd`，你可以自定义编辑，这显然不够炫酷，我们需要极客一点；首先，安装显示设备信息的工具：

```bash
pkg install neofetch
```

编辑原来的`$PREFIX/etc/motd`作为一个脚本：

```bash
#!$PREFIX/bin/bash
neofetch
```

并移动到`profile.d`目录即可：

```bash
mv motd profile.d/motd.sh
```

### 5. 开机自启动

在 `~/.termux/` 目录创建 `boot` 目录，然后将开机要执行的脚本放在 `~/.termux/boot/` 目录；

Termux:Boot 提供了启动 SSH 服务并防止设备进入睡眠的 shell 代码：

```shell
#!/data/data/com.termux/files/usr/bin/sh
termux-wake-lock
sshd
```

## 使用 Linux Deploy 容器

毕竟 Termux 提供的环境不是完全完整的 Linux，很多包在安装或者编译的时候会冒出各种各样的问题，所以还是利用 chroot 搭建一个 Ubuntu；

### 1. 安装 BusyBox

可以使用软件安装，但是我的手机貌似解锁不了 System 分区，权宜之计是使用 Magisk Module；

通往罗马的路不止一条，不过要注意**安装的位置**，下一步用得到；

 ### 2. 软件配置

+ 右侧 Drawer  => 设置，打开在应用一栏中将`锁定WI-FI`和`CPU唤醒`勾选；
+ 环境一栏中设置`PATH变量`为 BusyBox 的安装路径，点击更新环境；
+ 调试一栏中，勾选`调试模式`，便于查看安装与运行中的各种信息；

### 3. 安装配置

进行安装的时候，选择好发行版和架构后，可继而选择是源地址安装还是包安装，源地址安装可以选择国内的各大镜像站，以加快安装速度，这里以中科大做参考：

+ http://mirrors.ustc.edu.cn/centos-altarch/
+ http://mirrors.ustc.edu.cn/ubuntu-ports/
+ http://mirrors.ustc.edu.cn/kali/
+ http://mirrors.ustc.edu.cn/archlinuxarm/

> 注意，要使用 http 协议的链接，否则会报错；

如果遇到像我一样的情况，类似于这样的报错信息：

```bash
W: Failure trying to run:  dpkg --force-depends --install /var/cache/apt/archives/libc6_2.27-3ubuntu1_arm64.deb
[01:53:52] 
W: See //debootstrap/debootstrap.log for details (possibly the package /var/cache/apt/archives/libc6_2.27-3ubuntu1_arm64.deb is at fault)
[01:53:52] <<< deploy
```

据我估计是**安卓版本（内核版本）过高**导致的，可以选择为手机刷写低版本系统或简单点修改内核，也可以使用包安装的方式，App 内的包仓库需要**付费**，我备份了几个常用的，在我网盘：[OneDrive Index - Images](https://yun.mahoo12138.cn/💽Images);

下载系统包到手机后，在源地址中指定包**全局路径**，安装即可；

大部分的设置项都很好理解，除了**初始化**，启动 linux 时开启的服务，此处选 sysv：

- sysv：Ubuntu 支持，服务用 `update-rc.d` 管理；初始化级别为默认为 3；初始用户默认为 root。
- run-parts：旧版本 Centos 支持，在启动 linux 时执行指定的脚本；初始化路径：要执行的脚本的路径；初始用户：要执行脚本的用户。

安装方式，推荐使用目录安装，便于可视化操作，例如`/data/ubuntu`， GNU/linux 需要安装在一个 ext4 或 f2fs 分区的一个目录里；

镜像文件模式，安装到 fat32 的 sd卡 中可使用该选项，经常折腾手机可选择此选项，刷机格Data都不会受影响；

### 4. 修改问候语

类似于 Termux 中的修改，Ubuntu 还多了目录`/etc/update-motd.d/`中的脚本，一个是打印通用的 “欢迎” 横幅。下一个打印 3 个链接，显示在哪里可以找到操作系统的帮助。另一个计算并显示本地系统包可以更新的数量。另一个脚本告诉你是否需要重新启动等等；最好全部删除；

当然，这个方法看起来就相当的不优雅，最好的方式是如下操作打开配置文件，并`ENABLED=0`，关闭它：

```bash
vi /etc/default/motd-news
```

### 5. 更换软件源

这个没啥好说的，个人倾向于中科大的，稳！

```bash
deb http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic main multiverse restricted universe
deb http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-backports main multiverse restricted universe
deb http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-proposed main multiverse restricted universe
deb http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-security main multiverse restricted universe
deb http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-updates main multiverse restricted universe
deb-src http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic main multiverse restricted universe
deb-src http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-backports main multiverse restricted universe
deb-src http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-proposed main multiverse restricted universe
deb-src http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-security main multiverse restricted universe
deb-src http://mirrors.ustc.edu.cn/ubuntu-ports/ bionic-updates main multiverse restricted universe
```

### 6. 修复错误

>Error: mesg: ttyname failed: inappropriate ioctl for device

这个错误，其实不影响系统的正常运行，但是吧，看着碍眼，解决一下也不难；

Ubuntu 知道不是每个人都会在根账户上进行图形化登录，所以在默认的.profile文件中，它被设置为在这种情况下产生一个错误。正如你所看到的，在/root/.profile的最后有一行：

```bash
mesg n || true
```

在启动的过程中，并没有终端设备, 所以 `mesg n`命令会报错；

解决办法很简单粗暴，直接改为：

```bash
tty -s && mesg n || true
```

也就是只有当终端设备在线时，`mesg -n`才会执行，也就避过这个错误；

### 7. 安装较新版本

由于 Linux Deploy 没有内置最新的一些发行版，但是我们可以在其安装的脚本中进行更改，这里以 Ubuntu 为例：

打开`/data/user/ru.meefik.linuxdeploy/files/include/bootstrap/ubuntu/deploy.sh`，将脚本内的`${SUITE}`修改为你想要的版本代号，若报错`/bootstrap/debian/debootstrap/scripts/`内没有版本代号的脚本，则任取一个重命名即可，亲测能成功安装！

另一种方法是，安装升级工具进行升级，还能做一些简单配置：

```bash
apt install update-manager-core
vim /etc/update-manager/release-upgrades	# 配置文件
```

之后即可更新全部套件至最新版：

```bash
sudo apt update && sudo apt upgrade
sudo do-release-upgrade
```

如果出现`authenticate 'focal.tar.gz' against 'focal.tar.gz.gpg' Authentication failed`錯誤，先安装`gnupg`并执行以下指令:

```
sudo apt install gnupg gnupg1 gnupg2
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 871920D1991BC93C
sudo do-release-upgrade
```

不过这两种方法在高版本的内核上都搞不定，原因是一样的；

## 手机服务器充电策略

将手机用作服务器后，无用的安卓服务占据大量内存，可停止安卓服务并使用 crontab 定时任务控制充电：

```shell
# 停止安卓服务：
unchroot /system/bin/stop
# 恢复安卓服务
unchroot /system/bin/start
```

编辑充电控制脚本：

```bash
#!/bin/sh
# Android chroot charge limit controller
# author: zixijian
# website: zixijian.github.io
# co-author: Ethereal
# useage: crontab -e
#         */5 * * * * /usr/chargec.sh

# define
charge=`cat /sys/class/power_supply/battery/status`
capacity=`cat /sys/class/power_supply/battery/capacity`

echo Now battery is: $charge.
echo Now battery level is: $capacity.

# check max limit
if [ $capacity -ge 85 ]; then
# stop
  echo 0 > /sys/class/power_supply/battery/charging_enabled
fi

# check min limit
if [ $capacity -le 35 ]; then
# start
  echo 1 > /sys/class/power_supply/battery/charging_enabled
fi
```

## 常用命令

重启： `unchroot reboot -f`；

刷新ABD：

```bash
su
setprop service.adb.tcp.port 5555
stop adbd
start adbd
```

查看手机温度： `/sys/class/thermal/thermal_zone[]`

控制震动马达：

```bash
$ echo -n 200 >/sys/class/leds/vibrator/duration
$ echo -n 1 >/sys/class/leds/vibrator/activate
```

调节亮度：

```bash
$ chmod 777 /sys/class/leds/lcd-backlight/max_brightness
$ echo 1 > /sys/class/leds/lcd-backlight/max_brightness
$ chmod 444 /sys/class/leds/lcd-backlight/max_brightness
```

清理缓存，可对宝塔的内存释放脚本进行 buff 叠加，位于`/www/server/panel/script/rememory.sh`：

```bash
$ sync
# 释放页缓存(page cache)
$ echo 1 > /proc/sys/vm/drop_caches
# 释放目录和索引节点缓存(inode and dentry cache)
$ echo 2 > /proc/sys/vm/drop_caches
# 同时释放
$ echo 3 > /proc/sys/vm/drop_caches
# 内存压缩, 尽可能地提供连续内存块
$ echo 1 > /proc/sys/vm/compact_memory
```

打开设置：`adb shell am start -a android.intent.action.MAIN -n com.android.settings/.Settings`

## 手机常见问题

1. Wi-Fi 进入节能模式，表现为不能全速传输，延时高：

   ```bash
   $ sudo apt install iw
   # 查询节能状态
   $ unchroot iw dev wlan0 get power_save
   # 关闭节能模式
   $ unchroot iw wlan0 set power_save off 
   ```

2. 保持 cpu 唤醒不起作用，表现为操作卡顿、联网卡顿，使用 wakelock 锁，shell 中输入：

   ```bash
   # 获取 su 权限
   $ su
   # 保持 cpu 唤醒:  随便写入一个变量
   $ echo lock_me > /sys/power/wake_lock
   # 解除 wakelock 锁：
   $ echo lock_me > /sys/power/wake_unlock
   #注：容器内使用时命令前面加 unchroot，对 /sys 分区操作时不需要（容器已经挂载了 /sys 分区）。
   ```

3. wifi 

   ```shell
   $ unchroot /vendor/bin/hw/wpa_supplicant -d -B –iwlan0 –Dnl80211 -c/data/misc/wifi/wpa_supplicant.conf
   -C/data/misc/wifi/sockets
   # Android 9.0+ 为/vendor/etc/wifi/wpa_supplicant.conf和/data/vendor/wifi/wpa/sockets
   ```

   

## 软件常见问题

### Mysql 报错 The server quit without updating PID file

查看日志，发现是对于 socket 的权限，原因是Android使用了特制的linux内核，它启用了`CONFIG_ANDROID_PARANOID_NETWORK`配置，在这种情况下，只有属于几个硬编码的群组身份的系统用户才能访问网络：

```bash
$ groupadd -g 3001 aid_bt
$ groupadd -g 3002 aid_bt_net
$ groupadd -g 3003 aid_inet
$ groupadd -g 3004 aid_net_raw
$ groupadd -g 3005 aid_admin
```

将 mysql 用户添加入组即可，最后也把 root 加进去（一般已经在特权用户中添加了）：

```bash
$ usermod -a -G aid_inet,aid_net_raw mysql
$ usermod -a -G aid_bt,aid_bt_net,aid_inet,aid_net_raw,aid_admin root
```

同理，其实安装 Redis 时也会出现这种类似的错误，也把 redis 加进入就行了； 

```bash
# 确保启用 SSH 代理
eval "$(ssh-agent -s)"
# 启用 SSH 代理
ssh-add ~/.ssh/id_rsa
```

### vscode 连接不上

+ 删除客户端 C:\Users\你的用户名\.ssh\known_hosts
