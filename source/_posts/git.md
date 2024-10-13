---
title: Git 版本控制使用填坑指北
date: 2019-06-29 23:37:30
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo_images/cover/git.png
category:
 - 学习笔记
tags:
 - Git
---

### git pull 失败 ,提示：`fatal: refusing to merge unrelated histories`

**原因：**无关的仓库无法合并

**方法：**

+ 使用强制命令：

  ```sh
  git pull origin master --allow-unrelated-histories
  ```

+ 先将远程仓库拉取到本地仓库，再推送

### git push 失败，提示：`Updates were rejected because the tip of your current branch is behind`

**原因：**本地仓库版本低于远程仓库版本，或做了一些自定义修改

**方法：**强制推送

```shell
 git push -u origin master -f
```

### Win10下 git bash 中文显示乱码：类似﷨﷨﷨﷨或▒▒▒▒

**解决方法**：

+ 在窗口内右击，选择`Options...`
+ 在`Text`内，选择Locale为*zh_CN*，Character set 为*GBK*
+ Save

### git push 失败，提示：`git@github.com: Permission denied (publickey). fatal: Could not read from remote repository.`
**原因**：电脑公钥（publickey）未绑定到 Github，所以无法识别。 

解决方法：

+ 获取本地电脑公钥：

  ```bash
  ssh-keygen -t rsa -C “你的邮箱”
  ```

+ 在 *Github → Settings → SHH and GPG keys*中，添加刚刚生成的 `SHH keys`即可

### git push 失败，提示：`fatal: unable to access $(仓库地址) `

**原因**：远程仓库已改名，本地绑定未修改。

解决方法：

+ 看所有远程仓库：

  ```bash
  git remote
  # git remote xxx 查看指定远程仓库地址
  ```

+ 删除原绑定仓库：

  ```bash
  git remote rm $(origin)
  ```

+ 添加仓库：

  ```bash
  git remote add origin $(仓库地址)
  ```

  

