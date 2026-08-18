

"use strict";

const BRANDS = {
  visa: {
    label: "Visa",
    mark: "Visa",
    length: 16,

    randomPrefix: () => "4",
    glow: "rgba(90, 130, 220, 0.20)",
    tint: "rgba(90, 130, 220, 0.08)",
  },
  mastercard: {
    label: "Mastercard",
    mark: "Mastercard",
    length: 16,

    randomPrefix: () => {
      if (Math.random() < 0.5) {
        return String(50 + Math.floor(Math.random() * 5) + 1);
      }
      return String(2221 + Math.floor(Math.random() * 500));
    },
    glow: "rgba(224, 120, 60, 0.18)",
    tint: "rgba(224, 120, 60, 0.07)",
  },
  amex: {
    label: "American Express",
    mark: "Amex",
    length: 15,
    randomPrefix: () => (Math.random() < 0.5 ? "34" : "37"),
    glow: "rgba(60, 170, 200, 0.18)",
    tint: "rgba(60, 170, 200, 0.07)",
  },
  mir: {
    label: "Mir",
    mark: "Mir",
    length: 16,

    randomPrefix: () => `220${Math.floor(Math.random() * 5)}`,
    glow: "rgba(45, 190, 120, 0.16)",
    tint: "rgba(45, 190, 120, 0.06)",
  },
  unionpay: {
    label: "UnionPay",
    mark: "UnionPay",
    length: 16,
    randomPrefix: () => "62",
    glow: "rgba(40, 120, 220, 0.18)",
    tint: "rgba(40, 120, 220, 0.07)",
  },
  discover: {
    label: "Discover",
    mark: "Discover",
    length: 16,

    randomPrefix: () => {
      const r = Math.random();
      if (r < 0.45) return "6011";
      if (r < 0.7) return "65";
      return String(644 + Math.floor(Math.random() * 6));
    },
    glow: "rgba(230, 90, 60, 0.16)",
    tint: "rgba(230, 90, 60, 0.06)",
  },
  jcb: {
    label: "JCB",
    mark: "JCB",
    length: 16,

    randomPrefix: () => String(3528 + Math.floor(Math.random() * 62)),
    glow: "rgba(60, 160, 90, 0.16)",
    tint: "rgba(60, 160, 90, 0.06)",
  },
  any: {
    label: "Any",
    mark: "Any",

    length: (prefix) => (/^(34|37)/.test(prefix) ? 15 : 16),

    randomPrefix: () => {
      const ranges = ["4", "51", "52", "53", "54", "55", "2221", "2720", "34", "37", "2200", "2201", "2202", "2203", "2204", "62", "6011", "65", "3528"];
      return ranges[Math.floor(Math.random() * ranges.length)];
    },
    glow: "rgba(255, 255, 255, 0.10)",
    tint: "rgba(255, 255, 255, 0.04)",
  },
};

function luhnChecksum(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10;
}

function isValidLuhn(number) {
  if (!/^\d{12,19}$/.test(number)) return false;
  return luhnChecksum(number) === 0;
}

function computeCheckDigit(body) {
  let sum = 0;
  let double = true;
  for (let i = body.length - 1; i >= 0; i--) {
    let d = body.charCodeAt(i) - 48;
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return String((10 - (sum % 10)) % 10);
}

function randomDigits(count) {
  let out = "";
  for (let i = 0; i < count; i++) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}

function generateNumber(brand, bin) {
  let prefix = bin ? bin : brand.randomPrefix();
  const length = typeof brand.length === "function" ? brand.length(prefix) : brand.length;

  if (prefix.length >= length) {
    return prefix;
  }

  let number = "";
  for (let attempt = 0; attempt < 100; attempt++) {

    const body = prefix + randomDigits(length - 1 - prefix.length);
    number = body + computeCheckDigit(body);
    if (number.length === length && isValidLuhn(number)) {
      return number;
    }
  }
  return number;
}

function detectBrand(number) {
  if (/^4/.test(number)) return "visa";
  if (/^(51|52|53|54|55)/.test(number)) return "mastercard";
  if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(number)) return "mastercard";
  if (/^(34|37)/.test(number)) return "amex";
  if (/^220[0-4]/.test(number)) return "mir";
  if (/^62/.test(number)) return "unionpay";
  if (/^(6011|64[4-9]|65)/.test(number)) return "discover";
  if (/^35/.test(number)) return "jcb";
  return null;
}

