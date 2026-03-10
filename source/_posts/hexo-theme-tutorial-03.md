---
title: Hexo 主题开发系列教程（三）：主题结构与模板系统
date: 2025-11-24 22:42:23
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---

## 前言

在前两章中，我们学习了：
- [第一章](./hexo-theme-tutorial-01.md)：Hexo 的核心概念（事件、变量、路由、Box、渲染、文章、模板）
- [第二章](./hexo-theme-tutorial-02-part1.md)：Hexo 的扩展系统（Console、Deployer、Filter、Generator、Helper、Injector 等）

现在，是时候将理论付诸实践了。本章我们将学习如何构建一个完整的 Hexo 主题，包括：

- 🏗️ **主题目录结构** - 组织主题文件的最佳实践
- 📐 **Layout 布局系统** - 构建页面框架
- 🧩 **Partial 局部模板** - 模块化和复用
- 🎨 **样式组织** - CSS/SCSS 架构设计
- ⚡ **脚本管理** - JavaScript 的组织与优化
- 🔧 **配置系统** - 主题配置的设计
- 📱 **响应式设计** - 适配不同设备

本章将带你从零开始构建一个名为 **"Aurora"** 的现代化 Hexo 主题。

---

## 第一部分：主题目录结构设计

### 标准目录结构

一个完整的 Hexo 主题目录结构如下：

```
themes/aurora/
├── _config.yml              # 主题配置文件
├── languages/               # 国际化语言文件
│   ├── zh-CN.yml
│   ├── en.yml
│   └── ja.yml
├── layout/                  # 布局模板
│   ├── _partial/           # 局部模板
│   │   ├── head.ejs
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   ├── sidebar.ejs
│   │   ├── article.ejs
│   │   ├── comment.ejs
│   │   └── widget/         # 小部件
│   │       ├── category.ejs
│   │       ├── tag.ejs
│   │       ├── recent-posts.ejs
│   │       └── archive.ejs
│   ├── _widget/            # 独立小部件（可选）
│   ├── index.ejs           # 首页布局
│   ├── post.ejs            # 文章页布局
│   ├── page.ejs            # 独立页面布局
│   ├── archive.ejs         # 归档页布局
│   ├── category.ejs        # 分类页布局
│   ├── tag.ejs             # 标签页布局
│   └── layout.ejs          # 基础布局（所有页面的父模板）
├── source/                  # 静态资源
│   ├── css/                # 样式文件
│   │   ├── _variables.scss # 变量定义
│   │   ├── _mixins.scss    # Mixins
│   │   ├── _base.scss      # 基础样式
│   │   ├── _layout.scss    # 布局样式
│   │   ├── _components.scss# 组件样式
│   │   ├── _utilities.scss # 工具类
│   │   └── style.scss      # 主样式文件
│   ├── js/                 # JavaScript 文件
│   │   ├── utils.js        # 工具函数
│   │   ├── main.js         # 主脚本
│   │   ├── search.js       # 搜索功能
│   │   └── components/     # 组件脚本
│   │       ├── toc.js
│   │       ├── lazyload.js
│   │       └── theme-toggle.js
│   ├── images/             # 图片资源
│   │   ├── logo.svg
│   │   ├── avatar-default.png
│   │   └── icons/
│   └── fonts/              # 字体文件
├── scripts/                 # Hexo 扩展脚本
│   ├── helpers/            # Helper 函数
│   │   ├── format.js
│   │   └── components.js
│   ├── filters/            # Filter 函数
│   │   ├── post.js
│   │   └── assets.js
│   ├── tags/               # 自定义标签
│   │   ├── note.js
│   │   └── tabs.js
│   └── generators/         # 生成器
│       └── search.js
└── package.json            # 依赖管理（可选）
```

### 创建主题骨架

让我们开始创建主题的基本结构：

```bash
# 创建主题目录
cd themes
mkdir aurora
cd aurora

# 创建主要目录
mkdir -p layout/_partial/widget
mkdir -p source/{css,js/components,images/icons,fonts}
mkdir -p scripts/{helpers,filters,tags,generators}
mkdir -p languages

# 创建配置文件
touch _config.yml
```

### 主题配置文件设计

**themes/aurora/_config.yml**

```yaml
# ============================================
# Aurora 主题配置文件
# ============================================

# 站点基本信息
# --------------------------------------------
site:
  name: Aurora Theme
  subtitle: 一个现代化的 Hexo 主题
  description: 简洁、优雅、功能丰富
  keywords: hexo, theme, aurora, blog
  author: Your Name
  avatar: /images/avatar.jpg
  favicon: /images/favicon.ico

# 导航菜单
# --------------------------------------------
menu:
  home:
    name: 首页
    path: /
    icon: home
  archives:
    name: 归档
    path: /archives/
    icon: archive
  categories:
    name: 分类
    path: /categories/
    icon: folder
  tags:
    name: 标签
    path: /tags/
    icon: tag
  about:
    name: 关于
    path: /about/
    icon: user

# 社交链接
# --------------------------------------------
social:
  github: https://github.com/username
  twitter: https://twitter.com/username
  email: mailto:your@email.com
  rss: /atom.xml

# 外观设置
# --------------------------------------------
appearance:
  # 主题色
  theme_color: '#4dabf7'
  
  # 暗色模式
  dark_mode:
    enable: true
    default: auto  # auto, light, dark
    
  # 代码高亮
  code:
    theme: tomorrow-night
    line_numbers: true
    copy_button: true
    
  # 字体
  font:
    enable: true
    host: //fonts.googleapis.com
    family:
      sans_serif: 'Noto Sans SC, sans-serif'
      monospace: 'Fira Code, monospace'

# 侧边栏
# --------------------------------------------
sidebar:
  enable: true
  position: right  # left, right
  
  # 侧边栏小部件
  widgets:
    - profile      # 个人信息
    - toc         # 文章目录
    - recent      # 最近文章
    - categories  # 分类
    - tags        # 标签云
    - archive     # 归档

# 文章设置
# --------------------------------------------
post:
  # 元信息显示
  meta:
    date: true
    updated: true
    categories: true
    tags: true
    word_count: true
    reading_time: true
    
  # 文章封面
  cover:
    enable: true
    default: /images/default-cover.jpg
    
  # 版权信息
  copyright:
    enable: true
    license: CC BY-NC-SA 4.0
    
  # 相关文章
  related_posts:
    enable: true
    limit: 5
    
  # 打赏
  reward:
    enable: false
    comment: 如果觉得文章有帮助，可以请我喝杯咖啡
    methods:
      - name: 微信
        qrcode: /images/wechat-qr.jpg
      - name: 支付宝
        qrcode: /images/alipay-qr.jpg

# 评论系统
# --------------------------------------------
comments:
  enable: true
  provider: gitalk  # disqus, gitalk, valine, waline
  
  # Gitalk 配置
  gitalk:
    client_id: your_client_id
    client_secret: your_client_secret
    repo: blog-comments
    owner: username
    admin:
      - username
      
  # Disqus 配置
  disqus:
    shortname: your_shortname
    
  # Valine 配置
  valine:
    app_id: your_app_id
    app_key: your_app_key
    placeholder: 说点什么吧...
    avatar: mp
    page_size: 10

# 搜索功能
# --------------------------------------------
search:
  enable: true
  provider: local  # local, algolia
  
  # 本地搜索
  local:
    trigger: manual  # auto, manual
    top_n_per_article: 1
    
  # Algolia 搜索
  algolia:
    application_id: your_app_id
    api_key: your_api_key
    index_name: your_index_name

# 分析统计
# --------------------------------------------
analytics:
  enable: true
  
  # Google Analytics
  google_analytics:
    enable: false
    tracking_id: UA-XXXXXXXXX-X
    
  # 百度统计
  baidu_analytics:
    enable: false
    tracking_id: your_tracking_id
    
  # 站长验证
  site_verification:
    google: your_verification_code
    baidu: your_verification_code

# 性能优化
# --------------------------------------------
optimization:
  # 静态资源 CDN
  cdn:
    enable: false
    provider: jsdelivr  # jsdelivr, unpkg, custom
    
  # 图片懒加载
  lazyload:
    enable: true
    placeholder: /images/loading.svg
    
  # 预加载
  preload:
    enable: true
    
  # PWA
  pwa:
    enable: false
    manifest: /manifest.json
    
  # 压缩
  minify:
    html: true
    css: true
    js: true

# 高级功能
# --------------------------------------------
features:
  # 目录（TOC）
  toc:
    enable: true
    number: true
    max_depth: 3
    
  # 图片灯箱
  fancybox:
    enable: true
    
  # 数学公式
  mathjax:
    enable: false
    per_page: false
    
  # 图表
  mermaid:
    enable: false
    
  # 音乐播放器
  music:
    enable: false
    
  # 阅读进度条
  reading_progress:
    enable: true
    position: top  # top, bottom
    
  # 返回顶部
  back_to_top:
    enable: true
    show_percent: true

# 版权声明
# --------------------------------------------
footer:
  # 建站时间
  since: 2020
  
  # 自定义文本
  custom_text: |
    Powered by <a href="https://hexo.io" target="_blank">Hexo</a>
    Theme - <a href="https://github.com/username/hexo-theme-aurora" target="_blank">Aurora</a>
    
  # 备案信息
  icp:
    enable: false
    number: 京ICP备xxxxxx号
    url: https://beian.miit.gov.cn/
    
  # 页脚链接
  links:
    - name: 友情链接
      url: /links/
    - name: RSS
      url: /atom.xml

# 开发选项
# --------------------------------------------
development:
  # 调试模式
  debug: false
  
  # 显示性能指标
  performance: false
```

