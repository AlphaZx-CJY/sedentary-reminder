#!/usr/bin/env python3
"""
创建 Microsoft Edge 商店所需的 300x300 图标
"""

from PIL import Image, ImageDraw

def create_store_icon():
    # 创建 300x300 的图标
    size = 300
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆形背景（健康绿）
    margin = 15
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(76, 175, 80, 255)  # #4CAF50
    )
    
    # 绘制人形图标（白色）
    center_x, center_y = size // 2, size // 2
    head_radius = 55
    
    # 头部 - 圆形
    draw.ellipse([
        center_x - head_radius, center_y - 70,
        center_x + head_radius, center_y - 70 + head_radius * 2
    ], fill=(255, 255, 255, 255))
    
    # 身体 - 圆角矩形
    body_width = 80
    body_height = 100
    draw.rounded_rectangle([
        center_x - body_width // 2, center_y - 15,
        center_x + body_width // 2, center_y + 85
    ], radius=20, fill=(255, 255, 255, 255))
    
    # 保存
    img.save('store-icon-300.png')
    print('✅ 商店图标已创建: store-icon-300.png (300x300)')
    print('📦 请将此文件用于 Microsoft Edge 商店提交')

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('❌ 需要安装 Pillow: pip3 install Pillow')
        exit(1)
    
    create_store_icon()
