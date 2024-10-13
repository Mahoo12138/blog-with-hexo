---
title: 数据结构与算法学习之队列
date: 2019-10-24 21:27:24
mathjax: true
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/algorithm/20210418160102.png
tags: 
- 数据结构与算法
categories: 
- 学习笔记
---

队列，和栈一样，也是一种对数据的"存"和"取"有严格要求的线性存储结构。

与栈不同之处在于，队列只能在头尾两端进行操作：

+ 队尾（rear）：只能从队尾添加元素，一般叫做 **enQueue**， 入队；
+ 队头（front）：只能从队头移除元素，一般叫做 **deQueue**， 出队 ；

队列中数据的进出要遵循 "**先进先出**" 的原则，即最先进队列的数据元素，同样要最先出队列。

## 队列的设计

队列存储结构的实现有以下两种方式：顺序队列和链队列；以下是接口的设计：

```java
int size(); 				// 元素的数量
boolean isEmpty(); 			// 是否为空
void clear(); 				// 清空
void enQueue(E element); 	// 入队
E deQueue(); 				// 出队
E front(); 					// 获取队列的头元素
```

## 双向链表实现队列

队列的内部实现可直接利用已学的双向链表，因为队列主要是往**头尾操作元素**：

```java
package com.mahoo;

import com.mahoo.list.LinkedList;
import com.mahoo.list.List;

public class Queue<E> {
	private List<E> list = new LinkedList<>();

	int size() {
		return list.size();
	}; // 元素的数量

	boolean isEmpty() {
		return list.isEmpty();
	}; // 是否为空

	void clear() {
		list.clear();
	}; // 清空

	void enQueue(E element) {
		list.add(element);
	}; // 入队

	E deQueue() {
		return list.remove(0);
	}; // 出队

	E front() {
		return list.get(0);
	}; // 获取队列的头元素
}
```

## 双端队列

双端队列（Deque）：在队头和队尾都可以进行插入数据和删除数据操作，**deque** 是 *double ended queue* 的简称；  

接口的设计顺势有些差别：

```java
void enQueueRear(E element); 	// 从队尾入队
E deQueueFront(); 				// 从队头出队
void enQueueFront(E element); 	// 从队头入队
E deQueueRear(); 				// 从队尾出队
E rear(); 						// 获取队列的尾元素
```

### 实现

```java
public class Deque<E> {
	private List<E> list = new LinkedList<>();
    
    // ...

	void enQueueRear(E element) {
		list.add(element);
	}; // 从队尾入队

	E deQueueFront() {
		return list.remove(0);
	}; // 从队头出队

	void enQueueFront(E element) {
		list.add(0, element);
	}; // 从队头入队

	E deQueueRear() {
		return list.remove(size() - 1);
	}; // 从队尾出队

	E rear() {
		return list.get(size() - 1);
	}; // 获取队列的尾元素

	E front() {
		return list.get(0);
	}; // 获取队列的头元素
}
```

为了看得更加直观，可在进行测试时重写队列的`toString()`，并在其中调用双向链表的该方法：

```java
@Override
public String toString() {
    return list.toString();
}
```

## 循环队列

循环队列是基于数组实现的队列，是将队列前后连成一个圆圈，以循环的方式去存取元素，能更有效率的利用数组空间，且不需要移动数据。

循环队列，*front*变量指向队头，最初阶段，从对头入队时，直接顺序对数组赋值；

出队操作时，则将 *front*向后移动，此时再对队列做入队操作，若数组的队尾处容量已满，而对头前还有出队剩余的位置，则循环入队到队头前；

循环操作需要对数组索引，进行取模操作，稍后会在代码中演示；当数组容量完全不够时，可对数组进行动态扩容；

### 循环队列实现

循环队列我们设计默认大小为 10，

```java
public class CircleQueue<E> {
    private int size;
    private int front;
    private E[] elements;

    private final static int DEFAULT_CAPACITY = 10;

    public CircleQueue() {
        front = 0;
        size = 0;
        elements = (E[]) new Object[DEFAULT_CAPACITY];
    }
}
```

### 出队入队

出队入队由于涉及到数组的边际的问题，需要对索引做一个取模操作，以此映射到新的索引，如：

```java
newIndex = oldIndex % elements.length;
```

但在编码中，尽量避免使用乘`*`、 除`/`、 模`%`、 浮点数运算，相对加减法，效率更低下；

在队列这样的一个需求下，我们完全可以构建一个基于*front*的索引映射函数，巧妙地解决这个问题：

```java
private int index(int index) {
    index += front;
    if (index < elements.length) {
        return index;
    } else {
        return index - elements.length;
    }
}
```

依据`index()`函数，都可得到相对*front*的映射索引值，由此可得到出队和入队的代码：

```java
public void enQueue(E element) {
    ensureCapacity(size + 1);
    elements[index(size)] = element;	// front 偏移 size 位得到队尾
    size++;
}; // 入队

public E deQueue() {
    E top = elements[front];
    elements[front] = null;
    front = index(1);		// front 移动 1 位
    size--;
    return top;
}; // 出队
```

### 队列清空

```java
public void clear() {
    for (int i = 0; i < size; i++) {
        elements[index(i)] = null;
    }
    front = 0;
    size = 0;
}; // 清空
```

### 动态扩容

动态扩容与之前的动态数组的扩容类似的，唯一的不同是扩容后，元素的转移是，需要从*front*开始，所以需要我们的索引映射函数，且扩容后，*front*重新指向索引为 0 的位置：

```java
private void ensureCapacity(int capacity) {
    if (capacity <= elements.length)
        return;

    int newCapacity = capacity + (capacity >> 1);

    @SuppressWarnings("unchecked")
    E[] newElements = (E[]) new Object[newCapacity];
    
    for (int i = 0; i < size; i++) {
        newElements[i] = elements[index(i)];
    }
    front = 0;
    elements = newElements;
}
```

## 循环双端队列

循环双端队列顾名思义则是在上述循环队列的基础增加了双端的操作，能在两端添加、删除；

所以，代码是明显可以和循环队列复用的，只需要编写**对头入队**，**队尾出队**即可。

### 队头入队

对头入队时，其实是要获取到相对于*front*的前一个索引，直接取`index(-1);`即可；但是特殊情况当`front == 0`时，原来的`index()`函数时无法达到效果的，所以还要重新优化：

对与循环双端队列，当*front*是数组首元素时，从队头入队，依据循环是对数组另一端的元素赋值，只需要`front - 1 + 数组长度`，如：**0 (front) - 1 + 7 (length) = 6**，所以：

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/study/algorithm/20210523175916.png" style="zoom:80%;" />

```java
private int index(int index) {
    index += front;
    if (index < 0) {
        return index + elements.length;
    }
    if (index < elements.length) {
        return index;
    } else {
        return index - elements.length;
    }
}
```

因此，从队头入队的情形，即往*front*偏移一个索引的位置添加元素：

```java
public void enQueueFront(E element) {
    ensureCapacity(size + 1);
	front = index(-1);
	elements[front] = element;
	size++;
}; // 从队头入队
```

### 队尾出队

根据`index()`的索引映射，队尾出队也是得心应手：

```java
public E deQueueRear() {
    E top = elements[index(size - 1)]; // 尾部元素映射
    elements[index(size - 1)] = null;
    size--;
    return top;
}; // 从队尾出队
```



