---
title: Python对文件进行批量重命名
date: 2019-12-03 21:48:43
author: Mahoo12138
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/python.png
tags: 
- Python
categories:
- 技术教程
---

## 代码及相关详解

最近没有在整STM32了，因为期末将近，必须花时间去预习了:joy:，但是还是忙里有偷闲，看到了以前看过的一些经典的影视作品动漫番剧，突然就想把这些作品的海报剧照等收藏起来，于是就淘遍整个网络下载下来好几百张图片，但是重命名就成了问题，Win10重命名的骚操作不会用，但是Python我会啊，谨以此文记录相关操作:wink:。

```python
import os
import time

filepath = 'D:\Mahoo\Pictures\Saved Pictures\收藏'

n = 0
# 开始计时
time_start = time.time()

for file in os.listdir(filepath):
    # 拼接文件目录
    filedir = os.path.join(filepath, file)
    if os.path.isfile(filedir):
        # 新文件名格式
        newname = 'pic_' + str(n) + '.jpg'
        n = n + 1
        # 重命名
        os.rename(filedir, os.path.join(filepath, newname))

# 结束计时
time_end = time.time()

print('一共重命名{}次，耗时{:.3}秒 '.format(n, (time_end - time_start)))
```

### os.path.isdir()

该函数判断某一路径是否为目录，返回一个`Bool`值：

```python
import os
# 判断D:\Mahoo\pic是否为文件
os.path.isfile('D:\\Mahoo\\pic')
```

类似的即是`os.path.isfile()`，功能都可以顾名思义**判断是否为文件**。

### os.path.join()

该函数将多个路径组合后返回，例如：

```python
path1 = 'D:\Mahoo'
path2 = 'Pictures'

path3  =  os.path.join(path1,path2)
print(path3)
# D:\Mahoo\Pictures
```

