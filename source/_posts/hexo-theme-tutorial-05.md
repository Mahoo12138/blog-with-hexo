# Hexo 主题开发系列教程（五）：插件系统与生态

## 前言

在前四章中，我们完成了一个功能完整的 Aurora 主题。本章将深入探讨 **Hexo 插件系统**，学习如何开发、使用和发布插件。

本章内容：
- 🔌 **插件机制** - 工作原理
- 📦 **插件开发** - 实战案例
- 🛠️ **常用插件** - 生态精选
- 🔗 **协作模式** - 主题与插件
- 📚 **发布管理** - NPM 包
- 🎯 **最佳实践** - 开发规范

---

## 第一部分：插件机制深度解析

### 1.1 插件 vs 主题 Scripts

#### 核心区别

| 特性 | 主题 Scripts | 插件 |
|------|-------------|------|
| 作用域 | 当前主题 | 全局 |
| 加载时机 | 主题启用时 | Hexo 启动时 |
| 适用场景 | 主题特定功能 | 通用功能 |
| 分发方式 | 随主题 | NPM 独立包 |
| 版本管理 | 跟随主题 | 独立版本 |

#### 何时使用插件

✅ **适合做成插件：**
- 通用功能（不依赖特定主题）
- 可复用（多个项目都能用）
- 独立维护（有独立版本管理）
- 社区分享（希望其他人也能用）

❌ **不适合做成插件：**
- 主题特定功能
- 简单定制（几行代码）
- 临时需求（一次性使用）

### 1.2 插件加载流程

```javascript
/**
 * Hexo 启动时的插件加载过程
 */

// 1. 初始化 Hexo 实例
const Hexo = require('hexo');
const hexo = new Hexo(process.cwd());

// 2. 加载配置
hexo.init()
  // 3. 扫描并加载插件
  .then(() => loadPlugins(hexo))
  // 4. 加载主题
  .then(() => hexo.loadTheme())
  // 5. 执行命令
  .then(() => hexo.call(command, args));
```

### 1.3 插件结构

**标准插件目录：**

```
hexo-plugin-example/
├── index.js              # 入口文件
├── lib/                  # 核心代码
│   ├── filter.js
│   ├── generator.js
│   └── helper.js
├── test/                 # 测试
├── package.json
└── README.md
```

**入口文件模式：**

```javascript
// 模式 1：函数式（最常用）
module.exports = function(hexo) {
  const config = Object.assign({
    enable: true
  }, hexo.config.plugin_example);
  
  if (!config.enable) return;
  
  // 注册扩展
  require('./lib/filter')(hexo);
  require('./lib/generator')(hexo);
};

// 模式 2：对象式
module.exports = {
  init: function(hexo) {
    // 初始化逻辑
  },
  metadata: {
    name: 'hexo-plugin-example',
    version: '1.0.0'
  }
};

// 模式 3：类式（复杂插件）
class Plugin {
  constructor(hexo) {
    this.hexo = hexo;
    this.config = this.loadConfig();
  }
  
  init() {
    this.registerFilters();
  }
}

module.exports = function(hexo) {
  const plugin = new Plugin(hexo);
  plugin.init();
};
```

---

## 第二部分：插件开发实战

### 2.1 案例：图片优化插件

一个完整的图片压缩插件，支持 JPG/PNG 压缩、WebP 生成和响应式图片。

**package.json**

```json
{
  "name": "hexo-image-optimizer",
  "version": "1.0.0",
  "description": "Optimize images for Hexo",
  "main": "index.js",
  "keywords": ["hexo", "plugin", "image"],
  "engines": {
    "node": ">=14.0.0",
    "hexo": ">=5.0.0"
  },
  "dependencies": {
    "sharp": "^0.32.0",
    "imagemin": "^8.0.0"
  }
}
```

**index.js**

```javascript
'use strict';

module.exports = function(hexo) {
  const config = Object.assign({
    enable: true,
    jpg: { quality: 80 },
    png: { quality: [0.6, 0.8] },
    webp: { enable: false }
  }, hexo.config.image_optimizer);
  
  if (!config.enable) return;
  
  // 生成后优化图片
  hexo.extend.filter.register('after_generate', async function() {
    const images = getAllImages(hexo.public_dir);
    
    for (const img of images) {
      await optimizeImage(img, config);
    }
    
    hexo.log.info(`[image-optimizer] Optimized ${images.length} images`);
  });
  
  // Helper：响应式图片
  hexo.extend.helper.register('responsive_image', function(src, alt) {
    return `
      <picture>
        <source srcset="${src}.webp" type="image/webp">
        <img src="${src}" alt="${alt}" loading="lazy">
      </picture>
    `;
  });
};
```

