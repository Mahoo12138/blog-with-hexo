---
title: Hexo 主题开发系列教程（二）：扩展系统详解（下篇）
date: 2025-11-22 20:52:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---


## 前言

在[上篇教程](./hexo-theme-tutorial-02-part1.md)中，我们学习了 Console、Deployer 和 Filter 三个扩展组件。本篇将继续介绍剩余的七个扩展组件，它们更加深入地涉及页面生成、模板渲染和文件处理。

本篇内容：
- **Generator（生成器）** - 自定义页面生成逻辑
- **Helper（辅助函数）** - 模板工具函数
- **Injector（注入器）** - 动态注入代码片段
- **Migrator（迁移器）** - 数据迁移工具
- **Processor（处理器）** - 文件处理逻辑
- **Renderer（渲染引擎）** - 自定义渲染器
- **Tag（标签）** - 创建自定义模板标签

---

## 4. Generator（生成器）

### 概念介绍

Generator 负责生成网站的页面和路由。每个 Generator 返回一个或多个路由对象，告诉 Hexo 应该生成哪些页面、使用什么数据、使用什么布局。

- Generator 创建**路由系统**中的路由
- Generator 使用**本地变量**作为数据源
- Generator 指定使用哪个**模板**进行渲染

### 基础语法

```javascript
hexo.extend.generator.register(name, function(locals) {
  // 返回路由对象或路由对象数组
  return {
    path: 'path/to/page.html',
    data: { /* 页面数据 */ },
    layout: 'layout-name'
  };
});
```

### 路由对象结构

```javascript
{
  path: 'about/index.html',        // 输出路径
  data: {                          // 传递给模板的数据
    title: '关于',
    content: '...'
  },
  layout: ['about', 'page'],       // 布局模板（可以是数组，按顺序查找）
}
```

### 实战案例一：创建归档页面

```javascript
// themes/your-theme/scripts/generator-archive.js

hexo.extend.generator.register('archive', function(locals) {
  const posts = locals.posts.sort('date', -1);
  const perPage = this.config.per_page || 10;
  const paginationDir = this.config.pagination_dir || 'page';
  
  // 按年份分组
  const postsByYear = {};
  posts.forEach(post => {
    const year = post.date.year();
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });
  
  const routes = [];
  
  // 生成总归档页面（带分页）
  const totalPages = Math.ceil(posts.length / perPage);
  for (let i = 0; i < totalPages; i++) {
    const pagePosts = posts.slice(i * perPage, (i + 1) * perPage);
    
    routes.push({
      path: i === 0 ? 'archives/index.html' : `archives/${paginationDir}/${i + 1}/index.html`,
      data: {
        title: '归档',
        posts: pagePosts,
        total: posts.length,
        current: i + 1,
        total_pages: totalPages,
        prev: i > 0 ? (i === 1 ? 'archives/' : `archives/${paginationDir}/${i}/`) : null,
        next: i < totalPages - 1 ? `archives/${paginationDir}/${i + 2}/` : null
      },
      layout: ['archive', 'index']
    });
  }
  
  // 生成年度归档页面
  Object.keys(postsByYear).forEach(year => {
    const yearPosts = postsByYear[year];
    const yearPages = Math.ceil(yearPosts.length / perPage);
    
    for (let i = 0; i < yearPages; i++) {
      const pagePosts = yearPosts.slice(i * perPage, (i + 1) * perPage);
      
      routes.push({
        path: i === 0 
          ? `archives/${year}/index.html` 
          : `archives/${year}/${paginationDir}/${i + 1}/index.html`,
        data: {
          title: `${year} 年归档`,
          year: year,
          posts: pagePosts,
          total: yearPosts.length,
          current: i + 1,
          total_pages: yearPages,
          prev: i > 0 ? (i === 1 ? `archives/${year}/` : `archives/${year}/${paginationDir}/${i}/`) : null,
          next: i < yearPages - 1 ? `archives/${year}/${paginationDir}/${i + 2}/` : null
        },
        layout: ['archive-year', 'archive', 'index']
      });
    }
  });
  
  return routes;
});
```

### 实战案例二：标签云页面生成器

```javascript
// themes/your-theme/scripts/generator-tagcloud.js

hexo.extend.generator.register('tagcloud', function(locals) {
  if (!this.theme.tagcloud || !this.theme.tagcloud.enable) {
    return [];
  }
  
  const tags = locals.tags.sort('length', -1);
  
  // 计算标签权重
  const maxCount = tags.first() ? tags.first().length : 1;
  const minCount = tags.last() ? tags.last().length : 1;
  const range = maxCount - minCount || 1;
  
  const tagData = tags.map(tag => {
    const weight = (tag.length - minCount) / range;
    return {
      name: tag.name,
      slug: tag.slug,
      path: tag.path,
      count: tag.length,
      weight: weight,
      size: 12 + Math.round(weight * 20), // 12px - 32px
      color: getColorByWeight(weight)
    };
  });
  
  return {
    path: 'tags/cloud.html',
    data: {
      title: '标签云',
      tags: tagData,
      total_tags: tags.length,
      total_posts: locals.posts.length
    },
    layout: 'tagcloud'
  };
  
  function getColorByWeight(weight) {
    const hue = 200 + weight * 60; // 从蓝色到紫色
    return `hsl(${hue}, 70%, 50%)`;
  }
});
```

