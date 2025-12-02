# Fjörlistinn - Modular Architecture

Þetta er nýja modular uppbyggingin fyrir Fjörlistinn kerfið sem notar Eleventy (11ty) static site generator.

## Uppsetning

1. Afrita allar skrár í git repo eða nýja möppu
2. Keyra `npm install` til að setja upp Eleventy
3. Keyra `npm run build` til að byggja síðurnar
4. Keyra `npm start` fyrir development server

## Möppustrúktúr

```
fjorlistinn/
├── .eleventy.js           # Eleventy stillingar
├── netlify.toml           # Netlify deployment stillingar
├── package.json           # NPM dependencies
│
├── src/
│   ├── _includes/         # Nunjucks templates
│   │   ├── base.njk       # Grunnlayout
│   │   └── components/    # Endurnýtanlegir components
│   │       ├── shared/    # Sameiginlegir components
│   │       ├── staff/     # Staff/deildarstjori tabs
│   │       └── admin/     # Admin tabs
│   │
│   ├── css/
│   │   ├── shared/        # Base, buttons, forms, cards, etc.
│   │   ├── components/    # Login, header, tabs, attendance, etc.
│   │   └── pages/         # Page-specific styles
│   │
│   ├── js/
│   │   ├── shared/        # config, api, utils, auth, state
│   │   ├── components/    # tabs, calendar, student-popup
│   │   └── pages/         # Page-specific JS
│   │       ├── index/
│   │       ├── staff/
│   │       ├── admin/
│   │       └── ...
│   │
│   ├── index.njk          # Forsíða
│   ├── starfsmadur.njk    # Starfsmannaviðmót
│   ├── deildarstjori.njk  # Deildarstjóraviðmót
│   ├── admin.njk          # Admin viðmót
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # PWA service worker
│
└── public/                # Build output (auto-generated)
```

## Commands

- `npm start` - Keyra development server (localhost:8080)
- `npm run build` - Byggja production version
- `npm run watch` - Watch for changes

## Deployment á Netlify

Netlify mun sjálfkrafa:
1. Keyra `npm run build`
2. Serve `public/` möppuna

## Mikilvægt

- **Backend** er óbreytt (Google Apps Script)
- **API URL** er í `/js/shared/config.js`
- CSS og JS eru aðskilin og cached separately
- Nunjucks templates leyfa endurnýtingu components

## Til að bæta við nýjum tab

1. Búa til component í `_includes/components/staff/tab-xyz.njk`
2. Bæta tab button við `tabs-nav.njk`
3. Include component í síðunni (t.d. `starfsmadur.njk`)
4. Búa til JS logic í `js/pages/staff/xyz.js`
5. Include JS skrána í síðunni
