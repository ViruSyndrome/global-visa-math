import os
import re

EXISTING_SLUGS = [
    "us-visa-passport-photo-maker",
    "indian-visa-oci-photo-maker",
    "indian-passport-photo-maker",
    "schengen-visa-photo-maker",
    "uk-visa-passport-photo-maker",
    "canada-visa-photo-maker",
    "canada-pr-passport-photo-maker",
    "australia-visa-photo-maker",
    "japan-visa-photo-maker",
]

NEW_HTML = """
        <section class="examples-section reveal-scroll" style="margin-top: 60px; text-align: center;">
            <h2 style="margin-bottom: 24px;">Compliant vs. Non-Compliant Examples</h2>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <div style="background: rgba(239,68,68,0.05); border: 1px solid var(--danger); padding: 16px; border-radius: 12px; max-width: 300px; width: 100%;">
                    <div style="background: #1e293b; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 12px; overflow: hidden; position: relative;">
                        <div style="width: 100px; height: 120px; background: #475569; border-radius: 50px 50px 10px 10px; position: absolute; bottom: 0;"></div>
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(0,0,0,0.5), transparent);"></div>
                        <span style="color: var(--danger); font-size: 3rem; position: relative; z-index: 2;">&#10060;</span>
                    </div>
                    <h4 style="color: var(--danger); margin-bottom: 8px;">Incorrect</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Shadows on background, poor lighting, glasses worn, or face off-center.</p>
                </div>
                <div style="background: rgba(34,197,94,0.05); border: 1px solid var(--success); padding: 16px; border-radius: 12px; max-width: 300px; width: 100%;">
                    <div style="background: #f8fafc; height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 12px; overflow: hidden; position: relative;">
                        <div style="width: 100px; height: 120px; background: #94a3b8; border-radius: 50px 50px 10px 10px; position: absolute; bottom: 0;"></div>
                        <span style="color: var(--success); font-size: 3rem; position: relative; z-index: 2;">&#9989;</span>
                    </div>
                    <h4 style="color: var(--success); margin-bottom: 8px;">Correct</h4>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Plain white/off-white background, even lighting, neutral expression, centered face.</p>
                </div>
            </div>
        </section>

        <section class="faq-section reveal-scroll" style="margin-top: 60px; max-width: 800px; margin-left: auto; margin-right: auto;">
            <h2 style="text-align: center; margin-bottom: 32px;">Frequently Asked Questions</h2>
            <div style="background: var(--card-bg); padding: 32px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 8px; color: var(--text-main); font-size: 1.1rem;">Can I wear glasses in my visa photo?</h4>
                <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem; line-height: 1.6;">For US visas, US passports, and many others (like Schengen and Singapore), you <strong>cannot</strong> wear glasses. Always remove them to prevent rejection due to glare or frame obstruction.</p>
                
                <h4 style="margin-bottom: 8px; color: var(--text-main); font-size: 1.1rem;">What background should I use?</h4>
                <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem; line-height: 1.6;">Stand flat against a plain white or off-white wall. Ensure there are no patterns, textures, or shadows behind your head. Avoid standing too far from the wall to prevent deep shadows.</p>
                
                <h4 style="margin-bottom: 8px; color: var(--text-main); font-size: 1.1rem;">Can I smile?</h4>
                <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem; line-height: 1.6;">You must maintain a neutral expression with both eyes open and your mouth closed. While a natural, unexaggerated smile is technically permitted for US passports, a neutral expression is the safest globally and strictly required for Schengen and Chinese visas.</p>
                
                <h4 style="margin-bottom: 8px; color: var(--text-main); font-size: 1.1rem;">Is this tool really private?</h4>
                <p style="color: var(--text-muted); margin-bottom: 0; font-size: 0.95rem; line-height: 1.6;">Yes. Unlike other tools that upload your photo to a cloud server, GlobalVisaMath runs the cropping algorithm completely inside your browser using Javascript. Your image data never leaves your device.</p>
            </div>
        </section>

"""

def patch_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Inject Before/After and FAQ if not there
    if "Compliant vs. Non-Compliant Examples" not in html:
        html = html.replace('        <section class="info-grid"', NEW_HTML + '        <section class="info-grid"')
        
    # Inject 15+ countries subtitle if not there
    if "Supports 15+ countries and visa types perfectly." not in html:
        html = re.sub(r'(<p class="hero-subtitle">.*?</p>)', r'\1 <p style="color: var(--primary); font-weight: bold; margin-top: 8px;">Supports 15+ countries and visa types perfectly.</p>', html, count=1)
        
    # Fix OG tags in head
    if "og-photo-maker.png" not in html:
        # replace existing og-image if any
        html = html.replace('content="https://www.globalvisamath.com/og-image.webp"', 'content="https://www.globalvisamath.com/og-photo-maker.png"')
        
    # Inject HowTo Schema
    if '"@type": "HowTo"' not in html:
        schema_add = """        },
        {
          "@type": "HowTo",
          "name": "How to make a compliant visa photo at home",
          "step": [
            {
              "@type": "HowToStep",
              "text": "Stand against a plain white background with even lighting."
            },
            {
              "@type": "HowToStep",
              "text": "Upload your photo or use the camera to take a selfie."
            },
            {
              "@type": "HowToStep",
              "text": "Align your face within the crop box and click Download Sized Photo."
            }
          ]
        }
      ]
    }"""
        html = html.replace('      }\n    }', schema_add)
        html = html.replace('"@type": "WebApplication"', '"@graph": [\n        {\n          "@type": "WebApplication"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

for slug in EXISTING_SLUGS:
    path = f"{slug}.html"
    if os.path.exists(path):
        patch_page(path)
        print(f"Patched {path}")
    else:
        print(f"File not found: {path}")

