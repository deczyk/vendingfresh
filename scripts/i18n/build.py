# -*- coding: utf-8 -*-
"""Generates the EN / CS / SK pages, their partials, hreflang links, routing and sitemap entries.

Run from the repo root:  python3 scripts/i18n/build.py
Edit copy in common.py / pages.py / solutions.py / machines.py and re-run; the generated
HTML is committed like the hand-written Polish pages.
"""
import html, json, os, re, glob, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import LANGS, LOCALE, PAGES, SOLUTIONS, T, MATS, MAT_COLORS, MAT_ICONS, IMG, ICON, url
from pages import P
from solutions import S, SEC
from machines import M, IMGS, GROUPS, NAMES, SMART, SMART_IMG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BASE = 'https://vendingfresh.pl'
ORG_ID = BASE + '/#organization'
PHONE_TEL, PHONE, EMAIL = '+48735115427', '+48 735 115 427', 'kontakt@vendingfresh.pl'
e = lambda s: html.escape(s, quote=True)
CUR = ' aria-current="true"'
ACT = ' class="is-active"'

def write(rel, content):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def ld(obj):
    return '  <script type="application/ld+json">\n  ' + json.dumps(obj, ensure_ascii=False, indent=2).replace('\n', '\n  ') + '\n  </script>\n'

def alternates(page):
    out = [f'  <link rel="alternate" hreflang="{l}" href="{BASE}{url(page, l)}">' for l in ['pl'] + LANGS]
    out.append(f'  <link rel="alternate" hreflang="x-default" href="{BASE}{url(page, "pl")}">')
    return '\n'.join(out) + '\n'

def head(lang, page, title, desc, extra='', og_type='website', noindex=False, image=None):
    canonical = BASE + url(page, lang)
    img = image or BASE + '/vendingfresh_logo_white_bg.png'
    robots = '  <meta name="robots" content="noindex, follow">\n' if noindex else ''
    alts = '' if noindex else alternates(page)
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <!-- include:fonts.html -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
{robots}  <link rel="canonical" href="{canonical}">
{alts}  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <meta property="og:type" content="{og_type}">
  <meta property="og:locale" content="{LOCALE[lang]}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{img}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="/src/style.css">
{extra}</head>
<body>
  <!-- include:nav-{lang}.html -->
  <main>
'''

def foot(lang, scripts=()):
    tags = ''.join(f'  <script type="module" src="/src/{s}.ts"></script>\n' for s in ('main',) + tuple(scripts) + ('cookies',))
    return f'''  </main>
  <!-- include:footer-{lang}.html -->
  <!-- include:cookie-banner-{lang}.html -->
{tags}</body>
</html>
'''

def crumb(lang, items):
    t = T[lang]
    lst = [(t['home_crumb'], url('home', lang))] + items
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": BASE + u} for i, (n, u) in enumerate(lst)]}

def faq_ld(pairs):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]}

def lang_switcher(current):
    labels = {'pl': 'Polski', 'en': 'English', 'cs': 'Čeština', 'sk': 'Slovenčina'}
    links = '\n'.join(f'          <a href="{url("home", l)}" data-lang-link="{l}" hreflang="{l}" lang="{l}"{CUR if l == current else ""}>{labels[l]}</a>' for l in ['pl'] + LANGS)
    return f'''      <div class="nav__dropdown nav__lang">
        <button class="nav__dropdown-toggle" type="button" aria-label="Język / Language">{current.upper()} ▾</button>
        <div class="nav__dropdown-menu">
{links}
        </div>
      </div>
'''

def cta_final(lang, h, em, primary=None):
    t = T[lang]
    return f'''
    <section class="section cta-final">
      <div class="wrap">
        <h2>{h} <em>{em}</em></h2>
        <p class="cta-final__sub">{t['cta_sub']}</p>
        <div class="hero__cta">
          <a href="{primary or url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
          <a href="tel:{PHONE_TEL}" class="btn btn--secondary">{t['call']}</a>
        </div>
      </div>
    </section>
'''

def models_section(lang):
    t = T[lang]
    return f'''
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{t['models_eyebrow']}</p>
        <h2>{t['models_h']} <em>{t['models_em']}</em></h2>
        <div class="cards-grid">
          <div class="family-card"><h3>{t['buy']}</h3><p>{t['buy_txt']}</p></div>
          <div class="family-card"><h3>{t['rent']}</h3><p>{t['rent_txt']}</p></div>
        </div>
        <a href="{url('offer', lang)}" class="btn btn--secondary">{t['compare']}</a>
        <p class="models-note">{t['abroad']}</p>
      </div>
    </section>