### 2.2 案例：阅读统计插件

记录和展示文章阅读量。

**核心功能：**

```javascript
module.exports = function(hexo) {
  const storage = require('./lib/storage')(hexo);
  
  // Helper：显示阅读量
  hexo.extend.helper.register('reading_count', function(path) {
    return storage.getCount(path);
  });
  
  // 注入客户端脚本
  hexo.extend.filter.register('after_render:html', function(str) {
    const script = '<script src="/reading-stats.js"></script>';
    return str.replace('</body>', script + '</body>');
  });
  
  // API 路由
  hexo.extend.generator.register('reading-api', function() {
    return {
      path: 'api/reading-stats.json',
      data: storage.getAll()
    };
  });
};
```

**客户端脚本：**

```javascript
// public/reading-stats.js
(function() {
  const path = window.location.pathname;
  
  // 记录阅读（防重复）
  if (!localStorage.getItem(`read_${path}`)) {
    setTimeout(() => {
      localStorage.setItem(`read_${path}`, Date.now());
      updateCount(path);
    }, 5000); // 停留5秒后记录
  }
  
  // 更新显示
  async function updateCount(path) {
    const response = await fetch('/api/reading-stats.json');
    const data = await response.json();
    document.querySelector('.reading-count').textContent = data[path] || 0;
  }
})();
```

### 2.3 案例：代码复制插件

为代码块添加一键复制功能。

```javascript
'use strict';

module.exports = function(hexo) {
  // 在代码块后添加复制按钮
  hexo.extend.filter.register('after_post_render', function(data) {
    const $ = require('cheerio').load(data.content);
    
    $('pre code').each(function() {
      const $code = $(this);
      const $pre = $code.parent();
      
      // 添加复制按钮
      $pre.prepend(`
        <button class="copy-btn" data-clipboard-text="${$code.text()}">
          复制代码
        </button>
      `);
    });
    
    data.content = $.html();
    return data;
  });
  
  // 注入 Clipboard.js
  hexo.extend.injector.register('head_end', `
    <link rel="stylesheet" href="/css/code-copy.css">
  `);
  
  hexo.extend.injector.register('body_end', `
    <script src="https://cdn.jsdelivr.net/npm/clipboard@2/dist/clipboard.min.js"></script>
    <script>
      new ClipboardJS('.copy-btn').on('success', function(e) {
        e.trigger.textContent = '已复制!';
        setTimeout(() => e.trigger.textContent = '复制代码', 2000);
      });
    </script>
  `);
};
```

---

## 第三部分：Hexo 默认插件详解

Hexo 项目初始化时会自动安装一组核心插件，它们构成了 Hexo 的基础功能。让我们深入了解这些默认插件。

### 3.1 Generator 类插件

#### hexo-generator-index（首页生成器）

**作用：** 生成首页和分页

**源码位置：** `node_modules/hexo-generator-index/`

**核心实现：**

```javascript
/**
 * hexo-generator-index 核心逻辑
 */

hexo.extend.generator.register('index', function(locals) {
  const config = this.config;
  const posts = locals.posts.sort(config.index_generator.order_by || '-date');
  const perPage = config.index_generator.per_page || 10;
  const paginationDir = config.pagination_dir || 'page';
  
  return pagination('', posts, {
    perPage: perPage,
    layout: ['index', 'archive'],
    format: paginationDir + '/%d/',
    data: {
      __index: true
    }
  });
});
```

**配置选项：**

```yaml
# _config.yml
index_generator:
  path: ''           # 首页路径
  per_page: 10       # 每页文章数
  order_by: -date    # 排序方式（-date 降序）
```

**生成的页面：**
```
public/
├── index.html              # 第一页
├── page/2/index.html       # 第二页
├── page/3/index.html       # 第三页
└── ...
```

**实际应用场景：**

```yaml
# 显示更多文章
index_generator:
  per_page: 15

# 按更新时间排序
index_generator:
  order_by: -updated

# 不分页（显示所有文章）
index_generator:
  per_page: 0
```

---

#### hexo-generator-archive（归档生成器）

**作用：** 生成归档页面（按年、按月）

**核心实现：**

