---
title: Android 学习之掉坑记录
date: 2019-07-25 12:48:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 学习笔记
tags:
- Android
---

## Android8.0及以上版本自定义广播无法接收问题

今天在学习广播过程中发现，自定义广播无效，由于使用的学习参考书是基于Android7.0的，所以，很自然的想到了可能由于版本问题，网上一查，果然。

**原因**：Android8在静态广播的使用上做了一些限制

> [广播限制](https://developer.android.google.cn/about/versions/oreo/background#broadcasts)：除了有限的例外情况，应用程序无法使用其清单注册隐式广播。他们仍然可以在运行时注册这些广播，并且他们可以使用清单注册专门针对其应用的显式广播。

[https://developer.android.google.cn/about/versions/oreo/background](https://developer.android.google.cn/about/versions/oreo/background)

**解决方法：**

+ 保留原来的静态广播，但是加入Component参数

  ```java
  Intent intent = new Intent("com.mahoo.broadcast.MY_BROADCAST #自定义广播");
  intent.setComponent(new ComponentName("com.mahoo.broadcasttest #包名","com.mahoo.broadcasttest.MyBroadcastReceiver #广播接收器地址"));
  sendBroadcast(intent,null);
  ```

+ 使用动态注册广播接收器代替静态注册广播接收器

  ```java
  # 暂时不会
  ```

## Android8.0及以上系统通知栏的适配

还是一样原因由于参考书较老旧，出现通知栏适配无效的问题，详细地说是方法已被弃用：

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/Android/notification.png)

从Android 8.0系统开始，Google引入了**通知渠道**这个概念。

> 通知渠道，顾名思义，就是每条通知都要属于一个对应的渠道。每个App都可以自由地创建当前App拥有哪些通知渠道，但是这些通知渠道的控制权都是掌握在用户手上的。用户可以自由地选择这些通知渠道的重要程度，是否响铃、是否振动、或者是否要关闭这个渠道的通知。

**解决方法：**

创建通知渠道，在构建通知对象的时候，多传入一个通知渠道ID

```java
NotificationCompat.Builder(Context context, String channelId)
```

例如：

```java
String channelId = "chat";
String channelName = "聊天消息";
int importance = NotificationManager.IMPORTANCE_HIGH;
NotificationChannel channel = new NotificationChannel(channelId, channelName,importance);

//向系统注册通知渠道，注册后不能改变重要性以及其他通知行为
NotificationManager notificationmanager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

//构建通知渠道
notificationManager.createNotificationChannel(channel);

Notification notification = new NotificationCompat.Builder(this, "chat")
                .setContentTitle("收到一条聊天消息")
                .setContentText("通知栏适配成功了")
                .setWhen(System.currentTimeMillis())
                .setSmallIcon(R.drawable.icon)
    			.setLargeIcon(BitmapFactory.decodeResource(getResources(),
                	R.drawable.icon))
                .setAutoCancel(true)	//设置点击取消通知
                .build();
manager.notify(1, notification);

```

**注：**例子参考于[Android通知栏微技巧，8.0系统中通知栏的适配](https://blog.csdn.net/guolin_blog/article/details/79854070)

## Android9.0无法加载http的url

因为从Android 9.0（API级别28）开始，默认情况下限制了明文流量的网络请求，对未加密流量不再信任，直接放弃请求。即http的url均无法在webview中加载，且报错为`net::ERR_CLEARTEXT_NOT_PERMITTED`。

**解决方法：**

+ ~~在`AndroidManifest.xml`中打开开关~~

  ```xml
  <manifest ...>
      <application
          ...
          android:usesCleartextTraffic="true"
          ...>
          ...
      </application>
  </manifest>
  ```

+ res 下新建 xml 目录，创建文件：`network_security_config.xml` ，内容如下：

  ```xml
  <?xml version="1.0" encoding="utf-8"?>
  <network-security-config>
      <base-config cleartextTrafficPermitted="true" />
  </network-security-config>
  ```

  在 AndroidManifest.xml 的 `application` 标签添加配置：

  ```xml
  <manifest ...>
      <application
          ...
          android:networkSecurityConfig="@xml/network_security_config"
          ...>
          ...
      </application>
  </manifest>
  ```


## 安卓8.0以上前台服务通知栏常驻

这里有个小坑，在9.0中前台服务必须授予FOREGROUND_SERVICE权限：

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
```

具体直接查看代码：[Android_Service_Demo](https://github.com/Mahoo12138/android_learn_demo/tree/master/ServiceTest)

## 在webview中唤醒QQ实现程序的反馈

重载` shouldOverrideUrlLoading `方法，因为网页一般调用QQ使用*http://wpa.qq.com/msgrd?v=3&uin=QQ号&site=qq&menu=yes*，通过抓包发现，实际还发送了一个这样的请求*mqqwpa://im/chat*，此时用一个intent调用QQ即可。

```java
webView.setWebViewClient(new WebViewClient() {
	@Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
    	if (request.getUrl().toString().startsWith("http") ||request.getUrl().toString().startsWith("https")) {
                    return super.shouldOverrideUrlLoading(view, request);
                }
                else {
                    Intent intent = new Intent(Intent.ACTION_VIEW,Uri.parse(request.getUrl().toString())));
                    startActivity(intent);
                    return true;
                }
            }
        });
        webView.loadUrl(url);
        finish();
	}
}
```

