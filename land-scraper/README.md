# 🌲 Land Listings Scraper — Chrome Extension

Extract land listings from popular land sale websites and export to CSV.

## Supported Sites

| Site | URL | Notes |
|------|-----|-------|
| **LandWatch** | landwatch.com | Best for raw land |
| **Lands of America** | landsofamerica.com | Large rural selection |
| **Zillow** | zillow.com/land | Good filters |
| **Realtor.com** | realtor.com | Nationwide |
| **Land and Farm** | landandfarm.com | Farm/ranch focus |
| **Craigslist** | craigslist.org | Local deals |

## Installation

1. Unzip this folder to a permanent location
2. Open Chrome → `chrome://extensions`
3. Toggle **Developer mode** ON
4. Click **Load unpacked**
5. Select the `land-scraper` folder

## Usage

### 1. Select a Site
Click a site button (LandWatch, Zillow, etc.)

### 2. Set Filters
- **State**: Filter by state (CA, OR, CO, TX, etc.)
- **Min Acres**: Minimum lot size
- **Max Price**: Maximum price

### 3. Open Site
Click **Open Site** — it will navigate to the site with filters applied

### 4. Scrape
- **Scrape This Page**: Extract listings from current page only
- **Auto-Scrape All Pages**: Navigate through pagination automatically

### 5. Export
Go to **Results** tab → Click **Download CSV**

## CSV Output

| Column | Description |
|--------|-------------|
| Price | Listing price |
| Location | City/county |
| State | State abbreviation |
| Acres | Lot size (if available) |
| Description | Property description |
| URL | Direct link to listing |
| Source | Which site |
| Scraped At | Timestamp |

## Settings

- **Delay**: Time between page loads (ms)
- **Max Pages**: Auto-scrape limit

## Notes

- Extension stores results in Chrome local storage
- Results persist until you click **Clear All**
- Be respectful — don't hammer sites with requests
- Some sites may block scraping; use reasonable delays

## Troubleshooting

**"No listings found"**
→ Make sure you're on a search results page with listings visible

**Site not detected**
→ Refresh the page or click the site button manually

**Extension not working**
→ Check that you're on a supported site (see table above)
