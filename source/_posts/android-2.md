---
title: Android学习之实现启动页面
date: 2019-08-13 19:48:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 学习笔记
tags:
- Android
---

## 实现一个启动页面

在res/drawable下，创建一个xml文件，即为启动页面的效果：

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/colorPrimary"/>

    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

这里关于layer-list的使用可以移步：

+ [ layer-list的基本使用介绍](https://blog.csdn.net/north1989/article/details/53485729/)

例子使用的启动页为两层，第一层为程序的主色调，第二层为程序的图标，并且位于中间位置；

## 绑定到活动

在values/style.xml内新建一个主题：

```xml
<resources>
        <!--设置启动页的主题，防止黑屏(闪黑)或者白屏(闪白)-->
    <style name="SplashTheme" parent="AppTheme">
        <!--去掉windowTitle-->
        <item name="windowNoTitle">true</item>
        <!--设置全屏状态-->
        <item name="android:windowFullscreen">true</item>
        <!--设置背景图片-->
        <item name="android:windowBackground">@drawable/splash</item>
        <!--设置内容覆盖-->
        <item name="android:windowContentOverlay">@null</item>
    </style>
    
<resources>

```

主题选择继承`Theme.AppCompat.Light.NoActionBar`，并且指定背景为刚才创建的界面；

新建一个SplashActivity活动，在AndroidManifest.xml内设置为启动活动，并为其设置上一步的主题：

```xml
<activity android:name=".SplashActivity"
            android:theme="@style/SplashTheme">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
```

## 正确的打开页面

编辑SplashActivity代码，设置启动逻辑：

```java
Intent intent = new Intent(getApplicationContext(),MainActivity.class);
startActivity(intent);
finish();
```

如果页面跳转过快，可以设置程序休眠：

```java
Thread mythread = new Thread(){
	@Override
    public void run() {
    	try {
        	sleep(1500);
            Intent intent = new Intent(getApplicationContext(),MainActivity.class);
            startActivity(intent);
            finish();
		}catch (Exception e) {
        	e.printStackTrace();
        }
    }
};
mythread.start();
```

到这里就大功告成了：
<iframe height=576 width=324 src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/Android/splash.gif">


