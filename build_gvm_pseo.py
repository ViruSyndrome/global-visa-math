"""
GlobalVisaMath pSEO Page Generator
Generates targeted SEO pages for:
  - Schengen country guides (schengen-90-180-days-{country}.html)
  - Nationality-specific Schengen pages ({nationality}-schengen-visa-calculator.html)
  - CRS score guides (canada-crs-score-{score}.html)
"""

import os
from datetime import date

TODAY = date.today().isoformat()
BASE_URL = "https://www.globalvisamath.com"

# ─── SCHENGEN COUNTRY PAGES ─────────────────────────────────────────────────
SCHENGEN_COUNTRIES = [
    {"name": "France", "slug": "france", "capital": "Paris", "code": "FR", "flag": "🇫🇷",
     "highlight": "France is the most visited Schengen country. Days in Paris, Lyon, or any French territory count toward your 90-day limit."},
    {"name": "Germany", "slug": "germany", "capital": "Berlin", "code": "DE", "flag": "🇩🇪",
     "highlight": "Germany is a major business and tourism hub in Schengen. Arrivals at Frankfurt or Munich airports are Schengen entry points."},
    {"name": "Italy", "slug": "italy", "capital": "Rome", "code": "IT", "flag": "🇮🇹",
     "highlight": "Italy is one of the most popular Schengen destinations. Days in Rome, Milan, Florence, or Venice all count toward your 90-day limit."},
    {"name": "Spain", "slug": "spain", "capital": "Madrid", "code": "ES", "flag": "🇪🇸",
     "highlight": "Spain including the Canary Islands and Balearic Islands is fully within the Schengen Area. Days in Barcelona or Madrid count toward your limit."},
    {"name": "Netherlands", "slug": "netherlands", "capital": "Amsterdam", "code": "NL", "flag": "🇳🇱",
     "highlight": "The Netherlands including Amsterdam is a major Schengen transit hub. Layovers in Schiphol that involve leaving the transit zone count as Schengen days."},
    {"name": "Greece", "slug": "greece", "capital": "Athens", "code": "GR", "flag": "🇬🇷",
     "highlight": "Greece including its islands is fully within the Schengen Area. Days in Santorini, Mykonos, Crete, or Athens all count toward your 90-day limit."},
    {"name": "Switzerland", "slug": "switzerland", "capital": "Bern", "code": "CH", "flag": "🇨🇭",
     "highlight": "Switzerland is a full Schengen member despite not being in the EU. Days in Zurich, Geneva, or the Swiss Alps count toward your 90-day limit."},
    {"name": "Portugal", "slug": "portugal", "capital": "Lisbon", "code": "PT", "flag": "🇵🇹",
     "highlight": "Portugal including the Azores and Madeira is fully within the Schengen Area. Days in Lisbon, Porto, or the Algarve count toward your limit."},
    {"name": "Czech Republic", "slug": "czech-republic", "capital": "Prague", "code": "CZ", "flag": "🇨🇿",
     "highlight": "The Czech Republic joined Schengen in 2007. Days in Prague or elsewhere in the country count toward the shared 90-day Schengen limit."},
    {"name": "Austria", "slug": "austria", "capital": "Vienna", "code": "AT", "flag": "🇦🇹",
     "highlight": "Austria is a central Schengen member. Days in Vienna, Salzburg, or Innsbruck all count toward your rolling 90/180 limit."},
    {"name": "Poland", "slug": "poland", "capital": "Warsaw", "code": "PL", "flag": "🇵🇱",
     "highlight": "Poland joined Schengen in 2007. Days in Warsaw, Krakow, or Gdansk count toward the same shared 90-day Schengen total."},
    {"name": "Belgium", "slug": "belgium", "capital": "Brussels", "code": "BE", "flag": "🇧🇪",
     "highlight": "Belgium is home to NATO and EU headquarters. Days in Brussels, Bruges, or Ghent count toward your Schengen 90/180 limit."},
]

