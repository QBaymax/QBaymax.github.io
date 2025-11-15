---
title: Hexo deploy 与 Github Actions 管理博客网页构建
categories:
  - Program
diary: false
tags: [hexo, github]
date: 2025-11-15 11:18:22
postDesc: 终于实现了一种更好的方式去管理源码以及自动化部署网页了，同时可以通过手机登录 github 实现远程上传博客了！
---

事件的起因是这样的：在刚开始用`hexo`部署网页时，我们都是用`hexo d`命令将源代码的部分内容上传到 Github 中的`username.github.io`仓库中，通过 Github 来部署静态网页，但此时发现保存在 Github 仓库中的代码只是一部分，主要就是我们源代码中通过`deploy g`生成的`public`文件夹，里面包含了命令构建好的静态网页的 html 源码，而 Github 也主要根据此来部署静态网页。此时我就会自然有个想法，如果我迁移了电脑，因为仓库只保存了静态网页源码，那我也无法简单的去更改主题或者上传博客，所以我们最起码也需要`source/_post`来支持我们远程上传我们的博客文件，之后等有电脑了再重新生成静态网页，再次部署。但是这样子实在太麻烦了，所以有没有更好的方式去管理源码以及方便的上传博客呢？有啊，当然会有的，那就是 Github 本身支持的一个功能：**Github Actions**。简单来说，**Github Actions**会监测你指定的仓库是否存在上传动作，一旦发现有 Action，就会触发下一步你指定的命令，比如重新自动生成静态网页并部署，这就非常的 nice 了！

那么接下来我就以我外行的粗略理解配合 AI，来展示使用 **Github Actions** 的具体方法。

## Hexo 部署静态网页流程

### Hexo 的部分基础命令
首先我们还是先回顾一下通过 `hexo` 部署网页的基本流程，首先是第一个清除命令，清除之前生成的一些缓存文件，这还是非常有必要的：

```bash
hexo clean
hexo cl   // 简化命令
```

之后就是生成部署静态网页的 html 源码：

```bash
hexo generate
hexo g          // 简化命令
hexo g --debug  // debug 命令
```

在生成静态网页后，我们可以通过预览模式检查生成的效果：

```bash
hexo server
```

在检查完毕后，即可将生成的静态网页代码上传到 Github 上，部署静态网页：

```bash
hexo deploy
hexo d   // 简化命令
```

那么这个`hexo d`命令执行过程具体发生了什么事情呢？我们是否可以通过该命令直接上传所有源代码到仓库中？

### `hexo d` 的工作原理

当你执行 `hexo deploy` 或 `hexo d` 时，Hexo 实际上执行了以下步骤：

```
# 简化的执行流程
hexo d → 读取 _config.yml 部署配置 → 执行对应的部署插件 → 上传文件
```

首先，需要在 `_config.yml` 中配置部署信息

```
# _config.yml
deploy:
  type: git
  repo: https://github.com/your-username/your-username.github.io.git
  branch: main
  message: "Site updated: {{ now('YYYY-MM-DD HH:mm:ss') }}"
```

执行时的具体步骤：

1. 读取配置：Hexo 读取 `_config.yml` 中的 `deploy` 配置

2. 调用部署插件：根据 `type: git` 调用 `hexo-deployer-git` 插件

3. 准备部署文件：

   - 插件会进入 `public` 目录（由 `hexo g` 生成）
   - 初始化一个临时的 Git 仓库

4. 执行 Git 操作：

   ```
   # 插件在后台执行的类似命令
   cd public
   git init
   git add .
   git commit -m "Site updated: 2024-01-01 12:00:00"
   git push -f https://github.com/your-username/your-username.github.io.git main
   ```

5. 清理临时文件：删除临时 Git 仓库信息

6. Github 仓库中 `Settings` 页面的 `Pages` 中的 **Deploy from a branch** 监测到 branch 的变化，根据其中的静态文件重新构建静态网页。

### 关键特点

- 只上传构建结果：`hexo d` 只上传 `public` 目录下的静态文件（HTML、CSS、JS等）
- 强制推送：使用 `git push -f` 强制覆盖目标仓库，因为临时仓库没有历史记录
- 独立进程：部署过程与你的源码仓库完全分离

### 为什么不能直接用 `hexo d` 上传所有源代码？

1. 插件设计初衷：

   ```
   # hexo-deployer-git 插件的设计目标很明确：
   # 只部署 public/ 目录到指定的 Git 仓库
   # 它不是全仓库同步工具
   ```

2. Git 历史问题：

   ```
   # hexo-deployer-git 的工作方式：
   # 1. 在 public/ 目录初始化新 Git 仓库
   # 2. 强制推送到远程（没有历史记录）
   
   # 如果你推送整个项目：
   # 1. 你的源码 Git 历史会被强制覆盖
   # 2. 丢失所有提交记录
   # 3. 团队协作时会破坏其他人的工作
   ```



##  拥抱自动化：GitHub Actions 工作流

GitHub Actions 允许你在仓库中直接创建自定义的自动化工作流（Workflow）。对于 Hexo 博客，我们可以配置一个工作流：**当你将博客的源代码（包括 Markdown 文章、主题配置文件等）推送到仓库的特定分支（如 `main` 或 `gh-pages`）时，Actions 会自动在一个纯净的虚拟环境中完成构建，生成静态网页文件，并部署到 GitHub Pages。**

这完美解决了你的核心痛点：

- 源码安全与便携：所有源代码（如 `source/_posts` 里的文章、主题文件、站点配置文件 `_config.yml`）都完整地保存在 GitHub 仓库中。无论在哪台电脑，你只需要 `git clone` 拉取代码即可开始写作或修改。
- 解放本地环境：你不再需要在新电脑上重新配置 Node.js 环境或安装 Hexo 及其插件，因为构建过程在 GitHub 的服务器上完成。
- 简化发布流程：发布新文章时，你只需要将写好的 Markdown 文件推送到 GitHub，剩下的构建和部署工作全部自动化。

