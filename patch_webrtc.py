import glob

html_files = glob.glob('*-photo-maker.html')
js_logic = """
        // --- WebRTC Camera Logic ---
        let currentStream = null;
        
        async function startCamera(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            try {
                currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                const videoElement = document.getElementById('cameraFeed');
                videoElement.srcObject = currentStream;
                document.getElementById('dropZone').style.display = 'none';
                document.getElementById('cameraInterface').style.display = 'block';
            } catch (err) {
                console.error("Camera access denied or failed:", err);
                alert("Could not access camera. Please ensure you have granted camera permissions.");
            }
        }
        
        function stopCamera() {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }
            document.getElementById('cameraInterface').style.display = 'none';
            document.getElementById('dropZone').style.display = 'block';
        }
        
        function capturePhoto() {
            const video = document.getElementById('cameraFeed');
            if (!currentStream) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Handle horizontal flip for front-facing camera mirror effect
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(blob => {
                const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
                stopCamera();
                handleFile(file);
            }, 'image/jpeg', 0.95);
        }
        // ---------------------------
    </script>"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "async function startCamera" not in content:
        content = content.replace("</script>", js_logic, 1) # replace first closing script (at the end of file usually, or wait, adsbygoogle has </script> too)
        
        # Safe replace: find last </script>
        # Actually better to replace `function resetApp() { ... }` with `function resetApp() { ... } \n\n js_logic`
        # Or just rfind
        
        last_script = content.rfind("</script>")
        if last_script != -1:
            content = content[:last_script] + js_logic + content[last_script + len("</script>"):]
            
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("WebRTC logic injected!")
