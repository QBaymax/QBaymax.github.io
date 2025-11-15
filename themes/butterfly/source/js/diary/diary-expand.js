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
    // 保存当前滚动位置
    const scrollY = window.scrollY;
    const itemTop = diaryItem.getBoundingClientRect().top + scrollY;
    
    // 收起内容动画
    fullContent.style.opacity = '0';
    fullContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      excerpt.style.display = 'block';
      fullContent.style.display = 'none';
      button.innerHTML = '阅读更多 <i class="fas fa-chevron-down" style="margin-left: 5px;"></i>';
      
      // 检查是否需要滚动
      const currentRect = diaryItem.getBoundingClientRect();
      const isOutOfView = currentRect.top < 0 || currentRect.bottom < window.innerHeight * 0.3;
      
      if (isOutOfView) {
        // 计算目标滚动位置（元素顶部 - 一些边距）
        const targetScroll = itemTop - 20; // 20px 边距
        
        // 平滑滚动
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }, 300);
  }
}