### 配置文件最佳实践

```javascript
// scripts/helpers/config.js
// 提供便捷的配置访问 Helper

hexo.extend.helper.register('theme_config', function(path, defaultValue) {
  // 使用点号分隔的路径访问嵌套配置
  const keys = path.split('.');
  let value = this.theme;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value !== undefined ? value : defaultValue;
});

// 使用示例：
// <%- theme_config('appearance.dark_mode.enable', false) %>
// <%- theme_config('comments.provider', 'none') %>
```

---

## 第二部分：Layout 布局系统

### 布局继承体系

Hexo 的布局系统采用继承模式，子布局可以扩展父布局：

```
layout.ejs (基础布局)
    ↓
    ├─ index.ejs (首页)
    ├─ post.ejs (文章页)
    ├─ page.ejs (独立页面)
    ├─ archive.ejs (归档页)
    ├─ category.ejs (分类页)
    └─ tag.ejs (标签页)
```

### 基础布局模板

**themes/aurora/layout/layout.ejs**

```ejs
<!DOCTYPE html>
<html lang="<%= config.language || 'zh-CN' %>">
<%- partial('_partial/head') %>
<body>
  <!-- 页面加载动画 -->
  <div id="loading" class="loading">
    <div class="spinner"></div>
  </div>
  
  <!-- 页面容器 -->
  <div id="container" class="container">
    <!-- 顶部导航 -->
    <%- partial('_partial/header') %>
    
    <!-- 主要内容区 -->
    <main id="main" class="main">
      <div class="content-wrapper">
        <!-- 这里是子布局的内容插入点 -->
        <%- body %>
      </div>
    </main>
    
    <!-- 侧边栏 -->
    <% if (theme_config('sidebar.enable', true)) { %>
      <%- partial('_partial/sidebar') %>
    <% } %>
    
    <!-- 底部 -->
    <%- partial('_partial/footer') %>
  </div>
  
  <!-- 返回顶部按钮 -->
  <% if (theme_config('features.back_to_top.enable', true)) { %>
    <%- partial('_partial/back-to-top') %>
  <% } %>
  
  <!-- 搜索框 -->
  <% if (theme_config('search.enable', false)) { %>
    <%- partial('_partial/search') %>
  <% } %>
  
  <!-- 脚本文件 -->
  <%- partial('_partial/scripts') %>
</body>
</html>
```

### 首页布局

**themes/aurora/layout/index.ejs**

```ejs
<!-- 首页轮播（可选） -->
<% if (theme_config('home.banner.enable', false)) { %>
  <section class="hero-banner">
    <%- partial('_partial/banner') %>
  </section>
<% } %>

<!-- 文章列表 -->
<section class="post-list">
  <div class="post-container">
    <% page.posts.each(function(post) { %>
      <%- partial('_partial/article', {
        post: post,
        index: true
      }) %>
    <% }) %>
  </div>
  
  <!-- 分页导航 -->
  <% if (page.total > 1) { %>
    <%- partial('_partial/pagination') %>
  <% } %>
</section>

<!-- 推荐文章（可选） -->
<% if (theme_config('home.featured.enable', false)) { %>
  <aside class="featured-posts">
    <%- partial('_partial/featured-posts') %>
  </aside>
<% } %>
```

### 文章页布局

**themes/aurora/layout/post.ejs**

```ejs
<article class="post-detail">
  <!-- 文章头部 -->
  <header class="post-header">
    <!-- 封面图 -->
    <% if (page.cover || theme_config('post.cover.enable', false)) { %>
      <div class="post-cover">
        <img 
          src="<%= page.cover || theme_config('post.cover.default') %>" 
          alt="<%= page.title %>"
          loading="lazy"
        >
      </div>
    <% } %>
    
    <!-- 标题和元信息 -->
    <div class="post-header-info">
      <h1 class="post-title"><%= page.title %></h1>
      
      <%- partial('_partial/post-meta', {
        post: page,
        class: 'post-meta'
      }) %>
    </div>
  </header>
  
  <!-- 文章内容 -->
  <div class="post-content-wrapper">
    <!-- 目录 -->
    <% if (theme_config('features.toc.enable', true) && page.toc !== false) { %>
      <aside class="post-toc">
        <%- partial('_partial/toc', {content: page.content}) %>
      </aside>
    <% } %>
    
    <!-- 正文 -->
    <div class="post-content markdown-body">
      <%- page.content %>
    </div>
  </div>
  
  <!-- 文章底部信息 -->
  <footer class="post-footer">
    <!-- 标签 -->
    <% if (page.tags && page.tags.length) { %>
      <div class="post-tags">
        <i class="icon-tag"></i>
        <% page.tags.each(function(tag) { %>
          <a href="<%- url_for(tag.path) %>" class="tag-link">
            <%= tag.name %>
          </a>
        <% }) %>
      </div>
    <% } %>
    
    <!-- 版权声明 -->
    <% if (theme_config('post.copyright.enable', false)) { %>
      <%- partial('_partial/copyright') %>
    <% } %>
    
    <!-- 分享按钮 -->
    <% if (theme_config('post.share.enable', false)) { %>
      <%- partial('_partial/share') %>
    <% } %>
    
    <!-- 打赏 -->
    <% if (theme_config('post.reward.enable', false)) { %>
      <%- partial('_partial/reward') %>
    <% } %>
  </footer>
  
  <!-- 文章导航（上一篇/下一篇） -->
  <%- partial('_partial/post-nav') %>
  
  <!-- 相关文章 -->
  <% if (theme_config('post.related_posts.enable', false)) { %>
    <%- partial('_partial/related-posts') %>
  <% } %>
  
  <!-- 评论 -->
  <% if (theme_config('comments.enable', false) && page.comments !== false) { %>
    <%- partial('_partial/comments') %>
  <% } %>
</article>
```