const BRAND_LABELS = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  mir: "Mir",
  unionpay: "UnionPay",
  discover: "Discover",
  jcb: "JCB",
};

function formatNumber(number) {
  if (number.length === 15) {

    return `${number.slice(0, 4)} ${number.slice(4, 10)} ${number.slice(10)}`;
  }
  return number.replace(/(.{4})/g, "$1 ").trim();
}

function randomExpiry() {
  const now = new Date();
  const year = now.getFullYear();
  const plusYears = 2 + Math.floor(Math.random() * 4);
  const month = 1 + Math.floor(Math.random() * 12);
  const mm = String(month).padStart(2, "0");
  const yy = String((year + plusYears) % 100).padStart(2, "0");
  return `${mm}/${yy}`;
}

function randomCvv(brandKey) {
  const len = brandKey === "amex" ? 4 : 3;
  return randomDigits(len);
}

const state = {
  brand: "any",
  qty: 3,
  lastCards: [],
};

const $ = (id) => document.getElementById(id);

const els = {
  brandSeg: $("brandSeg"),
  binInput: $("binInput"),
  binNote: $("binNote"),
  qtyMinus: $("qtyMinus"),
  qtyPlus: $("qtyPlus"),
  qtyInput: $("qtyInput"),
  qtyNote: $("qtyNote"),
  generateBtn: $("generateBtn"),
  card: $("card"),
  cardBrand: $("cardBrand"),
  cardNumber: $("cardNumber"),
  cardExpiry: $("cardExpiry"),
  cardCvv: $("cardCvv"),
  resultsList: $("resultsList"),
  resultsEmpty: $("resultsEmpty"),
  resultsCount: $("resultsCount"),
  copyAllBtn: $("copyAllBtn"),
  exportBtn: $("exportBtn"),
  previewNote: $("previewNote"),
  toasts: $("toasts"),
  langSwitch: $("langSwitch"),
};

const I18N = {
  en: {
    title: "luhn — card number generator",
    metaDesc: "Generate Luhn-valid bank card numbers. Visa, Mastercard, Amex, Mir.",
    controlsLabel: "Generation settings",
    network: "Payment network",
    networkSelect: "Payment network selection",
    any: "Any",
    binPrefix: "BIN prefix",
    optional: "optional",
    quantity: "Quantity",
    decrease: "Decrease",
    increase: "Increase",
    generate: "Generate",
    previewLabel: "Card preview",
    cardholder: "Cardholder",
    expiry: "Expiry",
    cvv: "CVV",
    previewNote: "Click the card to copy number, expiry and CVV",
    resultsLabel: "Results",
    results: "Results",
    copyAll: "Copy all numbers",
    exportTxt: "Export TXT",
    exportTxtAria: "Export numbers to a TXT file",
    empty: "Numbers will appear here after generation",
    github: "GitHub",
    disclaimer: "Numbers, expiry dates and CVVs are generated randomly and are not real payment data.",
    language: "Language",
    binDigits: "Digits only, up to 19",
    binMismatch: "This prefix belongs to {brand} — numbers will still be generated with it",
    binUnknown: "This prefix doesn't match a known network, but will work for generation",
    qtyRange: "Enter a number from 1 to {max}",
    generateFirst: "Generate first",
    copiedCheck: "Copied ✓",
    copied: "Copied",
    copyFail: "Couldn't copy",
    copiedN: "Copied {n} numbers",
    exportedN: "Exported {n} numbers",
    exportedCheck: "Exported ✓",
    exportFail: "Couldn't export",
    numbers: "{n} numbers",
    rendering: "Rendering… {i}/{n}",
    invalid: "Invalid",
    unknown: "Unknown",
    copyNumber: "Copy number",
    copyExpiry: "Copy expiry",
    copyCvv: "Copy CVV",
    copyAllTitle: "Copy number, expiry and CVV",
    copyAria: "Copy",
  },
  ru: {
    title: "luhn — генератор номеров карт",
    metaDesc: "Генерация Luhn-валидных номеров банковских карт. Visa, Mastercard, Amex, Mir.",
    controlsLabel: "Настройки генерации",
    network: "Платёжная система",
    networkSelect: "Выбор платёжной системы",
    any: "Любая",
    binPrefix: "Префикс BIN",
    optional: "необязательно",
    quantity: "Количество",
    decrease: "Уменьшить",
    increase: "Увеличить",
    generate: "Сгенерировать",
    previewLabel: "Превью карты",
    cardholder: "Держатель",
    expiry: "Срок",
    cvv: "CVV",
    previewNote: "Нажмите на карту, чтобы скопировать номер, срок и CVV",
    resultsLabel: "Результаты",
    results: "Результаты",
    copyAll: "Скопировать все номера",
    exportTxt: "Экспорт TXT",
    exportTxtAria: "Экспорт номеров в TXT-файл",
    empty: "Номера появятся здесь после генерации",
    github: "GitHub",
    disclaimer: "Номера, сроки и CVV генерируются случайно и не являются реальными платёжными данными.",
    language: "Язык",
    binDigits: "Только цифры, до 19",
    binMismatch: "Этот префикс принадлежит {brand} — номера всё равно будут сгенерированы с ним",
    binUnknown: "Этот префикс не соответствует известной сети, но подойдёт для генерации",
    qtyRange: "Введите число от 1 до {max}",
    generateFirst: "Сначала сгенерируйте",
    copiedCheck: "Скопировано ✓",
    copied: "Скопировано",
    copyFail: "Не удалось скопировать",
    copiedN: "Скопировано: {n} {word}",
    exportedN: "Экспортировано: {n} {word}",
    exportedCheck: "Экспортировано ✓",
    exportFail: "Не удалось экспортировать",
    numbers: "{n} {word}",
    rendering: "Отрисовка… {i}/{n}",
    invalid: "Недействительна",
    unknown: "Неизвестна",
    copyNumber: "Скопировать номер",
    copyExpiry: "Скопировать срок",
    copyCvv: "Скопировать CVV",
    copyAllTitle: "Скопировать номер, срок и CVV",
    copyAria: "Копировать",
  },
};

