---
title: Hexo 主题开发系列教程（二）：扩展系统详解（上篇）
date: 2025-11-21 21:42:13
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/hexo.png
tags: 
- Hexo
categories:
- 技术教程
---


## 前言

在[上一篇教程](./hexo-theme-tutorial-01.md)中，我们学习了 Hexo 的七大核心概念：事件、本地变量、路由、Box、渲染、文章和模板。这些是 Hexo 的"骨架"，定义了系统如何运作。

本章我们将深入学习 **Hexo 扩展系统**，它是 Hexo 的"肌肉"，让我们能够在核心系统之上构建自定义功能。扩展系统包括十个重要组件，本篇（上篇）将介绍前五个：

- **Console（控制台）** - 自定义命令行工具
- **Deployer（部署器）** - 自动化部署方案  
- **Filter（过滤器）** - 数据处理管道
- **Generator（生成器）** - 页面生成逻辑
- **Helper（辅助函数）** - 模板工具函数

下篇将介绍后五个扩展组件。

---

## 核心概念回顾与扩展的关系

在开始之前，让我们理解核心概念与扩展系统的关系：

```
核心概念（第一章）          →    扩展系统（第二章）
─────────────────────────────────────────────────
事件系统                    →    所有扩展都可以监听事件
本地变量                    →    Helper/Filter 扩展变量
路由系统                    →    Generator 创建路由
Box/文件处理                →    Processor 处理文件
渲染引擎                    →    Renderer 注册渲染器
文章数据                    →    Filter 修改文章数据
模板脚手架                  →    Tag 创建模板标签
```

**核心区别：**

- 第一章：理解 Hexo **如何工作**（机制）
- 第二章：学习 Hexo **如何扩展**（实践）

---

## 1. Console（控制台）

### 概念介绍

Console 扩展允许你创建自定义的 Hexo 命令行指令。就像 `hexo server`、`hexo generate` 这样的内置命令，你可以创建专属的命令来自动化工作流程。

- Console 命令执行时会触发**事件系统**
- Console 可以访问**本地变量**和操作**Box**

### 基础语法

```javascript
// themes/your-theme/scripts/console.js
hexo.extend.console.register(name, desc, options, function(args) {
  // 命令逻辑
});
```

### 参数详解

```javascript
// 完整的参数示例
hexo.extend.console.register(
  'mytheme',                          // 命令名称
  '我的主题自定义命令',                 // 命令描述
  {
    usage: '[layout] <title>',         // 使用说明
    arguments: [                       // 参数定义
      {name: 'layout', desc: '文章布局'},
      {name: 'title', desc: '文章标题'}
    ],
    options: [                         // 选项定义
      {name: '-d, --draft', desc: '创建草稿'},
      {name: '-s, --slug <slug>', desc: '文件名'}
    ]
  },
  function(args) {
    // args.layout, args.title, args.d, args.s
  }
);
```

### 实战案例一：主题初始化命令

```javascript
// themes/your-theme/scripts/console-init.js

hexo.extend.console.register('theme:init', '初始化主题配置', {
  usage: '[options]',
  options: [
    {name: '--dark-mode', desc: '启用暗色模式'},
    {name: '--comments <provider>', desc: '评论系统 (disqus/gitalk/valine)'},
    {name: '--analytics', desc: '启用统计分析'}
  ]
}, function(args) {
  const fs = require('hexo-fs');
  const path = require('path');
  const yaml = require('js-yaml');
  
  const configPath = path.join(hexo.theme_dir, '_config.yml');
  
  // 读取现有配置
  let config = {};
  if (fs.existsSync(configPath)) {
    config = yaml.load(fs.readFileSync(configPath));
  }
  
  // 应用命令行参数
  if (args['dark-mode']) {
    config.appearance = config.appearance || {};
    config.appearance.dark_mode = true;
    hexo.log.info('✓ 暗色模式已启用');
  }
  
  if (args.comments) {
    config.comments = {
      enable: true,
      provider: args.comments
    };
    hexo.log.info(`✓ 评论系统: ${args.comments}`);
  }
  
  if (args.analytics) {
    config.analytics = {
      enable: true,
      google_analytics: '',
      baidu_analytics: ''
    };
    hexo.log.info('✓ 统计分析已启用（请配置 tracking ID）');
  }
  
  // 保存配置
  fs.writeFileSync(configPath, yaml.dump(config));
  hexo.log.success('主题配置初始化完成！');
  
  // 显示后续步骤
  hexo.log.info('');
  hexo.log.info('后续步骤：');
  hexo.log.info('1. 编辑 themes/your-theme/_config.yml 完善配置');
  hexo.log.info('2. 运行 hexo server 预览效果');
});
```

