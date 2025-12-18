const STORAGE_KEY = "eren_blog_posts_v1";

function getStoredPostsForDetail() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function formatDateDetail(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderPostDetail() {
  const container = document.getElementById("postDetail");
  const status = document.getElementById("postDetailStatus");
  if (!container) return;

  const id = getQueryId();
  const posts = getStoredPostsForDetail();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    if (status) {
      status.textContent =
        "Bu yazı bulunamadı. Belki tarayıcıdaki kayıtlı yazılar silinmiştir.";
    }
    return;
  }

  container.innerHTML = "";

  const meta = document.createElement("div");
  meta.className = "post-meta";

  const dateEl = document.createElement("span");
  dateEl.className = "post-date";
  dateEl.textContent = formatDateDetail(post.createdAt);

  const tagEl = document.createElement("span");
  tagEl.className = "post-tag";
  tagEl.textContent = post.tag || "Genel";

  meta.appendChild(dateEl);
  meta.appendChild(tagEl);

  const titleEl = document.createElement("h2");
  titleEl.className = "post-detail-title";
  titleEl.textContent = post.title || "Başlıksız";

  const excerptEl = document.createElement("p");
  excerptEl.className = "post-detail-excerpt";
  excerptEl.textContent = post.excerpt || "";

  const contentEl = document.createElement("p");
  contentEl.className = "post-detail-content";
  contentEl.textContent =
    post.content && post.content.trim().length > 0
      ? post.content
      : post.excerpt || "";

  const backLink = document.createElement("a");
  backLink.href = "index.html";
  backLink.className = "btn secondary-btn";
  backLink.textContent = "Tüm yazılara dön";

  container.appendChild(meta);
  container.appendChild(titleEl);
  if (excerptEl.textContent) container.appendChild(excerptEl);
  container.appendChild(contentEl);
  container.appendChild(backLink);
}

function initDetailYear() {
  const y = document.getElementById("yearDetail");
  if (y) y.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  renderPostDetail();
  initDetailYear();
});