let lang = "en";
try {
  lang = localStorage.getItem("luhn-lang") || "en";
} catch (e) {  }

function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

function pluralRu(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function applyLang() {
  document.documentElement.lang = lang;
  document.title = t("title");
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = t("metaDesc");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAttr));
  });

  els.langSwitch.querySelectorAll(".lang-switch__btn").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.lang === lang);
  });
  els.langSwitch.dataset.active = lang;

  delete els.exportBtn.dataset.label;

  if (state.lastCards.length) updateResultsLang();
  validateBin();
  hideQtyNote();

  initBrandSegments();
  syncSegIndicator();
  const previewBrand = state.lastCards.length && state.lastCards[0].brand
    ? state.lastCards[0].brand
    : state.brand;
  setPreviewBrand(previewBrand);
}

els.langSwitch.addEventListener("click", (e) => {
  const btn = e.target.closest(".lang-switch__btn");
  if (!btn || btn.dataset.lang === lang) return;
  lang = btn.dataset.lang;
  try {
    localStorage.setItem("luhn-lang", lang);
  } catch (err) {  }
  playLangSwitch();
  applyLang();
});

let langSwitchTimer = 0;

function playLangSwitch() {
  if (reduceMotion.matches) return;
  const root = document.documentElement;
  root.classList.remove("is-switching-lang");
  void root.offsetWidth;
  root.classList.add("is-switching-lang");
  clearTimeout(langSwitchTimer);
  langSwitchTimer = setTimeout(() => root.classList.remove("is-switching-lang"), 300);
}

els.brandSeg.addEventListener("click", (e) => {
  const btn = e.target.closest(".segmented__item");
  if (!btn) return;

  els.brandSeg.querySelectorAll(".segmented__item").forEach((b) => {
    b.classList.toggle("is-active", b === btn);
    b.setAttribute("aria-selected", b === btn ? "true" : "false");
  });

  state.brand = btn.dataset.brand;
  syncSegIndicator();
  updateCardPreview();
  resetCardPreview();
});

function syncSegIndicator() {
  const active = els.brandSeg.querySelector(".segmented__item.is-active");
  if (!active) return;
  els.brandSeg.style.setProperty("--seg-x", `${active.offsetLeft}px`);
  els.brandSeg.style.setProperty("--seg-w", `${active.offsetWidth}px`);
  els.brandSeg.style.setProperty("--seg-y", `${active.offsetTop}px`);
  els.brandSeg.style.setProperty("--seg-h", `${active.offsetHeight}px`);
}

window.addEventListener("resize", syncSegIndicator);

