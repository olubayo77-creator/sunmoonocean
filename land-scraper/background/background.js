// Land Listings Scraper - Background Script

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  
  // Open URL in new tab
  if (msg.action === 'OPEN_URL') {
    chrome.tabs.create({ url: msg.url, active: true }, (tab) => {
      sendResponse({ tabId: tab.id, success: true });
    });
    return true;
  }
  
  // Get active tab info
  if (msg.action === 'GET_ACTIVE_TAB_INFO') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          url: tabs[0].url,
          title: tabs[0].title,
          id: tabs[0].id
        });
      } else {
        sendResponse({ url: '', title: '', id: null });
      }
    });
    return true;
  }
  
  // Scrape active tab
  if (msg.action === 'SCRAPE_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (siteId, filters) => {
            // This runs in the content script context
            if (typeof scrapeListings === 'function') {
              return scrapeListings(siteId, filters);
            }
            return { success: false, error: 'Scraper not loaded' };
          },
          args: [msg.siteId, msg.filters]
        });
        
        sendResponse(results[0]?.result || { success: false, error: 'No results' });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }
  
  // Go to next page
  if (msg.action === 'GO_TO_NEXT_PAGE') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ success: false, error: 'No active tab' });
        return;
      }
      
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            // Try to find and click next page button
            const nextSelectors = [
              'a[rel="next"]',
              '.pagination .next a',
              '.pagination-next',
              'a:contains("Next")',
              '.next-page',
              '[aria-label="Next page"]',
              '[data-testid="pagination-next"]'
            ];
            
            for (const selector of nextSelectors) {
              const nextBtn = document.querySelector(selector);
              if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
                return { success: true, clicked: selector };
              }
            }
            
            // Try to find next page number
            const currentPage = document.querySelector('.pagination .active, .pagination .current');
            if (currentPage) {
              const nextPage = currentPage.nextElementSibling;
              if (nextPage && nextPage.tagName === 'A') {
                nextPage.click();
                return { success: true, clicked: 'page-number' };
              }
            }
            
            return { success: false, error: 'No next page found' };
          }
        });
        
        sendResponse(result[0]?.result || { success: false, error: 'Failed to navigate' });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true;
  }
});

// Helper function for content script injection
function injectScraper(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId },
    files: ['content/content.js']
  });
}