**使用方法：**

```bash
hexo theme:init --dark-mode --comments gitalk --analytics
```

### 实战案例二：内容统计命令

```javascript
// themes/your-theme/scripts/console-stats.js

hexo.extend.console.register('stats', '显示博客统计信息', {
  options: [
    {name: '--detail', desc: '显示详细信息'},
    {name: '--export <file>', desc: '导出为 JSON 文件'}
  ]
}, function(args) {
  const posts = hexo.locals.get('posts');
  const pages = hexo.locals.get('pages');
  const tags = hexo.locals.get('tags');
  const categories = hexo.locals.get('categories');
  
  // 计算统计数据
  const stats = {
    posts: {
      total: posts.length,
      published: posts.filter(p => p.published).length,
      draft: posts.filter(p => !p.published).length
    },
    pages: {
      total: pages.length
    },
    tags: {
      total: tags.length,
      top5: tags.sort('length', -1).limit(5).map(t => ({
        name: t.name,
        count: t.length
      }))
    },
    categories: {
      total: categories.length,
      top5: categories.sort('length', -1).limit(5).map(c => ({
        name: c.name,
        count: c.length
      }))
    },
    words: {
      total: 0,
      average: 0
    }
  };
  
  // 计算总字数
  posts.forEach(post => {
    const words = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    stats.words.total += words;
  });
  stats.words.average = Math.round(stats.words.total / posts.length);
  
  // 显示统计信息
  hexo.log.info('');
  hexo.log.info('📊 博客统计信息');
  hexo.log.info('═══════════════════════════════');
  hexo.log.info(`📝 文章: ${stats.posts.total} 篇 (已发布: ${stats.posts.published}, 草稿: ${stats.posts.draft})`);
  hexo.log.info(`📄 页面: ${stats.pages.total} 个`);
  hexo.log.info(`🏷️  标签: ${stats.tags.total} 个`);
  hexo.log.info(`📁 分类: ${stats.categories.total} 个`);
  hexo.log.info(`📖 总字数: ${stats.words.total.toLocaleString()} 字`);
  hexo.log.info(`📊 平均字数: ${stats.words.average.toLocaleString()} 字/篇`);
  
  if (args.detail) {
    hexo.log.info('');
    hexo.log.info('🔥 热门标签 TOP 5:');
    stats.tags.top5.forEach((tag, i) => {
      hexo.log.info(`   ${i + 1}. ${tag.name} (${tag.count} 篇)`);
    });
    
    hexo.log.info('');
    hexo.log.info('📚 热门分类 TOP 5:');
    stats.categories.top5.forEach((cat, i) => {
      hexo.log.info(`   ${i + 1}. ${cat.name} (${cat.count} 篇)`);
    });
  }
  
  // 导出数据
  if (args.export) {
    const fs = require('hexo-fs');
    fs.writeFileSync(args.export, JSON.stringify(stats, null, 2));
    hexo.log.success(`统计数据已导出到: ${args.export}`);
  }
  
  hexo.log.info('');
});
```

**使用方法：**

