import { Api } from "./api.js";
import "./toast.js";
import { applyTheme } from "./theme.js";
import { el } from "./dom.js";
import { createBookCard, setBookStatus } from "./components/bookCard.js";
import { renderRating } from "./components/rating.js";
import { createIcon } from "./components/icons.js";
import { openReadDialog } from "./components/readDialog.js";

await Api.isLoggedIn();

// Controller för startsidan: hämtar data via Api, låter bookCard rendera och kopplar ihop händelser.
const loadBooks = async () => {
  const books = await Api.getBooks();
  const container = document.getElementById("books-container");
  container.innerHTML = "";

  // Korten byggs parallellt men läggs in i boklistans ordning (inte i den ordning svaren kommer).
  const cards = await Promise.all(books.map(buildCard));
  container.append(...cards);
};

const buildCard = async (book) => {
  const isLoggedIn = !!Api.getAuthHeader();
  const user = isLoggedIn ? JSON.parse(sessionStorage.getItem("user")) : null;

  // Alla anrop för kortet startas samtidigt i stället för ett i taget.
  const [avgRating, userRating, wishlistItem] = await Promise.all([
    Api.getBookRating(book.documentId),
    isLoggedIn ? Api.getUserBookRating(user.documentId, book.documentId) : null,
    isLoggedIn ? Api.getWishlistItem(user.documentId, book.documentId) : null,
  ]);

  if (!isLoggedIn) {
    return createBookCard(book, {
      loggedIn: false,
      rating: { label: "Snittbetyg", value: avgRating },
      ratingSection: null,
      actions: [],
    });
  }

  // En bok är antingen läst (betygsatt) eller sparad ("Spara bok"). Kortets knappar följer det tillståndet.
  const state = { rating: userRating?.rating ?? null, wishlistItem };
  const card = createBookCard(book, { rating: { label: "Snittbetyg", value: avgRating }, actions: [] });
  // Alla kort har samma åtgärdsyta (två rader), så primärknapp och statusplatta hamnar på samma höjd.
  card.querySelector(".button-container").classList.add("button-container--fixed");
  renderActions(card, book, user, state);
  return card;
};

const bookButton = (className, label, book, onClick, icon) => {
  const button = el("button", `btn btn-compact ${className}`, null, { type: "button" });
  if (icon) button.append(createIcon(icon));
  button.append(label, el("span", "sr-only", `: ${book.title}`));
  button.addEventListener("click", onClick);
  return button;
};

// Status som ren, centrerad text (inte en knapp) på primärknappens plats. tabindex -1 låter oss flytta fokus hit.
const statusText = (text) => el("p", "card-status", text, { tabindex: "-1" });

const renderActions = (card, book, user, state) => {
  const container = card.querySelector(".button-container");
  const rerender = () => {
    renderActions(card, book, user, state);
    // Knappen som användes har ersatts, så fokus flyttas till kortets första element i stället för att försvinna.
    container.firstElementChild?.focus();
  };

  // Statusikonen vid titeln: bokmärke för sparad, bock för läst, ingen ikon för övriga.
  setBookStatus(card, book, state.rating ? "read" : state.wishlistItem ? "saved" : undefined);

  // Eget betyg visas bara under Min profil, inte i katalogen.
  if (state.rating) {
    container.replaceChildren(statusText("Läst bok"));
    return;
  }

  const readButton = bookButton("btn-text", "Jag har läst boken", book, () =>
    openReadDialog({
      book,
      userId: user.documentId,
      wishlistItem: state.wishlistItem,
      text: `Betygsätt ”${book.title}” så markeras den som läst.`,
      onDone: async ({ rating, removed }) => {
        state.rating = rating;
        if (removed) state.wishlistItem = null;
        rerender();
        renderRating(card.querySelector(".book-rating"), {
          label: "Snittbetyg",
          value: await Api.getBookRating(book.documentId),
        });
      },
    }),
  );

  if (state.wishlistItem) {
    container.replaceChildren(statusText("Sparad bok"), readButton);
    return;
  }

  const saveButton = bookButton(
    "btn-primary",
    "Spara bok",
    book,
    async () => {
      saveButton.disabled = true;
      const item = await Api.addToWishlist(user.documentId, book.documentId);
      if (!item) {
        saveButton.disabled = false;
        return toastr.error("Kunde inte spara boken, försök igen");
      }
      toastr.success("Boken är sparad");
      state.wishlistItem = item;
      rerender();
    },
    "bookmark",
  );
  container.replaceChildren(saveButton, readButton);
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});
loadBooks();
