---
title: Python学习Demo
date: 2019-12-02 21:45:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/python.png
tags: 
- Python
categories:
- 学习笔记
---

# Python学习Demo

## 1.1 输入输出

+ 使用input()函数获取键盘输入

  ```python
  a = int(input('a = '))
  ```


+ 使用getpass，输入无回显

  ```python
  import getpass
  
  username = input('请输入用户名: ')
  password = getpass.getpass('请输入密码: ')
  if username == 'admin' and password == '123456':
      print('登录成功!')
  else:
      print('登录失败!')
  ```

### 格式化输出

#### 进制输出

`%o` —— oct  八进制
`%d` —— dec 十进制
`%x` —— hex 十六进制

```python
print('%o' % 20)
# 24
print('%d' % 20)
# 20
print('%x' % 20)
# 14
```

#### 浮点输出

`%f `——保留小数点后面六位有效数字
　　%.3f，保留3位小数位
`%e` ——保留小数点后面六位有效数字，指数形式输出
　　%.3e，保留3位小数位，使用**科学计数法**
`%g` ——在保证六位有效数字的前提下，使用小数方式，否则使用科学计数法
　　%.3g，保留3位有效数字，使用**小数或科学计数法**

#### format用法

`format()`功能极其强大，该函数把字符串当成一个模板，通过传入的参数进行格式化，并且使用大括号`{}`作为特殊字符代替`%`，并且`{}`还可以***加入编号或关键字控制输入***：

```python
print('{} {}'.format('hello','world'))  # 不带字段
hello world
print('{0} {1}'.format('hello','world'))  # 带数字编号
hello world
print('{0} {1} {0}'.format('hello','world'))  # 打乱顺序
hello world hello
print('{1} {1} {0}'.format('hello','world'))
world world hello
print('{a} {tom} {a}'.format(tom='hello',a='world'))  # 带关键字
world hello world

# 数字格式化
print("{:.2f}".format(3.1415926));
# 3.14
```

|   数字·    |  格式   |   输出    | 描述                         |
| :--------: | :-----: | :-------: | :--------------------------- |
| 3.1415926  | {:.2f}  |   3.14    | 保留小数点后两位             |
| 3.1415926  | {:+.2f} |   +3.14   | 带符号保留小数点后两位       |
|     -1     | {:+.2f} |   -1.00   | 带符号保留小数点后两位       |
|  2.71828   | {:.0f}  |     3     | 不带小数                     |
|     5      | {:0>2d} |    05     | 数字补零 (填充左边, 宽度为2) |
|     5      | {:x<4d} |   5xxx    | 数字补x (填充右边, 宽度为4)  |
|     10     | {:x<4d} |   10xx    | 数字补x (填充右边, 宽度为4)  |
|  1000000   |  {:,}   | 1,000,000 | 以逗号分隔的数字格式         |
|    0.25    | {:.2%}  |  25.00%   | 百分比格式                   |
| 1000000000 | {:.2e}  | 1.00e+09  | 指数记法                     |
|     13     | {:>10d} |    13     | 右对齐 (默认, 宽度为10)      |
|     13     | {:<10d} |    13     | 左对齐 (宽度为10)            |
|     13     | {:^10d} |    13     | 中间对齐 (宽度为10)          |

| 进制控制           | 输出 |
| ------------------ | ---- |
| '{:b}'.format(11)  | 1011 |
| '{:d}'.format(11)  | 11   |
| '{:o}'.format(11)  | 13   |
| '{:x}'.format(11)  | b    |
| '{:#x}'.format(11) | 0xb  |
| '{:#X}'.format(11) | 0XB  |



## 1.2 条件

+ if...else的嵌套

  ```python
  x = float(input('x = '))
  if x > 1:
      y = 3 * x - 2
  else:
      if x >= -1:
          y = x + 2
      else:
          y = 5 * x + 3
  print('f(%.2f) = %.2f' % (x, y))
  ```


+ if...elif...else的嵌套

  ```python
  x = float(input('x = '))
  if x > 1:
      y = 3 * x - 5
  elif x >= -1:
      y = x + 2
  else:
      y = 5 * x + 3
  print('f(%.2f) = %.2f' % (x,y))
  ```