const finePointer = window.matchMedia("(pointer: fine)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (finePointer.matches && !reduceMotion.matches) {
  els.card.addEventListener("pointermove", (e) => {
    const r = els.card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    els.card.style.setProperty("--tilt-x", `${((0.5 - py) * 8).toFixed(2)}deg`);
    els.card.style.setProperty("--tilt-y", `${((px - 0.5) * 8).toFixed(2)}deg`);
    els.card.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    els.card.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
  });
  els.card.addEventListener("pointerleave", () => {
    els.card.style.setProperty("--tilt-x", "0deg");
    els.card.style.setProperty("--tilt-y", "0deg");
  });
}

function validateBin() {
  const raw = els.binInput.value.trim();
  const note = els.binNote;

  if (raw === "") {
    els.binInput.classList.remove("is-invalid");
    note.hidden = true;
    return null;
  }

  if (!/^\d{1,19}$/.test(raw)) {
    els.binInput.classList.add("is-invalid");
    note.hidden = false;
    note.classList.remove("is-warn");
    note.textContent = t("binDigits");
    return null;
  }

  els.binInput.classList.remove("is-invalid");
  note.hidden = false;
  note.classList.add("is-warn");

  if (state.brand === "any") {
    note.hidden = true;
    return raw;
  }

  const detected = detectBrand(raw);
  if (detected && detected !== state.brand) {
    note.textContent = t("binMismatch", { brand: BRANDS[detected].label });
  } else if (!detected) {
    note.textContent = t("binUnknown");
  } else {
    note.hidden = true;
    return raw;
  }
  return raw;
}

els.binInput.addEventListener("input", () => {
  const clean = els.binInput.value.replace(/\D/g, "").slice(0, 19);
  if (clean !== els.binInput.value) {
    els.binInput.value = clean;
  }
  validateBin();
});
els.binInput.addEventListener("blur", () => {
  if (els.binInput.value.trim() === "") {
    els.binNote.hidden = true;
  }
});

const MAX_QTY = 1000;

function renderQty() {
  els.qtyInput.value = state.qty;
  els.qtyMinus.disabled = state.qty <= 1;
  els.qtyPlus.disabled = state.qty >= MAX_QTY;
}

function parseQty(raw) {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function showQtyNote(msg) {
  els.qtyNote.textContent = msg;
  els.qtyNote.hidden = false;
}

function hideQtyNote() {
  els.qtyNote.hidden = true;
}

function commitQty() {
  const raw = els.qtyInput.value.trim();
  if (raw === "") {
    state.qty = 1;
    renderQty();
    hideQtyNote();
    return true;
  }
  const n = parseQty(raw);
  if (n === null || n < 1 || n > MAX_QTY) {
    showQtyNote(t("qtyRange", { max: MAX_QTY }));
    return false;
  }
  state.qty = n;
  renderQty();
  hideQtyNote();
  return true;
}

els.qtyMinus.addEventListener("click", () => {
  if (state.qty > 1) {
    state.qty--;
    renderQty();
  }
});

els.qtyPlus.addEventListener("click", () => {
  if (state.qty < MAX_QTY) {
    state.qty++;
    renderQty();
  }
});

els.qtyInput.addEventListener("input", () => {
  const clean = els.qtyInput.value.replace(/\D/g, "").slice(0, 4);
  if (clean !== els.qtyInput.value) els.qtyInput.value = clean;

  const n = parseQty(clean);
  if (n === null) return;
  if (n < 1 || n > MAX_QTY) {
    showQtyNote(t("qtyRange", { max: MAX_QTY }));
    return;
  }
  state.qty = n;
  hideQtyNote();
});

els.qtyInput.addEventListener("blur", () => {
  const n = parseQty(els.qtyInput.value);
  if (n === null || n < 1) state.qty = 1;
  else if (n > MAX_QTY) state.qty = MAX_QTY;
  renderQty();
  hideQtyNote();
});

els.qtyInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (commitQty()) generate();
  }
});

function buildBrandMark(brandKey) {
  const wrap = document.createElement("span");
  wrap.className = `brand-mark brand-mark--${brandKey}`;

  const text = document.createElement("span");
  text.className = "brand-mark__text";

  text.textContent = brandKey === "any" ? t("any") : BRANDS[brandKey].mark || BRANDS[brandKey].label;

  wrap.append(text);
  return wrap;
}