### 归档页布局

**themes/aurora/layout/archive.ejs**

```ejs
<div class="archive-page">
  <!-- 页面标题 -->
  <header class="page-header">
    <h1 class="page-title">
      <% if (page.year) { %>
        <%= page.year %>
        <% if (page.month) { %>
          - <%= page.month %>
        <% } %>
        年归档
      <% } else if (page.category) { %>
        分类：<%= page.category %>
      <% } else if (page.tag) { %>
        标签：<%= page.tag %>
      <% } else { %>
        归档
      <% } %>
    </h1>
    
    <% if (page.total) { %>
      <div class="page-subtitle">
        共 <%= page.total %> 篇文章
      </div>
    <% } %>
  </header>
  
  <!-- 归档统计 -->
  <% if (!page.year && !page.category && !page.tag) { %>
    <section class="archive-stats">
      <%- partial('_partial/archive-stats') %>
    </section>
  <% } %>
  
  <!-- 文章列表 -->
  <section class="archive-list">
    <%- partial('_partial/archive-list', {
      posts: page.posts
    }) %>
  </section>
  
  <!-- 分页 -->
  <% if (page.total > 1) { %>
    <%- partial('_partial/pagination') %>
  <% } %>
</div>
```

### 独立页面布局

**themes/aurora/layout/page.ejs**

```ejs
<article class="page-detail">
  <header class="page-header">
    <h1 class="page-title"><%= page.title %></h1>
    
    <% if (page.subtitle) { %>
      <p class="page-subtitle"><%= page.subtitle %></p>
    <% } %>
  </header>
  
  <div class="page-content markdown-body">
    <%- page.content %>
  </div>
  
  <!-- 评论（如果页面开启） -->
  <% if (theme_config('comments.enable', false) && page.comments !== false) { %>
    <section class="page-comments">
      <%- partial('_partial/comments') %>
    </section>
  <% } %>
</article>
```

---

## 第三部分：Partial 局部模板

### Head 头部模板

**themes/aurora/layout/_partial/head.ejs**

```ejs
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  
  <!-- SEO Meta -->
  <%- partial('_partial/seo') %>
  
  <!-- Favicon -->
  <% if (theme_config('site.favicon')) { %>
    <link rel="icon" href="<%- url_for(theme_config('site.favicon')) %>">
  <% } %>
  
  <!-- 主题色 -->
  <meta name="theme-color" content="<%= theme_config('appearance.theme_color', '#4dabf7') %>">
  
  <!-- 预加载关键资源 -->
  <% if (theme_config('optimization.preload.enable', false)) { %>
    <link rel="preload" href="<%- url_for('/css/style.css') %>" as="style">
    <link rel="preload" href="<%- url_for('/js/main.js') %>" as="script">
  <% } %>
  
  <!-- 样式文件 -->
  <%- css('css/style') %>
  
  <!-- 自定义 CSS -->
  <% if (theme_config('custom.css')) { %>
    <style><%- theme_config('custom.css') %></style>
  <% } %>
  
  <!-- 字体 -->
  <% if (theme_config('appearance.font.enable', false)) { %>
    <link rel="preconnect" href="<%= theme_config('appearance.font.host') %>">
    <link href="<%= theme_config('appearance.font.host') %>/css2?family=<%= theme_config('appearance.font.family.sans_serif') %>&display=swap" rel="stylesheet">
  <% } %>
  
  <!-- 暗色模式初始化脚本（避免闪烁） -->
  <% if (theme_config('appearance.dark_mode.enable', false)) { %>
    <script>
      (function() {
        const theme = localStorage.getItem('theme') || '<%= theme_config('appearance.dark_mode.default', 'auto') %>';
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      })();
    </script>
  <% } %>
</head>
```

### SEO 优化模板

**themes/aurora/layout/_partial/seo.ejs**

```ejs
<!-- 标题 -->
<% 
  let pageTitle = page.title || config.title;
  if (is_archive()) {
    pageTitle = '归档';
    if (page.year) pageTitle += ' - ' + page.year;
    if (page.month) pageTitle += '/' + page.month;
  } else if (is_category()) {
    pageTitle = '分类：' + page.category;
  } else if (is_tag()) {
    pageTitle = '标签：' + page.tag;
  }
  if (page.current > 1) {
    pageTitle += ' - 第' + page.current + '页';
  }
%>
<title><%= pageTitle %><% if (!is_home() && config.title) { %> - <%= config.title %><% } %></title>

<!-- 描述 -->
<%
  let description = page.description || page.excerpt || page.content;
  if (description) {
    description = strip_html(description).substring(0, 200)
      .trim().replace(/\s+/g, ' ');
  } else {
    description = config.description;
  }
%>
<meta name="description" content="<%= description %>">

<!-- 关键词 -->
<%
  let keywords = [];
  if (page.keywords) {
    keywords = page.keywords;
  } else if (page.tags && page.tags.length) {
    keywords = page.tags.map(tag => tag.name);
  } else if (config.keywords) {
    keywords = config.keywords;
  }
%>
<% if (keywords.length) { %>
  <meta name="keywords" content="<%= Array.isArray(keywords) ? keywords.join(',') : keywords %>">
<% } %>

<!-- 作者 -->
<meta name="author" content="<%= page.author || config.author || theme_config('site.author') %>">

<!-- Open Graph -->
<meta property="og:type" content="<%= is_post() ? 'article' : 'website' %>">
<meta property="og:title" content="<%= pageTitle %>">
<meta property="og:url" content="<%= url %>">
<meta property="og:site_name" content="<%= config.title %>">
<meta property="og:description" content="<%= description %>">
<meta property="og:locale" content="<%= config.language.replace('-', '_') %>">

<!-- 文章专属 -->
<% if (is_post()) { %>
  <meta property="article:published_time" content="<%= page.date.toISOString() %>">
  <meta property="article:modified_time" content="<%= page.updated.toISOString() %>">
  <% if (page.cover) { %>
    <meta property="og:image" content="<%= url_for(page.cover) %>">
  <% } %>
  <% if (page.tags && page.tags.length) { %>
    <% page.tags.each(tag => { %>
      <meta property="article:tag" content="<%= tag.name %>">
    <% }) %>
  <% } %>
<% } %>

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<%= pageTitle %>">
<meta name="twitter:description" content="<%= description %>">
<% if (config.twitter) { %>
  <meta name="twitter:creator" content="@<%= config.twitter %>">
<% } %>
<% if (is_post() && page.cover) { %>
  <meta name="twitter:image" content="<%= url_for(page.cover) %>">
<% } %>

<!-- Canonical URL -->
<link rel="canonical" href="<%= url %>">

<!-- Feed -->
<% if (config.feed && config.feed.path) { %>
  <link rel="alternate" href="<%= url_for(config.feed.path) %>" title="<%= config.title %>" type="application/atom+xml">
<% } %>
```