'''

def mock(lang, fixed=None, idd='m'):
    mats = [{"name": n, "tagline": tg, "icon": MAT_ICONS[i], "color": MAT_COLORS[i][0], "color2": MAT_COLORS[i][1]} for i, (n, tg) in enumerate(MATS[lang])]
    first = mats[fixed if isinstance(fixed, int) else 0]
    attr = f' data-mat="{fixed}"' if isinstance(fixed, int) else ''
    return f'''<div class="wrapmock"{attr} data-views="{e(T[lang]['views'])}" data-note="{e(T[lang]['preview_note'])}" data-mats="{e(json.dumps(mats, ensure_ascii=False))}">
            <div class="wrapmock__photo">
              <img src="/sielaff/siline-snack-combi/product.webp" width="350" height="500" alt="">
              <svg class="wrapmock__svg" viewBox="0 0 350 500" aria-hidden="true">
                <defs><linearGradient id="wm-sheen-{idd}" x1="0" x2="1"><stop offset="0" class="wm-stop-a"/><stop offset=".4" class="wm-stop-b"/><stop offset="1" class="wm-stop-c"/></linearGradient></defs>
                <g class="wrapmock__wrap">
                  <rect x="75" y="13" width="200" height="16"/>
                  <rect x="75" y="30" width="19" height="337"/>
                  <path fill-rule="evenodd" d="M211 30H275V367H211Z M232 102H264V162H232Z M236 163H260V184H236Z M235 334H261V364H235Z"/>
                  <path fill-rule="evenodd" d="M75 368H275V487H75Z M99 391H206V425H99Z M239 398H252V418H239Z"/>
                </g>
                <g fill="url(#wm-sheen-{idd})">
                  <rect x="75" y="13" width="200" height="16"/>
                  <path fill-rule="evenodd" d="M211 30H275V367H211Z M232 102H264V162H232Z M236 163H260V184H236Z M235 334H261V364H235Z"/>
                  <path fill-rule="evenodd" d="M75 368H275V487H75Z M99 391H206V425H99Z M239 398H252V418H239Z"/>
                </g>
                <rect class="wrapmock__accent" x="83" y="40" width="4" height="316" opacity=".75"/>
                <text class="wrapmock__small wrapmock__tagline" x="175" y="25" text-anchor="middle" font-size="9">{e(first['tagline'].upper())}</text>
                <text class="wrapmock__small" x="175" y="386" text-anchor="middle" font-size="8">LOGO</text>
                <text class="wrapmock__text wrapmock__name" x="175" y="467" text-anchor="middle" font-size="34">{e(first['name'])}</text>
                <text class="wrapmock__text wrapmock__side-name" transform="translate(251 262) rotate(-90)" text-anchor="middle" font-size="22">{e(first['name'])}</text>
              </svg>
            </div>
            <div class="wrapmock__shadow"></div>
          </div>'''

# ---------------------------------------------------------------- partials
def partials(lang):
    t = T[lang]
    sol_links = '\n'.join(f'          <a href="{url("sol:" + k, lang)}">{t["sol_names"][k]}</a>' for k in SOLUTIONS)
    nav = f'''<header class="site-header">
  <div class="wrap nav">
    <a href="{url('home', lang)}" class="nav__logo">
      <img width="1745" height="724" src="/vendingfresh_logo.webp" alt="{e(t['logo_alt'])}" class="nav__logo-img">
    </a>
    <nav class="nav__links" id="nav-links">
      <a href="{url('offer', lang)}">{t['nav_offer']}</a>
      <div class="nav__dropdown">
        <button class="nav__dropdown-toggle" type="button">{t['nav_solutions']} ▾</button>
        <div class="nav__dropdown-menu">
{sol_links}
        </div>
      </div>
      <a href="{url('machines', lang)}">{t['nav_machines']}</a>
{lang_switcher(lang)}      <a href="{url('inquiry', lang)}" class="nav__cta">{t['nav_cta']}</a>
    </nav>
    <button class="nav__toggle" id="nav-toggle" type="button" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
