import glob

html_files = glob.glob('*-photo-maker.html')

new_html = """
                <div class="action-buttons" style="display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()" style="flex: 1; min-width: 200px; max-width: 250px; padding: 12px; font-size: 1.05rem;">📂 Upload Photo</button>
                    <button class="btn btn-secondary" id="cameraBtn" onclick="startCamera(event)" style="flex: 1; min-width: 200px; max-width: 250px; padding: 12px; font-size: 1.05rem;">📷 Use Camera</button>
                </div>
                
                <div class="upload-area" id="dropZone" style="margin-top: 0;">
                    <div style="font-size: 3rem; margin-bottom: 12px;">🖼️</div>
                    <h3>Or Drag & Drop Here</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">(JPG, PNG)</p>
                    <input type="file" id="fileInput" accept="image/*" style="display: none;">
                </div>
"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # We need to extract the existing dropZone string and replace it.
    # The existing block starts with `<div class="upload-area" id="dropZone">`
    # and ends right before `<div id="cameraInterface"`
    
    start_idx = content.find('<div class="upload-area" id="dropZone">')
    end_idx = content.find('<div id="cameraInterface"')
    
    if start_idx != -1 and end_idx != -1:
        old_html = content[start_idx:end_idx]
        content = content.replace(old_html, new_html + "\n                ")
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
            
print("Successfully split into two separate buttons across all files!")
