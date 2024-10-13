---
title: TypeScript学习-02-实战爬虫开发
date: 2021-11-23 15:45:15
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/typescript.jpg
categories: 
- 学习笔记
tags:
- TypeScript
---

## 初始化项目

新建一个文件夹用于爬虫项目实战，并在目录下执行命令初始化项目：

```bash
npm init -y	# 初始化npm配置文件，使用默认值
tsc --init	# 初始化 typescript 转译配置文件
```

同样也需要将编译运行的模块包安装到项目目录：

```bash
npm install typescript ts-node -D
```

新建`src`目录，在目录下，新建`crowller.ts`作为爬虫的入口文件，编辑`package.json`，添加一条执行命令：

```json
"scripts":{
    "dev": "ts-node ./src/crowller.ts"
}
```

## 使用 superagent

安装 SuperAgent 和对应的 .d.ts 文件：

```bash
npm install superagent --save
npm install @types/superagent -D
```

> 要使用一个外部JavaScript库或是新的API时，需要用一个声明文件（.d.ts）来描述这个库的结构

创建爬虫类，添加必要的必要的 url 参数，并编写获取 html 页面的函数：

```typescript
class Crowller{
    private url = "http://xxx.com/data"
    
    async getRawHtml(){
        const result = await superagent.get(this.url);
        return result.text;
    }
}
```

## 使用 cheerio

安装的过程类似与 superagent，编写使用 cheerio 解析页面的函数：

```typescript
getCourseInfo(html:string){
    const $ = cheerio.load(html);
    const courseItem = $('.course-item');
    const courseInfos = [];
    courseItem.map((index,element) => {
        const desc = $(element).find('.course-desc');
        const title = desc.eq(0).text();
        const count = parseInt(desc.eq(1).text().split('：')[1], 10);
  		courseInfos.push({
            title,
            count
        });
    });
    return {
        time: new Date().getTime(),
        data: courseInfos
    }
}
```

这里可以给 Course 结构和 getCourseInfo函数返回的内容创建类型，增加代码的健壮性：

```typescript
interface Course {
    title: string,
    count: number
}
interface CourseResult {
    time: number,
    data: Course[]
}
const courseInfos:Course[] = [];
```

## 使用 fs & path

爬取到相应的数据后，我们想要将数据存取到本地的`./data/course.json`文件内，先引入所需要的模块：

```typescript
import fs from 'fs'
import path from 'path'
```

首先，要思考我们以怎样的格式存储爬取的数据，这里可以时间戳也就是 number 类型作为键，Course 数组作为值，于是可简单构造一个类型：

```typescript
interface Content {
    [propsName: number]: Course[]
}
```

其次，编写一个函数，用于将 json 数据转换为字符串并写入文件：

```typescript
generateJsonContent(courseInfo: CourseResult){
    const filePath = path.resolve(__dirname, '../date/course.json');
    let fileContent: Content = {};
    if(fs.existsSync(filePath)){
        fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    fileContent[courseInfo.time] = courseInfo.data;
    fs.writeFileSync(filePath, JSON.stringify(fileContent));
}
```

## 代码逻辑优化

编写了三个函数后，我们可在构造函数内，调用新创建的爬虫过程函数，该函数仅是对各个逻辑进行了联合，完成爬取数据：

```typescript
async initCrowllerProcess(){
    const result = await this.getRawHtml();
    const courseInfo = this.getCourseInfo(result);
    this.generateJsonContent(courseInfo);
}
constructor(){
    this.initCrowllerProcess();
}
```

之后，我们可对现有代码进行了优化：

+ 将 filePath 作为爬虫类 Crowller 的私有变量，使用时用`this.`调用；
+ 将写文件内容单独抽离为函数：`writeDataFile(content: string){}`

到此为止，爬虫的基本功能都完成了，但是，这个爬虫目前只能是爬取特定的一个 URL 下的内容，而且我们注意到，在`initCrowllerProcess()`函数内的爬取页面的逻辑基本上类似，于此，我们可以组合设计模式进行代码的优化，将爬取页面的具体逻辑抽离出去，爬虫内只是爬虫整体的逻辑：

