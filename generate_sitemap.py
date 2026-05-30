import os
from datetime import datetime
import glob

domain = "https://www.globalvisamath.com"
html_files = glob.glob('*.html')

urls = []
for file in html_files:
    url = f"{domain}/{file}"
    priority = "0.8"
    if file == "index.html":
        priority = "1.0"
    elif "-photo-maker" in file or "calculator" in file or "tracker" in file:
        priority = "0.9"
    elif file in ["about.html", "terms.html", "privacy.html", "contribute.html"]:
        priority = "0.5"
        
    urls.append(f"""  <url>
    <loc>{url}</loc>
    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>
    <priority>{priority}</priority>
  </url>""")

sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write(sitemap)

print("GlobalVisaMath sitemap generated!")