```javascript
/**
 * hexo-generator-archive 核心逻辑
 */

hexo.extend.generator.register('archive', function(locals) {
  const config = this.config;
  const archiveConfig = config.archive_generator;
  const posts = locals.posts.sort('-date');
  const perPage = archiveConfig.per_page || 10;
  
  const routes = [];
  
  // 1. 生成总归档页
  routes.push({
    path: archiveConfig.path || 'archives/',
    data: posts,
    layout: ['archive', 'index']
  });
  
  // 2. 按年归档
  if (archiveConfig.yearly) {
    const yearPosts = {};
    
    posts.forEach(post => {
      const year = post.date.year();
      if (!yearPosts[year]) yearPosts[year] = [];
      yearPosts[year].push(post);
    });
    
    Object.keys(yearPosts).forEach(year => {
      routes.push({
        path: `archives/${year}/`,
        data: yearPosts[year],
        layout: ['archive', 'index'],
        year: year
      });
    });
  }
  
  // 3. 按月归档
  if (archiveConfig.monthly) {
    const monthPosts = {};
    
    posts.forEach(post => {
      const year = post.date.year();
      const month = post.date.format('MM');
      const key = `${year}/${month}`;
      
      if (!monthPosts[key]) monthPosts[key] = [];
      monthPosts[key].push(post);
    });
    
    Object.keys(monthPosts).forEach(key => {
      const [year, month] = key.split('/');
      routes.push({
        path: `archives/${key}/`,
        data: monthPosts[key],
        layout: ['archive', 'index'],
        year: year,
        month: month
      });
    });
  }
  
  return routes;
});
```

**配置选项：**

```yaml
# _config.yml
archive_generator:
  path: archives          # 归档页路径
  per_page: 10           # 每页文章数
  yearly: true           # 生成按年归档
  monthly: true          # 生成按月归档
  order_by: -date        # 排序方式
```

**生成的页面：**
```
public/
└── archives/
    ├── index.html              # 总归档
    ├── 2024/
    │   ├── index.html         # 2024年归档
    │   ├── 01/index.html      # 2024年1月
    │   ├── 02/index.html      # 2024年2月
    │   └── ...
    └── 2025/
        └── index.html
```

**在模板中使用：**

```ejs
<!-- 显示归档列表 -->
<% if (is_archive()) { %>
  <% if (page.year) { %>
    <h1>归档：<%= page.year %>年
      <% if (page.month) { %>
        <%= page.month %>月
      <% } %>
    </h1>
  <% } else { %>
    <h1>全部归档</h1>
  <% } %>
  
  <!-- 文章列表 -->
  <% page.posts.each(function(post) { %>
    <%- partial('article', {post: post}) %>
  <% }) %>
<% } %>
```

---

#### hexo-generator-category（分类生成器）

**作用：** 为每个分类生成页面

**核心实现：**

```javascript
/**
 * hexo-generator-category 核心逻辑
 */

hexo.extend.generator.register('category', function(locals) {
  const config = this.config;
  const categoryConfig = config.category_generator;
  const categories = locals.categories;
  
  return categories.reduce((result, category) => {
    if (!category.length) return result;
    
    const posts = category.posts.sort('-date');
    const path = category.path;
    
    // 生成分类页面
    result.push({
      path: path,
      data: category,
      layout: ['category', 'archive', 'index']
    });
    
    // 如果开启分页
    if (categoryConfig.per_page > 0) {
      const pages = Math.ceil(posts.length / categoryConfig.per_page);
      
      for (let i = 2; i <= pages; i++) {
        result.push({
          path: `${path}page/${i}/`,
          data: category,
          layout: ['category', 'archive', 'index'],
          current: i
        });
      }
    }
    
    return result;
  }, []);
});
```

**配置选项：**

```yaml
# _config.yml
category_generator:
  path: categories       # 分类页路径
  per_page: 10          # 每页文章数
```

**生成的页面：**
```
public/
└── categories/
    ├── 技术/
    │   ├── index.html
    │   └── page/2/index.html
    ├── 生活/
    │   └── index.html
    └── ...
```

**文章 Front-matter：**

```yaml
---
title: 文章标题
categories:
  - 技术
  - 前端
---
```

**在模板中使用：**

```ejs
<!-- category.ejs -->
<% if (is_category()) { %>
  <h1>分类：<%= page.category %></h1>
  <p>共 <%= page.posts.length %> 篇文章</p>
  
  <% page.posts.each(function(post) { %>
    <%- partial('article', {post: post}) %>
  <% }) %>
<% } %>

<!-- 显示所有分类 -->
<%- list_categories() %>

<!-- 自定义分类列表 -->
<% site.categories.each(function(category) { %>
  <a href="<%- url_for(category.path) %>">
    <%= category.name %> (<%= category.length %>)
  </a>
<% }) %>
```

---

#### hexo-generator-tag（标签生成器）

**作用：** 为每个标签生成页面

**核心实现：**

