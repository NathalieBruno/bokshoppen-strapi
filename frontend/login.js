import { Api, DEMO_MODE, isHomePage, pageUrl } from "./api.js";
import { applyTheme } from "./theme.js";

function initModals() {
  let loginBtn = document.getElementById("login-btn");
  let registerBtn = document.getElementById("register-btn");
  let loginModal = document.getElementById("login-modal");
  let registerModal = document.getElementById("register-modal");
  let closeButtons = document.querySelectorAll(".close");
  let showRegisterLink = document.getElementById("show-register");
  let showLoginLink = document.getElementById("show-login");

  toastr.options = {
    positionClass: "toast-bottom-right",
    toastClass: "toast toast--custom",
  };
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      loginModal.style.display = "block";
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      registerModal.style.display = "block";
    });
  }

  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      loginModal.style.display = "none";
      registerModal.style.display = "block";
    });
  }

  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      registerModal.style.display = "none";
      loginModal.style.display = "block";
    });
  }

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      loginModal.style.display = "none";
      registerModal.style.display = "none";
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.style.display = "none";
    }
    if (e.target === registerModal) {
      registerModal.style.display = "none";
    }
  });

  authForms();
  addDemoLoginButton();
}

// Demoläge: knapp som loggar in direkt som demoanvändare (ingen Strapi behövs).
const addDemoLoginButton = () => {
  const loginForm = document.getElementById("login-form");
  if (!DEMO_MODE || !loginForm || document.getElementById("demo-login-btn")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "demo-login";
  wrapper.innerHTML = `
    <button type="button" id="demo-login-btn" class="btn btn-primary">Try demo account</button>
    <p class="demo-hint">Demoversion – ingen server behövs. Dina betyg och önskelista sparas bara i din webbläsare.</p>
  `;
  loginForm.after(wrapper);
  wrapper.querySelector("#demo-login-btn").addEventListener("click", handleDemoLogin);
};

const handleDemoLogin = async () => {
  const data = await Api.login();
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("user", JSON.stringify(data.user));
  document.getElementById("login-modal").style.display = "none";
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
  header.querySelector("h1")?.append(badge);
};

const authForms = () => {
  let loginForm = document.getElementById("login-form");
  let registerForm = document.getElementById("register-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
};

const handleLogin = async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    let data = await Api.login(email, password);
    sessionStorage.setItem("token", data.jwt);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    document.getElementById("login-modal").style.display = "none";
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
    document.getElementById("register-modal").style.display = "none";
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
                <button id="login-btn" class="btn btn-primary">Logga in</button>
                <button id="register-btn" class="btn btn-primary">Skapa ett konto</button>
            `;
      initModals();
    }
  }
};

const userUI = (user) => {
  const userControls = document.getElementById("user-controls");
  if (userControls) {
    userControls.innerHTML = `
            ${
              isHomePage()
                ? `<span>Välkommen till bokklubben <strong>${user.username}</strong>!</span> <a href="${pageUrl("user/profile.html")}" class="btn btn-primary">Min profil</a>`
                : `<span><strong>${user.username}</strong>´s profilsida</span> <a href="${pageUrl("index.html")}" class="btn btn-primary">Till förstasidan</a>`
            }
            <button id="logout-btn" class="btn btn-primary">Logga ut</button>
        `;

    const logoutBtn = document.getElementById("logout-btn");
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