### Header 顶部导航

**themes/aurora/layout/_partial/header.ejs**

```ejs
<header class="site-header" id="site-header">
  <div class="header-container">
    <!-- Logo 和站点标题 -->
    <div class="site-branding">
      <a href="<%= url_for('/') %>" class="site-logo-link">
        <% if (theme_config('site.logo')) { %>
          <img src="<%- url_for(theme_config('site.logo')) %>" alt="<%= config.title %>" class="site-logo">
        <% } %>
        <span class="site-title"><%= config.title %></span>
      </a>
      
      <% if (config.subtitle) { %>
        <p class="site-subtitle"><%= config.subtitle %></p>
      <% } %>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="site-nav" id="site-nav">
      <ul class="nav-menu">
        <% 
          const menu = theme_config('menu', {});
          Object.keys(menu).forEach(key => {
            const item = menu[key];
            const isActive = is_current(item.path);
        %>
          <li class="nav-item <%= isActive ? 'active' : '' %>">
            <a href="<%- url_for(item.path) %>" class="nav-link">
              <% if (item.icon) { %>
                <i class="icon-<%= item.icon %>"></i>
              <% } %>
              <span><%= item.name %></span>
            </a>
          </li>
        <% }) %>
      </ul>
    </nav>
    
    <!-- 右侧工具栏 -->
    <div class="header-tools">
      <!-- 搜索按钮 -->
      <% if (theme_config('search.enable', false)) { %>
        <button class="tool-button search-button" id="search-button" aria-label="搜索">
          <i class="icon-search"></i>
        </button>
      <% } %>
      
      <!-- 暗色模式切换 -->
      <% if (theme_config('appearance.dark_mode.enable', false)) { %>
        <button class="tool-button theme-toggle" id="theme-toggle" aria-label="切换主题">
          <i class="icon-sun sun-icon"></i>
          <i class="icon-moon moon-icon"></i>
        </button>
      <% } %>
      
      <!-- 移动端菜单按钮 -->
      <button class="tool-button menu-toggle" id="menu-toggle" aria-label="菜单">
        <span class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>
  </div>
  
  <!-- 阅读进度条 -->
  <% if (is_post() && theme_config('features.reading_progress.enable', false)) { %>
    <div class="reading-progress-bar" id="reading-progress"></div>
  <% } %>
</header>
```

### Article 文章摘要

**themes/aurora/layout/_partial/article.ejs**

```ejs
<%
  const isIndex = index !== undefined ? index : false;
  const showExcerpt = isIndex && theme_config('home.excerpt.enable', true);
%>

<article class="post-item <%= isIndex ? 'post-index' : 'post-full' %>">
  <!-- 封面图 -->
  <% if (post.cover || theme_config('post.cover.enable', false)) { %>
    <div class="post-cover">
      <a href="<%- url_for(post.path) %>">
        <img 
          src="<%= post.cover || theme_config('post.cover.default') %>" 
          alt="<%= post.title %>"
          loading="lazy"
        >
      </a>
      
      <% if (post.featured) { %>
        <span class="post-badge badge-featured">精选</span>
      <% } %>
      
      <% if (post.sticky) { %>
        <span class="post-badge badge-sticky">置顶</span>
      <% } %>
    </div>
  <% } %>
  
  <!-- 文章信息 -->
  <div class="post-info">
    <!-- 标题 -->
    <h2 class="post-title">
      <a href="<%- url_for(post.path) %>"><%= post.title %></a>
    </h2>
    
    <!-- 元信息 -->
    <%- partial('_partial/post-meta', {
      post: post,
      class: 'post-meta-simple'
    }) %>
    
    <!-- 摘要 -->
    <% if (showExcerpt) { %>
      <div class="post-excerpt">
        <% if (post.excerpt) { %>
          <%- post.excerpt %>
        <% } else { %>
          <%- truncate(strip_html(post.content), {
            length: theme_config('home.excerpt.length', 200)
          }) %>
        <% } %>
      </div>
      
      <a href="<%- url_for(post.path) %>" class="read-more">
        阅读全文 <i class="icon-arrow-right"></i>
      </a>
    <% } %>
    
    <!-- 首页显示标签 -->
    <% if (isIndex && post.tags && post.tags.length) { %>
      <div class="post-tags-simple">
        <% post.tags.limit(3).each(tag => { %>
          <a href="<%- url_for(tag.path) %>" class="tag-link">
            #<%= tag.name %>
          </a>
        <% }) %>
      </div>
    <% } %>
  </div>
</article>
```

### Post Meta 文章元信息

**themes/aurora/layout/_partial/post-meta.ejs**

```ejs
<div class="post-meta <%= class || '' %>">
  <!-- 发布日期 -->
  <% if (theme_config('post.meta.date', true)) { %>
    <span class="meta-item meta-date">
      <i class="icon-calendar"></i>
      <time datetime="<%= post.date.toISOString() %>">
        <%= date(post.date, 'YYYY-MM-DD') %>
      </time>
    </span>
  <% } %>
  
  <!-- 更新日期 -->
  <% if (theme_config('post.meta.updated', true) && post.updated && post.updated.valueOf() !== post.date.valueOf()) { %>
    <span class="meta-item meta-updated">
      <i class="icon-refresh"></i>
      <time datetime="<%= post.updated.toISOString() %>">
        <%= date(post.updated, 'YYYY-MM-DD') %>
      </time>
    </span>
  <% } %>
  
  <!-- 分类 -->
  <% if (theme_config('post.meta.categories', true) && post.categories && post.categories.length) { %>
    <span class="meta-item meta-categories">
      <i class="icon-folder"></i>
      <% post.categories.each(category => { %>
        <a href="<%- url_for(category.path) %>"><%= category.name %></a>
      <% }) %>
    </span>
  <% } %>
  
  <!-- 字数统计 -->
  <% if (theme_config('post.meta.word_count', true) && post.word_count) { %>
    <span class="meta-item meta-wordcount">
      <i class="icon-file-text"></i>
      <%= post.word_count %> 字
    </span>
  <% } %>
  
  <!-- 阅读时间 -->
  <% if (theme_config('post.meta.reading_time', true) && post.reading_time) { %>
    <span class="meta-item meta-reading-time">
      <i class="icon-clock"></i>
      约 <%= post.reading_time %> 分钟
    </span>
  <% } %>
  
  <!-- 浏览次数（需要第三方服务） -->
  <% if (theme_config('post.meta.views', false)) { %>
    <span class="meta-item meta-views">
      <i class="icon-eye"></i>
      <span class="post-views" data-path="<%= post.path %>">-</span> 次浏览
    </span>
  <% } %>
</div>
```