```javascript
/**
 * hexo-generator-tag 核心逻辑
 */

hexo.extend.generator.register('tag', function(locals) {
  const config = this.config;
  const tagConfig = config.tag_generator;
  const tags = locals.tags;
  
  return tags.reduce((result, tag) => {
    if (!tag.length) return result;
    
    const posts = tag.posts.sort('-date');
    const path = tag.path;
    
    // 生成标签页面
    result.push({
      path: path,
      data: tag,
      layout: ['tag', 'archive', 'index']
    });
    
    // 分页
    if (tagConfig.per_page > 0) {
      const pages = Math.ceil(posts.length / tagConfig.per_page);
      
      for (let i = 2; i <= pages; i++) {
        result.push({
          path: `${path}page/${i}/`,
          data: tag,
          layout: ['tag', 'archive', 'index'],
          current: i
        });
      }
    }
    
    return result;
  }, []);
});
```

**配置选项：**

```yaml
# _config.yml
tag_generator:
  path: tags            # 标签页路径
  per_page: 10         # 每页文章数
```

**生成的页面：**
```
public/
└── tags/
    ├── JavaScript/
    │   └── index.html
    ├── React/
    │   └── index.html
    └── ...
```

**文章 Front-matter：**

```yaml
---
title: 文章标题
tags:
  - JavaScript
  - React
  - 前端
---
```

**在模板中使用：**

```ejs
<!-- tag.ejs -->
<% if (is_tag()) { %>
  <h1>标签：<%= page.tag %></h1>
  <p>共 <%= page.posts.length %> 篇文章</p>
  
  <% page.posts.each(function(post) { %>
    <%- partial('article', {post: post}) %>
  <% }) %>
<% } %>

<!-- 显示标签云 -->
<%- tagcloud() %>

<!-- 自定义标签列表 -->
<% site.tags.sort('length', -1).limit(10).each(function(tag) { %>
  <a href="<%- url_for(tag.path) %>">
    #<%= tag.name %> (<%= tag.length %>)
  </a>
<% }) %>
```

---

### 3.2 Renderer 类插件

#### hexo-renderer-ejs（EJS 模板渲染器）

**作用：** 渲染 `.ejs` 模板文件

**核心实现：**

```javascript
/**
 * hexo-renderer-ejs 核心逻辑
 */

const ejs = require('ejs');

hexo.extend.renderer.register('ejs', 'html', function(data, options) {
  // 编译 EJS 模板
  return ejs.render(data.text, {
    ...options,
    filename: data.path
  });
}, true);
```

**配置选项：**

```yaml
# _config.yml（主题配置）
ejs:
  compileDebug: false    # 关闭调试模式
  cache: true            # 启用缓存（生产环境）
```

**模板语法：**

```ejs
<!-- 输出变量 -->
<%= title %>

<!-- 原始输出（不转义 HTML） -->
<%- content %>

<!-- JavaScript 代码 -->
<% if (is_post()) { %>
  <article>...</article>
<% } %>

<!-- 包含其他模板 -->
<%- partial('_partial/header') %>

<!-- 循环 -->
<% posts.each(function(post) { %>
  <div><%= post.title %></div>
<% }) %>
```

**实战技巧：**

```ejs
<!-- 1. 条件渲染 -->
<% if (theme.sidebar.enable) { %>
  <%- partial('_partial/sidebar') %>
<% } %>

<!-- 2. 三元表达式 -->
<div class="<%= is_home() ? 'home' : 'page' %>">

<!-- 3. 数组操作 -->
<% page.tags.slice(0, 5).each(function(tag) { %>
  <span><%= tag.name %></span>
<% }) %>

<!-- 4. 默认值 -->
<%= page.title || config.title %>

<!-- 5. 安全访问 -->
<%= page.author?.name || 'Anonymous' %>
```

---

#### hexo-renderer-marked（Markdown 渲染器）

**作用：** 渲染 `.md` 文件为 HTML

**核心实现：**

```javascript
/**
 * hexo-renderer-marked 核心逻辑
 */

const { marked } = require('marked');
const stripIndent = require('strip-indent');

hexo.extend.renderer.register('md', 'html', function(data, options) {
  const config = this.config.marked || {};
  
  // 配置 marked
  marked.setOptions({
    gfm: config.gfm !== false,
    breaks: config.breaks !== false,
    pedantic: config.pedantic || false,
    sanitize: config.sanitize || false,
    smartLists: config.smartLists !== false,
    smartypants: config.smartypants !== false,
    highlight: function(code, lang) {
      // 代码高亮
      return highlightCode(code, lang);
    }
  });
  
  // 渲染 Markdown
  return marked(stripIndent(data.text));
}, true);
```

**配置选项：**

