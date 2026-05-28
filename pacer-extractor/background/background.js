// Background v6 — case detail enrichment + scraping

const COURT_HOSTS = {
  CACB: 'ecf.cacb.uscourts.gov',
  CAEB: 'ecf.caeb.uscourts.gov',
  CANB: 'ecf.canb.uscourts.gov',
  CASB: 'ecf.casb.uscourts.gov',
  ORB:  'ecf.orb.uscourts.gov',
  COB:  'ecf.cob.uscourts.gov',
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'SCRAPE_ACTIVE_TAB') {
    chrome.tabs.query({ active:true, currentWindow:true }, async (tabs) => {
      if (!tabs[0]) { sendResponse({ success:false, error:'No active tab' }); return; }
      try {
        const r = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: scrapeCaseList,
          args: [msg.dateFrom, msg.dateTo, msg.courtId, msg.district, msg.state]
        });
        sendResponse({ success:true, records: r?.[0]?.result||[], url:tabs[0].url, title:tabs[0].title });
      } catch(e) { sendResponse({ success:false, error:e.message, url:tabs[0].url }); }
    });
    return true;
  }

  if (msg.action === 'FILL_FORM_ACTIVE_TAB') {
    chrome.tabs.query({ active:true, currentWindow:true }, async (tabs) => {
      if (!tabs[0]) { sendResponse({ success:false }); return; }
      try {
        const r = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: fillDischargeForm,
          args: [msg.dateFrom, msg.dateTo]
        });
        sendResponse({ success:true, result: r?.[0]?.result });
      } catch(e) { sendResponse({ success:false, error:e.message }); }
    });
    return true;
  }

  if (msg.action === 'GET_ACTIVE_TAB_INFO') {
    chrome.tabs.query({ active:true, currentWindow:true }, (tabs) => {
      sendResponse({ url:tabs[0]?.url||'', title:tabs[0]?.title||'', id:tabs[0]?.id });
    });
    return true;
  }

  if (msg.action === 'OPEN_URL') {
    chrome.tabs.create({ url:msg.url, active:true }, (tab) => sendResponse({ tabId:tab.id }));
    return true;
  }

  // ── Enrich a single case: open docket, grab address + discharge date ────────
  if (msg.action === 'ENRICH_CASE') {
    enrichCase(msg.caseNumber, msg.courtId, msg.existingName).then(sendResponse).catch(e => {
      sendResponse({ success:false, error:e.message });
    });
    return true;
  }
});

// ── Open a case docket and extract address + discharge date ───────────────────
async function enrichCase(caseNumber, courtId, existingName) {
  const host = COURT_HOSTS[courtId?.toUpperCase()] || COURT_HOSTS.CACB;

  // Build the case query URL
  // PACER case number format: YY-bk-NNNNN-XX → query as caseid
  const searchUrl = `https://${host}/cgi-bin/iquery.pl?1-L_1_0-1&caseid=&casenum=${encodeURIComponent(caseNumber)}&caseOffice=&caseType=bk`;

  let tab = null;
  try {
    // Open tab silently
    tab = await openTabSilent(searchUrl);
    await sleep(3000);

    // Get current URL after redirect
    const tabInfo = await chrome.tabs.get(tab.id);
    const currentUrl = tabInfo.url;

    // If we landed on a case selection page, click the right case
    // If we landed directly on the docket, scrape it
    let result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractCaseInfo,
      args: [caseNumber, existingName]
    });

    let info = result?.[0]?.result || {};

    // If we got a case list, navigate to the first matching case
    if (info.type === 'CASE_LIST' && info.firstCaseUrl) {
      await navigateTab(tab.id, info.firstCaseUrl);
      await sleep(3000);
      result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractCaseInfo,
        args: [caseNumber, existingName]
      });
      info = result?.[0]?.result || {};
    }

    // If we need to go to the docket report to get discharge date
    if (info.type === 'CASE_HEADER' && info.docketUrl) {
      await navigateTab(tab.id, info.docketUrl);
      await sleep(3000);
      result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractDocketInfo,
        args: [caseNumber]
      });
      const docketInfo = result?.[0]?.result || {};
      info = { ...info, ...docketInfo };
    }

    return { success:true, ...info };

  } finally {
    if (tab) await chrome.tabs.remove(tab.id).catch(()=>{});
  }
}

