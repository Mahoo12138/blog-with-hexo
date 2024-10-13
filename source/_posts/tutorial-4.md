---
title: 折腾青年大学习自动观看截图的小工具
date: 2021-12-28 16:00:26
categories:
- 技术教程
tags:
- Tasker
- Termux
---

## 抓包获取 Cookie

使用抓包软件 Fiddler 在微信 PC 端进行抓包，在主机名为`api.lngqt.shechem.cn`的请求中可以找到形如`Cookie: BDed_HeaderKey=X2xQAy1bWnsNayB9YxxxxxxCF5%2FW3N%2FNBR5CWxxxxxxUFw%3D`的 Cookie，它的时长还挺长的，主要是模拟微信登录过于麻烦；

## 编写服务端代码

在这里由于是要获取到**积分界面**的截图，我最初是有两个方案：

1. 使用一张固定的手机截屏，将最新的一期的文字和积分抹去，通过爬虫获取到数据之后，对图片做一次处理；这样的话，感觉图片有点假，字体和布局都需要很麻烦去寻找测量，拒绝；

2. 把请求的H5界面保存下来，然后通过抓包的方式使用代理，或者自建后端，总之把数据填充进去，也就是一个偷天换日的方法，看起来挺傻X的，但是好用是好用；

### 静态文件

在抓包时，找到`http://websecond.lngqt.shechem.cn/index`对应的返回数据，并将其保存为`.html` 扩展名文件，且把内部应用的静态文件也一并保存，放入后端中；

+ chunk-vendors.js
+ integral.js，这个积分。。（除非我们忍不住）

使用`koa` 作为后端，配合插件`koa-static`加载静态文件：

```js
app.use(serve(__dirname + '/../static'));
```

### 请求头

请求头中的`User-Agent`一定要保持一致，否则会导致请求重定向；

```js
const headers = {
  "Accept": "application/json, text/plain, */*",
  "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6304051b)",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "http://websecond.lngqt.shechem.cn",
  "X-Requested-With": "com.tencent.mm",
  "Referer": "http://websecond.lngqt.shechem.cn/",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cookie": "BDed_HeaderKey=X2xQAy1bWnsNayB9YxxxxxxCF5%2FW3N%2FNBR5CWxxxxxxUFw%3D"
}
```

### 后端路由

对于实现观看大学习添加记录和拿到截图界面的数据，需要三个API接口，分别对应三个路由：

```js
router.post("/webapi/learn/learnlog", async (ctx) => {
  let res = await axios.post(url + '/webapi/learn/learnlog', {
    'page[page]': 1
  }, { headers })
  ctx.body = res.data
})
router.post("/user/user/find", async (ctx) => {
  let res = await axios.post(url + '/user/user/find', {
    "token": ""
  }, { headers })
  ctx.body = res.data
})
```

第一个为获取观看记录，其二是获取用户的信息，直接做一层获取转发即可；

```js
router.get("/webapi/learn/addlearnlog", async (ctx) => {
  let { data } = await axios.post(url + '/webapi/learn/getnowlearn', {
    "token": ""
  }, { headers })
  let now = data.data.id
  let res2 = await axios.post(url + '/webapi/learn/addlearnlog', {
    "token": "",
    "lid": now
  }, { headers })
  ctx.body = {
    result: 0,
    data: {
      id: now
    }
  }
})
```

第三个为最重要的添加观看记录的接口，需要获取到最新的待观看的大学习的 id ，然后将其作为参数请求添加记录的接口；

第四个接口是方便机器人调用的所做的，使用`puppeteer`库的无头浏览器加载静态的H5文件返回截图的 base64 结构：

```js
router.get("/webapi/learn/show", async (ctx) => {
  const { query } = ctx
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:3000/');
  page.setViewport({
    width: 375,
    height: 667,
    isMobile: true
  })

  setTimeout(async () => {
    await page.screenshot({ path: '../static/img/pic.png'});
  }, 2000)

  let data = fs.readFileSync('../static/img/pic.png');
  data = Buffer.from(data).toString('base64');
  ctx.body = {
    img: data
  }
})
```

## 安卓端获取图片

除了在服务器上部署，我还想在旧手机上跑起来，而无头浏览器方案折腾了半天也没搞定，于是乎转变思路，简单粗暴，直接截图；

### 服务端代码

```js
router.get("/webapi/learn/show", async (ctx) => {
  shelljs.exec(`termux-notification -i 7 -t '青年大学习' -c '最新一期' --button1 '按钮'`)
  shelljs.exec(`mv /sdcard/Pictures/pic.png /data/data/com.termux/files/home/big-study/static/img/pic.png`)

  let data = fs.readFileSync(__dirname + '/../static/img/pic.png');
  data = Buffer.from(data).toString('base64');
  ctx.body = {
    img: data,
    log: "通知已显示"
  }
})
```

这边利用 Termux 以及 Termux:API 调用 Android 的通知，以触发Tasker上对应的任务，任务完毕后会留下截图，再把截图移动到指定的位置；

### Tasker 配置

+ 配置文件中，对事件 ->通知进行监听，设置监听标题为上述代码中的青年大学习，并选择程序为`Termux:API` ；
+ 编辑任务，需要安装插件`Notification Listener`（可选），文字开头着对应Tasker内的操作译名：
  + 【插件】：在该插件中删除用于触发的通知，删除的依据可选标题或者应用名；
  + 【发送意图】：操作选择`android.intent.action.VIEW`，类别默认即可，`Mime`选择`text/plain`，数据填写后端返回的H5页面地址`http://127.0.0.1:3000`；
  + 【等待】：酌情延时 2 ~ 4 秒，选择操作 -> 等待；
  + 【截图】：设置对应的目录为`Pictures/pic.png`；
  + 【关闭应用】：关闭默认打开页面的浏览器；

在Tasker进行截图时，会弹出屏幕录制的权限确认框，可以使用操作【取消对话框】，或者使用 ADB 操作，永久授予录屏权限：

```bash
adb shell appops set net.dinglisch.android.taskerm PROJECT_MEDIA allow
```

> 上述提到的软件都可以在我的云盘进行下载，[Here](https://yun.mahoo12138.cn/🔧Apps)；

完整的代码可在我的代码仓库进行查看，[Here](https://github.com/Mahoo12138/dlu-big-stduy)；如果对上述蜜汁操作有更好的见地，欢迎留言评论！
