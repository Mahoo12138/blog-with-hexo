---
title: Python 爬虫的 XPath 学习
date: 2021-04-12 15:45:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/python.png
tags: 
- Python
- Xpath
categories:
- 学习笔记
---

最近要在做一个校园助手的App，需要爬取学校教务处的通知，之前写的许多小东西都是直接用正则提取数据的，现在需要的数据多了，还是使用 Xpath 定位元素比较可靠。现记录一下从爬虫的角度学习 python xml 相关的库的一些东西。

Python 标准库中自带了 xml 模块，但一般使用的都是第三方库 lxml ，性能更强，使用起来更人性化，使用需要导入：

```python
from lxml import etree
```

## XPath 基本概念

学习任何东西前，清楚地了解相关的概念都是高效学习的前提。

> **XPath**，全称 XML Path Language，即路径语言，它是一门XML文档中查找信息的语言

在 Xpath 中，有七种类型的节点：**元素**、**属性**、**文本**、**命名空间**、**处理指令**、**注释**以及**文档节点**（或称为根节点）。

+ 元素：

## XPath 常用规则

| 表达式            | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| nodename          | 选取此节点的所有子节点` <> `里的字符，例如：\<body\>，在 html 中常称为标签 |
| /                 | 从当前节点选取直接子节点，**不包含更小的后代**，如孙节点     |
| //                | 从当前节点选取子孙节点                                       |
| .                 | 选取当前节点                                                 |
| ..                | 选取当前节点的父节点                                         |
| @                 | 选取属性                                                     |
| *                 | 通配符，选择所有元素节点与元素名                             |
| @*                | 选取所有属性                                                 |
| [@attrib]         | 选取具有给定属性的所有元素                                   |
| [@attrib='value'] | 选取给定属性具有给定值的所有元素                             |
| [tag]             | 选取所有具有指定元素的直接子节点                             |
| [tag='text']      | 选取所有具有指定元素并且文本内容是text节点                   |

## XPath 基本使用

```python
# 从字符串导入
page1 = etree.HTML(html)
# 从文件导入
page2 = etree.parse(test.html)
```

### 使用实例

```python
html = """
<html>

<head>
    <meta charset="UTF-8">
</head>

<body>
    <div class='main-content'>
        <h1 id="title">Test Page</h1>
        <p id=“first” class="text-first">This is paragraph1</p>
        <div>
            <p>测试语句1</p>
        </div>
    </div>
    <div>
        <p class="text-second">This is paragraph2</p>
        <p class="text-third">This is paragraph3</p>
        <div>
            <p>测试语句2</p>
        </div>
    </div>
</body>

</html>
"""

page = etree.HTML(html)
```

通过节点和 '/' 结合，我们可以简单地查找某一个节点：

```python
# 在 div 节点下寻找所有 p 子节点
test1 = page.xpath('/html/body/div/p')
print(test1[0].text)	# This is paragraph1
print(test1[1].text)	# This is paragraph2
print(test1[2].text)	# This is paragraph3

# 在 div 节点下寻找所有 p 节点
test2 = page.xpath('/html/body/div//p')
for item in test2:
    print(item.text)
# This is paragraph1
# 测试语句1
# This is paragraph2
# This is paragraph3
# 测试语句2
```

若想查询具体位置的节点，可以为节点添加下标，不过**下标应从 1 开始**，如：

```python
# 查询第一个 div 内的 p 子节点
test3 = page.xpath('/html/body/div[1]/p')
# 查询第一个 div 内所有节点
test4 = page.xpath('/html/body/div[1]//*')
```

通过 `@` 符号选择属性更具体的选择节点：

```python
# 在根节点中选择所有 id="title” 的节点
test5 = page.xpath('//*[@id="title"]')				# Test Page
# 在根节点中选择所有 class="text-second" 的 p 节点
test6 = page.xpath('//p[@class="text-second"]')		# This is paragraph2
# 多属性筛选
test7 = page.xpath('//p[@class="text-first" and @id="first"]')	
```

进行属性筛选的同时，我们还可能会需要获取属性的某个值：

```python
test8 = page.xpath('/html/body/div[1]/p[1]')
# 所有属性
print(test9[0].attrib)		# {'id': 'first', 'class': 'text-first'}
# 单个属性
print(test9[0].get('id'))	# first
```

除了属性筛选，还可以进行文本筛选：

```python
test9 = page.xpath('/html/body/div/p[text()="This is paragraph2"]')
```

## Xpath 学习实战

主要是获取该网站下一个通知公告的所有内容：

```python
# 获取指定页面的 html 代码
response = requests.get('http://xxxx.cn/xxx.htm')
response.encoding = "utf-8"
html = response.text

# 通过浏览器的路径选择功能确认大致路径
# 并根据业务逻辑进行细化筛选
dom = etree.HTML(html)
tr = dom.xpath(
    '/html/body/table[5]/tbody/tr/td[3]/table[2]/tbody/tr/td/table/tr[@height="25"]'
)
# 对数据进行处理
for item in tr:
    title = item.xpath('td/a/text()')[0].strip()
    url = item.xpath('td/a')[0].get('href')
    date = item.xpath('td[3]/span/text()')[0]
    date = date.replace('\xa0','')
    # 存储代码

```



