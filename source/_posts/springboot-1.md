---
title: SprintBoot实战笔记
date: 2022-12-21 22:12:43
author: Mahoo12138
tags: 
- SprintBoot
categories:
- 学习笔记
---


## 基础前置知识

+ **spring-boot-starter-parent**：Spring Boot 的版本仲裁中心，控制了所有依赖的版本号；
+ **spring-boot-starter**：Spring Boot 的核心启动器，包含了自动配置、日志和YAML等；

+ **spring-boot-starter-web**：spring-boot-starter 的超集，基于 web 的场景额外引入了 web 模块开发需要的相关 jar 包；

+ **spring-boot-starter-jdbc**：基础的 Spring 抽象类，包括 `DataSource` 等；

+ **spring-boot-starter-data-jdbc**：除了基础的数据库连接功能，还额外提供了 `CrudRepository`等；

### 初始化项目

`Edit Starters` 插件可对已有的项目重新生成 `pom.xml` 的依赖项：

+ 安装，**generate**，**Edit Starter**；

### 项目依赖

+ **Lombok**：简化 Java 代码，使用注解省略 getter、setter、equals等方法；

+ **Hutool**：一个小而全的 Java 工具类库；

#### 数据库连接

```xml
```



```yaml
datasource:
    driver-class-name: org.postgresql.Driver
    url: jdbc:postgresql://localhost:5432/hippus
datasource:
	# deprecated
    driverClassName: com.mysql.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/hippus
```



### 开发插件

+ **MybatisX**：

### 启动项目

**Please sign in**：集成 SpringSecurity 依赖后，其中包括*SecurityAutoConfiguration*类 - 包含**初始/默认安全配置**：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

默认情况下，应用程序将启用基本身份验证。有一些预定义的属性，例如：

```
security.user.name=user
security.basic.enabled=true
```

启动应用程序，我们会注意到默认密码是随机生成的并打印在控制台日志中；

我们可以排除*SecurityAutoConfiguration*类，取消安全性自动配置并添加我们自己的配置：

```kotlin
@SpringBootApplication(exclude = [SecurityAutoConfiguration::class])
class HippusApplication
```

或者通过在application.properties文件中添加一些配置：

```
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.SecurityAutoConfiguration
```

### 代码开发

#### 常见注解

+ **ResponseBodyAdvice**：拦截 Controller 方法的返回值，处理返回值，一般用来统一返回格式，加解密，签名等等；



#### 自定义注解

+ **@Target**：描述注解修饰的对象范围，枚举规定了范围；
+ **@Retention**：定义该注解被保留时间长短；
+ **@Inherited**：标识某个被标注的类型是被继承的；
+ **@Documented**：用于描述其它类型的 annotation 应该被作为被标注的程序成员的公共API；
