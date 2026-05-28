# PACER CH13 Discharge Extractor — Chrome Extension

Extracts **Chapter 13 discharged homeowners** from PACER bankruptcy courts
in **California (4 districts), Oregon, and Colorado** and exports to CSV.

---

## Installation (one-time, 2 minutes)

### Step 1 — Unzip
Unzip `pacer-extractor.zip` to a permanent folder on your computer.  
*(Don't delete this folder — Chrome loads the extension from it live.)*

### Step 2 — Load in Chrome
1. Open Chrome and go to: `chrome://extensions`
2. Toggle **Developer mode** ON (top-right corner)
3. Click **Load unpacked**
4. Select the `pacer-extractor` folder you unzipped
5. The extension icon (blue "13" badge) appears in your toolbar

---

## Usage

### Step 1 — Log into PACER first
Before running the extractor, **manually log into PACER** in Chrome:
- Go to: `https://pacer.psc.uscourts.gov`
- Sign in with your PACER credentials
- You only need to do this once per session

> ⚠️ PACER requires authentication. The extension reuses your active session
> but cannot log in for you.

### Step 2 — Run the Extractor
1. Click the **"13" extension icon** in your Chrome toolbar
2. Set your **date range** (defaults to last 30 days)
3. Check/uncheck the **courts** you want to search:
   - CACB — Central District of CA (Los Angeles)
   - CAEB — Eastern District of CA (Fresno/Sacramento)
   - CANB — Northern District of CA (San Francisco/Oakland)
   - CASB — Southern District of CA (San Diego)
   - ORB  — District of Oregon (Portland)
   - COB  — District of Colorado (Denver)
4. Click **Start Extraction**

The extension opens background tabs for each court, runs the query, and
collects results automatically. Each court takes ~5–10 seconds.

### Step 3 — Export
When done, click **Download CSV** to save the results file.

**CSV columns:** Name, Address, City, State, Zip, Discharge Date, Court, Case Number, District

---

## Courts Covered

| Court | State | District | PACER Host |
|-------|-------|----------|------------|
| CACB  | CA    | Central (LA/Riverside) | ecf.cacb.uscourts.gov |
| CAEB  | CA    | Eastern (Fresno/Sacramento) | ecf.caeb.uscourts.gov |
| CANB  | CA    | Northern (SF/Oakland/SJ) | ecf.canb.uscourts.gov |
| CASB  | CA    | Southern (San Diego) | ecf.casb.uscourts.gov |
| ORB   | OR    | Oregon (Portland/Eugene) | ecf.orb.uscourts.gov |
| COB   | CO    | Colorado (Denver) | ecf.cob.uscourts.gov |

---

## Troubleshooting

**"Login required" error**  
→ Log into PACER manually at pacer.psc.uscourts.gov, then retry.

**0 results returned**  
→ Some courts require you to navigate to the specific discharge report form
first. Try opening the court's CM/ECF Reports menu while logged in.

**Extension not appearing in toolbar**  
→ Go to chrome://extensions, confirm it's enabled, and pin it to the toolbar.

**PACER fee notice**  
→ PACER charges per-page fees. The discharge report typically returns
multiple cases per page; estimated cost is $0.10–$0.50 per court query.

---

## Notes

- This extension uses your existing PACER login session — no credentials are
  stored by the extension.
- Results are stored locally in Chrome storage and persist until you click
  "Clear & Reset."
- The extractor filters for **Chapter 13** cases with a **Discharge of Debtor**
  event within your specified date range.
- Address data availability varies by court; some courts do not show
  addresses in the public discharge report.