// ── Injected: Extract case info from whatever page we're on ──────────────────
function extractCaseInfo(caseNumber, existingName) {
  const url  = window.location.href;
  const body = document.body?.innerText || '';
  const html = document.body?.innerHTML || '';

  // Login page
  if (document.querySelector('input[name="login"], input[name="key"]')) {
    return { type:'LOGIN_REQUIRED' };
  }

  // Case list page (multiple results)
  const tables = Array.from(document.querySelectorAll('table'));
  const caseLinks = Array.from(document.querySelectorAll('a[href*="caseid"], a[href*="DktRpt"]'));

  // Look for address in page — PACER shows debtor address in case header
  // Typical format: name, address on case summary page
  let address='', city='', state='', zip='', dischargeDate='', filedDate='', name=existingName||'';

  // Address pattern: street number + street name
  const addrMatch = body.match(/(\d{1,5}\s+[A-Za-z][A-Za-z\s]{3,30}(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Cir|Pkwy|Hwy)[^\n]{0,30})\n?\s*([A-Za-z\s]{2,20}),?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i);
  if (addrMatch) {
    address = addrMatch[1].trim();
    city    = addrMatch[2].trim();
    state   = addrMatch[3];
    zip     = addrMatch[4];
  }

  // Discharge date — look for "Discharge" near a date
  const dischMatch = body.match(/[Dd]ischarge[^:]*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dischMatch) dischargeDate = dischMatch[1];

  // Filed date
  const filedMatch = body.match(/[Ff]iled:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (filedMatch) filedDate = filedMatch[1];

  // If page has a "View Docket" or "Docket Report" link, grab it
  const docketLink = Array.from(document.querySelectorAll('a')).find(a =>
    (a.textContent||'').toLowerCase().includes('docket') ||
    (a.href||'').includes('DktRpt')
  );

  // If we're on a case list, get the first matching case link
  if (caseLinks.length > 0 && !address && !dischargeDate) {
    const firstMatch = caseLinks.find(a => {
      const txt = a.textContent || '';
      const href = a.href || '';
      return href.includes('DktRpt') || href.includes('caseid') || txt.match(/\d{2}-\d{4,}/);
    });
    if (firstMatch) {
      return { type:'CASE_LIST', firstCaseUrl: firstMatch.href };
    }
  }

  return {
    type:         address || dischargeDate ? 'FULL' : 'CASE_HEADER',
    address, city, state, zip,
    dischargeDate, filedDate, name,
    docketUrl:    docketLink?.href || '',
    pageUrl:      url,
  };
}

// ── Injected: Extract discharge date from docket report ──────────────────────
function extractDocketInfo(caseNumber) {
  const body = document.body?.innerText || '';

  let dischargeDate = '', filedDate = '', address='', city='', state='', zip='';

  // Discharge date from docket entries
  // Look for "Discharge of Debtor" docket entry with a date
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.match(/discharge.*debtor|order.*discharge/i)) {
      const dm = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dm && !dischargeDate) dischargeDate = dm[1];
    }
    if (!filedDate && line.match(/filed|petition/i)) {
      const dm = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dm) filedDate = dm[1];
    }
  }

  // Also look for address in the case header block at top of docket
  const addrMatch = body.match(/(\d{1,5}\s+[A-Za-z][A-Za-z\s,\.]{3,50})\n\s*([A-Za-z\s]{2,25}),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/);
  if (addrMatch) {
    address = addrMatch[1].trim();
    city    = addrMatch[2].trim();
    state   = addrMatch[3];
    zip     = addrMatch[4];
  }

  // Date filed from header
  const caseFiledMatch = body.match(/Date [Ff]iled:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (caseFiledMatch) filedDate = caseFiledMatch[1];

  return { dischargeDate, filedDate, address, city, state, zip };
}

