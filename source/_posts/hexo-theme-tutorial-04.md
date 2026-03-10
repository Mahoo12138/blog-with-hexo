---
title: Hexo 主题开发系列教程（四）：高级功能与优化
date: 2025-11-25 21:22:37
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---

## 前言

在前三章中，我们已经完成了：
- [第一章](./hexo-theme-tutorial-01.md)：Hexo 核心概念
- [第二章](./hexo-theme-tutorial-02-part1.md)：扩展系统详解
- [第三章](./hexo-theme-tutorial-03.md)：主题结构与模板系统

现在，Aurora 主题已经具备了基本的功能。本章将进一步提升主题的实用性和性能，实现高级功能：

- 🔍 **本地搜索** - 快速全文搜索
- 🔍 **Algolia 搜索** - 云端搜索服务
- 💬 **多评论系统** - 灵活切换评论平台
- 📊 **统计分析** - 访问统计与行为分析
- ⚡ **性能优化** - 加载速度优化
- 📱 **PWA 支持** - 渐进式 Web 应用
- 🎨 **高级定制** - 深度个性化
- 🚀 **SEO 优化** - 搜索引擎优化
- 📦 **主题发布** - 打包与分发

---

## 第一部分：搜索功能实现

### 1.1 本地搜索

本地搜索通过生成搜索索引文件，在客户端进行全文检索，无需服务器支持。

#### 生成搜索索引

**themes/aurora/scripts/generators/search.js**

```javascript
/**
 * 搜索索引生成器
 */

hexo.extend.generator.register('search', function(locals) {
  const config = this.config;
  const searchConfig = this.theme.search;
  
  // 如果搜索未启用或使用外部服务，不生成索引
  if (!searchConfig || !searchConfig.enable || searchConfig.provider !== 'local') {
    return;
  }
  
  const posts = locals.posts.sort('-date');
  const pages = locals.pages;
  
  // 合并文章和页面
  const allContent = [];
  
  // 处理文章
  posts.forEach(post => {
    if (post.indexing === false) return; // 跳过不需要索引的文章
    
    allContent.push({
      title: post.title,
      url: post.path,
      content: stripHtml(post.content),
      categories: post.categories ? post.categories.map(cat => cat.name) : [],
      tags: post.tags ? post.tags.map(tag => tag.name) : [],
      date: post.date.format('YYYY-MM-DD')
    });
  });
  
  // 处理页面
  pages.forEach(page => {
    if (page.indexing === false) return;
    
    allContent.push({
      title: page.title,
      url: page.path,
      content: stripHtml(page.content),
      categories: [],
      tags: [],
      date: page.date ? page.date.format('YYYY-MM-DD') : ''
    });
  });
  
  // 生成搜索索引
  return {
    path: 'search.json',
    data: JSON.stringify(allContent)
  };
  
  // 辅助函数：移除 HTML 标签
  function stripHtml(html) {
    if (!html) return '';
    
    return html
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // 限制内容长度
  }
});
```

#### 搜索界面

**themes/aurora/layout/_partial/search.ejs**

```ejs
<div class="search-overlay" id="search-overlay">
  <div class="search-container">
    <!-- 搜索框 -->
    <div class="search-header">
      <div class="search-input-wrapper">
        <i class="icon-search search-icon"></i>
        <input 
          type="search" 
          id="search-input" 
          class="search-input"
          placeholder="搜索文章..."
          autocomplete="off"
          spellcheck="false"
        >
        <button class="search-clear" id="search-clear" aria-label="清除">
          <i class="icon-x"></i>
        </button>
      </div>
      <button class="search-close" id="search-close" aria-label="关闭">
        <i class="icon-x"></i>
      </button>
    </div>
    
    <!-- 搜索提示 -->
    <div class="search-hint" id="search-hint">
      <p>输入关键词开始搜索</p>
      <div class="search-shortcuts">
        <kbd>↑</kbd> <kbd>↓</kbd> 选择结果
        <kbd>Enter</kbd> 打开
        <kbd>Esc</kbd> 关闭
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results" id="search-results"></div>
    
    <!-- 加载状态 -->
    <div class="search-loading" id="search-loading">
      <div class="spinner"></div>
      <p>加载搜索索引...</p>
    </div>
    
    <!-- 无结果 -->
    <div class="search-no-results" id="search-no-results">
      <i class="icon-search-x"></i>
      <p>未找到相关结果</p>
    </div>
  </div>
</div>
```

