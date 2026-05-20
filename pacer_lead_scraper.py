"""
PACER Chapter 13 Bankruptcy Lead Scraper
My Home Loan Advisor LLC — Bayo / NMLS #164477

What this script does:
 1. Logs into PACER and queries each district for new Chapter 13 filings
 2. Downloads docket lists and extracts debtor name + address
 3. Pulls Schedule A/B PDF for each case and uses Claude AI to extract property info
 4. Filters for cases with likely equity (property value > debts)
 5. Sends approved leads to BatchSkipTracing for phone number append
 6. Exports final leads to a Google Sheet (or CSV fallback)

Requirements:
 pip install playwright requests anthropic gspread google-auth pandas
 playwright install chromium

Setup:
 1. Set environment variables (see CONFIG section below)
 2. Run: python pacer_lead_scraper.py
 3. Review the Google Sheet, approve leads, then load to dialer
"""

import os
import re
import time
import json
import logging
import requests
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path

# ── Optional imports (graceful degradation) ──────────────────────────────────
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("WARNING: playwright not installed. Run: pip install playwright && playwright install chromium")

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    print("WARNING: anthropic not installed. Run: pip install anthropic")

# Google Sheets disabled - using CSV only for manual skip trace workflow
GSPREAD_AVAILABLE = False

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("pacer_scraper.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# CONFIG — set these as environment variables or edit directly
# ══════════════════════════════════════════════════════════════════════════════
CONFIG = {
    # PACER credentials
    "PACER_USERNAME": os.getenv("PACER_USERNAME", "YOUR_PACER_USERNAME"),
    "PACER_PASSWORD": os.getenv("PACER_PASSWORD", "YOUR_PACER_PASSWORD"),

    # Anthropic API key (for Schedule A/B PDF parsing)
    "ANTHROPIC_API_KEY": os.getenv("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_KEY"),

    # BatchSkipTracing API key (https://batchskiptracing.com)
    "BST_API_KEY": os.getenv("BST_API_KEY", "YOUR_BST_KEY"),

    # Google Sheets disabled - CSV only
    "GOOGLE_SERVICE_ACCOUNT_JSON": None,
    "GOOGLE_SHEET_NAME": None,

    # How many days back to search for discharged cases
    # Chapter 13 plans are 3-5 years, so recent discharges = completed cases
    "LOOKBACK_DAYS": 7,
    
    # Case status to query: 'discharged' for completed Chapter 13s
    "CASE_STATUS": "discharged",

    # Minimum estimated equity to qualify (property value - all debts)
    # Set to 0 to let Claude flag based on what it finds in Schedule A
    "MIN_EQUITY_ESTIMATE": 50000,

    # Output CSV path (used if Google Sheets not configured)
    "OUTPUT_CSV": f"chapter13_leads_{datetime.now().strftime('%Y%m%d')}.csv",

    # Request delay in seconds (be polite to PACER servers)
    "REQUEST_DELAY": 2.5,

    # Districts to query — Bayo's licensed states: CA, AZ, OR, WA
    # Format: (court_code, friendly_name)
    "DISTRICTS": [
        ("casb", "CA Southern (San Diego)"),
        ("cacb", "CA Central (LA/OC)"),
        ("caeb", "CA Eastern (Sacramento/Fresno)"),
        ("canb", "CA Northern (San Francisco/Oakland)"),
        ("azb", "Arizona"),
        ("orb", "Oregon"),
        ("wawb", "WA Western (Seattle/Tacoma)"),
        ("waeb", "WA Eastern (Spokane)"),
    ],
}

# ══════════════════════════════════════════════════════════════════════════════
# PACER SESSION
# ══════════════════════════════════════════════════════════════════════════════

class PACERSession:
    """
    Handles PACER login and case queries via Playwright (headless browser).
    Uses a single session across all district queries to avoid re-login.
    """

    BASE_URL = "https://pacer.uscourts.gov"

    def __init__(self, username: str, password: str, delay: float = 2.5):
        self.username = username
        self.password = password
        self.delay = delay
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    def start(self):
        """Launch headless browser and log into PACER."""
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError("playwright is required. Run: pip install playwright && playwright install chromium")

        log.info("Starting browser session...")
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        self.page = self.context.new_page()
        self._login()

    def _login(self):
        """Log into the PACER central login."""
        log.info("Logging into PACER...")
        self.page.goto("https://pacer.uscourts.gov/psco/cgi-bin/login.pl")
        self.page.fill('input[name="login"]', self.username)
        self.page.fill('input[name="passwd"]', self.password)
        self.page.click('input[type="submit"]')
        self.page.wait_for_load_state("networkidle")
        time.sleep(self.delay)

        if "login" in self.page.url.lower():
            raise RuntimeError("PACER login failed — check your credentials.")
        log.info("PACER login successful.")

    def query_district(self, court_code: str, lookback_days: int = 7) -> list[dict]:
        """
        Query a specific bankruptcy district for new Chapter 13 filings.
        Returns a list of dicts: {case_number, debtor_name, address, filed_date, court}
        """
        court_url = f"https://ecf.{court_code}.uscourts.gov"
        date_from = (datetime.now() - timedelta(days=lookback_days)).strftime("%m/%d/%Y")
        date_to = datetime.now().strftime("%m/%d/%Y")

        log.info(f"Querying {court_code} for Chapter 13 filings ({date_from} - {date_to})...")

        try:
            # Navigate to the court's CM/ECF query page
            self.page.goto(f"{court_url}/cgi-bin/login.pl")
            time.sleep(self.delay)

            # Select report type: Cases Filed
            self.page.goto(f"{court_url}/cgi-bin/iquery.pl")
            time.sleep(self.delay)

            # Fill query form
            # Chapter 13, open cases, date range
            self.page.select_option('select[name="chapter"]', "13")
            self.page.select_option('select[name="case_status"]', "open")
            self.page.fill('input[name="date_filed_from"]', date_from)
            self.page.fill('input[name="date_filed_to"]', date_to)
            self.page.click('input[type="submit"]')
            self.page.wait_for_load_state("networkidle")
            time.sleep(self.delay)

            return self._parse_case_list(court_code)

        except PWTimeout:
            log.warning(f"Timeout querying {court_code} — skipping.")
            return []
        except Exception as e:
            log.error(f"Error querying {court_code}: {e}")
            return []

    def _parse_case_list(self, court_code: str) -> list[dict]:
        """Parse the HTML case list returned by CM/ECF query."""
        cases = []
        content = self.page.content()

        # CM/ECF case list rows follow a predictable pattern
        # Case numbers look like: 1:25-bk-12345
        case_pattern = re.compile(
            r'(\d+:\d{2}-bk-\d+).*?</a>\s*(.*?)\s*</td>.*?(\d{2}/\d{2}/\d{4})',
            re.DOTALL
        )

        for match in case_pattern.finditer(content):
            case_num = match.group(1).strip()
            debtor_raw = match.group(2).strip()
            filed_date = match.group(3).strip()

            # Clean debtor name (remove HTML tags)
            debtor_name = re.sub(r'<[^>]+>', '', debtor_raw).strip()

            if case_num and debtor_name:
                cases.append({
                    "case_number": case_num,
                    "debtor_name": debtor_name,
                    "filed_date": filed_date,
                    "court": court_code,
                    "case_url": f"https://ecf.{court_code}.uscourts.gov/cgi-bin/DktRpt.pl?{case_num}",
                    "address": "",
                    "property_address": "",
                    "property_value": "",
                    "debts_listed": "",
                    "equity_estimate": "",
                    "phone": "",
                    "status": "pending_review",
                })

        log.info(f"Found {len(cases)} Chapter 13 cases in {court_code}.")
        return cases

    def get_schedule_a_pdf(self, court_code: str, case_number: str) -> bytes | None:
        """
        Attempt to pull Schedule A/B PDF from the case docket.
        Returns PDF bytes or None if not found.
        """
        # Navigate to docket report
        docket_url = (
            f"https://ecf.{court_code}.uscourts.gov/cgi-bin/DktRpt.pl"
            f"?casenum={case_number}&DktType=bk&OutputType=DOCKET"
        )
        try:
            self.page.goto(docket_url)
            time.sleep(self.delay)

            # Look for Schedule A/B link in the docket
            schedule_link = self.page.query_selector('a:text-matches("Schedule A", "i")')
            if not schedule_link:
                schedule_link = self.page.query_selector('a:text-matches("Schedules A", "i")')

            if not schedule_link:
                log.debug(f"No Schedule A/B found for {case_number}")
                return None

            # Download the PDF
            with self.page.expect_download() as download_info:
                schedule_link.click()
                download = download_info.value
                pdf_path = Path(f"/tmp/schedule_{case_number.replace(':', '_')}.pdf")
                download.save_as(pdf_path)
                time.sleep(self.delay)

            return pdf_path.read_bytes()

        except Exception as e:
            log.debug(f"Could not get Schedule A/B for {case_number}: {e}")
            return None

    def stop(self):
        """Close the browser session."""
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()
        log.info("Browser session closed.")


# ══════════════════════════════════════════════════════════════════════════════
# SCHEDULE A/B PDF PARSER — uses Claude AI
# ══════════════════════════════════════════════════════════════════════════════

class ScheduleParser:
    """
    Uses Claude to extract property and debt information from Schedule A/B PDFs.
    Falls back to regex extraction if Claude is not available.
    """

    def __init__(self, api_key: str):
        if ANTHROPIC_AVAILABLE:
            self.client = anthropic.Anthropic(api_key=api_key)
        else:
            self.client = None

    def parse(self, pdf_bytes: bytes) -> dict:
        """
        Extract property address, estimated value, and total debts from Schedule A/B.
        Returns dict: {property_address, property_value, debts_listed, equity_estimate}
        """
        if self.client and pdf_bytes:
            return self._parse_with_claude(pdf_bytes)
        elif pdf_bytes:
            return self._parse_with_regex(pdf_bytes)
        else:
            return {
                "property_address": "PDF not available",
                "property_value": "",
                "debts_listed": "",
                "equity_estimate": "",
            }

    def _parse_with_claude(self, pdf_bytes: bytes) -> dict:
        """Send Schedule A/B PDF to Claude for structured extraction."""
        import base64
        pdf_b64 = base64.standard_b64encode(pdf_bytes).decode("utf-8")

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "document",
                            "source": {
                                "type": "base64",
                                "media_type": "application/pdf",
                                "data": pdf_b64,
                            }
                        },
                        {
                            "type": "text",
                            "text": (
                                "This is a bankruptcy Schedule A/B from a court filing. "
                                "Extract the following and return ONLY valid JSON, no other text:\n"
                                "{\n"
                                '  "property_address": "full street address of real property owned, or NONE",\n'
                                '  "property_value": "debtor estimated value as a number, or UNKNOWN",\n'
                                '  "mortgage_balance": "total mortgage/lien amount listed, or UNKNOWN",\n'
                                '  "equity_estimate": "property_value minus mortgage_balance as a number, or UNKNOWN",\n'
                                '  "notes": "any relevant notes about the property or unusual circumstances"\n'
                                "}\n"
                                "If multiple properties exist, use the primary residence."
                            )
                        }
                    ]
                }]
            )

            raw = response.content[0].text.strip()
            # Strip markdown fences if present
            raw = re.sub(r"^```json\s*|^```\s*|\s*```$", "", raw, flags=re.MULTILINE).strip()
            return json.loads(raw)

        except Exception as e:
            log.warning(f"Claude PDF parse error: {e}")
            return self._parse_with_regex(pdf_bytes)

    def _parse_with_regex(self, pdf_bytes: bytes) -> dict:
        """
        Fallback: basic regex extraction from PDF text.
        Less accurate than Claude but works without API access.
        """
        try:
            import pdfplumber
            with pdfplumber.open(pdf_bytes) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        except Exception:
            return {
                "property_address": "Parse failed",
                "property_value": "",
                "debts_listed": "",
                "equity_estimate": "",
            }

        # Extract property value
        value_match = re.search(r'\$\s*([\d,]+(?:\.\d{2})?)', text)
        property_value = value_match.group(1).replace(",", "") if value_match else ""

        # Extract address (looks for street number + street name)
        addr_match = re.search(
            r'(\d{1,5}\s+[A-Z][a-zA-Z\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl)[.,\s]+'
            r'[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})',
            text
        )
        property_address = addr_match.group(1).strip() if addr_match else ""

        return {
            "property_address": property_address,
            "property_value": property_value,
            "debts_listed": "",
            "equity_estimate": "",
        }