'''
    footer = f'''<footer class="site-footer">
  <div class="wrap footer__grid">
    <div class="footer__brand">
      <img width="512" height="512" src="/vendingfresh_icon.png" alt="VendingFresh" class="footer__icon">
      <p>{t['footer_brand']}</p>
      <p>{t['footer_partner']}</p>
    </div>
    <div class="footer__contact">
      <h3>{t['footer_contact']}</h3>
      <p>{t['footer_phone']}: <a href="tel:{PHONE_TEL}">{PHONE}</a></p>
      <p>E-mail: <a href="mailto:{EMAIL}">{EMAIL}</a></p>
      <div class="footer__social">
        <a href="https://www.facebook.com/profile.php?id=61594414635355" target="_blank" rel="noopener" aria-label="VendingFresh Facebook">Facebook</a>
      </div>
    </div>
    <div class="footer__links">
      <h3>{t['footer_links']}</h3>
      <a href="{url('offer', lang)}">{t['nav_offer']}</a>
      <a href="{url('machines', lang)}">{t['nav_machines']}</a>
      <a href="/polityka">{t['footer_privacy']}</a>
      <a href="/">Polski</a>
    </div>
  </div>
  <p class="footer__copy">&copy; <span id="footer-year"></span> Sklep za Stodołą Sp. z o.o. {t['footer_rights']}</p>
</footer>
<div class="call-bar" aria-label="{e(t['footer_contact'])}">
  <a href="tel:{PHONE_TEL}" class="call-bar__call" data-track="telefon_pasek">📞 {t['call']}</a>
  <a href="{url('inquiry', lang)}" class="call-bar__quote" data-track="zapytanie_pasek">{t['nav_cta']} →</a>
</div>
'''
    cookie = f'''<div class="cookie-banner" id="cookie-banner" hidden>
  <p>{t['cookie']} <a href="/polityka">{t['cookie_more']}</a>.</p>
  <div class="cookie-banner__actions">
    <button type="button" id="cookie-accept" class="btn btn--primary">{t['cookie_ok']}</button>
    <button type="button" id="cookie-decline" class="btn btn--secondary">{t['cookie_no']}</button>
  </div>
