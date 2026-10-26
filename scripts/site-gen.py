#!/usr/bin/env python3
"""Generates the static site for tinnara.app (GitHub Pages) into ../tinnara-site (or $OUT).
Usage: python3 scripts/site-gen.py [out_dir]  — then copy a web build into <out>/demo/ if wanted.
Same layout and style.css as furkeep-site/abonnia-site; only copy, colours and the mark differ."""
import os, sys, shutil, datetime

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "tinnara-site")
DOMAIN = "tinnara.app"; BRAND = "#2E3B55"; UPDATED = datetime.date.today().strftime("%-d %B %Y"); UPDATED_DA = datetime.date.today().strftime("%-d. %B %Y")
MARK = '<svg viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7BC55"/><stop offset="1" stop-color="#D97B29"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><g fill="none" stroke="#2E3B55" stroke-linecap="round" stroke-width="5.5"><path d="M17 27 C17 15 25 10 32 10 C41 10 46 17 46 25 C46 31 42 34 40 37 C37 40 38 44 34 48 C31 51 26 52 23 48"/><path d="M25 27 C25 21 28 18 32 18 C37 18 39 21 39 25 C38 29 34 30 33 33"/></g><g fill="none" stroke="#FFF8EC" stroke-linecap="round" stroke-width="3.5"><path d="M50 20 a8 8 0 0 1 0 11"/><path d="M55 15 a15 15 0 0 1 0 21" opacity=".72"/></g></svg>'
FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7BC55"/><stop offset="1" stop-color="#D97B29"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#g)"/><g fill="none" stroke="#2E3B55" stroke-linecap="round" stroke-width="5.5"><path d="M17 27 C17 15 25 10 32 10 C41 10 46 17 46 25 C46 31 42 34 40 37 C37 40 38 44 34 48 C31 51 26 52 23 48"/><path d="M25 27 C25 21 28 18 32 18 C37 18 39 21 39 25 C38 29 34 30 33 33"/></g><g fill="none" stroke="#FFF8EC" stroke-linecap="round" stroke-width="3.5"><path d="M50 20 a8 8 0 0 1 0 11"/><path d="M55 15 a15 15 0 0 1 0 21" opacity=".72"/></g></svg>'

STYLE = """:root{--bg:#f6f4ef;--fg:#1a1e28;--muted:#6a7080;--card:#fff;--brand:#2E3B55;--max:760px}
@media(prefers-color-scheme:dark){:root{--bg:#11151e;--fg:#eceef3;--muted:#9aa1b0;--card:#1a2130;--brand:#F2A94B}}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--fg);line-height:1.6}
header,main,footer{max-width:var(--max);margin:0 auto;padding:0 20px}
header{display:flex;align-items:center;justify-content:space-between;padding-top:20px;padding-bottom:12px}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;text-decoration:none;color:var(--fg);font-size:1.15rem}.logo svg{width:32px;height:32px}
nav a{color:var(--muted);text-decoration:none;margin-left:16px;font-size:.95rem}nav a:hover{color:var(--brand)}
.hero{padding:56px 0 32px}.hero h1{font-size:2.4rem;line-height:1.15;margin:0 0 12px}.hero p{font-size:1.15rem;color:var(--muted);max-width:560px}
.badges{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}.badge{display:inline-block;padding:12px 18px;border-radius:12px;background:var(--fg);color:var(--bg);text-decoration:none;font-weight:600}.badge.soon{opacity:.5}
.badge small{display:block;font-weight:400;font-size:.75rem;opacity:.8}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:32px 0}
.card{background:var(--card);border-radius:16px;padding:20px}.card h3{margin:0 0 6px;font-size:1.05rem}.card p{margin:0;color:var(--muted);font-size:.95rem}
.privacy-callout{border-left:4px solid var(--brand);padding:12px 16px;background:var(--card);border-radius:0 12px 12px 0;margin:24px 0}
.shots{display:flex;gap:12px;overflow-x:auto;padding:8px 0 16px}.shots img{height:420px;border-radius:18px;flex:none;box-shadow:0 8px 30px rgba(0,0,0,.15)}
.disclaimer{font-size:.9rem;color:var(--muted);border-top:1px solid #8884;padding-top:16px;margin-top:32px}
h2{margin-top:36px}article h2{font-size:1.25rem}article h3{font-size:1.05rem;margin-top:24px}.muted{color:var(--muted)}
footer{padding:40px 20px;color:var(--muted);font-size:.9rem;border-top:1px solid #ddd3;margin-top:48px}footer a{color:var(--muted)}.lang{font-size:.85rem}
@media(max-width:600px){.hero h1{font-size:1.9rem}.shots img{height:340px}}
"""