### 实战案例三：站点地图生成器

```javascript
// themes/your-theme/scripts/generator-sitemap.js

hexo.extend.generator.register('sitemap', function(locals) {
  const config = this.config;
  const posts = locals.posts.sort('date', -1);
  const pages = locals.pages;
  
  const urls = [];
  
  // 添加首页
  urls.push({
    loc: config.url + '/',
    lastmod: posts.first() ? posts.first().updated : new Date(),
    changefreq: 'daily',
    priority: 1.0
  });
  
  // 添加文章
  posts.forEach(post => {
    urls.push({
      loc: config.url + '/' + post.path,
      lastmod: post.updated,
      changefreq: 'weekly',
      priority: 0.8
    });
  });
  
  // 添加页面
  pages.forEach(page => {
    urls.push({
      loc: config.url + '/' + page.path,
      lastmod: page.updated,
      changefreq: 'monthly',
      priority: 0.6
    });
  });
  
  // 添加分类
  locals.categories.forEach(cat => {
    urls.push({
      loc: config.url + '/' + cat.path,
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 0.5
    });
  });
  
  // 添加标签
  locals.tags.forEach(tag => {
    urls.push({
      loc: config.url + '/' + tag.path,
      lastmod: new Date(),
      changefreq: 'weekly',
      priority: 0.5
    });
  });
  
  // 生成 XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod.toISOString()}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return {
    path: 'sitemap.xml',
    data: xml
  };
});
```

### 实战案例四：RSS Feed 生成器

```javascript
// themes/your-theme/scripts/generator-feed.js

hexo.extend.generator.register('feed', function(locals) {
  const config = this.config;
  const feedConfig = config.feed || {};
  
  if (!feedConfig.enable) return [];
  
  const posts = locals.posts
    .sort('date', -1)
    .limit(feedConfig.limit || 20);
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${config.title}]]></title>
    <link>${config.url}/</link>
    <description><![CDATA[${config.description}]]></description>
    <language>${config.language || 'zh-CN'}</language>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <lastBuildDate>${posts.first() ? posts.first().updated.toUTCString() : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${config.url}/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map(post => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${config.url}/${post.path}</link>
      <guid>${config.url}/${post.path}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt || post.content}]]></description>
      ${post.categories ? post.categories.map(cat => 
        `<category><![CDATA[${cat.name}]]></category>`
      ).join('\n      ') : ''}
    </item>`).join('\n')}
  </channel>
</rss>`;
  
  return {
    path: 'feed.xml',
    data: xml
  };
});
```

### 实战案例五：搜索索引生成器

```javascript
// themes/your-theme/scripts/generator-search.js

hexo.extend.generator.register('search', function(locals) {
  const config = this.config;
  const posts = locals.posts.sort('date', -1);
  
  const searchData = posts.map(post => {
    // 提取纯文本内容
    const content = post.content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // 限制内容长度
    
    return {
      title: post.title,
      url: post.path,
      date: post.date.format('YYYY-MM-DD'),
      categories: post.categories ? post.categories.map(c => c.name) : [],
      tags: post.tags ? post.tags.map(t => t.name) : [],
      content: content
    };
  });
  
  return {
    path: 'search.json',
    data: JSON.stringify(searchData)
  };
});
```

### Generator 最佳实践

```javascript
// 1. 条件生成
hexo.extend.generator.register('conditional', function(locals) {
  if (!this.theme.feature_enabled) {
    return []; // 不生成任何页面
  }
  
  // 生成页面
});

// 2. 动态路径
hexo.extend.generator.register('dynamic-path', function(locals) {
  return locals.posts.map(post => ({
    path: `${post.slug}/index.html`,
    data: post,
    layout: 'post'
  }));
});

// 3. 多布局回退
hexo.extend.generator.register('fallback-layout', function(locals) {
  return {
    path: 'special-page.html',
    data: {},
    layout: ['special', 'page', 'default'] // 按顺序查找布局
  };
});

// 4. 性能优化 - 避免重复计算
hexo.extend.generator.register('optimized', function(locals) {
  const cache = this._generatorCache = this._generatorCache || {};
  const cacheKey = `posts-${locals.posts.length}`;
  
  if (!cache[cacheKey]) {
    // 执行耗时计算
    cache[cacheKey] = expensiveCalculation(locals.posts);
  }
  
  return {
    path: 'stats.html',
    data: cache[cacheKey],
    layout: 'stats'
  };
});
```

---

## 5. Helper（辅助函数）

### 概念介绍

Helper 是在模板中可以直接调用的工具函数，用于格式化数据、生成 HTML 片段或执行常见操作。Hexo 内置了许多 Helper，你也可以注册自定义的。

