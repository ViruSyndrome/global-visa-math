import os, glob

issues = []
ok_count = 0

for f in sorted(glob.glob("guides/*.html")):
    content = open(f, encoding="utf-8").read()
    fname = os.path.basename(f)
    page_issues = []

    if "favicon.svg" not in content:
        page_issues.append("MISSING favicon")
    if "../style.css" not in content:
        page_issues.append("MISSING style.css")
    if "../script.js" not in content:
        page_issues.append("MISSING script.js")
    if "G-5KJNDPS0EG" not in content:
        page_issues.append("MISSING GA4")
    if "FA7405A0B7623E8A404F74AE4952777C" not in content:
        page_issues.append("MISSING Bing verify")
    if "ca-pub-2959862133855422" not in content:
        page_issues.append("MISSING AdSense")
    if "rel=\"canonical\"" not in content:
        page_issues.append("MISSING canonical")
    if "<h1>" not in content:
        page_issues.append("MISSING h1")
    if "visaHamburger" not in content:
        page_issues.append("MISSING hamburger")
    if "visaNavLinks" not in content:
        page_issues.append("MISSING nav links")
    if "<footer" not in content:
        page_issues.append("MISSING footer")
    # Check for index.html links (GSC canonical issue)
    if "href=\"index.html\"" in content:
        page_issues.append("BAD: href=index.html found (should be /)")
    # Check for contribute.html links (page was removed)
    if "contribute.html" in content:
        page_issues.append("BAD: links to contribute.html (removed page)")

    if page_issues:
        print(f"[FAIL] {fname}: {', '.join(page_issues)}")
    else:
        ok_count += 1

# Also check sitemap for contribute.html and index.html entries
sitemap = open("sitemap.xml", encoding="utf-8").read()
if "/index.html" in sitemap:
    print("[SITEMAP] WARNING: /index.html found in sitemap (should be /)")
if "contribute.html" in sitemap:
    print("[SITEMAP] WARNING: contribute.html still in sitemap (page was removed)")

print(f"\nSummary: {ok_count}/{len(glob.glob('guides/*.html'))} guide pages OK")
print("Root pages check:")
for f in ["index.html", "about.html", "schengen-calculator.html", "canada-crs-calculator.html", "green-card-renewal.html", "j1-visa-tracker.html"]:
    if os.path.exists(f):
        c = open(f, encoding="utf-8").read()
        iss = []
        if "favicon.svg" not in c: iss.append("no favicon")
        if "G-5KJNDPS0EG" not in c: iss.append("no GA4")
        if "ca-pub-2959862133855422" not in c: iss.append("no AdSense")
        print(f"  {'OK' if not iss else 'FAIL'} {f}: {', '.join(iss) if iss else 'all good'}")
    else:
        print(f"  MISSING {f}")
