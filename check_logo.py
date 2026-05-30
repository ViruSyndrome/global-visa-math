import glob

results = {}
for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        results[f] = 'class="logo"' in content

print(results)
