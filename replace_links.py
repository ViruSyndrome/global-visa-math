import os
import glob

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Also update the canonical URL in schengen guides if they pointed to schengen-calculator.html
    new_content = content.replace('href="schengen-calculator.html"', 'href="index.html"')
    new_content = new_content.replace('href="../schengen-calculator.html"', 'href="../index.html"')
    new_content = new_content.replace('href="https://www.globalvisamath.com/schengen-calculator.html"', 'href="https://www.globalvisamath.com/"')
    
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.html') and file != 'schengen-calculator.html':
            replace_in_file(os.path.join(root, file))

print("Done replacing schengen-calculator links.")