## 1.3 循环

+ for-in循环

  ```python
  """
  用for循环实现1-100求和
  """
  sum = 0
  for x in range(101):
  	sum += x
  print(sum)
  ```

  **注意**：`range`可以用来产生一个不变的数值序列，而且这个序列通常都是用在循环中的，例如：

  - `range(101)`可以产生一个0到100的整数序列。
  - `range(1, 100)`可以产生一个1到99的整数序列。
  - `range(1, 100, 2)`可以产生一个1到99的奇数序列，其中的2是步长，即数值序列的增量。

+ for循环实现1-100偶数求和

  ```python
  sum_even = 0
  for x in range(2,100,2):
      sum_100_even += x
  print(sum_even)
  ```

+ while循环

  ```python
  import random
  
  answer = random.randint(1, 100)
  while True:
      number = int(input('请输入数字：'))
      if number > answer:
          print("大了")
      elif number < answer:
          print("小了")
      else:
          print("猜对了")
     	break
  ```

+ 求取水仙花数

```python
for x in range(100,1000):
    a = x // 100
    b = x // 10 % 10
    c = x % 10
    if a ** 3 + b ** 3 + c ** 3 == x:
        print(x)
	
```



## 1.5 模块
+ random模块的randint函数

  ```python
  from random import randint
  
  num = randint(1,4)
  if num == 1:
      result = 'A'
  elif num == 2:
      result = 'B'
  elif num == 3:
      result = 'C'
  elif num == 4:
      result = 'D'
  print(result)
  ```

+ math模块, abs()取绝对值

  ```python
  a = -4
  b = 9
  c = math.sqrt(abs(a) + b)
  print(c)
  ```
如果我们导入的模块除了定义函数之外还中有可以执行代码，**那么Python解释器在导入这个模块时就会执行这些代码**，事实上我们可能并不希望如此，因此如果我们在模块中编写了执行代码，最好是将这些执行代码放入如下所示的条件中，这样的话除非直接运行该模块，if条件下的这些代码是不会执行的，因为只有直接执行的模块的名字才是“\__main\_\_”。

module.py

```python
def foo():
    pass

def bar():
    pass

# __name__是Python中一个隐含的变量它代表了模块的名字
# 只有被Python解释器直接执行的模块的名字才是__main__
if __name__ == '__main__':
    print('call foo()')
    foo()
    print('call bar()')
    bar()
```

test.py

```python
import module

# 导入module时 不会执行模块中if条件成立时的代码 因为模块的名字是module而不是__main__
```

## 1.6 函数

```python
# 在参数名前面的*表示args是一个可变参数
# 即在调用add函数时可以传入0个或多个参数
def add(*args):
    total = 0
    for val in args:
        total += val
    return total

print(add())
print(add(1))
print(add(1, 2))
print(add(1, 2, 3))
print(add(1, 3, 5, 7, 9))
```



## 1.7 字符串，列表，元组