#### 搜索脚本

**themes/aurora/source/js/search.js**

```javascript
/**
 * 本地搜索功能
 */

class LocalSearch {
  constructor(options = {}) {
    this.searchData = null;
    this.dataUrl = options.dataUrl || '/search.json';
    this.maxResults = options.maxResults || 20;
    this.highlightTag = options.highlightTag || 'em';
    
    this.overlay = document.getElementById('search-overlay');
    this.input = document.getElementById('search-input');
    this.results = document.getElementById('search-results');
    this.hint = document.getElementById('search-hint');
    this.noResults = document.getElementById('search-no-results');
    this.loading = document.getElementById('search-loading');
    this.clearBtn = document.getElementById('search-clear');
    this.closeBtn = document.getElementById('search-close');
    
    this.selectedIndex = -1;
    
    this.init();
  }
  
  init() {
    // 绑定事件
    this.bindEvents();
    
    // 预加载搜索数据
    this.loadSearchData();
  }
  
  bindEvents() {
    // 搜索按钮点击
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.open());
    }
    
    // 快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      
      // ESC 关闭搜索
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
    
    // 输入事件
    if (this.input) {
      this.input.addEventListener('input', this.debounce(() => {
        this.search();
      }, 300));
      
      // 键盘导航
      this.input.addEventListener('keydown', (e) => {
        this.handleKeyboard(e);
      });
    }
    
    // 清除按钮
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.input.value = '';
        this.clearResults();
        this.input.focus();
      });
    }
    
    // 关闭按钮
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    
    // 点击遮罩关闭
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
  }
  
  async loadSearchData() {
    if (this.searchData) return;
    
    try {
      this.showLoading();
      
      const response = await fetch(this.dataUrl);
      if (!response.ok) throw new Error('Failed to load search data');
      
      this.searchData = await response.json();
      this.hideLoading();
      
      console.log(`Search index loaded: ${this.searchData.length} items`);
    } catch (error) {
      console.error('Error loading search data:', error);
      this.hideLoading();
      this.showError('搜索索引加载失败');
    }
  }
  
  search() {
    const query = this.input.value.trim().toLowerCase();
    
    if (!query) {
      this.clearResults();
      return;
    }
    
    if (!this.searchData) {
      this.showError('搜索索引未加载');
      return;
    }
    
    // 搜索
    const results = this.performSearch(query);
    
    // 显示结果
    this.displayResults(results, query);
  }
  
  performSearch(query) {
    const keywords = query.split(/\s+/).filter(k => k.length > 0);
    const results = [];
    
    this.searchData.forEach(item => {
      let score = 0;
      const matchedKeywords = new Set();
      
      keywords.forEach(keyword => {
        // 标题匹配（权重最高）
        const titleIndex = item.title.toLowerCase().indexOf(keyword);
        if (titleIndex !== -1) {
          score += 10;
          if (titleIndex === 0) score += 5; // 开头匹配额外加分
          matchedKeywords.add(keyword);
        }
        
        // 分类/标签匹配
        const categories = item.categories || [];
        const tags = item.tags || [];
        if (categories.some(c => c.toLowerCase().includes(keyword)) ||
            tags.some(t => t.toLowerCase().includes(keyword))) {
          score += 5;
          matchedKeywords.add(keyword);
        }
        
        // 内容匹配
        if (item.content && item.content.toLowerCase().includes(keyword)) {
          score += 1;
          matchedKeywords.add(keyword);
        }
      });
      
      // 只有匹配到所有关键词才加入结果
      if (matchedKeywords.size === keywords.length && score > 0) {
        results.push({
          ...item,
          score: score
        });
      }
    });
    
    // 按分数排序
    return results.sort((a, b) => b.score - a.score).slice(0, this.maxResults);
  }
  
  displayResults(results, query) {
    this.hideHint();
    this.hideNoResults();
    
    if (results.length === 0) {
      this.showNoResults();
      return;
    }
    
    const keywords = query.split(/\s+/);
    const html = results.map((item, index) => {
      const title = this.highlight(item.title, keywords);
      const excerpt = this.getExcerpt(item.content, keywords);
      
      return `
        <div class="search-result-item" data-index="${index}">
          <a href="/${item.url}" class="search-result-link">
            <h3 class="search-result-title">${title}</h3>
            ${excerpt ? `<p class="search-result-excerpt">${excerpt}</p>` : ''}
            <div class="search-result-meta">
              ${item.date ? `<span class="meta-date">${item.date}</span>` : ''}
              ${item.categories && item.categories.length > 0 ? 
                `<span class="meta-category">${item.categories[0]}</span>` : ''}
            </div>
          </a>
        </div>
      `;
    }).join('');
    
    this.results.innerHTML = html;
    this.results.style.display = 'block';
    this.selectedIndex = -1;
    
    // 绑定点击事件
    this.results.querySelectorAll('.search-result-link').forEach((link, index) => {
      link.addEventListener('click', (e) => {
        // 记录搜索统计
        this.trackSearch(query, item.url);
      });
    });
  }
  
  highlight(text, keywords) {
    if (!text) return '';
    
    let result = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${this.escapeRegex(keyword)})`, 'gi');
      result = result.replace(regex, `<${this.highlightTag}>$1</${this.highlightTag}>`);
    });
    
    return result;
  }
  
  getExcerpt(content, keywords) {
    if (!content) return '';
    
    // 查找第一个关键词的位置
    let index = -1;
    let matchedKeyword = '';
    
    for (const keyword of keywords) {
      const pos = content.toLowerCase().indexOf(keyword.toLowerCase());
      if (pos !== -1 && (index === -1 || pos < index)) {
        index = pos;
        matchedKeyword = keyword;
      }
    }
    
    if (index === -1) return '';
    
    // 提取摘要
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + 150);
    let excerpt = content.substring(start, end);
    
    // 添加省略号
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    // 高亮关键词
    return this.highlight(excerpt, keywords);
  }
  
  handleKeyboard(e) {
    const items = this.results.querySelectorAll('.search-result-item');
    if (items.length === 0) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelection(items);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const link = items[this.selectedIndex].querySelector('a');
          if (link) link.click();
        }
        break;
    }
  }
  
  updateSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === this.selectedIndex);
    });
    
    if (this.selectedIndex >= 0) {
      items[this.selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }
  
  open() {
    if (this.overlay) {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // 聚焦输入框
      setTimeout(() => {
        if (this.input) this.input.focus();
      }, 300);
      
      // 如果还没加载数据，立即加载
      if (!this.searchData) {
        this.loadSearchData();
      }
    }
  }
  
  close() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.clearResults();
    }
  }
  
  isOpen() {
    return this.overlay && this.overlay.classList.contains('active');
  }
  
  clearResults() {
    if (this.results) {
      this.results.innerHTML = '';
      this.results.style.display = 'none';
    }
    this.showHint();
    this.hideNoResults();
    this.selectedIndex = -1;
  }
  
  showHint() {
    if (this.hint) this.hint.style.display = 'block';
  }
  
  hideHint() {
    if (this.hint) this.hint.style.display = 'none';
  }
  
  showNoResults() {
    if (this.noResults) this.noResults.style.display = 'block';
  }
  
  hideNoResults() {
    if (this.noResults) this.noResults.style.display = 'none';
  }
  
  showLoading() {
    if (this.loading) this.loading.style.display = 'flex';
  }
  
  hideLoading() {
    if (this.loading) this.loading.style.display = 'none';
  }
  
  showError(message) {
    console.error(message);
  }
  
  trackSearch(query, url) {
    // 可以集成统计分析
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: query,
        result_url: url
      });
    }
  }
  
  // 工具函数
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('search-overlay')) {
    window.localSearch = new LocalSearch({
      dataUrl: '/search.json',
      maxResults: 20
    });
  }
});
```

### 1.2 Algolia 搜索集成

Algolia 提供强大的云端搜索服务，适合大型博客。

#### 安装 Algolia

```bash
npm install hexo-algoliasearch --save
```

#### 配置 Algolia

**_config.yml**

```yaml
algolia:
  applicationID: 'your_application_id'
  apiKey: 'your_api_key'
  adminApiKey: 'your_admin_api_key'
  indexName: 'your_index_name'
  chunkSize: 5000
  fields:
    - title
    - slug
    - path
    - excerpt
    - content:strip
    - categories
    - tags
