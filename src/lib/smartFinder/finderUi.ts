import {
  augmentIndexItem,
  buildTaxonomy,
  findMatches,
  getFallbackUrl,
  inferSelection,
  normalizeCode,
  type AugmentedIndexItem,
  type TaxonomyModel,
  type MatchResult,
} from './client';
import { initFinderBackground } from './background';

type FinderMode = 'type' | 'submit';

type FinderDom = {
  industryEl: HTMLSelectElement;
  subcategoryEl: HTMLSelectElement;
  brandEl: HTMLSelectElement;
  modelEl: HTMLSelectElement;
  modelRow: HTMLElement;
  subLabel: HTMLElement;
  brandLabel: HTMLElement;
  inputEl: HTMLInputElement;
  submitEl: HTMLButtonElement;
  statusEl: HTMLElement;
  resultsWrap: HTMLElement;
  resultsList: HTMLUListElement;
  previewWrap: HTMLElement;
  previewCode: HTMLElement;
  previewIndustry: HTMLElement;
  previewTitle: HTMLElement;
  previewSummary: HTMLElement;
  previewCta: HTMLAnchorElement;
  previewFallback: HTMLAnchorElement;
  previewRelatedWrap: HTMLElement;
  previewRelated: HTMLElement;
};

function q<T extends Element>(root: Element, sel: string): T {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el as T;
}

function setStatus(el: HTMLElement, msg: string) {
  el.textContent = msg;
  if (msg) {
    el.classList.remove('opacity-0');
    el.classList.add('opacity-100');
  } else {
    el.classList.add('opacity-0');
    el.classList.remove('opacity-100');
  }
}

function setResultsOpen(wrap: HTMLElement, open: boolean) {
  if (!open) {
    wrap.classList.add('hidden');
    wrap.classList.remove('scale-100', 'opacity-100');
    wrap.classList.add('scale-95', 'opacity-0');
    return;
  }
  wrap.classList.remove('hidden');
  requestAnimationFrame(() => {
    wrap.classList.remove('scale-95', 'opacity-0');
    wrap.classList.add('scale-100', 'opacity-100');
  });
}

function setSelectAutofill(el: HTMLSelectElement, on: boolean) {
  if (on) {
    el.classList.add('ring-2', 'ring-brand-primary/40');
  } else {
    el.classList.remove('ring-2', 'ring-brand-primary/40');
  }
}

function renderResults(dom: FinderDom, matches: MatchResult[]) {
  dom.resultsList.innerHTML = '';
  if (!matches.length) {
    setResultsOpen(dom.resultsWrap, false);
    return;
  }
  setResultsOpen(dom.resultsWrap, true);
  for (let i = 0; i < matches.length; i++) {
    const it = matches[i].item;
    const li = document.createElement('li');
    li.className =
      'px-5 py-4 hover:bg-brand-surface/50 transition-colors cursor-pointer group first:rounded-t-xl last:rounded-b-xl';
    li.dataset.idx = String(i);
    const a = document.createElement('a');
    a.href = it.url;
    a.className = 'block text-sm text-slate-300 group-hover:text-white';
    const ind = it.topIndustryKey === 'irs-tax' ? 'IRS / Tax' : it.topIndustryKey.replaceAll('-', ' ');
    a.innerHTML = `<div class="flex items-center justify-between mb-1"><span class="font-mono text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/20">${it.code}</span><span class="text-xs text-slate-500 uppercase tracking-wider">${ind}</span></div><div class="text-slate-400 group-hover:text-slate-200 font-medium">${it.shortLabel}</div>`;
    li.appendChild(a);
    dom.resultsList.appendChild(li);
  }
}

function setPreview(dom: FinderDom, top: MatchResult | null, related: MatchResult[], fallbackUrl: string) {
  if (!top) {
    dom.previewWrap.classList.add('hidden');
    return;
  }
  dom.previewWrap.classList.remove('hidden');
  dom.previewCode.textContent = top.item.code;
  dom.previewIndustry.textContent = top.item.topIndustryKey === 'irs-tax' ? 'IRS / Tax' : top.item.topIndustryKey.replaceAll('-', ' ');
  dom.previewTitle.textContent = top.item.shortLabel;
  dom.previewSummary.textContent = top.item.shortLabel ? `Meaning: ${top.item.shortLabel}.` : 'Open the full page for details.';
  dom.previewCta.href = top.item.url;
  dom.previewFallback.href = fallbackUrl;
  dom.previewRelated.innerHTML = '';

  const rel = related.slice(0, 5);
  if (!rel.length) {
    dom.previewRelatedWrap.setAttribute('hidden', '');
    return;
  }
  dom.previewRelatedWrap.removeAttribute('hidden');
  for (const r of rel) {
    const a = document.createElement('a');
    a.href = r.item.url;
    a.className =
      'inline-flex items-center gap-2 rounded-full border border-brand-border/60 bg-brand-surface/40 px-3 py-1 text-xs text-slate-200 hover:bg-brand-dark/40 transition-colors';
    a.innerHTML = `<span class="font-mono text-[11px] text-brand-primary">${r.item.code}</span><span class="text-slate-300">${r.item.shortLabel}</span>`;
    dom.previewRelated.appendChild(a);
  }
}

