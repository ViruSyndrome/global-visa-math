import glob
import re

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # 1. Fix the dropdown block
    old_dropdown_wrapper = '<div style="margin-top: 24px;">\n                <label for="countrySelect"'
    new_dropdown_wrapper = '<div style="text-align: center; margin-bottom: 32px; margin-top: 24px;">\n                <span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">Switch Country/Visa Type:</span>'
    content = content.replace(old_dropdown_wrapper, new_dropdown_wrapper)
    
    # We replaced the label with a span above, so we need to remove the existing label's closing tag, wait, no, the replace above only replaces the opening tag of label.
    # Actually, it's safer to just replace the whole chunk:
    old_full_label = '<div style="margin-top: 24px;">\n                <label for="countrySelect" style="font-size: 0.9rem; color: var(--text-muted);">Switch Country/Visa Type:</label>'
    new_full_label = '<div style="text-align: center; margin-bottom: 32px; margin-top: 24px;">\n                <span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">Switch Country/Visa Type:</span>'
    content = content.replace(old_full_label, new_full_label)
    
    old_select = 'class="form-input" style="width: auto; display: inline-block; padding: 6px 12px; height: auto;"'
    new_select = 'class="form-input" style="width: auto; display: inline-block; padding: 6px 32px 6px 16px; height: auto; border-radius: 20px; font-size: 0.9rem; background-color: var(--card-bg);"'
    content = content.replace(old_select, new_select)
    
    # 2. Extract and replace the buttons and dropzone
    # The block we want to replace starts with <div class="action-buttons" ...
    # and ends right before <div id="cameraInterface"
    
    start_idx = content.find('<div class="action-buttons"')
    end_idx = content.find('<div id="cameraInterface"')
    
    if start_idx != -1 and end_idx != -1:
        old_chunk = content[start_idx:end_idx]
        
        new_block = """<div class="upload-area" id="dropZone">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🖼️</div>
                    <h3 style="margin-bottom: 20px;">Choose an option to begin</h3>
                    
                    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 10;">
                        <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()" style="padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">📂 Upload Photo</button>
                        <button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="padding: 12px 24px; display: flex; align-items: center; gap: 8px; min-width: 180px; justify-content: center;">📷 Use Camera</button>
                    </div>
                    
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 24px;">Or Drag & Drop your image anywhere in this box (JPG, PNG)</p>
                    <input type="file" id="fileInput" accept="image/*" style="display: none;">
                </div>
                
                """
        content = content.replace(old_chunk, new_block)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Beautiful layout applied correctly!")
