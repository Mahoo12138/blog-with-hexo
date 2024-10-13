---
title: Golang 每日一库之 Cobra & Viper
date: 2023-03-04 11:28:23
author: Mahoo12138
tags: 
- Golang
categories:
- 技术教程
---

## 简介

Cobra 是 Go 的 CLI 框架，由 Go [Docker](https://docker.com/), [MongoDB](https://mongodb.com/) 项目成员， [Hugo](https://gohugo.io/) 作者 [spf13](https://github.com/spf13) 创建。

Viper 是适用于 Go 的完整配置解决方案，处理所有类型的配置需求和格式，作者同样是 [spf13](https://github.com/spf13)。

## 安装

```bash
$ go get -u github.com/spf13/cobra
$ go get -u github.com/spf13/viper
```

## 使用

### 代码结构

使用 cobra 的程序通常遵循如下的目录结构：

```
cobra-demo
│  go.mod
│  go.sum
│  main.go
└─cmd
   config.go
   create.go
   serve.go
   root.go
```

在 main.go 文件也有惯例，也就是对 cobra 进行初始化：

```go
import (
	"mahoo/cobra-demo/cmd"
)

func main() {
	cmd.Execute()
}
```

从项目结构中，推荐到做法是，新建一个 cobra 专属的目录或者说包，导出一个函数（常使用 Excute）进行 cobra 初始化。

> 这是手动创建 cobra 程序的步骤，其也提供了生成器 [cobra-cli/README.md at main · spf13/cobra-cli ](https://github.com/spf13/cobra-cli/blob/main/README.md)，用于简化初始化过程。

### 初始化

初始过程中，无需对 cobra 做过多配置，直接使用`rootCmd`创建自己的命令：

```go
var rootCmd = &cobra.Command{
	Use:   "hugo",
	Short: "Hugo is a very fast static site generator",
  	Long: `A Fast and Flexible Static Site Generator built with
           love by spf13 and friends in Go.
           Complete documentation is available at http://hugo.spf13.com`,
  Run: func(cmd *cobra.Command, args []string) {
      fmt.Println(args)
  },
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
```

`rootCmd` 是不调用子命令的基础命令，会执行内部的 Run 函数：

```go
$ go run  .\main.go "test" "demo"
[test demo]
```

`Command`的`Execute`命令，会将所有子命令添加到root命令并适当设置标志 ？？

在 `init()` 可以初始化配置， 可以定义标志并处理：

```go
func init() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.cobra.yaml)")
	rootCmd.PersistentFlags().StringVarP(&projectBase, "projectbase", "b", "", "base project directory eg. github.com/spf13/")
	rootCmd.PersistentFlags().StringP("author", "a", "YOUR NAME", "Author name for copyright attribution")
	rootCmd.PersistentFlags().StringVarP(&userLicense, "license", "l", "", "Name of license for the project (can provide `licensetext` in config)")
	rootCmd.PersistentFlags().Bool("viper", true, "Use Viper for configuration")
	viper.BindPFlag("author", rootCmd.PersistentFlags().Lookup("author"))
	viper.BindPFlag("projectbase", rootCmd.PersistentFlags().Lookup("projectbase"))
	viper.BindPFlag("useViper", rootCmd.PersistentFlags().Lookup("viper"))
	viper.SetDefault("author", "NAME HERE <EMAIL ADDRESS>")
	viper.SetDefault("license", "apache")
}

func initConfig() {
	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		home, err := homedir.Dir()
		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}
		viper.AddConfigPath(home)
		viper.SetConfigName(".cobra")
	}

	 if err := viper.ReadInConfig(); err != nil {
	 	fmt.Println("Can't read config:", err)
	 	os.Exit(1)
	 }
}
```

### 子命令

创建其他子命令时，通常会在 *./cmd*目录下，创建一个单独的文件，例如，我们新建一个 `version` 子命令：

```go
package cmd

import (
  "fmt"
  "github.com/spf13/cobra"
)

func init() {
  rootCmd.AddCommand(versionCmd)
}