- Helper 扩展**本地变量**的能力
- Helper 在**模板渲染**时被调用
- Helper 可以访问 Hexo 的所有 API

### 基础语法

```javascript
hexo.extend.helper.register(name, function(...args) {
  // 返回处理结果
  return result;
});
```

### 内置 Helper 回顾

Hexo 提供了丰富的内置 Helper：

```ejs
<!-- URL 相关 -->
<%- url_for(path) %>
<%- relative_url(from, to) %>
<%- gravatar(email) %>

<!-- 日期相关 -->
<%= date(date, format) %>
<%= time(date, format) %>
<%= full_date(date, format) %>
<%= moment(date).format('YYYY-MM-DD') %>

<!-- 字符串相关 -->
<%= strip_html(string) %>
<%= trim(string) %>
<%= truncate(string, {length: 20}) %>

<!-- 模板相关 -->
<%- partial('_partial/header') %>
<%- fragment_cache('sidebar', function() { %>
  <!-- 缓存的内容 -->
<% }) %>

<!-- 文章相关 -->
<%- list_categories() %>
<%- list_tags() %>
<%- list_archives() %>
<%- tagcloud() %>
```

### 实战案例一：阅读进度计算

```javascript
// themes/your-theme/scripts/helper-reading-progress.js

hexo.extend.helper.register('reading_progress', function(content) {
  if (!content) return null;
  
  // 计算字数
  const text = content.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).length;
  
  // 计算阅读时间（分钟）
  const readingSpeed = 200; // 每分钟字数
  const minutes = Math.ceil(words / readingSpeed);
  
  // 计算进度百分比（假设已读字数通过客户端 JS 传入）
  return {
    total_words: words,
    reading_time: minutes,
    reading_speed: readingSpeed,
    format_time: function() {
      if (minutes < 1) return '不到 1 分钟';
      if (minutes === 1) return '1 分钟';
      return `${minutes} 分钟`;
    }
  };
});
```

**在模板中使用：**
```ejs
<% const progress = reading_progress(page.content) %>
<div class="reading-info">
  <span>📖 <%= progress.total_words %> 字</span>
  <span>⏱️ 约 <%= progress.format_time() %></span>
</div>
```

### 实战案例二：相对时间显示

```javascript
// themes/your-theme/scripts/helper-time-ago.js

hexo.extend.helper.register('time_ago', function(date) {
  const now = Date.now();
  const past = date.valueOf();
  const diff = now - past;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} 分钟前`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} 小时前`;
  } else if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days} 天前`;
  } else if (diff < month) {
    const weeks = Math.floor(diff / week);
    return `${weeks} 周前`;
  } else if (diff < year) {
    const months = Math.floor(diff / month);
    return `${months} 个月前`;
  } else {
    const years = Math.floor(diff / year);
    return `${years} 年前`;
  }
});
```

### 实战案例三：图片处理 Helper

```javascript
// themes/your-theme/scripts/helper-image.js

hexo.extend.helper.register('responsive_image', function(src, alt, options = {}) {
  const url = this.url_for(src);
  
  // 生成不同尺寸的图片 URL
  const sizes = options.sizes || [320, 640, 960, 1280];
  const srcset = sizes
    .map(size => `${url}?w=${size} ${size}w`)
    .join(', ');
  
  const attrs = {
    src: url,
    alt: alt || '',
    loading: options.lazy ? 'lazy' : 'eager',
    srcset: srcset,
    sizes: options.sizes_attr || '(max-width: 768px) 100vw, 50vw'
  };
  
  if (options.class) {
    attrs.class = options.class;
  }
  
  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `<img ${attrString}>`;
});

// 图片懒加载 Helper
hexo.extend.helper.register('lazy_image', function(src, alt, placeholder) {
  const url = this.url_for(src);
  const placeholderUrl = placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
  
  return `
    <img 
      src="${placeholderUrl}" 
      data-src="${url}" 
      alt="${alt || ''}" 
      class="lazyload"
      loading="lazy"
    >
  `;
});
```

### 实战案例四：目录（TOC）生成器

```javascript
// themes/your-theme/scripts/helper-toc.js