既然是针对不同的页面爬取数据，那么就必须有相同的接口设计，供爬虫类调用，所以可以创建一个`Analyzer`接口，并导出：

```typescript
export interface Analyzer{
  analyze: (html:string, filePath:string) => string
}
```

新建一个`pageAnalyzer.ts`文件，把具体对页面分析的功能都放到该文件中：

```typescript
export default class MyAnalyzer implements Analyzer {
  analyze(html: string,filePath:string) {
    const courseInfo: CourseResult = this.getCourseInfo(html);
    return this.generateJsonContent(courseInfo,filePath);
  }
  private getCourseInfo(html: string) {/*...*/}
  private generateJsonContent(courseInfo: CourseResult, filePath: string) {/*...*/}
}
```

对应着的，Crowller 类中的代码只需稍做修改，也就是把封装了爬取逻辑的 Analyzer 传入，并调用其`analyze`方法即可：

```typescript
constructor(private analyzer:Analyzer) {
    this.initCrowllerProcess();
}
async initCrowllerProcess() {
    const content = this.analyzer.analyze(result, this.filePath);
    // ...
}
```

还有一点即爬取的 URL ，可以将其放在 Analyzer 里，也可以单独拿出来作为一个变量，这样优化，若我们想爬取不同的页面的数据，只需提供不同的 Analyzer，将其与 Crowller 爬虫类进行组合就行了，这样的设计模式被称为**组合设计模式**。

另外，我们注意到 MyAnalyzer 这样的封装了爬取逻辑的类是固定的，没必要实例化多个，所以可以采取单例模式进行优化：

```typescript
private static instance:MyAnalyzer;
static getInstance(){
    if(!MyAnalyzer.instance){
        MyAnalyzer.instance = new MyAnalyzer()
    }
    return MyAnalyzer.instance;
}
private constructor(){}
```

## 项目配置补充

当我们在编写和调试代码时，使用的都是最初初始化项目时使用的`npm run dev`配置的`ts-node ./src/crowller.ts`指令，而 typescript 的代码并不能在 node 或者浏览器环境执行，我们编写的代码还是要转译为 js 代码的，所以我们在`package.json`文件中添加新的指令：

```json
"scripts": {
    "dev": "ts-node ./src/crowller.ts",
    "build": "tsc -w",
}
```

`tsc` 指令是将自动将 typescript 代码转译成 js 代码，`-w` 参数是实时监控着代码的变动即刻转译，当然我们还需要指定转译文件的目标路径，不然即在源文件路径下，`tsconfig.json` 文件中的`outDir`属性决定了转译生成的路径，可自行设定，如`./build`；

到这仅是自动生成了 js 文件，如果要自动运行也是有办法的，安装下面的模块：

```bash
npm install nodemon -D
```

之后，再配置一个运行命令用于检测生成的 js 文件：

```json
"scripts": {
    "start": "nodemon node ./build/crowller.js"
}
```

当执行的时候，我们会发现，该指令似乎一直在循环执行，这是因为爬虫程序一直在更新数据文件，nodemon 检测到文件变动后，又会继续运行爬取操作，查询文档可发现解决方案，只需在`package.json`中将数据路径设置为忽略项：

```json
"nodemonConfig": {
    "ignore": ["data/*"]
},
```

通过上述操作，我们已经完成了自动监测`.ts`文件变化自动转译为`.js`，且检`.js`文件变化，自动运行 js 的整个过程，但是完成整个操作是需要两个命令行窗口的，我们还可以进一步配置：

安装模块`npm install concurrently -D`，重新编辑`package.json`文件：

```json
"scripts": {
    "dev:build": "tsc -w",
    "dev:start": "nodemon node ./build/crowller.js",
    "dev": "concurrently npm:dev:*"
}
```

> `npm:dev:*`是对`npm run dev:build`和`dev:start`的简写和匹配；

最后，当我们执行`npm run dev`就可以一步到位了。