```

#### 上传索引

```bash
# 生成并上传索引
hexo algolia
```

#### Algolia 搜索界面

**themes/aurora/layout/_partial/search-algolia.ejs**

```ejs
<div class="search-overlay" id="algolia-search">
  <div class="search-container">
    <div class="search-header">
      <div id="algolia-search-input"></div>
      <button class="search-close" aria-label="关闭">
        <i class="icon-x"></i>
      </button>
    </div>
    
    <div id="algolia-hits"></div>
    <div id="algolia-pagination"></div>
    
    <div class="algolia-powered">
      <a href="https://www.algolia.com/" target="_blank">
        Search by Algolia
      </a>
    </div>
  </div>
</div>
```

**themes/aurora/source/js/algolia.js**

```javascript
/**
 * Algolia 搜索
 */

// 引入 Algolia 库
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { searchBox, hits, pagination } from 'instantsearch.js/es/widgets';

class AlgoliaSearch {
  constructor(options) {
    this.appId = options.appId;
    this.apiKey = options.apiKey;
    this.indexName = options.indexName;
    
    this.searchClient = algoliasearch(this.appId, this.apiKey);
    this.search = null;
    
    this.init();
  }
  
  init() {
    this.search = instantsearch({
      indexName: this.indexName,
      searchClient: this.searchClient,
      routing: true
    });
    
    // 配置搜索框
    this.search.addWidgets([
      searchBox({
        container: '#algolia-search-input',
        placeholder: '搜索文章...',
        showReset: true,
        showSubmit: false,
        autofocus: true
      }),
      
      // 配置结果展示
      hits({
        container: '#algolia-hits',
        templates: {
          item: (hit) => this.renderHit(hit),
          empty: '未找到相关结果'
        }
      }),
      
      // 配置分页
      pagination({
        container: '#algolia-pagination',
        padding: 2,
        showFirst: false,
        showLast: false
      })
    ]);
    
    this.search.start();
    this.bindEvents();
  }
  
