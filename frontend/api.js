export const BASE_URL = "http://localhost:1337";
export const API_URL = `${BASE_URL}/api`;

// ---------------------------------------------------------------------------
// Demoläge (Netlify): ingen Strapi-server behövs. Katalogen (böcker, omslag,
// betyg, tema) läses från demo/data.json. Besökarens betyg och önskelista sparas
// i webbläsarens localStorage. Aktiveras automatiskt när sidan inte körs lokalt,
// eller manuellt med ?demo=1 (av: ?demo=0).
// ---------------------------------------------------------------------------
const isLocalHost = () => {
  const h = window.location.hostname;
  return (
    h === "" ||
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    /^192\.168\./.test(h) ||
    /^10\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
};

const resolveDemoMode = () => {
  try {
    const flag = new URLSearchParams(window.location.search).get("demo");
    if (flag === "1" || flag === "0") sessionStorage.setItem("demoMode", flag);
    const stored = sessionStorage.getItem("demoMode");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch (e) {
    // sessionStorage kan vara blockerad – falla tillbaka på hostname
  }
  return !isLocalHost();
};

export const DEMO_MODE = resolveDemoMode();

// Bild-URL: Strapi-uppladdningar lokalt, medföljande bilder i demon.
export const imageUrl = (book) => {
  const url = book?.image?.url;
  if (!url) return "";
  return DEMO_MODE ? new URL(url, import.meta.url).href : `${BASE_URL}${url}`;
};

// Sidor adresseras relativt api.js (frontend-mappen), så navigeringen fungerar både när
// frontend är webbrotens rot (Netlify, "/") och när den ligger i en undermapp (Live Server, "/frontend/").
export const pageUrl = (page) => new URL(page, import.meta.url).href;

// Startsidan nås som mappen ("/" eller "/frontend/"), "index.html" eller "index" (Netlify pretty URLs).
export const isHomePage = () => {
  const root = new URL("./", import.meta.url).pathname;
  return [root, `${root}index.html`, `${root}index`].includes(window.location.pathname);
};

const DEMO_USER = { id: 1, documentId: "demo-user", username: "Demo", email: "demo@bookducks.se" };
const DEMO_STORE_KEY = "bookducks-demo";
let demoData = null;

const loadDemoData = async () => {
  if (!demoData) {
    const response = await fetch(new URL("./demo/data.json", import.meta.url));
    demoData = await response.json();
  }
  return demoData;
};

const readDemoStore = () => {
  try {
    const store = JSON.parse(localStorage.getItem(DEMO_STORE_KEY));
    return { ratings: store?.ratings || {}, wishlist: store?.wishlist || [] };
  } catch (e) {
    return { ratings: {}, wishlist: [] };
  }
};

const writeDemoStore = (store) => {
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  } catch (e) {
    // localStorage blockerad – ändringar gäller bara tills sidan laddas om
  }
};

const demoBook = (data, bookId) => data.books.find((b) => b.documentId === bookId);

export class Api {
  static getAuthHeader() {
    return sessionStorage.getItem("token") || null;
  }

  static async getBooks() {
    if (DEMO_MODE) return (await loadDemoData()).books;
    const response = await axios.get(`${API_URL}/books?populate=*`);
    return response.data.data;
  }

  static async getTheme() {
    if (DEMO_MODE) return (await loadDemoData()).theme;
    const response = await axios.get(`${BASE_URL}/api/theme-setting`);
    return response.data.data;
  }

  static async getMeWithWishlist() {
    if (DEMO_MODE) {
      const data = await loadDemoData();
      const wishlists = readDemoStore()
        .wishlist.map((w) => ({ documentId: w.documentId, book: demoBook(data, w.book) }))
        .filter((w) => w.book);
      return { ...DEMO_USER, wishlists };
    }
    const response = await axios.get(`${BASE_URL}/api/users/me?pLevel=4`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    });
    return response.data;
  }

  static async login(email, password) {
    if (DEMO_MODE) return { jwt: "demo-token", user: DEMO_USER };
    let response = await axios.post(`${API_URL}/auth/local`, {
      identifier: email,
      password: password,
    });
    if (response.status === 200) {
      sessionStorage.setItem("token", response.data.jwt);
    }
    return response.data;
  }

  static async isLoggedIn() {
    const token = this.getAuthHeader();

    if (!token && !isHomePage()) {
      window.location.href = pageUrl("index.html");
      return false;
    }

    return !!token;
  }

  static async register(username, email, password) {
    if (DEMO_MODE) return { jwt: "demo-token", user: { ...DEMO_USER, username, email } };
    let response = await axios.post(`${API_URL}/auth/local/register`, {
      username: username,
      email: email,
      password: password,
    });
    return response.data;
  }

  // Returnerar den skapade posten (med documentId, som behövs för att ta bort den igen) eller false.
  static async addToWishlist(userId, bookId) {
    if (DEMO_MODE) {
      const store = readDemoStore();
      let item = store.wishlist.find((w) => w.book === bookId);
      if (!item) {
        item = { documentId: `demo-wishlist-${bookId}`, book: bookId };
        store.wishlist.push(item);
        writeDemoStore(store);
      }
      return item;
    }
    try {
      const token = this.getAuthHeader();
      if (!token) return false;

      const response = await axios.post(
        `${API_URL}/wishlists`,
        {
          data: {
            user: userId,
            book: bookId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data;
    } catch (err) {
      console.error("Fel vid tillägg av bok:", err);
      return false;
    }
  }

  // Bokens post bland användarens sparade böcker (eller null). documentId behövs för att ta bort den.
  static async getWishlistItem(userId, bookId) {
    if (DEMO_MODE) return readDemoStore().wishlist.find((w) => w.book === bookId) || null;
    try {
      const token = this.getAuthHeader();
      if (!token) return null;

      const response = await axios.get(
        `${API_URL}/wishlists?filters[user][documentId][$eq]=${userId}&filters[book][documentId][$eq]=${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data?.[0] || null;
    } catch (err) {
      return null;
    }
  }

  static async deleteWishlistItem(documentId) {
    if (DEMO_MODE) {
      const store = readDemoStore();
      store.wishlist = store.wishlist.filter((w) => w.documentId !== documentId);
      writeDemoStore(store);
      return true;
    }
    try {
      const token = this.getAuthHeader();
      if (!token) {
        return false;
      }

      let response = await axios.delete(`${API_URL}/wishlists/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  static async getUserWishlist(userId) {
    if (DEMO_MODE) return (await this.getMeWithWishlist()).wishlists;
    try {
      const token = this.getAuthHeader();
      if (!token) return [];

      const response = await axios.get(`${API_URL}/wishlists?filters[user][documentId][$eq]=${userId}&populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data || [];
    } catch (err) {
      console.error("Fel vid hämtning av önskelista:", err);
      return [];
    }
  }

  // Snittbetyg i demon: exporterade betyg + besökarens eget betyg (som i Strapi, där det ingår i snittet).
  static async getBookRating(bookId) {
    if (DEMO_MODE) {
      const data = await loadDemoData();
      const values = data.ratings.filter((r) => r.book === bookId).map((r) => r.rating);
      const own = readDemoStore().ratings[bookId];
      if (own) values.push(own);
      if (values.length === 0) return 0;
      return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
    }
    const response = await axios.get(`${API_URL}/ratings?filters[book][documentId][$eq]=${bookId}`);
    const ratings = response.data.data;
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
  }

  static async rateBook(userId, bookId, rating) {
    const token = this.getAuthHeader();
    if (!token) return false;

    if (DEMO_MODE) {
      const store = readDemoStore();
      store.ratings[bookId] = rating;
      writeDemoStore(store);
      return true;
    }

    const existingRating = await this.getUserBookRating(userId, bookId);

    if (existingRating) {
      await axios.put(
        `${API_URL}/ratings/${existingRating.documentId}`,
        { data: { rating } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        `${API_URL}/ratings`,
        { data: { user: userId, book: bookId, rating } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    return true;
  }

  static async getUserBookRating(userId, bookId) {
    const token = this.getAuthHeader();
    if (!token) return null;

    if (DEMO_MODE) {
      const own = readDemoStore().ratings[bookId];
      return own ? { documentId: `demo-rating-${bookId}`, rating: own } : null;
    }

    const response = await axios.get(
      `${API_URL}/ratings?filters[user][documentId][$eq]=${userId}&filters[book][documentId][$eq]=${bookId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data[0] || null;
  }

  static async getUserRatings(userId) {
    if (DEMO_MODE) {
      const data = await loadDemoData();
      return Object.entries(readDemoStore().ratings)
        .map(([bookId, rating]) => ({ documentId: `demo-rating-${bookId}`, rating, book: demoBook(data, bookId) }))
        .filter((r) => r.book);
    }
    try {
      const token = this.getAuthHeader();
      if (!token) return [];

      const response = await axios.get(
        `${API_URL}/ratings?filters[user][documentId][$eq]=${userId}&populate[book][populate]=image`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.data || [];
    } catch (err) {
      console.error("Fel vid hämtning av betyg:", err);
      return [];
    }
  }

  static async deleteRating(documentId) {
    if (DEMO_MODE) {
      const store = readDemoStore();
      delete store.ratings[documentId.replace("demo-rating-", "")];
      writeDemoStore(store);
      return true;
    }
    try {
      const token = this.getAuthHeader();
      if (!token) return false;

      await axios.delete(`${API_URL}/ratings/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (err) {
      console.error("Fel vid borttagning av betyg:", err);
      return false;
    }
  }

  static logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }
}