```yaml
# _config.yml
marked:
  gfm: true                    # GitHub Flavored Markdown
  breaks: true                 # 单行换行符转为 <br>
  pedantic: false              # 严格模式
  sanitize: false              # 是否过滤 HTML
  smartLists: true             # 优化列表
  smartypants: true            # 智能标点
  modifyAnchors: 0             # 标题锚点修改（0/1/2）
  autolink: true               # 自动链接
  
  # 外部链接
  external_link:
    enable: true
    exclude: []
    nofollow: true
  
  # 代码高亮（需要配合 highlight.js）
  highlight:
    enable: true
    line_number: true
    auto_detect: false
    tab_replace: '  '
    wrap: true
    hljs: false
  
  # 或使用 prismjs
  prismjs:
    enable: false
    line_number: true
```

**Markdown 语法增强：**

```markdown
<!-- GFM 任务列表 -->
- [x] 已完成任务
- [ ] 未完成任务

<!-- 表格 -->
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

<!-- 删除线 -->
~~删除的文字~~

<!-- 代码块 -->
```javascript
console.log('Hello');
```

<!-- 数学公式（需要插件） -->
$$
E = mc^2
$$
```

**自定义渲染器：**

```javascript
// themes/aurora/scripts/renderer-custom.js

const marked = require('marked');
const renderer = new marked.Renderer();

// 自定义标题渲染
renderer.heading = function(text, level) {
  const slug = text.toLowerCase().replace(/\s+/g, '-');
  return `
    <h${level} id="${slug}">
      <a href="#${slug}" class="header-anchor">#</a>
      ${text}
    </h${level}>
  `;
};

// 自定义链接渲染
renderer.link = function(href, title, text) {
  const isExternal = /^https?:\/\//.test(href);
  const attrs = isExternal ? 
    'target="_blank" rel="noopener noreferrer"' : '';
  
  return `<a href="${href}" ${attrs}>${text}</a>`;
};

// 自定义图片渲染
renderer.image = function(href, title, text) {
  return `
    <figure>
      <img src="${href}" alt="${text}" loading="lazy">
      ${title ? `<figcaption>${title}</figcaption>` : ''}
    </figure>
  `;
};

hexo.extend.filter.register('marked:renderer', function(renderer) {
  // 应用自定义渲染器
  return renderer;
});
```

---

#### hexo-renderer-stylus（Stylus 渲染器）

**作用：** 渲染 `.styl` 文件为 CSS

**核心实现：**

```javascript
/**
 * hexo-renderer-stylus 核心逻辑
 */

const stylus = require('stylus');
const nib = require('nib');

hexo.extend.renderer.register('styl', 'css', function(data, options) {
  const config = this.config.stylus || {};
  
  return new Promise((resolve, reject) => {
    stylus(data.text)
      .set('filename', data.path)
      .set('compress', config.compress || false)
      .set('include css', true)
      .use(nib())
      .render((err, css) => {
        if (err) reject(err);
        else resolve(css);
      });
  });
}, true);
```

**配置选项：**

```yaml
# _config.yml
stylus:
  compress: true         # 压缩 CSS
  sourcemaps:
    comment: false       # 是否添加 sourcemap 注释
    inline: false        # 内联 sourcemap
```

**Stylus 语法：**

```stylus
// themes/aurora/source/css/style.styl

// 变量
$primary-color = #4dabf7
$font-size = 16px

// Mixin
border-radius(n)
  -webkit-border-radius n
  -moz-border-radius n
  border-radius n

// 嵌套
.article
  padding 20px
  
  .title
    font-size 24px
    color $primary-color
    
  &:hover
    background #f5f5f5

// 函数
lighten($primary-color, 10%)
darken($primary-color, 10%)

// 导入
@import 'variables'
@import 'mixins'
```

**替代方案（使用 SCSS）：**

```bash
# 卸载 Stylus
npm uninstall hexo-renderer-stylus

# 安装 SCSS
npm install hexo-renderer-scss --save
```

```yaml
# _config.yml
node_sass:
  outputStyle: compressed
  precision: 5
  sourceComments: false
```

---

### 3.3 默认插件协作示例

这些插件如何共同工作：

```javascript
/**
 * Hexo 生成流程中的插件协作
 */

// 1. 用户执行 hexo generate
hexo.call('generate')

// 2. hexo-renderer-marked 渲染 Markdown
//    source/_posts/hello.md → 渲染为 HTML

// 3. Generator 插件开始工作
//    hexo-generator-index → 生成首页
//    hexo-generator-archive → 生成归档页
//    hexo-generator-category → 生成分类页
//    hexo-generator-tag → 生成标签页

// 4. hexo-renderer-ejs 渲染模板
//    layout/index.ejs → 应用数据 → 生成 HTML

// 5. hexo-renderer-stylus 渲染样式
//    source/css/style.styl → 生成 CSS

// 6. 输出到 public 目录
public/
├── index.html
├── archives/
├── categories/
├── tags/
├── css/
└── ...
```