// ── Injected: Scrape case list page ──────────────────────────────────────────
function scrapeCaseList(dateFrom, dateTo, courtId, district, stateCode) {
  const records = [];

  function normDate(d) {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const p = d.split('/');
    if (p.length===3) return `${p[2]}-${p[0].padStart(2,'0')}-${p[1].padStart(2,'0')}`;
    return d;
  }
  function inRange(d) { const n=normDate(d); return !n||(n>=dateFrom&&n<=dateTo); }
  function titleCase(s) {
    return (s||'').toLowerCase().replace(/,\s*/g,', ').replace(/\b\w/g,c=>c.toUpperCase()).trim();
  }
  function parseAddr(a) {
    if (!a) return {};
    const m = a.match(/^(.*?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/);
    if (m) return { street:m[1].trim(), city:m[2].trim(), state:m[3], zip:m[4] };
    const z = a.match(/(\d{5})/);
    return { street:a.replace(/\d{5}.*/,'').trim(), zip:z?.[1]||'' };
  }

  if (document.querySelector('input[name="login"], input[name="key"]')) {
    return [{ error:'LOGIN_REQUIRED' }];
  }

  const tables = Array.from(document.querySelectorAll('table'));
  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length < 2) continue;
    const headerText = (rows[0].innerText||'').toLowerCase();
    if (!headerText.match(/case|debtor|name|discharg|date|filed/)) continue;

    const hdrs = Array.from(rows[0].querySelectorAll('th,td')).map(c=>c.innerText.trim().toLowerCase());
    const ci = {
      case:    hdrs.findIndex(h=>h.includes('case')),
      name:    hdrs.findIndex(h=>h.includes('debtor')||h==='name'||h.includes('title')),
      filed:   hdrs.findIndex(h=>h.includes('filed')),
      closed:  hdrs.findIndex(h=>h.includes('closed')||h.includes('discharg')),
      address: hdrs.findIndex(h=>h.includes('addr')),
      chapter: hdrs.findIndex(h=>h.includes('chap')||h==='ch'),
    };

    for (let i=1; i<rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      if (cells.length < 2) continue;
      const g = idx=>(idx>=0&&idx<cells.length)?cells[idx].innerText.trim():'';
      const all = cells.map(c=>c.innerText.trim());

      let caseNum = ci.case>=0 ? g(ci.case) : (all.find(t=>/\d{2}-\d{4,}/.test(t))||'');
      let name    = ci.name>=0 ? g(ci.name) : (all.find(t=>/^[A-Z][a-z]/.test(t)&&t.length>3&&t.length<60)||'');
      let filed   = ci.filed>=0  ? g(ci.filed)  : '';
      let closed  = ci.closed>=0 ? g(ci.closed) : '';
      let chapter = ci.chapter>=0 ? g(ci.chapter) : '';
      let address = ci.address>=0 ? g(ci.address) : (all.find(t=>/^\d+\s+[A-Za-z]/.test(t)&&t.length<120)||'');

      // Extract dates
      const filedDm  = filed.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      const closedDm = closed.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
      filed  = filedDm  ? filedDm[0]  : '';
      closed = closedDm ? closedDm[0] : '';

      const cm = caseNum.match(/\d{2}-[\d\w-]*/);
      caseNum = cm ? cm[0] : caseNum;

      if (chapter && chapter.trim() !== '13') continue;
      if (caseNum.includes('-ap-')) continue;
      if (!name && !caseNum) continue;

      // Get case link for enrichment
      const caseLink = cells[ci.case>=0?ci.case:0]?.querySelector('a')?.href || '';

      const addr = parseAddr(address);
      records.push({
        name: titleCase(name), caseNumber: caseNum,
        filedDate: filed, dischargeDate: closed,
        address: addr.street||address, city: addr.city||'', state: addr.state||stateCode,
        zip: addr.zip||'', court: (courtId||'').toUpperCase(), district: district||'',
        caseLink,
      });
    }
  }
  return records;
}

// ── Fill discharge form ───────────────────────────────────────────────────────
function fillDischargeForm(dateFrom, dateTo) {
  function isoToMDY(iso) { const [y,m,d]=iso.split('-'); return `${m}/${d}/${y}`; }
  const from = isoToMDY(dateFrom);
  const to   = isoToMDY(dateTo);
  const form = document.querySelector('form');
  if (!form) return { status:'NO_FORM', url:window.location.href };

  const fields = Array.from(form.elements).map(e=>({name:e.name,type:e.type,value:e.value,
    options:e.tagName==='SELECT'?Array.from(e.options).map(o=>({v:o.value,t:o.text.trim()})):undefined}));
  let filled = 0;

  for (const el of form.elements) {
    const n = (el.name||'').toLowerCase();
    if (n.match(/date.*(from|start|begin|filed_from|entered_from)/)||n==='date_from'||n==='datefrom'||n==='date1'||n==='filed_from') {
      el.value=from; filled++; continue;
    }
    if (n.match(/date.*(to$|end$|thru|filed_to|entered_to)/)||n==='date_to'||n==='dateto'||n==='date2'||n==='filed_to') {
      el.value=to; filled++; continue;
    }
    if (n==='chapter'||n==='ch'||n.startsWith('chapter')) {
      if (el.tagName==='SELECT') { const o=Array.from(el.options).find(o=>o.value==='13'||o.text.trim()==='13'); if(o){el.value=o.value;filled++;} }
      else if (el.type==='radio'&&el.value==='13') { el.checked=true; filled++; }
      else if (el.type==='text'||el.type==='hidden') { el.value='13'; filled++; }
      continue;
    }
    if (n==='asset'||n==='assets'||n.includes('asset')) {
      if (el.tagName==='SELECT') { const o=Array.from(el.options).find(o=>o.value.toLowerCase()==='y'||o.text.toLowerCase()==='yes'); if(o){el.value=o.value;filled++;} }
      else if (el.type==='radio'&&(el.value.toLowerCase()==='y'||el.value.toLowerCase()==='yes')) { el.checked=true; filled++; }
      continue;
    }
  }
  return { status:'ready', filled, fields, url:window.location.href };
}

// ── Tab helpers ───────────────────────────────────────────────────────────────
function openTabSilent(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url, active:false }, tab => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      waitForLoad(tab.id).then(()=>resolve(tab));
    });
  });
}
function navigateTab(tabId, url) {
  return new Promise(resolve => {
    chrome.tabs.update(tabId, { url }, ()=>waitForLoad(tabId).then(resolve));
  });
}
function waitForLoad(tabId, timeout=20000) {
  return new Promise(resolve => {
    const fn=(id,info)=>{ if(id===tabId&&info.status==='complete'){chrome.tabs.onUpdated.removeListener(fn);resolve();} };
    chrome.tabs.onUpdated.addListener(fn);
    setTimeout(()=>{chrome.tabs.onUpdated.removeListener(fn);resolve();},timeout);
  });
}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
