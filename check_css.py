css = open("style.css", encoding="utf-8").read()
checks = [".hamburger", ".nav-links.open", "@media", "nav-links"]
for c in checks:
    status = "FOUND" if c in css else "MISSING"
    print(f"{c}: {status}")
