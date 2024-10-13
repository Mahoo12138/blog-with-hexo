---
title: 安卓开发学习之DrawerLayout
date: 2020-04-29 10:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 技术教程
tags:
- Android
---

## 为什么要使用导航抽屉？

Android 导航抽屉是一个滑动菜单，用于显示应用程序中的重要链接。 导航抽屉可轻松在这些链接之间来回导航。 默认情况下它是不可见的，需要通过向左滑动或在 ActionBar 中单击其图标来打开它。 其易用性如下：

+ 从活动左边缘滑动手指时，用户可以查看导航抽屉；
+ 如果应用具有不同的界面（超过六个），则建议使用导航抽屉；
+ 它使应用程序更具交互性和简洁性。

## 导航抽屉的组件构成

+ DrawerLayout 组件的实例，抽屉的父布局容器
+ 作为 DrawerLayout 的子级嵌入的 NavigationView 组件的实例，也就是抽屉主体
+ 菜单资源文件，其中包含要在导航抽屉中显示结构和内容；
+ 一个可选的布局资源文件，其中包含要显示在导航抽屉的标题部分中的内容；
+ 分配给 NavigationView 的侦听器，用于检测用户何时选择了一项；
+ 一个 ActionBarDrawerToggle 实例，一个按钮，用于将导航抽屉连接和同步到应用栏，通过点击打开导航抽屉；

## 导航抽屉的实现

1. 在 **app** 的 **build.gradle** 文件中添加依赖： `implementation 'com.google.android.material:material:1.0.0'`，点击 **Sync Now** 等待同步完成；

2. 在 **layout** 中创建两个布局文件：

   - **content_main.xml**，主布局文件
   - **nav_header.xml**，抽屉顶部布局

   在 **res** 新建文件夹 **menu**，并创建 **nav_menu.xml** 文件，构建抽屉菜单；

   之后在 **styles.xml** 文件中添加主题：

   ```xml
   <style name="AppTheme.NoActionBar">
       <item name="windowActionBar">false</item>
       <item name="windowNoTitle">true</item>
       <item name="android:statusBarColor">@android:color/transparent</item>
   </style>
   ```

   在**AndroidManifest.xml** 中，对 **MainActivity** 应用该主题：

   ```xml
   <activity android:name=".MainActivity"
             android:theme="@style/AppTheme.NoActionBar">
       <intent-filter>
           <action android:name="android.intent.action.MAIN"/>
           <category android:name="android.intent.category.LAUNCHER"/>
       </intent-filter>
   </activity>
   ```

3. 重写 **MainActivity** 对应的布局文件 **activity_main.xml**，引入之前创建的 `content_main.xml`

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <androidx.drawerlayout.widget.DrawerLayout
           xmlns:android="http://schemas.android.com/apk/res/android"
           xmlns:app="http://schemas.android.com/apk/res-auto"
           xmlns:tools="http://schemas.android.com/tools"
           android:id="@+id/drawer_layout"
           android:layout_width="match_parent"
           android:layout_height="match_parent"
           android:fitsSystemWindows="true"
           tools:openDrawer="start">
   
       <include
               layout="@layout/content_main"
               android:layout_width="match_parent"
               android:layout_height="match_parent"/>
   
       <com.google.android.material.navigation.NavigationView
               android:id="@+id/nav_view"
               android:layout_width="wrap_content"
               android:layout_height="match_parent"
               android:layout_gravity="start"
               android:fitsSystemWindows="true"
               app:headerLayout="@layout/nav_header"
               app:menu="@menu/nav_menu"/>
   
   </androidx.drawerlayout.widget.DrawerLayout>
   ```

4. 编辑抽屉顶部  **nav_header.xml** 布局文件，布局仅是 app 的图标文件以及两行文字：

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <LinearLayout
           xmlns:android="http://schemas.android.com/apk/res/android"
           xmlns:app="http://schemas.android.com/apk/res-auto"
           android:layout_width="match_parent"
           android:layout_height="200dp"
           android:background="#4CAF50"
           android:orientation="vertical"
           android:gravity="bottom"
           android:paddingLeft="15dp"
           android:paddingBottom="15dp">
   
       <ImageView
               android:layout_width="wrap_content"
               android:layout_height="wrap_content"
               app:srcCompat="@mipmap/ic_launcher"
               android:id="@+id/imageView"
               android:layout_marginBottom="15dp"/>
   
       <TextView
               android:layout_width="match_parent"
               android:layout_height="wrap_content"
               android:text="Title"
               android:textColor="#FFFFFF"
               android:textStyle="bold"/>
   
       <TextView
               android:layout_width="wrap_content"
               android:layout_height="wrap_content"
               android:text="This is our navigation drawer"
               android:textColor="#FFFFFF"/>
   
   </LinearLayout>
   ```