  renderHit(hit) {
    const title = hit._highlightResult.title.value;
    const excerpt = hit._highlightResult.excerpt 
      ? hit._highlightResult.excerpt.value 
      : '';
    
    return `
      <div class="algolia-hit">
        <a href="${hit.path}" class="hit-link">
          <h3 class="hit-title">${title}</h3>
          ${excerpt ? `<p class="hit-excerpt">${excerpt}</p>` : ''}
          <div class="hit-meta">
            ${hit.date ? `<span class="meta-date">${hit.date}</span>` : ''}
            ${hit.categories && hit.categories.length > 0 ? 
              `<span class="meta-category">${hit.categories[0]}</span>` : ''}
          </div>
        </a>
      </div>
    `;
  }
  
  bindEvents() {
    // 打开搜索
    const searchBtn = document.getElementById('search-button');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.open());
    }
    
    // 关闭搜索
    const closeBtn = document.querySelector('#algolia-search .search-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // 快捷键
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }
  
  open() {
    const overlay = document.getElementById('algolia-search');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  close() {
    const overlay = document.getElementById('algolia-search');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// 初始化
if (window.algoliaConfig) {
  new AlgoliaSearch(window.algoliaConfig);
}
```

---

## 第二部分：多评论系统集成

### 2.1 评论系统架构

设计灵活的评论系统切换机制。

**themes/aurora/scripts/helpers/comments.js**

```javascript
/**
 * 评论系统 Helper
 */

hexo.extend.helper.register('load_comment_script', function() {
  const provider = this.theme.comments.provider;
  
  if (!this.theme.comments.enable || provider === 'none') {
    return '';
  }
  
  const scripts = {
    gitalk: 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js',
    disqus: `https://${this.theme.comments.disqus.shortname}.disqus.com/embed.js`,
    valine: 'https://cdn.jsdelivr.net/npm/valine@1/dist/Valine.min.js',
    waline: 'https://cdn.jsdelivr.net/npm/@waline/client@latest/dist/waline.js',
    utterances: 'https://utteranc.es/client.js',
    giscus: 'https://giscus.app/client.js'
  };
  
  return scripts[provider] || '';
});

hexo.extend.helper.register('comment_id', function() {
  const page = this.page;
  
  // 使用 MD5 生成唯一 ID
  const crypto = require('crypto');
  const id = crypto.createHash('md5').update(page.path).digest('hex');
  
  return id;
});
```

### 2.2 Disqus 集成

**themes/aurora/layout/_partial/comments/disqus.ejs**

```ejs
<div id="disqus_thread"></div>

<script>
  var disqus_config = function () {
    this.page.url = '<%= url %>';
    this.page.identifier = '<%= comment_id() %>';
    this.page.title = '<%= page.title %>';
  };
  
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://<%= theme_config('comments.disqus.shortname') %>.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
</script>

<noscript>
  Please enable JavaScript to view the 
  <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
</noscript>
```

### 2.3 Valine 集成

**themes/aurora/layout/_partial/comments/valine.ejs**

```ejs
<div id="vcomments"></div>

<script src="https://cdn.jsdelivr.net/npm/valine@1/dist/Valine.min.js"></script>
<script>
  new Valine({
    el: '#vcomments',
    appId: '<%= theme_config('comments.valine.app_id') %>',
    appKey: '<%= theme_config('comments.valine.app_key') %>',
    placeholder: '<%= theme_config('comments.valine.placeholder', '说点什么吧...') %>',
    avatar: '<%= theme_config('comments.valine.avatar', 'mp') %>',
    pageSize: <%= theme_config('comments.valine.page_size', 10) %>,
    lang: '<%= config.language || 'zh-CN' %>',
    visitor: <%= theme_config('comments.valine.visitor', false) %>,
    recordIP: false,
    enableQQ: <%= theme_config('comments.valine.enable_qq', false) %>,
    requiredFields: <%= JSON.stringify(theme_config('comments.valine.required_fields', ['nick', 'mail'])) %>,
    path: '<%= page.path %>'
  });
</script>
```

### 2.4 Waline 集成

**themes/aurora/layout/_partial/comments/waline.ejs**

```ejs
<div id="waline"></div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@waline/client@latest/dist/waline.css">
<script type="module">
  import { init } from 'https://cdn.jsdelivr.net/npm/@waline/client@latest/dist/waline.mjs';
  
  init({
    el: '#waline',
    serverURL: '<%= theme_config('comments.waline.server_url') %>',
    path: '<%= page.path %>',
    lang: '<%= config.language || 'zh-CN' %>',
    locale: {
      placeholder: '<%= theme_config('comments.waline.placeholder', '欢迎留言...') %>'
    },
    avatar: '<%= theme_config('comments.waline.avatar', 'mp') %>',
    meta: <%= JSON.stringify(theme_config('comments.waline.meta', ['nick', 'mail', 'link'])) %>,
    requiredMeta: <%= JSON.stringify(theme_config('comments.waline.required_meta', ['nick', 'mail'])) %>,
    pageSize: <%= theme_config('comments.waline.page_size', 10) %>,
    dark: 'auto',
    emoji: [
      'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/weibo',
      'https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/bilibili',
    ]
  });
</script>
```

### 2.5 Utterances 集成

**themes/aurora/layout/_partial/comments/utterances.ejs**

```ejs
<script 
  src="https://utteranc.es/client.js"
  repo="<%= theme_config('comments.utterances.repo') %>"
  issue-term="<%= theme_config('comments.utterances.issue_term', 'pathname') %>"
  theme="<%= theme_config('comments.utterances.theme', 'github-light') %>"
  crossorigin="anonymous"
  async>
</script>

<script>
  // 响应主题切换
  const updateUtterancesTheme = (theme) => {
    const iframe = document.querySelector('.utterances-frame');
    if (iframe) {
      iframe.contentWindow.postMessage(
        { type: 'set-theme', theme: theme === 'dark' ? 'github-dark' : 'github-light' },
        'https://utteranc.es'
      );
    }
  };
  
  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const theme = document.documentElement.getAttribute('data-theme');
        updateUtterancesTheme(theme);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
</script>
```

### 2.6 Giscus 集成

**themes/aurora/layout/_partial/comments/giscus.ejs**

```ejs
<script 
  src="https://giscus.app/client.js"
  data-repo="<%= theme_config('comments.giscus.repo') %>"
  data-repo-id="<%= theme_config('comments.giscus.repo_id') %>"
  data-category="<%= theme_config('comments.giscus.category', 'Announcements') %>"
  data-category-id="<%= theme_config('comments.giscus.category_id') %>"
  data-mapping="<%= theme_config('comments.giscus.mapping', 'pathname') %>"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="<%= theme_config('comments.giscus.input_position', 'bottom') %>"
  data-theme="<%= theme_config('comments.giscus.theme', 'light') %>"
  data-lang="<%= config.language || 'zh-CN' %>"
  data-loading="lazy"
  crossorigin="anonymous"
  async>
</script>

<script>
  // 响应主题切换
  function updateGiscusTheme(theme) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: theme === 'dark' ? 'dark' : 'light'
            }
          }
        },
        'https://giscus.app'
      );
    }
  }
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const theme = document.documentElement.getAttribute('data-theme');
        updateGiscusTheme(theme);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
