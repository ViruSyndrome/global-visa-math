import glob

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Fix Dropdown Layout
    old_dropdown_wrapper = '<div style="margin-top: 24px;">\n                <label for="countrySelect"'
    new_dropdown_wrapper = '<div style="margin-top: 24px; text-align: center; margin-bottom: 32px; padding: 16px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">\n                <label for="countrySelect"'
    content = content.replace(old_dropdown_wrapper, new_dropdown_wrapper)
    
    # Fix Action Buttons Layout (from Flex to perfectly even Grid)
    old_action_buttons_start = '<div class="action-buttons" style="display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap;">'
    new_action_buttons_start = '<div class="action-buttons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; max-width: 600px; margin: 0 auto 24px auto;">'
    content = content.replace(old_action_buttons_start, new_action_buttons_start)
    
    # Fix button inline styles so they fill the grid column perfectly
    old_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="flex: 1; min-width: 200px; max-width: 250px; padding: 12px; font-size: 1.05rem;">📂 Upload Photo</button>'
    new_upload_btn = '<button class="btn btn-primary" onclick="document.getElementById(\'fileInput\').click()" style="width: 100%; padding: 14px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">📂 Upload Photo</button>'
    content = content.replace(old_upload_btn, new_upload_btn)
    
    old_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="flex: 1; min-width: 200px; max-width: 250px; padding: 12px; font-size: 1.05rem;">📷 Use Camera</button>'
    new_camera_btn = '<button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="width: 100%; padding: 14px; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 8px;">📷 Use Camera</button>'
    content = content.replace(old_camera_btn, new_camera_btn)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
print("Successfully improved layout and alignment across all files!")