hexo.extend.helper.register('toc', function(content, options = {}) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(content);
  
  const minLevel = options.min_depth || 1;
  const maxLevel = options.max_depth || 6;
  const selector = Array.from({length: maxLevel - minLevel + 1}, (_, i) => `h${minLevel + i}`).join(', ');
  
  const headings = [];
  $(selector).each(function(index) {
    const $heading = $(this);
    const level = parseInt(this.name.substring(1));
    const text = $heading.text();
    const id = $heading.attr('id') || text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // 确保标题有 ID
    if (!$heading.attr('id')) {
      $heading.attr('id', id);
    }
    
    headings.push({
      level: level,
      text: text,
      id: id,
      index: index
    });
  });
  
  if (headings.length === 0) {
    return '';
  }
  
  // 构建 TOC HTML
  let html = '<nav class="toc"><ol class="toc-list">';
  let currentLevel = minLevel;
  
  headings.forEach((heading, index) => {
    const nextHeading = headings[index + 1];
    const diff = heading.level - currentLevel;
    
    // 打开新的嵌套层级
    if (diff > 0) {
      html += '<ol class="toc-list">'.repeat(diff);
    }
    // 关闭嵌套层级
    else if (diff < 0) {
      html += '</li></ol>'.repeat(-diff) + '</li>';
    }
    // 关闭同级项
    else if (index > 0) {
      html += '</li>';
    }
    
    html += `<li class="toc-item toc-level-${heading.level}">`;
    html += `<a class="toc-link" href="#${heading.id}">`;
    html += `<span class="toc-text">${heading.text}</span>`;
    html += `</a>`;
    
    currentLevel = heading.level;
    
    // 如果没有下一个标题，或下一个标题级别更低，关闭当前项
    if (!nextHeading) {
      html += '</li>';
      html += '</ol>'.repeat(heading.level - minLevel + 1);
    }
  });
  
  html += '</nav>';
  
  return html;
});
```

**在模板中使用：**
```ejs
<% if (page.toc !== false) { %>
  <aside class="sidebar-toc">
    <h3>目录</h3>
    <%- toc(page.content, {min_depth: 2, max_depth: 4}) %>
  </aside>
<% } %>
```

### 实战案例五：代码高亮增强

```javascript
// themes/your-theme/scripts/helper-code.js

hexo.extend.helper.register('code_block', function(code, options = {}) {
  const lang = options.lang || 'text';
  const caption = options.caption || '';
  const showLineNumbers = options.line_numbers !== false;
  const highlight = options.highlight || [];
  
  // 分割代码行
  const lines = code.split('\n');
  
  let html = '<div class="code-block">';
  
  // 添加标题栏
  if (caption || lang) {
    html += '<div class="code-header">';
    if (caption) {
      html += `<span class="code-caption">${caption}</span>`;
    }
    html += `<span class="code-lang">${lang}</span>`;
    html += '<button class="copy-btn">复制</button>';
    html += '</div>';
  }
  
  html += '<pre><code>';
  
  // 添加行号和代码
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const isHighlight = highlight.includes(lineNum);
    const lineClass = isHighlight ? 'line highlight' : 'line';
    
    if (showLineNumbers) {
      html += `<span class="${lineClass}" data-line="${lineNum}">`;
      html += `<span class="line-number">${lineNum}</span>`;
      html += `<span class="line-content">${escapeHtml(line)}</span>`;
      html += '</span>\n';
    } else {
      html += `<span class="${lineClass}">${escapeHtml(line)}</span>\n`;
    }
  });
  
  html += '</code></pre></div>';
  
  return html;
  
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
```

### 实战案例六：社交分享按钮

```javascript
// themes/your-theme/scripts/helper-share.js

