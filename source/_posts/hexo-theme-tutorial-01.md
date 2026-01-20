---
title: Hexo 主题开发系列教程（一）：核心概念全解析
date: 2025-11-20 22:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---

## 前言

Hexo 是一个快速、简洁且高效的博客框架，它使用 Node.js 驱动，支持 Markdown 解析。本系列教程将带你深入了解 Hexo 主题开发的方方面面，从基础概念到实战技巧。

在开始制作主题之前，理解 Hexo 的核心概念至关重要。本文将详细介绍主题开发中最重要的七个核心概念，为后续的实战开发打下坚实基础。

---

## 1. 事件系统 (Events)

### 概念介绍

Hexo 的事件系统基于 Node.js 的 EventEmitter，允许开发者在 Hexo 执行的不同阶段插入自定义逻辑。这是一个发布-订阅模式的实现，使得插件和主题能够对 Hexo 的生命周期做出响应。

### 常用事件类型

```javascript
// 在初始化完成后触发
hexo.on('ready', function() {
  console.log('Hexo 已准备就绪');
});

// 在生成文件前触发
hexo.on('generateBefore', function() {
  console.log('开始生成静态文件');
});

// 在生成文件后触发
hexo.on('generateAfter', function() {
  console.log('静态文件生成完成');
});

// 在退出前触发
hexo.on('exit', function() {
  console.log('Hexo 正在退出');
});
```

### 实际应用场景

**场景1：在生成前自动处理图片**

```javascript
// themes/your-theme/scripts/image-processor.js
hexo.on('generateBefore', function() {
  // 压缩图片、生成缩略图等操作
  const images = hexo.locals.get('images');
  images.forEach(img => {
    // 处理逻辑
  });
});
```

**场景2：生成自定义数据文件**

```javascript
hexo.on('generateAfter', function() {
  // 生成搜索索引、站点地图等
  const posts = hexo.locals.get('posts');
  const searchData = posts.map(post => ({
    title: post.title,
    url: post.path,
    content: post.content
  }));
  // 保存数据
});
```

---

## 2. 本地变量 (Local Variables)

### 概念介绍

本地变量是 Hexo 在模板渲染时可用的数据对象。这些变量包含了网站的所有内容和配置信息，是连接数据和视图的桥梁。

### 全局变量

```javascript
// 在模板中可直接访问的全局变量
site      // 网站信息
page      // 当前页面信息
config    // 网站配置
theme     // 主题配置
path      // 当前页面路径
url       // 当前页面完整URL
env       // 环境变量
```

### 核心变量详解

#### site 变量

```ejs
<!-- 访问所有文章 -->
<% site.posts.each(function(post) { %>
  <h2><%= post.title %></h2>
  <p><%= post.excerpt %></p>
<% }) %>

<!-- 访问所有分类 -->
<% site.categories.each(function(category) { %>
  <li><%= category.name %> (<%= category.length %>)</li>
<% }) %>

<!-- 访问所有标签 -->
<% site.tags.each(function(tag) { %>
  <span><%= tag.name %></span>
<% }) %>
```

#### page 变量

```ejs
<!-- 文章页面 -->
<% if (page.layout === 'post') { %>
  <article>
    <h1><%= page.title %></h1>
    <time><%= date(page.date, 'YYYY-MM-DD') %></time>
    <%- page.content %>
    
    <!-- 标签 -->
    <% if (page.tags && page.tags.length) { %>
      <% page.tags.each(function(tag) { %>
        <a href="<%- url_for(tag.path) %>"><%= tag.name %></a>
      <% }) %>
    <% } %>
  </article>
<% } %>
```

#### config 和 theme 变量

```ejs
<!-- 使用网站配置 -->
<title><%= config.title %></title>
<meta name="author" content="<%= config.author %>">

<!-- 使用主题配置 -->
<% if (theme.sidebar) { %>
  <aside><%- partial('_partial/sidebar') %></aside>
<% } %>

<!-- 主题自定义选项 -->
<% if (theme.custom_logo) { %>
  <img src="<%= theme.custom_logo %>" alt="Logo">
<% } %>
```

### 变量作用域

#### 作用域层级

在 Hexo 模板系统中，变量存在明确的作用域层级，理解这些层级对于正确访问和修改数据至关重要。

