/* ============================================================
   FFC · Data Configuration
   编辑此文件即可更新所有成员信息、价格、链接
   Last sync: 2026-06-02 · Auto-deploy via GitHub → Netlify
   ============================================================ */

/* ---------- 价格配置（后台可通过 ?admin=ffc2026 修改） ---------- */
window.FFC_PRICING = {
  basePrice: 2980,        // 起始价格
  increment: 500,         // 每加 10 人涨价
  memberBlocks: 0,        // 已经触发的涨价次数（0 = 当前 2980；1 = 3480；2 = 3980）
  currency: '¥',
  wechatId: 'YOUR_WECHAT_ID',  // 收款联系微信，先用占位符
  notes: '加入即享一年期会员资格 · 终身校友通讯录'
};

/* ---------- 飞书问卷链接（拿到后替换） ---------- */
window.FFC_FORM_URL = '';   // 例如: 'https://yourdomain.feishu.cn/share/base/form/shrcn...'

/* ---------- 联合发起人 ---------- */
window.FFC_FOUNDERS = [
  {
    id: 'dax',
    name: '王德尔',
    en: 'Dax',
    title: '全网 50 万粉丝 · 自由投资人',
    desc: '深耕投资十年，跨市场资产配置实践者。',
    avatar: '',  // 留空则显示首字母
    socials: {
      twitter:    '',   // https://twitter.com/xxx
      weibo:      '',
      xiaohongshu:'',
      douyin:     '',
      wechat:     '',
      youtube:    ''
    }
  },
  {
    id: 'franco',
    name: 'Franco 哥哥',
    en: 'Franco',
    title: '美国 CPA 财税事务所创始人 · 20W 粉商业博主',
    desc: '跨境财税、身份规划与全球资产配置专家。',
    avatar: '',
    socials: { twitter:'', weibo:'', xiaohongshu:'', douyin:'', wechat:'', youtube:'' }
  },
  {
    id: 'eason',
    name: 'Eason',
    en: 'Eason',
    title: '美股私募基本面分析师 · 管理九位数资产',
    desc: '机构级基本面研究，专注美股核心资产长线布局。',
    avatar: '',
    socials: { twitter:'', weibo:'', xiaohongshu:'', douyin:'', wechat:'', youtube:'' }
  },
  {
    id: 'william',
    name: '王宇',
    en: 'William',
    title: '宇海科技创始人 · Crypto Trader',
    desc: '区块链产业落地与一二级市场量化交易实战派。',
    avatar: '',
    socials: { twitter:'', weibo:'', xiaohongshu:'', douyin:'', wechat:'', youtube:'' }
  }
];

