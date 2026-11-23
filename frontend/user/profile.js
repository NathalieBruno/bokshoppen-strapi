import { Api } from "../api.js";
import "../toast.js";
import { applyTheme } from "../theme.js";
import { el } from "../dom.js";
import { createBookCard } from "../components/bookCard.js";

await Api.isLoggedIn();


const sortTitleBtn = document.getElementById("sort-title");
const sortAuthorBtn = document.getElementById("sort-author");
const sortRatingTitleBtn = document.getElementById("sort-rating-title");
const sortRatingAuthorBtn = document.getElementById("sort-rating-author");
const sortRatingRatingBtn = document.getElementById("sort-rating-rating");

let userWishlist = [];
let originalWishlist = [];
let userRatings = [];
let originalRatings = [];

const getUserWishlist = async () => {
  const me = await Api.getMeWithWishlist();

  userWishlist = me.wishlists;

  return { wishlist: userWishlist };
};

const getUserRatings = async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  userRatings = await Api.getUserRatings(user.documentId);
  return userRatings;
};

const sortWishlist = (sortBy, buttonId, otherButtonId) => {
  const activeBtn = document.getElementById(buttonId);

  if (activeBtn.classList.contains("active")) {
    userWishlist = [...originalWishlist];
    renderWishlist();
    activeBtn.classList.remove("active");
    return;
  }

  userWishlist.sort((a, b) => {
    const valueA = a.book[sortBy].toLowerCase().trim();
    const valueB = b.book[sortBy].toLowerCase().trim();
    return valueA.localeCompare(valueB, "sv");
  });

  renderWishlist();
  activeBtn.classList.add("active");
  document.getElementById(otherButtonId).classList.remove("active");
};

const sortRatings = (sortBy, buttonId) => {
  const activeBtn = document.getElementById(buttonId);

  if (activeBtn.classList.contains("active")) {
    userRatings = [...originalRatings];
    renderRatings();
    sortRatingTitleBtn?.classList.remove("active");
    sortRatingAuthorBtn?.classList.remove("active");
    sortRatingRatingBtn?.classList.remove("active");
    return;
  }

  if (sortBy === "rating") {
    userRatings.sort((a, b) => b.rating - a.rating);
  } else {
    userRatings.sort((a, b) => {
      const valueA = a.book[sortBy].toLowerCase().trim();
      const valueB = b.book[sortBy].toLowerCase().trim();
      return valueA.localeCompare(valueB, "sv");
    });
  }

  renderRatings();

  sortRatingTitleBtn?.classList.remove("active");
  sortRatingAuthorBtn?.classList.remove("active");
  sortRatingRatingBtn?.classList.remove("active");
  activeBtn.classList.add("active");
};

const renderWishlist = () => {
  const container = document.getElementById("wishlist-container");
  container.innerHTML = "";

  if (userWishlist.length === 0) {
    container.innerHTML = "<p>Din önskelista är tom.</p>";
    return;
  }

  userWishlist.forEach((book) => {
    container.append(createWishlistCard(book));
  });
};

const renderRatings = () => {
  const container = document.getElementById("ratings-container");
  container.innerHTML = "";

  if (userRatings.length === 0) {
    container.innerHTML = "<p>Du har inte betygsatt några böcker än.</p>";
    return;
  }

  userRatings.forEach((rating) => {
    container.append(createRatingCard(rating));
  });
};

const loadBooks = async () => {
  const books = await getUserWishlist();
  userWishlist = books.wishlist;
  originalWishlist = [...userWishlist];

  await getUserRatings();
  originalRatings = [...userRatings];

  renderWishlist();
  renderRatings();
};

const createWishlistCard = (item) => {
  const removeBtn = el("button", "book-action-btn remove-from-wishlist", "Ta bort från listan");
  const wishlistId = item.documentId;

  removeBtn.addEventListener("click", async () => {
    if (!confirm("Är du säker på att du vill ta bort boken från din önskelista?")) return;
    if (await Api.deleteWishlistItem(wishlistId)) {
      toastr.success("Boken har tagits bort!");
      const filterById = (id) => (entry) => entry.documentId !== id;
      originalWishlist = originalWishlist.filter(filterById(wishlistId));
      userWishlist = userWishlist.filter(filterById(wishlistId));
      renderWishlist();
    } else {
      toastr.error("Kunde inte ta bort boken, försök igen");
    }
  });

  return createBookCard(item.book, { actions: sessionStorage.getItem("token") ? [removeBtn] : [] });
};

const createRatingCard = ({ book, rating }) => {
  const ratingLine = el("p", "book-rating");
  ratingLine.style.fontSize = "18px";
  ratingLine.append(el("strong", null, `Ditt betyg: ${rating}`));
  return createBookCard(book, { ratingLine });
};

const toggleSection = (section) => {
  const content = document.getElementById(`${section}-content`);
  const icon = document.getElementById(`${section}-icon`);

  content.classList.toggle("collapsed");
  content.classList.toggle("expanded");
  icon.classList.toggle("collapsed");
};

document.querySelectorAll(".section-header[data-section]").forEach((header) => {
  header.addEventListener("click", () => toggleSection(header.dataset.section));
});

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});

sortTitleBtn.addEventListener("click", () => sortWishlist("title", "sort-title", "sort-author"));
sortAuthorBtn.addEventListener("click", () => sortWishlist("author", "sort-author", "sort-title"));
sortRatingTitleBtn.addEventListener("click", () => sortRatings("title", "sort-rating-title"));
sortRatingAuthorBtn.addEventListener("click", () => sortRatings("author", "sort-rating-author"));
sortRatingRatingBtn.addEventListener("click", () => sortRatings("rating", "sort-rating-rating"));

loadBooks();
