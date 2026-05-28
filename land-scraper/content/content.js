 priceEl?.textContent?.trim() || '';
    const location = locationEl?.textContent?.trim() || '';
    const description = titleEl?.textContent?.trim() || '';
    const url = linkEl?.href || window.location.href;
    
    // Try to extract acres from title
    const acres = extractAcres(description);
    
    if (price || location || description) {
      const record = {
        price,
        location,
        state: extractState(location),
        acres,
        description,
        url,
        source: 'Craigslist',
        scrapedAt: new Date().toISOString()
      };
      
      if (passesFilters(record, filters)) {
        records.push(record);
      }
    }
  });
  
  return records;
}

// Helper: Extract acres from text
function extractAcres(text) {
  if (!text) return '';
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:acres?|ac\.?|\sac\b)/i);
  return match ? match[1] : '';
}

// Helper: Extract state from location
function extractState(location) {
  if (!location) return '';
  const stateMatch = location.match(/,\s*([A-Z]{2})\s/);
  return stateMatch ? stateMatch[1] : '';
}

// Helper: Check if record passes filters
function passesFilters(record, filters) {
  if (!filters) return true;
  
  // State filter
  if (filters.state && record.state !== filters.state) {
    return false;
  }
  
  // Min acres filter
  if (filters.minAcres) {
    const acres = parseFloat(record.acres) || 0;
    if (acres < parseFloat(filters.minAcres)) {
      return false;
    }
  }
  
  // Max price filter
  if (filters.maxPrice) {
    const price = parseInt(record.price?.replace(/[^0-9]/g, '')) || Infinity;
    if (price > parseInt(filters.maxPrice)) {
      return false;
    }
  }
  
  return true;
}

// Listen for messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'SCRAPE_PAGE') {
      const result = scrapeListings(msg.siteId, msg.filters);
      sendResponse(result);
    }
    return true;
  });
}