hexo.extend.helper.register('share_buttons', function(options = {}) {
  const page = this.page;
  const config = this.config;
  
  const url = encodeURIComponent(config.url + '/' + page.path);
  const title = encodeURIComponent(page.title);
  const summary = encodeURIComponent(page.excerpt || page.title);
  
  const platforms = options.platforms || ['twitter', 'facebook', 'linkedin', 'weibo'];
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    weibo: `https://service.weibo.com/share/share.php?url=${url}&title=${title}`,
    telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`
  };
  
  const icons = {
    twitter: '🐦',
    facebook: '📘',
    linkedin: '💼',
    weibo: '🎐',
    telegram: '✈️',
    whatsapp: '💬'
  };
  
  let html = '<div class="share-buttons">';
  
  platforms.forEach(platform => {
    if (shareLinks[platform]) {
      html += `
        <a 
          href="${shareLinks[platform]}" 
          class="share-btn share-${platform}"
          target="_blank"
          rel="noopener noreferrer"
          title="分享到 ${platform}"
        >
          <span class="icon">${icons[platform]}</span>
          <span class="name">${platform}</span>
        </a>
      `;
    }
  });
  
  html += '</div>';
  
  return html;
});
```

### Helper 最佳实践

```javascript
// 1. 使用 this 访问 Hexo 上下文
hexo.extend.helper.register('my_helper', function() {
  const config = this.config;
  const page = this.page;
  const theme = this.theme;
  
  // 使用上下文数据
});

// 2. 返回 HTML 时确保安全
hexo.extend.helper.register('safe_html', function(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return escaped;
});

// 3. 支持选项参数
hexo.extend.helper.register('flexible_helper', function(data, options = {}) {
  const defaults = {
    format: 'short',
    max: 10
  };
  
  const opts = Object.assign({}, defaults, options);
  
  // 使用合并后的选项
});

// 4. 缓存昂贵的计算
const helperCache = new Map();

hexo.extend.helper.register('cached_helper', function(key) {
  if (!helperCache.has(key)) {
    const result = expensiveCalculation(key);
    helperCache.set(key, result);
  }
  
  return helperCache.get(key);
});

// 5. 返回可链式调用的对象
hexo.extend.helper.register('chainable', function(data) {
  return {
    format: function(fmt) {
      // 格式化
      return this;
    },
    limit: function(n) {
      // 限制
      return this;
    },
    toString: function() {
      // 最终输出
      return result;
    }
  };
});
```

---

## 6. Injector（注入器）

### 概念介绍

Injector 允许你在生成的 HTML 的特定位置注入代码片段，比如在 `<head>` 或 `</body>` 标签前注入脚本、样式等。

- Injector 在**渲染引擎**完成后介入
- Injector 修改最终的 HTML 输出

### 基础语法

```javascript
hexo.extend.injector.register(entry_point, value, to);
```

### 注入点（Entry Points）

```javascript
'head_begin'    // <head> 之后
'head_end'      // </head> 之前
'body_begin'    // <body> 之后
'body_end'      // </body> 之前
```

### 实战案例一：注入分析代码

```javascript
// themes/your-theme/scripts/injector-analytics.js

hexo.extend.injector.register('head_end', function() {
  const analytics = this.theme.analytics;
  
  if (!analytics || !analytics.enable) {
    return '';
  }
  
  // Google Analytics
  if (analytics.google_id) {
    return `
      <script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.google_id}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${analytics.google_id}');
      </script>
    `;
  }
  
  // 百度统计
  if (analytics.baidu_id) {
    return `
      <script>
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?${analytics.baidu_id}";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
      </script>
    `;
  }
  
  return '';
});
```

### 实战案例二：注入暗色模式切换器

```javascript
// themes/your-theme/scripts/injector-dark-mode.js

hexo.extend.injector.register('head_end', function() {
  if (!this.theme.dark_mode || !this.theme.dark_mode.enable) {
    return '';
  }
  
  return `
    <script>
      (function() {
        const theme = localStorage.getItem('theme') || '${this.theme.dark_mode.default || 'light'}';
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
    <style>
      :root[data-theme="dark"] {
        --bg-color: #1a1a1a;
        --text-color: #e0e0e0;
        --link-color: #4dabf7;
      }
      :root[data-theme="light"] {
        --bg-color: #ffffff;
        --text-color: #333333;
        --link-color: #1971c2;
      }
      body {
        background-color: var(--bg-color);
        color: var(--text-color);
      }
    </style>
  `;
});

hexo.extend.injector.register('body_end', function() {
  if (!this.theme.dark_mode || !this.theme.dark_mode.enable) {
    return '';
  }
  
  return `
    <button id="theme-toggle" aria-label="切换主题">
      <span class="icon-sun">☀️</span>
      <span class="icon-moon">🌙</span>
    </button>
    <script>
      const toggle = document.getElementById('theme-toggle');
      toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    </script>
  `;
});
```

### 实战案例三：注入性能监控

```javascript
// themes/your-theme/scripts/injector-performance.js

hexo.extend.injector.register('body_end', function() {
  if (this.env.cmd !== 'generate' || !this.theme.performance_monitor) {
    return '';
  }
  
  return `
    <script>
      window.addEventListener('load', function() {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        console.log('Page Load Time:', loadTime + 'ms');
        console.log('DOM Ready Time:', domReadyTime + 'ms');
        
        // 发送到分析服务
        if (typeof gtag !== 'undefined') {
          gtag('event', 'timing_complete', {
            'name': 'load',
            'value': loadTime,
            'event_category': 'Performance'
          });
        }
      });
    </script>
  `;
});
```

### 实战案例四：注入搜索功能

```javascript
// themes/your-theme/scripts/injector-search.js

hexo.extend.injector.register('body_end', function() {
  if (!this.theme.search || !this.theme.search.enable) {
    return '';
  }
  
  return `
    <div id="search-overlay" class="search-overlay">
      <div class="search-container">
        <input 
          type="search" 
          id="search-input" 
          placeholder="搜索文章..."
          autocomplete="off"
        >
        <div id="search-results"></div>
      </div>
    </div>
    
    <script src="${this.url_for('/js/search.js')}"></script>
    <script>
      const searchData = '${this.url_for('/search.json')}';
      const search = new Search(searchData);
      
      document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('search-overlay').classList.add('active');
          document.getElementById('search-input').focus();
        }
      });
    </script>
  `;
});
```

### 实战案例五：条件性注入

```javascript
// themes/your-theme/scripts/injector-conditional.js

// 只在文章页面注入评论系统
hexo.extend.injector.register('body_end', function() {
  const page = this.page;
  
  // 只在文章页面且未禁用评论时注入
  if (page.layout !== 'post' || page.comments === false) {
    return '';
  }
  
  const comments = this.theme.comments;
  
  if (!comments || !comments.enable) {
    return '';
  }
  
  // Disqus
  if (comments.provider === 'disqus') {
    return `
      <div id="disqus_thread"></div>
      <script>
        var disqus_config = function () {
          this.page.url = '${this.config.url}/${page.path}';
          this.page.identifier = '${page._id}';
        };
        (function() {
          var d = document, s = d.createElement('script');
          s.src = 'https://${comments.disqus.shortname}.disqus.com/embed.js';
          s.setAttribute('data-timestamp', +new Date());
          (d.head || d.body).appendChild(s);
        })();
      </script>
    `;
  }
  
  // Gitalk
  if (comments.provider === 'gitalk') {
    return `
      <div id="gitalk-container"></div>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
      <script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>
      <script>
        const gitalk = new Gitalk({
          clientID: '${comments.gitalk.client_id}',
          clientSecret: '${comments.gitalk.client_secret}',
          repo: '${comments.gitalk.repo}',
          owner: '${comments.gitalk.owner}',
          admin: ['${comments.gitalk.admin}'],
          id: '${page._id}',
          distractionFreeMode: false
        });
        gitalk.render('gitalk-container');
      </script>
    `;
  }
  
  return '';
});
```

