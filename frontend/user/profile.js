import { Api } from "../api.js";
import "../toast.js";
import { applyTheme } from "../theme.js";
import { el } from "../dom.js";
import { createBookCard } from "../components/bookCard.js";
import { openReadDialog } from "../components/readDialog.js";
import { closeModal, closeOnBackdropClick, confirmDialog } from "../components/modal.js";

await Api.isLoggedIn();

// Controller för profilsidan: hämtar data via Api, låter bookCard rendera och hanterar sortering,
// hopfällning och borttagning.

const byBookText = (field) => (a, b) =>
  a.book[field].toLowerCase().trim().localeCompare(b.book[field].toLowerCase().trim(), "sv");

const comparators = {
  title: byBookText("title"),
  author: byBookText("author"),
  rating: (a, b) => b.rating - a.rating,
};

// En lista per sektion: aktuell ordning, ursprunglig ordning och vilken sortering som är aktiv.
const lists = {
  wishlist: {
    items: [],
    original: [],
    activeSort: null,
    container: "wishlist-container",
    count: "wishlist-count",
    empty: "Du har inga sparade böcker.",
    createCard: (item) => createWishlistCard(item),
    sortButtons: { title: "sort-title", author: "sort-author" },
  },
  ratings: {
    items: [],
    original: [],
    activeSort: null,
    container: "ratings-container",
    count: "ratings-count",
    empty: "Du har inte läst eller betygsatt några böcker än.",
    createCard: (item) => createRatingCard(item),
    sortButtons: { title: "sort-rating-title", author: "sort-rating-author", rating: "sort-rating-rating" },
  },
};

const renderList = (name) => {
  const list = lists[name];
  const container = document.getElementById(list.container);
  container.replaceChildren();

  const count = list.items.length;
  document.getElementById(list.count).textContent = count === 1 ? "1 bok" : `${count} böcker`;

  if (count === 0) {
    container.append(el("p", "empty-state", list.empty));
  } else {
    container.append(...list.items.map(list.createCard));
  }

  Object.entries(list.sortButtons).forEach(([sortBy, buttonId]) => {
    document.getElementById(buttonId).setAttribute("aria-pressed", String(list.activeSort === sortBy));
  });
};

// Klick på aktiv sortering återställer ursprunglig ordning (som tidigare).
const sortList = (name, sortBy) => {
  const list = lists[name];
  if (list.activeSort === sortBy) {
    list.activeSort = null;
    list.items = [...list.original];
  } else {
    list.activeSort = sortBy;
    list.items = [...list.items].sort(comparators[sortBy]);
  }
  renderList(name);
  document.getElementById(list.sortButtons[sortBy]).focus();
};

const loadBooks = async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [me, ratings] = await Promise.all([Api.getMeWithWishlist(), Api.getUserRatings(user.documentId)]);

  lists.wishlist.activeSort = null;
  lists.ratings.activeSort = null;
  lists.wishlist.items = me.wishlists;
  lists.wishlist.original = [...me.wishlists];
  lists.ratings.items = ratings;
  lists.ratings.original = [...ratings];

  renderList("wishlist");
  renderList("ratings");
};

const confirmModal = document.getElementById("confirm-modal");
closeOnBackdropClick(confirmModal);
confirmModal.querySelectorAll(".close, [data-cancel]").forEach((button) => {
  button.addEventListener("click", () => closeModal(confirmModal));
});

// "Jag har läst boken": delad dialog (components/readDialog.js) sparar betyget och tar bort boken ur sparade.
const markAsRead = (item) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  openReadDialog({
    book: item.book,
    userId: user.documentId,
    wishlistItem: item,
    text: `Betygsätt ”${item.book.title}” så flyttas den från dina sparade till dina lästa böcker.`,
    onDone: loadBooks,
  });
};

const createWishlistCard = (item) => {
  const readBtn = el("button", "btn btn-compact btn-primary btn-block", "Jag har läst boken", { type: "button" });
  readBtn.append(el("span", "sr-only", `: ${item.book.title}`));
  readBtn.addEventListener("click", () => markAsRead(item));

  const removeBtn = el("button", "btn btn-compact btn-danger btn-block", "Ta bort från listan", { type: "button" });
  removeBtn.append(el("span", "sr-only", `: ${item.book.title}`));

  removeBtn.addEventListener("click", async () => {
    const confirmed = await confirmDialog(confirmModal, `”${item.book.title}” tas bort från dina sparade böcker.`);
    if (!confirmed) return;

    if (await Api.deleteWishlistItem(item.documentId)) {
      toastr.success("Boken har tagits bort!");
      const withoutItem = (entry) => entry.documentId !== item.documentId;
      lists.wishlist.original = lists.wishlist.original.filter(withoutItem);
      lists.wishlist.items = lists.wishlist.items.filter(withoutItem);
      renderList("wishlist");
    } else {
      toastr.error("Kunde inte ta bort boken, försök igen");
    }
  });

  return createBookCard(item.book, { headingLevel: 3, actions: sessionStorage.getItem("token") ? [readBtn, removeBtn] : [] });
};

const createRatingCard = (item) => {
  const { book, rating } = item;
  const removeBtn = el("button", "btn btn-compact btn-danger btn-block", "Ta bort boken", { type: "button" });
  removeBtn.append(el("span", "sr-only", `: ${book.title}`));

  removeBtn.addEventListener("click", async () => {
    const confirmed = await confirmDialog(confirmModal, `”${book.title}” tas bort från dina lästa böcker och ditt betyg raderas.`, {
      title: "Ta bort boken?",
      confirmLabel: "Ta bort",
    });
    if (!confirmed) return;

    if (await Api.deleteRating(item.documentId)) {
      toastr.success("Boken har tagits bort!");
      const withoutItem = (entry) => entry.documentId !== item.documentId;
      lists.ratings.original = lists.ratings.original.filter(withoutItem);
      lists.ratings.items = lists.ratings.items.filter(withoutItem);
      renderList("ratings");
    } else {
      toastr.error("Kunde inte ta bort boken, försök igen");
    }
  });

  return createBookCard(book, {
    rating: { label: "Ditt betyg", value: rating },
    headingLevel: 3,
    actions: sessionStorage.getItem("token") ? [removeBtn] : [],
  });
};

// Hopfällbara sektioner: knappen i rubriken styr aria-expanded och döljer innehållet.
document.querySelectorAll(".toggle[data-section]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    document.getElementById(`${toggle.dataset.section}-content`).hidden = expanded;
  });
});

Object.entries(lists).forEach(([name, list]) => {
  Object.entries(list.sortButtons).forEach(([sortBy, buttonId]) => {
    document.getElementById(buttonId).addEventListener("click", () => sortList(name, sortBy));
  });
});

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});

loadBooks();
