import glob
import re

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Remove the picture icon
    content = content.replace('<div style="font-size: 3rem; margin-bottom: 12px;">🖼️</div>\n                    ', '')
    
    # Change flex to grid for perfectly equal sizing
    old_container = '<div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 10;">'
    new_container = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; position: relative; z-index: 10;">'
    content = content.replace(old_container, new_container)
    
    # Strip the inline flex styles from buttons since they are in a grid now, and make them full width of their grid cell
    old_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="flex: 1; padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    new_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="width: 100%; padding: 12px 24px; display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 1.05rem;">'
    content = content.replace(old_upload_btn, new_upload_btn)
    
    old_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="flex: 1; padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">'
    new_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="width: 100%; padding: 12px 24px; display: flex; align-items: center; gap: 8px; justify-content: center; font-size: 1.05rem;">'
    content = content.replace(old_camera_btn, new_camera_btn)
    
    # Make buttons both primary if user hates the mismatched styles?
    # Actually, btn-secondary is fine, but maybe let's make them both btn-primary so they look like equal choices?
    # I'll leave them as primary/secondary but now they will be exactly the same size.

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Icon removed and grid layout applied!")