# ══════════════════════════════════════════════════════════════════════════════
# SKIP TRACE — BatchSkipTracing API
# ══════════════════════════════════════════════════════════════════════════════

class SkipTracer:
    """
    Sends leads to BatchSkipTracing to append mobile phone numbers.
    Docs: https://batchskiptracing.com/api
    """

    API_URL = "https://api.batchskiptracing.com/api/v2/lookupBatch"

    def __init__(self, api_key: str):
        self.api_key = api_key

    def append_phones(self, leads: list[dict]) -> list[dict]:
        """
        Send a batch of leads and return them with phone numbers appended.
        Each lead dict needs: debtor_name, property_address (or address)
        """
        if not self.api_key or self.api_key == "YOUR_BST_KEY":
            log.warning("BatchSkipTracing API key not set — skipping phone append.")
            return leads

        # Build request payload
        records = []
        for i, lead in enumerate(leads):
            name_parts = lead.get("debtor_name", "").split()
            first = name_parts[0] if name_parts else ""
            last = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
            address = lead.get("property_address") or lead.get("address", "")

            records.append({
                "id": str(i),
                "firstName": first,
                "lastName": last,
                "propertyAddress": address,
            })

        try:
            resp = requests.post(
                self.API_URL,
                json={"records": records},
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": self.api_key,
                },
                timeout=60,
            )
            resp.raise_for_status()
            results = resp.json().get("results", [])

            # Map phone numbers back to leads by index
            phone_map = {}
            for r in results:
                idx = int(r.get("id", -1))
                phones = r.get("phones", [])
                if phones:
                    # Prefer mobile numbers
                    mobile = next(
                        (p["number"] for p in phones if p.get("type") == "mobile"),
                        phones[0]["number"]
                    )
                    phone_map[idx] = mobile

            for i, lead in enumerate(leads):
                lead["phone"] = phone_map.get(i, "")

            matched = sum(1 for v in phone_map.values() if v)
            log.info(f"Skip trace complete: {matched}/{len(leads)} phone numbers found.")

        except Exception as e:
            log.error(f"BatchSkipTracing API error: {e}")

        return leads


