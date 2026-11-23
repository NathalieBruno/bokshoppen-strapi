# 📚 Lilla Bokshoppen

En liten bokklubb där du kan bläddra bland månadens böcker, betygsätta dem och spara dem som sparade böcker.

## Syfte

Projektet är en skoluppgift som visar hur ett **headless CMS** (Strapi) kan användas som backend för en egen frontend. Administratören lägger in och ändrar böcker och tema i Strapi, medan besökare kan betygsätta böckerna och spara dem som sparade böcker.

## Funktioner

- 📖 Bokkatalog med omslag, författare, sidantal och snittbetyg
- 🔐 Registrering och inloggning
- ⭐ Betygsätt böcker (1–10)
- 🔖 Önskelista med möjlighet att ta bort böcker
- 🔤 Sortering efter titel, författare och betyg på profilsidan
- ✅ Markera en sparad bok som läst (den betygsätts och flyttas till dina lästa och betygsatta böcker) och ta bort den därifrån igen (betyget raderas)
- 🎨 Tre teman (vår, sommar, höst)

## Tech stack

|                        |                                         |
| ---------------------- | --------------------------------------- |
| 🖥️ Frontend            | HTML, SCSS/CSS, JavaScript (ES-moduler) |
| 🗄️ Backend / CMS       | Strapi 5 med SQLite                     |
| 📦 Bibliotek (via CDN) | axios, jQuery, Toastr                   |
| ☁️ Hosting av demon    | Netlify                                 |

## Strapi lokalt eller demo

Samma frontend kan köras på två sätt:

|                          | 💻 Lokalt med Strapi                  | ☁️ Demo på Netlify                                                 |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------ |
| **Data**                 | Hämtas från Strapi (`localhost:1337`) | Fast katalog med 12 böcker i `frontend/demo/`                      |
| **Böcker och tema**      | Ändras av administratören i Strapi    | Böckerna är fasta, temat byter besökaren själv längst ned på sidan |
| **Konto**                | Riktig registrering och inloggning    | Knappen **Try demo account**                                       |
| **Betyg och sparade böcker** | Sparas i Strapi                       | Sparas bara i din egen webbläsare                                  |

Demoläget slås på automatiskt när sidan inte körs lokalt. Lokalt styr du det med `?demo=1` (demo utan Strapi) eller `?demo=0` (tvinga Strapi). Inställningar för Netlify finns i `netlify.toml`.

## 🚀 Testa demon

🌐 **Live demo:** [bokshoppen-strapi.netlify.app](https://bokshoppen-strapi.netlify.app/)

1. 🔑 Klicka på **Logga in** och sedan **Try demo account** – du behöver inga uppgifter.
2. ⭐ Betygsätt en bok i listan.
3. 🔖 Klicka på **Läs senare** för att spara en bok.
4. 👤 Öppna **Min profil** och prova att sortera dina sparade böcker och dina betyg.
5. 🎨 Byt tema längst ned på sidan (**Vår**, **Sommar**, **Höst**).

## 💻 Köra projektet lokalt (med Strapi)

Du behöver [Node.js](https://nodejs.org) 18–22.

**1. Starta Strapi**

```bash
cd backend
cp .env.example .env     # fyll i egna nycklar
npm install
npm run develop
```

Strapi startar på `http://localhost:1337`. Första gången skapar du ett adminkonto, lägger in böcker och ställer in behörigheter under _Settings → Users & Permissions_.

**2. Starta frontend**

Öppna projektmappen i VS Code och starta **Live Server** på `frontend/index.html`.

**3. Ändra stilar (valfritt)**

Stilarna skrivs i `frontend/style/*.scss` och kompileras till `frontend/style/style.css` (som sidorna läser):

```bash
sass frontend/style/style.scss frontend/style/style.css
```

## 📁 Struktur

```
book-ducks-uppgift/
├── backend/          🗄️ Strapi CMS (böcker, betyg, sparade böcker, tema)
├── frontend/         🖥️ Webbplatsen
│   ├── index.html    🏠 Startsida
│   ├── user/         👤 Profilsida
│   ├── components/   🧩 Återanvändbara moduler (bokkort, betygsväljare, dialoger, sidfot, formulärfel)
│   ├── style/        🎨 SCSS i partials (tokens, base, header, books, modal, profile, footer)
│   ├── api.js        🔌 Anrop mot Strapi (och demoläge)
│   ├── theme.js      🌤️ Årstidsteman (vår, sommar, höst)
│   └── demo/         📦 Bokdata och omslag för demon
└── netlify.toml      ☁️ Netlify-inställningar
```
