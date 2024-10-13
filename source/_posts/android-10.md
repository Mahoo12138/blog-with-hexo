---
title: 安卓开发学习之底部导航栏实战
date: 2020-08-02 20:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 技术教程
tags:
- Android
---

## 创建主布局

在 activity 中绑定的布局中，设置如下布局：

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
        xmlns:app="http://schemas.android.com/apk/res-auto"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:id="@+id/mainLayout">

        <com.google.android.material.bottomnavigation.BottomNavigationView
            android:id="@+id/bottom_nav_view"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            android:layout_alignParentBottom="true"
            android:layout_marginStart="0dp"
            android:layout_marginEnd="0dp"
            android:background="?android:attr/windowBackground"
            app:menu="@menu/bottom_nav_menu" />
    </RelativeLayout>
```

## 设置底部导航栏

```xml
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android">

    <item
        android:id="@+id/navigation_home"
        android:icon="@drawable/ic_hot_24"
        android:title="热门" />

    <item
        android:id="@+id/navigation_show"
        android:icon="@drawable/ic_latest_24"
        android:title="最新" />

    <item
        android:id="@+id/navigation_notice"
        android:icon="@drawable/ic_tweet_24"
        android:title="大咖说" />

</menu>
```

## 配置 Navigation 导航

### 创建对应的三个 Fragment

| 0              | 1                 | 2                |
| -------------- | ----------------- | ---------------- |
| HotFragment.kt | LatestFragment.kt | TweetFragment.kt |

### 添加 NavHost

NavHost是一个空的容器，用来切换 destination。类似于用 framelayout 来切换 fragment 的东西。默认实现是**NavHostFragment**

+ `android:name="androidx.navigation.fragment.NavHostFragment"`和app:defaultNavHost="true"指定了，在按back键时会返回到NavHostFragment
  `app:navGraph="@navigation/nav_graph"`为这个fragment组件指定了navGraph文件



+ 

1. 在res目录下新建一个`navigation`文件夹，然后新建`mobile_navigation.xml`：

   ```xml
   
   ```

   