```bash
hexo stats                           # 基本统计
hexo stats --detail                  # 详细统计
hexo stats --export stats.json       # 导出数据
```

### 实战案例三：文章质量检查命令

```javascript
// themes/your-theme/scripts/console-check.js

hexo.extend.console.register('check', '检查文章质量', {
  options: [
    {name: '--fix', desc: '自动修复可修复的问题'}
  ]
}, function(args) {
  const posts = hexo.locals.get('posts');
  const issues = [];
  
  posts.forEach(post => {
    const postIssues = [];
    
    // 检查标题长度
    if (post.title.length < 5) {
      postIssues.push('标题过短（少于5个字符）');
    }
    if (post.title.length > 60) {
      postIssues.push('标题过长（超过60个字符）');
    }
    
    // 检查是否有摘要
    if (!post.excerpt) {
      postIssues.push('缺少摘要');
    }
    
    // 检查标签和分类
    if (!post.tags || post.tags.length === 0) {
      postIssues.push('没有标签');
    }
    if (!post.categories || post.categories.length === 0) {
      postIssues.push('没有分类');
    }
    
    // 检查内容长度
    const words = post.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    if (words < 100) {
      postIssues.push(`内容过短（仅 ${words} 字）`);
    }
    
    // 检查是否有图片
    const hasImages = /<img/.test(post.content);
    if (!hasImages && words > 500) {
      postIssues.push('长文章建议添加配图');
    }
    
    // 检查链接
    const brokenLinks = [];
    const linkRegex = /href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(post.content)) !== null) {
      const url = match[1];
      if (url.startsWith('http') && url.includes('localhost')) {
        brokenLinks.push(url);
      }
    }
    if (brokenLinks.length > 0) {
      postIssues.push(`发现本地链接: ${brokenLinks.join(', ')}`);
    }
    
    if (postIssues.length > 0) {
      issues.push({
        title: post.title,
        path: post.source,
        issues: postIssues
      });
    }
  });
  
  // 显示结果
  if (issues.length === 0) {
    hexo.log.success('✓ 所有文章检查通过！');
  } else {
    hexo.log.warn(`发现 ${issues.length} 篇文章存在问题：`);
    hexo.log.info('');
    
    issues.forEach(item => {
      hexo.log.warn(`📄 ${item.title}`);
      hexo.log.info(`   文件: ${item.path}`);
      item.issues.forEach(issue => {
        hexo.log.info(`   ⚠️  ${issue}`);
      });
      hexo.log.info('');
    });
    
    if (args.fix) {
      hexo.log.info('自动修复功能开发中...');
    }
  }
});
```

### Console 最佳实践

```javascript
// 1. 使用异步操作
hexo.extend.console.register('async-command', 'description', async function(args) {
  await someAsyncOperation();
  return 'completed';
});

// 2. 错误处理
hexo.extend.console.register('safe-command', 'description', function(args) {
  try {
    // 命令逻辑
  } catch (err) {
    hexo.log.error('命令执行失败:', err.message);
    throw err;
  }
});

// 3. 进度显示
hexo.extend.console.register('progress-command', 'description', function(args) {
  const total = 100;
  for (let i = 0; i < total; i++) {
    hexo.log.info(`进度: ${i + 1}/${total}`);
    // 处理逻辑
  }
});

// 4. 交互式命令（需要额外的包）
hexo.extend.console.register('interactive', 'description', async function(args) {
  const inquirer = require('inquirer');
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continue',
      message: '是否继续？',
      default: true
    }
  ]);
  
  if (answers.continue) {
    // 继续执行
  }
});
```

---

## 2. Deployer（部署器）

### 概念介绍

Deployer 扩展让你能够自定义 `hexo deploy` 命令的行为，实现自动化部署到各种平台。

- Deployer 在**事件系统**的 `deployBefore` 和 `deployAfter` 之间执行
- Deployer 访问生成的静态文件（在 **public** Box 中）

