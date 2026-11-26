import { Api, DEMO_MODE, isHomePage, pageUrl } from "./api.js";
import "./toast.js";
import { applyTheme } from "./theme.js";
import { el } from "./dom.js";
import { openModal, closeModal, closeOnBackdropClick } from "./components/modal.js";
import { validateForm, clearErrorsOnInput } from "./components/formErrors.js";

function initModals() {
  let loginBtn = document.getElementById("login-btn");
  let registerBtn = document.getElementById("register-btn");
  let loginModal = document.getElementById("login-modal");
  let registerModal = document.getElementById("register-modal");
  let closeButtons = document.querySelectorAll(".close");
  let showRegisterLink = document.getElementById("show-register");
  let showLoginLink = document.getElementById("show-login");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      openModal(loginModal);
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      openModal(registerModal);
    });
  }

  // Knappar utanför headern (t.ex. på landningssidan) kan öppna inloggningsdialogen med data-open-login.
  document.querySelectorAll("[data-open-login]").forEach((button) => {
    button.addEventListener("click", () => openModal(loginModal));
  });

  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(registerModal);
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal(registerModal);
      openModal(loginModal);
    });
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(loginModal);
      closeModal(registerModal);
    });
  });

  [loginModal, registerModal].forEach((dialog) => dialog && closeOnBackdropClick(dialog));

  authForms();
  addDemoLoginButton();
}

// Demoläge: knapp som loggar in direkt som demoanvändare (ingen Strapi behövs).
const addDemoLoginButton = () => {
  const loginForm = document.getElementById("login-form");
  if (!DEMO_MODE || !loginForm || document.getElementById("demo-login-btn")) return;

  const wrapper = el("div", "demo-login");
  const demoButton = el("button", "btn btn-block", "Prova demokontot", { type: "button", id: "demo-login-btn" });
  wrapper.append(
    el("div", "divider", "eller", { "aria-hidden": "true" }),
    demoButton,
    el("p", "demo-hint", "Demoversion. Dina betyg och dina sparade böcker sparas bara i din webbläsare.")
  );
  loginForm.after(wrapper);
  demoButton.addEventListener("click", handleDemoLogin);
};

const handleDemoLogin = async () => {
  const data = await Api.login();
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  closeModal(document.getElementById("login-modal"));
  userUI(data.user);
  toastr.success("Du är nu inloggad med demokontot - välkommen!");
  setTimeout(() => {
    location.reload();
  }, 1500);
};

const addDemoBadge = () => {
  const header = document.querySelector("header");
  if (!DEMO_MODE || !header || header.querySelector(".demo-badge")) return;
  const badge = document.createElement("span");
  badge.className = "demo-badge";
  badge.textContent = "Demo";
  badge.title = "Demoversion – innehållet är en fast katalog och körs utan Strapi-server";
  header.querySelector(".brand")?.append(badge);
};

const authForms = () => {
  let loginForm = document.getElementById("login-form");
  let registerForm = document.getElementById("register-form");
  [
    [loginForm, handleLogin],
    [registerForm, handleRegister],
  ].forEach(([form, handler]) => {
    if (!form) return;
    clearErrorsOnInput(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (validateForm(form)) handler(e);
    });
  });
};

const handleLogin = async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    let data = await Api.login(email, password);
    sessionStorage.setItem("token", data.jwt);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    closeModal(document.getElementById("login-modal"));
    userUI(data.user);
    toastr.success("Du loggas nu in - välkommen!");
    setTimeout(() => {
      location.reload();
    }, 3000);
  } catch (error) {
    console.error("Inloggningsfel:", error);
    toastr.error("Inloggningen misslyckades. Kontrollera dina uppgifter och försök igen.");
  }
};

const handleRegister = async (event) => {
  event.preventDefault();

  let username = document.getElementById("register-username").value;
  let email = document.getElementById("register-email").value;
  let password = document.getElementById("register-password").value;

  try {
    let data = await Api.register(username, email, password);
    sessionStorage.setItem("token", data.jwt);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    closeModal(document.getElementById("register-modal"));
    userUI(data.user);
    toastr.success("Registrering lyckades! Du är nu inloggad.");
    setTimeout(() => {
      location.reload();
    }, 3000);
  } catch (error) {
    toastr.error("Registreringen misslyckades. Kontrollera dina uppgifter och försök igen.");
  }
};

const checkLogin = () => {
  const token = Api.getAuthHeader();
  const user = token ? JSON.parse(sessionStorage.getItem("user")) : null;
  if (user) {
    userUI(user);
  } else {
    const userControls = document.getElementById("user-controls");
    if (userControls) {
      userControls.innerHTML = `
                <button id="login-btn" class="btn">Logga in</button>
                <button id="register-btn" class="btn btn-primary">Skapa konto</button>
            `;
      initModals();
    }
  }
};

// Svensk genitiv: "Anna" -> "Annas", "Alex" -> "Alex"
const possessive = (name) => (/[sxz]$/i.test(name) ? name : `${name}s`);

const userUI = (user) => {
  const userControls = document.getElementById("user-controls");
  if (userControls) {
    const name = el("strong", null, user.username);
    const greeting = el("span", "greeting");
    const navLink = el("a", "btn");
    if (isHomePage()) {
      greeting.append("Välkommen, ", name);
      navLink.href = pageUrl("user/profile.html");
      navLink.textContent = "Min profil";
    } else {
      greeting.append(el("strong", null, possessive(user.username)), " profilsida");
      navLink.href = pageUrl("index.html");
      navLink.textContent = "Till förstasidan";
    }
    const logoutBtn = el("button", "btn btn-primary", "Logga ut", { id: "logout-btn" });
    userControls.replaceChildren(greeting, " ", navLink, " ", logoutBtn);

    logoutBtn.addEventListener("click", () => {
      Api.logout();
      location.reload();
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  checkLogin();
  applyTheme();
  addDemoBadge();
});