### Injector 最佳实践

```javascript
// 1. 使用函数返回动态内容
hexo.extend.injector.register('head_end', function() {
  // 可以访问 this.config, this.theme, this.page 等
  return `<meta name="author" content="${this.config.author}">`;
});

// 2. 条件注入
hexo.extend.injector.register('body_end', function() {
  if (this.page.custom_script) {
    return `<script src="${this.page.custom_script}"></script>`;
  }
  return '';
});

// 3. 注入顺序控制（第三个参数）
hexo.extend.injector.register('head_end', '<style>/* 样式1 */</style>', 'home');
hexo.extend.injector.register('head_end', '<style>/* 样式2 */</style>', 'post');
hexo.extend.injector.register('head_end', '<style>/* 样式3 */</style>', 'default');

// 4. 避免重复注入
hexo.extend.injector.register('head_end', function() {
  if (this._injectedCustomCode) {
    return '';
  }
  this._injectedCustomCode = true;
  return '<script>/* 只注入一次 */</script>';
});
```

---

## 7. Migrator（迁移器）

### 概念介绍

Migrator 用于从其他博客平台迁移内容到 Hexo。虽然不是主题开发的核心，但了解它有助于为用户提供迁移工具。

### 基础语法

```javascript
hexo.extend.migrator.register(name, function(args) {
  // 迁移逻辑
});
```

### 实战案例：从 WordPress 迁移

```javascript
// themes/your-theme/scripts/migrator-wordpress.js

hexo.extend.migrator.register('wordpress', function(args) {
  const fs = require('hexo-fs');
  const path = require('path');
  const xml2js = require('xml2js');
  
  const xmlFile = args._[0];
  
  if (!xmlFile) {
    hexo.log.error('请指定 WordPress 导出的 XML 文件');
    hexo.log.info('用法: hexo migrate wordpress <file.xml>');
    return;
  }
  
  return new Promise((resolve, reject) => {
    fs.readFile(xmlFile, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      
      xml2js.parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }
        
        const posts = result.rss.channel[0].item || [];
        let converted = 0;
        
        posts.forEach(item => {
          const post = {
            title: item.title[0],
            date: new Date(item.pubDate[0]),
            content: item['content:encoded'][0],
            categories: item.category ? item.category.filter(c => c.$.domain === 'category').map(c => c._) : [],
            tags: item.category ? item.category.filter(c => c.$.domain === 'post_tag').map(c => c._) : []
          };
          
          const filename = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          const filepath = path.join(hexo.source_dir, '_posts', `${filename}.md`);
          
          const frontMatter = `---
title: ${post.title}
date: ${post.date.toISOString()}
categories:
${post.categories.map(c => `  - ${c}`).join('\n')}
tags:
${post.tags.map(t => `  - ${t}`).join('\n')}
---

${post.content}`;
          
          fs.writeFileSync(filepath, frontMatter);
          converted++;
          
          hexo.log.info(`已转换: ${post.title}`);
        });
        
        hexo.log.success(`成功迁移 ${converted} 篇文章！`);
        resolve();
      });
    });
  });
});
```

---

## 8. Processor（处理器）

### 概念介绍

Processor 处理源文件夹中的文件，决定如何解析和存储这些文件的数据。

- Processor 操作 **Box** 中的文件
- Processor 创建**文章数据**对象
- Processor 在**事件系统**的早期阶段执行

### 基础语法

```javascript
hexo.extend.processor.register(pattern, function(file) {
  // 处理文件
});
```

### 实战案例：处理数据文件

```javascript
// themes/your-theme/scripts/processor-data.js

hexo.extend.processor.register('_data/**/*.{json,yaml,yml}', function(file) {
  const path = require('path');
  const yaml = require('js-yaml');
  
  const type = file.type;
  const filePath = file.path;
  
  if (type === 'delete') {
    // 文件被删除
    const name = path.basename(filePath, path.extname(filePath));
    delete hexo.locals.get('data')[name];
    return;
  }
  
  const name = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);
  
  return file.read().then(content => {
    let data;
    
    if (ext === '.json') {
      data = JSON.parse(content);
    } else {
      data = yaml.load(content);
    }
    
    // 存储数据
    hexo.locals.set(name, () => data);
    
    hexo.log.info(`数据文件已加载: ${name}`);
  });
});
```

---

