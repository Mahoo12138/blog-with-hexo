---
title: Android学习之MD设计模式
date: 2019-08-15 14:42:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 学习笔记
tags:
- Android
- Material Design
---

## 添加库依赖

```java
implementation 'com.android.support:design:28.0.0'
```

## Snackbar控件

提供一个可供响应的通知提醒

```java
Snackbar.make(view,"这是一个Snackbar",Snackbar.LENGTH_SHORT)
	.setAction("点击事件", new View.OnClickListener() {
		@Override
		public void onClick(View view) {
			Toast.makeText(MainActivity.this,"点击事件发生",Toast.LENGTH_SHORT).show();
		}
	})
    .addCallback(new Snackbar.Callback() {
		@Override
		public void onDismissed(Snackbar transientBottomBar, int event) {
			super.onDismissed(transientBottomBar, event);
            Toast.makeText(MainActivity.this,"onDismissed - 消失",Toast.LENGTH_SHORT).show();
		}
        @Override
       	public void onShown(Snackbar sb) {
       		super.onShown(sb);
       		Toast.makeText(MainActivity.this,"onShown - 出现",Toast.LENGTH_SHORT).show();
       	}
	})
	.show();
            
```

## TextInputLayout控件

作为editText的容器，当点击EditText时，hint字符会自动移到EditText的左上角。常用来做登录界面的帐号密码输入。

```xml
<com.google.android.material.textfield.TextInputLayout        
	android:layout_width="match_parent"
	android:layout_height="wrap_content"
    app:counterEnabled="true"	是否开启计数器                                                   >
    <EditText
    	android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="密码"
        android:drawableStart="@mipmap/ic_launcher"		显示一个提示图片
              />
</com.google.android.material.textfield.TextInputLayout>
```

## Tablayout控件

```xml
    <com.google.android.material.tabs.TabLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/colorPrimary"
        android:id="@+id/tab_layout">

    </com.google.android.material.tabs.TabLayout>
    
    <androidx.viewpager.widget.ViewPager
        android:background="#FFF"
        android:id="@+id/view_page"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">

    </androidx.viewpager.widget.ViewPager>
```

### 常见属性

```
app:tabIndicatorColor ：指示线的颜色
app:tabIndicatorHeight ：指示线的高度
app:tabSelectedTextColor ： tab选中时的字体颜色
app:tabMode="scrollable" ： 默认是fixed，固定的；scrollable：可滚动的
```

## CardView控件

实质为带有圆角背景和阴影的FrameLayout

### 常见属性

```
android：cardBackgroundColor ：设置背景
android：cardCornerRadius ：设置圆角
app：cardElevation ：设置阴影大小
app：cardMaxElevation ：设置阴影的最大高度
app：contentPadding ：内容距离边界的距离
app：contentPaddingXXX ：设置局部的内边距，替换Padding的，在CardView中设置Padding是不起作用的。
app：cardUseCompatPadding ：如果您需要将CardView与其他视图对齐，可能在21以下，可以将此标志设置为真，CardView将在21之后的平台上添加相同的填充值。
app：cardPreventCornerOverlap ：是否裁剪边界以防止重叠
```







