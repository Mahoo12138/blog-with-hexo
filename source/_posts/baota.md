---
title: Linux 宝塔面板魔改记录
date: 2022-03-16 19:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/phone.png
tags: 
- 宝塔
- Linux
categories:
- 技术教程
---

## 去除版本更新

服务器安装宝塔后，好几次更新版本，我觉得软件业务稳定后的更新都是不重要的了，大多都是商业性的了，如下小节，直接关闭更新：

+ 定位到目录`/www/server/panel/class`，打开代码文件`ajax.py`；
+ **CTRL + F** 搜索函数`UpdatePanel`，注释函数内的操作即可；
+ 另外，上级目录的`task.py`中的函数中的`update_panel`也可注释；
+ 既然如此，那么也可注释`tools.py`下对于命令行输入选项`u_input == 16`的修复代码；

这样修改后，每次进入宝塔控制台都会报错，也要把`index.js`检查更新的代码注释：

```js
// setTimeout(function () {
//   bt.system.check_update(function (rdata) {
//     index.consultancy_services(rdata.msg.adviser);
//     if (rdata.status !== false) {
//       $('#toUpdate a').html('更新<i style="display: inline-block; color: red; font-size: 40px;position: absolute;top: -35px; font-style: normal; right: -8px;">.</i>');
//       $('#toUpdate a').css("position", "relative");

//     }
//     if (rdata.msg.is_beta === 1) {
//       $('#btversion').prepend('<span style="margin-right:5px;">Beta</span>');
//       $('#btversion').append('<a class="btlink" href="https://www.bt.cn/bbs/forum-39-1.html" target="_blank">  [找Bug奖宝塔币]</a>');
//     }

//   }, false)
// }, 700)
```

## 去除首页推广

最新的宝塔版本中，软件首页**软件推荐**很不清爽，于是想去除掉，直接还是老办法，注释代码：

+ 定位到`/www/server/panel/class/ajax.py`；
+ **CTRL + F** 搜索函数`__get_home_list`，注释函数体；

横幅广告推广，定位 `/www/server/panel/BTPanel/static/js/index.js`，搜索关键字 `recommend_paid_version`，将 `try...catch`内部代码删除；

其次还有一个**邀请推荐**，定位到`/www/server/panel/BTPanel/templates/default`下的`index.html`，删除以下代码：

```html
{% if data['pd'].find('免费版') != -1 %}
<span id="bt-fuli" class="bt-dashi">
    <a class="btlink ml5" href="https://www.bt.cn/invite" target="_blank">邀请奖励</a>
</span>
{% endif %}
```

## 主面板添加电池信息

旧手机作为服务器，我觉得添加一个电池信息很有必要，可以查看当前电量，设计电量，实际电量，是否正在充电等，首先需要定位首页信息的获取方法，大抵是在`/www/server/panel/class`的`system.py`内；

添加一个获取电池信息的方法，简单直接地获取:smile::

```python
def GetPowerInfo(self,get=None):
    powerInfo = {}
    capacity = public.ExecShell('cat /sys/class/power_supply/battery/capacity')[0].strip()
    charge = public.ExecShell('cat /sys/class/power_supply/battery/status')[0].strip()
    current = public.ExecShell('cat /sys/class/power_supply/battery/current_now')[0].strip()
    voltage = public.ExecShell('cat /sys/class/power_supply/battery/voltage_now')[0].strip()
    charge_full = public.ExecShell('cat /sys/class/power_supply/battery/charge_full')[0].strip()
    powerInfo['voltage'] = round(int(voltage) / 1000000, 2)
    powerInfo['current'] = round(int(current) / 1000)
    powerInfo['capacity'] = int(capacity)
    powerInfo['full'] = int(charge_full) / 1000
    if(charge == "Discharging"):
        powerInfo['status'] = False
        else:
            powerInfo['status'] = True
            return powerInfo

```

之后在主页面一直调用的函数内`GetNetWork`添加数据：

```python
networkInfo['power'] = self.GetPowerInfo()
```

