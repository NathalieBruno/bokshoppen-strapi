# 📚 Book Ducks – Lilla Bokshoppen

En liten bokklubb där du kan bläddra bland månadens böcker, betygsätta dem och spara dem i en önskelista. Innehållet hanteras i **Strapi CMS** och sidan är byggd med vanlig HTML, CSS och JavaScript.

## 🚀 Testa demon

Demon körs på Netlify **utan** Strapi-server:

🌐 **Live demo:** _(lägg in Netlify-länken här)_

1. 🔑 Klicka på **Logga in** och sedan **Try demo account** – du behöver inga uppgifter.
2. ⭐ Betygsätt en bok i listan.
3. 🔖 Klicka på **Läs senare** för att spara en bok.
4. 👤 Öppna **Min profil** och prova att sortera din önskelista och dina betyg.
5. 🎨 Byt tema längst ned på sidan (**Vår**, **Sommar**, **Höst**).

> 💡 I demon är böckerna en fast katalog med 12 titlar. Dina betyg, din önskelista och ditt temaval sparas bara i din egen webbläsare.

## ✨ Funktioner

- 📖 Bokkatalog med omslag, författare, sidantal och snittbetyg
- 🔐 Registrering och inloggning
- ⭐ Betygsätt böcker (1–10)
- 🔖 Önskelista med möjlighet att ta bort böcker
- 🔤 Sortering efter titel, författare och betyg på profilsidan
- 🎨 Tre teman (vår, sommar, höst) som normalt styrs från Strapi CMS

## 🛠️ Teknik

| | |
|---|---|
| 🖥️ Frontend | HTML, SCSS/CSS, JavaScript (ES-moduler) |
| 🗄️ Backend / CMS | Strapi 5 med SQLite |
| 📦 Bibliotek (via CDN) | axios, jQuery, Toastr |
| ☁️ Hosting av demon | Netlify |

## 💻 Köra projektet lokalt (med Strapi)

Du behöver [Node.js](https://nodejs.org) 18–22.

**1. Starta Strapi** 🗄️

```bash
cd backend
cp .env.example .env     # fyll i egna nycklar
npm install
npm run develop
```

Strapi startar på `http://localhost:1337`. Första gången skapar du ett adminkonto, lägger in böcker och ställer in behörigheter under *Settings → Users & Permissions*.

**2. Starta frontend** 🖥️

Öppna projektmappen i VS Code och starta **Live Server** på `frontend/index.html`.

Lokalt används Strapi automatiskt. Vill du prova demoläget utan Strapi lägger du till `?demo=1` i adressen, och `?demo=0` för att tvinga Strapi-läget.

## ☁️ Publicera på Netlify

Inställningarna finns i `netlify.toml`:

- **Publish directory:** `frontend`
- **Build command:** ingen (sidan är statisk)

Demoläget slås på automatiskt när sidan inte körs lokalt.

## 📁 Struktur

```
book-ducks-uppgift/
├── backend/          🗄️ Strapi CMS (böcker, betyg, önskelistor, tema)
├── frontend/         🖥️ Webbplatsen
│   ├── index.html    🏠 Startsida
│   ├── user/         👤 Profilsida
│   ├── api.js        🔌 Anrop mot Strapi (och demoläge)
│   ├── theme.js      🎨 Teman
│   └── demo/         📦 Bokdata och omslag för demon
└── netlify.toml      ☁️ Netlify-inställningar
```
