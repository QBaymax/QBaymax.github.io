---
title: css与Pug的对应
date: 2025-11-12 20:24:11
categories: [Program]
tags: [hexo]
diary: false
postDesc: 终于琢磨清楚 hexo 构建 HTML 组件的逻辑了
---
## CSS 与 PUG 的部分对应关系

在用 hexo 编写页面元素时，不可避免要考虑每一个元素的位置，以及该位置处的特效，因此需要同时结合 PUG 的后端处理以及 CSS 的前端调节，这里就以我在调节过程中的经验做一次浅浅的总结。

首先我们的需求是构建如下的一个日记组件：

![image-20251112203039504](image-20251112203039504.png)

这里包含有较多内容，按结构可以做如下划分：

![Snipaste_2025-11-13_20-46-37.png](Snipaste_2025-11-13_20-46-37.png)

因此在 `diaryPostUI.PUG` 文件中，如此层级关系就可以写为：

```
.recent-post-items (from homepage)  //- 多篇日记
    .recent-post-item.diary-item	//- 单篇日记
        .diary-author
        	img.avtor
            .author-meta
            .author-word
        .diary-title
        	.title-meta
			.title-content
	.diary-meta-wrap
		.article-meta
		.article-meta.tags
        .content
        	.content-excerpt
        	.content-full
        .diary-read-more
```

而对应于 `diary.css` 文件的结构即为：

```
.diary-item
	.diary-item .diary-author
		.diary-author .avatar
		.diary-author .auther-meta
			.author-name	(主要层级关系由 diaryPostUI.PUG 定义)
			.author-time	(主要层级关系由 diaryPostUI.PUG 定义)
		.diary-author .author-word
			.author-word-count
	.diary-item .diary-title
		.diary-title .title-meta
			.title-meta .title-content
	.diary-item .diary-meta-wrap
		.article-meta  		(from homepage.styl)
		.article-meta.tags  (from homepage.styl)
	.diary-item .content
		.content-excerpt    (主要层级关系由 diaryPostUI.PUG 定义)
		.content-full		(主要层级关系由 diaryPostUI.PUG 定义)
	.diary-read-more
```

其中 `diary.css` 不绝对定义其层级关系，主要关系还是在 `diaryPostUI.pug` 文件中定义，而 `diary.css` 中则会定义这些组件相对位置的关系，如当 `.author-word-count` 中存在定义 `position: absolute` 时，他会根据其前面最近一次存在定义 `position: relative` 的元素进行定位，这些细节会在设计中产生较大影响。
在生成 html 后，我们可以通过鼠标右键，选择 `检查` 来查看组件的元素关系为：

```
<div class="recent-post-items">
	<div class="recent-post-item diary-item">
		<div class="recent-post-info no-cover">
			<div class="diary-author">
				<img class="avatar" src="/img/profile.jpg" alt="QBaymax">
				<div class="author-meta">
					<span class="author-name">QBaymax</span>
					<span class="author-time">2025-11-12 19:28:33</span></div>
				<div class="author-word">
					<span class="author-word-count">
			<div class="diary-title">
				<div class="title-meta">
					<i class="fas fa-pen-nib" style="margin-right: 4px;">
					<a class="diary-title" title="micro-断舍离">
			<div class="diary-meta-wrap">
			 	<span class="article-meta">
			 	<span class="article-meta tags">
			<div class="content">
				<div class="content-excerpt">这世界真是抽象...</div>
				<div class="content-full" style="display: none;"><p>这世界
			</div><a class="diary-read-more">
	<div class="recent-post-item diary-item">
		<div class="recent-post-info no-cover">
			...
```

将三者对比，即可观察到 PUG 与 CSS 构建 HTML 组件的基本逻辑，具体如何实现就靠函数参数的堆叠了。