```javascript
// 作用域优先级（从高到低）
1. 页面级变量 (page)         // 当前页面特有的数据
2. 主题配置变量 (theme)      // 主题配置文件中的数据
3. 全局配置变量 (config)     // 站点配置文件中的数据
4. 站点变量 (site)           // 站点所有内容数据
5. Helper 函数              // 辅助函数返回的数据
```

#### 在模板中扩展变量

**方法一：使用 Helper 注册全局函数**

Helper 是最常用的扩展变量的方式，可以在任何模板中调用。

```javascript
// themes/your-theme/scripts/helpers.js

// 1. 简单数据返回
hexo.extend.helper.register('site_info', function() {
  return {
    author: this.config.author,
    posts_count: this.site.posts.length,
    pages_count: this.site.pages.length,
    tags_count: this.site.tags.length,
    categories_count: this.site.categories.length
  };
});

// 2. 带参数的 Helper
hexo.extend.helper.register('get_posts_by_year', function(year) {
  return this.site.posts.filter(post => {
    return post.date.year() === year;
  });
});

// 3. 复杂计算的 Helper
hexo.extend.helper.register('reading_stats', function() {
  const posts = this.site.posts;
  const totalWords = posts.reduce((sum, post) => {
    const words = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    return sum + words;
  }, 0);
  
  return {
    total_posts: posts.length,
    total_words: totalWords,
    avg_words: Math.round(totalWords / posts.length),
    total_reading_time: Math.ceil(totalWords / 200) // 假设每分钟200字
  };
});

// 4. 访问当前页面上下文的 Helper
hexo.extend.helper.register('is_current_path', function(path) {
  return this.path === path;
});

// 5. 组合多个数据源的 Helper
hexo.extend.helper.register('sidebar_data', function() {
  const recentPosts = this.site.posts.sort('date', -1).limit(5);
  const hotTags = this.site.tags.sort('length', -1).limit(10);
  
  return {
    recent_posts: recentPosts.toArray(),
    hot_tags: hotTags.toArray(),
    archive_count: this.site.posts.length,
    config: {
      show_categories: this.theme.sidebar.show_categories,
      show_tags: this.theme.sidebar.show_tags
    }
  };
});
```

**在模板中使用 Helper：**

```ejs
<!-- 使用简单 Helper -->
<% const info = site_info() %>
<div class="site-stats">
  <p>文章数：<%= info.posts_count %></p>
  <p>标签数：<%= info.tags_count %></p>
</div>

<!-- 使用带参数的 Helper -->
<% const posts2024 = get_posts_by_year(2024) %>
<h3>2024年的文章 (<%= posts2024.length %>)</h3>

<!-- 使用复杂 Helper -->
<% const stats = reading_stats() %>
<div class="reading-stats">
  <span>总字数：<%= stats.total_words.toLocaleString() %></span>
  <span>平均字数：<%= stats.avg_words %></span>
  <span>预计阅读：<%= stats.total_reading_time %> 分钟</span>
</div>

<!-- 使用侧边栏数据 Helper -->
<% const sidebar = sidebar_data() %>
<aside>
  <h3>最近文章</h3>
  <ul>
    <% sidebar.recent_posts.forEach(post => { %>
      <li><a href="<%- url_for(post.path) %>"><%= post.title %></a></li>
    <% }) %>
  </ul>
  
  <% if (sidebar.config.show_tags) { %>
    <h3>热门标签</h3>
    <div class="tags">
      <% sidebar.hot_tags.forEach(tag => { %>
        <a href="<%- url_for(tag.path) %>">
          <%= tag.name %> (<%= tag.length %>)
        </a>
      <% }) %>
    </div>
  <% } %>
</aside>
```

**方法二：使用 Filter 修改数据**

Filter 可以在数据处理的特定阶段修改变量。

