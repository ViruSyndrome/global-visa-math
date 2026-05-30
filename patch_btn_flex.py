import glob
import re

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    old_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    new_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="flex: 1; padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    
    old_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    new_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="flex: 1; padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    
    content = content.replace(old_upload_btn, new_upload_btn)
    content = content.replace(old_camera_btn, new_camera_btn)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Flex: 1 applied to buttons!")
