# -*- coding: utf-8 -*-
"""Shared strings and URL map for the EN / CS / SK versions of the site."""

LANGS = ['en', 'cs', 'sk']
HTML_LANG = {'pl': 'pl', 'en': 'en', 'cs': 'cs', 'sk': 'sk'}
LOCALE = {'en': 'en_GB', 'cs': 'cs_CZ', 'sk': 'sk_SK'}

# page key -> Polish path + per-language path (all without trailing slash, home = "")
SOLUTIONS = ['pieczywo', 'jajka', 'sery', 'ziemniaki-warzywa', 'bio-lokalne', 'mieso-dania', 'napoje', 'kwiaty', 'ciastka', 'automat-na-wszystko']
SOL_SLUG = {
    'en': {'pieczywo': 'bread', 'jajka': 'eggs', 'sery': 'cheese-dairy', 'ziemniaki-warzywa': 'potatoes-vegetables', 'bio-lokalne': 'organic-local',
           'mieso-dania': 'meat-ready-meals', 'napoje': 'drinks', 'kwiaty': 'flowers', 'ciastka': 'cakes', 'automat-na-wszystko': 'anything'},
    'cs': {'pieczywo': 'pecivo', 'jajka': 'vejce', 'sery': 'syry-mlecne-vyrobky', 'ziemniaki-warzywa': 'brambory-zelenina', 'bio-lokalne': 'bio-lokalni',
           'mieso-dania': 'maso-hotova-jidla', 'napoje': 'napoje', 'kwiaty': 'kvetiny', 'ciastka': 'zakusky', 'automat-na-wszystko': 'cokoliv'},
    'sk': {'pieczywo': 'pecivo', 'jajka': 'vajcia', 'sery': 'syry-mliecne-vyrobky', 'ziemniaki-warzywa': 'zemiaky-zelenina', 'bio-lokalne': 'bio-lokalne',
           'mieso-dania': 'maso-hotove-jedla', 'napoje': 'napoje', 'kwiaty': 'kvety', 'ciastka': 'zakusky', 'automat-na-wszystko': 'cokolvek'},
}
SOL_DIR = {'en': 'solutions', 'cs': 'reseni', 'sk': 'riesenia'}
PAGES = {
    'home':     {'pl': '', 'en': 'en', 'cs': 'cs', 'sk': 'sk'},
    'offer':    {'pl': 'oferta', 'en': 'en/offer', 'cs': 'cs/nabidka', 'sk': 'sk/ponuka'},
    'inquiry':  {'pl': 'konfigurator', 'en': 'en/inquiry', 'cs': 'cs/poptavka', 'sk': 'sk/dopyt'},
    'machines': {'pl': 'automaty-sielaff', 'en': 'en/sielaff-machines', 'cs': 'cs/automaty-sielaff', 'sk': 'sk/automaty-sielaff'},
    'thanks':   {'pl': 'dziekujemy', 'en': 'en/thank-you', 'cs': 'cs/dekujeme', 'sk': 'sk/dakujeme'},
}
for key in SOLUTIONS:
    PAGES['sol:' + key] = {'pl': 'rozwiazania/' + key, **{l: f'{l}/{SOL_DIR[l]}/{SOL_SLUG[l][key]}' for l in LANGS}}

def url(page, lang):
    return '/' + PAGES[page][lang]

IMG = {'pieczywo': '/kategorie/pieczywo.webp', 'jajka': '/kategorie/jajka.webp', 'sery': '/kategorie/sery.webp',
       'ziemniaki-warzywa': '/kategorie/ziemniaki-warzywa.webp', 'bio-lokalne': '/kategorie/bio-lokalne.webp',
       'mieso-dania': '/kategorie/mieso-dania.webp', 'napoje': '/kategorie/napoje.webp'}
ICON = {'pieczywo': '🍞', 'jajka': '🥚', 'sery': '🧀', 'ziemniaki-warzywa': '🥔', 'bio-lokalne': '🌱', 'mieso-dania': '🥩',
        'napoje': '🧃', 'kwiaty': '🌷', 'ciastka': '🧁', 'automat-na-wszystko': '✨'}