### 基础语法

```javascript
hexo.extend.deployer.register(name, function(args) {
  // 部署逻辑
});
```

### 实战案例一：自定义 FTP 部署器

```javascript
// themes/your-theme/scripts/deployer-ftp.js

hexo.extend.deployer.register('myftp', function(args) {
  const fs = require('hexo-fs');
  const FtpClient = require('ftp');
  const path = require('path');
  
  // 从配置文件读取 FTP 设置
  const config = this.config.deploy;
  
  return new Promise((resolve, reject) => {
    const client = new FtpClient();
    
    client.on('ready', async function() {
      hexo.log.info('已连接到 FTP 服务器');
      
      try {
        // 获取 public 目录下的所有文件
        const publicDir = hexo.public_dir;
        const files = fs.listDirSync(publicDir);
        
        hexo.log.info(`准备上传 ${files.length} 个文件...`);
        
        // 上传文件
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const localPath = path.join(publicDir, file);
          const remotePath = path.join(config.root || '/', file);
          
          // 确保远程目录存在
          const remoteDir = path.dirname(remotePath);
          await mkdirp(client, remoteDir);
          
          // 上传文件
          await uploadFile(client, localPath, remotePath);
          
          hexo.log.info(`[${i + 1}/${files.length}] ${file}`);
        }
        
        hexo.log.success('部署完成！');
        client.end();
        resolve();
        
      } catch (err) {
        client.end();
        reject(err);
      }
    });
    
    client.on('error', reject);
    
    // 连接到 FTP 服务器
    client.connect({
      host: config.host,
      port: config.port || 21,
      user: config.user,
      password: config.password
    });
  });
  
  // 辅助函数：创建远程目录
  function mkdirp(client, dir) {
    return new Promise((resolve, reject) => {
      client.mkdir(dir, true, (err) => {
        if (err && err.code !== 550) { // 550 = 目录已存在
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  // 辅助函数：上传文件
  function uploadFile(client, local, remote) {
    return new Promise((resolve, reject) => {
      client.put(local, remote, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
});
```

**配置文件：**

```yaml
# _config.yml
deploy:
  type: myftp
  host: ftp.example.com
  port: 21
  user: username
  password: password
  root: /public_html
```

### 实战案例二：腾讯云 COS 部署器

```javascript
// themes/your-theme/scripts/deployer-cos.js

hexo.extend.deployer.register('cos', function(args) {
  const COS = require('cos-nodejs-sdk-v5');
  const fs = require('hexo-fs');
  const path = require('path');
  const crypto = require('crypto');
  
  const config = this.config.deploy;
  
  // 初始化 COS 客户端
  const cos = new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey
  });
  
  const bucket = config.bucket;
  const region = config.region;
  const publicDir = this.public_dir;
  
  return new Promise(async (resolve, reject) => {
    try {
      hexo.log.info('开始上传到腾讯云 COS...');
      
      // 获取所有文件
      const files = fs.listDirSync(publicDir);
      
      // 获取远程文件列表（用于增量上传）
      const remoteFiles = await getRemoteFiles(cos, bucket, region);
      const remoteFileMap = new Map(
        remoteFiles.map(f => [f.Key, f.ETag])
      );
      
      let uploadCount = 0;
      let skipCount = 0;
      
      // 上传文件
      for (const file of files) {
        const localPath = path.join(publicDir, file);
        const localETag = await getFileETag(localPath);
        const remoteETag = remoteFileMap.get(file);
        
        // 如果文件未改变，跳过上传
        if (localETag === remoteETag) {
          skipCount++;
          continue;
        }
        
        await uploadToCOS(cos, bucket, region, localPath, file);
        uploadCount++;
        
        hexo.log.info(`[${uploadCount + skipCount}/${files.length}] ${file}`);
      }
      
      hexo.log.success(`部署完成！上传: ${uploadCount}, 跳过: ${skipCount}`);
      
      // 刷新 CDN（如果配置了）
      if (config.cdn) {
        await refreshCDN(config.cdn);
      }
      
      resolve();
      
    } catch (err) {
      hexo.log.error('部署失败:', err.message);
      reject(err);
    }
  });
  
  // 获取远程文件列表
  function getRemoteFiles(cos, bucket, region) {
    return new Promise((resolve, reject) => {
      cos.getBucket({
        Bucket: bucket,
        Region: region
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data.Contents || []);
      });
    });
  }
  
  // 计算文件 ETag
  function getFileETag(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
  
  // 上传文件到 COS
  function uploadToCOS(cos, bucket, region, localPath, key) {
    return new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: key,
        Body: fs.createReadStream(localPath)
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  
  // 刷新 CDN
  async function refreshCDN(cdnConfig) {
    if (!cdnConfig.enable) return;
    
    hexo.log.info('正在刷新 CDN...');
    // CDN 刷新逻辑
    hexo.log.success('CDN 刷新完成');
  }
});
```