</div>
'''
    write(f'partials/nav-{lang}.html', nav)
    write(f'partials/footer-{lang}.html', footer)
    write(f'partials/cookie-banner-{lang}.html', cookie)

# ---------------------------------------------------------------- pages
def home(lang):
    t, p = T[lang], P[lang]
    org = {"@context": "https://schema.org", "@type": ["Organization", "LocalBusiness"], "@id": ORG_ID, "name": "VendingFresh", "url": BASE + url('home', lang),
           "logo": BASE + "/vendingfresh_logo.webp", "telephone": PHONE_TEL, "email": EMAIL,
           "address": {"@type": "PostalAddress", "streetAddress": "ul. Warszawska 40/2A", "postalCode": "40-008", "addressLocality": "Katowice", "addressCountry": "PL"}}
    site = {"@context": "https://schema.org", "@type": "WebSite", "name": "VendingFresh", "url": BASE + url('home', lang), "inLanguage": lang, "publisher": {"@id": ORG_ID}}
    tiles = '\n'.join(f'          <a href="{url("sol:" + k, lang)}" class="tile"><span class="tile__icon">{ICON[k]}</span>{t["sol_names"][k]}</a>' for k in SOLUTIONS)
    stats = '\n'.join(f'          <div class="stat"><span class="stat__value">{v}</span><span class="stat__label">{l}</span></div>' for v, l in p['stats'])
    cols = '\n'.join(f'              <div class="col"><h3>{h}</h3><p>{x}</p></div>' for h, x in p['problem_cols'])
    layers = '\n'.join(f'          <div class="layer"><h3>{h}</h3><p>{x}</p></div>' for h, x in p['config_layers'])
    blist = '\n'.join(f'              <li><span aria-hidden="true">{i}</span><div>{x}</div></li>' for i, x in p['brand_list'])
    chips = '\n'.join(f'              <button type="button" class="mat-chip{" is-active" if i == 0 else ""}" data-mat="{i}">{MAT_ICONS[i]} {n}</button>' for i, (n, _) in enumerate(MATS[lang]))
    steps_btn = '\n'.join(f'          <button class="step{" is-active" if i == 0 else ""}" data-step="{i+1}"><span class="step__num">{i+1}</span>{h}</button>' for i, (h, _) in enumerate(p['steps']))
    steps_txt = '\n'.join(f'          <p data-step-detail="{i+1}"{ACT if i == 0 else ""}>{x}</p>' for i, (_, x) in enumerate(p['steps']))
    why = '\n'.join(f'          <li>{x}</li>' for x in p['why'])
    body = f'''    <section class="hero">
      <div class="wrap">
        <div class="hero__grid">
        <div class="hero__content">
        <p class="eyebrow">{p['home_eyebrow']}</p>
        <h1>{p['home_h1']} <em>{p['home_h1_em']}</em></h1>
        <p class="hero__subtitle">{p['home_sub']}</p>
        <div class="hero__cta">
          <a href="{url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
          <a href="{url('offer', lang)}" class="btn btn--secondary">{t['buy']} / {t['rent']}</a>
        </div>
        </div>
        <div class="hero__visual" aria-hidden="true">
          <img width="350" height="500" src="/sielaff/siline-snack-combi/product.webp" alt="">
          <div class="hero__badge hero__badge--a"><span class="hero__badge-icon">🌙</span><span><strong>{p['badge_a'][0]}</strong>{p['badge_a'][1]}</span></div>
          <div class="hero__badge hero__badge--b"><span class="hero__badge-icon">⚙️</span><span><strong>{p['badge_b'][0]}</strong>{p['badge_b'][1]}</span></div>
        </div>
        </div>
        <div class="tiles hero__tiles">
{tiles}
        </div>
      </div>
    </section>

    <div class="stats">
      <div class="wrap">
        <div class="stats__grid">
{stats}
        </div>
      </div>
    </div>

    <section class="section problem">
      <div class="wrap">
        <p class="eyebrow">{p['problem_eyebrow']}</p>
        <div class="split-section">
          <div class="split-section__body">
            <h2>{p['problem_h']} <em>{p['problem_em']}</em></h2>
            <div class="cols-3">
{cols}
            </div>
            <p class="problem__punchline">{p['problem_punch']}</p>
          </div>
          <div class="split-section__media">
            <img width="1200" height="1798" src="/kategorie/pieczywo.webp" alt="" loading="lazy">
          </div>
        </div>
      </div>
    </section>

    <section class="section config-layers">
      <div class="wrap">
        <p class="eyebrow">{p['config_eyebrow']}</p>
        <h2>{p['config_h']} <em>{p['config_em']}</em></h2>
        <p>{p['config_p']}</p>
        <div class="layers-grid">
{layers}
        </div>
      </div>
    </section>

    <section class="section branding" id="branding">
      <div class="wrap">
        <p class="eyebrow">{p['brand_eyebrow']}</p>
        <div class="split-section">
          <div class="split-section__body">
            <h2>{p['brand_h']} <em>{p['brand_em']}</em></h2>
            <p class="branding__lead">{p['brand_lead']}</p>
            <ul class="branding__list">
{blist}
            </ul>
            <div class="mat-chips" role="list">
{chips}
            </div>
          </div>
          {mock(lang, idd='home-' + lang)}
        </div>
      </div>
    </section>
{models_section(lang)}
    <section class="section how">
      <div class="wrap">
        <p class="eyebrow">{p['steps_eyebrow']}</p>
        <h2>{p['steps_h']} <em>{p['steps_em']}</em></h2>
        <div class="steps" id="how-steps">
{steps_btn}
        </div>
        <div class="step-details">
{steps_txt}
        </div>
      </div>
    </section>

    <section class="section why-us">
      <div class="wrap">
        <p class="eyebrow">{p['why_eyebrow']}</p>
        <h2>{p['why_h']} <em>{p['why_em']}</em></h2>
        <ul class="check-list">
{why}
        </ul>
      </div>
    </section>
{cta_final(lang, p['final_h'], p['final_em'])}'''
    rel = f'{lang}/index.html'
    write(rel, head(lang, 'home', p['home_title'], p['home_desc'], ld(org) + ld(site)) + body + foot(lang))
    return rel

def offer(lang):
    t, p = T[lang], P[lang]
    lb = '\n'.join(f'              <li>{x}</li>' for x in p['offer_buy_list'])
    lr = '\n'.join(f'              <li>{x}</li>' for x in p['offer_rent_list'])
    rows = '\n'.join(f'              <tr><th>{a}</th><td>{b}</td><td>{c}</td></tr>' for a, b, c in p['cmp_rows'])
    body = f'''    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">{p['offer_eyebrow']}</p>
        <h1>{p['offer_h1']} <em>{p['offer_h1_em']}</em></h1>
        <p class="hero__subtitle">{p['offer_sub']}</p>
        <div class="hero__cta">
          <a href="{url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="models-grid">
          <article class="model-plan" id="buy">
            <span class="model-plan__icon" aria-hidden="true">🔑</span>
            <h3>{t['buy']}</h3>
            <p class="model-plan__for">{p['offer_buy_for']}</p>
            <ul class="model-plan__list">
{lb}
            </ul>
            <a href="{url('inquiry', lang)}?model=zakup" class="btn btn--secondary">{p['offer_choose_buy']}</a>
          </article>
          <article class="model-plan model-plan--featured" id="rent">
            <span class="model-plan__icon" aria-hidden="true">📅</span>
            <h3>{t['rent']}</h3>
            <p class="model-plan__for">{p['offer_rent_for']}</p>
            <ul class="model-plan__list">
{lr}
            </ul>
            <a href="{url('inquiry', lang)}?model=wynajem" class="btn btn--primary">{p['offer_choose_rent']}</a>
          </article>
        </div>
        <p class="models-note">{SMART[lang]['offer_note']} <a href="{url('machines', lang)}#smart">→</a></p>
        <p class="models-note">{t['abroad']}</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{p['cmp_eyebrow']}</p>
        <h2>{p['cmp_h']} <em>{p['cmp_em']}</em></h2>
        <div class="compare-wrap">
          <table class="compare">
            <thead><tr><th></th><th>{t['buy']}</th><th>{t['rent']}</th></tr></thead>
            <tbody>
{rows}
            </tbody>
          </table>
        </div>
        <p class="calc-disclaimer">{p['cmp_note']}</p>
      </div>
    </section>
{cta_final(lang, p['offer_final_h'], p['offer_final_em'])}'''
    rel = f'{PAGES["offer"][lang]}.html'
    write(rel, head(lang, 'offer', p['offer_title'], p['offer_desc'], ld(crumb(lang, [(t['nav_offer'], url('offer', lang))]))) + body + foot(lang))
    return rel

def inquiry(lang):
    t, p = T[lang], P[lang]
    countries = '\n'.join(f'                <option value="{v}">{n}</option>' for v, n in p['inq_countries'])
    body = f'''    <section class="config-page">
      <div class="wrap">
        <div class="config-intro">
          <p class="eyebrow">{p['inq_eyebrow']}</p>
          <h1>{p['inq_h1']} <em>{p['inq_h1_em']}</em></h1>
          <p>{p['inq_sub']}</p>
        </div>
        <form id="inquiry-form" class="config-step" novalidate data-lang="{lang}" data-thanks="{url('thanks', lang)}"
              data-err-product="{e(p['err_product'])}" data-err-contact="{e(p['err_contact'])}" data-err-consent="{e(p['err_consent'])}" data-err-send="{e(p['err_send'])}">
          <input type="text" name="website" autocomplete="off" tabindex="-1" class="visually-hidden" aria-hidden="true">
          <h2>{p['inq_model']}</h2>
          <div class="config-options">
            <label><input type="radio" name="model" value="zakup" checked> {t['buy']}</label>
            <label><input type="radio" name="model" value="wynajem"> {t['rent']}</label>
          </div>
          <label class="config-field">{p['inq_product']}
            <textarea name="produkt" required placeholder="{e(p['inq_product_ph'])}"></textarea>
          </label>
          <div class="config-row">
            <label class="config-field">{p['inq_country']}
              <select name="kraj">
{countries}
              </select>
            </label>
            <label class="config-field">{p['inq_town']} <input type="text" name="miasto"></label>
          </div>
          <label class="config-field">{p['inq_name']} <input type="text" name="imie" autocomplete="name"></label>
          <div class="config-row">
            <label class="config-field">{p['inq_phone']} <input type="tel" name="telefon" autocomplete="tel"></label>
            <label class="config-field">{p['inq_email']} <input type="email" name="email" autocomplete="email"></label>
          </div>
          <p class="config-hint">{p['inq_hint']}</p>
          <label class="config-checkbox"><input type="checkbox" name="zgoda"> <span>{p['inq_consent']}</span></label>
          <p class="config-error" role="alert"></p>
          <div class="config-nav"><button type="submit" class="btn btn--primary">{p['inq_submit']}</button></div>
          <p class="models-note">{t['abroad']}</p>
        </form>
      </div>
    </section>