# ══════════════════════════════════════════════════════════════════════════════
# EXPORT — Google Sheets or CSV
# ══════════════════════════════════════════════════════════════════════════════

COLUMNS = [
    "case_number", "debtor_name", "filed_date", "court",
    "property_address", "property_value", "mortgage_balance",
    "equity_estimate", "notes", "status", "case_url",
    "phone_1", "phone_1_type", "phone_1_source",
    "phone_2", "phone_2_type", "phone_2_source",
    "email", "skip_trace_date", "contact_notes",
]

def export_to_google_sheets(leads: list[dict], sheet_name: str, sa_json_path: str):
    """Push leads to a Google Sheet (creates a new tab with today's date)."""
    if not GSPREAD_AVAILABLE:
        log.warning("gspread not installed — falling back to CSV export.")
        return False

    try:
        scopes = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive",
        ]
        creds = Credentials.from_service_account_file(sa_json_path, scopes=scopes)
        gc = gspread.authorize(creds)

        try:
            sh = gc.open(sheet_name)
        except gspread.SpreadsheetNotFound:
            sh = gc.create(sheet_name)
            log.info(f"Created new Google Sheet: {sheet_name}")

        tab_name = datetime.now().strftime("%Y-%m-%d")
        try:
            ws = sh.add_worksheet(title=tab_name, rows=500, cols=len(COLUMNS))
        except Exception:
            ws = sh.worksheet(tab_name)
            ws.clear()

        # Write header + data
        df = pd.DataFrame(leads)[COLUMNS]
        ws.update([df.columns.tolist()] + df.values.tolist())
        log.info(f"Exported {len(leads)} leads to Google Sheets tab '{tab_name}'.")
        return True

    except Exception as e:
        log.error(f"Google Sheets export failed: {e}")
        return False