接着就是前端页面，其实我觉得这个电池信息一直和宝塔原来地几个检测表不合式，因为电池容量按理来说是越低越糟糕会变成颜色会变红，而原有地CPU、内存、网络都是越多才显红，哎，别管那么多，能看着就行了；

依照其他的图表，添加一个电池电量的，id 设为 powChart：

```html
<li class="rank col-xs-6 col-sm-3 col-md-3 col-lg-2 mtb20 circle-box text-center">
    <div class="titles">电池电量</div>
    <div id="powChart" class="chart-li">
        <div class="outerCircle"><div class="innerCircle">0%</div></div>
    </div>
    <div id="pow" class="info-status">获取中...</div>
</li>
```

修改的地方太多，照着其他几个表来就行了，我给出我修改的几个重点：

```js
// init_chart_view 函数 
this.chart_view['pow'] = echarts.init(document.querySelector("#powChart"))

// set_chart_data 函数
this.chart_active("pow")
// chart_active 函数
case 'pow':
val = ((this.chart_result.power.full * this.chart_result.power.capacity) / 100).toFixed(0) + " / " + this.chart_result.power.full + "(mAH)"
break;
// reander_system_info 函数
var powCount = res.power.capacity
var powInfo = _this.chart_color_active(powCount);

// get_init 函数
$('#powChart').hover(function () {
    var power = rdata.power, texts = '';
    texts += "<strong>状态</strong></br>正在" + (power.status ? '充电' : "放电")
    texts += "</br><strong>容量信息</strong></br>"
    texts += "设计电量：" + power.full + " mAH</br>"
    texts += "当前电量：" + power.current + " mAH</br>"
    texts += "当前电流：" + (power.status ? '' : '-') + power.current + " mA</br>"
    texts += "当前电压：" + power.voltage + " V</br>"

    layer.tips(texts, this, { time: 0, tips: [1, '#999'] });
}, function () {
    layer.closeAll('tips');
})

// 电池数据专用颜色函数
power_color_active: function (number) {
    var activeInfo = {};
    if (number >= 85) {
        activeInfo = JSON.parse(JSON.stringify(this.load_config[1]));
    } else if (number <= 30) {
        activeInfo = JSON.parse(JSON.stringify(this.load_config[0]));
    } else {
        activeInfo = JSON.parse(JSON.stringify(this.load_config[2]));
    }
    activeInfo.val = number;
    return activeInfo;
}
```



## 宝塔挂载 SD 卡

本来这个内容应该是 Linux Deploy 的内容，也就是上一篇博客的相关，但是想想还是放在这里来吧；

由于旧手机是 32G 的存储空间，实际容量也就 20 几个 G 部署了几个项目以后，存储空间竟然快见底了，于是翻箱倒柜找出一张大容量 SD 卡出来，插入了旧手机，旧手机就是旧手机，还能如此先进地支持扩展存储；

首先，需要对 SD 卡进行格式化，选择 `ext4`，之后打开 shell，查看 SD 卡，容量大致对得上那个就是我们的 SD 卡了：

```bash
$ lsblk
```

我这里的是`mmcblk1`，对于的路径也就是`/dev/block/mmcblk1`，之后我们打开 Linux Deploy，进去到【挂载安卓资源】，新增一个挂载点，将`/dev/block/mmcblk1`挂载到容器内任意一个路径下，我选择的是根目录的`/sdcard`，到这重新配置一下 Linux Deploy，重启就OK了。

当然，更简单的方法是，先把 SD 卡挂载到安卓这边，然后通过安卓系统中的路径，在 Linux Deploy 中进行挂载，但是，我通常会关闭安卓系统。

## 常用命令

+ 关闭安全入口：`rm -f /www/server/panel/data/admin_path.pl`

## 其他问题

宝塔内安装 nginx 时报错，日志提示缺少依赖：

```bash
$ apt-get install libxslt-dev libxml2-dev
```

命令行使用宝塔指令无效，宝塔假死：

```bash
mv /etc/init.d/bt   /tmp/bt_back
cp /www/server/panel/init.sh  /etc/init.d/bt && chmod +x  /etc/init.d/bt
/etc/init.d/bt  restart
```