5. 编辑抽屉菜单布局文件 **nav_menu.xml**，值得注意的是，当在使用 **icon** 时，可以利用 Android Studio 生成，在项目导航栏右击，选择`New => Vector Asset`即可；

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <menu xmlns:android="http://schemas.android.com/apk/res/android">
   
       <group>
           <item
                 android:id="@+id/nav_profile"
                 android:icon="@drawable/ic_profile"
                 android:title="Profile"/>
           <item
                 android:id="@+id/nav_messages"
                 android:icon="@drawable/ic_messages"
                 android:title="Messages"/>
           <item
                 android:id="@+id/nav_friends"
                 android:icon="@drawable/ic_friends"
                 android:title="Friends"/>
       </group>
   
       <item android:title="Account Settings">
           <menu>
               <item
                     android:id="@+id/nav_update"
                     android:icon="@drawable/ic_update"
                     android:title="Update Profile"/>
               <item
                     android:id="@+id/nav_logout"
                     android:icon="@drawable/ic_signout"
                     android:title="Sign Out"/>
           </menu>
       </item>
   </menu>
   ```
   
6. 编辑 **content_main.xml** 主布局文件：

   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
                 xmlns:app="http://schemas.android.com/apk/res-auto"
                 android:orientation="vertical"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent">
   
       <com.google.android.material.appbar.AppBarLayout
                     android:layout_height="wrap_content"
                     android:layout_width="match_parent"                                                         android:theme="@style/ThemeOverlay.AppCompat.Dark.ActionBar">
           <androidx.appcompat.widget.Toolbar
                         android:id="@+id/toolbar"
                         android:layout_width="match_parent"
                         android:layout_height="?attr/actionBarSize"
                         android:background="?attr/colorPrimary"
                         app:popupTheme="@style/ThemeOverlay.AppCompat.Light">
               <LinearLayout
                             android:layout_width="match_parent"
                             android:layout_height="match_parent"
                             android:orientation="horizontal"
                             android:gravity="center_vertical">
                   <TextView
                             android:layout_width="wrap_content"
                             android:layout_height="wrap_content"
                             android:text="Navigation Drawer"
                             android:textColor="#FFFFFF"
                             style="@style/TextAppearance.AppCompat.Widget.ActionBar.Title"/>
               </LinearLayout>
           </androidx.appcompat.widget.Toolbar>
   
       </com.google.android.material.appbar.AppBarLayout>
   
       <LinearLayout
                     android:layout_width="match_parent"
                     android:layout_height="match_parent"
                     android:orientation="vertical">
           <TextView
                     android:layout_width="wrap_content"
                     android:layout_height="wrap_content"
                     android:text="This is my content area."/>
       </LinearLayout>
   
   </LinearLayout>
   ```
   
7. 最后编辑**MainActivity.kt** 文件，将视图绑定到业务逻辑：

   ```kotlin
   class MainActivity : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {
   	// 声明控件并在 onCreate() 中初始化
       lateinit var toolbar: Toolbar
       lateinit var drawerLayout: DrawerLayout
       lateinit var navView: NavigationView
       override fun onCreate(savedInstanceState: Bundle?) {
           super.onCreate(savedInstanceState)
           setContentView(R.layout.activity_main)
   
           toolbar = findViewById(R.id.toolbar)
           setSupportActionBar(toolbar)
   
           drawerLayout = findViewById(R.id.drawer_layout)
           navView = findViewById(R.id.nav_view)
   		
           // 创建 ActionBarDrawerToggle 对象
           val toggle = ActionBarDrawerToggle(
               this, drawerLayout, toolbar, 0, 0
           )
           // 建立 DrawerLayout 和 ActionBarDrawerToggle 的关联
           drawerLayout.addDrawerListener(toggle)
           toggle.syncState()
           navView.setNavigationItemSelectedListener(this)
       }
   	
       // 重载接口方法
       override fun onNavigationItemSelected(item: MenuItem): Boolean {
           when (item.itemId) {
               R.id.nav_profile -> {
                   Toast.makeText(this, "Profile clicked", Toast.LENGTH_SHORT).show()
               }
               R.id.nav_messages -> {
                   Toast.makeText(this, "Messages clicked", Toast.LENGTH_SHORT).show()
               }
               R.id.nav_friends -> {
                   Toast.makeText(this, "Friends clicked", Toast.LENGTH_SHORT).show()
               }
               R.id.nav_update -> {
                   Toast.makeText(this, "Update clicked", Toast.LENGTH_SHORT).show()
               }
               R.id.nav_logout -> {
                   Toast.makeText(this, "Sign out clicked", Toast.LENGTH_SHORT).show()
               }
           }
           drawerLayout.closeDrawer(GravityCompat.START)
           return true
       }
   }
   ```

   + **ActionBarDrawerToggle**：其构造函数为：

     ```kotlin
     ActionBarDrawerToggle(
         activity: Activity!, 	
         drawerLayout: DrawerLayout!, 
         toolbar: Toolbar!, 	// 没有 Toolbar 时省略
         @StringRes openDrawerContentDescRes: Int,   // 这两个参数与 Accessibility 服务有关，便于视力不好的用户使用
         @StringRes closeDrawerContentDescRes: Int)	// 感兴趣可以谷歌
     ```

   + [**syncState()**]()：将抽屉指示器/功能的状态与链接的DrawerLayout同步

   + [closeDrawer()](https://developer.android.google.cn/reference/kotlin/androidx/drawerlayout/widget/DrawerLayout)：用**Gravity.LEFT**键关闭左抽屉，或用**Gravity.RIGHT**键关闭右抽屉。 也可以使用**GravityCompat.START**或**GravityCompat.END**。