下面是具体的实现步骤。

## 迁移到 GitHub Actions 工作流

### 第一步：准备你的代码仓库

1. 创建源码仓库：在你的 GitHub 账户下创建一个新的仓库（例如 `my-hexo-blog`），专门用于存放 Hexo 博客的**完整源代码**。(可以依然保留用于 `hexo d` 的分支仓库，以方便自己突然想切换回去。)

2. 推送本地源码：进入你本地的 Hexo 博客根目录，初始化 Git 并将其与刚创建的远程仓库关联，然后将所有文件推送上去。

```
cd your-hexo-blog
git init
git remote add origin https://github.com/your-username/your-username.github.io
git add .
git commit -m "初始提交：完整的Hexo源码"
git push -u origin my-hexo-blog  # 假设你所创建的分支是 my-hexo-blog
```

> **注意**：请确保 `.gitignore` 文件中包含 `public/` 和 `node_modules/`，这些不需要上传。这里可能还会遇到一个问题，即子模块的上传，如原通过 `hexo d` 生成的 `.deploy_git`文件以及通过 GitHub 下载的主题如 butterfly 中的 `.git` 文件，这些的存在都会导致 Github Actions 出现编译失败的情况。建议是将 `.deploy_git` 文件也放入 `.gitignore` 文件中，以及删除主题文件中的 `.git` 文件，将其转为普通文件，这样方便我们在其他电脑也可以编辑主题。当然如果有更好的方法，如 `.gitmodular`，自然更好，但我并没有进一步研究。


### 第二步：配置 GitHub Pages 源

1. 进入你的 **GitHub Pages 仓库**（即 `username.github.io` 那个仓库）。

2. 进入 "Settings" -> "Pages"，这里即为部署静态网页的核心地。

3. 在 "Source" 部分，**选择 "GitHub Actions"** 作为新的发布源 (另一个 **Deploy from a branch** 即为通过`hexo d`编译时需要的选择)。


### 第三步：创建 GitHub Actions 工作流文件

这是最关键的一步。在你的**源码仓库**（`my-hexo-blog`）中，点击 `Add file` 手动创建以下目录和文件：`.github/workflows/pages.yml`。

将以下 YAML 配置内容复制到 `pages.yml` 文件中。这个配置定义了自动化构建和部署的流程：

```
name: Pages # 这个工作流的名称

on:
  push:
    branches:
      - my-hexo-blog  # 指定当推送到 'main' 分支时触发此工作流

jobs:
  build: # 定义一个名为 build 的任务
    runs-on: ubuntu-latest # 在最新的 Ubuntu 系统上运行
    steps:
      - name: Checkout # 步骤1：拉取仓库代码
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          submodules: recursive  # 如果主题是子模块，递归拉取

      - name: Setup Node.js # 步骤2：设置 Node.js 环境
        uses: actions/setup-node@v4
        with:
          node-version: "20" # 请确保此版本与你本地使用的 Node.js 主要版本兼容

      - name: Setup npm cache # 步骤3：缓存 npm 依赖，加速后续构建
        uses: actions/cache@v4
        with:
          path: node_modules
          key: ${{ runner.OS }}-npm-cache-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.OS }}-npm-cache-

      - name: Install dependencies # 步骤4：安装项目依赖
        run: npm install

      - name: Build # 步骤5：执行 hexo generate 生成静态文件
        run: npm run build # 或直接运行 `npx hexo generate`

      - name: Upload artifact # 步骤6：将生成的 public 目录打包
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy: # 定义一个名为 deploy 的任务
    needs: build # 它依赖于 build 任务的成功完成
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages # 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

*配置说明基于 Hexo 官方文档和社区实践*



### 第四步：开启全新的写作与发布流程

完成以上配置后，你的工作流将彻底改变：

1. **写作**：在本地用你喜欢的编辑器写好 Markdown 文章，放在 `source/_posts`。

2. **提交**：使用 Git 或者使用可视化的 Github Desktop 软件将更改推送到 GitHub 源码仓库。

   ```
   git add .
   git commit -m "发布新文章：《我的自动化博客之旅》"
   git push origin my-hexo-blog
   ```

3. **自动化**：推送完成后，GitHub Actions 会自动开始工作。你可以在仓库的 "Actions" 标签页下实时查看构建日志。

4. **查看结果**：几分钟后，你的博客（`https://username.github.io`）就会自动更新。你无需手动执行 `hexo g` 或 `hexo d`。

### 开启手机发布博客
在完成 Github Actions 的部署后，因为只要检测到关联仓库发生了一次提交，就会重新部署网页，所以我们可以通过手机上的 edge 浏览器直接登录 github，直接编辑仓库中source/_post 文件夹中的博客文件，然后提交，就实现了手机发布博客的功能，真的是非常方便了，如果觉得麻烦的，也可以下载 Git hub mobile 软件，可能会更方便吧。

如此便完成了通过 **Github Actions** 自动化构建静态网页，以及源码的管理两个主要目的。当然我们依然还可以通过 `hexo server` 命令在本地进一步快速调整网页的布局等问题。综上所述，`hexo d` 与 `git` 同是上传代码的两种方式，但是二者的设计目的并不相同，`hexo d` 的设计初衷就是为了上传静态网页所需的基本文件，并非用于上传源文件等内容，而 `git` 命令的初衷则是上传管理源文件内容，因此我们需要将二者区分开来，不可混用，以防造成更多的混乱。