+ 字符串

  ```python
  	str1 = 'hello, world!'
      # 通过len函数计算字符串的长度
      print(len(str1))  # 13
      # 获得字符串首字母大写的拷贝
      print(str1.capitalize())  # Hello, world!
      # 获得字符串变大写后的拷贝
      print(str1.upper())  # HELLO, WORLD!
      # 从字符串中查找子串所在位置
      print(str1.find('or'))  # 8
      print(str1.find('shit'))  # -1
      # 与find类似但找不到子串时会引发异常
      # print(str1.index('or'))
      # print(str1.index('shit'))
      # 检查字符串是否以指定的字符串开头
      print(str1.startswith('He'))  # False
      print(str1.startswith('hel'))  # True
      # 检查字符串是否以指定的字符串结尾
      print(str1.endswith('!'))  # True
      # 将字符串以指定的宽度居中并在两侧填充指定的字符
      print(str1.center(50, '*'))
      # 将字符串以指定的宽度靠右放置左侧填充指定的字符
      print(str1.rjust(50, ' '))
      str2 = 'abc123456'
      # 从字符串中取出指定位置的字符(下标运算)
      print(str2[2])  # c
      # 字符串切片(从指定的开始索引到指定的结束索引)
      print(str2[2:5])  # c12
      print(str2[2:])  # c123456
      print(str2[2::2])  # c246 	序列每次递增2
      print(str2[::2])  # ac246
      print(str2[::-1])  # 654321cba
      print(str2[-3:-1])  # 45 	倒数第三到倒数第一
      # 检查字符串是否由数字构成
      print(str2.isdigit())  # False
      # 检查字符串是否以字母构成
      print(str2.isalpha())  # False
      # 检查字符串是否以数字和字母构成
      print(str2.isalnum())  # True
      str3 = '  mahoo12138@qq.com '
      print(str3)
      # 获得字符串修剪左右两侧空格的拷贝
      print(str3.strip())
  ```

  + 字符串前加`r`表示该字符串为raw string，可以防止字符串被转义，一般多用于正则表达式：

    ```python
    str = r"\n\n\n"
    print(str)		# \n\n\n
    ```

  + 字符串搜索&替换

    使用 str.replace()

    ```python
    text="mahoo is a handsome boy"
    print(text.replace("boy","girl"))  # mahoo is a handsome girl
    ```

    复杂的模式，请使用 re 模块中的 `sub() `函数

    ```python
    # 假设你想将形式为 11/27/2018 的日期字符串改成 2018-11-27
    import re
    date="11/27/2018"
    print(re.sub(r"(\d+)/(\d+)/(\d+)",r"\3-\1-\2",date))  # 2018-11-27
    # sub() 函数中的第一个参数是被匹配的模式，第二个参数是替换模式。反斜杠数字比如 \3 指向前面模式的捕获组号
    ```

    转自：[朱兆筠](https://www.cnblogs.com/zzy-9318/)  —— [Python之字符串搜索和替换](https://www.cnblogs.com/zzy-9318/p/10457921.html)

    ### 

+ 列表

  ```python
  	list1 = [1, 3, 5, 7, 100]
      print(list1)	#[1, 3, 5, 7, 100]
      list2 = ['hello'] * 5
      print(list2)	#['hello', 'hello', 'hello', 'hello', 'hello']
      # 计算列表长度(元素个数)
      print(len(list1))	#5
      # 下标(索引)运算
      print(list1[0])		#1
      print(list1[4])		#100
      # print(list1[5])  # IndexError: list index out of range
      # 索引为-1，则访问最后一个元素
      print(list1[-1])
      print(list1[-3])
      list1[2] = 300
      print(list1)
      # 添加元素
      list1.append(200)
      list1.insert(1, 400)	#在序列1前面插入元素400
      list1 += [1000, 2000]	#添加元素在末尾
      # 删除元素
      list1.remove(3)		#移除该元素，没有则报错
      if 1234 in list1:
          list1.remove(1234)
      del list1[0]	#删除序列0的元素
      # 清空列表元素
      list1.clear()
  ```

  + 列表排序

    ```python
    	list1 = ['orange', 'apple', 'zoo', 'internationalization', 'blueberry']
        list2 = sorted(list1)	# 根据字母表排序
        # sorted函数返回列表排序后的拷贝不会修改传入的列表
    
        list3 = sorted(list1, reverse=True)	# 根据字母表反向排序
        
        # 通过key关键字参数指定根据字符串长度进行排序而不是默认的字母表顺序
        list4 = sorted(list1, key=len)
        
        # 给列表对象发出排序消息直接在列表对象上进行排序
        list1.sort(reverse=True)
        print(list1)
    ```

+ 创建列表

  ```python
  	f = [x for x in range(1, 10)]
      print(f)
      f = [x + y + z for x in 'AB' for y in '12' for z in '!@']
  	print(f)
      # ['A1!', 'A1@', 'A2!', 'A2@', 'B1!', 'B1@', 'B2!', 'B2@']
      # 用列表的生成表达式语法创建列表容器
      # 用这种语法创建列表之后元素已经准备就绪所以需要耗费较多的内存空间
      import sys
      f = [x ** 2 for x in range(1, 6)]
      print(sys.getsizeof(f))  # 查看对象占用内存的字节数
      print(f)
      # 请注意下面的代码创建的不是一个列表而是一个生成器对象
      # 通过生成器可以获取到数据但它不占用额外的空间存储数据
      # 每次需要数据的时候就通过内部的运算得到数据(需要花费额外的时间)
      f = (x ** 2 for x in range(1, 6))
      print(sys.getsizeof(f))  # 相比生成式生成器不占用存储数据的空间
      print(f)
      for val in f:
          print(val)
  ```
  
+ 二维列表

  + 创建List二维列表

    ```python
    lists = [[] for i in range(3)]  # 创建的是多行三列的二维列表
    for i in range(3):
        lists[0].append(i)
    for i in range(5):
        lists[1].append(i)
    for i in range(7):
        lists[2].append(i)
    print("lists is:", lists)
    # lists is: [[0, 1, 2], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4, 5, 6]]
    ```

  + 使用索引遍历二维列表

    ```python
    sum_0 = 0
    for i in range(len(lists)):
        for j in range(len(lists[i])):
            print(lists[i][j])
            sum_0 += lists[i][j]
    print("The sum_0 of Lists:", sum_0)
    
    # 0
    # 1
    # 2
    # 0
    # 1
    # 2
    # 3
    # 4
    # 0
    # 1
    # 2
    # 3
    # 4
    # 5
    # 6
    # The sum of Lists: 34
    ```

  + 使用句柄遍历二维列表

    ```python
    sum_1 = 0
    for i in lists:
        for j in i:
            sum_1 += j
    
    print("The sum_1 of Lists:", sum_1)
    # The sum_1 of Lists: 34
    ```

    转自：cloud&ken —— [python创建与遍历List二维列表](https://www.cnblogs.com/cloud-ken/p/10019253.html)

    ### 使用元组

    Python 的元组与列表类似，不同之处在于元组的元素不能修改

    ```python
     	# 定义元组
        t = ('老黄', 19, True, '大连')
        print(t)
        # 获取元组中的元素
        print(t[0])
        print(t[3])
        # 遍历元组中的值
        for member in t:
            print(member)
        # 重新给元组赋值
        # t[0] = '王大锤'  # TypeError
        # 变量t重新引用了新的元组原来的元组将被垃圾回收
        t = ('老王', 40, True, '湖南')
        print(t)
        # 将元组转换成列表
        person = list(t)
        print(person)
        # 列表是可以修改它的元素的
        person[0] = '李小龙'
        person[1] = 25
        print(person)
        # 将列表转换成元组
        fruits_list = ['apple', 'banana', 'orange']
        fruits_tuple = tuple(fruits_list)
        print(fruits_tuple)
    ```

    

    

    

  

  

## 1.8 yield关键字

+ Python关键字yield的解释

  + 可迭代对象

    一个列表，可以逐项地读取，这叫做一个可迭代对象:

    ```python
    list = [1, 2, 3]
    for i in list:
    	print(i)
    ```

  + 生成器

    生成器是可以迭代的，但是你 **只可以读取它一次** ，因为它并不把所有的值放在内存中，它是实时地生成数据:

    ```python
    mygenerator = (x*x for x in range(3))
    for i in mygenerator:
    	print(i)
    ```

  看起来除了把 `[]` 换成 `()` 外没什么不同。但是，你不可以再次使用 `for i inmygenerator` , 因为生成器只能被迭代一次：先计算出0，然后继续计算1，然后计算4，一个跟一个的…

  + yield关键字

    `yield` 是一个类似 `return` 的关键字，**只是这个函数返回的是个生成器**。

    ```python
    def createGenerator() :
        mylist = range(3)
        for i in mylist :
            yield i*i
    mygenerator = createGenerator()
    print(mygenerator)	# mygenerator 是一个对象
    <generator object createGenerator at 0x000001D74701D8C8>
    for i in mygenerator:
         print(i)
    ```

    这个例子没什么用途，但是它让你知道，这个函数会返回一大批你只需要读一次的值.

## 1.9 类的使用

+ 定义类

  在Python中可以使用`class`关键字定义类，然后在类中通过之前学习过的函数来定义方法，这样就可以将对象的动态特征描述出来，代码如下所示。

  ```python
  class Student(object):
  
      # __init__是一个特殊方法用于在创建对象时进行初始化操作
      # 通过这个方法我们可以为学生对象绑定name和age两个属性
      def __init__(self, name, age):
          self.name = name
          self.age = age
  
      def study(self, course_name):
          print('%s正在学习%s.' % (self.name, course_name))
  
      # PEP 8要求标识符的名字用全小写多个单词用下划线连接
      # 但是部分程序员和公司更倾向于使用驼峰命名法(驼峰标识)
      def watch_movie(self):
          if self.age < 18:
              print('%s只能观看《熊出没》.' % self.name)
          else:
              print('%s正在观看岛国爱情大电影.' % self.name)
  ```

  > **说明：** 写在类中的函数，我们通常称之为（对象的）方法，这些方法就是对象可以接收的消息。

+ 创建和使用对象

  ```python
  def main():
      # 创建学生对象并指定姓名和年龄
      stu1 = Student('我', 20)
      # 给对象发study消息
      stu1.study('Python程序设计')
      # 给对象发watch_av消息
      stu1.watch_movie()
      stu2 = Student('王大锤', 15)
      stu2.study('思想品德')
      stu2.watch_movie()
  
  
  if __name__ == '__main__':
      main()
  ```

+ 访问的可见性

  在Python中，属性和方法的访问权限只有两种，也就是公开的和私有的，如果希望属性是私有的，在给属性命名时可以用两个下划线作为开头，下面的代码可以验证这一点。

  ```python
  class Test:
  
      def __init__(self, foo):
          self.__foo = foo
  
      def __bar(self):
          print(self.__foo)
          print('__bar')
  
  
  def main():
      test = Test('hello')
      # AttributeError: 'Test' object has no attribute '__bar'
      test.__bar()
      # AttributeError: 'Test' object has no attribute '__foo'
      print(test.__foo)
  
  
  if __name__ == "__main__":
      main()
  ```

  但是，Python并没有从语法上严格保证私有属性或方法的私密性，它只是给私有的属性和方法换了一个名字来“妨碍”对它们的访问，事实上如果你知道更换名字的规则仍然可以访问到它们，下面的代码就可以验证这一点。之所以这样设定，可以用这样一句名言加以解释，就是“We are all consenting adults here”。因为绝大多数程序员都认为开放比封闭要好，而且程序员要自己为自己的行为负责。

  ```python
  class Test:
  
      def __init__(self, foo):
          self.__foo = foo
  
      def __bar(self):
          print(self.__foo)
          print('__bar')
  
  
  def main():
      test = Test('hello')
      test._Test__bar()
      print(test._Test__foo)
  
  
  if __name__ == "__main__":
      main()
  ```

  在实际开发中，我们并不建议将属性设置为私有的，因为这会导致子类无法访问。所以大多数Python程序员会遵循一种命名惯例就是让属性名以单下划线开头来表示属性是受保护的，本类之外的代码在访问这样的属性时应该要保持慎重。这种做法并不是语法上的规则，单下划线开头的属性和方法外界仍然是可以访问的，所以更多的时候它是一种暗示或隐喻。

## 2.0 文件操作

+ 操作模式

| 操作模式 | 具体含义                         |
| :------: | :------------------------------- |
|  `'r'`   | 读取 （默认）                    |
|  `'w'`   | 写入（会先截断之前的内容）       |
|  `'x'`   | 写入，如果文件已经存在会产生异常 |
|  `'a'`   | 追加，将内容写入到已有文件的末尾 |
|  `'b'`   | 二进制模式                       |
|  `'t'`   | 文本模式（默认）                 |
|  `'+'`   | 更新（既可以读又可以写）         |

### 读写文本文件

+ 使用`open()`函数

  + 文件名 (指定路径)

  + 文件模式 
  + 编码参数

  ```python
  def main():
      f = open('mahoo.txt', 'r', encoding='utf-8')
      print(f.read())
      f.close()
  
  
  if __name__ == '__main__':
      main()
  ```

  

## 

