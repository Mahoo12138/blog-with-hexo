---
title: 数据结构与算法学习之动态数组
date: 2019-10-16 21:27:24
mathjax: true
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160102.png
tags: 
- 数据结构与算法
categories: 
- 学习笔记
---

## 什么是数据结构

数据结构是计算机存储、组织数据的方式，主要有以下几种：

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160037.png" style="zoom:80%;" />

线性结构：主要有数组链表，栈，队列和哈希表

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160059.png" alt="" style="zoom:80%;" />

树形结构：主要有二叉树，红黑树，B树，堆，Trie，哈夫曼树，并查集等

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160102.png" alt="" style="zoom: 80%;" />

图形结构：邻接矩阵，邻接表

在实际开发应用中，需要根据使用场景来选择最合适的数据结构。

## 线性表

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160106.png)

对于线性表，我们需要清楚一些概念：

+ a~1~ 是**首节点**（首元素）， a~n~ 是**尾结点**（尾元素）
+ a~1~ 是 a~2~ 的**前驱**， a~2~ 是 a~1~ 的**后继**

常见的线性表有：数组、链表、栈、队列、哈希表（散列表）

## 数组

数组是一种顺序存储的线性表，所有元素的**内存地址是连续的**。

```java
int[] array = new int[]{11,22,33};
```

<img src="https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160110.png" style="zoom:67%;" />

+ 在很多编程语言中，数组都有个致命的缺点——**无法动态修改容量**；
+ 实际开发中，我们更希望数组的容量是可以动态改变的；

## 动态数组设计

```java
int size(); 					// 元素的数量
boolean isEmpty(); 				// 是否为空
boolean contains(E element); 	// 是否包含某个元素
void add(E element); 			// 添加元素到最后面
E get(int index); 				// 返回index位置对应的元素
E set(int index, E element); 	// 设置index位置的元素
void add(int index, E element); // 往index位置添加元素
E remove(int index); 			// 删除index位置对应的元素
int indexOf(E element); 		// 查看元素的位置
void clear(); 					// 清除所有元素
```

熟悉这类编程语言的都了解，上述接口代码中的 `E`是为了支持泛型，当然代码的编写是循序渐进的，我们先让动态数组支持整型。

在设计的动态数组时，有两个成员变量，一是数组的容量 `size`，而是存储数据的数组 `elements`：

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160116.png)

```java
public class ArrayList {
	private int size;
	private int[] elements;
	// 默认容量为 10
	private final static int DEFAULT_CAPACITY = 10;

	public ArrayList(int capacity) {
        // 如果小于默认容量，都为默认容量
		if (capacity <= DEFAULT_CAPACITY) {
			elements = new int[DEFAULT_CAPACITY];
		} else {
			elements = new int[capacity];
		}
	}
	public ArrayList() {
		elements = new int[DEFAULT_CAPACITY];
        // 或者写成这样，调用上面重载的构造函数
		// this(DEFAULT_CAPACITY);
	}
}
```

其次，可以先把几个简单的接口实现：

```java
public int size() {
    return size;
}

public boolean isEmpty() {
    return size == 0;
}

public int indexOf(int element) {
	for (int i = 0; i < size; i++) {
		if (elements[i] == element) return i;
	}
    return -1;
}

public boolean contains(int element) {
    return indexOf(element) != -1;
}

public int get(int index) {
    if (index < 0 || index >= size) {
        throw new ArrayIndexOutOfBoundsException(index: " + index + ",and size: " + size);
    } else {
        return elements[index];
    }
}
public int set(int index, int element) {
	if (index < 0 || index > size) {
		throw new ArrayIndexOutOfBoundsException("index: " + index + ",and size: " + size);
	} else {
        int old = elements[index];
        elements[index] = element;
        return old;
    }
}
public void clear() {
    // 清除数组时，只需将容量设置为 0 ，那么外层的操作都会被拦截
	size = 0;
}                                                                       
```

代码中的 -1 常见的作法也是像默认容量一样的处理：

```java
private final static int ELEMENT_NOT_FOUND = -1;
```

## 末尾添加元素

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160120.png)

当添加元素的时候，通过上图，我们很容易从发现每添加一个元素，都是在 `size `的位置，于是代码：

```java
public void add(int element) {
    // 若容量不够，需要扩容
    elements[size] = element;
    size++;
}
```

这样的代码，我们也就面临了一个问题，若添加的元素超过初始化的容量时，这就需要扩容了。

## 打印数组

我们在为动态数组添加元素后，需要验证我们写的代码是否正确，可以重写 `ArrayList ` 的 `toString() ` 方法，建议使用`StringBuilder`进行字符串拼接，以此达到自定义打印内容：

