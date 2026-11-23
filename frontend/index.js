import { Api, imageUrl } from "./api.js";
import "./toast.js";
import { applyTheme } from "./theme.js";
import { el } from "./dom.js";

await Api.isLoggedIn();

// Samma text används vid första rendering och när snittbetyget uppdateras efter en röst.
const formatAvgRating = (avgRating) => `Snittbetyg: ⭐ ${avgRating > 0 ? `${avgRating}/10` : "Saknar betyg"}`;

const loadBooks = async () => {
  const books = await Api.getBooks();
  const container = document.getElementById("books-container");
  container.innerHTML = "";

  // Korten byggs parallellt men läggs in i boklistans ordning (inte i den ordning svaren kommer).
  const cards = await Promise.all(books.map(createBookCard));
  container.append(...cards);
};

const createBookCard = async (book) => {
  const token = Api.getAuthHeader();
  const isLoggedIn = !!token;
  const user = isLoggedIn ? JSON.parse(sessionStorage.getItem("user")) : null;

  // Alla anrop för kortet startas samtidigt i stället för ett i taget.
  const [avgRating, userRating, alreadyInWishlist] = await Promise.all([
    Api.getBookRating(book.documentId),
    isLoggedIn ? Api.getUserBookRating(user.documentId, book.documentId) : null,
    isLoggedIn ? Api.checkWishlist(user.documentId, book.documentId) : false,
  ]);
  const card = document.createElement("div");
  card.className = isLoggedIn ? "book-card logged-in" : "book-card logged-out";

  const cover = el("div", "book-cover-container");
  cover.append(el("img", "book-cover", null, { src: imageUrl(book), alt: `Omslag: ${book.title}` }));

  const info = el("div", "book-info");
  info.append(
    el("h3", "book-title", book.title),
    el("p", "book-author", book.author),
    el("p", "book-details", `Sidor: ${book.pages}`),
    el("p", "book-details", `Publicerad: ${book.publicationDate}`),
    el("p", "book-rating", formatAvgRating(avgRating))
  );

  card.append(cover, info, el("div", "rating-section-container"), el("div", "button-container"));

  if (token) {
    const buttonContainer = card.querySelector(".button-container");
    const ratingContainer = document.createElement("div");
    ratingContainer.className = "rating-container";
    ratingContainer.innerHTML = `
      <div class="rating-section">
        <label>Ge boken ett betyg:</label>
        <select class="rating-select">
          <option value="">Välj betyg</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>
    `;

    if (userRating) {
      ratingContainer.querySelector(".rating-select").value = userRating.rating;
    }

    ratingContainer.querySelector(".rating-select").addEventListener("change", async (e) => {
      const rating = parseInt(e.target.value);
      if (rating) {
        const success = await Api.rateBook(user.documentId, book.documentId, rating);
        if (success) {
          toastr.success("Betyg sparat!");
          const newAvgRating = await Api.getBookRating(book.documentId);
          card.querySelector(".book-rating").textContent = formatAvgRating(newAvgRating);
        } else {
          toastr.error("Kunde inte spara betyg");
        }
      }
    });

    const ratingSectionContainer = card.querySelector(".rating-section-container");
    ratingSectionContainer.append(ratingContainer);
    const wishlistBtn = document.createElement("button");

    if (alreadyInWishlist) {
      wishlistBtn.textContent = "Boken är sparad";
      wishlistBtn.disabled = true;
      wishlistBtn.className = "book-action-btn wishlist-btn active";
    } else {
      wishlistBtn.textContent = "Läs senare";
      wishlistBtn.className = "book-action-btn read-later-btn";
      wishlistBtn.addEventListener("click", async () => {
        if (await Api.addToWishlist(user.documentId, book.documentId)) {
          toastr.success("Boken tillagd");
          wishlistBtn.textContent = "Boken är sparad";
          wishlistBtn.disabled = true;
          wishlistBtn.className = "book-action-btn wishlist-btn active";
        }
      });
    }

    buttonContainer.append(wishlistBtn);
  }

  return card;
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});
loadBooks();
