#!/usr/bin/env python3
"""
创建 Microsoft Edge 商店所需的 300x300 图标
设计：扁平化风格，简洁的"久坐提醒"主题
"""

from PIL import Image, ImageDraw

def create_store_icon():
    size = 300
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 颜色定义 - 健康绿色系
    primary_green = (76, 175, 80)      # #4CAF50 - 主背景色
    dark_green = (46, 125, 50)         # #2E7D32 - 深色点缀
    white = (255, 255, 255)            # 白色 - 人物和椅子主体
    light_green = (200, 230, 201)      # #C8E6C9 - 椅子浅色部分
    
    # 绘制圆形背景
    margin = 15
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=primary_green
    )
    
    # 中心坐标
    cx, cy = size // 2, size // 2
    
    # 扁平化设计：人坐在椅子上
    # 整体居中，简洁明了
    
    # 椅子 - 放在人物后面
    chair_x = cx + 5
    chair_y = cy + 15
    
    # 椅背 - 圆角矩形，更高更明显
    back_width = 16
    back_height = 75
    back_top = chair_y - 55
    draw.rounded_rectangle([
        chair_x - back_width // 2, back_top,
        chair_x + back_width // 2, back_top + back_height
    ], radius=8, fill=light_green)
    
    # 椅座 - 与人物底部对齐
    seat_width = 50
    seat_height = 14
    seat_y = chair_y + 5
    draw.rounded_rectangle([
        chair_x - seat_width // 2, seat_y,
        chair_x + seat_width // 2, seat_y + seat_height
    ], radius=7, fill=white)
    
    # 椅腿 - 简洁的两条
    leg_width = 8
    leg_height = 25
    leg_top = seat_y + seat_height
    
    # 左腿
    draw.rounded_rectangle([
        chair_x - 15, leg_top,
        chair_x - 15 + leg_width, leg_top + leg_height
    ], radius=4, fill=light_green)
    
    # 右腿
    draw.rounded_rectangle([
        chair_x + 7, leg_top,
        chair_x + 7 + leg_width, leg_top + leg_height
    ], radius=4, fill=light_green)
    
    # 人物部分 - 坐在椅子上
    # 头部 - 圆形
    head_radius = 30
    head_x = cx - 15
    head_y = cy - 35
    draw.ellipse([
        head_x - head_radius, head_y - head_radius,
        head_x + head_radius, head_y + head_radius
    ], fill=white)
    
    # 身体 - 坐姿的圆角矩形
    body_width = 45
    body_height = 48
    body_x = head_x + 5
    body_y = head_y + head_radius + 5
    draw.rounded_rectangle([
        body_x - body_width // 2, body_y,
        body_x + body_width // 2, body_y + body_height
    ], radius=10, fill=white)
    
    # 保存
    img.save('store-icon-300.png')
    print('✅ 商店图标已创建: store-icon-300.png (300x300)')
    print('🎨 设计特点:')
    print('   - 扁平化风格 (Flat Design)')
    print('   - 简洁的人物坐在椅子上')
    print('   - 绿色背景体现健康主题')
    print('   - 300x300 符合 Edge 商店规范')

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('❌ 需要安装 Pillow: pip3 install Pillow')
        exit(1)
    
    create_store_icon()