T = {
 'en': {
  'lang_name': 'English',
  'nav_offer': 'Offer', 'nav_solutions': 'Solutions', 'nav_machines': 'Sielaff machines', 'nav_cta': 'Send an inquiry',
  'sol_names': {'pieczywo': 'Bread', 'jajka': 'Eggs', 'sery': 'Cheese & dairy', 'ziemniaki-warzywa': 'Potatoes & vegetables',
                'bio-lokalne': 'Organic & local', 'mieso-dania': 'Meat & ready meals', 'napoje': 'Drinks', 'kwiaty': 'Flowers',
                'ciastka': 'Cakes & pastries', 'automat-na-wszystko': 'Anything else'},
  'logo_alt': 'VendingFresh — vending machines tailored to your product',
  'footer_brand': '<strong>VendingFresh</strong> — a brand of Sklep za Stodołą Sp. z o.o., Katowice, Poland',
  'footer_partner': 'Sielaff partner · every machine tailored to your product',
  'footer_contact': 'Contact', 'footer_phone': 'Phone', 'footer_links': 'Links',
  'footer_privacy': 'Privacy policy (in Polish)', 'footer_rights': 'All rights reserved.',
  'abroad': 'We are based in Poland and welcome inquiries from Czechia, Slovakia and beyond — tell us where the machine should stand and we will let you know whether we can serve your location.',
  'cookie': 'We use cookies for analytics.', 'cookie_more': 'Learn more (in Polish)', 'cookie_ok': 'Accept', 'cookie_no': 'Decline',
  'cta_btn': 'Send an inquiry →', 'call': 'Call us',
  'cta_sub': 'Size, compartments, temperatures, wrap — we tailor literally everything. Buy it or rent it.',
  'buy': 'Buy', 'rent': 'Rent',
  'buy_txt': 'The machine is yours — pay up front or in leasing. You restock it and keep all the profit.',
  'rent_txt': 'Rent a machine tailored to your product, restock it with your own goods and pay a fixed monthly fee.',
  'models_h': 'Buy', 'models_em': 'or rent.', 'models_eyebrow': 'How do you want it?', 'compare': 'Compare options →',
  'faq_eyebrow': 'FAQ', 'faq_h': 'Frequently asked', 'faq_em': 'questions.',
  'home_crumb': 'Home',
 },
 'cs': {
  'lang_name': 'Čeština',
  'nav_offer': 'Nabídka', 'nav_solutions': 'Řešení', 'nav_machines': 'Automaty Sielaff', 'nav_cta': 'Poslat poptávku',
  'sol_names': {'pieczywo': 'Pečivo', 'jajka': 'Vejce', 'sery': 'Sýry a mléčné výrobky', 'ziemniaki-warzywa': 'Brambory a zelenina',
                'bio-lokalne': 'Bio a lokální', 'mieso-dania': 'Maso a hotová jídla', 'napoje': 'Nápoje', 'kwiaty': 'Květiny',
                'ciastka': 'Zákusky a dorty', 'automat-na-wszystko': 'Cokoliv jiného'},
  'logo_alt': 'VendingFresh — prodejní automaty na míru vašemu produktu',
  'footer_brand': '<strong>VendingFresh</strong> — značka společnosti Sklep za Stodołą Sp. z o.o., Katovice, Polsko',
  'footer_partner': 'Partner Sielaff · každý automat na míru vašemu produktu',
  'footer_contact': 'Kontakt', 'footer_phone': 'Telefon', 'footer_links': 'Odkazy',
  'footer_privacy': 'Zásady ochrany osobních údajů (polsky)', 'footer_rights': 'Všechna práva vyhrazena.',
  'abroad': 'Sídlíme v Polsku a rádi přijímáme poptávky z Česka, Slovenska i odjinud — napište nám, kde má automat stát, a dáme vám vědět, zda vaši lokalitu obsloužíme.',
  'cookie': 'Soubory cookie používáme pro analýzu návštěvnosti.', 'cookie_more': 'Více informací (polsky)', 'cookie_ok': 'Souhlasím', 'cookie_no': 'Odmítnout',
  'cta_btn': 'Poslat poptávku →', 'call': 'Zavolat',
  'cta_sub': 'Velikost, přihrádky, teploty, polep — přizpůsobíme doslova všechno. Automat koupíte, nebo si ho pronajmete.',
  'buy': 'Koupě', 'rent': 'Pronájem',
  'buy_txt': 'Automat je váš — zaplatíte hned, nebo na leasing. Doplňujete ho sami a celý zisk zůstává vám.',
  'rent_txt': 'Pronajmete si automat na míru vašemu produktu, doplňujete ho vlastním zbožím a platíte pevný měsíční poplatek.',
  'models_h': 'Kupte', 'models_em': 'nebo si pronajměte.', 'models_eyebrow': 'Jak ho chcete mít?', 'compare': 'Porovnat možnosti →',
  'faq_eyebrow': 'FAQ', 'faq_h': 'Časté', 'faq_em': 'otázky.',
  'home_crumb': 'Úvod',
 },
 'sk': {
  'lang_name': 'Slovenčina',
  'nav_offer': 'Ponuka', 'nav_solutions': 'Riešenia', 'nav_machines': 'Automaty Sielaff', 'nav_cta': 'Poslať dopyt',
  'sol_names': {'pieczywo': 'Pečivo', 'jajka': 'Vajcia', 'sery': 'Syry a mliečne výrobky', 'ziemniaki-warzywa': 'Zemiaky a zelenina',
                'bio-lokalne': 'Bio a lokálne', 'mieso-dania': 'Mäso a hotové jedlá', 'napoje': 'Nápoje', 'kwiaty': 'Kvety',
                'ciastka': 'Zákusky a torty', 'automat-na-wszystko': 'Čokoľvek iné'},
  'logo_alt': 'VendingFresh — predajné automaty na mieru vášmu produktu',
  'footer_brand': '<strong>VendingFresh</strong> — značka spoločnosti Sklep za Stodołą Sp. z o.o., Katovice, Poľsko',
  'footer_partner': 'Partner Sielaff · každý automat na mieru vášmu produktu',
  'footer_contact': 'Kontakt', 'footer_phone': 'Telefón', 'footer_links': 'Odkazy',
  'footer_privacy': 'Zásady ochrany osobných údajov (po poľsky)', 'footer_rights': 'Všetky práva vyhradené.',
  'abroad': 'Sídlime v Poľsku a radi prijímame dopyty zo Slovenska, Česka aj odinakiaľ — napíšte nám, kde má automat stáť, a dáme vám vedieť, či vašu lokalitu obslúžime.',
  'cookie': 'Súbory cookie používame na analýzu návštevnosti.', 'cookie_more': 'Viac informácií (po poľsky)', 'cookie_ok': 'Súhlasím', 'cookie_no': 'Odmietnuť',
  'cta_btn': 'Poslať dopyt →', 'call': 'Zavolať',
  'cta_sub': 'Veľkosť, priehradky, teploty, polep — prispôsobíme doslova všetko. Automat si kúpite alebo prenajmete.',
  'buy': 'Kúpa', 'rent': 'Prenájom',
  'buy_txt': 'Automat je váš — zaplatíte hneď alebo na leasing. Dopĺňate ho sami a celý zisk zostáva vám.',
  'rent_txt': 'Prenajmete si automat na mieru vášmu produktu, dopĺňate ho vlastným tovarom a platíte pevný mesačný poplatok.',
  'models_h': 'Kúpte', 'models_em': 'alebo si prenajmite.', 'models_eyebrow': 'Ako ho chcete mať?', 'compare': 'Porovnať možnosti →',
  'faq_eyebrow': 'FAQ', 'faq_h': 'Časté', 'faq_em': 'otázky.',
  'home_crumb': 'Úvod',
 },
}

