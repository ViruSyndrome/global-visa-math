import glob

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    old_box = '<div style="margin-top: 24px; text-align: center; margin-bottom: 32px; padding: 16px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">'
    new_box = '<div style="text-align: center; margin-bottom: 24px;">'
    content = content.replace(old_box, new_box)
    
    old_label = '<label for="countrySelect" style="font-size: 0.9rem; color: var(--text-muted);">Switch Country/Visa Type:</label>'
    new_label = '<span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">Switch Country/Visa Type:</span>'
    content = content.replace(old_label, new_label)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Grey box removed!")
