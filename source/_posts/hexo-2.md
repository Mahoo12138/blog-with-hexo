---
title: Hexo个人博客SEO优化指南
date: 2019-11-06 22:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
- SEO
categories:
- 技术教程
---

## 安装sitemap

1. Windows环境下直接在博客根目录打开`Git Bash`，运行命令：

  ```shell
    npm install hexo-generator-sitemap --save 
    # sitemap.xml	提交给谷歌搜素引擎
    npm install hexo-generator-baidu-sitemap --save 
    # baidusitemap.xml	提交百度搜索引擎
  ```

2.  在站点配置文件`_config.yml`中添加以下代码：

   ```
   Plugins:
   - hexo-generator-baidu-sitemap
   - hexo-generator-sitemap
   
   baidusitemap:
       path: baidusitemap.xml
   sitemap:
       path: sitemap.xml
   ```

3. 修改站点配置文件`_config.yml`，添加`url`，其次就是Hexo文章默认的链接是`:year/:month/:day/:title/`这样的链接对SEO十分不友好，所以应改成`title.html`格式：

   ```shell
   # URL
   ## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
   url: http://mahoo12138.github.io
   permalink: :title.html
   permalink_defaults:
   ```

4. Hexo编译，提交站长平台

   `Hexo g && hexo d`后会在/public目录下生成`sitemap.xml`和`baidusitemap.xml`，这就是站点地图。 之后就可以提交到各大站长平台了。

## 添加关键词

### 站点关键词

 在博客根目录下找到`_config.yml`文件，在所示地方添加`keywords: 关键字1,关键字2,关键字3…`，采用`英文逗号`隔开，注意`keywords`与`关键词`之间的`空格`。 

```
title: Mahoo Blog
subtitle: 记录技术成长的每一瞬间
description: 一切的恐惧都来源于无知！
keywords: 老黄博客,Mahoo Blog,Stm32,Mahoo,Mahoo12138
author: Mahoo Huang
language: zh-CN
```

### 文章关键词

 打开主题路径内的`head.ejs`文件，不同主题所在路径和文件都可能不同，Next主题是 `head.swig`，我的主题是`head.ejs`，添加如下代码：

```html
# next theme   head.swig
{% if page.keywords %}
  <meta name="keywords" content="{{ page.keywords }}" />
{% elif page.tags and page.tags.length %}
  <meta name="keywords" content="{% for tag in page.tags %}{{ tag.name }},{% endfor %}" />
{% elif theme.keywords %}
  <meta name="keywords" content="{{ theme.keywords }}" />
{% endif %}

# matery theme	head.ejs
 <% if (page.keywords){ %>
    <meta name="keywords" content="<%- page.keywords %>" />
 <% } else if (theme.keywords){ %>
    <meta name="keywords" content="<%- theme.keywords %>" />
```

添加上述代码后，主要是检测文章内是否有关键词，之后还要在`\scaffolds\post.md`中 添加：

```
keywords: 
```

 就可以在新写的文件里添加keyword，格式为[keyword1,keyword2,keyword3] 。

## 配置robots.txt

>  **robots.txt**（统一小写）是一种存放于[网站](https://zh.wikipedia.org/wiki/网站)根目录下的[ASCII](https://zh.wikipedia.org/wiki/ASCII)编码的[文本文件](https://zh.wikipedia.org/wiki/文本文件)，它通常告诉网络[搜索引擎](https://zh.wikipedia.org/wiki/搜索引擎)的漫游器（又称[网络蜘蛛](https://zh.wikipedia.org/wiki/网络蜘蛛)），此网站中的哪些内容是不应被搜索引擎的漫游器获取的，哪些是可以被漫游器获取的。因为一些系统中的URL是大小写敏感的，所以robots.txt的文件名应统一为小写。robots.txt应放置于网站的根目录下。如果想单独定义搜索引擎的漫游器访问子目录时的行为，那么可以将自定的设置合并到根目录下的robots.txt，或者使用robots[元数据](https://zh.wikipedia.org/wiki/元数据)（Metadata，又称元资料） 。

简单来说，它就是网站和爬虫之间的协议，规定了哪些文件可以访问，哪些文件禁止访问。

在博客根目录下的`source`新建`robots.txt`写入：

```
User-agent: *
Allow: /
Allow: /home/
Allow: /archives/
Allow: /about/

Disallow: /vendors/
Disallow: /js/
Disallow: /css/
Disallow: /fonts/
Disallow: /vendors/
Sitemap: http://lansus.coding.me/sitemap.xml
Sitemap: http://lansus.coding.me/baidusitemap.xml
```

 在编译后这个文件会出现在`blog/public`中 ，控制的就是该目录下的文件。