# Wrapped-machine mock (same order/colours as the Polish one in src/main.ts)
MATS = {
 'en': [('Bread 24/7', 'fresh from the oven'), ('Flowers 24/7', 'bouquets any time'), ('Cake 24/7', 'sweet any time'),
        ('Eggs 24/7', 'straight from the farm'), ('Cheese 24/7', 'dairy from the farm'), ('Anything 24/7', 'your product')],
 'cs': [('Chlebomat', 'čerstvé pečivo 24/7'), ('Květomat', 'kytice 24/7'), ('Dortomat', 'sladce 24/7'),
        ('Vajíčkomat', 'přímo z farmy'), ('Sýromat', 'mléčné z farmy'), ('Všechnomat', 'váš produkt 24/7')],
 'sk': [('Chlebomat', 'čerstvé pečivo 24/7'), ('Kvetomat', 'kytice 24/7'), ('Tortomat', 'sladko 24/7'),
        ('Vajcomat', 'priamo z farmy'), ('Syromat', 'mliečne z farmy'), ('Všetkomat', 'váš produkt 24/7')],
}
MAT_COLORS = [('#B8742A', '#F2D29B'), ('#C2466B', '#FFD1DC'), ('#8E5BA8', '#F6D5FF'), ('#C98A12', '#FFF0C2'), ('#2F7D4E', '#F3E3A6'), ('#0E5C5C', '#F3E3A6')]
MAT_ICONS = ['🥖', '🌷', '🧁', '🥚', '🧀', '✨']