```javascript
// themes/your-theme/scripts/filters.js

// 1. 在模板渲染前注入变量
hexo.extend.filter.register('template_locals', function(locals) {
  // 添加自定义变量到所有模板
  locals.custom_menu = [
    { name: '首页', path: '/', icon: 'home' },
    { name: '归档', path: '/archives/', icon: 'archive' },
    { name: '关于', path: '/about/', icon: 'user' }
  ];
  
  // 添加当前年份
  locals.current_year = new Date().getFullYear();
  
  // 添加社交链接
  locals.social_links = this.theme.social || {};
  
  // 添加运行时间
  const startDate = new Date(this.config.site_start_date || '2020-01-01');
  const days = Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
  locals.site_running_days = days;
  
  return locals;
});

// 2. 为特定页面类型添加变量
hexo.extend.filter.register('template_locals', function(locals) {
  // 只在文章页面添加相关文章
  if (locals.page.layout === 'post') {
    const currentPost = locals.page;
    const relatedPosts = locals.site.posts
      .filter(post => {
        // 排除当前文章
        if (post._id === currentPost._id) return false;
        
        // 查找有共同标签的文章
        if (currentPost.tags && post.tags) {
          const currentTags = currentPost.tags.map(t => t.name);
          const postTags = post.tags.map(t => t.name);
          const commonTags = currentTags.filter(t => postTags.includes(t));
          return commonTags.length > 0;
        }
        return false;
      })
      .sort('date', -1)
      .limit(5);
    
    locals.related_posts = relatedPosts.toArray();
  }
  
  // 为归档页面添加统计
  if (locals.page.layout === 'archive') {
    const posts = locals.site.posts;
    const yearStats = {};
    
    posts.forEach(post => {
      const year = post.date.year();
      yearStats[year] = (yearStats[year] || 0) + 1;
    });
    
    locals.archive_stats = yearStats;
  }
  
  return locals;
});

// 3. 修改文章数据
hexo.extend.filter.register('before_post_render', function(data) {
  // 为每篇文章添加估算阅读时间
  const words = data.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  data.reading_time = Math.ceil(words / 200);
  
  // 添加字数统计
  data.word_count = words;
  
  // 为文章添加更新状态
  if (data.updated) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - data.updated.valueOf()) / (1000 * 60 * 60 * 24)
    );
    data.is_recent_update = daysSinceUpdate < 30;
    data.days_since_update = daysSinceUpdate;
  }
  
  // 自动生成摘要（如果没有手动指定）
  if (!data.excerpt && data.content) {
    const plainText = data.content.replace(/<[^>]+>/g, '');
    data.auto_excerpt = plainText.substring(0, 200) + '...';
  }
  
  return data;
});
```

**在模板中使用 Filter 注入的变量：**

```ejs
<!-- 使用全局注入的自定义菜单 -->
<nav>
  <% custom_menu.forEach(item => { %>
    <a href="<%= item.path %>" class="<%= is_current(item.path) ? 'active' : '' %>">
      <i class="icon-<%= item.icon %>"></i>
      <%= item.name %>
    </a>
  <% }) %>
</nav>

<!-- 使用运行时间 -->
<footer>
  <p>本站已运行 <%= site_running_days %> 天</p>
  <p>&copy; 2020-<%= current_year %> <%= config.author %></p>
</footer>

<!-- 在文章页面使用相关文章 -->
<% if (page.layout === 'post' && related_posts && related_posts.length > 0) { %>
  <div class="related-posts">
    <h3>相关文章</h3>
    <ul>
      <% related_posts.forEach(post => { %>
        <li>
          <a href="<%- url_for(post.path) %>"><%= post.title %></a>
          <span class="meta">
            <%= date(post.date, 'YYYY-MM-DD') %> · 
            <%= post.reading_time %> 分钟阅读
          </span>
        </li>
      <% }) %>
    </ul>
  </div>
<% } %>

<!-- 使用文章的扩展数据 -->
<% if (page.layout === 'post') { %>
  <article>
    <header>
      <h1><%= page.title %></h1>
      <div class="meta">
        <time><%= date(page.date, 'YYYY-MM-DD HH:mm') %></time>
        <span>· <%= page.word_count %> 字</span>
        <span>· 约 <%= page.reading_time %> 分钟</span>
        
        <% if (page.is_recent_update) { %>
          <span class="badge-new">最近更新</span>
        <% } else if (page.days_since_update > 365) { %>
          <span class="badge-old">
            内容可能过时（距更新 <%= page.days_since_update %> 天）
          </span>
        <% } %>
      </div>
    </header>
    
    <%- page.content %>
  </article>
<% } %>
```

**方法三：使用 Generator 创建自定义数据页面**

Generator 可以创建包含自定义变量的新页面。