var versionCmd = &cobra.Command{
  Use:   "version",
  Short: "Print the version number of Demo",
  Long:  `All software has versions. This is test demo version`,
  Run: func(cmd *cobra.Command, args []string) {
    fmt.Println("test version 0.0.1")
  },
}
```

然后我们可以运行该子命令进行测试：

```bash
$ .\main.exe version
test version 0.0.1
```

### 使用标志

由于标志是在不同位置定义和使用的，我们需要在外部定义一个具有正确作用域的变量，以分配要使用的标志。

在命令的`Run`函数中，我们读取该标志对应的变量，描述特定逻辑。

#### 持久标志

标志可以是 "persistent" 的，这意味着该标志将可用于分配给它的命令以及该命令下的每个子命令。所以，对于全局标志，可将标志分配为根命令上的持久标志。

```go
rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "verbose output")
```

#### 本地标志

也可以在本地分配一个标志，该标志仅适用于该特定命令。

```go
rootCmd.Flags().StringVarP(&source, "source", "s", "", "Source directory to read from")
```

#### 父命令上的本地标志

默认情况下，Cobra 仅解析目标命令上的本地标志，而忽略父命令上的任何本地标志。通过启用 `Command.TraverseChildren`，Cobra 将在执行目标命令之前解析每个命令上的本地标志：

```go
command := cobra.Command{
  Use: "print [OPTIONS] [COMMANDS]",
  TraverseChildren: true,
}
```

#### 用配置绑定标志

还可以将标志与 viper 绑定：

```go
var author string

func init() {
    rootCmd.PersistentFlags().StringVar(&author, "author", "YOUR NAME", "Author name")
    rootCmd.PersistentFlags().Bool("viper", true, "Use Viper for configuration")
    viper.BindPFlag("author", rootCmd.PersistentFlags().Lookup("author"))
    viper.BindPFlag("useViper", rootCmd.PersistentFlags().Lookup("viper"))
}
```

在此示例中，持久标记 `author` 与 viper 绑定。请注意，当用户未提供 `--author` 标志时，变量 `author` 不会设置为 `config` 中的值。

命令执行时，对于没有绑定到变量的标志位，可以通过以下方式读取：

```go
useViper := viper.GetBool("useViper")
```

#### 必需标志

标志默认是可选的。如果想在缺少标志时命令报错，请设置该标志为必需：

```go
var region string

