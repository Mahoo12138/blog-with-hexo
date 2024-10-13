---
title: SakuraFrp + WireGuard 组网实现内网穿透
date: 2024-06-10 15:37:30
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo_images/cover/git.png
category:
 - 技术教程
tags:
 - 内网穿透
---

自从之前买了香橙派 5 pro 搭建了自己的小服务器后，一直是使用之前用来搭建的 Minecraft 服务器的

[Sakura Frp](https://www.natfrp.com/) 进行的公益免费的内网穿透，由于秉持着能不花一分钱就不花一分钱的原则，一直坚守着两条隧道，穿透着六个常用网站，一直挺稳定的，靠着每天签到获得的流量，每个月是完全用不完的，这点非常良心！

然而随着不断的有新的容器和服务的加入，而穿透的数量是有限的，这就很尴尬了，我不得不围绕着这两条隧道来想办法。

最开始的思路是，通过 nginx 的子域转发，例如有 A，B，C 三个网站，只有一个 https://domain.com 这一个 443 端口的一个出口，将多个网站都放到同一个域名下去访问，如：

+ A：https://domain.com/a
+ B：https://domain.com/b
+ C：https://domain.com/c

这样下来，勉强能够实现，通过一个出口访问多个网站服务，但是操作较为繁琐，要针对不同应用程序去做代理转发，而且存在一些应用，前后端分离导致的需要多重转发，复杂度一下就上去了，需要经常跟 nginx 配置文件斗智斗勇，不能一劳永逸，不符合我的工程哲学，才尝试了一段时间后，都放弃了。

突然有一天，我想到，没必要所有的服务都要放到公网上啊，私人的服务只需要我能够访问到就可以了，那这样完全可以通过一个隧道，搭建 VPN 进行全链路的转发，说干就干，我迅速定位到了颇受好评的  [WireGuard](https://www.wireguard.com/) ，以及 [wg-easy](https://github.com/wg-easy/wg-easy)  前者是安全且高效的隧道技术，后者是前者 + 管理 UI，可以直接 docker 中运行。

接下来，是整个过程一个简单的记录。

+ `Sakura Frp`：新建一条 UDP 隧道，端口随机都行，然后记下隧道的域名；
+ `wg-easy`：`WG_HOST` 设置为隧道域名，`WG_PORT`为隧道分配的端口；

然后，就搞定了，没错，就是这么简单，之后在`wg-easy` 新建对应端的客户端即可。