---

### 3.4 优化默认插件

#### 禁用不需要的插件

```yaml
# _config.yml

# 方法 1：通过配置禁用
archive_generator:
  enable: false

# 方法 2：在 package.json 中移除依赖
# 然后运行 npm install
```

#### 扩展默认插件

```javascript
// scripts/extend-generators.js

/**
 * 扩展 index generator，添加 RSS 链接
 */
hexo.extend.filter.register('before_generate', function() {
  const original = hexo.extend.generator.get('index');
  
  hexo.extend.generator.register('index', function(locals) {
    const result = original.call(this, locals);
    
    // 添加 RSS feed 到首页数据
    if (result && result[0]) {
      result[0].data.feed_url = '/atom.xml';
    }
    
    return result;
  });
});
```

#### 性能优化

```javascript
// scripts/optimize-generators.js

/**
 * 缓存 Generator 结果
 */
const cache = new Map();

hexo.extend.filter.register('before_generate', function() {
  cache.clear();
});

function cachedGenerator(name, fn) {
  return function(locals) {
    const key = JSON.stringify(locals);
    
    if (cache.has(key)) {
      hexo.log.debug(`[Cache] Hit: ${name}`);
      return cache.get(key);
    }
    
    const result = fn.call(this, locals);
    cache.set(key, result);
    return result;
  };
}

// 应用缓存
hexo.extend.generator.register('index', 
  cachedGenerator('index', originalIndexGenerator)
);
```

---

### 3.5 实战：自定义 Generator

基于默认 Generator 的原理，创建自定义生成器：

```javascript
// scripts/generator-timeline.js

/**
 * 时间线生成器
 * 按时间轴展示所有文章
 */

hexo.extend.generator.register('timeline', function(locals) {
  const posts = locals.posts.sort('-date');
  const timeline = {};
  
  // 按年月分组
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
      date: post.date.format('YYYY-MM-DD'),
      excerpt: post.excerpt
    });
  });
  
  // 生成页面
  return {
    path: 'timeline/index.html',
    layout: ['timeline', 'page'],
    data: {
      timeline: timeline,
      total: posts.length
    }
  };
});
```

**对应的模板：**

```ejs
<!-- layout/timeline.ejs -->
<div class="timeline-page">
  <h1>时间线</h1>
  <p>共 <%= page.total %> 篇文章</p>
  
  <div class="timeline">
    <% 
      const years = Object.keys(page.timeline).sort((a, b) => b - a);
      years.forEach(year => {
    %>
      <div class="timeline-year">
        <h2><%= year %>年</h2>
        
        <%
          const months = Object.keys(page.timeline[year]).sort((a, b) => b - a);
          months.forEach(month => {
        %>
          <div class="timeline-month">
            <h3><%= parseInt(month) %>月</h3>
            
            <ul class="timeline-posts">
              <% page.timeline[year][month].forEach(post => { %>
                <li class="timeline-item">
                  <time><%= post.date %></time>
                  <a href="<%- url_for(post.path) %>">
                    <%= post.title %>
                  </a>
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

---

## 第四部分：常用插件生态

### 4.1 内容处理类

#### hexo-renderer-marked（Markdown 渲染）

```yaml
# _config.yml
marked:
  gfm: true
  breaks: true
  smartLists: true
  smartypants: true
```

#### hexo-generator-feed（RSS Feed）

```yaml
feed:
  type: atom
  path: atom.xml
  limit: 20
```

#### hexo-generator-sitemap（站点地图）

```yaml
sitemap:
  path: sitemap.xml
  rel: false
```

### 3.2 部署类

#### hexo-deployer-git（Git 部署）

```yaml
deploy:
  type: git
  repo: git@github.com:user/repo.git
  branch: gh-pages
```

#### hexo-deployer-rsync（Rsync 部署）

```yaml
deploy:
  type: rsync
  host: example.com
  user: username
  root: /var/www/html
```

### 3.3 优化类

#### hexo-filter-optimize（资源优化）

```yaml
filter_optimize:
  enable: true
  js:
    enable: true
    bundle: true
  css:
    enable: true
    bundle: true
  image:
    enable: true
```

#### hexo-lazyload-image（图片懒加载）

```yaml
lazyload:
  enable: true
  onlypost: false
  loadingImg: /images/loading.gif
