// ─── Content Script ──────────────────────────────────────────────────────────
// Runs on ecf.*.uscourts.gov pages
// Helps background.js detect login state and submit forms

(function() {
  'use strict';

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action === 'CHECK_LOGIN') {
      sendResponse({ loggedIn: isLoggedIn() });
      return true;
    }

    if (msg.action === 'SUBMIT_DISCHARGE_FORM') {
      submitDischargeForm(msg.dateFrom, msg.dateTo)
        .then(result => sendResponse({ success: true, result }))
        .catch(err  => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (msg.action === 'SCRAPE_RESULTS') {
      const records = scrapeCurrentPage(msg.courtId, msg.district, msg.stateCode);
      sendResponse({ records });
      return true;
    }
  });

  // ─── Detect Login State ──────────────────────────────────────────────────
  function isLoggedIn() {
    const url  = window.location.href;
    const body = document.body?.innerText?.toLowerCase() || '';

    if (url.includes('login.pl')) return false;
    if (document.querySelector('form[action*="login.pl"]')) return false;
    if (document.querySelector('#loginForm')) return false;

    // Logged-in pages typically have the court menu or "Welcome" header
    if (document.querySelector('.cmecf-menu, #cmecf-main-menu, .main-menu')) return true;
    if (body.includes('welcome,') || body.includes('logged in as')) return true;

    return null; // Unknown
  }

  // ─── Submit Discharge Report Form ───────────────────────────────────────
  async function submitDischargeForm(dateFrom, dateTo) {
    const form = document.querySelector('form');
    if (!form) throw new Error('No form found on page');

    // Set date fields — PACER uses MM/DD/YYYY format
    const fromFormatted = isoToMDY(dateFrom);
    const toFormatted   = isoToMDY(dateTo);

    // Try to find date fields by name patterns
    const dateFields = {
      from: ['date_filed_from', 'date_from', 'filed_from', 'DateFrom', 'start_date'],
      to:   ['date_filed_to',   'date_to',   'filed_to',   'DateTo',   'end_date'],
    };

    let fromSet = false, toSet = false;

    for (const el of form.elements) {
      if (!fromSet && dateFields.from.includes(el.name)) {
        el.value = fromFormatted;
        fromSet = true;
      }
      if (!toSet && dateFields.to.includes(el.name)) {
        el.value = toFormatted;
        toSet = true;
      }
    }

    // Set chapter filter to 13 if a chapter field exists
    for (const el of form.elements) {
      if (el.name && el.name.toLowerCase().includes('chapter')) {
        if (el.tagName === 'SELECT') {
          const opt = Array.from(el.options).find(o => o.value === '13' || o.text === '13');
          if (opt) el.value = opt.value;
        } else {
          el.value = '13';
        }
      }
    }

    // Submit
    const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
    } else {
      form.submit();
    }

    return { submitted: true, from: fromFormatted, to: toFormatted };
  }

  // ─── Scrape Results from Current Page ───────────────────────────────────
  function scrapeCurrentPage(courtId, district, stateCode) {
    const records = [];
    const tables  = Array.from(document.querySelectorAll('table'));

    for (const table of tables) {
      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length < 2) continue;

      const headerText = (rows[0]?.innerText || '').toLowerCase();
      if (!headerText.match(/case|debtor|name|discharge/)) continue;

      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll('td, th'));
        if (cells.length < 2) continue;

        const texts = cells.map(c => c.innerText.trim());
        const record = buildRecordFromCells(texts, courtId, district, stateCode);
        if (record) records.push(record);
      }
    }

    return records;
  }

  function buildRecordFromCells(cellTexts, courtId, district, stateCode) {
    let name = '', address = '', dischargeDate = '', caseNumber = '';

    for (const text of cellTexts) {
      if (!caseNumber && /\d{2}-\d{4,}/.test(text)) {
        caseNumber = text.match(/[\d]{2}-[\d][\w-]*/)?.[0] || '';
      }
      if (!dischargeDate) {
        const dm = text.match(/\b(\d{1,2}\/\d{1,2}\/\d{4})\b/);
        if (dm) dischargeDate = dm[1];
      }
      if (!name && /^[A-Z]{2,},/.test(text)) {
        name = toTitleCase(text);
      }
      if (!address && /^\d+\s[A-Za-z]/.test(text)) {
        address = text;
      }
    }

    if (!name && !caseNumber) return null;

    const addr = parseAddress(address);
    return {
      name, caseNumber, dischargeDate, district,
      address: addr.street || address,
      city:    addr.city   || '',
      state:   addr.state  || stateCode,
      zip:     addr.zip    || '',
      court:   courtId.toUpperCase(),
    };
  }

  function isoToMDY(iso) {
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  }

  function toTitleCase(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase()).toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function parseAddress(addr) {
    if (!addr) return {};
    const m = addr.match(/^(.*?),\s*([^,]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/);
    if (m) return { street: m[1].trim(), city: m[2].trim(), state: m[3], zip: m[4] };
    return { street: addr };
  }
})();
