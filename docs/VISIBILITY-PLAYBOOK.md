# Search visibility playbook: profiles, articles and the name "Emmanuel Duke"

What the site does automatically, and the steps only you can take. Nobody can *force* Google to index a page
or to show a particular person for a name. These steps give Google the strongest, most consistent signals.

## 1. What duker.me already does (automatic)

- **One identity everywhere:** every page carries the same Person data, `name` "Emmanuel Effiom Duke",
  `alternateName` "Emmanuel Duke", a fact-based `disambiguatingDescription`, and `sameAs` links to LinkedIn, X,
  GitHub, Google Scholar and SciProfiles. Those same profile links are visible on the page and marked `rel="me"`.
- **Articles are discoverable three ways:** `sitemap.xml` (11 URLs), `feed.xml` (Atom, full text; Google and Bing
  accept it as a second sitemap, and robots.txt lists both), and internal links from the homepage, About and
  `/articles/`.
- **IndexNow:** after every push to `main` that changes pages, `.github/workflows/indexnow.yml` waits for GitHub
  Pages to go live, then submits every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver and others).
  Google does **not** use IndexNow. Check runs under the repository's **Actions** tab. The key file
  (`/<key>.txt`) is public by design.

## 2. Google Search Console (10 minutes, then occasionally)

1. Verify the domain if you haven't (see `NAME-SEARCH-REPORT.md` §4).
2. **Sitemaps** → submit both `sitemap.xml` and `feed.xml`.
3. **URL Inspection** → paste each URL → **Request indexing**. Google allows a small number per day, so do the
   most important first:
   - https://duker.me/
   - https://duker.me/about/
   - https://duker.me/articles/
   - https://duker.me/articles/metaculus-forecasting-bot/
   - https://duker.me/articles/llm-knowledge-cutoff-probe/
   - https://duker.me/articles/designing-teger-ai/
   - https://duker.me/articles/secret-loyalties-audit/
   - https://duker.me/articles/spd-real-transformer/
   - https://duker.me/articles/spd-mechanism-clustering/
   - https://duker.me/articles/deception-feature-universality/
   - https://duker.me/articles/reward-generalization-early-warning/
4. After 1–2 weeks: **Pages** report (indexed vs not) and **Performance**, filtering queries to contain "duke", to see
   impressions for "Emmanuel Duke" and "Emmanuel Effiom Duke".

## 3. Bing Webmaster Tools (5 minutes)

<https://www.bing.com/webmasters> → **Import from Google Search Console**. IndexNow then keeps Bing up to date
automatically. Bing's index also feeds several AI assistants' web search.

## 4. LinkedIn (only you can change these)

LinkedIn decides whether your profile is indexed. These settings make it eligible and tie it to duker.me:

- **Me → View profile → Edit public profile & URL**: set **Your profile's public visibility** to *On*, and make
  your name, headline, photo and About section visible to *Everyone*. Optionally claim a custom URL such as
  `linkedin.com/in/emmanuel-effiom-duke`. If you change the URL, tell me so I can update `sameAs` everywhere.
- **Name**: first name *Emmanuel*, last name *Duke*, and add *Effiom* (LinkedIn has an "additional name" field),
  so both forms match.
- **Contact info → Website**: add `https://duker.me` (type: Personal) and `https://dukersltd.com` (Company).
- **Headline**: e.g. "AI Engineer, Researcher & Founder of Dukers LTD", the same wording as the site.
- **Featured**: add duker.me and two or three articles (links to `duker.me/articles/...`).
- **Experience**: make sure "Founder, Dukers LTD" exists and links to the Dukers LTD company page if there is one.
- When you post about an article, **link to the duker.me URL**. Don't paste the full text into LinkedIn: the
  original on duker.me should be the canonical copy.

## 5. X (@starduke001)