## 9. Renderer（渲染引擎）

### 概念介绍

Renderer 将特定格式的文件转换为其他格式，最常见的是将 Markdown 转换为 HTML。

- Renderer 是**渲染引擎**的具体实现
- Renderer 在**文章**处理流程中被调用

### 基础语法

```javascript
hexo.extend.renderer.register(inputExt, outputExt, function(data, options) {
  // 返回渲染结果
}, sync);
```

### 实战案例：自定义 Markdown 渲染器

```javascript
// themes/your-theme/scripts/renderer-markdown.js

hexo.extend.renderer.register('md', 'html', function(data, options) {
  const marked = require('marked');
  
  // 自定义渲染器
  const renderer = new marked.Renderer();
  
  // 自定义标题渲染
  renderer.heading = function(text, level) {
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return `
      <h${level} id="${id}" class="article-heading">
        <a href="#${id}" class="heading-anchor">#</a>
        ${text}
      </h${level}>
    `;
  };
  
  // 自定义链接渲染
  renderer.link = function(href, title, text) {
    const isExternal = /^https?:\/\//.test(href);
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr}${attrs}>${text}</a>`;
  };
  
  // 自定义代码块渲染
  renderer.code = function(code, language) {
    const lang = language || 'text';
    return `
      <div class="code-block">
        <div class="code-header">
          <span class="lang">${lang}</span>
          <button class="copy-btn">复制</button>
        </div>
        <pre><code class="language-${lang}">${code}</code></pre>
      </div>
    `;
  };
  
  // 配置 marked
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true
  });
  
  return marked(data.text);
}, true);
```

---

## 10. Tag（标签）

### 概念介绍

Tag 允许你在文章中使用自定义标签，这些标签会在渲染时被处理成特定的 HTML。

- Tag 扩展了**模板脚手架**的能力
- Tag 在**渲染引擎**处理时被解析

### 基础语法

```javascript
// 简单标签
hexo.extend.tag.register(name, function(args, content) {
  // 返回 HTML
});

// 块级标签
hexo.extend.tag.register(name, function(args, content) {
  // 返回 HTML
}, {ends: true});
```

### 实战案例一：提示框标签

```javascript
// themes/your-theme/scripts/tag-note.js

hexo.extend.tag.register('note', function(args, content) {
  const type = args[0] || 'default';
  const title = args.slice(1).join(' ');
  
  const icons = {
    default: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '❌',
    info: 'ℹ️'
  };
  
  const icon = icons[type] || icons.default;
  const titleHtml = title ? `<div class="note-title">${icon} ${title}</div>` : '';
  
  return `
    <div class="note note-${type}">
      ${titleHtml}
      <div class="note-content">
        ${hexo.render.renderSync({text: content, engine: 'markdown'})}
      </div>
    </div>
  `;
}, {ends: true});
```

**使用方法：**
```markdown
{% note success 成功提示 %}
这是一条成功消息！
{% endnote %}

{% note warning %}
这是一条警告消息！
{% endnote %}
```

### 实战案例二：标签页标签

```javascript
// themes/your-theme/scripts/tag-tabs.js

let tabId = 0;

hexo.extend.tag.register('tabs', function(args, content) {
  const id = `tabs-${tabId++}`;
  const tabs = content.split('<!-- tab').filter(Boolean);
  
  let tabsHtml = `<div class="tabs" id="${id}">`;
  tabsHtml += '<ul class="tab-nav">';
  
  tabs.forEach((tab, index) => {
    const match = tab.match(/^([^-]+)-->/);
    const name = match ? match[1].trim() : `Tab ${index + 1}`;
    const active = index === 0 ? 'active' : '';
    
    tabsHtml += `
      <li class="tab-nav-item ${active}" data-tab="${index}">
        ${name}
      </li>
    `;
  });
  
  tabsHtml += '</ul><div class="tab-content">';
  
  tabs.forEach((tab, index) => {
    const content = tab.replace(/^[^>]+>/, '').replace(/<!-- endtab -->/, '').trim();
    const active = index === 0 ? 'active' : '';
    
    tabsHtml += `
      <div class="tab-pane ${active}" data-index="${index}">
        ${hexo.render.renderSync({text: content, engine: 'markdown'})}
      </div>
    `;
  });
  
  tabsHtml += '</div></div>';
  
  return tabsHtml;
}, {ends: true});
```

**使用方法：**
```markdown
{% tabs %}
<!-- tab JavaScript -->
这是 JavaScript 的内容
<!-- endtab -->

<!-- tab Python -->
这是 Python 的内容
<!-- endtab -->
{% endtabs %}
```

### 实战案例三：时间轴标签

```javascript
// themes/your-theme/scripts/tag-timeline.js