```javascript
// themes/your-theme/scripts/generator.js

// 生成标签云页面
hexo.extend.generator.register('tag-cloud', function(locals) {
  const tags = locals.tags.sort('length', -1);
  const maxCount = tags.first() ? tags.first().length : 1;
  const minCount = tags.last() ? tags.last().length : 1;
  
  // 计算每个标签的权重
  const tagCloud = tags.map(tag => {
    const weight = (tag.length - minCount) / (maxCount - minCount);
    const fontSize = 12 + Math.floor(weight * 20); // 12px - 32px
    
    return {
      name: tag.name,
      path: tag.path,
      count: tag.length,
      weight: weight,
      fontSize: fontSize
    };
  });
  
  return {
    path: 'tag-cloud/index.html',
    layout: 'tag-cloud',
    data: {
      title: '标签云',
      tags: tagCloud,
      total_tags: tags.length,
      total_posts: locals.posts.length
    }
  };
});

// 生成时间轴页面
hexo.extend.generator.register('timeline', function(locals) {
  const posts = locals.posts.sort('date', -1);
  const timeline = {};
  
  posts.forEach(post => {
    const year = post.date.year();
    const month = post.date.format('MM');
    
    if (!timeline[year]) {
      timeline[year] = {};
    }
    if (!timeline[year][month]) {
      timeline[year][month] = [];
    }
    
    timeline[year][month].push({
      title: post.title,
      path: post.path,
      date: post.date,
      tags: post.tags ? post.tags.toArray() : []
    });
  });
  
  return {
    path: 'timeline/index.html',
    layout: 'timeline',
    data: {
      title: '时间轴',
      timeline: timeline,
      years: Object.keys(timeline).sort((a, b) => b - a)
    }
  };
});
```

**对应的模板文件：**

```ejs
<!-- themes/your-theme/layout/tag-cloud.ejs -->
<div class="tag-cloud-page">
  <h1><%= page.title %></h1>
  <p class="stats">
    共 <%= page.total_tags %> 个标签，
    <%= page.total_posts %> 篇文章
  </p>
  
  <div class="tag-cloud">
    <% page.tags.forEach(tag => { %>
      <a 
        href="<%- url_for(tag.path) %>" 
        style="font-size: <%= tag.fontSize %>px; opacity: <%= 0.6 + tag.weight * 0.4 %>"
        title="<%= tag.count %> 篇文章"
      >
        <%= tag.name %>
      </a>
    <% }) %>
  </div>
</div>

<!-- themes/your-theme/layout/timeline.ejs -->
<div class="timeline-page">
  <h1><%= page.title %></h1>
  
  <div class="timeline">
    <% page.years.forEach(year => { %>
      <div class="timeline-year">
        <h2><%= year %></h2>
        
        <% Object.keys(page.timeline[year]).sort((a, b) => b - a).forEach(month => { %>
          <div class="timeline-month">
            <h3><%= month %> 月</h3>
            <ul>
              <% page.timeline[year][month].forEach(post => { %>
                <li>
                  <time><%= post.date.format('MM-DD') %></time>
                  <a href="<%- url_for(post.path) %>"><%= post.title %></a>
                  <% if (post.tags.length > 0) { %>
                    <span class="tags">
                      <% post.tags.slice(0, 3).forEach(tag => { %>
                        <span class="tag"><%= tag.name %></span>
                      <% }) %>
                    </span>
                  <% } %>
                </li>
              <% }) %>
            </ul>
          </div>
        <% }) %>
      </div>
    <% }) %>
  </div>
</div>
```

#### 变量作用域的最佳实践

```javascript
// themes/your-theme/scripts/best-practices.js

// ✅ 好的做法：使用命名空间避免冲突
hexo.extend.helper.register('mytheme_utils', function() {
  return {
    formatDate: (date) => date.format('YYYY-MM-DD'),
    truncate: (text, length) => text.substring(0, length) + '...',
    // 更多工具函数...
  };
});

// ❌ 避免：污染全局作用域
hexo.extend.filter.register('template_locals', function(locals) {
  // 不要这样做
  global.myCustomData = 'some data';
  return locals;
});

// ✅ 好的做法：在 locals 中添加命名空间的数据
hexo.extend.filter.register('template_locals', function(locals) {
  locals.mytheme = {
    version: '1.0.0',
    features: ['dark-mode', 'search', 'toc'],
    custom_data: 'some data'
  };
  return locals;
});

// ✅ 好的做法：根据页面类型有条件地添加数据
hexo.extend.filter.register('template_locals', function(locals) {
  // 只在需要的页面添加重量级数据
  if (locals.page.need_heavy_data) {
    locals.heavy_data = computeExpensiveData();
  }
  return locals;
});

// ✅ 好的做法：缓存计算结果
const cache = new Map();

hexo.extend.helper.register('expensive_calculation', function() {
  const cacheKey = 'my_calculation';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = performExpensiveCalculation();
  cache.set(cacheKey, result);
  
  return result;
});
```

