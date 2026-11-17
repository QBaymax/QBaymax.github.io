'use strict';

const pagination = require('hexo-pagination');

// 覆盖默认的 index 生成器
hexo.extend.generator.register('index', function(locals) {
  const config = this.config;
  
  // 过滤 diary 文章
  const filteredPosts = locals.posts.filter(post => !post.diary)
    .sort(config.index_generator.order_by);
  
  const paginationDir = config.pagination_dir || 'page';
  const path = config.index_generator.path || '';

  return pagination(path, filteredPosts, {
    perPage: config.index_generator.per_page,
    layout: ['index', 'archive'],
    format: paginationDir + '/%d/',
    data: {
      __index: true
    }
  });
}, 1); // 设置较高优先级，覆盖默认生成器