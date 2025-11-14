function toggleDiaryReadMore(button) {
  const diaryItem = button.closest('.diary-item');
  const excerpt = diaryItem.querySelector('.content-excerpt');
  const fullContent = diaryItem.querySelector('.content-full');
  const icon = button.querySelector('i');
  
  if (fullContent.style.display === 'none') {
    // 展开完整内容
    excerpt.style.display = 'none';
    fullContent.style.display = 'block';
    
    // 更新按钮文本和图标
    button.innerHTML = '收起内容 <i class="fas fa-chevron-up" style="margin-left: 5px;"></i>';
    
    // 添加展开动画
    fullContent.style.opacity = '0';
    fullContent.style.transform = 'translateY(10px)';
    
    // 使用requestAnimationFrame确保样式应用
    requestAnimationFrame(() => {
      fullContent.style.transition = 'all 0.3s ease';
      fullContent.style.opacity = '1';
      fullContent.style.transform = 'translateY(0)';
    });
    
    // 初始化完整内容中的元素
    initDiaryContent(fullContent);
    
  } else {
    // 收起内容
    fullContent.style.opacity = '0';
    fullContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      excerpt.style.display = 'block';
      fullContent.style.display = 'none';
      button.innerHTML = '阅读更多 <i class="fas fa-chevron-down" style="margin-left: 5px;"></i>';
    }, 300);
  }
}

// 初始化日记内容中的特殊元素
function initDiaryContent(container) {
  // 处理代码块高亮
  const codeBlocks = container.querySelectorAll('pre code');
  codeBlocks.forEach(block => {
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(block);
    }
  });
  
  // 处理图片懒加载
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.loading) {
      img.loading = 'lazy';
    }
    // 确保图片样式正确
    if (!img.style.maxWidth) {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
  });
  
  // 处理表格响应式
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    if (!table.parentElement.classList.contains('table-container')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-container';
      wrapper.style.overflowX = 'auto';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 为所有日记内容预初始化
  const diaryContents = document.querySelectorAll('.content-full');
  diaryContents.forEach(content => {
    initDiaryContent(content);
  });
});

// 处理图片加载错误
document.addEventListener('error', function(e) {
  if (e.target.tagName === 'IMG' && e.target.closest('.diary-item')) {
    e.target.src = '/images/error-image.png'; // 替换为您的错误图片路径
  }
}, true);