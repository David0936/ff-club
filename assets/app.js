/* ============================================================
   FFC · App Logic
   ============================================================ */

/* ---------- Utility ---------- */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const initials = (name, en) => {
  if (en) {
    const parts = en.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  }
  return name.charAt(0);
};

/* ---------- Merge Notion-synced data (overrides data.js when present) ---------- */
function applyNotionData() {
  const N = window.FFC_NOTION;
  if (!N) return;
  // 成员/发起人：Notion 有数据时优先用 Notion（保证隐私字段已在脚本侧过滤）
  if (Array.isArray(N.founders) && N.founders.length) {
    window.FFC_FOUNDERS = N.founders.map(normalizeNotionMember);
  }
  if (Array.isArray(N.members) && N.members.length) {
    window.FFC_MEMBERS = N.members.map(normalizeNotionMember);
  }
  if (Array.isArray(N.keywords) && N.keywords.length) {
    window.FFC_KEYWORDS = N.keywords;
  }
}
function normalizeNotionMember(m) {
  return {
    id: m.id,
    name: m.name,
    en: m.en || '',
    title: m.title || (m.fields || []).join(' · '),
    avatar: m.avatar || '',
    socials: m.socials || {},
  };
}

/* ---------- Render: Public Articles (from Notion) ---------- */
function renderArticles() {
  const grid = $('#articles-grid');
  const empty = $('#articles-empty');
  if (!grid) return;
  const articles = (window.FFC_NOTION?.articles) || [];
  if (!articles.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = '';
  articles.forEach(a => {
    const card = document.createElement('div');
    card.className = 'feed-card article-card';
    card.innerHTML = `
      <div class="art-tags">${(a.category || []).map(c => `<span>${c}</span>`).join('')}</div>
      <strong class="art-title">${a.title}</strong>
      <div class="content">${a.summary || ''}</div>
      <div class="meta">${a.author || 'FFC'}　·　${a.date || ''}</div>
      <div class="art-readmore">阅读全文 →</div>
    `;
    card.addEventListener('click', () => openArticle(a));
    grid.appendChild(card);
  });
}

function openArticle(a) {
  const backdrop = $('#article-modal');
  const body = $('#article-body');
  if (!backdrop || !body) return;
  body.innerHTML = `
    <div class="art-tags">${(a.category || []).map(c => `<span>${c}</span>`).join('')}</div>
    <h2 class="art-doc-title">${a.title}</h2>
    <div class="art-doc-meta">${a.author || 'FFC'}　·　${a.date || ''}</div>
    <hr/>
    <div class="art-doc-content">${a.html || '<p>正文加载中…</p>'}</div>
  `;
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ---------- Render: Gated Research Reports (teasers) ---------- */
function renderReports() {
  const grid = $('#reports-grid');
  const empty = $('#reports-empty');
  if (!grid) return;
  const reports = (window.FFC_NOTION?.reports) || [];
  if (!reports.length) { if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  grid.innerHTML = '';
  reports.forEach(r => {
    const card = document.createElement('a');
    card.className = 'report-card';
    card.href = r.communityUrl || '#';
    card.target = '_blank';
    card.rel = 'noopener';
    card.innerHTML = `
      <div class="report-lock">🔒</div>
      <div class="art-tags">${(r.category || []).map(c => `<span>${c}</span>`).join('')}</div>
      <h4 class="report-title">${r.title}</h4>
      <p class="report-summary">${r.summary || ''}</p>
      ${r.tickers ? `<div class="report-tickers">${r.tickers}</div>` : ''}
      <div class="report-cta">会员专享 · 进入社区查看全文 →</div>
    `;
    grid.appendChild(card);
  });
}

function initArticleModal() {
  const backdrop = $('#article-modal');
  const close = $('#article-close');
  if (!backdrop) return;
  const doClose = () => { backdrop.classList.remove('open'); document.body.style.overflow = ''; };
  close?.addEventListener('click', doClose);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) doClose(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') doClose(); });
}

/* ---------- Render: Orbital Network ---------- */
function renderNetwork() {
  const stage = $('#network-stage');
  if (!stage) return;

  const founders = window.FFC_FOUNDERS;
  const members  = window.FFC_MEMBERS;
  const connections = window.FFC_CONNECTIONS;

  // Inner ring — founders. Offset by 45° to put them at NE/SE/SW/NW corners
  const innerRadius = '19%';
  founders.forEach((f, i) => {
    const angle = (i * 360) / founders.length - 45;
    stage.appendChild(makeNode(f, 'founder', angle, innerRadius));
  });

  // Middle ring — core members. Offset by half-step to avoid lining up with founders
  const midRadius = '33%';
  const midStep = 360 / members.length;
  members.forEach((m, i) => {
    const angle = i * midStep - 90 + midStep / 2;
    stage.appendChild(makeNode(m, 'core', angle, midRadius));
  });

  // Outer ring — connections (decorative). Offset for visual rhythm
  const outerRadius = '48%';
  const outerCount = 16;
  const outerStep = 360 / outerCount;
  for (let i = 0; i < outerCount; i++) {
    const angle = i * outerStep - 90 + outerStep / 4;
    const c = connections[i] || { label: '待发布', tier: '?', en: '?' };
    stage.appendChild(makeNode({
      id: 'conn-' + i,
      name: c.label,
      en: c.tier?.charAt(0).toUpperCase() || '?',
      title: c.hint || ''
    }, 'outer', angle, outerRadius));
  }

  // Draw subtle connection lines
  drawConnectionLines(stage, founders.length, members.length);
}

function makeNode(person, kind, angleDeg, radiusPct) {
  const node = document.createElement('div');
  node.className = `node node--${kind}`;
  const angleRad = (angleDeg * Math.PI) / 180;
  const r = parseFloat(radiusPct);
  const x = (50 + r * Math.cos(angleRad)).toFixed(3);
  const y = (50 + r * Math.sin(angleRad)).toFixed(3);
  node.style.left = x + '%';
  node.style.top  = y + '%';

  const avatar = document.createElement('div');
  avatar.className = 'node-avatar';
  if (person.avatar) {
    const img = document.createElement('img');
    img.src = person.avatar;
    img.alt = person.name;
    avatar.appendChild(img);
  } else {
    avatar.textContent = initials(person.name, person.en);
  }
  node.appendChild(avatar);

  const label = document.createElement('div');
  label.className = 'node-label';
  label.textContent = person.name;
  node.appendChild(label);

  node.addEventListener('click', () => {
    if (person.id && kind !== 'outer') {
      const target = document.getElementById('m-' + person.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  return node;
}

function drawConnectionLines(stage, nFounders, nMembers) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'connections');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');

  const cx = 50, cy = 50;
  const rInner = 19, rMid = 33;

  // founders → center (radial) — match new offset (-45° start)
  for (let i = 0; i < nFounders; i++) {
    const a = (i * 360 / nFounders - 45) * Math.PI / 180;
    const x = cx + rInner * Math.cos(a);
    const y = cy + rInner * Math.sin(a);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x);  line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(201,163,91,0.25)');
    line.setAttribute('stroke-width', '0.15');
    svg.appendChild(line);
  }

  // members → nearest founder
  const midStep = 360 / nMembers;
  for (let i = 0; i < nMembers; i++) {
    const a = (i * midStep - 90 + midStep / 2) * Math.PI / 180;
    const x = cx + rMid * Math.cos(a);
    const y = cy + rMid * Math.sin(a);
    const fIdx = Math.round((i * nFounders / nMembers)) % nFounders;
    const fa = (fIdx * 360 / nFounders - 45) * Math.PI / 180;
    const fx = cx + rInner * Math.cos(fa);
    const fy = cy + rInner * Math.sin(fa);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', fx); line.setAttribute('y1', fy);
    line.setAttribute('x2', x);  line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(201,163,91,0.10)');
    line.setAttribute('stroke-width', '0.1');
    svg.appendChild(line);
  }

  stage.appendChild(svg);
}

/* ---------- Render: Founder & Member Cards ---------- */
function renderMemberCard(p, isFounder = false) {
  const card = document.createElement('div');
  card.className = 'member-card' + (isFounder ? ' founder-card' : '');
  card.id = 'm-' + p.id;

  const avatar = document.createElement('div');
  avatar.className = 'member-avatar';
  if (p.avatar) {
    const img = document.createElement('img');
    img.src = p.avatar; img.alt = p.name;
    avatar.appendChild(img);
  } else {
    avatar.textContent = initials(p.name, p.en);
  }

  const name = document.createElement('div');
  name.className = 'member-name';
  name.textContent = p.name;

  const en = document.createElement('div');
  en.className = 'member-name-en';
  en.textContent = p.en || '';

  const title = document.createElement('div');
  title.className = 'member-title';
  title.textContent = p.title;

  const socials = document.createElement('div');
  socials.className = 'member-socials';
  const meta = window.FFC_SOCIAL_META;
  Object.keys(meta).forEach(key => {
    const url = p.socials?.[key];
    let el;
    if (url) {
      el = document.createElement('a');
      el.href = url; el.target = '_blank'; el.rel = 'noopener';
      el.title = meta[key].label;
    } else {
      el = document.createElement('span');
      el.className = 'disabled';
      el.title = meta[key].label + ' · 待补充';
    }
    el.innerHTML = meta[key].svg;
    socials.appendChild(el);
  });

  card.append(avatar, name, en, title, socials);
  return card;
}

function renderFounders() {
  const grid = $('#founders-grid');
  if (!grid) return;
  window.FFC_FOUNDERS.forEach(f => grid.appendChild(renderMemberCard(f, true)));
}
function renderMembers() {
  const grid = $('#members-grid');
  if (!grid) return;
  window.FFC_MEMBERS.forEach(m => grid.appendChild(renderMemberCard(m, false)));
}

/* ---------- Render: Keywords Cloud ---------- */
function renderKeywords() {
  const cloud = $('#keywords-cloud');
  if (!cloud) return;
  const list = [...window.FFC_KEYWORDS].sort(() => Math.random() - 0.5);
  list.forEach(k => {
    const span = document.createElement('span');
    span.className = 'kw';
    span.setAttribute('data-w', k.w);
    span.textContent = k.word;
    cloud.appendChild(span);
  });
}

/* ---------- Render: Connections ---------- */
function renderConnections() {
  const grid = $('#connections-grid');
  if (!grid) return;
  const items = window.FFC_CONNECTIONS.length ? window.FFC_CONNECTIONS : [];
  const total = Math.max(items.length, 8);
  for (let i = 0; i < total; i++) {
    const c = items[i];
    const card = document.createElement('div');
    card.className = 'connection-card' + (c?.img ? '' : ' placeholder');
    if (c?.img) {
      const img = document.createElement('img');
      img.src = c.img; img.alt = c.label;
      img.style.width = '100%'; img.style.height = '120px'; img.style.objectFit = 'cover';
      card.appendChild(img);
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = c.label;
      card.appendChild(label);
    } else {
      const seal = document.createElement('div');
      seal.className = 'seal';
      seal.textContent = c?.tier?.slice(0,3).toUpperCase() || 'TBD';
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = c?.label || '待发布';
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = c?.hint || '合影 / 截图素材整理中';
      card.append(seal, label, hint);
    }
    grid.appendChild(card);
  }
}

/* ---------- Render: Quick Nav ---------- */
function renderQuickNav() {
  const grid = $('#quicknav-grid');
  if (!grid) return;
  window.FFC_QUICKNAV.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'quicknav-card';
    a.innerHTML = `
      <div class="num">${item.num}</div>
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="arrow">${item.cta} →</div>
    `;
    grid.appendChild(a);
  });
}

/* ---------- Pricing (with admin override) ---------- */
const PRICING_KEY = 'ffc_pricing_override';

function loadPricing() {
  const base = { ...window.FFC_PRICING };
  try {
    const saved = JSON.parse(localStorage.getItem(PRICING_KEY) || '{}');
    return { ...base, ...saved };
  } catch { return base; }
}

function currentPrice(p) {
  return p.basePrice + Math.max(0, parseInt(p.memberBlocks, 10) || 0) * p.increment;
}

function renderPricing() {
  const p = loadPricing();
  const price = currentPrice(p);
  const amountEl = $('#price-amount');
  const wechatEl = $('#price-wechat');
  const ruleEl   = $('#price-rule');
  if (amountEl) amountEl.innerHTML = `<span class="currency">${p.currency}</span>${price.toLocaleString()}<span class="unit">/ 年</span>`;
  if (wechatEl) wechatEl.textContent = p.wechatId;
  if (ruleEl) {
    const nextPrice = price + p.increment;
    ruleEl.textContent = `当前会员价：${p.currency}${price.toLocaleString()}　·　每加入 10 位新成员，价格升至 ${p.currency}${nextPrice.toLocaleString()}`;
  }
}

/* ---------- Admin Panel ---------- */
function initAdmin() {
  const params = new URLSearchParams(location.search);
  const key = params.get('admin');
  if (key !== 'ffc2026') return;  // 修改这里改密钥

  const panel = $('#admin-panel');
  if (!panel) return;
  panel.classList.add('open');

  const p = loadPricing();
  $('#admin-base').value      = p.basePrice;
  $('#admin-increment').value = p.increment;
  $('#admin-blocks').value    = p.memberBlocks;
  $('#admin-wechat').value    = p.wechatId;
  $('#admin-form').value      = window.FFC_FORM_URL || '';

  const updatePreview = () => {
    const draft = {
      basePrice:    parseInt($('#admin-base').value, 10) || 0,
      increment:    parseInt($('#admin-increment').value, 10) || 0,
      memberBlocks: parseInt($('#admin-blocks').value, 10) || 0,
      wechatId:     $('#admin-wechat').value.trim(),
      currency:     p.currency
    };
    $('#admin-preview').textContent =
      `当前价格 = ${draft.basePrice} + ${draft.memberBlocks} × ${draft.increment} = ¥${currentPrice(draft).toLocaleString()}`;
  };

  $$('#admin-panel input').forEach(i => i.addEventListener('input', updatePreview));
  updatePreview();

  $('#admin-apply').addEventListener('click', () => {
    const next = {
      basePrice:    parseInt($('#admin-base').value, 10) || 0,
      increment:    parseInt($('#admin-increment').value, 10) || 0,
      memberBlocks: parseInt($('#admin-blocks').value, 10) || 0,
      wechatId:     $('#admin-wechat').value.trim() || p.wechatId,
      currency:     p.currency,
      notes:        p.notes
    };
    localStorage.setItem(PRICING_KEY, JSON.stringify(next));
    window.FFC_FORM_URL = $('#admin-form').value.trim();
    renderPricing();
    alert('已更新（保存在本浏览器）。要让所有访客看到更新，请把对应数值同步到 assets/data.js 顶部的 FFC_PRICING。');
  });

  $('#admin-reset').addEventListener('click', () => {
    localStorage.removeItem(PRICING_KEY);
    renderPricing();
    alert('已恢复 data.js 中的默认价格。');
  });
}

/* ---------- Apply Modal ---------- */
function initApplyModal() {
  const backdrop = $('#apply-modal');
  if (!backdrop) return;
  const open = () => {
    backdrop.classList.add('open');
    const iframe = $('#apply-iframe');
    const fallback = $('#apply-fallback');
    if (window.FFC_FORM_URL) {
      iframe.src = window.FFC_FORM_URL;
      iframe.style.display = 'block';
      fallback.style.display = 'none';
    } else {
      iframe.style.display = 'none';
      fallback.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };
  $$('[data-apply]').forEach(b => b.addEventListener('click', open));
  $('#apply-close').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ---------- FAQ Accordion ---------- */
function initFaq() {
  $$('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      $$('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

/* ---------- Mobile Nav Drawer ---------- */
function initMobileNav() {
  const burger = $('.nav-burger');
  const links = $('.nav-links');
  if (!burger || !links) return;
  let backdrop = null;
  const close = () => {
    links.classList.remove('mobile-open');
    if (backdrop) { backdrop.remove(); backdrop = null; }
    document.body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    if (links.classList.contains('mobile-open')) { close(); return; }
    links.classList.add('mobile-open');
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.addEventListener('click', close);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
  });
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') close();
  });
}

/* ---------- Hash Router (SPA across views) ---------- */
const ROUTES = ['home', 'cases', 'twitter', 'articles'];
const SECTION_ALIASES = {
  // hash → home view + scroll target
  'members':   'members',
  'founders':  'founders',
  'network':   'network',
  'manifesto': 'manifesto',
  'value':     'value',
  'pricing':   'pricing',
  'explore':   'explore',
  'connections': 'connections',
  'faq':       'faq'
};

function parseHash() {
  const raw = (location.hash || '#home').slice(1).toLowerCase().trim();
  return raw || 'home';
}

function showView(viewName, scrollTargetId) {
  const views = $$('.view');
  let matched = false;
  views.forEach(v => {
    const isMatch = v.dataset.view === viewName;
    if (isMatch) { v.hidden = false; matched = true; }
    else         { v.hidden = true; }
  });
  if (!matched) {
    // Fallback to home
    const home = $$('.view').find(v => v.dataset.view === 'home');
    if (home) home.hidden = false;
    viewName = 'home';
  }

  // Update active nav state
  $$('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace('#', '').toLowerCase();
    a.classList.toggle('active', href === viewName);
  });

  // Restart view fade
  const activeView = $$('.view').find(v => !v.hidden);
  if (activeView) {
    activeView.style.animation = 'none';
    void activeView.offsetWidth; // force reflow
    activeView.style.animation = '';
  }

  // Scroll behavior
  if (scrollTargetId) {
    requestAnimationFrame(() => {
      const target = document.getElementById(scrollTargetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'auto' });
    });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  document.title = viewName === 'home'
    ? '财富自由俱乐部 · Financial Freedom Club'
    : `${viewLabel(viewName)} · FFC`;
}

function viewLabel(v) {
  return ({ cases: '价值案例集', twitter: '推特动态墙', articles: '深度文章' })[v] || 'FFC';
}

function handleRoute() {
  const hash = parseHash();
  if (ROUTES.includes(hash)) {
    showView(hash);
  } else if (SECTION_ALIASES[hash]) {
    // Hash matches a section inside home — show home and scroll there
    showView('home', SECTION_ALIASES[hash]);
  } else {
    showView('home');
  }
}

function initRouter() {
  // Intercept all in-page hash links so we get smooth transitions
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    if (location.hash === href) handleRoute();
    else history.pushState(null, '', href);
    handleRoute();
  });
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);
  handleRoute();
}

/* ---------- Scroll Effects ---------- */
function initScrollEffects() {
  const nav = $('#nav');
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  applyNotionData();   // 先用 Notion 同步数据覆盖（若有）
  renderNetwork();
  renderFounders();
  renderMembers();
  renderKeywords();
  renderConnections();
  renderQuickNav();
  renderPricing();
  renderArticles();
  renderReports();
  initAdmin();
  initApplyModal();
  initArticleModal();
  initFaq();
  initMobileNav();
  initScrollEffects();
  initRouter();
});