def page(lang, path, title, desc, body, alt):
    other = "da" if lang == "en" else "en"
    nav = {"en": ("Privacy", "Terms", "Support"), "da": ("Privatliv", "Vilkår", "Support")}[lang]
    pre = "" if lang == "en" else "/da"
    opre = "" if other == "en" else "/da"
    foot = {"en": f"© 2026 Therkildsen Group · CVR 46203798 · Tinnara is an <a href=\"https://ilumie.com\">Ilumie</a> app · <a href=\"mailto:support@{DOMAIN}\">support@{DOMAIN}</a>",
            "da": f"© 2026 Therkildsen Group · CVR 46203798 · Tinnara er en <a href=\"https://ilumie.com\">Ilumie</a>-app · <a href=\"mailto:support@{DOMAIN}\">support@{DOMAIN}</a>"}[lang]
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{desc}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css">
<link rel="alternate" hreflang="en" href="https://{DOMAIN}{alt}"><link rel="alternate" hreflang="da" href="https://{DOMAIN}/da{alt}"></head><body>
<header><a class="logo" href="{pre}/">{MARK}Tinnara</a><nav><a href="{pre}/privacy">{nav[0]}</a><a href="{pre}/terms">{nav[1]}</a><a href="{pre}/support">{nav[2]}</a><a class="lang" href="{opre}{alt}">{other.upper()}</a></nav></header>
<main>{body}</main>
<footer>{foot}</footer>
</body></html>"""

def shots(lang):
    return '<div class="shots">' + "".join(f'<img src="/store-assets/{lang}/store-iphone-6.7-{i}.png" alt="" loading="lazy">' for i in range(1, 7)) + "</div>"

INDEX = {
"en": ("Tinnara – private tinnitus diary & tracker", "One number a day, one tap when it spikes. See how sleep, stress and noise line up with your tinnitus, and take a PDF to your doctor. No account.", f"""
<section class="hero"><h1>The tinnitus diary you'll actually keep.</h1>
<p>How loud was it today, 0–10? Five seconds in the evening. Over weeks, that number becomes a curve – and a PDF your doctor or ENT can read in a minute.</p>
<div class="badges"><span class="badge soon">App Store<small>Coming soon</small></span><span class="badge soon">Google Play<small>Coming soon</small></span></div></section>
{shots("en")}
<div class="features">
<div class="card"><h3>One number a day</h3><p>Loudness 0–10, plus bother, sleep, stress and how noisy the day was. Five seconds.</p></div>
<div class="card"><h3>Louder now</h3><p>One tap logs a spike. How it sounds, which ear, what set it off and what helped can wait.</p></div>
<div class="card"><h3>What makes it louder</h3><p>Your curve over 90 days, and how poor nights, stress and loud days line up with your louder days.</p></div>
<div class="card"><h3>Made for the doctor's visit</h3><p>A PDF with your profile, week-by-week numbers and one row per spike.</p></div>
</div>
<div class="privacy-callout"><strong>Private by design.</strong> No account, no cloud, no analytics. Your diary lives on your phone; only you can export it.</div>
<section><h2>When to see a doctor quickly</h2><p>Sudden hearing loss in one ear, tinnitus with sudden severe dizziness or facial weakness, or tinnitus after a head injury need a doctor the same day. Tinnara shows this in the app too – a diary is never a reason to wait.</p></section>
<section><h2>Free and Pro</h2><p>Daily check-ins, spikes, the calendar and the widget are free, forever. Tinnara Pro adds your curve, patterns, the PDF report, PIN lock, backup and unlimited history – yearly with a 7-day free trial, or one lifetime purchase. No ads, ever.</p></section>
<p class="disclaimer">Tinnara is a self-observation diary, not a medical device. It does not diagnose or recommend treatment. Talk to your doctor about what you log.</p>"""),
"da": ("Tinnara – privat tinnitusdagbog", "Ét tal om dagen, ét tryk når den blusser op. Se hvordan søvn, stress og støj hænger sammen med din tinnitus, og tag en PDF med til lægen. Ingen konto.", f"""
<section class="hero"><h1>Tinnitusdagbogen, du faktisk får ført.</h1>
<p>Hvor høj var den i dag, 0–10? Fem sekunder om aftenen. Over uger bliver tallet til en kurve – og en PDF, lægen kan læse på et minut.</p>
<div class="badges"><span class="badge soon">App Store<small>Kommer snart</small></span><span class="badge soon">Google Play<small>Kommer snart</small></span></div></section>
{shots("da")}
<div class="features">
<div class="card"><h3>Ét tal om dagen</h3><p>Lydstyrke 0–10 plus gene, søvn, stress og hvor støjende dagen var. Fem sekunder.</p></div>
<div class="card"><h3>Højere nu</h3><p>Ét tryk logger et udbrud. Lyd, øre, hvad der satte det i gang, og hvad der hjalp, kan vente.</p></div>
<div class="card"><h3>Hvad gør den højere</h3><p>Din kurve over 90 dage, og hvordan dårlige nætter, stress og støjende dage hænger sammen med højere dage.</p></div>
<div class="card"><h3>Lavet til lægebesøget</h3><p>En PDF med din profil, tal uge for uge og én linje pr. udbrud.</p></div>
</div>
<div class="privacy-callout"><strong>Privat fra start.</strong> Ingen konto, ingen sky, ingen analytics. Din dagbog ligger på din telefon; kun du kan eksportere den.</div>
<section><h2>Hvornår skal du hurtigt til lægen</h2><p>Pludseligt høretab på det ene øre, tinnitus med pludselig voldsom svimmelhed eller lammelse i ansigtet, eller tinnitus efter et slag mod hovedet kræver læge samme dag. Tinnara viser det også i appen – en dagbog er aldrig en grund til at vente.</p></section>
<section><h2>Gratis og Pro</h2><p>Daglige check-ins, udbrud, kalender og widget er gratis – for altid. Tinnara Pro giver din kurve, mønstre, PDF-rapporten, PIN-lås, backup og ubegrænset historik – årligt med 7 dages gratis prøve eller ét livstidskøb. Aldrig reklamer.</p></section>
<p class="disclaimer">Tinnara er en selvobservations-dagbog, ikke medicinsk udstyr. Den stiller ikke diagnoser og anbefaler ikke behandling. Tal med din læge om det, du logger.</p>"""),
}
PRIVACY = {
"en": ("Privacy policy – Tinnara", "Tinnara stores all data on your device and collects nothing.", f"""<article><h1>Privacy policy</h1><p class="muted">Last updated {UPDATED}</p>
<p>Tinnara is a tinnitus diary. Health data is the most private data there is, so the app is built so that we never see it. This policy explains what that means in practice.</p>
<h2>Who we are</h2><p>Tinnara is published by Therkildsen Group, CVR 46203798, Teglkrogen 10, 8800 Viborg, Denmark, under the Ilumie brand. Contact: <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a>.</p>
<h2>Where your diary lives</h2><p>Everything you log – daily loudness, spikes, sounds, triggers, notes, medication and aids – is stored in a database on your device only. There is no account and no server. Nothing is sent to us, and nothing is stored in iCloud or Google Drive by the app.</p>
<h2>What we collect</h2><p>Nothing. Tinnara contains no analytics, no advertising SDKs and no crash reporting that identifies you.</p>
<h2>Purchases</h2><p>If you buy Tinnara Pro, the purchase is handled by Apple or Google. To check that a purchase is valid, the app uses RevenueCat, which receives an anonymous app user id and the purchase receipt – never your diary. Purchase history is therefore processed by Apple/Google and RevenueCat as data processors.</p>
<h2>Air pressure (optional, Pro)</h2><p>If you turn on air pressure, you type the name of a town. Only that town's coordinates are sent to Open-Meteo (a free weather service without accounts or tracking) to fetch daily air pressure. Tinnara never reads your device's location.</p>
<h2>Backup and PDF</h2><p>Backup files are encrypted with a passphrase you choose and shared by you through your phone's share sheet. PDF reports are created on your device and shared only where you send them.</p>
<h2 id="deletion">Data deletion</h2><p>Tinnara has no accounts and no server-side data, so you delete it yourself:</p><ul><li><strong>Delete all data in the app:</strong> Settings → Your data → Delete all data.</li><li><strong>Uninstall the app:</strong> removes the app and all its data from the device.</li><li><strong>Backup files and PDFs</strong> you exported are under your control; delete them wherever you saved them.</li></ul><p>Purchase records are held by Apple or Google under your store account, and an anonymous purchase identifier by RevenueCat. If you want the RevenueCat record erased, e-mail <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a> and we will request deletion within 30 days.</p>
<h2>Not a medical device</h2><p>Tinnara is a self-observation diary. It does not diagnose, does not test your hearing and does not recommend treatment.</p>
<h2>Children</h2><p>Tinnara is not directed at children under 13 and does not knowingly collect data from them (it collects none from anyone).</p>
<h2>Changes</h2><p>If this policy changes, the date above changes and the new version is published here.</p></article>"""),
"da": ("Privatlivspolitik – Tinnara", "Tinnara gemmer alle data på din enhed og indsamler intet.", f"""<article><h1>Privatlivspolitik</h1><p class="muted">Sidst opdateret {UPDATED_DA}</p>
<p>Tinnara er en tinnitusdagbog. Helbredsdata er de mest private data, der findes, så appen er bygget, så vi aldrig ser dem. Denne politik forklarer, hvad det betyder i praksis.</p>
<h2>Hvem vi er</h2><p>Tinnara udgives af Therkildsen Group, CVR 46203798, Teglkrogen 10, 8800 Viborg, under brandet Ilumie. Kontakt: <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a>.</p>
<h2>Hvor din dagbog ligger</h2><p>Alt, du logger – daglig lydstyrke, udbrud, lyde, triggere, noter, medicin og hjælpemidler – gemmes kun i en database på din enhed. Der er ingen konto og ingen server. Intet sendes til os, og appen gemmer intet i iCloud eller Google Drev.</p>
<h2>Hvad vi indsamler</h2><p>Intet. Tinnara indeholder ingen analytics, ingen reklame-SDK'er og ingen fejlrapportering, der identificerer dig.</p>
<h2>Køb</h2><p>Køber du Tinnara Pro, håndteres købet af Apple eller Google. For at kontrollere købet bruger appen RevenueCat, som modtager et anonymt app-bruger-id og kvitteringen – aldrig din dagbog. Købshistorik behandles derfor af Apple/Google og RevenueCat som databehandlere.</p>
<h2>Lufttryk (valgfrit, Pro)</h2><p>Slår du lufttryk til, skriver du navnet på en by. Kun byens koordinater sendes til Open-Meteo (en gratis vejrtjeneste uden konti eller sporing) for at hente dagligt lufttryk. Tinnara læser aldrig din enheds placering.</p>
<h2>Backup og PDF</h2><p>Backup-filer krypteres med en adgangsfrase, du selv vælger, og deles af dig via telefonens delingsark. PDF-rapporter laves på din enhed og deles kun dér, hvor du sender dem.</p>
<h2 id="deletion">Sletning af data</h2><p>Tinnara har ingen konti og ingen data på servere, så du sletter selv:</p><ul><li><strong>Slet alle data i appen:</strong> Indstillinger → Dine data → Slet alle data.</li><li><strong>Afinstallér appen:</strong> fjerner appen og alle dens data fra enheden.</li><li><strong>Backup-filer og PDF'er</strong>, du har eksporteret, er under din kontrol; slet dem, hvor du gemte dem.</li></ul><p>Købsoplysninger ligger hos Apple eller Google under din butikskonto og et anonymt købs-id hos RevenueCat. Vil du have RevenueCat-posten slettet, så skriv til <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a>, og vi anmoder om sletning inden 30 dage.</p>
<h2>Ikke medicinsk udstyr</h2><p>Tinnara er en selvobservations-dagbog. Den stiller ikke diagnoser, tester ikke din hørelse og anbefaler ikke behandling.</p>
<h2>Børn</h2><p>Tinnara henvender sig ikke til børn under 13 og indsamler ikke bevidst data fra dem (den indsamler ingen fra nogen).</p>
<h2>Ændringer</h2><p>Ændres politikken, ændres datoen ovenfor, og den nye version offentliggøres her.</p></article>"""),
}
TERMS = {
"en": ("Terms of use – Tinnara", "Terms for using the Tinnara app.", f"""<article><h1>Terms of use</h1><p class="muted">Last updated {UPDATED}</p>
<p>These terms apply to the Tinnara app published by Therkildsen Group (CVR 46203798), Viborg, Denmark. On the App Store, Apple's <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">standard EULA</a> also applies.</p>
<h2>What Tinnara is</h2><p>Tinnara is a personal tinnitus diary: it stores what you log and shows counts, averages and shares of it. It is <strong>not a medical device</strong>, does not diagnose, does not test hearing and does not recommend treatment. Decisions about your health belong to you and your doctor. If your hearing changes suddenly, see a doctor the same day.</p>
<h2>Purchases</h2><p>Tinnara Pro is sold as a yearly subscription with a 7-day free trial or as a one-time lifetime purchase, through Apple or Google. Subscriptions renew automatically until cancelled in your store account; refunds follow the store's rules.</p>
<h2>Your data</h2><p>Your diary stays on your device. You are responsible for keeping backups if you want them – deleting the app deletes its data.</p>
<h2>Liability</h2><p>Tinnara is provided "as is". To the extent permitted by law, we are not liable for indirect losses, including decisions taken on the basis of what the app shows. Nothing in these terms limits rights you have under mandatory consumer law in your country.</p>
<h2>Contact</h2><p><a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a></p></article>"""),
"da": ("Vilkår for brug – Tinnara", "Vilkår for brug af Tinnara-appen.", f"""<article><h1>Vilkår for brug</h1><p class="muted">Sidst opdateret {UPDATED_DA}</p>
<p>Disse vilkår gælder for appen Tinnara, udgivet af Therkildsen Group (CVR 46203798), Viborg. På App Store gælder desuden Apples <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">standard-EULA</a>.</p>
<h2>Hvad Tinnara er</h2><p>Tinnara er en personlig tinnitusdagbog: den gemmer det, du logger, og viser optællinger, gennemsnit og andele af det. Den er <strong>ikke medicinsk udstyr</strong>, stiller ikke diagnoser, tester ikke hørelse og anbefaler ikke behandling. Beslutninger om dit helbred tilhører dig og din læge. Ændrer din hørelse sig pludseligt, så kontakt læge samme dag.</p>
<h2>Køb</h2><p>Tinnara Pro sælges som årsabonnement med 7 dages gratis prøve eller som et engangskøb for livstid via Apple eller Google. Abonnementer fornyes automatisk, indtil de opsiges i din butikskonto; refusion følger butikkens regler.</p>
<h2>Dine data</h2><p>Din dagbog bliver på din enhed. Du har selv ansvaret for backup, hvis du ønsker det – sletter du appen, slettes dens data.</p>
<h2>Ansvar</h2><p>Tinnara leveres "som den er". I det omfang loven tillader det, er vi ikke ansvarlige for indirekte tab, herunder beslutninger truffet på baggrund af det, appen viser. Intet i disse vilkår begrænser de rettigheder, du har efter ufravigelig forbrugerlovgivning.</p>
<h2>Kontakt</h2><p><a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a></p></article>"""),
}
SUPPORT = {
"en": ("Support – Tinnara", "Help and frequently asked questions for Tinnara.", f"""<article><h1>Support</h1>
<p>Write to <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a> – we answer within a couple of working days. In the app: Settings → About → Send feedback.</p>
<h3>What does the 0–10 number mean?</h3><p>How loud the tinnitus was for most of the day, on your own scale – 0 is not noticeable, 10 is as loud as it ever gets. Compare with your own days, not with others.</p>
<h3>What is a spike?</h3><p>A period where it is clearly louder than usual. Tap "Louder now" when it starts and end it when it has settled; the details can be filled in afterwards.</p>
<h3>I bought Pro on another phone</h3><p>Settings → Restore purchases, signed in with the same Apple ID or Google account.</p>
<h3>How do I move my diary to a new phone?</h3><p>Settings → Your data → Export encrypted backup, then Import backup on the new phone with the same passphrase.</p>
<h3>Can Tinnara test my hearing or tell me what kind of tinnitus I have?</h3><p>No. Tinnara is a diary, not a medical device. If your hearing changes suddenly, see a doctor the same day.</p>
<h3>Reminders don't show</h3><p>Check that notifications are allowed for Tinnara in your phone's settings and that the daily check-in reminder is switched on in Tinnara's settings.</p></article>"""),
"da": ("Support – Tinnara", "Hjælp og ofte stillede spørgsmål om Tinnara.", f"""<article><h1>Support</h1>
<p>Skriv til <a href="mailto:support@{DOMAIN}">support@{DOMAIN}</a> – vi svarer inden for et par hverdage. I appen: Indstillinger → Om → Send feedback.</p>
<h3>Hvad betyder tallet 0–10?</h3><p>Hvor høj tinnitus var det meste af dagen på din egen skala – 0 mærkes ikke, 10 er så højt, som den nogensinde bliver. Sammenlign med dine egne dage, ikke med andres.</p>
<h3>Hvad er et udbrud?</h3><p>En periode, hvor den er tydeligt højere end normalt. Tryk "Højere nu", når den starter, og afslut, når det har lagt sig; detaljerne kan udfyldes bagefter.</p>
<h3>Jeg har købt Pro på en anden telefon</h3><p>Indstillinger → Gendan køb, logget ind med samme Apple-id eller Google-konto.</p>
<h3>Hvordan flytter jeg min dagbog til en ny telefon?</h3><p>Indstillinger → Dine data → Eksportér krypteret backup, og derefter Importér backup på den nye telefon med samme adgangsfrase.</p>
<h3>Kan Tinnara teste min hørelse eller fortælle, hvilken slags tinnitus jeg har?</h3><p>Nej. Tinnara er en dagbog, ikke medicinsk udstyr. Ændrer din hørelse sig pludseligt, så kontakt læge samme dag.</p>
<h3>Påmindelser vises ikke</h3><p>Tjek, at notifikationer er tilladt for Tinnara i telefonens indstillinger, og at den daglige påmindelse er slået til i Tinnaras indstillinger.</p></article>"""),
}

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(content)

