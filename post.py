# %%
# create-post.py
import os
from datetime import datetime

def create_post(title, content, tags=None):
    if tags is None:
        tags = []
    
    # 生成文件名
    ftitle = datetime.now().strftime("post-%Y-%m-%d-%H%M%S") + "-" + title
    filename = ftitle.lower().replace(' ', '-') + '.md'
    filepath = os.path.join('source', '_posts', filename)
    
    # 构建文章内容
    post_content = f"""---
title: {title}
date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
categories: [Program]
tags: [{', '.join(tags)}]
---

{content}
"""
    
    # 使用UTF-8编码写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(post_content)
    
    print('✅ 文章已创建:', filepath)
    print('📝 内容预览:')
    print('---')
    preview_lines = content.split('\n')[:5]  # 显示前5行
    for line in preview_lines:
        print(line)
    if len(content.split('\n')) > 5:
        print('...')

def get_multiline_input(prompt):
    """获取多行输入，以空行结束"""
    print(prompt)
    print("请输入内容（输入空行结束）:")
    lines = []
    while True:
        try:
            line = input()
            if line == '':
                break
            lines.append(line)
        except EOFError:
            break
    return '\n'.join(lines)

if __name__ == "__main__":
    print("📝 Hexo 文章创建工具")
    print("=" * 30)
    
    # 获取标题
    title = input("请输入文章标题: ").strip()
    if not title:
        print("❌ 标题不能为空")
        exit(1)
    
    # 获取内容（多行）
    content = get_multiline_input("")
    
    # 获取标签
    tags_input = input("请输入标签（用逗号分隔，直接回车跳过）: ").strip()
    tags = [tag.strip() for tag in tags_input.split(',')] if tags_input else []
    
    create_post(title, content, tags)