---

## 3. 路由系统 (Router)

### 概念介绍

路由系统负责将 URL 映射到具体的生成器和模板，决定了网站的 URL 结构和页面生成逻辑。

### 默认路由规则

Hexo 有几种默认的路由模式：

```yaml
# _config.yml 中的路由配置
permalink: :year/:month/:day/:title/
tag_dir: tags
category_dir: categories
archive_dir: archives
```

### 自定义路由

**创建自定义页面路由**

```javascript
// themes/your-theme/scripts/custom-route.js
hexo.extend.generator.register('custom-page', function(locals) {
  return {
    path: 'custom-page/index.html',
    data: locals.posts,
    layout: 'custom-layout'
  };
});
```

**动态路由生成**

```javascript
hexo.extend.generator.register('author-pages', function(locals) {
  const authors = new Set();
  
  // 收集所有作者
  locals.posts.forEach(post => {
    if (post.author) authors.add(post.author);
  });
  
  // 为每个作者生成页面
  return Array.from(authors).map(author => ({
    path: `author/${author}/index.html`,
    data: {
      author: author,
      posts: locals.posts.filter(p => p.author === author)
    },
    layout: 'author'
  }));
});
```

### 路由优先级

```javascript
// 高优先级路由（先匹配）
hexo.route.set('special-page.html', function() {
  return 'Special content';
});

// 普通路由
hexo.extend.generator.register('normal-generator', function(locals) {
  // 生成逻辑
});
```

---

## 4. Box - 文件处理系统

### 概念介绍

Box 是 Hexo 的文件处理抽象层，负责监控、读取和处理项目中的文件。每个 Box 实例代表一个文件夹，可以监听文件变化并触发相应的处理器。

### Box 的类型

Hexo 中有几个预定义的 Box，分别用于处理特定的文件夹：

```javascript
hexo.source    // source 文件夹
hexo.theme     // themes/主题名 文件夹
hexo.public    // public 文件夹
```

### 文件处理器

**注册处理器**

```javascript
// 处理 Markdown 文件
hexo.extend.processor.register('posts/:slug.md', function(file) {
  const data = {
    title: file.data.title,
    date: file.data.date,
    content: file.content
  };
  
  return data;
});

// 处理自定义文件类型
hexo.extend.processor.register('data/**/*.json', function(file) {
  // 处理 JSON 数据文件
  const jsonData = JSON.parse(file.content);
  return processCustomData(jsonData);
});
```

**监听文件变化**

```javascript
hexo.source.on('processAfter', function(file) {
  console.log('文件处理完成:', file.path);
});

hexo.source.on('processBefore', function(file) {
  console.log('准备处理文件:', file.path);
});
```

### 实战：自定义数据文件夹

```javascript
// scripts/custom-box.js
const Box = require('hexo-fs');

hexo.extend.processor.register('_data/**/*.yml', function(file) {
  const name = file.path.replace(/^_data\//, '').replace(/\.yml$/, '');
  
  hexo.locals.set(name, () => {
    return hexo.render.render({
      path: file.source,
      engine: 'yaml'
    });
  });
});
```

---

## 5. 渲染引擎 (Renderer)

### 概念介绍

渲染引擎负责将源文件转换为 HTML。Hexo 支持多种模板引擎和标记语言，通过渲染器系统实现灵活的内容转换。

### 常用渲染器

```javascript
// Markdown 渲染器（默认）
hexo.config.markdown = {
  preset: 'default',
  render: {
    html: true,
    breaks: true
  }
};

// EJS 模板渲染器
// 直接在 .ejs 文件中使用

// Stylus 样式渲染器
hexo.config.stylus = {
  compress: true
};
```

### 注册自定义渲染器

