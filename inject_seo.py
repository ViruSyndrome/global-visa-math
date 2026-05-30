import glob

tags = """
    <meta name="msvalidate.01" content="FA7405A0B7623E8A404F74AE4952777C" />
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-5KJNDPS0EG"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag("js", new Date());
      gtag("config", "G-5KJNDPS0EG");
    </script>
"""

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'msvalidate' not in content:
        # inject before </head> or <link rel="stylesheet"
        if '<link rel="stylesheet"' in content:
            content = content.replace('<link rel="stylesheet"', tags + '    <link rel="stylesheet"', 1)
        else:
            content = content.replace('</head>', tags + '</head>', 1)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected tags into {file}")