- **Settings → Privacy and safety → Audience**: make sure "Protect your posts" is **off** (protected accounts
  aren't indexed).
- **Edit profile**: display name "Emmanuel Effiom Duke", bio along the lines of "AI engineer, researcher, founder
  @ Dukers LTD", **Website** field `https://duker.me`.
- **Pin a post** linking `https://duker.me/articles/` or your strongest article.

## 6. Other profiles that carry weight for a name

| Profile | Change |
|---|---|
| GitHub (`dukemawex`) | Settings → Name "Emmanuel Effiom Duke", Website `https://duker.me`. Also add a profile README (repo `dukemawex/dukemawex`) with a one-line bio linking duker.me |
| Google Scholar | Edit → Name "Emmanuel Effiom Duke", Homepage `https://duker.me`, affiliation; keep the profile **public** |
| SciProfiles / ORCID | Same name and homepage. An ORCID iD is free and widely trusted; send it to me and I'll add it to `sameAs` |
| Apart Research, Metaculus profiles | Same name; link duker.me where a website field exists |

Consistency matters more than volume: the same name, photo, one-line description and link back to duker.me
on every profile.

## 7. "Emmanuel Duke" vs "Emmanuel Effiom Duke"

"Emmanuel Duke" is a shared name, so Google shows whichever people it judges most relevant. You can't own it
outright. What moves it, in order of impact:

1. Indexed, well-linked profiles all pointing to duker.me (sections 4–6).
2. Other sites linking to duker.me with your name, e.g. Dukers LTD, Teger AI and Transly founder links
   (snippets in `docs/reciprocal/`), conference pages and co-author pages.
3. Fresh, original content under your name: the articles. Add one every few weeks.
4. A **Google knowledge panel**, which Google may create once these signals are strong. If one appears, click
   "Claim this knowledge panel" and verify through Search Console or your profiles. You can't request one.

The full name "Emmanuel Effiom Duke" is far less contested, so it should rank first. Use it everywhere.

## 8. Checklist

- [ ] Search Console: verify domain, submit `sitemap.xml` + `feed.xml`, request indexing for the URLs above
- [ ] Bing Webmaster Tools: import from Search Console
- [ ] LinkedIn: public profile on, website = duker.me, Featured links, consistent name
- [ ] X: posts unprotected, website = duker.me, pinned post
- [ ] GitHub, Scholar, ORCID: same name + duker.me
- [ ] Add reciprocal founder links on dukersltd.com, tegerai.tech, transly.software
- [ ] Check the IndexNow run under GitHub → Actions after the next deploy

## 9. Ranking for skills, not just your name (worldwide)

**What the site now does.** Five expertise hubs (`/expertise/…`), each with its own title, description and `<h1>`
built around a real skill area and backed by your projects and articles:

| Hub | Aims at searches like |
|---|---|
| `/expertise/ai-engineer/` | "AI engineer" + LLM products, agents, evaluation; "AI engineer Nigeria/Africa" |
| `/expertise/ai-safety-researcher/` | "AI safety researcher", "mechanistic interpretability", "stochastic parameter decomposition clustering" |
| `/expertise/ai-security/` | "AI phishing detection", "social engineering detection", "prompt injection" design |
| `/expertise/ai-forecasting/` | "AI forecasting bot", "Metaculus bot", "LLM knowledge cutoff", "LLM calibration" |
| `/expertise/mechanical-engineer/` | "mechanical engineer energy research", "CFD feedwater heater fouling", "ML hotel energy optimisation" |

Every article links back to its hubs, and the hubs link to each other, to `/about/` and to the homepage.

**Be realistic.** Bare terms like "AI engineer" are dominated by job boards, LinkedIn and large companies,
and no personal site ranks for them everywhere. Specific, technical searches are where duker.me can win, along
with the name plus a skill ("Emmanuel Duke AI safety").

**Worldwide.** Google already serves English pages in every country. Don't set a target country in Search
Console (leave International Targeting empty). Reach outside English-speaking countries comes from links
and mentions in those regions. Translated versions of the key pages are possible later.

**What moves skill rankings most (only you can do these):**
1. **Links from respected sites in your field.** Post research write-ups to LessWrong / the Alignment Forum and
   to Apart Research's project pages, linking the duker.me article. Share forecasting work on the Metaculus
   forums. Share tools on Hacker News ("Show HN") and relevant subreddits.
2. **Preprints.** Put papers (the knowledge-cutoff paper, the SPD write-up "Specialization Is the Bottleneck",
   your CFD and energy papers) on arXiv, SSRN or Zenodo with duker.me as your homepage. Scholarly indexes carry
   a lot of weight for "researcher" searches and get you a DOI.
3. **Cross-posts with canonical links.** Republish articles on dev.to, Hashnode or Medium using their
   "canonical URL" setting pointed at duker.me, so the original keeps the credit.
4. **Profiles.** ORCID, Google Scholar, GitHub and LinkedIn all linking to duker.me (sections 4–6).
5. **Keep publishing.** One solid technical article a month on the same themes compounds faster than anything else.

Request indexing in Search Console for the new hub URLs too (all are in `sitemap.xml`; IndexNow submits them to
Bing automatically).