**配置文件：**

```yaml
# _config.yml
deploy:
  type: cos
  secretId: your-secret-id
  secretKey: your-secret-key
  bucket: your-bucket-name
  region: ap-guangzhou
  cdn:
    enable: true
    urls:
      - https://example.com
```

### 实战案例三：多目标部署器

```javascript
// themes/your-theme/scripts/deployer-multi.js

hexo.extend.deployer.register('multi', async function(args) {
  const config = this.config.deploy;
  
  if (!Array.isArray(config.targets)) {
    throw new Error('multi deployer 需要配置 targets 数组');
  }
  
  hexo.log.info(`准备部署到 ${config.targets.length} 个目标...`);
  
  const results = [];
  
  // 顺序部署到每个目标
  for (let i = 0; i < config.targets.length; i++) {
    const target = config.targets[i];
    hexo.log.info('');
    hexo.log.info(`[${i + 1}/${config.targets.length}] 部署到: ${target.type}`);
    
    try {
      // 临时替换配置
      const originalDeploy = this.config.deploy;
      this.config.deploy = target;
      
      // 调用对应的部署器
      const deployer = hexo.extend.deployer.get(target.type);
      if (!deployer) {
        throw new Error(`未找到部署器: ${target.type}`);
      }
      
      await deployer.call(this, args);
      
      // 恢复配置
      this.config.deploy = originalDeploy;
      
      results.push({ target: target.type, success: true });
      hexo.log.success(`✓ ${target.type} 部署成功`);
      
    } catch (err) {
      results.push({ 
        target: target.type, 
        success: false, 
        error: err.message 
      });
      hexo.log.error(`✗ ${target.type} 部署失败: ${err.message}`);
      
      if (config.stopOnError) {
        throw err;
      }
    }
  }
  
  // 显示总结
  hexo.log.info('');
  hexo.log.info('部署总结:');
  const successCount = results.filter(r => r.success).length;
  hexo.log.info(`成功: ${successCount}/${results.length}`);
  
  if (successCount < results.length) {
    hexo.log.warn('部分目标部署失败');
  }
});
```

**配置文件：**

```yaml
# _config.yml
deploy:
  type: multi
  stopOnError: false  # 出错后是否继续
  targets:
    - type: git
      repo: git@github.com:user/repo.git
      branch: gh-pages
    - type: cos
      secretId: xxx
      secretKey: xxx
      bucket: my-bucket
      region: ap-guangzhou
    - type: myftp
      host: ftp.example.com
      user: username
      password: password
```

### Deployer 最佳实践

