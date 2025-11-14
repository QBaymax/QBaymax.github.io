# create-post.py
import sys
import os
from datetime import datetime

def create_post(title, content, tags=None):
    if tags is None:
        tags = []
    
    # 生成文件名
    filename = title.lower().replace(' ', '-') + '.md'
    filepath = os.path.join('source', '_posts', filename)
    
    # 构建文章内容
    post_content = f"""---
title: {title}
date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
categories: [日记]
tags: [{', '.join(tags)}]
diary: true
---

{content}
"""
    
    # 使用UTF-8编码写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(post_content)
    
    print('✅ 文章已创建:', filepath)
    print('📝 内容预览:')
    print('---')
    preview_lines = content.split('\n')[:3]
    for line in preview_lines:
        print(line)
    print('...')

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Usage: python diary.py "标题" "内容" [标签]')
        print('Example: python diary.py "我的日记" "今天很开心" "日常,心情"')
        print('Example: python diary.py "学习笔记" "学习了Python编程" "编程,学习"')
        sys.exit(1)
    
    title = sys.argv[1]
    content = sys.argv[2]
    tags = sys.argv[3].split(',') if len(sys.argv) > 3 else []
    
    create_post(title, content, tags)