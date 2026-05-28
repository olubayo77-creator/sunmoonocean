const COURTS = [
  { id:'cacb', name:'C.D. Cal.',   host:'ecf.cacb.uscourts.gov', state:'CA', district:'Central CA (LA)'         },
  { id:'caeb', name:'E.D. Cal.',   host:'ecf.caeb.uscourts.gov', state:'CA', district:'Eastern CA (Fresno/Sac)' },
  { id:'canb', name:'N.D. Cal.',   host:'ecf.canb.uscourts.gov', state:'CA', district:'Northern CA (SF/Oakland)'},
  { id:'casb', name:'S.D. Cal.',   host:'ecf.casb.uscourts.gov', state:'CA', district:'Southern CA (San Diego)' },
  { id:'orb',  name:'D. Oregon',   host:'ecf.orb.uscourts.gov',  state:'OR', district:'Oregon (Portland)'       },
  { id:'cob',  name:'D. Colorado', host:'ecf.cob.uscourts.gov',  state:'CO', district:'Colorado (Denver)'       },
];

let results     = [];   // all records (scraped + enriched)
let activeCourt = null;
let enriching   = false;
let stopEnrich  = false;

document.addEventListener('DOMContentLoaded', () => {
  initDates();
  buildCourtGrid();
  loadStored();

  // Tab switching
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('tab-'+t.dataset.tab).classList.add('active');
  }));

  document.getElementById('btnReport').addEventListener('click', openReport);
  document.getElementById('btnFill').addEventListener('click', doFill);
  document.getElementById('btnScrape').addEventListener('click', doScrape);
  document.getElementById('btnEnrich').addEventListener('click', runEnrichment);
  document.getElementById('btnLoadCSV').addEventListener('click', () => document.getElementById('csvFile').click());
  document.getElementById('csvFile').addEventListener('change', loadCSVFile);
  document.getElementById('btnCSV').addEventListener('click', doDownloadCSV);
  document.getElementById('btnClear').addEventListener('click', doClear);
  document.getElementById('batchSize').addEventListener('input', updateBatchCost);

  setInterval(pollTab, 1200);
  updateEnrichStats();
});

function initDates() {
  const to=new Date(), from=new Date();
  from.setDate(from.getDate()-30);
  document.getElementById('dateTo').value   = isoDate(to);
  document.getElementById('dateFrom').value = isoDate(from);
}
function isoDate(d){ return d.toISOString().split('T')[0]; }
function updateBatchCost() {
  const n = parseInt(document.getElementById('batchSize').value)||25;
  document.getElementById('batchCost').textContent = (n*0.10).toFixed(2);
}

// ── Court grid ────────────────────────────────────────────────────────────────
function buildCourtGrid() {
  const grid = document.getElementById('courtGrid');
  COURTS.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'court-btn'; btn.id = 'cbtn_'+c.id;
    btn.innerHTML = `<div class="court-dot" id="cdot_${c.id}"></div><div><div style="font-weight:600">${c.name}</div><div style="color:#7d8590;font-size:10px">${c.state}·${c.id.toUpperCase()}</div></div>`;
    btn.addEventListener('click', ()=>selectCourt(c));
    grid.appendChild(btn);
  });
}

