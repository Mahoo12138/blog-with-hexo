---
title: 【文章翻译】使用文本编辑器手工制作电子书
date: 2021-06-25 23:45:43
tags: 
- 翻译
categories:
- 技术教程
---

没有什么比装订好的 EPUB 格式的电子书更能抚慰人的心灵了。

接下来是我的夜晚的旅程，是为了搞清楚为什么使用 pandoc 生成的 epub 文件无法上传到 Google Books。内容是一篇维基百科的文章。

我联系了谷歌支持（我对任何存在的支持都印象深刻），他们提供了愉快的帮助。默认情况下，我被定向到了“合作伙伴计划”支持。推测可能是，因为我注册只是为了看它，甚至不是使用它，这意味着他们可能得到优先级，这也就能解释我的良好体验了！

Barish 引导我至[EPUB 验证器](https://github.com/w3c/epubcheck)接着告诉我，我有任何东西需要报告的话可以与其他团队联系。

所以我查阅了“EPUB 规范”，并决定最好的起点是这个容器的格式。结果显示，EPUB 仅仅只是 zip 归档格式。 此时，我开始在其它三个文件中搜索关键词“require”，很快我就了解了最低的要求。令人印象深刻的是，使用这个关键词搜索产生了大量信息，我开始手工制作。

## 手工制作 EPUB

定义一个 EPUB 文件仅需要4个文件即可。

以下是文件内容的副本，用于直观地展示一个最小的，严格有效的EPUB文件，能让读者看到 ids 和文件是如何联系在一起的。

mimetype：

```shell
application/epub+zip
```

META-INF/container.xml：

```xml
<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
   <rootfiles>
      <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
      
   </rootfiles>
</container>
```

EPUB/index.opf：

```xml
<?xml version="1.0"?>
<package version="3.0" unique-identifier="myId" xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="myId">urn:uuid:A1B0D67E-2E81-4DF5-9E67-A64CBE366809</dc:identifier>
    <dc:title>Handmade</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">2011-01-01T12:00:00Z</meta>
  </metadata>

  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
  </manifest>

  <spine>
    <itemref idref="nav"/>
  </spine>
</package>
```

EPUB/nav.xhtml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en-CA">
  <head><title>0</title></head>
  <body>
    <nav epub:type="toc">
      <ol>
        <li><a href="">Must be text</a></li>
      </ol>
    </nav>
  </body>
</html>
```

对于这个新的最小的EPUB文件，我将其上传到 Google Books，没有问题，它被接受了！拥有我自己的控制的EPUB，我现在能开始进一步缩减它的大小了。这涉及到近一小时的移除构件和许多许多次的重载；我不打算将这些编辑包含进去，仅是因为它们会随时间而改变，很快变得没用。Google Books 是确定没有使用最严格的 epubcheck  规则的，或是根本没有使用 epubcheck 。他们作为 epubcheck  的大赞助商，所以这也是需要考虑的。

这些文件现在能作为基础，以简单地创建书籍，并上传或在设备上阅读。

## 编译书籍

mimetype 文件必须是归档文件中地第一个，特别的是不要带上“压缩额外字段”，所以你的压缩命令将看起来像这样：

```bash
zip -X -r Handmade.epub mimetype *
# -X 即是不带额外字段
```

当压缩时，要确保没有 "前缀 "目录（原来存放文件的目录名称）。

## 向书籍添加内容

书籍的内容必须是XML格式。维基百科有许多精彩的内容，但是维基文本需要被转换。下载 php，composer，并下载 parsoid 项目。使用`composer install`安装 parsoid 项目依赖，我们使用它将维基文本转换为 XML 格式。

现在你能使用这个转换器：

```bash
echo "test" | php bin/parser.php
```

之后，你将得到 HTML/XML 格式的输出。

`https://en.wikipedia.org/wiki/MYPAGE?action=raw`使用这个链接可以获取到任何的维基百科页面的维基文本。将其与一个小脚本结合起来，用合适的标记来包装它，任何文章都可以很容易地变成一本书：

```shell
PAGE="Hedonism"
echo '<html><head><title></title></head><body>' > out.xml \
&& curl "https://en.wikipedia.org/wiki/$PAGE?action=raw"  \
|  php bin/parser.php >> out.xhtml                        \
&& echo '</body></html>' >> out.xhtml
```

不幸的是，这并不能纠正引用不存在的问题。无论是自动还是手动，所有图片和外部资源的链接都将需要被删除。使用 `sed `命令可以完成这大部分的工作，但应该使用合适的 HTML/XML
解析器来删除有问题的数据。

在打开 *EPUB/index.opf*后，将新条目添加到 **manifest** 和 **spine** 元素中。运行`zip`来创建EPUB并上传。

你现在可以阅读维基百科的文章，并在任何运行 Google Books 的设备上继续阅读你离开的地方。

## 最后的感想

1. 如果能有一个插件能自动完成这个过程那就太棒了。
2. 我想知道 Google Books 的引擎在查看外部参考资料时做了什么。潜在的安全漏洞？
3. 编写一个基本的程序来获取维基百科的 URL 并输出 EPUB，对任何想真正使用它的人（比如我）来说，应该是微不足道的。
4. EPUB实际上是一个相当不错的格式，如果你忽略了它的所有XML。