```javascript
// 1. 使用配置验证
hexo.extend.deployer.register('safe-deployer', function(args) {
  const config = this.config.deploy;
  
  // 验证必需的配置
  const required = ['host', 'user', 'password'];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`缺少配置项: ${key}`);
    }
  }
  
  // 部署逻辑
});

// 2. 实现增量部署
hexo.extend.deployer.register('incremental', async function(args) {
  // 比较本地和远程文件
  // 只上传修改过的文件
  // 提高部署速度
});

// 3. 添加部署前确认
hexo.extend.deployer.register('confirm-deploy', async function(args) {
  const config = this.config.deploy;
  
  hexo.log.warn('即将部署到生产环境！');
  hexo.log.info(`目标: ${config.host}`);
  
  if (!args.yes) {
    const inquirer = require('inquirer');
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'continue',
      message: '确认继续？',
      default: false
    }]);
    
    if (!answer.continue) {
      hexo.log.info('已取消部署');
      return;
    }
  }
  
  // 执行部署
});

// 4. 部署后通知
hexo.extend.deployer.register('notify-deploy', async function(args) {
  try {
    await actualDeploy();
    
    // 发送部署成功通知
    await sendNotification({
      type: 'success',
      message: '部署成功',
      time: new Date()
    });
    
  } catch (err) {
    // 发送部署失败通知
    await sendNotification({
      type: 'error',
      message: `部署失败: ${err.message}`,
      time: new Date()
    });
    
    throw err;
  }
});
```

---

## 3. Filter（过滤器）

### 概念介绍

Filter 是 Hexo 数据处理的核心机制，它在数据流的特定节点介入，允许你修改、增强或验证数据。这是一个强大的钩子系统。

- Filter 在**事件系统**的不同阶段被触发
- Filter 修改**本地变量**和**文章数据**
- Filter 影响**渲染引擎**的输出

### Filter 的执行时机

```
数据流向                     可用的 Filter
────────────────────────────────────────────
1. 读取配置文件              after_init
2. 处理源文件                before_post_render
3. 渲染 Markdown             after_post_render
4. 生成页面                  before_generate
5. 模板渲染                  template_locals
6. 输出 HTML                 after_render
7. 生成完成                  after_generate
```

### 基础语法

```javascript
hexo.extend.filter.register(type, function(data, ...args) {
  // 处理数据
  return data;
}, priority);
```

### Filter 类型详解

#### 1. before_post_render - 文章渲染前

```javascript
// themes/your-theme/scripts/filter-before-render.js

// 自动添加版权声明
hexo.extend.filter.register('before_post_render', function(data) {
  if (data.layout === 'post') {
    const copyright = `

---

**版权声明：** 本文为原创文章，版权归 ${this.config.author} 所有。
转载请注明出处：${this.config.url}${data.path}

`;
    data.content += copyright;
  }
  return data;
});

// 自动添加阅读时间和字数统计
hexo.extend.filter.register('before_post_render', function(data) {
  // 计算字数（去除 HTML 标签）
  const text = data.content.replace(/<[^>]+>/g, '');
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  
  data.word_count = wordCount;
  data.reading_time = readingTime;
  data.reading_minutes = `${readingTime} 分钟`;
  
  return data;
});

// 处理图片懒加载
hexo.extend.filter.register('before_post_render', function(data) {
  if (!this.theme.lazyload || !this.theme.lazyload.enable) {
    return data;
  }
  
  // 将所有图片添加 loading="lazy" 属性
  data.content = data.content.replace(
    /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
    '<img$1src="$2" loading="lazy"$3>'
  );
  
  return data;
});

// 外链自动添加属性
hexo.extend.filter.register('before_post_render', function(data) {
  const siteUrl = this.config.url;
  
  data.content = data.content.replace(
    /<a\s+href="(https?:\/\/[^"]+)"([^>]*)>/g,
    (match, url, attrs) => {
      // 如果是外链
      if (!url.startsWith(siteUrl)) {
        // 添加 rel="noopener noreferrer" 和 target="_blank"
        if (!attrs.includes('target=')) {
          attrs += ' target="_blank"';
        }
        if (!attrs.includes('rel=')) {
          attrs += ' rel="noopener noreferrer"';
        }
        return `<a href="${url}"${attrs}>`;
      }
      return match;
    }
  );
  
  return data;
});
```

