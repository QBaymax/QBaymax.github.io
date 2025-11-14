---
title: 调试 Hexo 的基础方法
date: 2025-11-11 23:30:18
categories: Program  # 将文章归入“日记”分类
tags: [hexo]  # 为文章添加标签
diary: false
postDesc: Butterfly 主题的基本结构以及 hexo 的 debug 方式，废了牛鼻子劲了
---

## 总结一下今日调试 Hexo 的基础方法

### 首先是 Hexo/butterfly 的基本结构

- butterfly
  - layout
    - includes
      - head (定义页面<head>部分，引入 CSS/JS 等)
      - header (定义页面顶部区域，如导航栏)
      - mixins
        - article-sort.pug (提供文章排序列表的通用混合宏)
        - indexPost.pug (首页 Home 文章列表的渲染逻辑)
      - page
        - 404.pug
        - categories.pug (分类页面具体实现)
        - default-page.pug (未特殊布局页面的默认样式)
        - tags.pug (标签页面具体实现)
      - layout.pug (基础页面骨架，定义全局结构)
    - archive.pug (放在 includes 同级是为了调用最基础的主题: layout.pug)
    - category.pug
    - index.pug (博客首页 Home 布局)
    - page.pug (通用页面（如 archive、tags）布局)
    - post.pug (单篇博客文章布局)
    - tag.pug
  - scripts
  - source

具体而言，`layout.pug`：这是所有页面的根基，使用 Pug 的 `block` 语法（如 `block content`）预留可替换区域，确保全站风格统一。

`index.pug`, `post.pug`, `page.pug`：这些是主要页面类型的布局入口。它们通过 `extends` 指令继承 `layout.pug`，并在相应的 `block` 中填充专属内容。例如，`post.pug` 就用于定义单篇博客文章的布局。

`archive.pug`、`category.pug` 和 `tag.pug` 通常也继承基础布局 `layout.pug`，分别处理按时间归档、按分类展示和按标签展示文章的页面。

`includes/head.pug` 与 `includes/header.pug`：这是公共组件，被多个布局文件引入。`head.pug` 管理全局资源；`header.pug` 则包含导航栏等顶部公共元素，其中的逻辑（如判断是否为首页 is_home() 或文章页 is_post()）常被用于控制顶部图片的显示

`includes/mixins/` 目录下的文件：这里的文件定义了 **可复用的Pug混合宏** (Mixin)。例如，`indexPostUI.pug` 包含渲染首页文章列表的混合宏；`article-sort.pug` 则提供一个通用的文章列表渲染宏，用于分类、标签等页面。

`includes/page/` 目录下的文件：这些文件通常由对应的页面布局（如 `page.pug`）根据页面类型（type）引入，以实现特定功能。例如，当页面 type 为"tags"时，会引入 `tags.pug` 来渲染标签云。

### hexo 的 debug 方式

由于Pug模板需Hexo渲染，直接设断点不行，但可以通过其他方式输出和检查信息。通过控制台输出调试是最方便的方法，通过在模板中插入代码来实现输入中间变量值：

```js
mixin diaryPostUI()
  //- 调试代码开始
  - console.log('=== 调试日记文章 ===')
  - console.log('全部文章数量:', site.posts.length)
  - const diaryPosts = site.posts.filter(post => post.diary).sort('-date')
  - console.log('筛选出的日记文章数量:', diaryPosts.length)
  - console.log('日记文章标题:', diaryPosts.map(post => post.title))
  - console.log('所有文章的diary属性:', site.posts.map(post => { return { title: post.title, diary: post.diary } }))
  //- 调试代码结束
  
  //- ... 其余原有代码 ...
```

如上已经插入了调控代码，之后我们只需要在终端运行命令即可看到输出信息：

```bash
hexo cl
hexo g --debug
```

观察终端输出。通过`--debug`参数，Hexo会输出更详细的日志，添加的`console.log`信息也会显示出来，以此检查代码逻辑是否存在问题。