# ─── NATIONALITY PAGES ────────────────────────────────────────────────────────
NATIONALITIES = [
    {"nationality": "Indian", "slug": "indian", "flag": "🇮🇳", "country": "India",
     "visa_note": "Indian passport holders require a Schengen visa before travel. The visa specifies whether it is single-entry or multiple-entry. Even with a multiple-entry visa, the 90/180 day rule still applies.",
     "popular_dest": "France, Germany, Italy, Switzerland, and Spain"},
    {"nationality": "American", "slug": "american", "flag": "🇺🇸", "country": "USA",
     "visa_note": "US citizens can enter the Schengen Area visa-free for tourism and business. However, the 90/180 rule still applies — US passport holders are not exempt from the day limit.",
     "popular_dest": "France, Italy, Spain, Germany, and Greece"},
    {"nationality": "British", "slug": "british", "flag": "🇬🇧", "country": "UK",
     "visa_note": "Since Brexit, UK citizens are treated as third-country nationals and are subject to the 90/180 Schengen rule. The UK is no longer part of the Schengen Area.",
     "popular_dest": "Spain, France, Italy, Greece, and Portugal"},
    {"nationality": "Australian", "slug": "australian", "flag": "🇦🇺", "country": "Australia",
     "visa_note": "Australian passport holders can enter the Schengen Area visa-free for up to 90 days in any 180-day period. The rolling rule applies from the first day of entry.",
     "popular_dest": "Italy, France, Greece, Spain, and Croatia"},
    {"nationality": "Canadian", "slug": "canadian", "flag": "🇨🇦", "country": "Canada",
     "visa_note": "Canadian citizens can visit the Schengen Area visa-free. However, the 90/180 rolling rule still applies, and Canadians must also apply for ETIAS (launching 2025) before travel.",
     "popular_dest": "France, Italy, Germany, Netherlands, and Spain"},
    {"nationality": "UAE resident", "slug": "uae-resident", "flag": "🇦🇪", "country": "UAE",
     "visa_note": "UAE citizens and long-term residents with certain visa statuses can enter the Schengen Area. UAE passport holders are visa-free for 90 days. Residents need to check their specific visa category.",
     "popular_dest": "France, Italy, Spain, Switzerland, and Greece"},
]

# ─── CRS SCORE GUIDE PAGES ────────────────────────────────────────────────────
CRS_SCORES = [
    {"score": 400, "tier": "Below Average", "note": "A CRS score of 400 is generally below current draw cut-offs. You should focus on improving your human capital factors."},
    {"score": 450, "tier": "Competitive", "note": "A CRS score of 450 is in a competitive range. Recent draw cut-offs have varied between 430 and 520 depending on the draw type."},
    {"score": 470, "tier": "Competitive", "note": "A CRS score of 470 may qualify in category-based draws. Check recent IRCC invitation rounds for your specific NOC."},
    {"score": 490, "tier": "Strong", "note": "A CRS score of 490 puts you in a strong position. Many general draws have cut-offs below 490, especially during high-volume rounds."},
    {"score": 500, "tier": "Strong", "note": "A CRS score of 500 is solid. Most general Express Entry draws in recent years have had cut-offs between 470 and 510."},
    {"score": 520, "tier": "Very Strong", "note": "A CRS score of 520 or above will likely receive an Invitation to Apply (ITA) quickly. You should ensure your profile is complete and ready."},
    {"score": 540, "tier": "Excellent", "note": "A CRS score of 540 is excellent and near the top of the pool. You are well-positioned for both general and category-based draws."},
]

SITEMAP_ENTRIES = []

def render_head(title, description, canonical, og_title=None):
    og_title = og_title or title
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{canonical}">
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <meta name="msvalidate.01" content="FA7405A0B7623E8A404F74AE4952777C" />
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-5KJNDPS0EG"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-5KJNDPS0EG');
    </script>
    <link rel="stylesheet" href="../style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2959862133855422" crossorigin="anonymous"></script>
    <meta property="og:type" content="website">
    <meta property="og:url" content="{canonical}">
    <meta property="og:title" content="{og_title}">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="https://www.globalvisamath.com/og-image.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{og_title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="https://www.globalvisamath.com/og-image.webp">