#### 2. after_post_render - 文章渲染后

```javascript
// themes/your-theme/scripts/filter-after-render.js

// 生成文章目录（TOC）
hexo.extend.filter.register('after_post_render', function(data) {
  if (data.toc === false) return data;
  
  const cheerio = require('cheerio');
  const $ = cheerio.load(data.content);
  const headings = [];
  
  $('h1, h2, h3, h4, h5, h6').each(function() {
    const level = parseInt(this.name.substring(1));
    const text = $(this).text();
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    
    // 为标题添加 ID
    $(this).attr('id', id);
    
    headings.push({
      level: level,
      text: text,
      id: id
    });
  });
  
  data.content = $.html();
  data.toc_headings = headings;
  
  return data;
});

// 代码块增强
hexo.extend.filter.register('after_post_render', function(data) {
  const $ = require('cheerio').load(data.content);
  
  $('pre code').each(function() {
    const $code = $(this);
    const lang = $code.attr('class')?.replace('language-', '') || 'text';
    
    // 包装代码块
    const $wrapper = $('<div class="code-wrapper"></div>');
    const $header = $(`
      <div class="code-header">
        <span class="lang">${lang}</span>
        <button class="copy-btn" data-clipboard-target="#code-${Date.now()}">
          复制
        </button>
      </div>
    `);
    
    $code.attr('id', `code-${Date.now()}`);
    $wrapper.append($header);
    $wrapper.append($code.parent()); // 包含 <pre>
    
    $code.parent().parent().replaceWith($wrapper);
  });
  
  data.content = $.html();
  return data;
});

// 图片优化
hexo.extend.filter.register('after_post_render', function(data) {
  const $ = require('cheerio').load(data.content);
  
  $('img').each(function() {
    const $img = $(this);
    const src = $img.attr('src');
    
    // 为图片添加包装器
    const $figure = $('<figure class="image-container"></figure>');
    $figure.append($img);
    
    // 如果有 alt，添加图注
    const alt = $img.attr('alt');
    if (alt) {
      $figure.append(`<figcaption>${alt}</figcaption>`);
    }
    
    $img.replaceWith($figure);
  });
  
  data.content = $.html();
  return data;
});
```

#### 3. template_locals - 模板变量注入

这部分在第一章已经详细介绍过，这里补充一些高级用法：

```javascript
// themes/your-theme/scripts/filter-template-locals.js

// 注入全局导航数据
hexo.extend.filter.register('template_locals', function(locals) {
  const config = this.config;
  const theme = this.theme;
  
  // 构建导航菜单
  locals.nav_menu = (theme.menu || []).map(item => {
    const isActive = locals.path.startsWith(item.path);
    return {
      ...item,
      active: isActive,
      url: this.url_for(item.path)
    };
  });
  
  return locals;
});

// 注入性能指标
hexo.extend.filter.register('template_locals', function(locals) {
  locals.performance = {
    build_time: Date.now(),
    posts_count: locals.site.posts.length,
    pages_count: locals.site.pages.length
  };
  
  return locals;
});

// 条件性注入重量级数据
hexo.extend.filter.register('template_locals', function(locals) {
  // 只在首页注入热门文章
  if (locals.path === '' || locals.path === 'index.html') {
    locals.popular_posts = locals.site.posts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .limit(10)
      .toArray();
  }
  
  return locals;
});
```

#### 4. after_render - HTML 输出处理

