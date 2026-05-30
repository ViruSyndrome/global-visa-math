import glob

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    old_code = "dropZone.addEventListener('click', () => fileInput.click());"
    new_code = "dropZone.addEventListener('click', (e) => { if (e.target.id === 'cameraBtn') return; fileInput.click(); });"
    
    if old_code in content:
        content = content.replace(old_code, new_code)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
            
print("Event listener patched in all files!")