function setPreviewBrand(brandKey) {
  const brand = BRANDS[brandKey];
  if (!brand) return;
  els.card.style.setProperty("--brand-glow", brand.glow);
  els.card.style.setProperty("--brand-tint", brand.tint || "transparent");
  els.cardBrand.replaceChildren(buildBrandMark(brandKey));
}

function updateCardPreview() {
  const brand = BRANDS[state.brand];
  els.brandSeg.style.setProperty("--brand-glow", brand.glow);
  els.brandSeg.style.setProperty("--brand-tint", brand.tint || "transparent");
  setPreviewBrand(state.brand);
}

const PLACEHOLDER_NUMBER = "••••\u00A0••••\u00A0••••\u00A0••••";
const PLACEHOLDER_EXPIRY = "09/29";
const PLACEHOLDER_CVV = "•••";

function resetCardPreview() {
  els.cardNumber.textContent = PLACEHOLDER_NUMBER;
  els.cardNumber.classList.add("is-placeholder");
  els.cardExpiry.textContent = PLACEHOLDER_EXPIRY;
  els.cardCvv.textContent = PLACEHOLDER_CVV;
}

function initBrandSegments() {
  els.brandSeg.querySelectorAll(".segmented__item").forEach((btn) => {
    const key = btn.dataset.brand;
    btn.setAttribute("aria-label", BRANDS[key].label);
    btn.replaceChildren(buildBrandMark(key));
  });
}

function setCardNumber(number) {
  const el = els.cardNumber;
  el.classList.remove("is-placeholder");
  el.classList.remove("is-swapping");

  void el.offsetWidth;
  el.textContent = formatNumber(number);
  el.classList.add("is-swapping");
}

function setCardData(card) {
  setCardNumber(card.number);
  els.cardExpiry.textContent = card.expiry;
  els.cardCvv.textContent = card.cvv;
}

const ICON_COPY =
  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">` +
  `<rect x="9" y="9" width="13" height="13" rx="2.5"></rect>` +
  `<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>` +
  `</svg>`;

const ICON_CHECK =
  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">` +
  `<path d="M20 6 9 17l-5-5"></path>` +
  `</svg>`;

function flashCopiedItem(el) {
  el.classList.add("is-copied");
  clearTimeout(el._copyTimer);
  el._copyTimer = setTimeout(() => {
    el.classList.remove("is-copied");
  }, 1500);
}

function flashCopied(li) {
  li.classList.add("is-copied");
  const btn = li.querySelector(".result__copy");
  if (btn) btn.innerHTML = ICON_CHECK;
  clearTimeout(li._copyTimer);
  li._copyTimer = setTimeout(() => {
    li.classList.remove("is-copied");
    if (btn && btn.isConnected) btn.innerHTML = ICON_COPY;
  }, 1500);
}

function flashCopyAll() {
  const btn = els.copyAllBtn;
  btn.classList.add("is-copied");
  if (!btn.dataset.label) btn.dataset.label = btn.textContent;
  btn.textContent = t("copiedCheck");
  clearTimeout(btn._timer);
  btn._timer = setTimeout(() => {
    btn.classList.remove("is-copied");
    btn.textContent = btn.dataset.label;
  }, 1500);
}

function flashNote(text) {
  const note = els.previewNote;
  note.textContent = text;
  note.classList.add("is-copied");
  clearTimeout(note._timer);
  note._timer = setTimeout(() => {
    note.classList.remove("is-copied");
    note.textContent = t("previewNote");
  }, 1500);
}

function updateResultsLang() {
  els.resultsList.querySelectorAll(".result").forEach((li) => {
    const brandEl = li.querySelector(".result__brand");
    if (brandEl && !li.dataset.brand) brandEl.textContent = t("unknown");
    const badge = li.querySelector(".result__badge");
    if (badge) badge.textContent = t("invalid");
    const num = li.querySelector(".result__number");
    if (num) num.title = t("copyNumber");
    li.querySelectorAll(".result__meta-item--copy").forEach((el) => {
      el.title = el.dataset.copy === "expiry" ? t("copyExpiry") : t("copyCvv");
    });
    const copyBtn = li.querySelector(".result__copy");
    if (copyBtn) {
      copyBtn.title = t("copyAllTitle");
      copyBtn.setAttribute("aria-label", t("copyAria"));
    }
  });
  els.resultsCount.textContent = state.lastCards.length
    ? t("numbers", { n: state.lastCards.length, word: pluralRu(state.lastCards.length, "номер", "номера", "номеров") })
    : "";
}