```

### 3.4 功能增强类

#### hexo-wordcount（字数统计）

```ejs
<!-- 在模板中使用 -->
<span><%= wordcount(post.content) %> 字</span>
<span><%= min2read(post.content) %> 分钟</span>
```

#### hexo-admin（后台管理）

```bash
hexo server -d
# 访问 http://localhost:4000/admin/
```

---

## 第四部分：主题与插件协作

### 4.1 插件检测

在主题中检测插件是否存在：

```javascript
// themes/aurora/scripts/plugin-detect.js

hexo.extend.filter.register('before_generate', function() {
  const plugins = {
    feed: 'hexo-generator-feed',
    sitemap: 'hexo-generator-sitemap',
    wordcount: 'hexo-wordcount'
  };
  
  Object.keys(plugins).forEach(key => {
    const pluginName = plugins[key];
    const hasPlugin = hexo.extend.helper.list()[key] !== undefined ||
                     hexo.extend.generator.list()[key] !== undefined;
    
    hexo.theme.config[`has_${key}`] = hasPlugin;
    
    if (!hasPlugin) {
      hexo.log.warn(`[Aurora] Plugin ${pluginName} not found`);
    }
  });
});
```

在模板中使用：

```ejs
<% if (theme.has_wordcount) { %>
  <span>字数：<%= wordcount(page.content) %></span>
<% } %>

<% if (theme.has_feed) { %>
  <link rel="alternate" href="/atom.xml">
<% } %>
```

### 4.2 配置整合

```yaml
# _config.yml

# 主题配置
theme_config:
  wordcount:
    enable: true
  feed:
    enable: true
    
# 插件配置
feed:
  type: atom
  path: atom.xml
  
wordcount:
  enable: true
```

### 4.3 功能扩展

主题提供接口，插件实现功能：

```javascript
// 主题定义钩子
hexo.extend.filter.register('theme_custom_render', function(data) {
  // 插件可以在这里添加自定义处理
  return data;
});

// 插件使用钩子
hexo.extend.filter.register('theme_custom_render', function(data) {
  // 添加自定义功能
  data.custom = 'value';
  return data;
});
```

---

## 第五部分：插件测试与发布

### 5.1 单元测试

**test/filter.test.js**

```javascript
const Hexo = require('hexo');
const { expect } = require('chai');

describe('Filter Tests', () => {
  let hexo;
  
  beforeEach(() => {
    hexo = new Hexo(__dirname);
    require('../index')(hexo);
  });
  
  it('should register filter', () => {
    const filters = hexo.extend.filter.list();
    expect(filters).to.have.property('after_post_render');
  });
  
  it('should process content', async () => {
    const data = {
      content: '<img src="test.jpg">'
    };
    
    const filter = hexo.extend.filter.get('after_post_render')[0];
    const result = await filter(data);
    
    expect(result.content).to.include('loading="lazy"');
  });
});
```

### 5.2 发布到 NPM

**准备发布：**

```bash
# 1. 登录 NPM
npm login

# 2. 检查包名
npm search hexo-image-optimizer

# 3. 发布
npm publish

# 4. 发布测试版
npm publish --tag beta
```

**.npmignore**

```
test/
*.test.js
.github/
.gitignore
```

**版本管理：**

```bash
# 补丁版本 1.0.0 -> 1.0.1
npm version patch

# 小版本 1.0.0 -> 1.1.0
npm version minor

# 大版本 1.0.0 -> 2.0.0
npm version major
```

### 5.3 文档编写

**README.md 模板：**

```markdown
# hexo-image-optimizer

> Optimize images for Hexo

## Installation

\`\`\`bash
npm install hexo-image-optimizer --save
\`\`\`

## Usage

Add to `_config.yml`:

\`\`\`yaml
image_optimizer:
  enable: true
  jpg:
    quality: 80
\`\`\`

## API

### Helpers

- `responsive_image(src, alt)` - Generate responsive image

## License

MIT
```

---

## 第六部分：最佳实践

### 6.1 性能优化

```javascript
// ✅ 使用缓存
const cache = new Map();

hexo.extend.helper.register('expensive_operation', function(data) {
  const key = JSON.stringify(data);
  
  if (!cache.has(key)) {
    cache.set(key, processData(data));
  }
  
  return cache.get(key);
});

// ✅ 异步处理
hexo.extend.filter.register('after_generate', async function() {
  await Promise.all(
    images.map(img => optimizeImage(img))
  );
});

// ❌ 避免同步阻塞
hexo.extend.filter.register('after_generate', function() {
  images.forEach(img => {
    fs.writeFileSync(img, data); // 阻塞
  });
});
```

### 6.2 错误处理

```javascript
hexo.extend.filter.register('after_post_render', function(data) {
  try {
    return processData(data);
  } catch (err) {
    hexo.log.error('Processing failed:', err);
    return data; // 返回原数据，不中断流程
  }
});
```