hexo.extend.tag.register('timeline', function(args, content) {
  const items = content.split('<!-- item').filter(Boolean);
  
  let html = '<div class="timeline">';
  
  items.forEach((item, index) => {
    const match = item.match(/^([^-]+)-->/);
    const date = match ? match[1].trim() : '';
    const itemContent = item.replace(/^[^>]+>/, '').replace(/<!-- enditem -->/, '').trim();
    
    html += `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-date">${date}</div>
        <div class="timeline-content">
          ${hexo.render.renderSync({text: itemContent, engine: 'markdown'})}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  return html;
}, {ends: true});
```

### 实战案例四：按钮标签

```javascript
// themes/your-theme/scripts/tag-button.js

hexo.extend.tag.register('button', function(args) {
  const url = args[0];
  const text = args.slice(1).join(' ');
  const icon = args.icon || '';
  
  return `
    <a href="${url}" class="btn-tag" target="_blank" rel="noopener noreferrer">
      ${icon ? `<i class="${icon}"></i>` : ''}
      <span>${text}</span>
    </a>
  `;
});
```

### Tag 最佳实践

```javascript
// 1. 异步标签
hexo.extend.tag.register('async_tag', async function(args) {
  const data = await fetchSomeData();
  return renderData(data);
}, {async: true});

// 2. 错误处理
hexo.extend.tag.register('safe_tag', function(args, content) {
  try {
    return processContent(content);
  } catch (err) {
    hexo.log.error('Tag 处理失败:', err);
    return `<div class="error">标签渲染失败</div>`;
  }
}, {ends: true});

// 3. 支持嵌套 Markdown
hexo.extend.tag.register('markdown_tag', function(args, content) {
  const processed = hexo.render.renderSync({
    text: content,
    engine: 'markdown'
  });
  return `<div class="custom">${processed}</div>`;
}, {ends: true});
```

---

## 完整示例：综合运用所有扩展

让我们创建一个完整的功能，综合运用本章学到的所有扩展：

```javascript
// themes/your-theme/scripts/feature-showcase.js

// 1. Console - 生成功能文档
hexo.extend.console.register('showcase:doc', '生成功能展示文档', function() {
  hexo.log.info('功能展示系统包含以下组件：');
  hexo.log.info('- Generator: 生成展示页面');
  hexo.log.info('- Helper: 提供模板函数');
  hexo.log.info('- Tag: 支持自定义标签');
  hexo.log.info('- Filter: 数据增强');
});

// 2. Generator - 生成展示页面
hexo.extend.generator.register('showcase', function(locals) {
  return {
    path: 'showcase/index.html',
    data: {
      title: '功能展示',
      features: getFeatures()
    },
    layout: 'showcase'
  };
  
  function getFeatures() {
    return [
      {name: 'Console', desc: '命令行工具'},
      {name: 'Generator', desc: '页面生成器'},
      {name: 'Helper', desc: '模板辅助函数'},
      {name: 'Tag', desc: '自定义标签'}
    ];
  }
});

// 3. Helper - 提供展示函数
hexo.extend.helper.register('showcase_badge', function(feature) {
  return `<span class="badge badge-${feature.toLowerCase()}">${feature}</span>`;
});

// 4. Filter - 增强文章数据
hexo.extend.filter.register('before_post_render', function(data) {
  if (data.showcase) {
    data.has_showcase = true;
  }
  return data;
});

// 5. Tag - 展示块标签
hexo.extend.tag.register('showcase', function(args, content) {
  const feature = args[0];
  return `
    <div class="showcase-block">
      <h3>${feature}</h3>
      <div class="showcase-content">${content}</div>
    </div>
  `;
}, {ends: true});

// 6. Injector - 注入展示样式
hexo.extend.injector.register('head_end', `
  <style>
    .showcase-block {
      border: 2px solid #4dabf7;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
`);
```

---

## 小结

本篇（下篇）完成了 Hexo 扩展系统的学习，介绍了：

4. **Generator（生成器）** - 创建自定义页面和路由
5. **Helper（辅助函数）** - 在模板中使用的工具函数
6. **Injector（注入器）** - 动态注入代码片段
7. **Migrator（迁移器）** - 数据迁移工具
8. **Processor（处理器）** - 处理源文件
9. **Renderer（渲染引擎）** - 自定义文件渲染
10. **Tag（标签）** - 创建自定义模板标签

至此，我们已经完整学习了 Hexo 的十大扩展系统。这些扩展让 Hexo 拥有了强大的可定制性和扩展性。

---

## 扩展系统总结

### 扩展的协作关系

```
数据流                           涉及的扩展
──────────────────────────────────────────────
源文件                  →  Processor
  ↓
解析数据                →  Renderer
  ↓
处理数据                →  Filter (before_post_render)
  ↓
渲染内容                →  Renderer
  ↓
增强数据                →  Filter (after_post_render)
  ↓
生成路由                →  Generator
  ↓
渲染模板                →  Helper + Tag
  ↓
输出 HTML               →  Filter (after_render)
  ↓
注入代码                →  Injector
  ↓
部署                    →  Deployer
```

### 选择合适的扩展

- **修改文章内容** → Filter
- **生成新页面** → Generator
- **模板工具函数** → Helper
- **文章中的特殊语法** → Tag
- **添加脚本/样式** → Injector
- **自动化任务** → Console
- **自定义部署** → Deployer