</head>"""

def render_nav(active="schengen"):
    return f"""<body>
    <header class="navbar">
        <div class="nav-inner">
            <a href="/" class="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #60a5fa; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));">
                    <g transform="rotate(-8 12 12)">
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#93c5fd" stroke-width="1.8"></rect>
                        <rect x="5" y="6" width="14" height="12" rx="1" stroke="#93c5fd" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.5"></rect>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="#93c5fd" stroke-width="1" opacity="0.5"></line>
                        <circle cx="9" cy="9" r="1.8" stroke="currentColor" stroke-width="0.8"></circle>
                        <line x1="7.2" y1="9" x2="10.8" y2="9" stroke="currentColor" stroke-width="0.6" opacity="0.6"></line>
                        <line x1="9" y1="7.2" x2="9" y2="10.8" stroke="currentColor" stroke-width="0.6" opacity="0.6"></line>
                        <path d="M15 9l.3-.6.6-.3-.6-.3-.3-.6-.3.6-.6.3.6.3.3.6z" fill="currentColor" stroke="none"></path>
                        <path d="M8 15.5l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"></path>
                    </g>
                </svg>
                GlobalVisaMath
            </a>
            <button class="hamburger" id="visaHamburger" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
            <nav class="nav-links" id="visaNavLinks">
                <a href="/">All Calculators</a>
                <a href="../schengen-calculator.html" class="{'active' if active=='schengen' else ''}">Schengen 90/180</a>
                <a href="../canada-crs-calculator.html" class="{'active' if active=='canada' else ''}">Canada CRS</a>
                <a href="../green-card-renewal.html">Green Card</a>
                <a href="../j1-visa-tracker.html">J-1 Tracker</a>
            </nav>
        </div>
    </header>"""

def render_footer():
    return """    <footer class="footer">
        <div class="footer-inner">
            <div class="footer-col">
                <strong>GlobalVisaMath</strong>
                <p>Professional travel compliance tools.</p>
                <div class="footer-links" style="margin-top: 10px; display: flex; gap: 15px; font-size: 0.8rem;">
                    <a href="../about.html" style="color: #cbd5e0; text-decoration: none;">About Us</a>
                    <a href="../privacy.html" style="color: #cbd5e0; text-decoration: none;">Privacy Policy</a>
                    <a href="../terms.html" style="color: #cbd5e0; text-decoration: none;">Terms of Service</a>
                </div>
            </div>
            <div class="footer-col text-right">
                <p>Calculations strictly follow <strong>Regulation (EU) 2016/399</strong> of the European Parliament.</p>
                <p>&copy; 2026 GlobalVisaMath.com. Not legal advice.</p>
            </div>
        </div>
    </footer>
    <script src="../script.js"></script>
    <script>
    window.addEventListener('load', () => {
      const targets = document.querySelectorAll('.calculator-panel, .results-section, .info-section, .footer, .pseo-card');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('visible'); }
          else { entry.target.classList.remove('visible'); }
        });
      }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });
      targets.forEach(target => { target.classList.add('reveal-scroll'); observer.observe(target); });
    });
    document.getElementById('visaHamburger').addEventListener('click', function() {
      this.classList.toggle('open');
      document.getElementById('visaNavLinks').classList.toggle('open');
    });
    </script>
