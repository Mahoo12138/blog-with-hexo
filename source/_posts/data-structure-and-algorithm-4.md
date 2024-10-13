---
title: 数据结构与算法学习之栈
date: 2019-10-24 21:27:24
mathjax: true
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/algorithm/20210418160102.png
tags: 
- 数据结构与算法
categories: 
- 学习笔记
---

栈是一种线性表，栈与线性表的最大区别是数据的存取的操作，其插入和删除操作只允许在线性表的一端进行。

一般而言，把允许操作的一端称为**栈顶(Top)**，不可操作的一端称为**栈底(Bottom)**，同时把插入元素的操作称为**入栈(Push)**，删除元素的操作称为**出栈(Pop)**。若栈中没有任何元素，则称为**空栈**。

栈是**后进先出**(Last In First Out,LIFO)或**先进后出**(First In Last Out FILO)的线性表。

## 栈的设计

栈的基本操作创建栈，判空，入栈，出栈，获取栈顶元素等：

```java
int size();				//元素的数量
boolean isEmpty();		//是否为空
void push(E element);	//入栈
E pop();				//出栈
E top();				//获取栈顶元素
void clear();			//清空
```

由于栈是一种特殊的线性表，其内部实现完全可以直接利用以前学过的数据结构，但注意栈不支持对指定位置进行删除，插入，所以栈类不能直接继承自链表或动态数组，这样会将父类的方法都继承过来，这里可以使用**组合**：

```java
public class Stack<E> {
    List<E> list = new ArrayList<>();

    int size() {
        return list.size();
    }; // 元素的数量

    boolean isEmpty() {
        return list.isEmpty();
    }; // 是否为空

    void push(E element) {
        list.add(element);
    }; // 入栈

    E pop() {
        return list.remove(list.size() - 1);
    }; // 出栈

    E top() {
        return list.get(list.size() - 1);
    }; // 获取栈顶元素

    void clear() {
        list.clear();
    }; // 清空
}
```

## 栈的应用

栈是一种很重要的数据结构，在计算机中有着很广泛的应用，如下一些操作都应用到了栈。

- 符号匹配
- 中缀表达式转换为后缀表达式
- 计算后缀表达式
- 实现函数的嵌套调用
- HTML 和 XML 文件中的标签匹配
- 网页浏览器中已访问页面的历史记录

