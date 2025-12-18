const STORAGE_KEY = "eren_blog_posts_v1";
const THEME_KEY_ADMIN = "eren_blog_theme";
const ADMIN_SESSION_KEY = "eren_blog_admin_session";
const ADMIN_USERNAME = "eternal23";
let currentEditPostId = null;

// SHA-256 hash fonksiyonu
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

function adminGetStoredPosts() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function adminSetStoredPosts(posts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // ignore
  }
}

function adminFormatDate(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderAdminPosts() {
  const container = document.getElementById("adminPostsList");
  if (!container) return;

  const posts = adminGetStoredPosts().slice().sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  container.innerHTML = "";

  if (posts.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent =
      "Henüz hiç yazı eklenmemiş. Sağ taraftaki formdan ilk yazını oluştur.";
    container.appendChild(p);
    return;
  }

  posts.forEach((post) => {
    const row = document.createElement("div");
    row.className = "admin-post-item";

    const left = document.createElement("div");
    const title = document.createElement("span");
    title.className = "admin-post-item-title";
    title.textContent = post.title || "Başlıksız";
    const date = document.createElement("div");
    date.className = "admin-post-item-date";
    date.textContent = adminFormatDate(post.createdAt);
    left.appendChild(title);
    left.appendChild(date);

    const actions = document.createElement("div");
    actions.className = "admin-post-actions";

    const tagChip = document.createElement("span");
    tagChip.className = "badge";
    tagChip.textContent = post.tag || "Genel";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn secondary-btn admin-edit-btn";
    editBtn.textContent = "Düzenle";
    editBtn.addEventListener("click", () => {
      const titleInput = /** @type {HTMLInputElement} */ (
        document.getElementById("postTitle")
      );
      const tagInput = /** @type {HTMLInputElement} */ (
        document.getElementById("postTag")
      );
      const excerptInput = /** @type {HTMLTextAreaElement} */ (
        document.getElementById("postExcerpt")
      );
      const contentInput = /** @type {HTMLTextAreaElement} */ (
        document.getElementById("postContent")
      );
      const submitBtn = document.getElementById("postSubmitBtn");

      if (titleInput) titleInput.value = post.title || "";
      if (tagInput) tagInput.value = post.tag || "";
      if (excerptInput) excerptInput.value = post.excerpt || "";
      if (contentInput) contentInput.value = post.content || "";

      currentEditPostId = post.id || null;

      if (submitBtn) {
        submitBtn.textContent = "Yazıyı Güncelle";
      }
      const successEl = document.getElementById("postSuccess");
      if (successEl) successEl.textContent = "Düzenleme modundasın. Değişiklik yapıp kaydedebilirsin.";
    });

    actions.appendChild(tagChip);
    actions.appendChild(editBtn);

    row.appendChild(left);
    row.appendChild(actions);

    container.appendChild(row);
  });
}

function showAdminPanel(show) {
  const loginSection = document.getElementById("loginSection");
  const adminSection = document.getElementById("adminSection");
  if (!loginSection || !adminSection) return;

  if (show) {
    loginSection.style.display = "none";
    adminSection.classList.add("active");
    adminSection.setAttribute("aria-hidden", "false");
  } else {
    loginSection.style.display = "";
    adminSection.classList.remove("active");
    adminSection.setAttribute("aria-hidden", "true");
  }
}

function isAdminAuthenticated() {
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

function setAdminAuthenticated(auth) {
  if (auth) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, "1");
  } else {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

function initAdminAuth() {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isAdminAuthenticated()) {
    showAdminPanel(true);
    renderAdminPosts();
  } else {
    showAdminPanel(false);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = /** @type {HTMLInputElement} */ (
        document.getElementById("username")
      );
      const password = /** @type {HTMLInputElement} */ (
        document.getElementById("password")
      );

      const u = username ? username.value.trim() : "";
      const p = password ? password.value : "";

      if (u === ADMIN_USERNAME) {
        // Şifreyi hash'leyip kontrol et
        hashPassword(p).then((hashedPassword) => {
          // lorderen23 için gerçek hash'i hesapla ve karşılaştır
          hashPassword("lorderen23").then((correctHash) => {
            if (hashedPassword === correctHash) {
              setAdminAuthenticated(true);
              if (loginError) loginError.textContent = "";
              showAdminPanel(true);
              renderAdminPosts();
            } else {
              if (loginError) {
                loginError.textContent = "Kullanıcı adı veya şifre hatalı.";
              }
            }
          });
        });
      } else {
        if (loginError) {
          loginError.textContent = "Kullanıcı adı veya şifre hatalı.";
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setAdminAuthenticated(false);
      showAdminPanel(false);
    });
  }
}

function initAdminPostForm() {
  const form = document.getElementById("postForm");
  const successEl = document.getElementById("postSuccess");
  const submitBtn = document.getElementById("postSubmitBtn");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = /** @type {HTMLInputElement} */ (
      document.getElementById("postTitle")
    );
    const tag = /** @type {HTMLInputElement} */ (
      document.getElementById("postTag")
    );
    const excerpt = /** @type {HTMLTextAreaElement} */ (
      document.getElementById("postExcerpt")
    );
    const content = /** @type {HTMLTextAreaElement} */ (
      document.getElementById("postContent")
    );

    const posts = adminGetStoredPosts();

    if (currentEditPostId) {
      const idx = posts.findIndex((p) => p.id === currentEditPostId);
      if (idx !== -1) {
        posts[idx] = {
          ...posts[idx],
          title: title?.value.trim() || "Başlıksız",
          tag: tag?.value.trim() || "Genel",
          excerpt: excerpt?.value.trim() || "",
          content: content?.value || "",
        };
      }
    } else {
      const newPost = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: title?.value.trim() || "Başlıksız",
        tag: tag?.value.trim() || "Genel",
        excerpt: excerpt?.value.trim() || "",
        content: content?.value || "",
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
    }

    adminSetStoredPosts(posts);
    renderAdminPosts();

    form.reset();
    currentEditPostId = null;
    if (submitBtn) {
      submitBtn.textContent = "Yazıyı Kaydet";
    }
    if (successEl) {
      successEl.textContent = "Yazı başarıyla kaydedildi! Anasayfada görebilirsin.";
      setTimeout(() => {
        successEl.textContent = "";
      }, 2500);
    }
  });
}

function applyAdminTheme(theme) {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-light");
  body.classList.add(theme === "light" ? "theme-light" : "theme-dark");

  const btn = document.getElementById("adminThemeToggle");
  if (btn) {
    const iconEl = btn.querySelector(".theme-icon");
    if (iconEl) {
      iconEl.textContent = theme === "light" ? "☀️" : "🌙";
    }
  }
}

function initAdminTheme() {
  const saved = window.localStorage.getItem(THEME_KEY_ADMIN);
  const theme = saved === "light" || saved === "dark" ? saved : "dark";
  applyAdminTheme(theme);

  const btn = document.getElementById("adminThemeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current =
        document.body.classList.contains("theme-light") ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY_ADMIN, next);
      applyAdminTheme(next);
    });
  }
}

function initAdminYear() {
  const y = document.getElementById("adminYear");
  if (y) y.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminTheme();
  initAdminAuth();
  initAdminPostForm();
  initAdminYear();
});