/* ---------- 核心成员（20 位）---------- */
window.FFC_MEMBERS = [
  { id:'enheng',    name:'嗯哼',         en:'EnHeng',      title:'05 后最年轻 A9 · 币圈 KOL' },
  { id:'sky',       name:'Sky G.cph',    en:'Sky',         title:'区块链 AI 创业者 · Cypherium 项目创始人' },
  { id:'rain',      name:'Rain.Rain.Yang', en:'Rain Yang', title:'全网 50W 粉丝美团顶笑博主 · AI 产品经理 · 高奢女装品牌创始人' },
  { id:'diaochan',  name:'貂蝉不馋',     en:'Diaochan',    title:'全网 200W 粉内容博主 · 新媒体 IP 创作者' },
  { id:'zhao',      name:'赵撑伞',       en:'Zhao',        title:'100W 粉丝商业博主 · 创业内容创作者' },
  { id:'naixx',     name:'奶奶小小',     en:'Naixx',       title:'硅谷 AI 创业者 · VC / AI Agent Explorer' },
  { id:'dekai',     name:'张德楷',       en:'Dekai',       title:'猎人量化创始人 · 量化交易研究者' },
  { id:'sanyi',     name:'三亿',         en:'Sanyi',       title:'Capital 前华语负责人 · Canton 中文区核心建设者' },
  { id:'david',     name:'David',        en:'David',       title:'小鱼 AI Agent 创业者 · AI 应用探索者' },
  { id:'hanpeihao', name:'韩沛好',       en:'Han Peihao',  title:'东非女企业家 · 多家品牌创始人' },
  { id:'leong',     name:'LeonG',        en:'LeonG',       title:'男性成长赛道头部 · 自由投资人' },
  { id:'isadora',   name:'尤可欣',       en:'Isadora',     title:'平台 9W 粉丝 Web3 KOL · BNB / OKE 合作伙伴 · Web3 投资人' },
  { id:'jason',     name:'Jason You',    en:'Jason You',   title:'00 后硅谷 AI 创业者 · Skylow Co-founder' },
  { id:'gouge',     name:'狗哥',         en:'Gouge',       title:'海金之路创始人 · 商业 IP 操盘手' },
  { id:'baozong',   name:'鲍总',         en:'Bao',         title:'万宠联盟创始人 · 宠物产业创业者' },
  { id:'fengchen',  name:'冯晨',         en:'Fengchen',    title:'河南工美集团联合创始人 · 产业投资人' },
  { id:'runzong',   name:'润总',         en:'Run',         title:'00 后创业者 · 财富自由实践者' },
  { id:'isaac',     name:'Isaac Zhang',  en:'Isaac',       title:'Founder of Stealth AI-Web3 Startup · AI & Web3 Builder' },
  { id:'lishaoxia', name:'李少侠',       en:'Li Shaoxia',  title:'御众集团创始人 · 投资人' },
  { id:'weige',     name:'伟哥',         en:'Wei',         title:'头部医美 MCN 创始人 · 连续创业者 · 创业投资思考' }
].map(m => ({
  ...m,
  avatar: '',
  socials: { twitter:'', weibo:'', xiaohongshu:'', douyin:'', wechat:'', youtube:'' }
}));

/* ---------- 关键词（weight 1-10，越大字越大）---------- */
window.FFC_KEYWORDS = [
  { word: 'AI',           w: 10 },
  { word: 'Web3',         w: 10 },
  { word: '美股',          w: 9 },
  { word: '创业',          w: 9 },
  { word: '投资',          w: 9 },
  { word: '财富自由',      w: 8 },
  { word: '硅谷',          w: 7 },
  { word: '加密货币',      w: 7 },
  { word: '量化交易',      w: 6 },
  { word: '商业 IP',       w: 6 },
  { word: '内容创作',      w: 6 },
  { word: 'VC',           w: 5 },
  { word: '跨境财税',      w: 5 },
  { word: '海外身份',      w: 5 },
  { word: '一级市场',      w: 4 },
  { word: '二级市场',      w: 4 },
  { word: 'AI Agent',      w: 5 },
  { word: 'Crypto',        w: 6 },
  { word: 'BNB',           w: 3 },
  { word: '私募',          w: 4 },
  { word: '高奢',          w: 3 },
  { word: '医美',          w: 3 },
  { word: '宠物产业',      w: 2 },
  { word: '出海',          w: 6 },
  { word: '资产配置',      w: 5 },
  { word: '基本面分析',    w: 4 },
  { word: '产业投资',      w: 4 },
  { word: '海外游学',      w: 3 },
  { word: '资本对接',      w: 5 },
  { word: '财税规划',      w: 4 }
];

/* ---------- 外圈关系网（拿到合影/截图素材后填充）---------- */
/* 优先填明星、政客、资本高层、企业高管 */
window.FFC_CONNECTIONS = [
  { tier:'capital',    label:'顶级 VC 合伙人',  hint:'待发布', img:'' },
  { tier:'executive',  label:'科技巨头高管',    hint:'待发布', img:'' },
  { tier:'celebrity',  label:'明星艺人',        hint:'待发布', img:'' },
  { tier:'politics',   label:'政商精英',        hint:'待发布', img:'' },
  { tier:'capital',    label:'家办创始人',      hint:'待发布', img:'' },
  { tier:'executive',  label:'上市公司 CEO',    hint:'待发布', img:'' },
  { tier:'celebrity',  label:'头部 KOL',        hint:'待发布', img:'' },
  { tier:'capital',    label:'区块链项目方',    hint:'待发布', img:'' }
];