'''
    rel = f'{PAGES["inquiry"][lang]}.html'
    write(rel, head(lang, 'inquiry', p['inq_title'], p['inq_desc'], ld(crumb(lang, [(t['nav_cta'], url('inquiry', lang))]))) + body + foot(lang, ('inquiry',)))
    return rel

def thanks(lang):
    p = P[lang]
    body = f'''    <section class="placeholder-page">
      <img class="placeholder-page__logo" width="1745" height="724" src="/vendingfresh_logo.webp" alt="VendingFresh">
      <h1>{p['thx_h1']}</h1>
      <p>{p['thx_p']} <a href="tel:{PHONE_TEL}">{PHONE}</a>.</p>
      <div class="hero__cta" style="justify-content: center; margin-top: 24px;">
        <a class="btn btn--primary" href="{url('home', lang)}">{p['thx_home']}</a>
      </div>
    </section>
'''
    rel = f'{PAGES["thanks"][lang]}.html'
    write(rel, head(lang, 'thanks', p['thx_title'], p['thx_p'], noindex=True) + body + foot(lang))
    return rel

def machines(lang):
    t, m = T[lang], M[lang]
    sections = ''
    for g, ids in GROUPS:
        eyebrow, h, em = m['groups'][g]
        cards = ''
        for mid in ids:
            src, w, hgt = IMGS[mid]
            name = m['fk_name'] if mid == 'fk-series' else NAMES[mid]
            txt, specs = m['models'][mid]
            rows = '\n'.join(f'                <div class="spec-table__row"><dt>{a}</dt><dd>{b}</dd></div>' for a, b in specs)
            cards += f'''
          <div class="model-card model-card--photo" id="{mid}">
            <img class="model-card__img" width="{w}" height="{hgt}" src="{src}" alt="Sielaff {e(name)}" loading="lazy">
            <div class="model-card__body">
              <h3>{name}</h3>
              <p>{txt}</p>
              <dl class="spec-table">
{rows}
              </dl>
            </div>
          </div>'''
        sections += f'''
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{eyebrow}</p>
        <h2>{h} <em>{em}</em></h2>
        <div class="cards-grid">{cards}
        </div>
      </div>
    </section>
