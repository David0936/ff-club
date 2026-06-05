/* ============================================================
   FFC · Notion → 网站 同步脚本
   读取 3 个 Notion 库，生成 assets/notion-data.js
   - 学员集合   → 成员/发起人/关键词（仅公开字段）
   - 公开科普文章 → 全文文章（上网站=✓）
   - 会员研报   → 标题+摘要钩子（上网站=✓）
   运行：NOTION_TOKEN=xxx node scripts/sync-notion.mjs
   ============================================================ */

import { writeFileSync, mkdirSync } from 'node:fs';

const CONN_DIR = 'assets/connections';

const TOKEN = process.env.NOTION_TOKEN;
if (!TOKEN) { console.error('❌ 缺少 NOTION_TOKEN 环境变量'); process.exit(1); }

const NOTION_VERSION = '2022-06-28';

/* ---------- 数据库 ID ---------- */
const DB = {
  members:  '534eb8a6-59d3-4954-8292-34b89553585e', // 👥 学员集合
  articles: 'd7508972-c532-4457-b844-aed8964ac95e', // 📰 公开科普文章
  reports:  'f0b0cdda-abd2-44c5-b812-6ecfa4f41ca6', // 🔒 会员研报
};
const INVITE_PAGE = '37635de2-3c6e-8107-9b5f-cac57788bfc3'; // 📧 待邀请邮箱清单

/* ---------- 仅输出的安全社交字段 ---------- */
const SOCIAL_FIELDS = {
  'Twitter / X': 'twitter',
  '微博': 'weibo',
  '小红书': 'xiaohongshu',
  '抖音': 'douyin',
  '公众号': 'wechat_mp',
  'B 站': 'bilibili',
  'YouTube': 'youtube',
  'LinkedIn': 'linkedin',
};
/* 绝不输出的隐私字段（仅作提醒，代码里压根不读）：
   微信号 · Notion 邮箱 · 顶级人脉可链接 · 备注 · 城市 · 拿到的最大结果 */

/* ---------- Notion API 封装 ---------- */
async function notion(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Notion API ${res.status} @ ${path}: ${t}`);
  }
  return res.json();
}

async function queryAll(dbId, filter) {
  const out = [];
  let cursor;
  do {
    const data = await notion(`databases/${dbId}/query`, {
      ...(filter ? { filter } : {}),
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    });
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return out;
}

/* ---------- 属性读取助手 ---------- */
const txt = (rich) => (rich || []).map(r => r.plain_text).join('');
const P = (page, name) => page.properties[name];
const getTitle = (page, name) => txt(P(page, name)?.title);
const getText  = (page, name) => txt(P(page, name)?.rich_text);
const getSelect = (page, name) => P(page, name)?.select?.name || '';
const getMulti  = (page, name) => (P(page, name)?.multi_select || []).map(o => o.name);
const getUrl    = (page, name) => P(page, name)?.url || '';
const getCheck  = (page, name) => !!P(page, name)?.checkbox;
const getDate   = (page, name) => P(page, name)?.date?.start || '';
const getEmail  = (page, name) => P(page, name)?.email || '';
const getStatus = (page, name) => P(page, name)?.status?.name || '';
const getFileUrl = (page, name) => {
  const f = (P(page, name)?.files || [])[0];
  if (!f) return '';
  return f.type === 'external' ? f.external.url : (f.file?.url || '');
};
const getAllFileUrls = (page, name) =>
  (P(page, name)?.files || [])
    .map(f => (f.type === 'external' ? f.external.url : (f.file?.url || '')))
    .filter(Boolean);

/* ---------- 下载图片到本地（Notion 文件 URL 会过期，须落盘） ---------- */
function extFromUrl(url) {
  const m = url.split('?')[0].match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}
async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

/* ---------- 富文本 → HTML（含粗体/斜体/链接/代码） ---------- */
function richToHtml(rich) {
  return (rich || []).map(r => {
    let s = escapeHtml(r.plain_text);
    const a = r.annotations || {};
    if (a.code) s = `<code>${s}</code>`;
    if (a.bold) s = `<strong>${s}</strong>`;
    if (a.italic) s = `<em>${s}</em>`;
    if (a.strikethrough) s = `<s>${s}</s>`;
    if (r.href) s = `<a href="${r.href}" target="_blank" rel="noopener">${s}</a>`;
    return s;
  }).join('');
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Notion 块 → HTML ---------- */
async function blocksToHtml(blockId) {
  let html = '';
  let listBuffer = null; // {tag, items}
  const flushList = () => {
    if (listBuffer) { html += `<${listBuffer.tag}>${listBuffer.items.join('')}</${listBuffer.tag}>`; listBuffer = null; }
  };
  let cursor;
  do {
    const data = await notion(`blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    for (const b of data.results) {
      const t = b.type;
      const rt = b[t]?.rich_text;
      if (t === 'bulleted_list_item' || t === 'numbered_list_item') {
        const tag = t === 'bulleted_list_item' ? 'ul' : 'ol';
        if (!listBuffer || listBuffer.tag !== tag) { flushList(); listBuffer = { tag, items: [] }; }
        listBuffer.items.push(`<li>${richToHtml(rt)}</li>`);
        continue;
      }
      flushList();
      switch (t) {
        case 'paragraph':
          html += rt?.length ? `<p>${richToHtml(rt)}</p>` : '<br/>'; break;
        case 'heading_1': html += `<h2>${richToHtml(rt)}</h2>`; break;
        case 'heading_2': html += `<h3>${richToHtml(rt)}</h3>`; break;
        case 'heading_3': html += `<h4>${richToHtml(rt)}</h4>`; break;
        case 'quote':     html += `<blockquote>${richToHtml(rt)}</blockquote>`; break;
        case 'callout':   html += `<div class="art-callout">${b.callout.icon?.emoji || '💡'} ${richToHtml(rt)}</div>`; break;
        case 'code':      html += `<pre><code>${escapeHtml(txt(rt))}</code></pre>`; break;
        case 'divider':   html += '<hr/>'; break;
        case 'image': {
          const url = b.image.type === 'external' ? b.image.external.url : b.image.file?.url;
          const cap = richToHtml(b.image.caption);
          html += `<figure><img src="${url}" alt="${escapeHtml(txt(b.image.caption))}"/>${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`;
          break;
        }
        case 'table': html += await tableToHtml(b.id); break;
        default: if (rt) html += `<p>${richToHtml(rt)}</p>`;
      }
    }
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  flushList();
  return html;
}