</script>
```

---

## 第三部分：统计分析集成

### 3.1 Google Analytics 4

**themes/aurora/layout/_partial/analytics/google.ejs**

```ejs
<% if (theme_config('analytics.google_analytics.enable', false)) { %>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=<%= theme_config('analytics.google_analytics.tracking_id') %>"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '<%= theme_config('analytics.google_analytics.tracking_id') %>', {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=None;Secure'
    });
    
    // 自定义事件跟踪
    document.addEventListener('DOMContentLoaded', function() {
      // 外链点击追踪
      document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function(e) {
          gtag('event', 'click', {
            'event_category': 'outbound',
            'event_label': e.target.href
          });
        });
      });
      
      // 文件下载追踪
      document.querySelectorAll('a[download]').forEach(link => {
        link.addEventListener('click', function(e) {
          gtag('event', 'download', {
            'event_category': 'file',
            'event_label': e.target.href
          });
        });
      });
    });
  </script>
<% } %>
```

### 3.2 百度统计

**themes/aurora/layout/_partial/analytics/baidu.ejs**

```ejs
<% if (theme_config('analytics.baidu_analytics.enable', false)) { %>
  <!-- 百度统计 -->
  <script>
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?<%= theme_config('analytics.baidu_analytics.tracking_id') %>";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  </script>
<% } %>
```

### 3.3 不蒜子访客统计

**themes/aurora/layout/_partial/analytics/busuanzi.ejs**

```ejs
<% if (theme_config('analytics.busuanzi.enable', false)) { %>
  <!-- 不蒜子统计 -->
  <script async src="https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>
  
  <div class="site-stats">
    <!-- 站点总访问量 -->
    <span id="busuanzi_container_site_pv" style="display:none;">
      <i class="icon-eye"></i>
      访问量: <span id="busuanzi_value_site_pv"></span>
    </span>
    
    <!-- 站点总访客数 -->
    <span id="busuanzi_container_site_uv" style="display:none;">
      <i class="icon-users"></i>
      访客数: <span id="busuanzi_value_site_uv"></span>
    </span>
    
    <!-- 页面访问量（仅文章页） -->
    <% if (is_post()) { %>
      <span id="busuanzi_container_page_pv" style="display:none;">
        <i class="icon-eye"></i>
        阅读量: <span id="busuanzi_value_page_pv"></span>
      </span>
    <% } %>
  </div>
<% } %>
```

### 3.4 自定义统计面板

**themes/aurora/scripts/generators/stats.js**

```javascript
/**
 * 生成统计页面
 */

