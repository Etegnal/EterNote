// Basit blog veritabanı (localStorage)
const STORAGE_KEY = "eren_blog_posts_v1";
const THEME_KEY = "eren_blog_theme";

function getStoredPosts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function setStoredPosts(posts) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // sessizce yoksay
  }
}

function ensureSeedPosts() {
  const existing = getStoredPosts();
  if (existing.length > 0) return existing;

  const now = new Date();
  const seed = [
    {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title: "Hoş geldin!",
      tag: "Genel",
      excerpt: "Bu yazı, blogunun ilk örnek yazısıdır. Admin panelinden yenilerini ekleyebilirsin.",
      content:
        "Bu sadece örnek bir içerik. Admin panelinden giriş yapıp yeni yazılar eklediğinde, burada listelenecekler.",
      createdAt: now.toISOString(),
    },
  ];
  setStoredPosts(seed);
  return seed;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function renderPosts() {
  const postsGrid = document.getElementById("postsGrid");
  const template = document.getElementById("postCardTemplate");
  if (!postsGrid || !template) return;

  const posts = ensureSeedPosts()
    .slice()
    .sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  postsGrid.innerHTML = "";

  if (posts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent =
      "Henüz yazı eklenmemiş. Admin panelinden yeni yazılar oluşturabilirsin.";
    postsGrid.appendChild(empty);
    return;
  }

  posts.forEach((post, index) => {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".post-card");
    const titleEl = node.querySelector(".post-title");
    const dateEl = node.querySelector(".post-date");
    const tagEl = node.querySelector(".post-tag");
    const excerptEl = node.querySelector(".post-excerpt");

    if (article) {
      if (index > 0) {
        article.classList.add("delay-1");
      }
      if (index > 2) {
        article.classList.add("delay-2");
      }
    }

    if (titleEl) titleEl.textContent = post.title || "Başlıksız";
    if (dateEl) dateEl.textContent = formatDate(post.createdAt);
    if (tagEl) tagEl.textContent = post.tag || "Genel";
    if (excerptEl) excerptEl.textContent = post.excerpt || "";

    if (article && post.id) {
      article.style.cursor = "pointer";
      article.addEventListener("click", () => {
        window.location.href = `post.html?id=${encodeURIComponent(post.id)}`;
      });
    }

    postsGrid.appendChild(node);
  });
}

function applyTheme(theme) {
  const body = document.body;
  if (!body) return;

  body.classList.remove("theme-dark", "theme-light");
  body.classList.add(theme === "light" ? "theme-light" : "theme-dark");

  const btn = document.getElementById("themeToggle");
  if (btn) {
    const iconEl = btn.querySelector(".theme-icon");
    if (iconEl) {
      iconEl.textContent = theme === "light" ? "☀️" : "🌙";
    }
  }
}

function initTheme() {
  const saved = window.localStorage.getItem(THEME_KEY);
  const theme = saved === "light" || saved === "dark" ? saved : "dark";
  applyTheme(theme);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current =
        document.body.classList.contains("theme-light") ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }
}

function initYear() {
  const yearEl = document.getElementById("year");
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  renderPosts();
  initTheme();
  initYear();
});