### Sidebar 侧边栏

**themes/aurora/layout/_partial/sidebar.ejs**

```ejs
<aside class="sidebar" id="sidebar">
  <div class="sidebar-inner">
    <%
      const widgets = theme_config('sidebar.widgets', [
        'profile', 'toc', 'recent', 'categories', 'tags', 'archive'
      ]);
      
      widgets.forEach(widget => {
    %>
      <% if (widget === 'profile') { %>
        <%- partial('_partial/widget/profile') %>
      <% } else if (widget === 'toc' && is_post() && page.toc !== false) { %>
        <%- partial('_partial/widget/toc', {content: page.content}) %>
      <% } else if (widget === 'recent') { %>
        <%- partial('_partial/widget/recent-posts') %>
      <% } else if (widget === 'categories') { %>
        <%- partial('_partial/widget/categories') %>
      <% } else if (widget === 'tags') { %>
        <%- partial('_partial/widget/tags') %>
      <% } else if (widget === 'archive') { %>
        <%- partial('_partial/widget/archive') %>
      <% } %>
    <% }) %>
  </div>
</aside>
```

### Widget - 个人信息

**themes/aurora/layout/_partial/widget/profile.ejs**

```ejs
<div class="widget widget-profile">
  <div class="profile-avatar">
    <img 
      src="<%- url_for(theme_config('site.avatar', '/images/avatar.jpg')) %>" 
      alt="<%= config.author %>"
    >
  </div>
  
  <h3 class="profile-name"><%= config.author || theme_config('site.author') %></h3>
  
  <% if (config.description || theme_config('site.description')) { %>
    <p class="profile-bio"><%= config.description || theme_config('site.description') %></p>
  <% } %>
  
  <!-- 统计信息 -->
  <div class="profile-stats">
    <div class="stat-item">
      <span class="stat-value"><%= site.posts.length %></span>
      <span class="stat-label">文章</span>
    </div>
    <div class="stat-item">
      <span class="stat-value"><%= site.categories.length %></span>
      <span class="stat-label">分类</span>
    </div>
    <div class="stat-item">
      <span class="stat-value"><%= site.tags.length %></span>
      <span class="stat-label">标签</span>
    </div>
  </div>
  
  <!-- 社交链接 -->
  <%
    const social = theme_config('social', {});
    if (Object.keys(social).length > 0) {
  %>
    <div class="profile-social">
      <% Object.keys(social).forEach(key => { %>
        <a 
          href="<%= social[key] %>" 
          class="social-link social-<%= key %>"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="<%= key %>"
        >
          <i class="icon-<%= key %>"></i>
        </a>
      <% }) %>
    </div>
  <% } %>
</div>
```

### Widget - 最近文章

**themes/aurora/layout/_partial/widget/recent-posts.ejs**

```ejs
<div class="widget widget-recent-posts">
  <h3 class="widget-title">最近文章</h3>
  <ul class="recent-posts-list">
    <% 
      const recentPosts = site.posts.sort('date', -1).limit(5);
      recentPosts.each(post => {
    %>
      <li class="recent-post-item">
        <% if (post.cover) { %>
          <a href="<%- url_for(post.path) %>" class="recent-post-thumb">
            <img src="<%= post.cover %>" alt="<%= post.title %>" loading="lazy">
          </a>
        <% } %>
        <div class="recent-post-info">
          <a href="<%- url_for(post.path) %>" class="recent-post-title">
            <%= post.title %>
          </a>
          <time class="recent-post-date">
            <%= date(post.date, 'MM-DD') %>
          </time>
        </div>
      </li>
    <% }) %>
  </ul>
</div>
```

### Widget - 分类

**themes/aurora/layout/_partial/widget/categories.ejs**

```ejs
<div class="widget widget-categories">
  <h3 class="widget-title">分类</h3>
  <ul class="category-list">
    <%
      const categories = site.categories.sort('name');
      categories.each(category => {
    %>
      <li class="category-item">
        <a href="<%- url_for(category.path) %>" class="category-link">
          <span class="category-name"><%= category.name %></span>
          <span class="category-count"><%= category.length %></span>
        </a>
      </li>
    <% }) %>
  </ul>
</div>
```

### Widget - 标签云

**themes/aurora/layout/_partial/widget/tags.ejs**

```ejs
<div class="widget widget-tags">
  <h3 class="widget-title">标签云</h3>
  <div class="tag-cloud">
    <%
      const tags = site.tags.sort('name');
      const maxCount = tags.first() ? tags.first().length : 1;
      const minCount = tags.last() ? tags.last().length : 1;
      
      tags.each(tag => {
        const weight = (tag.length - minCount) / (maxCount - minCount || 1);
        const fontSize = 12 + Math.floor(weight * 10);
    %>
      <a 
        href="<%- url_for(tag.path) %>" 
        class="tag-cloud-item"
        style="font-size: <%= fontSize %>px"
        title="<%= tag.name %> (<%= tag.length %>)"
      >
        <%= tag.name %>
      </a>
    <% }) %>
  </div>
</div>
```

### Footer 底部

**themes/aurora/layout/_partial/footer.ejs**

```ejs
<footer class="site-footer">
  <div class="footer-container">
    <!-- 页脚信息 -->
    <div class="footer-info">
      <!-- 版权信息 -->
      <div class="copyright">
        &copy; 
        <% 
          const since = theme_config('footer.since');
          const currentYear = new Date().getFullYear();
        %>
        <% if (since && since < currentYear) { %>
          <%= since %> - <%= currentYear %>
        <% } else { %>
          <%= currentYear %>
        <% } %>
        <a href="<%= config.url %>"><%= config.author || config.title %></a>
      </div>
      
      <!-- 自定义文本 -->
      <% if (theme_config('footer.custom_text')) { %>
        <div class="footer-custom">
          <%- theme_config('footer.custom_text') %>
        </div>
      <% } %>
      
      <!-- 备案信息 -->
      <% if (theme_config('footer.icp.enable', false)) { %>
        <div class="footer-icp">
          <a 
            href="<%= theme_config('footer.icp.url') %>" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <%= theme_config('footer.icp.number') %>
          </a>
        </div>
      <% } %>
    </div>
    
    <!-- 页脚链接 -->
    <%
      const footerLinks = theme_config('footer.links', []);
      if (footerLinks.length > 0) {
    %>
      <div class="footer-links">
        <% footerLinks.forEach(link => { %>
          <a 
            href="<%= link.url %>" 
            <% if (link.external !== false) { %>
              target="_blank" 
              rel="noopener noreferrer"
            <% } %>
          >
            <%= link.name %>
          </a>
        <% }) %>
      </div>
    <% } %>
    
    <!-- 社交图标（可选） -->
    <% 
      const social = theme_config('social', {});
      if (theme_config('footer.social', false) && Object.keys(social).length > 0) {
    %>
      <div class="footer-social">
        <% Object.keys(social).forEach(key => { %>
          <a 
            href="<%= social[key] %>" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="<%= key %>"
          >
            <i class="icon-<%= key %>"></i>
          </a>
        <% }) %>
      </div>
    <% } %>
  </div>
</footer>
```

