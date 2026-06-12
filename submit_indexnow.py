"""
IndexNow submission script for GlobalVisaMath.
Run this after deploying any changes: python submit_indexnow.py
"""

import urllib.request
import json

KEY = "9280e817289f42c7ae9db0de7d89c84f"
HOST = "www.globalvisamath.com"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

URLS = [
    "https://www.globalvisamath.com/",
    "https://www.globalvisamath.com/schengen-calculator.html",
    "https://www.globalvisamath.com/canada-crs-calculator.html",
    "https://www.globalvisamath.com/green-card-renewal.html",
    "https://www.globalvisamath.com/j1-visa-tracker.html",
    "https://www.globalvisamath.com/us-visa-passport-photo-maker.html",
    "https://www.globalvisamath.com/uk-visa-passport-photo-maker.html",
    "https://www.globalvisamath.com/indian-passport-photo-maker.html",
    "https://www.globalvisamath.com/indian-visa-oci-photo-maker.html",
    "https://www.globalvisamath.com/canada-visa-photo-maker.html",
    "https://www.globalvisamath.com/canada-pr-passport-photo-maker.html",
    "https://www.globalvisamath.com/schengen-visa-photo-maker.html",
    "https://www.globalvisamath.com/australia-visa-photo-maker.html",
    "https://www.globalvisamath.com/japan-visa-photo-maker.html",
    "https://www.globalvisamath.com/uae-dubai-visa-photo-maker.html",
    "https://www.globalvisamath.com/saudi-arabia-visa-photo-maker.html",
    "https://www.globalvisamath.com/singapore-visa-photo-maker.html",
    "https://www.globalvisamath.com/china-visa-photo-maker.html",
    "https://www.globalvisamath.com/new-zealand-visa-photo-maker.html",
    "https://www.globalvisamath.com/south-korea-visa-photo-maker.html",
    "https://www.globalvisamath.com/guides/",
    "https://www.globalvisamath.com/guides/schengen-90-180-france.html",
    "https://www.globalvisamath.com/guides/schengen-90-180-germany.html",
    "https://www.globalvisamath.com/guides/schengen-90-180-italy.html",
    "https://www.globalvisamath.com/guides/schengen-90-180-spain.html",
    "https://www.globalvisamath.com/guides/indian-schengen-visa-calculator.html",
    "https://www.globalvisamath.com/guides/canada-crs-score-400.html",
    "https://www.globalvisamath.com/guides/canada-crs-score-450.html",
    "https://www.globalvisamath.com/guides/canada-crs-score-470.html",
    "https://www.globalvisamath.com/guides/canada-crs-score-490.html",
    "https://www.globalvisamath.com/guides/canada-crs-score-500.html",
]

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": URLS,
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=data,
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        print(f"✅ IndexNow submitted: HTTP {resp.status}")
        print(f"   {len(URLS)} URLs sent to Bing/Yandex/DuckDuckGo")
except urllib.error.HTTPError as e:
    print(f"❌ HTTP Error {e.code}: {e.reason}")
    print(e.read().decode())
except Exception as e:
    print(f"❌ Error: {e}")