/* ---------- 5 个子页面入口（单文件 hash 路由）---------- */
window.FFC_QUICKNAV = [
  {
    num: '01',
    title: '价值案例集',
    desc: '社群内真实价值分享与共创案例。',
    href: '#cases',
    cta: '进入查阅'
  },
  {
    num: '02',
    title: '推特动态墙',
    desc: '核心成员推特实时同步，无需翻墙。',
    href: '#twitter',
    cta: '查看动态'
  },
  {
    num: '03',
    title: '深度文章',
    desc: '投资、AI、Web3 — 成员原创长短文。',
    href: '#articles',
    cta: '阅读全文'
  },
  {
    num: '04',
    title: '成员名录',
    desc: '认识所有联合发起人与核心成员。',
    href: '#members',
    cta: '查看名录'
  }
];

/* ---------- 社交平台图标 ---------- */
window.FFC_SOCIAL_META = {
  twitter:     { label: 'X / Twitter',   svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  weibo:       { label: '微博',          svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10.79 19.16c-3.81.38-7.1-1.34-7.34-3.84-.25-2.5 2.65-4.83 6.46-5.21 3.81-.38 7.1 1.34 7.34 3.84.24 2.5-2.66 4.83-6.46 5.21zm5.96-9.78c-.32-.1-.54-.16-.37-.59.36-.93.4-1.73 0-2.3-.74-1.05-2.77-1-5.1-.04 0 0-.73.32-.55-.27.36-1.15.3-2.11-.26-2.67-1.26-1.26-4.61.05-7.49 2.92C1.31 8.58 0 11.06 0 13.21c0 4.13 5.29 6.65 10.46 6.65 6.78 0 11.29-3.94 11.29-7.07 0-1.89-1.59-2.96-3-3.41zM18.85 4.51c-1.27-1.41-3.14-1.95-4.87-1.57h-.01c-.4.09-.66.49-.57.89s.49.65.89.57c1.23-.27 2.56.12 3.46 1.12.9 1 1.18 2.36.8 3.57v.01c-.12.39.09.81.48.93.39.12.81-.09.93-.48v-.01a4.92 4.92 0 0 0-1.11-5.03zm-2.07 1.87c-.62-.69-1.53-.95-2.38-.77h-.01c-.34.07-.56.41-.49.75s.41.56.75.49h.01c.41-.09.86.04 1.17.37s.4.78.27 1.18c-.11.33.07.69.4.8s.69-.07.8-.4l-.01-.01c.27-.83.07-1.74-.51-2.4zM9.06 17.69c-.13.22-.42.32-.65.23-.22-.09-.29-.34-.16-.55.13-.21.41-.31.63-.23.23.07.31.33.18.55zm-1.04 1.34c-.36.57-1.16.83-1.78.56-.61-.26-.79-.93-.43-1.49.36-.55 1.13-.81 1.74-.57.62.23.83.92.47 1.5zm1.61-2.12c-1.13-.29-2.43.27-2.94 1.27-.52 1.01-.05 2.13 1.09 2.5 1.18.37 2.59-.21 3.1-1.29.51-1.06-.07-2.18-1.25-2.48z"/></svg>' },
  xiaohongshu: { label: '小红书',        svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#07111E">RED</text></svg>' },
  douyin:      { label: '抖音',          svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.84a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z"/></svg>' },
  wechat:      { label: '微信',          svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.5 4C4.36 4 1 6.69 1 10c0 1.89 1.08 3.56 2.78 4.66L3 17l2.5-1.31c.95.2 1.95.31 3 .31.17 0 .33 0 .5-.02-.32-.74-.5-1.55-.5-2.41 0-3.31 3.13-6 7-6 .14 0 .27 0 .41.02C15.16 5.67 12.06 4 8.5 4zm-2.75 4.5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5.5 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM16 8c-3.59 0-6.5 2.46-6.5 5.5S12.41 19 16 19c.77 0 1.51-.12 2.2-.32L20.5 20l-.6-1.93C21.18 17.13 22 15.9 22 14.5c0-3.04-2.91-6-6-6zm-2 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>' },
  youtube:     { label: 'YouTube',       svg: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"/></svg>' }
};
