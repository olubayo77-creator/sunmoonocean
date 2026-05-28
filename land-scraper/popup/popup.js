
    url: `land-listings-${new Date().toISOString().split('T')[0]}.csv`,
    saveAs: true
  });
  
  showStatus(`Downloaded ${results.length} listings`, 'success');
}

function clearResults() {
  results = [];
  scrapeStats = { total: 0, sites: new Set(), totalPrice: 0 };
  updateResultsList();
  document.getElementById('statTotal').textContent = '0';
  document.getElementById('statSites').textContent = '0';
  document.getElementById('statAvgPrice').textContent = '$0';
  document.getElementById('resultCount').textContent = 'No results yet';
  chrome.storage.local.remove('landScraperResults');
  showStatus('Results cleared', 'info');
}

function loadStored() {
  chrome.storage.local.get('landScraperResults', data => {
    if (data.landScraperResults) {
      results = data.landScraperResults;
      results.forEach(r => {
        scrapeStats.sites.add(r.source);
        const price = parsePrice(r.price);
        if (price > 0) scrapeStats.totalPrice += price;
      });
      scrapeStats.total = results.length;
      updateStats([]);
      updateResultsList();
    }
  });
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = `status ${type}`;
  el.style.display = 'block';
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
  return isNaN(num) ? 0 : num;
}

function formatPrice(num) {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'k';
  return '$' + num.toString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-save results
setInterval(() => {
  if (results.length > 0) {
    chrome.storage.local.set({ landScraperResults: results });
  }
}, 5000);