let renderToken = 0;

function renderResults(cards) {
  const token = ++renderToken;
  const list = els.resultsList;
  list.innerHTML = "";
  els.resultsEmpty.classList.add("is-hidden");
  els.copyAllBtn.hidden = cards.length === 0;
  els.exportBtn.hidden = cards.length === 0;
  els.resultsCount.textContent = cards.length ? t("numbers", { n: cards.length, word: pluralRu(cards.length, "номер", "номера", "номеров") }) : "";

  const large = cards.length > 150;
  list.classList.toggle("is-large", large);

  list.classList.toggle("is-scrollable", cards.length > 10);

  const CHUNK = 50;
  let i = 0;

  const buildRow = (card, index) => {
    const li = document.createElement("li");
    li.className = "result";

    li.dataset.brand = card.brand || "";

    if (card.brand && BRANDS[card.brand]) {
      li.style.setProperty("--brand-glow", BRANDS[card.brand].glow);
      li.style.setProperty("--brand-tint", BRANDS[card.brand].tint || "transparent");
    }

    if (!large) li.style.animationDelay = `${Math.min(index, 8) * 0.06}s`;

    const main = document.createElement("div");
    main.className = "result__main";

    const num = document.createElement("span");
    num.className = "result__number";
    num.textContent = formatNumber(card.number);
    num.title = t("copyNumber");
    num.role = "button";
    num.tabIndex = 0;
    num.addEventListener("click", () => {
      copyText(num.textContent.replace(/\s+/g, "")).then((ok) => {
        if (ok) {
          flashCopied(li);
          showToast(t("copied"), "ok");
        } else {
          showToast(t("copyFail"), "error");
        }
      });
    });
    num.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        num.click();
      }
    });

    const makeCopyItem = (text, title, copyKey) => {
      const el = document.createElement("span");
      el.className = "result__meta-item result__meta-item--copy";
      el.textContent = text;
      el.title = title;
      el.dataset.copy = copyKey;
      el.role = "button";
      el.tabIndex = 0;
      el.addEventListener("click", () => {
        copyText(text).then((ok) => {
          if (ok) {
            flashCopiedItem(el);
            showToast(t("copied"), "ok");
          } else {
            showToast(t("copyFail"), "error");
          }
        });
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
      return el;
    };

    const meta = document.createElement("span");
    meta.className = "result__meta";
    const expiryEl = makeCopyItem(card.expiry, t("copyExpiry"), "expiry");
    const sep = document.createElement("span");
    sep.className = "result__meta-sep";
    sep.textContent = "·";
    const cvvEl = makeCopyItem(card.cvv, t("copyCvv"), "cvv");
    meta.append(expiryEl, sep, cvvEl);

    const brand = document.createElement("span");
    brand.className = "result__brand";
    brand.textContent = card.brand ? BRAND_LABELS[card.brand] || t("unknown") : t("unknown");

    if (card.valid === false) {
      const badge = document.createElement("span");
      badge.className = "result__badge";
      badge.textContent = t("invalid");
      main.append(badge);
    }

    main.append(num, brand, meta);
    const actions = document.createElement("div");
    actions.className = "result__actions";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "result__copy";
    copyBtn.title = t("copyAllTitle");
    copyBtn.setAttribute("aria-label", t("copyAria"));
    copyBtn.innerHTML = ICON_COPY;
    copyBtn.addEventListener("click", () => {
      const v = rowValues(li);
      copyText(`${v.number}|${v.expiry}|${v.cvv}`).then((ok) => {
        if (ok) {
          flashCopied(li);
          showToast(t("copied"), "ok");
        } else {
          showToast(t("copyFail"), "error");
        }
      });
    });

    actions.append(copyBtn);
    li.append(main, actions);
    return li;
  };

  const step = () => {
    if (token !== renderToken) return;
    const end = Math.min(i + CHUNK, cards.length);
    const frag = document.createDocumentFragment();
    for (; i < end; i++) {
      frag.appendChild(buildRow(cards[i], i));
    }
    list.appendChild(frag);
    if (i < cards.length) {
      if (cards.length > 200) {
        els.resultsCount.textContent = t("rendering", { i, n: cards.length });
      }
      requestAnimationFrame(step);
    } else {
      els.resultsCount.textContent = cards.length ? t("numbers", { n: cards.length, word: pluralRu(cards.length, "номер", "номера", "номеров") }) : "";
    }
  };

  step();
}

