---
title: 安卓开发学习之ResyclerView
date: 2020-05-01 13:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
categories: 
- 技术教程
tags:
- Android
---

## 添加依赖

除了引入`recyclerview`，还引入`cardview`，它将作为 recyclerview 的子布局

```
implementation "androidx.recyclerview:recyclerview:1.1.0"
implementation "androidx.cardview:cardview:1.0.0"
```

## 设计视图

在 **/res/layout** 中新建`recycler_item.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="4dp">

    <RelativeLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:padding="10dp">
        <ImageView
            android:layout_width="50dp"
            android:layout_height="50dp"
            android:src="@drawable/ic_android"
            android:layout_marginEnd="8dp"
            android:id="@+id/image_view"/>
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/app_name"
            android:layout_toEndOf="@id/image_view"
            android:textSize="18sp"
            android:textColor="#000"
            android:textStyle="bold"
            android:id="@+id/text_title_view"/>
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="@string/app_name"
            android:layout_toEndOf="@id/image_view"
            android:layout_below="@id/text_title_view"
            android:id="@+id/text_content_view"/>
    </RelativeLayout>

</androidx.cardview.widget.CardView>
```

在需要显示 **RecyclerView** 处，添加：

```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <androidx.recyclerview.widget.RecyclerView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:id="@+id/recycler_view"
        android:clipToPadding="false"
        android:padding="4dp"
        tools:listitem="@layout/recycler_item"/>

</RelativeLayout>
```

## 构造适配器

适配器类`RecyclerAdapter`继承于类型为`RecyclerAdapter.ViewHolder`的模板类`RecyclerView.Adapter`，`ViewHolder`将子项视图解耦，以便绑定数据，适配器需要传入参数`RecyclerList`，也就是每个子项的数据来源；该子类中需要重写父类的三个方法：

+ onCreateViewHolder()：引入子项视图，

+  getItemCount()：返回子项的数量
+ onBindViewHolder()：将数据绑定到子项视图

```kotlin
class RecyclerAdapter(private val RecyclerList:List<RecyclerItem>):RecyclerView.Adapter<RecyclerAdapter.ViewHolder>(){
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.recycler_item,parent,false)
        return ViewHolder(itemView)
    }

    override fun getItemCount() = RecyclerList.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val currentItem = RecyclerList[position]
        holder.imageView.setImageResource(currentItem.imageRes)
        holder.textTitleView.text = currentItem.textTitle
        holder.textContentView.text = currentItem.textContent
    }

    class ViewHolder(itemView: View):RecyclerView.ViewHolder(itemView){
        val imageView:ImageView = itemView.image_view
        val textTitleView:TextView = itemView.text_title_view
        val textContentView:TextView = itemView.text_content_view
    }

```

## 配置RecyclerView

在对应的的 **Activity** 或 **Fragment** 中，加入如下代码：

```kotlin
val itemList = generateDummyList(50)
Log.d("itemlist",itemList.toString())
recycler_view.adapter = RecyclerAdapter(itemList)
recycler_view.layoutManager = LinearLayoutManager(this)
recycler_view.setHasFixedSize(true)


// 生成数据方法
 private fun generateDummyList(size:Int):List<RecyclerItem>{
        val list = ArrayList<RecyclerItem>()
        for (i in 0 until size){
            val drawable = when(i%3) {
                    1 -> R.drawable.ic_android
                    2 -> R.drawable.ic_hand
                    else -> R.drawable.ic_send
            }
            val item = RecyclerItem(drawable,"Item$i","This is Icon named Item$i")
            list += item
        }
        return list
    }
```

## 点击事件

在适配器类`RecyclerAdapter`中添加如下代码：

```kotlin
private lateinit var clickListener:OnItemClickListener

override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    val currentItem = RecyclerList[position]
    holder.imageView.setImageResource(currentItem.imageRes)
    holder.textTitleView.text = currentItem.textTitle
    holder.textContentView.text = currentItem.textContent
	
    // 点击事件
    holder.itemView.setOnClickListener{
        this.clickListener.onItemClick(holder.itemView,position)
    }
	// 长按事件
    holder.itemView.setOnLongClickListener{
        this.clickListener.onItemLongClick(holder.itemView,position)
        true
    }
}

// 定义接口
interface OnItemClickListener{
    fun onItemClick(view: View, position: Int)
    fun onItemLongClick(view: View, position: Int)
}

// 接口 set 方法
fun setClickListener(listener: OnItemClickListener){
    this.clickListener = listener
}
```