```javascript
// themes/your-theme/scripts/filter-after-render.js

// HTML 压缩
hexo.extend.filter.register('after_render:html', function(str, data) {
  if (!this.config.minify_html) return str;
  
  const htmlMinifier = require('html-minifier').minify;
  
  return htmlMinifier(str, {
    removeComments: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true
  });
});

// CSS 处理
hexo.extend.filter.register('after_render:css', function(str, data) {
  // 自动添加浏览器前缀
  const autoprefixer = require('autoprefixer');
  const postcss = require('postcss');
  
  return postcss([autoprefixer])
    .process(str, { from: undefined })
    .then(result => result.css);
});

// JS 压缩
hexo.extend.filter.register('after_render:js', function(str, data) {
  if (!this.config.minify_js) return str;
  
  const UglifyJS = require('uglify-js');
  const result = UglifyJS.minify(str);
  
  if (result.error) {
    hexo.log.error('JS 压缩失败:', result.error);
    return str;
  }
  
  return result.code;
});

// 注入分析代码
hexo.extend.filter.register('after_render:html', function(str, data) {
  if (!this.theme.analytics || !this.theme.analytics.enable) {
    return str;
  }
  
  const analyticsCode = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${this.theme.analytics.google_id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${this.theme.analytics.google_id}');
    </script>
  `;
  
  // 在 </head> 前插入
  return str.replace('</head>', analyticsCode + '</head>');
});
```

### Filter 优先级

```javascript
// 优先级越小越先执行，默认为 10

// 高优先级 - 先执行
hexo.extend.filter.register('before_post_render', function(data) {
  // 最先处理
  return data;
}, 1);

// 默认优先级
hexo.extend.filter.register('before_post_render', function(data) {
  // 第二个执行
  return data;
});

// 低优先级 - 后执行
hexo.extend.filter.register('before_post_render', function(data) {
  // 最后处理
  return data;
}, 100);
```

### Filter 最佳实践

```javascript
// 1. 条件执行
hexo.extend.filter.register('before_post_render', function(data) {
  // 只处理特定布局
  if (data.layout !== 'post') return data;
  
  // 只在启用功能时处理
  if (!this.theme.feature_enabled) return data;
  
  // 处理逻辑
  return data;
});

// 2. 错误处理
hexo.extend.filter.register('after_post_render', function(data) {
  try {
    // 可能失败的处理
    data.content = processContent(data.content);
  } catch (err) {
    hexo.log.warn(`处理文章失败: ${data.title}`, err.message);
    // 返回原数据，不中断流程
  }
  return data;
});

// 3. 性能优化 - 缓存结果
const cache = new Map();

hexo.extend.filter.register('template_locals', function(locals) {
  const cacheKey = `stats-${locals.site.posts.length}`;
  
  if (!cache.has(cacheKey)) {
    // 计算耗时的统计数据
    const stats = calculateStats(locals.site.posts);
    cache.set(cacheKey, stats);
  }
  
  locals.site_stats = cache.get(cacheKey);
  return locals;
});

// 4. 链式处理
hexo.extend.filter.register('before_post_render', function(data) {
  data = addReadingTime(data);
  data = addTableOfContents(data);
  data = processImages(data);
  return data;
});
```

---

由于篇幅限制，我将在这里停止上篇，将 Generator 和 Helper 放到下篇。

## 小结

本篇（上篇）介绍了 Hexo 扩展系统的前三个核心组件：

1. **Console（控制台）** - 创建自定义命令，实现工作流自动化
2. **Deployer（部署器）** - 自定义部署流程，支持多平台部署
3. **Filter（过滤器）** - 在数据流的各个节点介入，修改和增强数据

这三个扩展让我们能够：

- 通过 Console 扩展 Hexo 的命令行能力
- 通过 Deployer 实现灵活的部署方案
- 通过 Filter 深度定制数据处理流程

在下一篇教程中，我们将继续学习 Generator、Helper、Injector、Migrator、Processor、Renderer 和 Tag，完成扩展系统的全面学习。

## 参考资源

- [Hexo 扩展 API 文档](https://hexo.io/zh-cn/api/)
- [Hexo 插件开发指南](https://hexo.io/zh-cn/docs/plugins)
