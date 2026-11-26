import { Api } from "./api.js";
import "./toast.js";
import { applyTheme } from "./theme.js";
import { el } from "./dom.js";
import { createBookCard, renderAvgRating } from "./components/bookCard.js";
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
    return createBookCard(book, { loggedIn: false, avgRating, ratingSection: null, actions: [] });
  }

  // En bok är antingen läst (betygsatt) eller sparad ("Läs senare"). Kortets knappar följer det tillståndet.
  const state = { rating: userRating?.rating ?? null, wishlistItem };
  const card = createBookCard(book, { avgRating, actions: [] });
  renderActions(card, book, user, state);
  return card;
};

const bookButton = (className, label, book, onClick) => {
  const button = el("button", className, label, { type: "button" });
  button.append(el("span", "sr-only", `: ${book.title}`));
  button.addEventListener("click", onClick);
  return button;
};

const renderActions = (card, book, user, state) => {
  const container = card.querySelector(".button-container");
  const rerender = () => {
    renderActions(card, book, user, state);
    // Knappen som användes har ersatts, så fokus flyttas till kortets första element i stället för att försvinna.
    container.firstElementChild?.focus();
  };

  if (state.rating) {
    container.replaceChildren(el("p", "card-status", `Läst · ditt betyg ${state.rating}`, { tabindex: "-1" }));
    return;
  }

  const readButton = bookButton("btn btn-block", "Jag har läst boken", book, () =>
    openReadDialog({
      book,
      userId: user.documentId,
      wishlistItem: state.wishlistItem,
      text: `Betygsätt ”${book.title}” så markeras den som läst.`,
      onDone: async ({ rating, removed }) => {
        state.rating = rating;
        if (removed) state.wishlistItem = null;
        rerender();
        renderAvgRating(card.querySelector(".book-rating"), await Api.getBookRating(book.documentId));
      },
    })
  );

  if (state.wishlistItem) {
    container.replaceChildren(el("p", "card-status", "Sparad", { tabindex: "-1" }), readButton);
    return;
  }

  const saveButton = bookButton("btn btn-primary btn-block", "Läs senare", book, async () => {
    saveButton.disabled = true;
    const item = await Api.addToWishlist(user.documentId, book.documentId);
    if (!item) {
      saveButton.disabled = false;
      return toastr.error("Kunde inte spara boken, försök igen");
    }
    toastr.success("Boken tillagd");
    state.wishlistItem = item;
    rerender();
  });
  container.replaceChildren(saveButton, readButton);
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});
loadBooks();