function buildDom(root: Element): FinderDom {
  return {
    industryEl: q(root, '#finder-industry'),
    subcategoryEl: q(root, '#finder-subcategory'),
    brandEl: q(root, '#finder-brand'),
    modelEl: q(root, '#finder-model'),
    modelRow: q(root, '[data-model-row]'),
    subLabel: q(root, '[data-subcategory-label]'),
    brandLabel: q(root, '[data-brand-label]'),
    inputEl: q(root, '#q'),
    submitEl: q(root, '[data-finder-submit]'),
    statusEl: q(root, '#finder-status'),
    resultsWrap: q(root, '#finder-results'),
    resultsList: q(root, '#finder-results ul'),
    previewWrap: q(root, '#finder-preview'),
    previewCode: q(root, '#preview-code'),
    previewIndustry: q(root, '#preview-industry'),
    previewTitle: q(root, '#preview-title'),
    previewSummary: q(root, '#preview-summary'),
    previewCta: q(root, '#preview-cta'),
    previewFallback: q(root, '#preview-fallback'),
    previewRelatedWrap: q(root, '#preview-related-wrap'),
    previewRelated: q(root, '#preview-related'),
  };
}

export function initSmartFinder(rootEl: Element | null) {
  if (!rootEl) return;
  const dom = buildDom(rootEl);

  const bgCanvas = rootEl.querySelector('canvas[data-finder-bg]') as HTMLCanvasElement | null;

  const state = {
    highlightedIndex: -1,
    sel: {
      industryKey: '',
      subcategoryKey: '',
      applianceType: '',
      brand: '',
      seriesOrModel: '',
    },
  };

  let loading: Promise<{ taxonomy: TaxonomyModel; augmented: AugmentedIndexItem[] }> | null = null;
  let augmented: AugmentedIndexItem[] = [];
  let taxonomy: TaxonomyModel | null = null;

  const loadIndex = async () => {
    if (taxonomy && augmented.length) return { taxonomy, augmented };
    if (!loading) {
      loading = fetch('/search-index.json')
        .then((r) => r.json())
        .then((data) => {
          const items = Array.isArray(data?.items) ? data.items : [];
          augmented = items.map(augmentIndexItem);
          taxonomy = buildTaxonomy(augmented);
          return { taxonomy, augmented };
        })
        .catch(() => {
          augmented = [];
          taxonomy = buildTaxonomy([]);
          return { taxonomy, augmented };
        });
    }
    return loading;
  };

  const rebuildIndustryOptions = () => {
    if (!taxonomy) return;
    const val = dom.industryEl.value;
    dom.industryEl.innerHTML = '<option value="">Auto-detect</option>';
    for (const opt of taxonomy.industries) {
      const o = document.createElement('option');
      o.value = opt.key;
      o.textContent = opt.label;
      dom.industryEl.appendChild(o);
    }
    dom.industryEl.value = val;
  };

  const rebuildSubcategoryOptions = () => {
    if (!taxonomy) return;
    const industryKey = state.sel.industryKey;
    const val = dom.subcategoryEl.value;
    dom.subcategoryEl.innerHTML = '<option value="">Auto</option>';

    if (industryKey === 'insurance') {
      for (const opt of taxonomy.insuranceSubcategories) {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        dom.subcategoryEl.appendChild(o);
      }
      dom.subcategoryEl.disabled = false;
      dom.subLabel.textContent = 'Subcategory';
      dom.subcategoryEl.value = val;
      return;
    }

    if (industryKey === 'systems') {
      for (const opt of taxonomy.systemsSubcategories) {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        dom.subcategoryEl.appendChild(o);
      }
      dom.subcategoryEl.disabled = false;
      dom.subLabel.textContent = 'Subcategory';
      dom.subcategoryEl.value = val;
      return;
    }

    if (industryKey === 'appliances') {
      for (const opt of taxonomy.appliances.types) {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        dom.subcategoryEl.appendChild(o);
      }
      dom.subcategoryEl.disabled = false;
      dom.subLabel.textContent = 'Type';
      dom.subcategoryEl.value = val;
      return;
    }

    dom.subcategoryEl.disabled = true;
    dom.subLabel.textContent = 'Subcategory';
    dom.subcategoryEl.value = '';
  };

  const rebuildBrandOptions = () => {
    if (!taxonomy) return;
    const industryKey = state.sel.industryKey;
    const val = dom.brandEl.value;
    dom.brandEl.innerHTML = '<option value="">Optional</option>';

    if (industryKey === 'appliances') {
      const t = state.sel.applianceType;
      dom.brandEl.classList.remove('hidden');
      dom.brandEl.disabled = !t;
      dom.brandLabel.textContent = 'Brand';
      const list = t ? taxonomy.appliances.brandsByType[t] || [] : [];
      for (const opt of list) {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        dom.brandEl.appendChild(o);
      }
      dom.brandEl.value = val;
      return;
    }

    dom.brandEl.classList.add('hidden');
    dom.brandEl.disabled = true;
    dom.brandLabel.textContent = 'Brand / System';
    dom.brandEl.value = '';
  };

  const rebuildModelOptions = () => {
    if (!taxonomy) return;
    const industryKey = state.sel.industryKey;
    const val = dom.modelEl.value;
    dom.modelEl.innerHTML = '<option value="">Optional</option>';

    if (industryKey === 'appliances') {
      dom.modelRow.removeAttribute('hidden');
      const t = state.sel.applianceType;
      const b = state.sel.brand;
      const key = t && b ? `${t}::${b}` : '';
      const list = key ? taxonomy.appliances.modelsByTypeBrand[key] || [] : [];
      dom.modelEl.disabled = !(t && b);
      for (const opt of list) {
        const o = document.createElement('option');
        o.value = opt.key;
        o.textContent = opt.label;
        dom.modelEl.appendChild(o);
      }
      dom.modelEl.value = val;
      return;
    }

    dom.modelRow.setAttribute('hidden', '');
    dom.modelEl.disabled = true;
    dom.modelEl.value = '';
  };

  const syncSelectionFromControls = () => {
    state.sel.industryKey = dom.industryEl.value || '';
    const sub = dom.subcategoryEl.value || '';
    const brand = dom.brandEl.value || '';
    const model = dom.modelEl.value || '';

    if (state.sel.industryKey === 'insurance' || state.sel.industryKey === 'systems') {
      state.sel.subcategoryKey = sub;
      state.sel.applianceType = '';
      state.sel.brand = '';
      state.sel.seriesOrModel = '';
      return;
    }

    if (state.sel.industryKey === 'appliances') {
      state.sel.subcategoryKey = '';
      state.sel.applianceType = sub;
      state.sel.brand = brand;
      state.sel.seriesOrModel = model;
      return;
    }

    state.sel.subcategoryKey = '';
    state.sel.applianceType = '';
    state.sel.brand = '';
    state.sel.seriesOrModel = '';
  };

  const rebuildControls = () => {
    rebuildSubcategoryOptions();
    rebuildBrandOptions();
    rebuildModelOptions();
  };

  const highlightRow = (idx: number) => {
    const rows = Array.from(dom.resultsList.querySelectorAll('li'));
    for (const r of rows) r.classList.remove('bg-brand-surface/50');
    const row = rows[idx];
    if (row) {
      row.classList.add('bg-brand-surface/50');
      state.highlightedIndex = idx;
      row.scrollIntoView({ block: 'nearest' });
    }
  };

  const openHighlighted = () => {
    const rows = Array.from(dom.resultsList.querySelectorAll('li'));
    const row = rows[state.highlightedIndex];
    const a = row?.querySelector('a') as HTMLAnchorElement | null;
    if (a && a.href) {
      window.location.href = a.href;
      return true;
    }
    return false;
  };

  const runSearch = async (mode: FinderMode) => {
    const qRaw = dom.inputEl.value || '';
    const q = normalizeCode(qRaw);
    if (!q) {
      setStatus(dom.statusEl, '');
      renderResults(dom, []);
      setPreview(dom, null, [], '#');
      return;
    }

    setStatus(dom.statusEl, 'Searching…');
    await loadIndex();

    syncSelectionFromControls();
    const inferred = inferSelection(augmented, q, { ...state.sel });
    const nextSel = inferred.next;

    const shouldAutofillIndustry = !state.sel.industryKey && !!nextSel.industryKey;
    const shouldAutofillSub = !state.sel.subcategoryKey && !!nextSel.subcategoryKey;
    const shouldAutofillType = state.sel.industryKey === 'appliances' && !state.sel.applianceType && !!nextSel.applianceType;

    if (shouldAutofillIndustry) {
      dom.industryEl.value = nextSel.industryKey || '';
      state.sel.industryKey = dom.industryEl.value;
    }

    if (!state.sel.subcategoryKey && nextSel.subcategoryKey) state.sel.subcategoryKey = nextSel.subcategoryKey;

    if (state.sel.industryKey === 'appliances') {
      if (!state.sel.applianceType && nextSel.applianceType) state.sel.applianceType = nextSel.applianceType;
      if (!state.sel.brand && nextSel.brand) state.sel.brand = nextSel.brand;
      if (!state.sel.seriesOrModel && nextSel.seriesOrModel) state.sel.seriesOrModel = nextSel.seriesOrModel;
    }

    rebuildControls();

    if (state.sel.industryKey === 'insurance' || state.sel.industryKey === 'systems') {
      dom.subcategoryEl.value = state.sel.subcategoryKey || '';
    }
    if (state.sel.industryKey === 'appliances') {
      dom.subcategoryEl.value = state.sel.applianceType || '';
      dom.brandEl.value = state.sel.brand || '';
      dom.modelEl.value = state.sel.seriesOrModel || '';
    }

    setSelectAutofill(dom.industryEl, shouldAutofillIndustry);
    setSelectAutofill(dom.subcategoryEl, shouldAutofillSub || shouldAutofillType);

    const matches = findMatches(augmented, q, state.sel, 12);
    setStatus(dom.statusEl, matches.length ? `${matches.length} match(es)` : 'No matches');
    renderResults(dom, matches);
    state.highlightedIndex = -1;

    const fallbackUrl = getFallbackUrl(state.sel, q);
    const top = matches[0] || null;
    const related = matches.slice(1, 6);
    const isExact = !!top && top.score >= 900;

    if (mode === 'submit' && isExact && top) {
      window.location.href = top.item.url;
      return;
    }

    if (mode === 'submit' && !matches.length) {
      window.location.href = fallbackUrl;
      return;
    }

    setPreview(dom, top, related, fallbackUrl);
  };

  const onReady = async () => {
    await loadIndex();
    rebuildIndustryOptions();
    rebuildControls();

    if (bgCanvas && !bgCanvas.dataset.started) {
      bgCanvas.dataset.started = '1';
      const bgRoot = (bgCanvas.parentElement as HTMLElement) || (rootEl as HTMLElement);
      initFinderBackground({ root: bgRoot, canvas: bgCanvas, codes: augmented.map((it) => it.code) });
    }

    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery) {
      dom.inputEl.value = initialQuery;
      runSearch('type');
    }
  };

  onReady();

  dom.industryEl.addEventListener('change', () => {
    syncSelectionFromControls();
    rebuildControls();
    runSearch('type');
  });

  dom.subcategoryEl.addEventListener('change', () => {
    syncSelectionFromControls();
    rebuildControls();
    runSearch('type');
  });

  dom.brandEl.addEventListener('change', () => {
    syncSelectionFromControls();
    rebuildControls();
    runSearch('type');
  });

  dom.modelEl.addEventListener('change', () => {
    syncSelectionFromControls();
    rebuildControls();
    runSearch('type');
  });

  dom.inputEl.addEventListener('input', () => {
    window.clearTimeout((dom.inputEl as any).__t);
    (dom.inputEl as any).__t = window.setTimeout(() => runSearch('type'), 110);
  });

  dom.inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      if (dom.resultsWrap.classList.contains('hidden')) return;
      e.preventDefault();
      highlightRow(Math.min(state.highlightedIndex + 1, (dom.resultsList.children.length || 1) - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      if (dom.resultsWrap.classList.contains('hidden')) return;
      e.preventDefault();
      highlightRow(Math.max(state.highlightedIndex - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.highlightedIndex >= 0 && openHighlighted()) return;
      runSearch('submit');
      return;
    }
    if (e.key === 'Escape') {
      setResultsOpen(dom.resultsWrap, false);
      return;
    }
  });

  dom.submitEl.addEventListener('click', (e) => {
    e.preventDefault();
    runSearch('submit');
  });

  document.addEventListener('click', (e) => {
    const t = e.target as Node;
    if (!rootEl.contains(t)) {
      setResultsOpen(dom.resultsWrap, false);
    }
  });
}