### TOC 目录

**themes/aurora/layout/_partial/toc.ejs**

```ejs
<%
  // 使用 cheerio 解析内容并生成目录
  const cheerio = require('cheerio');
  const $ = cheerio.load(content);
  
  const minDepth = theme_config('features.toc.min_depth', 2);
  const maxDepth = theme_config('features.toc.max_depth', 3);
  const showNumber = theme_config('features.toc.number', true);
  
  const selector = Array.from(
    {length: maxDepth - minDepth + 1}, 
    (_, i) => `h${minDepth + i}`
  ).join(', ');
  
  const headings = [];
  $(selector).each(function(index) {
    const $heading = $(this);
    const level = parseInt(this.name.substring(1));
    const text = $heading.text();
    const id = $heading.attr('id') || text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    headings.push({
      level: level,
      text: text,
      id: id
    });
  });
  
  if (headings.length === 0) {
    return '';
  }
%>

<div class="toc-widget">
  <div class="toc-header">
    <h3 class="toc-title">目录</h3>
    <button class="toc-toggle" aria-label="折叠目录">
      <i class="icon-chevron-up"></i>
    </button>
  </div>
  
  <nav class="toc-content">
    <ol class="toc-list">
      <%
        let currentLevel = minDepth;
        headings.forEach((heading, index) => {
          const nextHeading = headings[index + 1];
          const diff = heading.level - currentLevel;
          
          if (diff > 0) {
            // 打开新的嵌套层级
            for (let i = 0; i < diff; i++) {
              %>
              <ol class="toc-list toc-list-level-<%= heading.level %>">
              <%
            }
          } else if (diff < 0) {
            // 关闭嵌套层级
            %>
            </li>
            <%
            for (let i = 0; i < -diff; i++) {
              %>
              </ol>
              </li>
              <%
            }
          } else if (index > 0) {
            %>
            </li>
            <%
          }
          
          %>
          <li class="toc-item toc-level-<%= heading.level %>">
            <a 
              href="#<%= heading.id %>" 
              class="toc-link"
              data-target="<%= heading.id %>"
            >
              <% if (showNumber) { %>
                <span class="toc-number"></span>
              <% } %>
              <span class="toc-text"><%= heading.text %></span>
            </a>
          <%
          
          currentLevel = heading.level;
          
          if (!nextHeading) {
            %>
            </li>
            <%
            for (let i = 0; i < heading.level - minDepth + 1; i++) {
              %>
              </ol>
              <%
            }
          }
        });
      %>
    </ol>
  </nav>
</div>
```

### Comments 评论系统

**themes/aurora/layout/_partial/comments.ejs**

```ejs
<%
  const provider = theme_config('comments.provider', 'none');
  
  if (provider === 'none' || !theme_config('comments.enable', false)) {
    return '';
  }
%>

<div class="comments-wrapper" id="comments">
  <h3 class="comments-title">评论</h3>
  
  <% if (provider === 'gitalk') { %>
    <%- partial('_partial/comments/gitalk') %>
  <% } else if (provider === 'disqus') { %>
    <%- partial('_partial/comments/disqus') %>
  <% } else if (provider === 'valine') { %>
    <%- partial('_partial/comments/valine') %>
  <% } else if (provider === 'waline') { %>
    <%- partial('_partial/comments/waline') %>
  <% } %>
</div>
```

**themes/aurora/layout/_partial/comments/gitalk.ejs**

```ejs
<div id="gitalk-container"></div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>

<script>
  const gitalk = new Gitalk({
    clientID: '<%= theme_config('comments.gitalk.client_id') %>',
    clientSecret: '<%= theme_config('comments.gitalk.client_secret') %>',
    repo: '<%= theme_config('comments.gitalk.repo') %>',
    owner: '<%= theme_config('comments.gitalk.owner') %>',
    admin: <%- JSON.stringify(theme_config('comments.gitalk.admin', [])) %>,
    id: '<%= page._id || md5(page.path) %>',
    distractionFreeMode: false,
    language: '<%= config.language || 'zh-CN' %>'
  });
  
  gitalk.render('gitalk-container');
</script>
```

---

## 第四部分：样式系统

### 样式架构设计

采用 SCSS 进行样式组织，使用 BEM 命名规范。

**themes/aurora/source/css/style.scss**

```scss
// ============================================
// Aurora 主题样式入口
// ============================================

// 1. 变量和配置
@import 'variables';
@import 'mixins';

// 2. 基础样式
@import 'base/reset';
@import 'base/typography';
@import 'base/layout';

// 3. 组件样式
@import 'components/header';
@import 'components/footer';
@import 'components/sidebar';
@import 'components/article';
@import 'components/pagination';
@import 'components/toc';
@import 'components/comments';
@import 'components/widget';

// 4. 页面样式
@import 'pages/home';
@import 'pages/post';
@import 'pages/archive';
@import 'pages/page';

// 5. 工具类
@import 'utilities/spacing';
@import 'utilities/display';
@import 'utilities/text';

// 6. 主题模式
@import 'themes/light';
@import 'themes/dark';

// 7. 响应式
@import 'responsive';
```

### 变量定义

**themes/aurora/source/css/_variables.scss**

```scss
// ============================================
// 颜色系统
// ============================================

// 主色
$primary-color: #4dabf7 !default;
$primary-light: lighten($primary-color, 10%);
$primary-dark: darken($primary-color, 10%);

// 中性色
$white: #ffffff;
$black: #000000;
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$gray-900: #111827;

// 语义色
$success-color: #10b981;
$warning-color: #f59e0b;
$error-color: #ef4444;
$info-color: #3b82f6;

// 浅色主题
$light-bg: $white;
$light-bg-secondary: $gray-50;
$light-text: $gray-900;
$light-text-secondary: $gray-600;
$light-border: $gray-200;

// 深色主题
$dark-bg: #1a1a1a;
$dark-bg-secondary: #242424;
$dark-text: #e0e0e0;
$dark-text-secondary: #a0a0a0;
$dark-border: #333333;

// ============================================
// 字体
// ============================================

$font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                   'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
$font-family-serif: Georgia, 'Times New Roman', serif;
$font-family-mono: 'Fira Code', 'Courier New', monospace;

$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-xl: 20px;

$line-height-base: 1.6;
$line-height-heading: 1.3;

// ============================================
// 间距
// ============================================

$spacing-unit: 8px;
$spacing-xs: $spacing-unit * 0.5;  // 4px
$spacing-sm: $spacing-unit;        // 8px
$spacing-md: $spacing-unit * 2;    // 16px
$spacing-lg: $spacing-unit * 3;    // 24px
$spacing-xl: $spacing-unit * 4;    // 32px
$spacing-2xl: $spacing-unit * 6;   // 48px
$spacing-3xl: $spacing-unit * 8;   // 64px

// ============================================
// 布局
// ============================================

$container-max-width: 1200px;
$content-max-width: 800px;
$sidebar-width: 300px;

$header-height: 64px;
$footer-height: 80px;

// ============================================
// 圆角
// ============================================

$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-xl: 16px;
$border-radius-full: 9999px;

// ============================================
// 阴影
// ============================================

$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

// ============================================
// 过渡
// ============================================

$transition-fast: 150ms;
$transition-base: 250ms;
$transition-slow: 350ms;

$transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

// ============================================
// 断点
// ============================================

$breakpoint-xs: 480px;
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
$breakpoint-2xl: 1536px;

// ============================================
// Z-index
// ============================================

$z-dropdown: 1000;
$z-sticky: 1020;
$z-fixed: 1030;
$z-modal-backdrop: 1040;
$z-modal: 1050;
$z-popover: 1060;
$z-tooltip: 1070;
```