</body>
</html>"""

# ─── GENERATE SCHENGEN COUNTRY PAGES ─────────────────────────────────────────
os.makedirs("guides", exist_ok=True)

for c in SCHENGEN_COUNTRIES:
    slug = f"schengen-90-180-{c['slug']}.html"
    canonical = f"{BASE_URL}/guides/{slug}"
    title = f"Schengen 90/180 Rule for {c['name']} {c['flag']} | GlobalVisaMath"
    desc = f"Can you visit {c['name']}? Use our free Schengen 90/180 day calculator to check your compliance before traveling to {c['capital']} or anywhere in {c['name']}."

    html = render_head(title, desc, canonical) + render_nav("schengen") + f"""
    <main class="container">
        <div class="hero">
            <h1>Schengen 90/180 Rule: Visiting {c['flag']} {c['name']}</h1>
            <p>Use the free calculator below to check whether you can still legally visit {c['name']} under the EU's rolling 90/180 day Schengen rule.</p>
        </div>

        <section class="calculator-panel">
            <div class="calc-header">
                <h2>Check Your {c['name']} Travel Compliance</h2>
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span class="trust-badge" style="color: #4a5568; background: #edf2f7;">Rules Current as of: 2026</span>
                    <span class="trust-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Privacy First: No Data Stored
                    </span>
                </div>
            </div>
            <div class="input-section">
                <div class="entry-list" id="entryList">
                    <div class="date-row">
                        <div class="input-group">
                            <label for="entry_0" data-tooltip="The day you crossed the border into the Schengen Area (from passport stamp)">Date of Entry ⓘ</label>
                            <input type="date" id="entry_0" class="date-input">
                        </div>
                        <div class="input-group">
                            <label for="exit_0" data-tooltip="The day you exited the Schengen Area (from passport stamp)">Date of Exit ⓘ</label>
                            <input type="date" id="exit_0" class="date-input">
                        </div>
                    </div>
                </div>
                <button class="btn-secondary" id="addTripBtn">+ Add Another Trip</button>
                <div class="action-row">
                    <div class="input-group">
                        <label for="controlDate" data-tooltip="The date from which you want to check your rolling 180-day compliance">Date of Assessment (Today) ⓘ</label>
                        <input type="date" id="controlDate" class="date-input">
                    </div>
                    <button class="btn-primary" id="calculateBtn">Calculate Status</button>
                </div>
            </div>
            <div class="form-error" id="formError" role="alert" aria-live="assertive" style="display:none;"></div>
            <div class="results-section" id="resultsSection" style="display: none;">
                <h3>Compliance Status</h3>
                <div class="status-card" id="statusCard">
                    <div class="score-circle-container">
                        <svg class="score-svg" viewBox="0 0 100 100">
                            <circle class="score-bg" cx="50" cy="50" r="45"></circle>
                            <circle class="score-fill" id="schengenCircle" cx="50" cy="50" r="45"></circle>
                        </svg>
                        <div id="daysUsed" class="score-value">0</div>
                    </div>
                    <div class="status-label" style="font-weight: 600; margin-top: 0.5rem;">Days used in the last 180 days (Limit: 90)</div>
                </div>
                <p class="status-message" id="statusMessage"></p>
                <div class="audit-trail">
                    <h4>Calculation Audit</h4>
                    <p class="audit-disclaimer">Based on the rolling 180-day window looking back from your Date of Assessment.</p>
                    <ul id="auditList"></ul>
                </div>
            </div>
        </section>

        <section class="info-section">
            <h2>The 90/180 Rule and {c['name']}</h2>
            <p>{c['highlight']}</p>
            <p style="margin-top: 1rem;">The Schengen Area treats all 27 member countries as a single zone. Whether you enter at {c['capital']} airport or travel overland from a neighbouring country, every day counts toward the same rolling 90-day limit.</p>

            <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📅</div>
                    <strong>90-day limit</strong>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">Maximum stay in any 180-day rolling window across all Schengen countries including {c['name']}.</p>
                </div>
                <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔄</div>
                    <strong>Rolling window</strong>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">The 180 days are always counted backwards from today, not from your entry date or the start of the year.</p>
                </div>
                <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">✈️</div>
                    <strong>Entry + exit count</strong>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">Both the day you enter and the day you exit {c['name']} each count as a full Schengen day.</p>
                </div>
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>Frequently Asked Questions — {c['name']}</h2>
            <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Does visiting {c['name']} use up my Schengen days?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Yes. {c['name']} is a full Schengen member. Every day you spend in {c['name']} counts toward your shared 90-day limit across all Schengen countries.</p>
            </div>
            <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Can I enter {c['name']} if I have only 10 Schengen days left?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Yes, but you can only stay for 10 days across the entire Schengen Area before you must leave. Use the calculator above to check your exact remaining days.</p>
            </div>
            <div style="padding: 1rem 0 0 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Do I need a visa to visit {c['name']}?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">It depends on your passport. Citizens of many countries (US, UK, Australia, Canada) can visit {c['name']} visa-free for 90 days. Citizens of India, China, and many others require a Schengen visa. Check your country's requirements at the official embassy website.</p>
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>Other Schengen Country Guides</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1rem;">
                {chr(10).join([f'<a href="schengen-90-180-{x["slug"]}.html" style="padding: 6px 14px; background: rgba(43,108,176,0.07); border: 1px solid var(--border); border-radius: 20px; text-decoration: none; color: var(--primary); font-size: 0.9rem; font-weight: 500;">{x["flag"]} {x["name"]}</a>' for x in SCHENGEN_COUNTRIES if x['slug'] != c['slug']])}
            </div>
        </section>
    </main>
