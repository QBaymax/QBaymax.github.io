// scripts/diary-calendar.js
hexo.extend.filter.register('template_locals', function(locals) {
  // 获取所有文章，不再筛选diary属性
  const allPosts = locals.site.posts;
  console.log('allPosts:', allPosts);
  const postStats = {};
  
  console.log(`开始统计文章数据，总共 ${allPosts.length} 篇文章`);
  
  allPosts.forEach(post => {
    if (post.date) {
      const date = post.date.format('YYYY-MM-DD');
      postStats[date] = (postStats[date] || 0) + 1;
      console.log(`文章 "${post.title}" - 日期: ${date}`);
    }
  });
  
  console.log('文章统计结果:', postStats);
  locals.diaryCalendar = postStats; // 保持变量名不变，但内容改为所有文章
  return locals;
});