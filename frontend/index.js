import { Api } from "./api.js";
import "./toast.js";
import { applyTheme } from "./theme.js";
import { createBookCard, formatAvgRating } from "./components/bookCard.js";
import { createRatingSelect } from "./components/ratingSelect.js";

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
  const [avgRating, userRating, alreadyInWishlist] = await Promise.all([
    Api.getBookRating(book.documentId),
    isLoggedIn ? Api.getUserBookRating(user.documentId, book.documentId) : null,
    isLoggedIn ? Api.checkWishlist(user.documentId, book.documentId) : false,
  ]);

  if (!isLoggedIn) {
    return createBookCard(book, { loggedIn: false, avgRating, ratingSection: null, actions: [] });
  }

  const card = createBookCard(book, {
    avgRating,
    ratingSection: createRatingSelect(userRating?.rating, async (rating) => {
      const success = await Api.rateBook(user.documentId, book.documentId, rating);
      if (!success) return toastr.error("Kunde inte spara betyg");
      toastr.success("Betyg sparat!");
      const newAvgRating = await Api.getBookRating(book.documentId);
      card.querySelector(".book-rating").textContent = formatAvgRating(newAvgRating);
    }),
    actions: [createWishlistButton(alreadyInWishlist, () => Api.addToWishlist(user.documentId, book.documentId))],
  });
  return card;
};

const createWishlistButton = (alreadyInWishlist, onAdd) => {
  const button = document.createElement("button");
  const markSaved = () => {
    button.textContent = "Boken är sparad";
    button.disabled = true;
    button.className = "book-action-btn wishlist-btn active";
  };

  if (alreadyInWishlist) {
    markSaved();
  } else {
    button.textContent = "Läs senare";
    button.className = "book-action-btn read-later-btn";
    button.addEventListener("click", async () => {
      if (await onAdd()) {
        toastr.success("Boken tillagd");
        markSaved();
      }
    });
  }
  return button;
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});
loadBooks();