""" + render_footer()

    with open(f"guides/{slug}", "w", encoding="utf-8") as f:
        f.write(html)
    SITEMAP_ENTRIES.append(f"  <url>\n    <loc>{canonical}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>0.8</priority>\n  </url>")
    print(f"  ✅ guides/{slug}")

# ─── GENERATE NATIONALITY PAGES ───────────────────────────────────────────────
for n in NATIONALITIES:
    slug = f"{n['slug']}-schengen-visa-calculator.html"
    canonical = f"{BASE_URL}/guides/{slug}"
    title = f"Schengen 90/180 Calculator for {n['nationality']} Passport Holders | GlobalVisaMath"
    desc = f"{n['nationality']} passport holders: check your Schengen 90/180 day compliance before visiting Europe. Free, private, instant calculator."

    html = render_head(title, desc, canonical) + render_nav("schengen") + f"""
    <main class="container">
        <div class="hero">
            <h1>{n['flag']} Schengen Calculator for {n['nationality']} Passport Holders</h1>
            <p>Check your 90/180 day Schengen compliance instantly. Free, private, no account needed.</p>
        </div>

        <section class="calculator-panel">
            <div class="calc-header">
                <h2>Check Your Schengen Days Used</h2>
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span class="trust-badge" style="color: #4a5568; background: #edf2f7;">Rules Current as of: 2026</span>
                    <span class="trust-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Privacy First: No Data Stored
                    </span>
                </div>
            </div>
            <div class="input-section">
                <div class="entry-list" id="entryList">
                    <div class="date-row">
                        <div class="input-group">
                            <label for="entry_0" data-tooltip="The day you crossed the border into the Schengen Area">Date of Entry ⓘ</label>
                            <input type="date" id="entry_0" class="date-input">
                        </div>
                        <div class="input-group">
                            <label for="exit_0" data-tooltip="The day you exited the Schengen Area">Date of Exit ⓘ</label>
                            <input type="date" id="exit_0" class="date-input">
                        </div>
                    </div>
                </div>
                <button class="btn-secondary" id="addTripBtn">+ Add Another Trip</button>
                <div class="action-row">
                    <div class="input-group">
                        <label for="controlDate" data-tooltip="The date from which you want to check compliance">Date of Assessment (Today) ⓘ</label>
                        <input type="date" id="controlDate" class="date-input">
                    </div>
                    <button class="btn-primary" id="calculateBtn">Calculate Status</button>
                </div>
            </div>
            <div class="form-error" id="formError" role="alert" aria-live="assertive" style="display:none;"></div>
            <div class="results-section" id="resultsSection" style="display: none;">
                <h3>Compliance Status</h3>
                <div class="status-card" id="statusCard">
                    <div class="score-circle-container">
                        <svg class="score-svg" viewBox="0 0 100 100">
                            <circle class="score-bg" cx="50" cy="50" r="45"></circle>
                            <circle class="score-fill" id="schengenCircle" cx="50" cy="50" r="45"></circle>
                        </svg>
                        <div id="daysUsed" class="score-value">0</div>
                    </div>
                    <div class="status-label" style="font-weight: 600; margin-top: 0.5rem;">Days used in the last 180 days (Limit: 90)</div>
                </div>
                <p class="status-message" id="statusMessage"></p>
                <div class="audit-trail">
                    <h4>Calculation Audit</h4>
                    <p class="audit-disclaimer">Based on the rolling 180-day window looking back from your Date of Assessment.</p>
                    <ul id="auditList"></ul>
                </div>
            </div>
        </section>

        <section class="info-section">
            <h2>Schengen Rules for {n['nationality']} Passport Holders</h2>
            <p>{n['visa_note']}</p>
            <p style="margin-top: 1rem;">{n['nationality']} travellers most commonly visit {n['popular_dest']}. All of these are full Schengen members, and days spent in any of them count toward the same 90-day limit.</p>

            <div style="margin-top: 1.5rem; padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px;">
                <h4 style="margin-bottom: 0.75rem;">Key Rules for {n['nationality']} Travellers</h4>
                <ul style="color: var(--text-muted); font-size: 0.95rem; padding-left: 1.25rem; line-height: 2;">
                    <li>Maximum <strong>90 days</strong> in any <strong>180-day rolling window</strong></li>
                    <li>The 180 days are counted <strong>backwards from every day</strong> you are present</li>
                    <li>Both entry and exit days count as <strong>full days</strong></li>
                    <li>The limit is shared across <strong>all 27 Schengen countries</strong></li>
                    <li>Overstaying can result in fines, deportation, and future bans</li>
                </ul>
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>Frequently Asked Questions</h2>
            <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">How many days can a {n['nationality']} citizen stay in Schengen?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">A maximum of 90 days in any 180-day rolling period. This is not per trip — it is a rolling calculation that looks back 180 days from every day you are present.</p>
            </div>
            <div style="border-bottom: 1px solid var(--border); padding: 1rem 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Does the 90/180 rule reset at the start of the year?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">No. The rule is a rolling window, not a calendar year reset. Days spent in Schengen continue to count for 180 days after they occurred.</p>
            </div>
            <div style="padding: 1rem 0 0 0;">
                <h4 style="color: var(--primary); margin-bottom: 0.5rem;">What countries are included in the Schengen Area?</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">27 countries: Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, and Switzerland.</p>
            </div>
        </section>
    </main>