```java
@Override
public String toString() {
    StringBuilder sBuilder = new StringBuilder();
    sBuilder.append("size=" + size + ", [");
    for (int i = 0; i < size; i++) {
        if (i != 0) {
            sBuilder.append(", ");
        }
        sBuilder.append(elements[i]);	
    }
    sBuilder.append(']');
    return sBuilder.toString();
}
```
## 删除元素

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160125.png)

在删除元素的时候，由于是动态数组，删除其中某一个元素，那必然后面的会紧随其后跟过来，因为数组是连续的，所以我们需要对后面的元素进行挪动：

```java
public int remove(int index) {
    rangeCheck(index);
    int old = elements[index];
    for (int i = index + 1; i < size; i++) {
        elements[i - 1] = elements[i];
    }
    size--;
    return old;
}
```

`rangeCheck(index);`其实就是对 **index** 合法性检查的一个封装：

```java
private void rangeCheck(int index) {
    if (index < 0 || index >= size) {
        throw new IllegalArgumentException("index: " + index + ",and size: " + size);
    }
}
```

## 指定序列添加元素

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418160133.png)

在某一个索引添加元素和删除某一个索引的元素类似，都需要挪动元素，但需要注意的是，挪动的顺序，要从后面开始挪动，不然会造成**元素被覆盖**的问题。

```java
public void add(int index, int element) {
    rangeCheckForAdd(index);
    for (int i = size; i > index; i--) {
        elements[i] = elements[i - 1];
    }
    elements[index] = element;
    size++;
}
```

另一个注意点是 `rangeCheckForAdd(index);` ,它与另一个范围检查函数不同之处在于，是否包含数组的最后一个位置，也就是 **index == size** 的情形：

```java
private void rangeCheckForAdd(int index) {
    // 这里 index == size 时则是在数组末尾添加
    if (index < 0 || index > size) {
        throw new IllegalArgumentException("index: " + index + ",and size: " + size);
    }
}
```

## 接口测试

除了通过操作数组后打印数组来观察是否错误，当然也可以用代码检测代码是否错误：

```java
ArrayList arrayList = new ArrayList(8);
arrayList.add(1);
arrayList.add(2);
arrayList.set(0, 2);
if (arrayList.get(0) != 2) {
    throw new IllegalArgumentException("测试未通过");
}

```

也可以封装一个小工具进行判断：

```java
public class Asserts {
    public static void test(boolean value) {
        try {
            if (!value) throw new Exception("测试未通过");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

Assert.test(arrayList.get(0)==2);
```

## 如何扩容

在扩容之前，我们需要想清楚两个问题：

+ 什么情况下需要扩容？
+ 哪些接口需要扩容？

显而易见，当需要添加元素的时候，如果元素的数量将超过数组的大小时，需要扩容，目前来看只有

`add(int index, int element)` 和 `add(int element)` 两个方法需要。

并且还可以对 `add(int element)`进行重构，重构之后只需要在`add(int index, int element)`内扩容即可：

```java
public void add(int element) {
    add(size, element);
}
```

扩容时，我们可以编写一个函数，先检查是否需要扩容，也就是将 `size `和 成员变量 `elements `的长度对比，需要扩容则申请一个长度更大的数组，并将原数据迁移到新的数组：

```java
private void ensureCapacity(int capacity) {
    // 若需要满足的容量小于等于数组的值，无需扩容
    if (capacity <= elements.length)
        return;
	// 注意运算符优先级问题，左移一位为除以二，扩容 1.5 倍
    int newCapacity = capacity + (capacity >> 1);
    int[] newElements = new int[newCapacity];

    for (int i = 0; i < size; i++) {
        newElements[i] = elements[i];
    }
    elements = newElements;
}
```

那么就在`add(int index, int element)`函数内添加，并传入预期需要的容量即可：

```java
public void add(int index, int element) {
    rangeCheckForAdd(index);
    // 添加一个元素，传入需要的容量 size + 1 
    ensureCapacity(size + 1);
	// ...
}
```

##  泛型支持

动态数组到这里就差不多了，一些细节性的优化先不深究，接下来，我们需要完善对动态数组的支持。

```java
public class ArrayList<E> {
 	// ...   
}
```

并在需要是泛型的地方修改即可，但修改后有个地方会报错，意思说是，不能通过泛型来创建对象数组：

```java
// ArrayList 初始化时，申请对象数组
elements = new E[capacity];
// Cannot create a generic array of E
```

解决方式是，改写为：