```javascript
// 注册 Pug 渲染器
hexo.extend.renderer.register('pug', 'html', function(data, options) {
  const pug = require('pug');
  return pug.compile(data.text)(options);
}, true);

// 注册自定义 Markdown 扩展
hexo.extend.renderer.register('md', 'html', function(data, options) {
  const marked = require('marked');
  
  // 自定义渲染规则
  const renderer = new marked.Renderer();
  renderer.heading = function(text, level) {
    return `<h${level} class="custom-heading">${text}</h${level}>`;
  };
  
  return marked(data.text, { renderer });
}, true);
```

### 渲染流程

```javascript
// 手动触发渲染
hexo.render.render({
  text: '# Hello World',
  engine: 'markdown'
}).then(result => {
  console.log(result); // <h1>Hello World</h1>
});

// 渲染文件
hexo.render.render({
  path: 'path/to/file.md'
}).then(result => {
  // 渲染结果
});
```

### 渲染器配置优化

```javascript
// themes/your-theme/scripts/renderer-config.js
hexo.on('ready', function() {
  // 配置代码高亮
  hexo.config.highlight = {
    enable: true,
    line_number: true,
    auto_detect: true,
    tab_replace: '  ',
    wrap: true,
    hljs: false
  };
  
  // 配置 Markdown 渲染选项
  hexo.config.marked = {
    gfm: true,
    pedantic: false,
    breaks: true,
    smartLists: true,
    smartypants: true
  };
});
```

---

## 6. 文章数据模型 (Post)

### 概念介绍

文章是 Hexo 中最核心的内容类型，包含了丰富的元数据和内容信息。理解文章的数据结构对于主题开发至关重要。

### 文章属性

```javascript
// 文章对象的主要属性
{
  title: '文章标题',
  date: Date,          // 发布日期
  updated: Date,       // 更新日期
  comments: true,      // 是否开启评论
  layout: 'post',      // 布局类型
  content: '...',      // 文章内容（HTML）
  excerpt: '...',      // 文章摘要
  more: '...',         // "阅读更多"后的内容
  source: '...',       // 源文件路径
  full_source: '...',  // 完整源文件路径
  path: '...',         // 文章URL路径
  permalink: '...',    // 完整URL
  categories: [],      // 分类
  tags: [],           // 标签
  photos: [],         // 相册
  link: '',           // 外部链接
  raw: '',            // 原始内容（Markdown）
  published: true,    // 是否发布
  _content: '...',    // 原始内容
  _id: '...'          // 唯一标识
}
```

### Front-matter 使用

```markdown
---
title: Hexo 主题开发入门
date: 2025-01-15 10:00:00
updated: 2025-01-16 15:30:00
tags: 
  - Hexo
  - 主题开发
categories:
  - 技术教程
  - 前端开发
excerpt: 这是一篇关于 Hexo 主题开发的详细教程
cover: /images/hexo-cover.jpg
author: Mahoo
custom_field: 自定义数据
---

文章正文内容...

<!-- more -->

更多内容...
```

### 访问和操作文章

```ejs
<!-- 遍历所有文章 -->
<% site.posts.sort('date', -1).each(function(post) { %>
  <article>
    <h2>
      <a href="<%- url_for(post.path) %>"><%= post.title %></a>
    </h2>
    <time><%= date(post.date, 'YYYY-MM-DD') %></time>
    
    <!-- 分类 -->
    <% if (post.categories && post.categories.length) { %>
      <div class="categories">
        <% post.categories.each(function(cat) { %>
          <a href="<%- url_for(cat.path) %>"><%= cat.name %></a>
        <% }) %>
      </div>
    <% } %>
    
    <!-- 标签 -->
    <% if (post.tags && post.tags.length) { %>
      <div class="tags">
        <% post.tags.each(function(tag) { %>
          <span><%= tag.name %></span>
        <% }) %>
      </div>
    <% } %>
    
    <!-- 摘要 -->
    <% if (post.excerpt) { %>
      <%- post.excerpt %>
      <a href="<%- url_for(post.path) %>">阅读更多</a>
    <% } else { %>
      <%- truncate(strip_html(post.content), {length: 200}) %>
    <% } %>
  </article>
<% }) %>
```

### 文章过滤和排序

