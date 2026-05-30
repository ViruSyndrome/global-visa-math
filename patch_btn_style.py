import glob

html_files = glob.glob('*-photo-maker.html')
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('class="btn btn-secondary" id="cameraBtn"', 'class="btn btn-primary" id="cameraBtn"')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Buttons updated!")
