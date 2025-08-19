(() => {
  'use strict';

  // ---------- Utilities ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const STORAGE_KEY = 'dqg_data_v1';

  const state = {
    quotes: [],
    categories: new Set(),
    selectedCategory: 'All',
  };

  let els = {};

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function normalizeCategory(c) {
    return c.replace(/\s+/g, ' ').trim().replace(/^./, ch => ch.toUpperCase());
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quotes: state.quotes }));
  }

  function hydrate() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data.quotes)) state.quotes = data.quotes;
      } catch {}
    }
    if (!state.quotes.length) {
      state.quotes = [
        { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', category: 'Tech' },
        { text: 'Stay hungry, stay foolish.', category: 'Inspiration' },
        { text: 'The best way to predict the future is to invent it.', category: 'Tech' },
        { text: 'Do not let what you cannot do interfere with what you can do.', category: 'Wisdom' },
        { text: 'Debugging is like being the detective in a crime movie where you are also the murderer.', category: 'Humor' },
      ];
    }
    recomputeCategories();
    persist();
  }

  function recomputeCategories() {
    state.categories = new Set(['All', ...state.quotes.map(q => normalizeCategory(q.category))]);
  }

  // ---------- UI Setup ----------
  function cacheEls() {
    els.controls = $('#controls');
    els.quoteDisplay = $('#quoteDisplay');
    els.newQuoteBtn = $('#newQuote');
  }

  function buildControls() {
    els.controls.innerHTML = '';
    const frag = document.createDocumentFragment();

    // Category filter
    const label = document.createElement('label');
    label.textContent = 'Category: ';
    label.setAttribute('for', 'categoryFilter');

    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.name = 'categoryFilter';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.id = 'toggleAddQuote';
    addBtn.textContent = 'Add Quote';

    frag.append(label, select, addBtn);

    // Add quote form (hidden initially)
    const form = createAddQuoteForm();
    form.hidden = true;

    els.controls.append(frag, form);

    els.categoryFilter = select;
    els.addQuoteForm = form;
    els.toggleAddBtn = addBtn;

    renderCategoryOptions();
  }

  function renderCategoryOptions() {
    const select = els.categoryFilter;
    select.innerHTML = '';
    const frag = document.createDocumentFragment();
    Array.from(state.categories)
      .sort((a, b) => a.localeCompare(b))
      .forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        if (cat === state.selectedCategory) opt.selected = true;
        frag.append(opt);
      });
    select.append(frag);
  }

  function createAddQuoteForm() {
    const form = document.createElement('form');
    form.id = 'addQuoteForm';
    form.autocomplete = 'off';
    form.className = 'card';

    const quoteGroup = document.createElement('div');
    quoteGroup.className = 'field';
    const qLabel = document.createElement('label');
    qLabel.setAttribute('for', 'newQuoteText');
    qLabel.textContent = 'Quote';
    const qInput = document.createElement('textarea');
    qInput.id = 'newQuoteText';
    qInput.name = 'text';
    qInput.placeholder = 'Enter a new quote';
    qInput.required = true;
    qInput.rows = 3;
    qInput.maxLength = 280;
    quoteGroup.append(qLabel, qInput);

    const catGroup = document.createElement('div');
    catGroup.className = 'field';
    const cLabel = document.createElement('label');
    cLabel.setAttribute('for', 'newQuoteCategory');
    cLabel.textContent = 'Category';
    const cInput = document.createElement('input');
    cInput.id = 'newQuoteCategory';
    cInput.name = 'category';
    cInput.type = 'text';
    cInput.placeholder = 'e.g., Inspiration, Tech';
    cInput.required = true;
    cInput.maxLength = 40;
    catGroup.append(cLabel, cInput);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const add = document.createElement('button');
    add.type = 'submit';
    add.textContent = 'Add Quote';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.setAttribute('data-cancel', '1');
    cancel.textContent = 'Cancel';
    actions.append(add, cancel);

    form.append(quoteGroup, catGroup, actions);
    return form;
  }

  // ---------- Actions ----------
  function addQuoteFromForm(form) {
    const text = form.text.value.trim();
    const categoryRaw = form.category.value.trim();
    if (!text || !categoryRaw) return;

    const category = normalizeCategory(categoryRaw);

    // prevent duplicates: same text + category
    const exists = state.quotes.some(
      q => q.text.toLowerCase() === text.toLowerCase() && normalizeCategory(q.category) === category
    );
    if (exists) return toast('That quote already exists in this category.');

    state.quotes.push({ text, category });
    state.categories.add(category);
    persist();

    // update UI
    state.selectedCategory = category;
    renderCategoryOptions();
    els.categoryFilter.value = category;

    form.reset();
    form.hidden = true;
    toast('Quote added!');
    showRandomQuote();
  }

  function showRandomQuote() {
    const list = state.selectedCategory === 'All'
      ? state.quotes
      : state.quotes.filter(q => normalizeCategory(q.category) === state.selectedCategory);

    if (!list.length) {
      els.quoteDisplay.textContent = `No quotes in "${state.selectedCategory}" yet. Add one!`;
      return;
    }
    const idx = Math.floor(Math.random() * list.length);
    const { text, category } = list[idx];

    // re-trigger fade
    els.quoteDisplay.classList.remove('fade');
    void els.quoteDisplay.offsetWidth; // force reflow
    els.quoteDisplay.classList.add('fade');

    els.quoteDisplay.innerHTML = `
      <blockquote>
        <p>${escapeHtml(text)}</p>
        <footer>Category: <span class="badge">${escapeHtml(category)}</span></footer>
      </blockquote>
    `;
  }

  function toast(msg) {
    let live = $('#liveRegion');
    if (!live) {
      live = document.createElement('div');
      live.id = 'liveRegion';
      live.setAttribute('aria-live', 'polite');
      live.className = 'sr-only';
      document.body.append(live);
    }
    live.textContent = msg;
  }

  // ---------- Events ----------
  function bindEvents() {
    els.newQuoteBtn.addEventListener('click', showRandomQuote);

    // delegation on the controls container
    els.controls.addEventListener('change', (e) => {
      if (e.target.id === 'categoryFilter') {
        state.selectedCategory = e.target.value;
        showRandomQuote();
      }
    });

    els.controls.addEventListener('click', (e) => {
      if (e.target.id === 'toggleAddQuote') {
        els.addQuoteForm.hidden = !els.addQuoteForm.hidden;
        if (!els.addQuoteForm.hidden) $('#newQuoteText', els.addQuoteForm).focus();
      }
      if (e.target.matches('#addQuoteForm [data-cancel]')) {
        const form = e.target.closest('form');
        form.reset();
        form.hidden = true;
      }
    });

    els.controls.addEventListener('submit', (e) => {
      if (e.target.id === 'addQuoteForm') {
        e.preventDefault();
        addQuoteFromForm(e.target);
      }
    });
  }

  // ---------- Init ----------
  function init() {
    hydrate();
    cacheEls();
    buildControls();
    bindEvents();
    showRandomQuote();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