async function tableToHtml(tableId) {
  const data = await notion(`blocks/${tableId}/children?page_size=100`);
  let rows = '';
  data.results.forEach((row, i) => {
    if (row.type !== 'table_row') return;
    const cells = row.table_row.cells.map(c => richToHtml(c)).join(i === 0 ? '</th><th>' : '</td><td>');
    rows += i === 0 ? `<tr><th>${cells}</th></tr>` : `<tr><td>${cells}</td></tr>`;
  });
  return `<table class="art-table">${rows}</table>`;
}

/* ---------- 更新「待邀请邮箱清单」页面里的代码框 ---------- */
async function updateInviteEmails(emailStr) {
  // 找到页面里的第一个 code 块
  const data = await notion(`blocks/${INVITE_PAGE}/children?page_size=100`);
  const codeBlock = data.results.find(b => b.type === 'code');
  const content = emailStr || '（暂无待邀请成员 · 都邀请完啦）';
  if (!codeBlock) { console.warn('⚠️ 邀请页未找到 code 块，跳过'); return; }
  await fetch(`https://api.notion.com/v1/blocks/${codeBlock.id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: { language: 'plain text', rich_text: [{ type: 'text', text: { content } }] },
    }),
  });
}

/* ---------- 主流程 ---------- */
async function main() {
  console.log('🔄 拉取 Notion 数据…');

  /* === 1. 成员（仅公开字段） === */
  const memberPages = await queryAll(DB.members);
  const allMembers = memberPages.map(p => {
    const socials = {};
    for (const [zh, key] of Object.entries(SOCIAL_FIELDS)) {
      const url = getUrl(p, zh);
      if (url) socials[key] = url;
    }
    return {
      id: p.id.replace(/-/g, '').slice(0, 8),
      name: getTitle(p, '姓名'),
      en: getText(p, '英文名'),
      title: getText(p, '一句话介绍'),
      fields: getMulti(p, '关注的领域'),
      level: getSelect(p, '等级'),
      avatar: getFileUrl(p, '头像'),
      socials,
    };
  }).filter(m => m.name && m.level !== '已离开' && m.level !== '申请中');

  const founders = allMembers.filter(m => m.level === '联合发起人');
  const coreMembers = allMembers.filter(m => m.level === '核心成员' || m.level === 'VIP 会员');

  /* 关键词：统计所有成员「关注领域」频次 */
  const freq = {};
  allMembers.forEach(m => m.fields.forEach(f => { freq[f] = (freq[f] || 0) + 1; }));
  const maxFreq = Math.max(1, ...Object.values(freq));
  const keywords = Object.entries(freq)
    .map(([word, n]) => ({ word, w: Math.max(2, Math.round((n / maxFreq) * 10)) }))
    .sort((a, b) => b.w - a.w);

  /* === 1b. 外圈人脉合影（合影上墙=✓，下载图片落盘） === */
  mkdirSync(CONN_DIR, { recursive: true });
  const connections = [];
  for (const p of memberPages) {
    if (!getCheck(p, '合影已审核')) continue;
    const level = getSelect(p, '等级');
    if (level === '已离开' || level === '申请中') continue;
    // 三个合影字段全部合并
    const urls = [
      ...getAllFileUrls(p, '名人合影'),
      ...getAllFileUrls(p, '名人合影2'),
      ...getAllFileUrls(p, '名人合影3'),
    ];
    if (!urls.length) continue;
    const name = getTitle(p, '姓名');
    const id = p.id.replace(/-/g, '').slice(0, 8);
    const photos = [];
    for (let i = 0; i < urls.length; i++) {
      const rel = `${CONN_DIR}/${id}-${i}.${extFromUrl(urls[i])}`;
      try { await downloadImage(urls[i], rel); photos.push(rel); }
      catch (e) { console.warn(`⚠️ ${name} 第${i + 1}张合影下载失败: ${e.message}`); }
    }
    if (photos.length) {
      connections.push({
        id, uploader: name,
        caption: getText(p, '合影说明'),
        featured: photos[0],
        photos,
      });
    }
  }

  /* === 1c. 待邀请邮箱清单（审核完成 + 未邀请 → 逗号串） === */
  const pendingEmails = memberPages
    .filter(p => getStatus(p, '申请状态') === '完成'
              && !getCheck(p, '已邀请入空间')
              && getEmail(p, 'Notion 邮箱'))
    .map(p => getEmail(p, 'Notion 邮箱'));
  const emailStr = [...new Set(pendingEmails)].join(', ');
  try { await updateInviteEmails(emailStr); }
  catch (e) { console.warn('⚠️ 更新待邀请邮箱失败：', e.message); }

  /* === 2. 公开文章（上网站=✓，含全文） === */
  const articlePages = await queryAll(DB.articles, {
    property: '上网站', checkbox: { equals: true },
  });
  const articles = [];
  for (const p of articlePages) {
    articles.push({
      id: p.id.replace(/-/g, '').slice(0, 12),
      title: getTitle(p, '标题'),
      summary: getText(p, '摘要'),
      category: getMulti(p, '分类'),
      author: getText(p, '作者'),
      date: getDate(p, '发布日期'),
      cover: getFileUrl(p, '封面'),
      html: await blocksToHtml(p.id),
    });
  }
  articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  /* === 3. 会员研报（上网站=✓，仅钩子，无正文） === */
  const reportPages = await queryAll(DB.reports, {
    property: '上网站', checkbox: { equals: true },
  });
  const reports = reportPages.map(p => ({
    id: p.id.replace(/-/g, '').slice(0, 12),
    title: getTitle(p, '标题'),
    summary: getText(p, '钩子摘要'),
    category: getMulti(p, '分类'),
    tickers: getText(p, '标的'),
    date: getDate(p, '发布日期'),
    communityUrl: getUrl(p, '社区全文链接') || 'https://ff-club-2026.netlify.app',
  })).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  /* === 写出 === */
  const payload = {
    syncedAt: new Date().toISOString().slice(0, 10),
    founders, members: coreMembers, keywords, articles, reports, connections,
  };
  const js = `/* 自动生成 · 请勿手改 · 由 scripts/sync-notion.mjs 同步自 Notion */\nwindow.FFC_NOTION = ${JSON.stringify(payload, null, 2)};\n`;
  writeFileSync('assets/notion-data.js', js, 'utf8');

  console.log(`✅ 同步完成：发起人 ${founders.length} · 核心 ${coreMembers.length} · 关键词 ${keywords.length} · 文章 ${articles.length} · 研报 ${reports.length} · 合影 ${connections.length} · 待邀请邮箱 ${pendingEmails.length}`);
}

main().catch(e => { console.error('❌ 同步失败：', e.message); process.exit(1); });
