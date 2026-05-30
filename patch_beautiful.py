import glob
import re

html_files = glob.glob('*-photo-maker.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Find the start of the dropdown block
    start_str = "<!-- Other Countries Dropdown for SEO Interlinking -->"
    start_idx = content.find(start_str)
    
    # Find the end of the dropZone block
    end_str = '<div id="cameraInterface"'
    end_idx = content.find(end_str)
    
    if start_idx != -1 and end_idx != -1:
        # Extract the exact select options string to preserve it
        select_start = content.find('<select id="countrySelect"', start_idx)
        select_end = content.find('</select>', select_start) + len('</select>')
        select_html = content[select_start:select_end]
        
        # Modify the select_html slightly to add the pill styling
        select_html = select_html.replace('class="form-input" style="width: auto; display: inline-block; padding: 6px 12px; height: auto;"', 'class="form-input" style="width: auto; display: inline-block; padding: 6px 32px 6px 16px; height: auto; border-radius: 20px; font-size: 0.9rem; background-color: var(--card-bg);"')
        
        new_block = f"""<!-- Other Countries Dropdown for SEO Interlinking -->
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 0.9rem; color: var(--text-muted); margin-right: 8px;">Switch Country/Visa Type:</span>
                {select_html}
            </div>
            
            <div class="upload-area" id="dropZone">
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
            
        old_chunk = content[start_idx:end_idx]
        content = content.replace(old_chunk, new_block)
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Beautiful layout applied!")