def export_to_csv(leads: list[dict], path: str):
    """Fallback CSV export."""
    df = pd.DataFrame(leads)
    available_cols = [c for c in COLUMNS if c in df.columns]
    df[available_cols].to_csv(path, index=False)
    log.info(f"Exported {len(leads)} leads to {path}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN PIPELINE
# ══════════════════════════════════════════════════════════════════════════════

def run_pipeline():
    log.info("=" * 60)
    log.info("PACER Chapter 13 Lead Pipeline — My Home Loan Advisor LLC")
    log.info(f"Run date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    log.info("=" * 60)

    cfg = CONFIG
    all_leads = []

    # ── Step 1: Query PACER for new Chapter 13 filings ───────────────────────
    pacer = PACERSession(
        username=cfg["PACER_USERNAME"],
        password=cfg["PACER_PASSWORD"],
        delay=cfg["REQUEST_DELAY"],
    )

    parser = ScheduleParser(api_key=cfg["ANTHROPIC_API_KEY"])

    try:
        pacer.start()

        for court_code, court_name in cfg["DISTRICTS"]:
            log.info(f"\nProcessing district: {court_name} ({court_code})")

            cases = pacer.query_district(court_code, lookback_days=cfg["LOOKBACK_DAYS"])
            if not cases:
                log.info(f"No new filings found in {court_code}.")
                continue

            # ── Step 2: Pull Schedule A/B for each case ───────────────────
            for case in cases:
                log.info(f"  Pulling Schedule A/B for {case['case_number']}...")
                pdf_bytes = pacer.get_schedule_a_pdf(court_code, case["case_number"])

                # ── Step 3: Parse PDF with Claude ─────────────────────────
                parsed = parser.parse(pdf_bytes)
                case.update(parsed)

                # ── Step 4: Equity filter ──────────────────────────────────
                try:
                    equity = float(str(case.get("equity_estimate", "0")).replace(",", ""))
                    if equity >= cfg["MIN_EQUITY_ESTIMATE"]:
                        case["status"] = "review_ready"
                        all_leads.append(case)
                    elif case.get("property_address") and case.get("property_address") != "NONE":
                        # Has property but equity unclear — include for manual review
                        case["status"] = "equity_unknown"
                        all_leads.append(case)
                    else:
                        log.debug(f"  Skipped {case['case_number']} — no property or insufficient equity.")
                except (ValueError, TypeError):
                    # Can't determine equity — include for manual review
                    case["status"] = "equity_unknown"
                    if case.get("property_address"):
                        all_leads.append(case)

                time.sleep(cfg["REQUEST_DELAY"])

    finally:
        pacer.stop()

    if not all_leads:
        log.info("No qualifying leads found this run.")
        return

    log.info(f"\nTotal qualifying leads: {len(all_leads)}")

    # ── Step 5: Export to CSV ────────────────────────────────────────────────
    export_to_csv(all_leads, cfg["OUTPUT_CSV"])

    # ── Summary ───────────────────────────────────────────────────────────────
    ready = sum(1 for l in all_leads if l["status"] == "review_ready")
    unknown = sum(1 for l in all_leads if l["status"] == "equity_unknown")

    log.info("\n" + "=" * 60)
    log.info("PIPELINE COMPLETE")
    log.info(f"  Strong equity leads (review_ready): {ready}")
    log.info(f"  Unknown equity leads (needs review): {unknown}")
    log.info(f"  Total leads exported: {len(all_leads)}")
    log.info(f"  Output file: {cfg['OUTPUT_CSV']}")
    log.info("=" * 60)
    log.info("Next step: Import CSV into your skip trace tool, then load to dialer.")


# ══════════════════════════════════════════════════════════════════════════════
# DEMO MODE — test the pipeline without live PACER credentials
# ══════════════════════════════════════════════════════════════════════════════

def run_demo():
    """
    Runs the pipeline with sample data so you can test parsing and export
    without real PACER credentials. Useful for initial setup verification.
    """
    log.info("Running in DEMO MODE with sample data...")

    sample_leads = [
        {
            "case_number": "1:25-bk-10234",
            "debtor_name": "John A Smith",
            "filed_date": "05/01/2026",
            "court": "casb",
            "address": "123 Main St, San Diego, CA 92101",
            "property_address": "123 Main St, San Diego, CA 92101",
            "property_value": "650000",
            "mortgage_balance": "420000",
            "equity_estimate": "230000",
            "notes": "Single family residence, primary home",
            "status": "review_ready",
            "case_url": "https://ecf.casb.uscourts.gov/cgi-bin/DktRpt.pl?1:25-bk-10234",
        },
        {
            "case_number": "2:25-bk-55678",
            "debtor_name": "Maria L Gonzalez",
            "filed_date": "05/03/2026",
            "court": "cacb",
            "address": "456 Oak Ave, Los Angeles, CA 90001",
            "property_address": "456 Oak Ave, Los Angeles, CA 90001",
            "property_value": "890000",
            "mortgage_balance": "720000",
            "equity_estimate": "170000",
            "notes": "Condo, primary residence",
            "status": "review_ready",
            "case_url": "https://ecf.cacb.uscourts.gov/cgi-bin/DktRpt.pl?2:25-bk-55678",
        },
        {
            "case_number": "3:25-bk-88901",
            "debtor_name": "Robert T Williams",
            "filed_date": "05/05/2026",
            "court": "azb",
            "address": "789 Desert Rd, Phoenix, AZ 85001",
            "property_address": "789 Desert Rd, Phoenix, AZ 85001",
            "property_value": "UNKNOWN",
            "mortgage_balance": "UNKNOWN",
            "equity_estimate": "",
            "notes": "Property listed but value unclear from petition",
            "status": "equity_unknown",
            "case_url": "https://ecf.azb.uscourts.gov/cgi-bin/DktRpt.pl?3:25-bk-88901",
        },
    ]

    # Demo: simulate skip trace (no real API call)
    for lead in sample_leads:
        lead["phone"] = "(555) 000-0000 [demo]"

    export_to_csv(sample_leads, f"DEMO_{CONFIG['OUTPUT_CSV']}")
    log.info(f"Demo export complete. Check DEMO_{CONFIG['OUTPUT_CSV']}")


# ══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    if "--demo" in sys.argv:
        run_demo()
    else:
        # Validate required credentials before running
        missing = []
        if CONFIG["PACER_USERNAME"] == "YOUR_PACER_USERNAME":
            missing.append("PACER_USERNAME")
        if CONFIG["PACER_PASSWORD"] == "YOUR_PACER_PASSWORD":
            missing.append("PACER_PASSWORD")

        if missing:
            print(f"\nERROR: Missing required config: {', '.join(missing)}")
            print("Set them as environment variables or edit CONFIG in this script.")
            print("\nTo run a demo with sample data first:")
            print("  python pacer_lead_scraper.py --demo\n")
            sys.exit(1)

        run_pipeline()