### 6.3 配置验证

```javascript
function validateConfig(config) {
  const required = ['apiKey', 'apiSecret'];
  
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
  
  return true;
}
```

### 6.4 日志规范

```javascript
// 使用统一前缀
hexo.log.info('[plugin-name] Started');
hexo.log.warn('[plugin-name] Warning message');
hexo.log.error('[plugin-name] Error message');
hexo.log.debug('[plugin-name] Debug info');
```

### 6.5 版本兼容

```javascript
// 检查 Hexo 版本
const hexoVersion = require('hexo/package.json').version;
const semver = require('semver');

if (!semver.satisfies(hexoVersion, '>=5.0.0')) {
  hexo.log.error('This plugin requires Hexo >= 5.0.0');
  return;
}

// 检查依赖插件
if (!hexo.extend.helper.get('markdown')) {
  hexo.log.warn('hexo-renderer-marked is required');
}
```

---

## 第七部分：高级主题

### 7.1 插件间通信

```javascript
// Plugin A: 发布事件
hexo.extend.filter.register('after_generate', function() {
  hexo.emit('custom:event', { data: 'value' });
});

// Plugin B: 监听事件
hexo.on('custom:event', function(data) {
  console.log('Received:', data);
});
```

### 7.2 条件加载

```javascript
module.exports = function(hexo) {
  // 只在生产环境加载
  if (process.env.NODE_ENV === 'production') {
    require('./lib/production')(hexo);
  }
  
  // 只在开发环境加载
  if (hexo.env.cmd === 'server') {
    require('./lib/development')(hexo);
  }
};
```

### 7.3 插件生态系统

**插件管理器概念：**

```javascript
// hexo-plugin-manager
class PluginManager {
  constructor(hexo) {
    this.hexo = hexo;
    this.plugins = new Map();
  }
  
  register(name, plugin) {
    this.plugins.set(name, plugin);
  }
  
  get(name) {
    return this.plugins.get(name);
  }
  
  enable(name) {
    const plugin = this.get(name);
    if (plugin) plugin.enable();
  }
  
  disable(name) {
    const plugin = this.get(name);
    if (plugin) plugin.disable();
  }
}
```

---

## 总结

本章我们深入学习了 Hexo 插件系统：

### 核心内容

✅ **插件机制**
- 加载流程
- 生命周期
- 与主题的区别

✅ **开发实战**
- 图片优化插件
- 阅读统计插件
- 代码复制插件

✅ **生态系统**
- 常用插件介绍
- 插件分类

✅ **协作模式**
- 主题检测插件
- 配置整合
- 功能扩展

✅ **发布管理**
- 测试方法
- NPM 发布
- 文档编写

✅ **最佳实践**
- 性能优化
- 错误处理
- 日志规范

### 学习成果

完成本章后，你将能够：

✅ 理解插件的工作机制
✅ 开发功能完整的插件
✅ 测试和发布插件到 NPM
✅ 在主题中优雅地使用插件
✅ 遵循插件开发最佳实践

---

## 附录：插件开发清单

### 开发前

- [ ] 确定插件功能和范围
- [ ] 检查是否已有类似插件
- [ ] 设计插件 API
- [ ] 规划配置选项

### 开发中

- [ ] 创建标准目录结构
- [ ] 编写核心功能代码
- [ ] 添加错误处理
- [ ] 编写单元测试
- [ ] 添加日志输出

### 发布前

- [ ] 编写完整文档
- [ ] 添加使用示例
- [ ] 测试不同环境
- [ ] 检查性能影响
- [ ] 准备 CHANGELOG

### 发布后

- [ ] 监控 Issue
- [ ] 及时修复 Bug
- [ ] 收集用户反馈
- [ ] 持续优化改进

---

## 推荐资源

- [Hexo 插件开发文档](https://hexo.io/zh-cn/docs/plugins)
- [NPM 包发布指南](https://docs.npmjs.com/packages-and-modules)
- [插件示例仓库](https://github.com/hexojs/hexo)

---

*本文是 Hexo 主题开发系列教程的第五章*

**完整系列：**
- [第一章：核心概念](./hexo-theme-tutorial-01.md)
- [第二章：扩展系统（上）](./hexo-theme-tutorial-02-part1.md)
- [第二章：扩展系统（下）](./hexo-theme-tutorial-02-part2.md)
- [第三章：主题结构](./hexo-theme-tutorial-03.md)
- [第四章：高级功能](./hexo-theme-tutorial-04.md)
- [第五章：插件系统](./hexo-theme-tutorial-05.md)

🎉 **系列完结！祝你开发出优秀的 Hexo 主题和插件！**
