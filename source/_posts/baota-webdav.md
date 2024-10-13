---
title: 宝塔 nginx 配置 webdav 服务器
date: 2023-03-01 08:18:22
author: Mahoo12138
tags: 
- 宝塔
- Webdav
categories:
- 技术教程
---

## 前言

近年来，我一直在做一件事，就是将自己的数据，脱离那些商业公司，使用自己部署的备份，最次也是使用国外大厂的备份，国内厂商我已经对其毫无兴趣了，目前图片之类是备份在 **咕噜咕噜** 家的 Drive ，而其他 app 应用产生的数据，如我的心情日记，账本，文字笔记之类的都在巨硬的 Onedrive ，之前都是使用国内坚果云的 Webdav 服务进行同步，而我也已经准备抛弃他了，转向自己搭建 webdav 服务器，于是有了这篇文章。

## 安装

由于我的服务器（Mido 旧手机搭建）使用的是宝塔的一揽子服务，在安装时我选择的是 nginx ，自然而然地，`WebDAV`也是基于`Nginx`搭建的，Webdav 服务需要`Nginx`的`http_dav_module`模块支持；

可以使用使用指令：`nginx -V` 查询已安装的 nginx 是否已经内置了`http_dav_module`模块，如果出现了如下字眼：

```text
--add-module=/www/server/nginx/src/nginx-dav-ext-module
```

说明已经内置，无需额外安装；如果没有，则重新安装`Nginx`，且需要添加自定义模块：

```
模块名称：http_dav_module
模块描述：webdev
模块参数：--with-http_dav_module --add-module=/root/nginx-dav-ext-module
前置脚本：git clone https://github.com/arut/nginx-dav-ext-module.git /root/nginx-dav-ext-module
```

## 搭建

nginx 配置依赖好后，就可以开始搭建服务了。在【网站】一栏中，新建一个网站，添加时`PHP版本`选择`纯静态`，`WebDAV`并不需要任何`PHP`支持；

最后需要修改站点的`Nginx`配置文件，可以直接在【配置文件】中配置，也可以在反向代理中，个人由于多个服务都走的同一个域名，也就是这个新建的网站，只是用来代理服务，所以统一是在反向代理进行配置：

```nginx
location /dav/
{
    alias /root/workbench/data/dav/;			# Webdav 服务根目录
    autoindex on;
    autoindex_localtime on;

    set $dest $http_destination;
    if (-d $request_filename) {                   # 对目录请求、对URI自动添加"/"
        rewrite ^(.*[^/])$ $1/;
        set $dest $dest/;
    }

    # if ($request_method ~ (MOVE|COPY)) { # 对MOVE|COPY方法强制添加Destination请求头
    #     add_header  Destination: $dest;
    # }

    if ($request_method ~ MKCOL) {
        rewrite ^(.*[^/])$ $1/ break;
    }
    dav_methods             PUT DELETE MKCOL COPY MOVE;       # DAV支持的请求方法
    dav_ext_methods         PROPFIND OPTIONS;     			 # DAV扩展支持的请求方法
    # dav_ext_lock            zone=davlock;                   # DAV扩展锁绑定的内存区域
    client_max_body_size    0M;
    create_full_put_path    on;                               # 启用创建目录支持
    dav_access              user:rw group:r all:r;            # 设置创建的文件及目录的访问权限

    auth_basic              "Authorized Users WebDAV";
    auth_basic_user_file    /root/workbench/config/.passwords.list;
}
```

最后两个配置项，可以提一提，`auth_basic` 开启使用“HTTP基本认证”（HTTP Basic Authentication）协议的用户名密码验证。`auth_basic_user_file`：指定保存用户名密码的文件，可使用 openssl 生成密码：

```bash
openssl passwd 12345
```

然后以如下格式存储：

```
name:password
```

## 小插曲

搭建好 Webdav 后，在安卓客户端中，部分 app 访问会报错 405 not allowed，很离谱，查询了网上的资料后，从相关 [issue ](https://github.com/PhilippC/keepass2android/issues/747)中了解到，是安卓开发中一个 http 请求库 okhttp 对 http2 兼容存在问题，建议使用 http1.1 访问，然而大部分的 app 都无法配置请求方式，只能从本地服务器入手了，需要禁用 nginx 的 http2 模式，当然禁用某一个，例如这个搭建 Webdav 的网站是不行的，需要所有网站都关闭 http2，nginx 才完全关闭 http2。



