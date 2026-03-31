import os
import glob
import re

html_files = glob.glob('*.html') + glob.glob('admin/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove option
    content = re.sub(r'\s*<option value="desktop">เดสก์ท็อป</option>', '', content)
    
    # Remove nav item
    content = re.sub(r'\s*<li><a href="products\.html\?cat=desktop">.*?</a></li>', '', content, flags=re.DOTALL)
    
    # Remove checkbox
    content = re.sub(r'\s*<label><input type="checkbox" value="desktop"> เดสก์ท็อป</label>', '', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated {file}")

js_file = 'js/app.js'
if os.path.exists(js_file):
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("desktop: 'เดสก์ท็อป / คอมพิวเตอร์เซ็ต',", '')
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {js_file}")