hexo.extend.generator.register('stats', function(locals) {
  if (!this.theme.stats || !this.theme.stats.enable) {
    return;
  }
  
  const posts = locals.posts.sort('-date');
  const categories = locals.categories;
  const tags = locals.tags;
  
  // 计算统计数据
  const stats = {
    // 基础统计
    total_posts: posts.length,
    total_categories: categories.length,
    total_tags: tags.length,
    
    // 字数统计
    total_words: 0,
    avg_words: 0,
    
    // 阅读时间统计
    total_reading_time: 0,
    avg_reading_time: 0,
    
    // 时间统计
    first_post_date: null,
    last_post_date: null,
    days_active: 0,
    
    // 年度统计
    posts_by_year: {},
    
    // 月度统计
    posts_by_month: {},
    
    // 分类统计
    top_categories: [],
    
    // 标签统计
    top_tags: []
  };
  
  // 处理文章数据
  posts.forEach(post => {
    // 字数统计
    const words = post.word_count || 0;
    stats.total_words += words;
    
    // 阅读时间
    const readingTime = post.reading_time || 0;
    stats.total_reading_time += readingTime;
    
    // 年度统计
    const year = post.date.year();
    stats.posts_by_year[year] = (stats.posts_by_year[year] || 0) + 1;
    
    // 月度统计
    const month = post.date.format('YYYY-MM');
    stats.posts_by_month[month] = (stats.posts_by_month[month] || 0) + 1;
    
    // 时间范围
    if (!stats.first_post_date || post.date < stats.first_post_date) {
      stats.first_post_date = post.date;
    }
    if (!stats.last_post_date || post.date > stats.last_post_date) {
      stats.last_post_date = post.date;
    }
  });
  
  // 计算平均值
  if (posts.length > 0) {
    stats.avg_words = Math.round(stats.total_words / posts.length);
    stats.avg_reading_time = Math.round(stats.total_reading_time / posts.length);
  }
  
  // 计算活跃天数
  if (stats.first_post_date && stats.last_post_date) {
    stats.days_active = stats.last_post_date.diff(stats.first_post_date, 'days');
  }
  
  // Top 分类
  stats.top_categories = categories
    .sort('length', -1)
    .limit(10)
    .map(cat => ({
      name: cat.name,
      count: cat.length,
      path: cat.path
    }));
  
  // Top 标签
  stats.top_tags = tags
    .sort('length', -1)
    .limit(20)
    .map(tag => ({
      name: tag.name,
      count: tag.length,
      path: tag.path
    }));
  
  return {
    path: 'stats/index.html',
    data: stats,
    layout: 'stats'
  };
});
```

**themes/aurora/layout/stats.ejs**

```ejs
<div class="stats-page">
  <header class="stats-header">
    <h1>📊 博客统计</h1>
    <p>数据分析与可视化</p>
  </header>
  
  <!-- 概览卡片 -->
  <section class="stats-overview">
    <div class="stat-card">
      <div class="stat-icon">📝</div>
      <div class="stat-content">
        <div class="stat-value"><%= page.total_posts %></div>
        <div class="stat-label">文章总数</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📖</div>
      <div class="stat-content">
        <div class="stat-value"><%= page.total_words.toLocaleString() %></div>
        <div class="stat-label">总字数</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">⏱️</div>
      <div class="stat-content">
        <div class="stat-value"><%= page.total_reading_time %></div>
        <div class="stat-label">总阅读时间（分钟）</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📅</div>
      <div class="stat-content">
        <div class="stat-value"><%= page.days_active %></div>
        <div class="stat-label">活跃天数</div>
      </div>
    </div>
  </section>
  
  <!-- 年度趋势图 -->
  <section class="stats-section">
    <h2>📈 年度发文趋势</h2>
    <div class="chart-container">
      <canvas id="yearly-chart"></canvas>
    </div>
  </section>
  
  <!-- 月度热力图 -->
  <section class="stats-section">
    <h2>🔥 月度发文热力图</h2>
    <div class="chart-container">
      <canvas id="monthly-chart"></canvas>
    </div>
  </section>
  
  <!-- Top 分类 -->
  <section class="stats-section">
    <h2>📁 热门分类 TOP 10</h2>
    <div class="top-list">
      <% page.top_categories.forEach((cat, index) => { %>
        <div class="top-item">
          <span class="rank">#<%= index + 1 %></span>
          <a href="<%- url_for(cat.path) %>" class="name"><%= cat.name %></a>
          <span class="count"><%= cat.count %> 篇</span>
          <div class="progress-bar">
            <div class="progress" style="width: <%= (cat.count / page.total_posts * 100).toFixed(1) %>%"></div>
          </div>
        </div>
      <% }) %>
    </div>
  </section>
  
  <!-- Top 标签云 -->
  <section class="stats-section">
    <h2>🏷️ 热门标签云</h2>
    <div class="tag-cloud-stats">
      <% 
        const maxCount = page.top_tags[0] ? page.top_tags[0].count : 1;
        page.top_tags.forEach(tag => {
          const size = 12 + Math.floor((tag.count / maxCount) * 24);
      %>
        <a 
          href="<%- url_for(tag.path) %>" 
          class="tag-item"
          style="font-size: <%= size %>px"
          title="<%= tag.count %> 篇文章"
        >
          <%= tag.name %>
        </a>
      <% }) %>
    </div>
  </section>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3"></script>
