# Prints the SEO facts used in docs/NAME-SEARCH-REPORT.md for a site checkout.
# Usage: python3 scripts/seo-evidence.py <dir>   (e.g. a `git archive origin/main` export for "before")
import re,json,os,sys
root=sys.argv[1]
def r(f):
    p=os.path.join(root,f); return open(p).read() if os.path.exists(p) else None
for f in ['robots.txt','sitemap.xml','404.html','about/index.html','favicon.ico','site.webmanifest']:
    print(f"{f:20} {'present' if os.path.exists(os.path.join(root,f)) else 'MISSING'}")
for page in ['index.html','about/index.html']:
    s=r(page)
    if not s: continue
    print(f'--- {page}')
    g=lambda pat: (re.search(pat,s,re.S) or [None,None])[1]
    print('title      :', g(r'<title>(.*?)</title>'))
    print('description:', g(r'<meta name="description" content="([^"]*)"'))
    print('canonical  :', g(r'<link rel="canonical" href="([^"]*)"'))
    print('robots meta:', g(r'<meta name="robots" content="([^"]*)"'), '| noindex anywhere:', 'noindex' in s)
    h1=g(r'<h1>(.*?)</h1>'); print('h1         :', re.sub(r'<[^>]+>',' ',h1 or '').split() and ' '.join(re.sub(r'<[^>]+>',' ',h1).split()))
    body=re.sub(r'<script.*?</script>','',s[s.find('<body'):],flags=re.S); txt=re.sub(r'<[^>]+>',' ',body)
    print('"Emmanuel Effiom Duke" in visible text:', txt.count('Emmanuel Effiom Duke'), 'times')
    ld=g(r'<script type="application/ld\+json">(.*?)</script>')
    if ld:
        gr=json.loads(ld)['@graph']; p=[n for n in gr if n['@type']=='Person'][0]
        print('JSON-LD types:', [n['@type'] for n in gr]); print('Person.name:', p['name'], '| alternateName:', p.get('alternateName')); print('sameAs:', p.get('sameAs'))
    else: print('JSON-LD: none')
    print('links to dukersltd/tegerai/transly:', [u in s for u in ('https://dukersltd.com','https://tegerai.tech','https://transly.software')])