""" + render_footer()

    with open(f"guides/{slug}", "w", encoding="utf-8") as f:
        f.write(html)
    SITEMAP_ENTRIES.append(f"  <url>\n    <loc>{canonical}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>0.8</priority>\n  </url>")
    print(f"  ✅ guides/{slug}")

# ─── GENERATE CRS SCORE GUIDE PAGES ──────────────────────────────────────────
for s in CRS_SCORES:
    slug = f"canada-crs-score-{s['score']}.html"
    canonical = f"{BASE_URL}/guides/{slug}"
    title = f"CRS Score {s['score']} — What Does It Mean? | GlobalVisaMath"
    desc = f"Got a CRS score of {s['score']}? Find out what your Express Entry score means, what draw cut-offs look like, and how to improve your chances of an ITA."

    html = render_head(title, desc, canonical) + render_nav("canada") + f"""
    <main class="container">
        <div class="hero">
            <h1>CRS Score {s['score']}: What Does It Mean?</h1>
            <p>Understand your Express Entry Comprehensive Ranking System score and what your next steps should be.</p>
        </div>

        <section class="calculator-panel">
            <div class="calc-header">
                <h2>Your CRS Score: <span style="color: var(--accent);">{s['score']}</span> — {s['tier']}</h2>
            </div>
            <div style="padding: 1.5rem;">
                <p>{s['note']}</p>

                <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 800; color: var(--accent);">{s['score']}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Your CRS Score</div>
                    </div>
                    <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">1,200</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Maximum Possible CRS</div>
                    </div>
                    <div class="pseo-card" style="padding: 1.25rem; background: rgba(43,108,176,0.04); border: 1px solid var(--border); border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 800; color: {'#22c55e' if s['score'] >= 470 else '#f59e0b'};">{'✓' if s['score'] >= 470 else '!'}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">{"Likely Competitive" if s['score'] >= 470 else "Needs Improvement"}</div>
                    </div>
                </div>

                <div style="margin-top: 2rem;">
                    <h3>How to Improve a CRS Score of {s['score']}</h3>
                    <ul style="color: var(--text-muted); font-size: 0.95rem; padding-left: 1.25rem; line-height: 2.2; margin-top: 0.75rem;">
                        <li><strong>Improve language scores</strong> — IELTS or CELPIP CLB 9+ gives maximum language points</li>
                        <li><strong>Add a job offer</strong> — A valid LMIA-backed offer adds 50–200 points instantly</li>
                        <li><strong>Provincial Nomination</strong> — A PNP nomination adds 600 points, near-guaranteeing an ITA</li>
                        <li><strong>Canadian education</strong> — A 2-year diploma or degree adds significant human capital points</li>
                        <li><strong>Spouse language score</strong> — Improving your spouse's English/French score adds adaptability points</li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>Calculate Your Full CRS Score</h2>
            <p>Use our full Canada CRS Calculator to see a breakdown of every factor contributing to your score — age, education, language, work experience, and more.</p>
            <div style="margin-top: 1.25rem;">
                <a href="../canada-crs-calculator.html" class="btn-primary" style="text-decoration: none; display: inline-block; padding: 0.85rem 2rem;">Open CRS Calculator →</a>
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>Other CRS Score Guides</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1rem;">
                {chr(10).join([f'<a href="canada-crs-score-{x["score"]}.html" style="padding: 6px 14px; background: rgba(43,108,176,0.07); border: 1px solid var(--border); border-radius: 20px; text-decoration: none; color: var(--primary); font-size: 0.9rem; font-weight: 500;">CRS {x["score"]}</a>' for x in CRS_SCORES if x["score"] != s["score"]])}
            </div>
        </section>
    </main>
