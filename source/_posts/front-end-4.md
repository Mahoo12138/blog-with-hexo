---
title: 前端入门之Vuejs初试
date: 2020-02-18 16:00:21
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/vuejs.png
categories: 
- 学习笔记
tags:
- Vuejs
---

### 前言

自从上学期期末考试以后，就没有更新博客了，那时候是因为，你懂的嘛；

回到家后，肯定是玩啦，这么长的假期，同学聚会也少不了，过年期间更是忙的没话说，况且，今年的春节被这个新型冠状病毒整的是你死我活的，国家都进入一种战时状态，天佑中华吧，早点过去这次的考验。

相比于在医院战场上的医务工作者人员，住在荒野乡间的我，整个世界都闲了下来，但是，你说这可能吗？

在这个这么长的假期，我丝毫没有忘记我一直以来对网站的追求，从最初的用别人的完整的源码，到用别人的框架和主题，我都一直想自己亲手敲出属于自己的网站，于是我早就开始了……

### 前端基础 HTML & CSS

说到 HTML  & CSS 经常接触网站的我，早有入门，但是没有经过系统化的学习了解，很多东西尚未知悉，我花了大约一周时间把尚硅谷推出的[培训课程](https://www.bilibili.com/video/av77217003)过了一遍，当然这里并不是收了广告费的，只是这个老师讲的确实不错，如果自学能力较差，像我，就必须有个老师引导，学习更得劲。当然了，大佬都是靠着[W3C](https://www.w3school.com.cn/)网站的文档自学的，这个确实厉害。

跟着课程走，相关的笔记，我用了Xmind做详细记录（感觉没什么用，多实战才是关键），一些经典的处理，我会单独列举出来。

#### 引入图标字体

1. 引入图标字体库，一般都会选择在[iconfont](https://www.iconfont.cn/)官网下载

2. 解压后，将`css,eot,svg,ttf,woff,woff2`文件复制到项目目录

3. 在 **APP.vue** 文件中全局引入

   ```javascript
   @import 'assets/fonts/iconfont.css';
   ```

4. 挑选相应图标并获取字体编码，应用于页面

   ```html
   <span class="ifont">&#x33;</span>
   ```

#### 实现网页无法选中

+ 通过CSS

    ```css
    *{
        moz-user-select: -moz-none;
        -moz-user-select: none;
        -o-user-select:none;
        -khtml-user-select:none;
        -webkit-user-select:none;
        -ms-user-select:none;
        user-select:none;
    }
    ```

+ 通过JS

  ```javascript
  //禁止页面选择以及鼠标右键
  document.οncοntextmenu=function(){return false;}; 
  document.onselectstart=function(){return false;};
  ```

+ 通过H5的body标签

  ```html
  <body οncοntextmenu="return false;" onselectstart="return false">
  ```

### 前端框架——Vuejs

有了一些基础，再加上我这颗想要速成的心，我接着就看[Vuejs](https://cn.vuejs.org/)相关的内容了，这里拿出一个常见的 UI 案例——**Tabbar**，作为练习。

#### 基本结构的搭建

首先看下图，这就是Tabbar的成品图，作为一个组件，其显示的内容完全由外界决定，，我们在封装的过程中，只需要设置基本的布局和样式即可。

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/Vuejs/tabbar.png)

基本的结构就是 **div** 的嵌套了，样式设置也没有什么技术含量：

```css
  #tab-bar {
    display: flex;		//设置为弹性盒布局
    background-color: #f6f6f6;
    position: fixed;	  //固定布局
    right: 0;
    left: 0;
    bottom: 0;			//偏移至底部
      					//设置Tabbar顶端阴影
    box-shadow: 0 -1px 1px rgba(100,100,100,.2);
  }
```

```css
.tab-bar-item {
    flex: 1;				    //子项平均分布
    text-align: center;		 //文字居中
    height: 49px;
    font-size: 14px;
    padding-top: -2px;		  //一些细微调整
}
.tab-bar-item img{
    width: 24px;
    margin-top: 3px;
    vertical-align: middle;	 //去除图片底部的空隙
}
.active{
    color: #1296db;			 //文本颜色
}
```

#### Tabbar组件的封装

具体的封装思路：

+ 定义插槽，用于设置Tabbar的每个子项Item
+ 在Item中再设置三个插槽，用于对图标和文字的插入

为什么Item中是三个插槽？因为点击Item时，为了更好的用户体验，往往会有图标的强调色，一次需要插入两个图标，而不是在点击时再插入。

```html
<!--  Tabbar 插槽，同于放置Item  -->
<div id="tab-bar">
  <slot></slot>
</div>
```

```html
<!--  Item 插槽  -->
<div class="tab-bar-item" @click="itemClick">
  <div v-if="isActive"><slot name="item-icon"></slot></div>
  <div v-else><slot name="item-icon-active"></slot></div>
  <div class="active"><slot name="item-text"></slot></div>
</div>
```

`isActive`是一个计算属性，涉及到颜色控制，之后再详解；另一个就是，为了避免插槽再替换时，覆盖掉`v-if`和`v-else`，我们可以将插槽放入 **div** 中，并将它们作为 **div** 的属性。

#### 结合路由实现点击跳转

静态的Tabbar已经差不多了，Tabbar主要的功能就是实现多个页面的跳转，主要步骤：

+ 创建页面的`.vue`文件

+ 修改路由配置文件

+ 设置点击方法

```javascript
//路由 index.js 文件
import Vue from 'vue'
import Router from 'vue-router'

//1. 安装插件
Vue.use(Router);

//使用懒加载，这里只做一个示例
const Home = () => import('../views/home/Home');


//2. 创建路由对象并导出
export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      component: Home
    }
  ]
})
```

点击方法的设置在`tab-bar-item`这个 **div** 中设置：

```html
<div class="tab-bar-item" @click="itemClick">
```

跳转路由的代码：

```javascript
methods: {
    itemClick(){
        this.$router.replace(this.path);
    }
}
```

#### Tabbar的动态颜色控制

到这里，整个`Tabbar`的封装已经差不多了，剩下的就是一个`TabBarItem`在细节性上的显示问题了，在点击事件产生时变色；此外作为一个封装的组件，其颜色的改变还需要由用户指定，而不能固定一个颜色，这里我们直接上代码：

首先，我们把固定的颜色样式删除，并在`TabBarItem`组件中添加如下代码：

```javascript
computed: {
  isActive(){
    return this.$route.path.indexOf(this.path) === -1
  },
  activeStyle(){
    return this.isActive ? {} : {color: this.activeColor}
  }
},
props: {
  path: String,
  activeColor: {
    type: String,
    default: '#1296db'
  }
}
```

在App的模板中添加如下代码：

```html
<tab-bar>
  <tab-bar-item path="/home" active-color="blue">
    <img  slot="item-icon" src="./assets/img/tabbar/home.svg" alt="">
    <img  slot="item-icon-active" src="./assets/img/tabbar/home_active.svg" alt="">
    <div slot="item-text">首页</div>
  </tab-bar-item>
</tab-bar>
```

也就是在父组件中向子组件TabBarItem中传入两个数据`path`和`active-color`,首先我们来看`isActive`这个计算属性，`indexOf`函数的作用时查看当前路由内的 **path** 值是否含有父组件传来的 **path** ，没有则返回 **-1**，`isActive`为`true`。

> The `indexOf()` method returns the index within the calling String object of the first occurrence of the specified value, starting the search at fromIndex. Returns **-1** if the value is not found.

`active-color`参数则为传入的字体的颜色，字符串类型，如果忽略，则取默认值，首先要把html模板中的样式修改为：

```html
<div :style="activeStyle"><slot name="item-text"></slot></div>
```

用`v-bind`绑定一个样式属性，由`isActive`控制，即可实现颜色动态控制。