<script>
  // 年度趋势图
  const yearlyData = <%- JSON.stringify(page.posts_by_year) %>;
  const yearlyCtx = document.getElementById('yearly-chart');
  
  new Chart(yearlyCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(yearlyData).sort(),
      datasets: [{
        label: '文章数量',
        data: Object.keys(yearlyData).sort().map(year => yearlyData[year]),
        backgroundColor: 'rgba(77, 171, 247, 0.5)',
        borderColor: 'rgba(77, 171, 247, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
  
  // 月度热力图
  const monthlyData = <%- JSON.stringify(page.posts_by_month) %>;
  const monthlyCtx = document.getElementById('monthly-chart');
  
  new Chart(monthlyCtx, {
    type: 'line',
    data: {
      labels: Object.keys(monthlyData).sort(),
      datasets: [{
        label: '月度文章',
        data: Object.keys(monthlyData).sort().map(month => monthlyData[month]),
        fill: true,
        backgroundColor: 'rgba(77, 171, 247, 0.2)',
        borderColor: 'rgba(77, 171, 247, 1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
</script>
```

## 第四部分：性能优化

### 4.1 资源压缩与合并

#### HTML/CSS/JS 压缩

安装压缩插件：

```bash
npm install hexo-html-minifier hexo-clean-css hexo-uglify --save
```

**_config.yml**

```yaml
# HTML 压缩
html_minifier:
  enable: true
  exclude:
    - '*.min.html'
  options:
    removeComments: true
    collapseWhitespace: true
    minifyJS: true
    minifyCSS: true

# CSS 压缩
clean_css:
  enable: true
  exclude:
    - '*.min.css'

# JS 压缩
uglify:
  enable: true
  mangle: true
  exclude:
    - '*.min.js'
```

---

## 总结

本章完成了 Aurora 主题的高级功能和优化：

✅ 搜索功能（本地 + Algolia）
✅ 多评论系统集成
✅ 统计分析
✅ 性能优化
✅ PWA 支持
✅ SEO 优化
✅ 主题发布

经过四章学习，你已经掌握了专业 Hexo 主题开发的全部技能！

---

*系列完结 🎉*