function selectCourt(court) {
  activeCourt = court;
  document.querySelectorAll('.court-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('cbtn_'+court.id).classList.add('active');
  document.getElementById('btnReport').disabled = false;
  document.getElementById('btnScrape').disabled = false;
  sLog(`Selected ${court.name} — click Open Discharge Report Form`, 'info');
}

function openReport() {
  if (!activeCourt) { sLog('Select a court first.','err'); return; }
  chrome.runtime.sendMessage({ action:'OPEN_URL', url:`https://${activeCourt.host}/cgi-bin/rptD.pl` });
  sLog(`Opening discharge report for ${activeCourt.name}...`, 'info');
}

function pollTab() {
  chrome.runtime.sendMessage({ action:'GET_ACTIVE_TAB_INFO' }, resp => {
    if (!resp) return;
    const el = document.getElementById('activeUrl');
    if (resp.url && resp.url !== 'about:blank') {
      el.textContent = resp.url.length>58 ? '…'+resp.url.slice(-55) : resp.url;
      el.classList.remove('empty');
      const m = COURTS.find(c=>resp.url.includes(c.host));
      if (m && m.id !== activeCourt?.id) {
        activeCourt = m;
        document.querySelectorAll('.court-btn').forEach(b=>b.classList.remove('active'));
        document.getElementById('cbtn_'+m.id)?.classList.add('active');
        document.getElementById('btnReport').disabled = false;
        document.getElementById('btnScrape').disabled = false;
      }
    } else { el.textContent='No PACER tab active'; el.classList.add('empty'); }
  });
}

// ── Scrape ────────────────────────────────────────────────────────────────────
function doScrape() {
  const dateFrom=document.getElementById('dateFrom').value;
  const dateTo=document.getElementById('dateTo').value;
  if (!dateFrom||!dateTo) { sLog('Set dates first.','err'); return; }
  sLog('Scraping page...','info');
  chrome.runtime.sendMessage({
    action:'SCRAPE_ACTIVE_TAB', dateFrom, dateTo,
    courtId:activeCourt?.id||'', district:activeCourt?.district||'', state:activeCourt?.state||''
  }, resp => {
    if (!resp?.success) { sLog('Error: '+(resp?.error||'unknown'),'err'); sLog('URL: '+(resp?.url||'?'),'info'); return; }
    const recs = (resp.records||[]).filter(r=>!r.error);
    sLog(`Found ${recs.length} record(s) on page`+' | '+resp.url.slice(-40), recs.length>0?'ok':'warn');
    if (recs.length>0) {
      const existing = new Set(results.map(r=>r.caseNumber));
      const fresh = recs.filter(r=>!existing.has(r.caseNumber));
      results.push(...fresh);
      sLog(`Added ${fresh.length} new cases to collection`,'ok');
      if (activeCourt) document.getElementById('cdot_'+activeCourt.id)?.classList.add('done');
      saveAndRefresh();
      updateEnrichStats();
    } else {
      sLog('No records found — are you on the results page?','warn');
    }
  });
}

function doFill() {
  const dateFrom=document.getElementById('dateFrom').value, dateTo=document.getElementById('dateTo').value;
  if (!dateFrom||!dateTo) { sLog('Set dates.','err'); return; }
  chrome.runtime.sendMessage({ action:'FILL_FORM_ACTIVE_TAB', dateFrom, dateTo }, resp => {
    if (!resp?.success) { sLog('Fill failed: '+(resp?.error||'?'),'err'); return; }
    const r = resp.result||{};
    if (r.status==='NO_FORM') { sLog('No form found — navigate to rptD.pl first','warn'); sLog('URL: '+r.url,'info'); }
    else {
      sLog(`Filled ${r.filled||0} fields — click Submit on PACER`,'ok');
      if (r.fields) sLog('Fields: '+r.fields.map(f=>f.name).filter(Boolean).slice(0,8).join(', '),'info');
    }
  });
}

// ── Enrichment ────────────────────────────────────────────────────────────────
function updateEnrichStats() {
  const pending  = results.filter(r=>!r.enriched && r.caseNumber && r.caseNumber!=='Case No.').length;
  const done     = results.filter(r=>r.enriched).length;
  const skipped  = results.filter(r=>r.enrichSkipped).length;
  document.getElementById('ePending').textContent  = pending;
  document.getElementById('eDone').textContent     = done;
  document.getElementById('eSkipped').textContent  = skipped;
  document.getElementById('btnEnrich').disabled    = pending === 0 || enriching;
  document.getElementById('enrichCount').textContent = pending;
}

async function runEnrichment() {
  if (enriching) { stopEnrich=true; return; }

  const pending = results.filter(r=>!r.enriched&&!r.enrichSkipped&&r.caseNumber&&r.caseNumber!=='Case No.');
  if (!pending.length) { eLog('No pending cases to enrich.','warn'); return; }

  const batchSize = Math.min(parseInt(document.getElementById('batchSize').value)||25, pending.length);
  const batch     = pending.slice(0, batchSize);

  enriching   = true;
  stopEnrich  = false;
  document.getElementById('btnEnrich').textContent = '⏹ Stop';
  eLog(`Starting enrichment of ${batch.length} cases...`, 'info');

  let done=0;
  for (const rec of batch) {
    if (stopEnrich) { eLog('Stopped.','warn'); break; }

    eLog(`Enriching ${rec.caseNumber} (${rec.name||'?'})...`, 'info');

    try {
      const resp = await sendMsg({ action:'ENRICH_CASE', caseNumber:rec.caseNumber, courtId:rec.court, existingName:rec.name });

      if (resp?.success) {
        const idx = results.findIndex(r=>r.caseNumber===rec.caseNumber);
        if (idx>=0) {
          if (resp.address)       results[idx].address       = resp.address;
          if (resp.city)          results[idx].city          = resp.city;
          if (resp.state)         results[idx].state         = resp.state;
          if (resp.zip)           results[idx].zip           = resp.zip;
          if (resp.dischargeDate) results[idx].dischargeDate = resp.dischargeDate;
          if (resp.filedDate)     results[idx].filedDate     = resp.filedDate;
          results[idx].enriched = true;
          if (resp.address || resp.dischargeDate) {
            eLog(`✓ ${rec.name||rec.caseNumber} — ${resp.address||'no addr'} | discharged: ${resp.dischargeDate||'?'}`, 'ok');
          } else {
            eLog(`⚠ ${rec.caseNumber} — logged in but no data found (LOGIN_REQUIRED?)`, 'warn');
            results[idx].enrichSkipped = true;
          }
        }
      } else {
        eLog(`✗ ${rec.caseNumber}: ${resp?.error||'failed'}`, 'err');
        const idx = results.findIndex(r=>r.caseNumber===rec.caseNumber);
        if (idx>=0) results[idx].enrichSkipped = true;
      }
    } catch(e) {
      eLog(`✗ ${rec.caseNumber}: ${e.message}`, 'err');
    }

    done++;
    document.getElementById('enrichProgress').style.width = Math.round((done/batch.length)*100)+'%';
    updateEnrichStats();
    saveAndRefresh();

    // Polite delay
    await sleep(1500);
  }

  enriching = false;
  stopEnrich = false;
  document.getElementById('btnEnrich').textContent = '▶ Run Enrichment Batch';
  updateEnrichStats();
  eLog(`Batch complete. ${done} processed.`, 'ok');
}

// ── Load CSV ──────────────────────────────────────────────────────────────────
function loadCSVFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const lines = ev.target.result.split('\n');
    const headers = lines[0].split(',').map(h=>h.replace(/"/g,'').trim().toLowerCase());
    let loaded=0, dupes=0;
    const existing = new Set(results.map(r=>r.caseNumber));

    for (let i=1;i<lines.length;i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;
      const rec = {};
      headers.forEach((h,idx)=>{ rec[h]=cols[idx]||''; });

      const caseNum = rec['case number']||rec['casenumber']||rec['case_number']||'';
      const name    = rec['name']||'';
      if (!caseNum&&!name) continue;

      if (existing.has(caseNum)) { dupes++; continue; }
      existing.add(caseNum);

      results.push({
        name:         name,
        caseNumber:   caseNum,
        address:      rec['address']||'',
        city:         rec['city']||'',
        state:        rec['state']||'CA',
        zip:          rec['zip']||'',
        dischargeDate:rec['discharge date']||rec['dischargedate']||'',
        filedDate:    rec['filed date']||rec['fileddate']||'',
        court:        rec['court']||'CACB',
        district:     rec['district']||'',
        enriched:     !!(rec['address']&&rec['discharge date']),
      });
      loaded++;
    }

    eLog(`Loaded ${loaded} cases from CSV (${dupes} duplicates skipped).`, 'ok');
    saveAndRefresh();
    updateEnrichStats();
  };
  reader.readAsText(file);
  e.target.value = '';
}

function parseCSVLine(line) {
  const result=[]; let cur='', inQ=false;
  for (let i=0;i<line.length;i++) {
    if (line[i]==='"') { inQ=!inQ; }
    else if (line[i]===','&&!inQ) { result.push(cur.trim()); cur=''; }
    else cur+=line[i];
  }
  result.push(cur.trim());
  return result;
}

// ── Persist + render ──────────────────────────────────────────────────────────
function saveAndRefresh() {
  chrome.storage.local.set({ results, lastRun:new Date().toISOString() });
  refreshResultsTab();
}

function refreshResultsTab() {
  const count = results.length;
  document.getElementById('tabCount').textContent = count;
  document.getElementById('resultCount').textContent = count+' record'+(count!==1?'s':'');
  document.getElementById('resultCount').className = 'cnt'+(count===0?' zero':'');
  document.getElementById('btnCSV').disabled = count===0;

  const list=document.getElementById('resultsList');
  if (!count) { list.innerHTML='<div class="empty">No records yet.</div>'; return; }

  list.innerHTML = results.map(r=>{
    const addr = [r.address,r.city,r.state,r.zip].filter(Boolean).join(', ');
    return `<div class="result-card">
      <div class="rname">${esc(r.name||'(no name)')}</div>
      <div class="raddr">${esc(addr||'— address pending enrichment —')}</div>
      <div class="tags">
        ${r.dischargeDate?`<span class="tag tdate">Discharged: ${esc(r.dischargeDate)}</span>`:''}
        ${r.filedDate?`<span class="tag tdate">Filed: ${esc(r.filedDate)}</span>`:''}
        <span class="tag tcourt">${esc(r.court||'?')}</span>
        ${r.caseNumber?`<span class="tag tcase">${esc(r.caseNumber)}</span>`:''}
        ${r.enriched?'<span class="tag" style="background:#1a3a26;color:#3fb950;border:1px solid #2a5c3a">✓ enriched</span>':''}
      </div>
    </div>`;
  }).join('');
}

function loadStored() {
  chrome.storage.local.get(['results','lastRun'], data=>{
    if (data.results?.length>0) {
      results=data.results;
      sLog(`Loaded ${results.length} record(s) from previous session.`,'info');
      refreshResultsTab();
      updateEnrichStats();
    }
  });
}

function doDownloadCSV() {
  if (!results.length) return;
  const hdrs=['Name','Address','City','State','Zip','Filed Date','Discharge Date','Court','Case Number','District'];
  const rows=results.map(r=>[r.name,r.address,r.city,r.state,r.zip,r.filedDate,r.dischargeDate,r.court,r.caseNumber,r.district].map(csvEsc));
  const csv=[hdrs.join(','),...rows.map(r=>r.join(','))].join('\n');
  chrome.downloads.download({ url:URL.createObjectURL(new Blob([csv],{type:'text/csv'})), filename:`ch13_enriched_${isoDate(new Date())}.csv`, saveAs:true });
}

function doClear() {
  results=[];
  chrome.storage.local.remove(['results','lastRun']);
  COURTS.forEach(c=>document.getElementById('cdot_'+c.id)?.classList.remove('done'));
  document.getElementById('scrapeLog').innerHTML='<div class="ll info"><span class="dot">●</span><span>Cleared.</span></div>';
  document.getElementById('enrichLog').innerHTML='<div class="ll info"><span class="dot">●</span><span>Cleared.</span></div>';
  document.getElementById('enrichProgress').style.width='0';
  refreshResultsTab();
  updateEnrichStats();
}

// ── Log helpers ───────────────────────────────────────────────────────────────
function sLog(msg,type='info'){ addLog('scrapeLog',msg,type); }
function eLog(msg,type='info'){ addLog('enrichLog',msg,type); }
function addLog(id,msg,type) {
  const log=document.getElementById(id);
  const d=document.createElement('div');
  d.className='ll '+type;
  d.innerHTML=`<span class="dot">●</span><span>${esc(msg)}</span>`;
  log.appendChild(d);
  while(log.children.length>30)log.removeChild(log.firstChild);
  log.scrollTop=log.scrollHeight;
}

function sendMsg(msg) {
  return new Promise((resolve,reject)=>{
    chrome.runtime.sendMessage(msg, resp=>{
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve(resp);
    });
  });
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function csvEsc(v){const s=String(v||'');return(s.includes(',')||s.includes('"')||s.includes('\n'))?'"'+s.replace(/"/g,'""')+'"':s;}