```ejs
<!-- 获取最新的5篇文章 -->
<% site.posts.sort('date', -1).limit(5).each(function(post) { %>
  <li><a href="<%- url_for(post.path) %>"><%= post.title %></a></li>
<% }) %>

<!-- 按分类过滤 -->
<% site.posts.find({categories: 'Tech'}).each(function(post) { %>
  <%= post.title %>
<% }) %>

<!-- 按标签过滤 -->
<% site.posts.filter(function(post) {
  return post.tags.some(function(tag) {
    return tag.name === 'JavaScript';
  });
}).each(function(post) { %>
  <%= post.title %>
<% }) %>

<!-- 获取置顶文章 -->
<% site.posts.filter(function(post) {
  return post.sticky || post.top;
}).sort('sticky', -1).each(function(post) { %>
  <li class="pinned"><%= post.title %></li>
<% }) %>
```

---

## 7. 模板脚手架 (Scaffold)

### 概念介绍

Scaffold 是用于创建新文章的模板文件，定义了不同类型内容的默认结构和 Front-matter。

### 默认 Scaffold

Hexo 提供了三种默认脚手架：

**post.md** - 文章模板

```markdown
---
title: {{ title }}
date: {{ date }}
tags:
categories:
---
```

**page.md** - 页面模板

```markdown
---
title: {{ title }}
date: {{ date }}
---
```

**draft.md** - 草稿模板

```markdown
---
title: {{ title }}
tags:
---
```

### 自定义 Scaffold

**创建自定义模板**

```bash
# scaffolds/photo.md
---
title: {{ title }}
date: {{ date }}
photos:
  - 
tags:
  - 摄影
categories:
  - 相册
layout: photo
---

<!-- 照片描述 -->
```

**使用自定义模板**

```bash
hexo new photo "美丽的风景"
```

### 高级 Scaffold 技巧

**使用变量和逻辑**

```markdown
---
title: {{ title }}
date: {{ date }}
author: {{ author || '匿名' }}
tags:
categories:
  - {{ category || '未分类' }}
cover: /images/default-cover.jpg
toc: true
comments: true
description: {{ description || title }}
keywords: {{ keywords || title }}
---

## 简介

{{ title }} 的详细内容...

## 正文

<!-- 在这里编写内容 -->

## 总结

---

**相关文章推荐：**

- 
```

**项目特定的 Scaffold**

```markdown
# scaffolds/tutorial.md
---
title: {{ title }}
subtitle: {{ subtitle }}
date: {{ date }}
updated: {{ date }}
author: {{ author }}
series: 教程系列
tags:
  - 教程
categories:
  - 技术文档
difficulty: 初级
time_required: 30分钟
cover: /images/tutorial-cover.jpg
toc: true
---

## 📚 教程概述

### 学习目标

- 
- 

### 前置要求

- 
- 

---

## 📝 正文内容

### 步骤一：准备工作

### 步骤二：核心实现

### 步骤三：测试验证

---

## 🎯 总结

### 关键要点

### 下一步

---

## 📖 参考资料

- 
```

### 程序化生成 Scaffold

```javascript
// scripts/scaffold-generator.js
hexo.extend.filter.register('new_post_path', function(data, replace) {
  // 根据分类自动组织文件路径
  if (data.categories && data.categories.length > 0) {
    const category = data.categories[0];
    return `source/_posts/${category}/${data.slug}.md`;
  }
  return data.path;
});

// 自动添加默认 Front-matter
hexo.extend.filter.register('before_post_render', function(data) {
  if (!data.author) {
    data.author = this.config.author;
  }
  if (!data.cover) {
    data.cover = '/images/default-cover.jpg';
  }
  return data;
});
```

---

## 核心概念关系图

```
┌─────────────────────────────────────────────┐
│              Hexo 核心系统                   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐        ┌──────────┐           │
│  │  Events  │◄──────►│  Router  │           │
│  │  事件系统 │        │  路由系统 │           │
│  └────┬─────┘        └────┬─────┘           │
│       │                   │                 │
│       ▼                   ▼                 │
│  ┌──────────┐        ┌──────────┐           │
│  │   Box    │◄──────►│ Renderer │           │
│  │ 文件处理  │        │ 渲染引擎  │           │
│  └────┬─────┘        └────┬─────┘           │
│       │                   │                 │
│       └────────┬──────────┘                 │
│                ▼                            │
│         ┌─────────────┐                     │
│         │Local Vars   │                     │
│         │  本地变量    │                     │
│         └──────┬──────┘                     │
│                │                            │
│       ┌────────┴────────┐                   │
│       ▼                 ▼                   │
│  ┌─────────┐      ┌──────────┐              │
│  │  Post   │      │ Scaffold │              │
│  │  文章    │      │  模板    │              │
│  └─────────┘      └──────────┘              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 实战：整合核心概念

让我们通过一个完整的例子来整合这些核心概念：

```javascript
// themes/your-theme/scripts/reading-time.js