function rowValues(li) {
  const number = li.querySelector(".result__number").textContent.replace(/\s+/g, "");
  const items = li.querySelectorAll(".result__meta-item");
  return { number, expiry: items[0].textContent, cvv: items[1].textContent };
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type === "error" ? "error" : "ok"}`;
  toast.textContent = message;

  els.toasts.appendChild(toast);

  const remove = () => {
    if (!toast.isConnected) return;
    toast.classList.add("is-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });

    setTimeout(() => toast.remove(), 400);
  };

  setTimeout(remove, 2000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (err2) {
      return false;
    }
  }
}

els.copyAllBtn.addEventListener("click", () => {
  if (!state.lastCards.length) return;

  const text = state.lastCards.map((c) => c.number).join("\n");
  copyText(text).then((ok) => {
    if (ok) {
      flashCopyAll();
      showToast(t("copiedN", { n: state.lastCards.length, word: pluralRu(state.lastCards.length, "номер", "номера", "номеров") }), "ok");
    } else {
      showToast(t("copyFail"), "error");
    }
  });
});

function flashExport() {
  const btn = els.exportBtn;
  btn.classList.add("is-copied");
  if (!btn.dataset.label) btn.dataset.label = btn.textContent;
  btn.textContent = t("exportedCheck");
  clearTimeout(btn._timer);
  btn._timer = setTimeout(() => {
    btn.classList.remove("is-copied");
    btn.textContent = btn.dataset.label;
  }, 1500);
}

els.exportBtn.addEventListener("click", () => {
  if (!state.lastCards.length) return;

  const text = state.lastCards.map((c) => `${c.number}|${c.expiry}|${c.cvv}`).join("\n");
  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "luhn-numbers.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flashExport();
    showToast(t("exportedN", { n: state.lastCards.length, word: pluralRu(state.lastCards.length, "номер", "номера", "номеров") }), "ok");
  } catch (err) {
    showToast(t("exportFail"), "error");
  }
});

els.card.addEventListener("click", () => {
  const raw = els.cardNumber.textContent.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(raw)) {
    flashNote(t("generateFirst"));
    return;
  }

  const expiry = els.cardExpiry.textContent;
  const cvv = els.cardCvv.textContent;
  copyText(`${raw}|${expiry}|${cvv}`).then((ok) => {
    if (ok) {
      flashNote(t("copiedCheck"));
      showToast(t("copied"), "ok");
    } else {
      showToast(t("copyFail"), "error");
    }
  });
});

function generate(opts) {
  const { scroll = true, pulse = true } = opts || {};

  if (pulse) {

    els.generateBtn.classList.remove("is-pulsing");
    void els.generateBtn.offsetWidth;
    els.generateBtn.classList.add("is-pulsing");
  }

  const bin = validateBin();
  if (bin === null && els.binInput.value.trim() !== "") {
    return;
  }

  const brand = BRANDS[state.brand];
  const cards = [];

  for (let i = 0; i < state.qty; i++) {
    const number = generateNumber(brand, bin);
    cards.push({
      number,
      expiry: randomExpiry(),
      cvv: randomCvv(state.brand),
      brand: detectBrand(number),
      valid: isValidLuhn(number),
    });
  }

  state.lastCards = cards;
  renderResults(cards);

  setCardData(cards[0]);

  if (cards[0].brand) setPreviewBrand(cards[0].brand);

  els.card.classList.remove("is-refreshing");
  void els.card.offsetWidth;
  els.card.classList.add("is-refreshing");

  if (scroll) {
    els.resultsList.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

els.generateBtn.addEventListener("click", generate);

els.binInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generate();
});

document.addEventListener("keydown", (e) => {

  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (!e.target.closest("button")) {
      e.preventDefault();
      generate();
    }
    return;
  }

  if (e.key === "Escape" && document.activeElement === els.binInput) {
    els.binInput.value = "";
    els.binInput.classList.remove("is-invalid");
    els.binNote.hidden = true;
    els.binInput.blur();
  }
});

  renderQty();
  updateCardPreview();
  initBrandSegments();
  syncSegIndicator();
  applyLang();

  requestAnimationFrame(() => document.documentElement.classList.add("lang-ready"));

  generate({ scroll: false, pulse: false });
