import glob

html_files = glob.glob('*-photo-maker.html')

webcam_html = """
                <div class="upload-area" id="dropZone">
                    <div style="font-size: 3rem; margin-bottom: 12px;">📸</div>
                    <h3>Upload or Take a Selfie</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">Drag & drop, click to browse, or use camera</p>
                    <input type="file" id="fileInput" accept="image/*" style="display: none;">
                    
                    <button class="btn btn-secondary" id="cameraBtn" style="margin-top: 16px; position: relative; z-index: 10;" onclick="startCamera(event)">📷 Use Camera</button>
                </div>
                
                <div id="cameraInterface" style="display:none; text-align:center; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-top: 20px;">
                    <video id="cameraFeed" autoplay playsinline style="max-width:100%; border-radius:8px; transform: scaleX(-1);"></video>
                    <div style="margin-top: 16px; display: flex; gap: 12px; justify-content: center;">
                        <button id="cancelCameraBtn" class="btn btn-secondary" onclick="stopCamera()">Cancel</button>
                        <button id="snapBtn" class="btn btn-primary" onclick="capturePhoto()">📸 Capture</button>
                    </div>
                </div>
"""

webcam_js = """
        // WebRTC Camera Logic
        let videoStream = null;
        const cameraInterface = document.getElementById('cameraInterface');
        const cameraFeed = document.getElementById('cameraFeed');

        function startCamera(e) {
            if(e) e.stopPropagation();
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Your browser does not support camera access.");
                return;
            }
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(function(stream) {
                videoStream = stream;
                cameraFeed.srcObject = stream;
                dropZone.style.display = 'none';
                cameraInterface.style.display = 'block';
            })
            .catch(function(err) {
                alert("Camera access denied or unavailable.");
            });
        }

        function stopCamera() {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                videoStream = null;
            }
            cameraInterface.style.display = 'none';
            dropZone.style.display = 'block';
        }

        function capturePhoto() {
            const canvas = document.createElement('canvas');
            canvas.width = cameraFeed.videoWidth;
            canvas.height = cameraFeed.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Flip horizontal to mirror the video feed properly before capture
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
            
            stopCamera();
            
            // Send to existing logic
            imageToCrop.src = dataUrl;
            dropZone.style.display = 'none';
            cropperWrapper.style.display = 'block';
            controlsRow.style.display = 'flex';
            
            if (cropper) cropper.destroy();
            cropper = new Cropper(imageToCrop, {
                aspectRatio: TARGET_WIDTH_PX / TARGET_HEIGHT_PX,
                viewMode: 1,
                dragMode: 'move',
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
            });
        }
"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Fix layout wrapping (responsive grid)
    old_grid = 'display: grid; grid-template-columns: 1fr 1fr;'
    new_grid = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));'
    content = content.replace(old_grid, new_grid)
    
    # Inject Webcam HTML
    old_html = """                <div class="upload-area" id="dropZone">
                    <div style="font-size: 3rem; margin-bottom: 12px;">📸</div>
                    <h3>Upload Your Selfie</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 8px;">Drag & drop or click to browse (JPG, PNG)</p>
                    <input type="file" id="fileInput" accept="image/*" style="display: none;">
                </div>"""
                
    if 'cameraBtn' not in content:
        content = content.replace(old_html, webcam_html)
    
    # Inject Webcam JS
    old_js = "function resetApp() {"
    new_js = webcam_js + "\n        " + old_js
    
    if 'startCamera' not in content:
        content = content.replace(old_js, new_js)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
print("Updated all files with layout fixes and WebRTC camera!")