/**
 * 功能：计算文章阅读时间并生成阅读统计页面
 * 涉及概念：事件、本地变量、路由、Box、渲染、文章
 */

// 1. 注册 Helper（本地变量扩展）
hexo.extend.helper.register('reading_time', function(content) {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
});

// 2. 在文章处理时添加阅读时间（事件 + Box）
hexo.extend.filter.register('before_post_render', function(data) {
  if (data.content) {
    const readingTime = this.extend.helper.get('reading_time').bind(this)(data.content);
    data.reading_time = readingTime;
  }
  return data;
});

// 3. 创建阅读统计路由（路由系统）
hexo.extend.generator.register('reading-stats', function(locals) {
  const posts = locals.posts.sort('date', -1);
  const stats = {
    total_posts: posts.length,
    total_reading_time: 0,
    avg_reading_time: 0,
    posts_by_time: []
  };
  
  posts.forEach(post => {
    if (post.reading_time) {
      stats.total_reading_time += post.reading_time;
      stats.posts_by_time.push({
        title: post.title,
        path: post.path,
        reading_time: post.reading_time
      });
    }
  });
  
  stats.avg_reading_time = Math.ceil(stats.total_reading_time / stats.total_posts);
  
  return {
    path: 'reading-stats/index.html',
    data: stats,
    layout: 'reading-stats'
  };
});

// 4. 在生成后输出统计信息（事件）
hexo.on('generateAfter', function() {
  const posts = this.locals.get('posts');
  const totalTime = posts.reduce((sum, post) => sum + (post.reading_time || 0), 0);
  console.log(`📚 总计 ${posts.length} 篇文章，预计阅读时间 ${totalTime} 分钟`);
});
```

**对应的模板文件：**

```ejs
<!-- themes/your-theme/layout/reading-stats.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>阅读统计 - <%= config.title %></title>
</head>
<body>
  <h1>📊 阅读统计</h1>
  
  <div class="stats-overview">
    <div class="stat-item">
      <h3>总文章数</h3>
      <p><%= page.total_posts %></p>
    </div>
    <div class="stat-item">
      <h3>总阅读时间</h3>
      <p><%= page.total_reading_time %> 分钟</p>
    </div>
    <div class="stat-item">
      <h3>平均阅读时间</h3>
      <p><%= page.avg_reading_time %> 分钟</p>
    </div>
  </div>
  
  <h2>文章列表</h2>
  <ul>
    <% page.posts_by_time.forEach(function(post) { %>
      <li>
        <a href="<%- url_for(post.path) %>"><%= post.title %></a>
        <span>（约 <%= post.reading_time %> 分钟）</span>
      </li>
    <% }) %>
  </ul>
</body>
</html>
```

---

## 小结

本文介绍了 Hexo 主题开发的七大核心概念：

1. **事件系统**：响应 Hexo 生命周期的不同阶段
2. **本地变量**：在模板中访问网站数据
3. **路由系统**：管理 URL 和页面生成
4. **Box**：处理和监控文件系统
5. **渲染引擎**：转换各种格式为 HTML
6. **文章数据**：理解和操作文章对象
7. **模板脚手架**：快速创建标准化内容

这些概念构成了 Hexo 的**基础架构**，定义了：

- 📁 文件如何被读取和处理（Box）
- 🔄 内容如何被渲染（Renderer）
- 📄 数据如何被组织（Post、Local Variables）
- 🌐 页面如何被访问（Router）
- ⚡ 系统如何响应变化（Events）

如果说本章的核心概念是 Hexo 的"骨架"，那么下一章的**扩展系统**就是 Hexo 的"肌肉"。

核心概念告诉我们Hexo **是什么， 如何工作**，扩展系统将告诉我们：如何**定制和扩展** Hexo，如何**创造**新功能。

## 参考资源

- [Hexo 官方文档](https://hexo.io/zh-cn/docs/)
- [Hexo API 文档](https://hexo.io/zh-cn/api/)
- [Hexo GitHub 仓库](https://github.com/hexojs/hexo)

​    