def main():
    for lang in ("en", "da"):
        pre = "" if lang == "en" else "/da"
        for name, data, alt in (("index", INDEX, "/"), ("privacy", PRIVACY, "/privacy"), ("terms", TERMS, "/terms"), ("support", SUPPORT, "/support")):
            title, desc, body = data[lang]
            rel = f"{pre}/index.html" if name == "index" else f"{pre}/{name}/index.html"
            write(os.path.join(OUT, rel.lstrip("/")), page(lang, rel, title, desc, body, alt))
    write(os.path.join(OUT, "style.css"), STYLE)
    write(os.path.join(OUT, "favicon.svg"), FAVICON)
    write(os.path.join(OUT, "CNAME"), DOMAIN + "\n")
    write(os.path.join(OUT, ".nojekyll"), "")
    write(os.path.join(OUT, "robots.txt"), f"User-agent: *\nAllow: /\nDisallow: /demo/\nSitemap: https://{DOMAIN}/sitemap.xml\n")
    urls = [f"https://{DOMAIN}{p}" for p in ("/", "/da/", "/privacy", "/da/privacy", "/terms", "/da/terms", "/support", "/da/support")]
    write(os.path.join(OUT, "sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"<url><loc>{u}</loc></url>\n" for u in urls) + "</urlset>\n")
    # store screenshots for the landing page
    src = os.path.join(os.path.dirname(__file__), "..", "store", "screenshots")
    for lang in ("en", "da"):
        d = os.path.join(OUT, "store-assets", lang); os.makedirs(d, exist_ok=True)
        for i in range(1, 7):
            f = os.path.join(src, lang, f"store-iphone-6.7-{i}.png")
            if os.path.exists(f): shutil.copy(f, d)
    print("site written to", os.path.abspath(OUT))

if __name__ == "__main__":
    main()