### Mixins

**themes/aurora/source/css/_mixins.scss**

```scss
// ============================================
// 响应式断点
// ============================================

@mixin respond-to($breakpoint) {
  @if $breakpoint == 'xs' {
    @media (min-width: $breakpoint-xs) { @content; }
  } @else if $breakpoint == 'sm' {
    @media (min-width: $breakpoint-sm) { @content; }
  } @else if $breakpoint == 'md' {
    @media (min-width: $breakpoint-md) { @content; }
  } @else if $breakpoint == 'lg' {
    @media (min-width: $breakpoint-lg) { @content; }
  } @else if $breakpoint == 'xl' {
    @media (min-width: $breakpoint-xl) { @content; }
  } @else if $breakpoint == '2xl' {
    @media (min-width: $breakpoint-2xl) { @content; }
  }
}

// ============================================
// 截断文本
// ============================================

@mixin truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ============================================
// Flexbox 居中
// ============================================

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// ============================================
// 清除浮动
// ============================================

@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// ============================================
// 渐变背景
// ============================================

@mixin gradient-bg($angle, $start-color, $end-color) {
  background: linear-gradient($angle, $start-color, $end-color);
}

// ============================================
// 卡片样式
// ============================================

@mixin card($padding: $spacing-lg) {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: $border-radius-lg;
  padding: $padding;
  box-shadow: $shadow-sm;
  transition: box-shadow $transition-base $transition-timing;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}

// ============================================
// 按钮重置
// ============================================

@mixin button-reset {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
  
  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
}

// ============================================
// 滚动条样式
// ============================================

@mixin custom-scrollbar($width: 8px) {
  &::-webkit-scrollbar {
    width: $width;
    height: $width;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--text-secondary);
    border-radius: $border-radius-full;
    
    &:hover {
      background: var(--text-primary);
    }
  }
}
```

### 基础样式 - Reset

**themes/aurora/source/css/base/_reset.scss**

```scss
// ============================================
// CSS Reset
// ============================================

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: $font-size-base;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: $font-family-sans;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: color $transition-base, background-color $transition-base;
}

// 标题
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: $line-height-heading;
  margin-bottom: $spacing-md;
}

// 链接
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color $transition-fast;
  
  &:hover {
    color: var(--primary-dark);
  }
}

// 图片
img {
  max-width: 100%;
  height: auto;
  display: block;
}

// 列表
ul, ol {
  list-style: none;
}

// 按钮
button {
  font-family: inherit;
  font-size: inherit;
}

// 表单元素
input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}

// 代码
code,
pre {
  font-family: $font-family-mono;
}
```

### 组件样式 - Header

**themes/aurora/source/css/components/_header.scss**

```scss
// ============================================
// 顶部导航
// ============================================

.site-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: $header-height;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  z-index: $z-sticky;
  transition: all $transition-base;
  
  .header-container {
    max-width: $container-max-width;
    height: 100%;
    margin: 0 auto;
    padding: 0 $spacing-lg;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  // Logo 和站点标题
  .site-branding {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    
    .site-logo-link {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      color: var(--text-primary);
      
      &:hover {
        color: var(--primary-color);
      }
    }
    
    .site-logo {
      height: 32px;
      width: auto;
    }
    
    .site-title {
      font-size: $font-size-xl;
      font-weight: 700;
    }
    
    .site-subtitle {
      display: none;
      
      @include respond-to('md') {
        display: block;
        font-size: $font-size-sm;
        color: var(--text-secondary);
      }
    }
  }
  
  // 导航菜单
  .site-nav {
    display: none;
    
    @include respond-to('md') {
      display: block;
    }
    
    .nav-menu {
      display: flex;
      gap: $spacing-md;
    }
    
    .nav-item {
      &.active .nav-link {
        color: var(--primary-color);
        font-weight: 600;
      }
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-sm $spacing-md;
      color: var(--text-primary);
      border-radius: $border-radius-md;
      transition: all $transition-fast;
      
      &:hover {
        color: var(--primary-color);
        background-color: var(--bg-secondary);
      }
    }
  }
  
  // 工具栏
  .header-tools {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }
  
  .tool-button {
    @include button-reset;
    @include flex-center;
    width: 40px;
    height: 40px;
    color: var(--text-primary);
    border-radius: $border-radius-md;
    transition: all $transition-fast;
    
    &:hover {
      color: var(--primary-color);
      background-color: var(--bg-secondary);
    }
  }
  
  // 暗色模式切换
  .theme-toggle {
    .sun-icon,
    .moon-icon {
      display: none;
    }
    
    [data-theme="light"] & .sun-icon,
    [data-theme="dark"] & .moon-icon {
      display: block;
    }
  }
  
  // 汉堡菜单
  .menu-toggle {
    @include respond-to('md') {
      display: none;
    }
    
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      span {
        display: block;
        width: 20px;
        height: 2px;
        background-color: currentColor;
        transition: transform $transition-base;
      }
    }
    
    &.active {
      .hamburger span:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
      }
      .hamburger span:nth-child(2) {
        opacity: 0;
      }
      .hamburger span:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
      }
    }
  }
  
  // 阅读进度条
  .reading-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      var(--primary-color),
      var(--primary-light)
    );
    transition: width $transition-fast;
    width: 0;
  }
}
```

---

## 第五部分：JavaScript 脚本

### 主脚本文件

**themes/aurora/source/js/main.js**

