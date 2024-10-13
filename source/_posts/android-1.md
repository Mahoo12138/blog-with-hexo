---
title: 学习及开发中的 Java 语法及理论学习
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/android.png
date: 2019-08-20 14:48:43
categories: 
- 学习笔记
tags:
- Java
---

## 理论

### 理解java回调机制

[技术详解]: https://blog.csdn.net/xiaanming/article/details/8703708	"一个经典例子让你彻彻底底理解java回调机制"

### android开发中的同步和异步区别的理解

+ 同步执行的话，就是程序会呆板地从头执行到尾，耗时间的东西不执行完，程序不会继续往下走，等待时间长的话，有时候就会造成失去响应了。

  异步的好处，就是把一些东西，特别是耗时间的东西扔到后台去运行了(doInBackground)，程序可以继续做自己的事情，防止程序卡在那里失去响应。

+ 同步是指两个线程的运行是相关的，其中一个线程要阻塞等待另外一个线程的运行。
  异步的意思是两个线程毫无相关，自己运行自己的。

+ 同步是指：发送方发出数据后，等接收方发回响应以后才发下一个数据包的通讯方式。 
  异步是指：发送方发出数据后，不等接收方发回响应，接着发送下个数据包的通讯方式。

+ 同步：提交请求->等待服务器处理->处理完毕返回 这个期间客户端浏览器不能干任何事
  异步: 请求通过事件触发->服务器处理（这是浏览器仍然可以作其他事情）->处理完毕

+ 同步就是你叫我去吃饭，我听到了就和你去吃饭；如果没有听到，你就不停的叫，直到我告诉你听到了，才一起去吃饭。

  异步就是你叫我，然后自己去吃饭，我得到消息后可能立即走，也可能等到下班才去吃饭。  

+ **个人理解**：

  + 同步就是两个人一起工作，必须前一个人把手上的活干完，第二个人才能开始干
  + 异步则是两个人分开各自闷声发大财，相互没影响

[原帖链接]: https://blog.csdn.net/u012301501/article/details/53386503	"android开发中的同步和异步区别的理解"

## indexOf 和 lastIndexOf

从名字上来看，二者都是索引，区别是：

+ indexOf 是查询某个字符子串在字符串中**首次**出现的位置（索引值）
+ lastIndexOf 有四种重载：
  + **public int lastIndexOf(int ch):** 返回指定字符在此字符串中最后一次出现处的索引，如果此字符串中没有这样的字符，则返回 -1。
  + **public int lastIndexOf(int ch, int fromIndex):** 返回指定字符在此字符串中最后一次出现处的索引，如果此字符串中没有这样的字符，则返回 -1。
  + **public int lastIndexOf(String str):** 返回指定字符在此字符串中最后一次出现处的索引，如果此字符串中没有这样的字符，则返回 -1。
  + **public int lastIndexOf(String str, int fromIndex):** 返回指定字符在此字符串中最后一次出现处的索引，如果此字符串中没有这样的字符，则返回 -1。

实例：

```java
public class Test {
    public static void main(String args[]) {
        String Str = new String("mahoo12138");
        String SubStr1 = new String("oo");
        String SubStr2 = new String("12138");

        System.out.print("查找字符 o 最后出现的位置 :" );
        System.out.println(Str.lastIndexOf( 'o' ));

        System.out.print("从第4个位置查找字符 o 最后出现的位置 :" );
        System.out.println(Str.lastIndexOf( 'o', 4 ));

        System.out.print("子字符串 SubStr1 最后出现的位置:" );
        System.out.println( Str.lastIndexOf( SubStr1 ));

        System.out.print("从第2个位置开始搜索子字符串 SubStr1 最后出现的位置 :" );
        System.out.println( Str.lastIndexOf( SubStr1, 8 ));

        System.out.print("子字符串 SubStr2 最后出现的位置 :" );
        System.out.println(Str.lastIndexOf( SubStr2 ));
    }
}
```

## System.out.println() 方法和 toString() 方法

Object 有个 toString 实例方法。Object 类的 toString 方法返回一个字符串，该字符串由类名（对象是该类的一个实例）、a t标记符“@”和此对象哈希码的无符号十六进制表示组成。换句话说，该方法返回一个字符串，它的值等于：

```java
getClass().getName() '@' Integer.toHexString(hashCode())
```

而在 Java 中，所有的对象都是继承自 Object，因此所有的 Java 对象都具有`toString`方法。

但很多类都重写了Object类的`toString`方法，用于返回可以表述该对象信息的字符串。

当程序使用`System.out.println()`方法输出一个对象，或者把某个对象和字符串进行连接运算时，系统会自动调用该对象的`toString`方法返回该对象的字符串表示。

当然，空引用变量调用`toString`方法，会引起空指针异常。