```java
@SuppressWarnings("unchecked")
public ArrayList(int capacity) {
    if (capacity <= 0) {
        elements = (E[]) new Object[DEFAULT_CAPACITY];
    } else {
        elements = (E[]) new Object[capacity];
    }
}
```

因为在 Java 语言中，所有的对象的最终父类都是 `Object `，我们只需要创建一个 `Object `类型的数组，然后进行签证类型转换即可。

### 对象数组 & 内存管理细节

![](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn//hexo-images/study/algorithm/20210418174135.png)

在 Java 语言中对象数组实际存储的是**对象的引用**，也就是对象的地址。

所以当我们调用 `clear()` 方法来清空对象数组，这样仅仅只是将 **size** 赋值为 0 ，对象数组内的对象还在内存中，这样就比较浪费内存了，因为存储的对象的大小我们是无法预知的，所以我们应该在`clear()`中消除对对象的引用，以便垃圾回收：

```java
public void clear() {
    for (int i = 0; i < size; i++) {
        elements[i] = null;
    }
    size = 0;
}
```

我们可以编写一些代码来测试对象的回收：

```java
// 测试对象
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        super();
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person [name=" + name + ", age=" + age + "]";
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("Person finalize");
    }
}

// 测试用例
ArrayList<Person> arrayList = new ArrayList<>();

arrayList.add(new Person("Mahoo", 21));
arrayList.add(new Person("Mahoo", 22));
arrayList.add(new Person("Mahoo", 23));
arrayList.add(new Person("Mahoo", 24));

System.out.println(arrayList.toString());
arrayList.clear();
// 提醒 JVM 垃圾回收
System.gc();
```

再一个就是在`remove()`方法中，也需要在元素挪动后，将最后一个元素的引用消除：

```java
public E remove(int index) {
    rangeCheck(index);
    E old = elements[index];
    for (int i = index + 1; i < size; i++) {
        elements[i - 1] = elements[i];
    }
    elements[--size] = null;
    return old;
}
```

### equals & null 的处理

对于动态数组中的`indexOf(E element)`方法，是返回某个对象在数组内的序列，当支持泛型后，数组元素用 **==** 比较两个对象时比较的是两个对象的地址值。

在实际开发中，比较的并不是地址值，一般是对象内的成员变量，这样的比较需要**重写**对象的`equals()`方法，例如，定义对象的 **age** 相等时，判定对象是相等的： 

```java
@Override
public boolean equals(Object obj) {
    Person person = (Person) obj;
    return person.age == age;
}
```
另一个是内部设计的问题，动态数组是否可以存储 **null** 数据？

首先，我们目前编写的动态数组是支持 **null** 数据的，所以`indexOf(E element)`还需要进一步优化：

```java
public int indexOf(E element) {
    if (element == null) {
        for (int i = 0; i < size; i++) {
            if (elements[i] == null)
                return i;
        }
    } else {
        for (int i = 0; i < size; i++) {
            if (element.equals(elements[i]))
                return i;
        }
    }
    return ELEMENT_NOT_FOUND;
}
```

## 动态缩容

如果内存使用比较紧张，动态数组有比较多的剩余空间，可以考虑进行缩容操作；比如剩余空间占总容量的一半时，就进行缩容。如果扩容倍数、缩容时机设计不得当，有可能会导致**复杂度震荡**。

我们就简单写下缩容的代码，缩容只在删除元素时调用，我们设为私有方法，获取当前的数组的长度的一半作为缩容后的容量，仅当当前动态数组的大小小于新容量且大于默认容量时才缩容：

```java
private void trimCapacity() {
    int newCapacity = elements.length >> 1;
    if (size <= newCapacity && size > DEFAULT_CAPACITY) {
        @SuppressWarnings("unchecked")
        E[] newElements = (E[]) new Object[newCapacity];
        System.out.println(elements.length + ",缩容为： " + newElements.length);
        for (int i = 0; i < size; i++) {
            newElements[i] = elements[i];
        }
        elements = newElements;
    }
}
```

说到刚才的**复杂度震荡**，其实就是当缩容和扩容刚好互为倒数时，比如缩容为 1/2 以及扩容为 2 倍时， 此时容量若为 4，增加元素扩容后容量增加到 8 后，此时再把刚添加的元素删除，又会缩容，如果每次都是加了又删，每次缩容扩容的时间复杂度都是O(n)，这样的话，对于动态数组的操作本来都是很低的时间复杂度，这样频繁的操作造成时间复杂度突然到一个很高的水平，这样的情形可以简单描述为复杂度震荡。