'''
    sm = SMART[lang]
    smart_cards = ''.join(f'''
          <article class="model-plan{' model-plan--featured' if i == 0 else ''}{' model-plan--photo' if mid in SMART_IMG else ''}" id="{mid}">
            {f'<img class="model-plan__img" src="{SMART_IMG[mid][0]}" width="{SMART_IMG[mid][1]}" height="{SMART_IMG[mid][2]}" alt="{name}" loading="lazy">' if mid in SMART_IMG else f'<span class="model-plan__icon" aria-hidden="true">{icon}</span>'}
            <h3>{name}</h3>
            <p class="model-plan__for">{txt}</p>
            <ul class="model-plan__list">
{''.join(f'              <li>{x}</li>' + chr(10) for x in bullets)}            </ul>
            <a href="{url('inquiry', lang)}" class="btn btn--{'primary' if i == 0 else 'secondary'}">{t['cta_btn']}</a>
          </article>''' for i, (mid, icon, name, txt, bullets) in enumerate(sm['models']))
    smart = f'''
    <section class="section" id="smart">
      <div class="wrap">
        <p class="eyebrow">{sm['eyebrow']}</p>
        <h2>{sm['h']} <em>{sm['em']}</em></h2>
        <p>{sm['intro']}</p>
        <div class="models-grid">{smart_cards}
        </div>
        <p class="models-note">{sm['note']}</p>
        <p class="eyebrow" style="margin-top:40px">{sm['premium']}</p>
      </div>
    </section>
'''
    sections = smart + sections
    tech = '\n'.join(f'          <li>{x}</li>' for x in m['tech'])
    body = f'''    <section class="hero hero--photo" style="--hero-img: url(/sielaff/outdoor/lifestyle.webp)">
      <div class="wrap">
        <p class="eyebrow">{m['eyebrow']}</p>
        <h1>{m['h1']} <em>{m['h1em']}</em></h1>
        <p class="hero__subtitle">{m['sub']}</p>
        <div class="hero__cta">
          <a href="{url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
        </div>
      </div>
    </section>
{sections}
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{m['tech_eyebrow']}</p>
        <h2>{m['tech_h']} <em>{m['tech_em']}</em></h2>
        <ul class="checklist">
{tech}
        </ul>
      </div>
    </section>
{cta_final(lang, m['final_h'], m['final_em'])}'''
    rel = f'{PAGES["machines"][lang]}.html'
    write(rel, head(lang, 'machines', m['title'], m['desc'], ld(crumb(lang, [(t['nav_machines'], url('machines', lang))]))) + body + foot(lang))
    return rel

def solution(lang, key):
    t, sec, spec = T[lang], SEC[lang], S[key]
    c = spec[lang]
    page = 'sol:' + key
    if key in IMG:
        hero = f'''    <section class="hero hero--photo" style="--hero-img: url({IMG[key]})">
      <div class="wrap">
        <p class="eyebrow">{sec['eyebrow']}</p>
        <h1>{c['h1']} <em>{c['h1em']}</em></h1>
        <p class="hero__subtitle">{c['sub']}</p>
        <div class="hero__cta">
          <a href="{url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
          <a href="{url('offer', lang)}" class="btn btn--secondary">{t['buy']} / {t['rent']}</a>
        </div>
      </div>
    </section>
