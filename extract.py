import re

with open('schengen-calculator.html', 'r', encoding='utf-8') as f:
    src = f.read()

calc_panel = re.search(r'(<section class="calculator-panel">.*?</section>)', src, re.DOTALL)

if calc_panel:
    with open('index.html', 'r', encoding='utf-8') as f2:
        dst = f2.read()
    
    dst_split = dst.split('<section class="tool-intro container tool-intro-section">')
    
    new_html = dst_split[0] + calc_panel.group(1) + '\n\n<section class="tool-intro container tool-intro-section">' + dst_split[1]
    
    new_html = re.sub(r'<!-- Schengen Card -->.*?</div>\s*<!-- Canada CRS Card -->', '<!-- Canada CRS Card -->', new_html, flags=re.DOTALL)
    
    with open('index.html', 'w', encoding='utf-8') as f3:
        f3.write(new_html)
    print("Successfully embedded calculator in index.html")
else:
    print("Could not find calculator-panel")
