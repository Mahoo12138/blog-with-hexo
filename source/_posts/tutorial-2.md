---
title: 利用Cloud Studio为博客搭建免费图床
date: 2019-10-21 16:00:43
mathjax: true
tags: 
- 免费图床
categories:
- 技术教程
---

Cloud Studio 已更新，教程失效

搭建的静态博客利用Markdown码字，必然少不了图片，所以需要另外的图床作为辅助，网上有很多优秀的图床程序，不过大多都功能复杂，而且图片放在别人那，让我总感觉不是很放心（万一哪天就跑路了呢？），而自己来搭建图床程序的话，需要自备服务器或者是虚拟主机，这个可是要付费的，毕竟自己的博客都是利用免费的Pages服务搭建的，而再为了托管图片去付费就有些得不偿失了，所以我想了半天，折腾了半天，可以利用腾讯云旗下的Cloud Studio的WebIDE及代码托管平台来搭建图床，步骤如下：

## 使用Git创建本地存储库

搭建的图床是利用Git及远程存储库的模式进行传输和存储的，我主要是在Windows平台上使用，而Win10是没有预装Git的，所以首先需要安装[Git](https://git-scm.com/)；

+ 在你想要存储图片的路径，创建一个文件夹，例如我的`D:\Mahoo\Pictures\Blog`;

+ 创建本地存储库（以`Blog`目录为例）

  在`Blog`目录下，右击选择`Git Bash`

  ```shell
  git init
  ```

在此文件夹内，可创建多个文件夹存储你的不同图片。

## 使用Cloud Studio创建远程存储库

+ 创建账号

  腾讯云开发者平台：[ https://dev.tencent.com/ ]( https://dev.tencent.com/ )

+ 新建一个项目

  ![新建项目](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/Tutorials/pic_cs/new.png)

  项目名称，地址自定义，是否公开勾选。

  ![新建项目](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/Tutorials/pic_cs/new1.png)

进入新建项目界面，打开右侧`代码 ->代码浏览 `，复制该项目的HTTPS地址。

![项目界面](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/Tutorials/pic_cs/new2.png)



## 连接本地存储库和远程存储库

当你往本地存储库添加图片后，使用指令：

```shell
git add .
git commit -m "自定义内容"
git remote add origin 刚才复制的的HTTPS地址
git push origin master
```

这样的话，图片已经同步到远程存储库了，当然你对`git`相当熟悉的话，以上全是废话，此教程仅针对刚搭建博客的小白。

## 开启Pages服务绑定域名

打开此界面，按提示绑定域名即可

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/Tutorials/pic_cs/pages.png)

## 通过直链引用图片

这里我举例来说明比较好懂，在写博客的过程中，当你引入一张图片时，例如是这样的：

```shell
D:\Mahoo\Pictures\Blog\test.png
```

这时该图片的本地地址，在已经开启Pages服务并且绑定域名的情况下，你绑定的域名直接指向了git本地存储库的根目录，也就是`Blog`，所以则可以将本地地址改成网络直链：

```shell
http://你的域名/test.png
```

你可以通过文本编辑器的替换功能，也可以用代码：

```python
import re

f = open('D:/Mahoo/BLog/source/_posts/Cloud_studio.md', 'r', encoding="utf-8")
string = f.read()
f.close()
key = r'D:\\Mahoo\\Pictures\\Blog\\hexo_images\\Tutorials\\pic_cs\\'
new = 'https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/Tutorials/pic_cs/'
# result = re.compile(key).findall(string)
# print(result)
string = re.sub(key, new, string)
# print(string)
f = open('D:/Mahoo/BLog/source/_posts/Cloud_studio.md', 'w', encoding="utf-8")
f.write(string)
f.close()
```

一个文件的链接替换当然是编辑器的替换方便的多，但如果需要替换域名，对所有博客文章进行替换时，文本编辑器就显得有些力不从心了，这里也贴出来我的代码：

```python
for files in os.walk('D:/Mahoo/BLog/source/_posts/'):
    print(files[2][0])


for i in range(len(files[2])):
    f = open('D:/Mahoo/BLog/source/_posts/' + files[2][i], 'r', encoding="utf-8")
    string = f.read()
    f.close()
    key = 'http://airlife.club/'		#旧域名
    new = 'https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/'		#新域名
    string = re.sub(key, new, string)
    f = open('D:/Mahoo/BLog/source/_posts/' + files[2][i], 'w', encoding="utf-8")
    f.write(string)
    f.close()
```