'''
    else:
        fixed = spec['mock'] if isinstance(spec['mock'], int) else None
        hero = f'''    <section class="hero">
      <div class="wrap">
        <div class="hero__grid">
          <div class="hero__content">
            <p class="eyebrow">{sec['eyebrow']}</p>
            <h1>{c['h1']} <em>{c['h1em']}</em></h1>
            <p class="hero__subtitle">{c['sub']}</p>
            <div class="hero__cta">
              <a href="{url('inquiry', lang)}" class="btn btn--primary">{t['cta_btn']}</a>
              <a href="{url('offer', lang)}" class="btn btn--secondary">{t['buy']} / {t['rent']}</a>
            </div>
          </div>
          <div class="hero__visual hero__visual--mock">
          {mock(lang, fixed, idd=key + '-' + lang)}
          </div>
        </div>
      </div>
    </section>
'''
    model = ''
    if spec['model']:
        name, img, anchor = spec['model']
        rows = '\n'.join(f'              <div class="spec-table__row"><dt>{a}</dt><dd>{b}</dd></div>' for a, b in c['specs'])
        model = f'''
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{sec['model_eyebrow']}</p>
        <h2>{name}</h2>
        <div class="model-card model-card--photo model-card--compact">
          <img class="model-card__img" width="350" height="500" src="{img}" alt="Sielaff {e(name)}" loading="lazy">
          <div class="model-card__body">
            <p>{c['model_txt']}</p>
            <dl class="spec-table">
{rows}
            </dl>
            <a href="{url('machines', lang)}#{anchor}" class="model-card__link">{sec['model_link']}</a>
          </div>
        </div>
      </div>
    </section>
