#!/usr/bin/env python3
"""
基于现有 icons/icon128.png 生成 Microsoft Edge 商店所需的 300x300 图标
保持原有设计风格，放大到 300x300
"""

from PIL import Image

def create_store_icon():
    # 打开现有的 128x128 图标
    try:
        original = Image.open('icons/icon128.png')
        print(f'📂 已加载: icons/icon128.png ({original.size[0]}x{original.size[1]})')
    except FileNotFoundError:
        print('❌ 未找到 icons/icon128.png，使用程序生成')
        return create_from_scratch()
    
    # 转换为 RGBA 模式（如果不是）
    if original.mode != 'RGBA':
        original = original.convert('RGBA')
    
    # 放大到 300x300，使用高质量插值
    store_icon = original.resize((300, 300), Image.Resampling.LANCZOS)
    
    # 保存
    store_icon.save('store-icon-300.png', 'PNG')
    print('✅ 商店图标已创建: store-icon-300.png (300x300)')
    print('🎨 基于: icons/icon128.png')
    print('📐 尺寸: 300x300 (Edge 商店要求)')


def create_from_scratch():
    """如果没有现有图标，使用原有风格生成"""
    from PIL import ImageDraw
    
    size = 300
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 颜色定义 - 与原图标一致
    primary_green = (76, 175, 80)      # #4CAF50
    white = (255, 255, 255)
    
    # 绘制圆形背景
    margin = 15
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=primary_green
    )
    
    # 中心坐标
    cx, cy = size // 2, size // 2
    
    # 绘制人形图标（与原图标风格一致）
    # 头部 - 圆形
    head_radius = 55
    draw.ellipse([
        cx - head_radius, cy - 70,
        cx + head_radius, cy - 70 + head_radius * 2
    ], fill=white)
    
    # 身体 - 圆角矩形
    body_width = 70
    body_height = 90
    draw.rounded_rectangle([
        cx - body_width // 2, cy - 10,
        cx + body_width // 2, cy - 10 + body_height
    ], radius=20, fill=white)
    
    # 保存
    img.save('store-icon-300.png')
    print('✅ 商店图标已创建: store-icon-300.png (300x300)')
    print('🎨 设计: 与原图标风格一致')


if __name__ == '__main__':
    try:
        from PIL import Image
    except ImportError:
        print('❌ 需要安装 Pillow: pip3 install Pillow')
        exit(1)
    
    create_store_icon()