```javascript
/**
 * Aurora Theme - Main Script
 * ============================================
 */

(function() {
  'use strict';
  
  // ==========================================
  // 工具函数
  // ==========================================
  
  const utils = {
    // DOM 选择器
    $(selector, context = document) {
      return context.querySelector(selector);
    },
    
    $$(selector, context = document) {
      return Array.from(context.querySelectorAll(selector));
    },
    
    // 节流函数
    throttle(func, wait) {
      let timeout;
      return function(...args) {
        if (!timeout) {
          timeout = setTimeout(() => {
            timeout = null;
            func.apply(this, args);
          }, wait);
        }
      };
    },
    
    // 防抖函数
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    
    // 本地存储
    storage: {
      get(key, defaultValue = null) {
        try {
          const value = localStorage.getItem(key);
          return value !== null ? JSON.parse(value) : defaultValue;
        } catch (e) {
          return defaultValue;
        }
      },
      
      set(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      },
      
      remove(key) {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          return false;
        }
      }
    }
  };
  
  // ==========================================
  // 暗色模式切换
  // ==========================================
  
  const ThemeToggle = {
    init() {
      this.toggle = utils.$('#theme-toggle');
      if (!this.toggle) return;
      
      this.toggle.addEventListener('click', () => this.switch());
      
      // 监听系统主题变化
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (utils.storage.get('theme') === 'auto') {
            this.apply(e.matches ? 'dark' : 'light');
          }
        });
      }
    },
    
    switch() {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      this.apply(next);
      utils.storage.set('theme', next);
    },
    
    apply(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };
  
  // ==========================================
  // 移动端菜单
  // ==========================================
  
  const MobileMenu = {
    init() {
      this.toggle = utils.$('#menu-toggle');
      this.nav = utils.$('#site-nav');
      if (!this.toggle || !this.nav) return;
      
      this.toggle.addEventListener('click', () => this.toggleMenu());
      
      // 点击菜单项后关闭菜单
      utils.$$('.nav-link', this.nav).forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
      
      // 点击外部关闭菜单
      document.addEventListener('click', (e) => {
        if (!this.toggle.contains(e.target) && !this.nav.contains(e.target)) {
          this.closeMenu();
        }
      });
    },
    
    toggleMenu() {
      const isOpen = this.nav.classList.toggle('active');
      this.toggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    },
    
    closeMenu() {
      this.nav.classList.remove('active');
      this.toggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
  
  // ==========================================
  // 阅读进度条
  // ==========================================
  
  const ReadingProgress = {
    init() {
      this.bar = utils.$('#reading-progress');
      if (!this.bar) return;
      
      window.addEventListener('scroll', utils.throttle(() => {
        this.update();
      }, 100));
    },
    
    update() {
      const winHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const progress = scrollTop / (docHeight - winHeight) * 100;
      
      this.bar.style.width = `${Math.min(progress, 100)}%`;
    }
  };
  
  // ==========================================
  // 返回顶部
  // ==========================================
  
  const BackToTop = {
    init() {
      this.button = utils.$('#back-to-top');
      if (!this.button) return;
      
      window.addEventListener('scroll', utils.throttle(() => {
        this.toggleVisibility();
      }, 200));
      
      this.button.addEventListener('click', () => this.scrollToTop());
    },
    
    toggleVisibility() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.button.classList.toggle('visible', scrollTop > 300);
      
      // 更新滚动百分比
      const percent = utils.$('.back-to-top-percent', this.button);
      if (percent) {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const progress = Math.round(scrollTop / (docHeight - winHeight) * 100);
        percent.textContent = `${progress}%`;
      }
    },
    
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // ==========================================
  // 目录导航
  // ==========================================
  
  const TOC = {
    init() {
      this.toc = utils.$('.toc-widget');
      if (!this.toc) return;
      
      this.links = utils.$$('.toc-link', this.toc);
      this.headings = this.links.map(link => {
        const target = link.getAttribute('data-target');
        return utils.$(`#${target}`);
      }).filter(Boolean);
      
      if (this.headings.length === 0) return;
      
      // 监听滚动
      window.addEventListener('scroll', utils.throttle(() => {
        this.updateActive();
      }, 100));
      
      // 点击平滑滚动
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const target = link.getAttribute('data-target');
          const heading = utils.$(`#${target}`);
          if (heading) {
            const top = heading.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({
              top: top,
              behavior: 'smooth'
            });
          }
        });
      });
      
      // 折叠/展开
      const toggle = utils.$('.toc-toggle', this.toc);
      if (toggle) {
        toggle.addEventListener('click', () => {
          this.toc.classList.toggle('collapsed');
        });
      }
    },
    
    updateActive() {
      const scrollTop = window.pageYOffset + 100;
      
      let activeIndex = -1;
      for (let i = 0; i < this.headings.length; i++) {
        const heading = this.headings[i];
        if (heading.offsetTop <= scrollTop) {
          activeIndex = i;
        } else {
          break;
        }
      }
      
      this.links.forEach((link, index) => {
        link.classList.toggle('active', index === activeIndex);
      });
    }
  };
  
  // ==========================================
  // 代码块复制
  // ==========================================
  
  const CodeCopy = {
    init() {
      utils.$$('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.copy(e.target);
        });
      });
    },
    
    async copy(button) {
      const codeBlock = button.closest('.code-wrapper, .highlight');
      if (!codeBlock) return;
      
      const code = codeBlock.querySelector('code');
      if (!code) return;
      
      try {
        await navigator.clipboard.writeText(code.textContent);
        this.showSuccess(button);
      } catch (err) {
        this.showError(button);
      }
    },
    
    showSuccess(button) {
      const originalText = button.textContent;
      button.textContent = '已复制!';
      button.classList.add('success');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('success');
      }, 2000);
    },
    
    showError(button) {
      const originalText = button.textContent;
      button.textContent = '复制失败';
      button.classList.add('error');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('error');
      }, 2000);
    }
  };
  
  // ==========================================
  // 图片懒加载
  // ==========================================
  
  const LazyLoad = {
    init() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
            }
          });
        });
        
        utils.$$('img[loading="lazy"], .lazyload').forEach(img => {
          this.observer.observe(img);
        });
      } else {
        // Fallback
        utils.$$('img[loading="lazy"], .lazyload').forEach(img => {
          this.loadImage(img);
        });
      }
    },
    
    loadImage(img) {
      const src = img.getAttribute('data-src') || img.getAttribute('src');
      if (src) {
        img.src = src;
        img.classList.remove('lazyload');
        img.classList.add('lazyloaded');
        
        if (this.observer) {
          this.observer.unobserve(img);
        }
      }
    }
  };
  
  // ==========================================
  // 页面加载动画
  // ==========================================
  
  const Loading = {
    init() {
      this.overlay = utils.$('#loading');
      if (!this.overlay) return;
      
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.hide();
        }, 300);
      });
    },
    
    hide() {
      if (this.overlay) {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
          this.overlay.style.display = 'none';
        }, 300);
      }
    }
  };
  
  // ==========================================
  // 初始化
  // ==========================================
  
  function init() {
    Loading.init();
    ThemeToggle.init();
    MobileMenu.init();
    ReadingProgress.init();
    BackToTop.init();
    TOC.init();
    CodeCopy.init();
    LazyLoad.init();
    
    console.log('Aurora Theme initialized');
  }
  
  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
```

---

## 小结

本章我们完整地构建了一个 Hexo 主题 **Aurora**，学习了：

1. **主题目录结构** - 标准的文件组织方式
2. **配置系统** - 灵活且用户友好的配置文件
3. **Layout 布局** - 模板继承与布局设计
4. **Partial 模板** - 模块化组件开发
5. **样式系统** - SCSS 架构与主题切换
6. **脚本系统** - JavaScript 功能实现

### 关键要点

✅ **模块化设计** - 将功能拆分成独立的组件
✅ **配置驱动** - 通过配置控制主题行为
✅ **响应式优先** - 适配各种屏幕尺寸
✅ **性能优化** - 懒加载、代码分割、资源优化
✅ **用户体验** - 暗色模式、平滑动画、交互反馈
✅ **可维护性** - 清晰的代码结构和命名规范

---

## 下期预告

**Hexo 主题开发系列教程（四）：高级功能与优化**

将介绍：
- 🔍 搜索功能实现
- 💬 多评论系统集成
- 📊 统计分析集成
- ⚡ 性能优化技巧
- 📱 PWA 支持
- 🎨 高级自定义
- 🚀 主题发布与维护
