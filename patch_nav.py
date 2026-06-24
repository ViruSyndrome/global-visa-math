import os
import re

NEW_NAV = """            <nav class="nav-links" id="visaNavLinks">
                <a href="index.html">All Calculators</a>
                <div class="nav-dropdown" style="position: relative; display: inline-block;">
                    <span style="cursor:pointer; color:var(--text-main); font-weight:500; margin-right: 12px;">Other Tools &#9662;</span>
                    <div class="dropdown-content" style="display:none; position:absolute; background-color:var(--card-bg); min-width:180px; box-shadow:0 8px 16px rgba(0,0,0,0.2); z-index:100; border-radius:8px; border:1px solid var(--border); top:100%; left:0; padding: 8px 0;">
                        <a href="schengen-calculator.html" style="color:var(--text-main); padding:8px 16px; text-decoration:none; display:block;">Schengen 90/180</a>
                        <a href="canada-crs-calculator.html" style="color:var(--text-main); padding:8px 16px; text-decoration:none; display:block;">Canada CRS</a>
                        <a href="green-card-renewal.html" style="color:var(--text-main); padding:8px 16px; text-decoration:none; display:block;">Green Card</a>
                        <a href="j1-visa-tracker.html" style="color:var(--text-main); padding:8px 16px; text-decoration:none; display:block;">J-1 Tracker</a>
                    </div>
                </div>
                <a href="us-visa-passport-photo-maker.html" class="btn-primary" style="margin-left:auto; padding:8px 16px; border-radius:6px; text-decoration:none; font-size:0.95rem; display:inline-block; line-height:normal;">Free Photo Maker</a>
            </nav>"""

directory = "."
for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Match the <nav class="nav-links" id="visaNavLinks">...</nav>
        pattern = re.compile(r'<nav class="nav-links" id="visaNavLinks">.*?</nav>', re.DOTALL)
        
        # Active state handling logic
        nav_html = NEW_NAV
            
        new_html, n = pattern.subn(nav_html, html)
        
        # Make the dropdown interactive via a small inline script if not present
        script_block = """<script>
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(d => {
        d.addEventListener('mouseenter', () => d.querySelector('.dropdown-content').style.display = 'block');
        d.addEventListener('mouseleave', () => d.querySelector('.dropdown-content').style.display = 'none');
    });
});
</script>"""
        if "nav-dropdown" in new_html and "const dropdowns = document.querySelectorAll('.nav-dropdown');" not in new_html:
            new_html = new_html.replace('</body>', script_block + '\n</body>')
            
        if n > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print(f"Patched {filename}")