""" + render_footer()

    with open(f"guides/{slug}", "w", encoding="utf-8") as f:
        f.write(html)
    SITEMAP_ENTRIES.append(f"  <url>\n    <loc>{canonical}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>0.7</priority>\n  </url>")
    print(f"  ✅ guides/{slug}")

# ─── GENERATE guides/index.html ───────────────────────────────────────────────
guide_index_html = render_head(
    "Immigration & Visa Guides | GlobalVisaMath",
    "Free immigration guides: Schengen 90/180 rules by country, CRS scores explained, and nationality-specific visa calculators.",
    f"{BASE_URL}/guides/"
) + render_nav() + """
    <main class="container">
        <div class="hero">
            <h1>Immigration & Visa Guides</h1>
            <p>In-depth guides to help you understand Schengen compliance, Canada CRS scores, and visa rules for your specific situation.</p>
        </div>

        <section class="info-section">
            <h2>🇪🇺 Schengen Country Guides</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1rem; margin-top: 1rem;">
""" + "\n".join([f"""                <a href="schengen-90-180-{c['slug']}.html" style="padding: 1rem 1.25rem; background: rgba(43,108,176,0.05); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; color: var(--text); display: block;">
                    <div style="font-size: 1.5rem;">{c['flag']}</div>
                    <strong style="display: block; margin-top: 0.4rem;">{c['name']}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">90/180 Day Guide</span>
                </a>""" for c in SCHENGEN_COUNTRIES]) + """
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>🌍 By Nationality</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 1rem; margin-top: 1rem;">
""" + "\n".join([f"""                <a href="{n['slug']}-schengen-visa-calculator.html" style="padding: 1rem 1.25rem; background: rgba(43,108,176,0.05); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; color: var(--text); display: block;">
                    <div style="font-size: 1.5rem;">{n['flag']}</div>
                    <strong style="display: block; margin-top: 0.4rem;">{n['nationality']}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Schengen Calculator</span>
                </a>""" for n in NATIONALITIES]) + """
            </div>
        </section>

        <section class="info-section" style="margin-top: 2rem;">
            <h2>🍁 Canada CRS Score Guides</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1rem;">
""" + "\n".join([f'                <a href="canada-crs-score-{s["score"]}.html" style="padding: 8px 18px; background: rgba(43,108,176,0.07); border: 1px solid var(--border); border-radius: 20px; text-decoration: none; color: var(--primary); font-size: 0.95rem; font-weight: 600;">CRS {s["score"]}</a>' for s in CRS_SCORES]) + """
            </div>
        </section>
    </main>
""" + render_footer()

with open("guides/index.html", "w", encoding="utf-8") as f:
    f.write(guide_index_html)
SITEMAP_ENTRIES.append(f"  <url>\n    <loc>{BASE_URL}/guides/</loc>\n    <lastmod>{TODAY}</lastmod>\n    <priority>0.9</priority>\n  </url>")
print("  ✅ guides/index.html")

# ─── UPDATE SITEMAP ───────────────────────────────────────────────────────────
existing = open("sitemap.xml", encoding="utf-8").read()
new_entries = "\n" + "\n".join(SITEMAP_ENTRIES) + "\n"
updated = existing.replace("</urlset>", new_entries + "</urlset>")

# Fix index.html in sitemap -> /
updated = updated.replace(
    f"<loc>{BASE_URL}/index.html</loc>",
    f"<loc>{BASE_URL}/</loc>"
)

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(updated)
print(f"\n✅ sitemap.xml updated with {len(SITEMAP_ENTRIES)} new entries")
print(f"\n🎉 Done! Generated {len(SCHENGEN_COUNTRIES)} Schengen country pages + {len(NATIONALITIES)} nationality pages + {len(CRS_SCORES)} CRS score pages + 1 guides index.")
