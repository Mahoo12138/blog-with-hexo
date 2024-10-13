---
title: Win10 注册表的必备使用教程
date: 2020-08-08 21:09:45
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/win10.png
categories: 
- 技术教程
tags:
- 注册表
---

## 右键新建内容无文本文档

+ 检查`C:\WINDOWS\notepad.exe`是否存在，如无可在搜索引擎中下载；

+ 新建后缀为`.reg`的文本文档，这里可以各自大显身手，留一个参考选择，打开 **CMD**命令窗口：

  ```powershell
  copy con <文件名>.txt  <内容>
  ```

+ 将以下注册表信息写入`.reg`文件：

  ```shell
  Windows Registry Editor Version 5.00
  [HKEY_CLASSES_ROOT\.txt]
  @="txtfile"
  "Content Type"="text/plain"
  [HKEY_CLASSES_ROOT\.txt\ShellNew]
  "NullFile"=""
  [HKEY_CLASSES_ROOT\txtfile]
  @="文本文档"
  [HKEY_CLASSES_ROOT\txtfile\shell]
  [HKEY_CLASSES_ROOT\txtfile\shell\open]
  [HKEY_CLASSES_ROOT\txtfile\shell\open\command]
  @="NOTEPAD.EXE %1"
  ```
  
+ 双击打开，合并到注册表中

## 添加右键新建 .md文件

+ 打开注册表编辑器，在`计算机>HKEY_CLASSES_ROOT`中，搜索`Typora`，搜索选项只勾选 **项**；

+ 搜索到`计算机\HKEY_CLASSES_ROOT\Applications\Typora.exe`

+ 在任意位置，新建文本文件，后缀为`.reg`，写入以下内容：

  ```shell
  Windows Registry Editor Version 5.00
  [HKEY_CLASSES_ROOT\.md]
  @="Typora.exe"
  [HKEY_CLASSES_ROOT\.md\ShellNew]
  "NullFile"=""
  [HKEY_CLASSES_ROOT\Typora.exe]
  @="Markdown"
  ```

+ 编码选择`Unicode`，保存后双击打开，合并注册到注册表即可

## 桌面右键菜单添加控制面板快捷方式

这个就没什么好说的了，直接创建`.reg`，双击打开合并注册表即可：

```sh
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\DesktopBackground\Shell\ControlPanel]
"MUIVerb"="控制面板"
"SubCommands"="ControlPanel;DeviceManager;Software;Windows.NetworkAndSharing;WindowsSettings;WindowsVersion;RegistryEditor;Windows.RecycleBin.Empty"
"Icon"=hex(2):25,00,73,00,79,00,73,00,74,00,65,00,6d,00,72,00,6f,00,6f,00,74,\
  00,25,00,5c,00,53,00,79,00,73,00,74,00,65,00,6d,00,33,00,32,00,5c,00,69,00,\
  6d,00,61,00,67,00,65,00,72,00,65,00,73,00,2e,00,64,00,6c,00,6c,00,2c,00,2d,\
  00,32,00,37,00,00,00
"Position"="bottom"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\ControlPanel]
@="控制面板"
"Icon"=hex(2):25,00,73,00,79,00,73,00,74,00,65,00,6d,00,72,00,6f,00,6f,00,74,\
  00,25,00,5c,00,53,00,79,00,73,00,74,00,65,00,6d,00,33,00,32,00,5c,00,69,00,\
  6d,00,61,00,67,00,65,00,72,00,65,00,73,00,2e,00,64,00,6c,00,6c,00,2c,00,2d,\
  00,32,00,37,00,00,00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\ControlPanel\command]
"DelegateExecute"="{06622D85-6856-4460-8DE1-A81921B41C4B}"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\DeviceManager]
@="设备管理器"
"ControlPanelName"="Microsoft.DeviceManager"
"Icon"=hex(2):25,00,53,00,79,00,73,00,74,00,65,00,6d,00,52,00,6f,00,6f,00,74,\
  00,25,00,5c,00,73,00,79,00,73,00,74,00,65,00,6d,00,33,00,32,00,5c,00,64,00,\
  65,00,76,00,6d,00,67,00,72,00,2e,00,64,00,6c,00,6c,00,2c,00,2d,00,32,00,30,\
  00,31,00,00,00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\DeviceManager\command]
"DelegateExecute"="{06622D85-6856-4460-8DE1-A81921B41C4B}"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\RegistryEditor]
@="注册表编辑器"
"Icon"="regedit.exe"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\RegistryEditor\command]
@="regedit.exe"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\Software]
@="程序和功能"
"ControlPanelName"="Microsoft.ProgramsAndFeatures"
"Icon"=hex(2):25,00,73,00,79,00,73,00,74,00,65,00,6d,00,72,00,6f,00,6f,00,74,\
  00,25,00,5c,00,73,00,79,00,73,00,74,00,65,00,6d,00,33,00,32,00,5c,00,69,00,\
  6d,00,61,00,67,00,65,00,72,00,65,00,73,00,2e,00,64,00,6c,00,6c,00,2c,00,2d,\
  00,38,00,37,00,00,00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\Software\command]
"DelegateExecute"="{06622D85-6856-4460-8DE1-A81921B41C4B}"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\WindowsSettings]
@="系统设置"
"Icon"=hex(2):25,00,73,00,79,00,73,00,74,00,65,00,6d,00,72,00,6f,00,6f,00,74,\
  00,25,00,5c,00,73,00,68,00,65,00,6c,00,6c,00,33,00,32,00,2e,00,64,00,6c,00,\
  6c,00,2c,00,2d,00,31,00,36,00,38,00,32,00,36,00,00,00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\WindowsSettings\Command]
"DelegateExecute"="{44090B31-CDF9-4ad1-8182-DB5DA3627974}"

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\WindowsVersion]
@="系统版本"
"Icon"=hex(2):69,00,6d,00,61,00,67,00,65,00,72,00,65,00,73,00,2e,00,64,00,6c,\
  00,6c,00,2c,00,2d,00,38,00,31,00,00,00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CommandStore\shell\WindowsVersion\command]
@="winver.exe"
```