rootCmd.Flags().StringVarP(&region, "region", "r", "", "AWS region (required)")
rootCmd.MarkFlagRequired("region")
```

### 位置和自定义参数

可以使用 Command 的 Args 字段指定位置参数的验证。

下面的验证符是内置的：

- `NoArgs` - 如果有任何位置参数，该命令将报告错误。
- `ArbitraryArgs` - 命令将接受任意参数
- `OnlyValidArgs` - 如果 Command 的 `ValidArgs` 字段中不存在该位置参数，则该命令将报告错误。
- `MinimumNArgs(int)` - 如果不存在至少 N 个位置参数，则该命令将报告错误。
- `MaximumNArgs(int)` - 如果存在超过 N 个位置参数，则该命令将报告错误。
- `ExactArgs(int)` - 如果不存在 N 个位置参数，则该命令将报告错误。
- `ExactValidArgs(int)` - 如果没有确切的 N 个位置参数，或者如果 Command 的 ValidArgs 字段中不存在该位置参数，则该命令将报告并出错。
- `RangeArgs(min, max)` - 如果 args 的数目不在期望的 args 的最小和最大数目之间，则该命令将报告并出错。

内置验证符使用实例：

```go
var cmd = &cobra.Command{
	Use:   "hello",
	Short: "hello",
	Args:  cobra.MinimumNArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Hello, World!")
	},
}
```

当然，也可以设置自定义验证器：

```go
var cmd = &cobra.Command{
  Short: "hello",
  Args: func(cmd *cobra.Command, args []string) error {
    if len(args) < 1 {
      return errors.New("requires at least one arg")
    }
    if myapp.IsValidColor(args[0]) {
      return nil
    }
    return fmt.Errorf("invalid color specified: %s", args[0])
  },
  Run: func(cmd *cobra.Command, args []string) {
    fmt.Println("Hello, World!")
  },
}
```

### 帮助命令

当你添加了子命令，Cobra 会自动添加一些帮助命令，当输入不存在的命令或标志时，则会显示 `usage` 帮助信息；

#### 定义你自己的 help

你可以使用下面的方法提供你自己的 Help 命令或模板。

```go
cmd.SetHelpCommand(cmd *Command)
cmd.setHelpCommand(f func(*Command, []string))
cmd.setHelpTemplate(s string)
```

#### 定义你自己的使用信息

你可以提供你自己的 usage 函数或模板。像 `help` 一样，函数和模板可通过公共方法重写：

```go
cmd.SetUsageFunc(f func(*Command) error)
cmd.SetUsageTemplate(s string)
```

### 版本标志

如果给根命令设置了 `Version` 字段，Cobra 会添加一个顶级的 `--version` 标志。运行带有 `–version` 标志的应用程序，将使用版本模板将版本打印到 stdout。模板可以使用 `cmd.SetVersionTemplate(s string)` 函数自定义。

### PreRun 和 PostRun Hooks

可以在执行命令之前和之后运行一个函数。`PersistentPreRun` 和 `PreRun` 函数将在 `Run` 之前执行。`PersistentPostRun` 和 `PostRun` 会在 `Run` 之后运行。如果子级未声明自己的 `Persistent * Run` 函数，则子级将继承父级的。这些函数的执行顺续如下：

- PersistentPreRun
- PreRun
- Run
- PostRun
- PersistentPostRun

### "unknown command" 时的提示

当 `"unknown command"` 错误发生时，Cobra 会自动打印提示。这和 git 命令的行为一致。比如

```sh
$ hugo srever
Error: unknown command "srever" for "hugo"

Did you mean this?
        server

Run 'hugo --help' for usage.
```

系统会根据注册的每个子命令自动生成建议，并使用[萊文斯坦距離](https://link.juejin.cn?target=https%3A%2F%2Fzh.wikipedia.org%2Fwiki%2F%E8%90%8A%E6%96%87%E6%96%AF%E5%9D%A6%E8%B7%9D%E9%9B%A2)的实现。每个匹配最小距离 2（忽略大小写）的注册命令都将显示为建议。

如果需要禁用建议或在命令中调整字符串距离，请使用：

```go
cmd.DisableSuggestions = true
```

或

```go
cmd.SuggestionsMinimumDistance = 1
```

您还可以使用 `SuggestFor` 属性显式为给定命令设置建议的名称。这样就可以针对不是距离很近的字符串提出建议，但是对于您的命令集和不希望使用别名的命令来说，它们都是有意义的。比如：

```sh
$ kubectl remove
Error: unknown command "remove" for "kubectl"

Did you mean this?
        delete

Run 'kubectl help' for usage.
```

### Viper API  

### AutomaticEnv

通常在 init 函数或`cobra.OnInitialize`回调中，调用`AutomaticEnv`方法绑定全部环境变量，然后可以通过`Get`方法获取：

```go
func initConfig() {
    viper.AutomaticEnv()
}
// ...
fmt.Println("GOPATH: ", viper.Get("GOPATH"))
```

当然也可以单独绑定某个环境变量，可以使用特定类型的 Get 方法进行获取：

```go
viper.BindEnv("port")
viper.GetInt("port")
```

还可以通过`viper.SetEnvPrefix`方法设置环境变量前缀，然后获取时，将自动带上这个前缀。

### Unmarshal

`viper.Unmarshal` 支持将配置项`Unmarshal`导出到一个结构体中，为结构体中的对应字段赋值：

```go
// 设置默认值
viper.SetDefault("mode", "demo")
viper.SetDefault("port", 8081)
// ...
type Profile struct {
    Mode string `json:"mode"`
    Port int `json:"-"`
    Data string `json:"-"`
    DSN string `json:"-"`
    Version string `json:"version"`
}

profile := Profile{}
// 获取并设置配置中的默认值
err := viper.Unmarshal(&profile)
```



