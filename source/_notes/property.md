---
title: Android Property
date: 2019-10-10 22:48:43
---
## 基本概念

Android Property （属性系统）是一个Android 系统中重要的进程间通信机制，它允许不同进程之间共享系统配置和状态信息。它以键值对的形式存储数据，类似于一个全局字典，任何进程都可以读取或修改这些属性。

- **键值对**： 属性以键值对的形式存储，键和值都是字符串类型。键通常以 `ro.`、`persist.`、`net.` 等前缀开头，表示属性的类型和作用域。
- **全局访问**： 所有进程都可以访问和修改属性，但权限受到限制。有些属性只能由系统进程修改，而其他属性则可以由应用程序修改。
- **持久化**： 以 `persist.` 开头的属性在设备重启后仍然保留，而其他属性则会丢失。

## 属性的类型

- **`ro.` (read-only)**： 只读属性，通常在系统启动时设置，之后无法修改。例如，`ro.build.version.sdk` 表示 Android SDK 版本。
- **`persist.` (persistent)**： 持久化属性，在设备重启后仍然保留。例如，`persist.sys.timezone` 表示系统时区。
- **`net.` (network)**： 网络相关的属性，例如 `net.hostname` 表示设备的主机名。
- **`sys.` (system)**： 系统相关的属性，例如 `sys.boot_completed` 表示系统启动是否完成。
- **`debug.` (debug)**： 调试相关的属性，例如 `debug.trace.tags` 用于控制调试跟踪。
- **`service.` (service)**： 服务相关的属性。
- **`wlan.` (wlan)**： WLAN 相关的属性。
- **其他**： 没有特定前缀的属性通常是自定义属性，由应用程序或系统组件定义。

## 属性的访问方式

在 Java 代码中，可以使用 `android.os.SystemProperties` 类来访问属性：

```java
// 读取属性
String sdkVersion = SystemProperties.get("ro.build.version.sdk");
// 设置属性 (需要系统权限)
SystemProperties.set("persist.sys.my_property", "my_value");
```

在原生 C/C++ 代码中，可以使用 `property_get` 和 `property_set` 函数来访问属性。
## 进阶

- **属性服务:** 属性系统由一个名为 `init` 的系统进程管理，它维护一个属性存储库，并负责处理属性的读取和修改请求。
- **安全机制:** 属性的访问权限受到 SELinux 的控制，只有拥有相应权限的进程才能修改特定属性。
- **自定义属性:** 应用程序可以定义自己的属性，但这些属性通常只在应用程序内部可见。