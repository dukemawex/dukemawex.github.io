# Reciprocal founder links (prepared, not applied)

These links tell search engines that the person behind dukersltd.com, tegerai.tech and transly.software
is the same Emmanuel Effiom Duke described on duker.me. Nothing here has been deployed. Apply each
snippet only in the site you control, and only if it's accurate for that company.

| Site | Source available here? | Status |
|---|---|---|
| dukersltd.com | No repository found in your GitHub account list | Snippet below. Apply wherever that site is built |
| tegerai.tech | `dukemawex/Teger-ai` holds the extension, API and dashboard, **not** the tegerai.tech landing page | `teger-ai-readme.patch` (README credit) + landing-page snippet below |
| transly.software | `dukemawex/Transly` and `dukemawex/transly1` contain only a one-line README | Snippet below. Apply wherever that site is built |

Applying `teger-ai-readme.patch`, from a clone of `dukemawex/Teger-ai`:

```sh
git apply /path/to/dukemawex.github.io/docs/reciprocal/teger-ai-readme.patch
```

## dukersltd.com

Visible HTML (e.g. an About/Team section or the footer):

```html
<p>Dukers LTD was founded by <a href="https://duker.me/" rel="author">Emmanuel Effiom Duke</a>.</p>
```

Structured data, in `<head>` on the homepage:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://dukersltd.com/#organization",
  "name": "Dukers LTD",
  "url": "https://dukersltd.com/",
  "email": "emmanuel.duke@dukersltd.com",
  "founder": {
    "@type": "Person",
    "@id": "https://duker.me/#person",
    "name": "Emmanuel Effiom Duke",
    "alternateName": "Emmanuel Duke",
    "url": "https://duker.me/"
  }
}
</script>
```

The `@id` values deliberately match the ones duker.me already publishes (`https://duker.me/#person`,
`https://dukersltd.com/#organization`), so both sites describe the same two entities.

## tegerai.tech (landing page)

```html
<p>Created by <a href="https://duker.me/" rel="author">Emmanuel Effiom Duke</a>.</p>
```

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Teger AI",
  "url": "https://tegerai.tech/",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Chrome",
  "description": "Explainable social-engineering and phishing detection for Gmail and Slack.",
  "creator": {"@type": "Person", "@id": "https://duker.me/#person", "name": "Emmanuel Effiom Duke", "url": "https://duker.me/"}
}
</script>
```

The description matches `extension/manifest.json` in `dukemawex/Teger-ai`. If Teger AI is a Dukers LTD
product, you can also add `"publisher": {"@id": "https://dukersltd.com/#organization", "@type": "Organization", "name": "Dukers LTD"}`
(only if that's true; duker.me currently describes Teger AI only as "associated").

## transly.software

```html
<p>Created by <a href="https://duker.me/" rel="author">Emmanuel Effiom Duke</a>.</p>
```

Add structured data once there's a verified one-line product description to put in it. The same applies
to the Transly description on duker.me.

## Other profiles worth updating (manual)

The single biggest name signal you control is consistency. Where the platforms allow, use
**Emmanuel Effiom Duke** as the display name and link **https://duker.me/** as the website on:
LinkedIn (Contact info → Website), GitHub (profile → Website), Google Scholar (homepage field),
SciProfiles and X. duker.me already links to each of these, so the links then point both ways.