'''
    layers = '\n'.join(f'          <div class="layer"><h3>{h}</h3><p>{x}</p></div>' for h, x in c['layers'])
    watch = '\n'.join(f'          <li>{x}</li>' for x in c['watch'])
    basket = '\n'.join(f'          <div class="family-card"><h3>{h}</h3><p>{x}</p></div>' for h, x in c['basket'])
    faq = '\n'.join(f'          <div class="layer"><h3>{q}</h3><p>{a}</p></div>' for q, a in c['faq'])
    basket_h = sec['basket_h_any'] if key == 'automat-na-wszystko' else sec['basket_h']
    cfg_h = '' if key == 'automat-na-wszystko' else sec['cfg_h']
    body = hero + model + f'''
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{sec['who_eyebrow']}</p>
        <h2>{c['who_h']} <em>{c['who_em']}</em></h2>
        <p>{c['who_p']}</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{sec['cfg_eyebrow']}</p>
        <h2>{cfg_h} <em>{c['cfg_em']}</em></h2>
        <p>{sec['cfg_p']}</p>
        <div class="layers-grid">
{layers}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{sec['watch_eyebrow']}</p>
        <h2>{sec['watch_h']} <em>{sec['watch_em']}</em></h2>
        <ul class="checklist">
{watch}
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{sec['basket_eyebrow']}</p>
        <h2>{basket_h} <em>{c['basket_em']}</em></h2>
        <div class="cards-grid">
{basket}
        </div>
      </div>
    </section>
{models_section(lang)}
    <section class="section">
      <div class="wrap">
        <p class="eyebrow">{t['faq_eyebrow']}</p>
        <h2>{t['faq_h']} <em>{t['faq_em']}</em></h2>
        <div class="layers-grid">
{faq}
        </div>
      </div>
    </section>
{cta_final(lang, c['cta_h'], c['cta_em'])}'''
    service = {"@context": "https://schema.org", "@type": "Service", "name": f"{c['h1']} {c['h1em']}".strip(" —"), "description": c['desc'],
               "url": BASE + url(page, lang), "areaServed": [{"@type": "Country", "name": n} for n in ('Czechia', 'Slovakia', 'Poland')],
               "provider": {"@type": "Organization", "@id": ORG_ID, "name": "VendingFresh"}}
    extra = ld(crumb(lang, [(t['sol_names'][key], url(page, lang))])) + ld(service) + ld(faq_ld(c['faq']))
    rel = f'{PAGES[page][lang]}.html'
    write(rel, head(lang, page, c['title'], c['desc'], extra) + body + foot(lang))
    return rel

# ---------------------------------------------------------------- wiring
def polish_alternates():
    """Adds hreflang links to the Polish pages that have translations (idempotent)."""
    for page, paths in PAGES.items():
        if page == 'thanks':
            continue
        rel = 'index.html' if paths['pl'] == '' else paths['pl'] + '.html'
        path = os.path.join(ROOT, rel)
        s = open(path, encoding='utf-8').read()
        s = re.sub(r'  <link rel="alternate" hreflang="[^"]+" href="[^"]+">\n', '', s)
        s = s.replace('  <link rel="icon" type="image/png" sizes="32x32"', alternates(page) + '  <link rel="icon" type="image/png" sizes="32x32"', 1)
        open(path, 'w', encoding='utf-8').write(s)

def polish_nav_switcher():
    path = os.path.join(ROOT, 'partials/nav.html')
    s = open(path, encoding='utf-8').read()
    s = re.sub(r'      <div class="nav__dropdown nav__lang">.*?\n      </div>\n', '', s, flags=re.S)
    s = s.replace('      <a href="/kontakt" class="nav__cta">', lang_switcher('pl') + '      <a href="/kontakt" class="nav__cta">', 1)
    open(path, 'w', encoding='utf-8').write(s)

def wire(files):
    # vite inputs
    vpath = os.path.join(ROOT, 'vite.config.ts')
    v = open(vpath, encoding='utf-8').read()
    v = re.sub(r"        i18n_[A-Za-z0-9_]+: resolve\(__dirname, '[^']+'\),\n", '', v)
    lines = ''.join(f"        i18n_{re.sub(r'[^A-Za-z0-9]', '_', f[:-5])}: resolve(__dirname, '{f}'),\n" for f in files)
    v = v.replace("      },\n    },\n  },\n});", lines + "      },\n    },\n  },\n});", 1)
    open(vpath, 'w', encoding='utf-8').write(v)
    # vercel rewrites
    vpath = os.path.join(ROOT, 'vercel.json')
    cfg = json.load(open(vpath, encoding='utf-8'))
    langs_re = re.compile(r'^/(en|cs|sk)(/|$)')
    cfg['rewrites'] = [r for r in cfg['rewrites'] if not langs_re.match(r['source'])]
    for f in files:
        src = '/' + (f[:-len('/index.html')] if f.endswith('/index.html') else f[:-5])
        cfg['rewrites'].append({"source": src, "destination": '/' + f})
    open(vpath, 'w', encoding='utf-8').write(json.dumps(cfg, ensure_ascii=False, indent=2) + '\n')
    # sitemap
    spath = os.path.join(ROOT, 'public/sitemap.xml')
    sm = open(spath, encoding='utf-8').read()
    sm = re.sub(r'  <url>\n    <loc>https://vendingfresh\.pl/(en|cs|sk)(/[^<]*)?</loc>.*?</url>\n', '', sm, flags=re.S)
    entries = ''
    for f in files:
        if '/thank-you' in f or '/dekujeme' in f or '/dakujeme' in f:
            continue
        loc = BASE + '/' + (f[:-len('/index.html')] if f.endswith('/index.html') else f[:-5])
        entries += f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>2026-09-25</lastmod>\n    <priority>0.6</priority>\n  </url>\n'
    sm = sm.replace('</urlset>', entries + '</urlset>')
    open(spath, 'w', encoding='utf-8').write(sm)

if __name__ == '__main__':
    files = []
    for lang in LANGS:
        partials(lang)
        files += [home(lang), offer(lang), inquiry(lang), machines(lang), thanks(lang)]
        files += [solution(lang, k) for k in SOLUTIONS]
    polish_alternates()
    polish_nav_switcher()
    wire(files)
    print(f'generated {len(files)} pages')
