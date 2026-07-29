"""
trusted_sources.py

Central registry of trusted news, official government portals, scientific repositories,
health authorities, and verification sources used by the TruthLens AI retrieval pipeline.

Responsibilities
----------------
- Maintain trusted domains and subdomains registry.
- Categorize sources (Government, Health, Science, Fact Check, News, etc.).
- Assign trust priorities for evidence ranking.
- Provide domain normalization and validation helper functions.

This module contains NO network logic.
It is only responsible for source metadata.
"""

from urllib.parse import urlparse
from typing import Dict, Any, Optional

# ----------------------------------------------------------------------
# Priority Scoring System Documentation
# ----------------------------------------------------------------------
# Priority values are integers used by search.py to rank evidence (1 is highest priority):
# Priority 1 : Official Government, Official Public Health, Space Agencies, Meteorological Depts
# Priority 2 : Official Health Authorities, Top Peer-Reviewed Journals, Top Security Bodies & Academia
# Priority 3 : Verified Fact-Checking Organizations & Specialized Science/Space Portals
# Priority 4 : Global News Agencies & Top International Broadcasters
# Priority 5 : Indian National Newspapers, Business News & Major Financial Media
# Priority 6 : Tech Media, Cybersecurity Blogs & Specialized Outlets
# Priority 999: Unknown / Untrusted Sources (Lowest Priority)

# ----------------------------------------------------------------------
# Source Registry (~120+ Verified Trusted Domains)
# ----------------------------------------------------------------------

TRUSTED_SOURCES: Dict[str, Dict[str, Any]] = {

    # ==================================================================
    # 1. Government (India)
    # ==================================================================

    "pib.gov.in": {
        "name": "Press Information Bureau",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "india.gov.in": {
        "name": "Government of India Portal",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "eci.gov.in": {
        "name": "Election Commission of India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mygov.in": {
        "name": "MyGov India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mohfw.gov.in": {
        "name": "Ministry of Health and Family Welfare",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "meity.gov.in": {
        "name": "Ministry of Electronics and Information Technology",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "niti.gov.in": {
        "name": "NITI Aayog",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "uidai.gov.in": {
        "name": "Unique Identification Authority of India (Aadhaar)",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "gst.gov.in": {
        "name": "Goods and Services Tax Portal",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "sci.gov.in": {
        "name": "Supreme Court of India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "main.sci.gov.in": {
        "name": "Supreme Court of India Official",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "sansad.in": {
        "name": "Parliament of India (Sansad)",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "parliamentofindia.nic.in": {
        "name": "Parliament of India Archive",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "incometax.gov.in": {
        "name": "Income Tax Department India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mha.gov.in": {
        "name": "Ministry of Home Affairs India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mea.gov.in": {
        "name": "Ministry of External Affairs India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mod.gov.in": {
        "name": "Ministry of Defence India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "finmin.nic.in": {
        "name": "Ministry of Finance India",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "pibfactcheck.pib.gov.in": {
        "name": "PIB Fact Check",
        "category": "Government (India)",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },

    # ==================================================================
    # 2. Government (Global)
    # ==================================================================

    "usa.gov": {
        "name": "US Government Official Portal",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "gov.uk": {
        "name": "UK Government Official Portal",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "UK",
        "official": True,
    },
    "europa.eu": {
        "name": "European Union Official Portal",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "Europe",
        "official": True,
    },
    "un.org": {
        "name": "United Nations Official Portal",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "state.gov": {
        "name": "US Department of State",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "whitehouse.gov": {
        "name": "The White House",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "canada.ca": {
        "name": "Government of Canada",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "Canada",
        "official": True,
    },
    "australia.gov.au": {
        "name": "Australian Government",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "Australia",
        "official": True,
    },
    "japan.go.jp": {
        "name": "Government of Japan",
        "category": "Government (Global)",
        "trust": "official",
        "priority": 1,
        "region": "Japan",
        "official": True,
    },

    # ==================================================================
    # 3. Health
    # ==================================================================

    "who.int": {
        "name": "World Health Organization",
        "category": "Health",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "cdc.gov": {
        "name": "Centers for Disease Control and Prevention",
        "category": "Health",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "nih.gov": {
        "name": "National Institutes of Health",
        "category": "Health",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "icmr.gov.in": {
        "name": "Indian Council of Medical Research",
        "category": "Health",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mayoclinic.org": {
        "name": "Mayo Clinic",
        "category": "Health",
        "trust": "high",
        "priority": 2,
        "region": "USA",
        "official": False,
    },
    "hopkinsmedicine.org": {
        "name": "Johns Hopkins Medicine",
        "category": "Health",
        "trust": "high",
        "priority": 2,
        "region": "USA",
        "official": False,
    },
    "ema.europa.eu": {
        "name": "European Medicines Agency",
        "category": "Health",
        "trust": "official",
        "priority": 1,
        "region": "Europe",
        "official": True,
    },
    "thelancet.com": {
        "name": "The Lancet Medical Journal",
        "category": "Health",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "nejm.org": {
        "name": "New England Journal of Medicine",
        "category": "Health",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "bmj.com": {
        "name": "The BMJ (British Medical Journal)",
        "category": "Health",
        "trust": "high",
        "priority": 2,
        "region": "UK",
        "official": False,
    },

    # ==================================================================
    # 4. Science
    # ==================================================================

    "nature.com": {
        "name": "Nature Journal",
        "category": "Science",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "science.org": {
        "name": "Science Magazine (AAAS)",
        "category": "Science",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "scientificamerican.com": {
        "name": "Scientific American",
        "category": "Science",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "noaa.gov": {
        "name": "National Oceanic and Atmospheric Administration",
        "category": "Science",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "usgs.gov": {
        "name": "United States Geological Survey",
        "category": "Science",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "home.cern": {
        "name": "CERN (European Organization for Nuclear Research)",
        "category": "Science",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "cern.ch": {
        "name": "CERN Official Domain",
        "category": "Science",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "csir.res.in": {
        "name": "Council of Scientific and Industrial Research India",
        "category": "Science",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "phys.org": {
        "name": "Phys.org Science News",
        "category": "Science",
        "trust": "high",
        "priority": 3,
        "region": "Global",
        "official": False,
    },
    "newscientist.com": {
        "name": "New Scientist",
        "category": "Science",
        "trust": "high",
        "priority": 3,
        "region": "Global",
        "official": False,
    },

    # ==================================================================
    # 5. Space
    # ==================================================================

    "isro.gov.in": {
        "name": "Indian Space Research Organisation (ISRO)",
        "category": "Space",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "nasa.gov": {
        "name": "National Aeronautics and Space Administration (NASA)",
        "category": "Space",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "esa.int": {
        "name": "European Space Agency (ESA)",
        "category": "Space",
        "trust": "official",
        "priority": 1,
        "region": "Europe",
        "official": True,
    },
    "jaxa.jp": {
        "name": "Japan Aerospace Exploration Agency (JAXA)",
        "category": "Space",
        "trust": "official",
        "priority": 1,
        "region": "Japan",
        "official": True,
    },
    "space.com": {
        "name": "Space.com",
        "category": "Space",
        "trust": "medium",
        "priority": 3,
        "region": "Global",
        "official": False,
    },

    # ==================================================================
    # 6. Finance
    # ==================================================================

    "rbi.org.in": {
        "name": "Reserve Bank of India",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "sebi.gov.in": {
        "name": "Securities and Exchange Board of India",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "imf.org": {
        "name": "International Monetary Fund",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "worldbank.org": {
        "name": "World Bank Group",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "federalreserve.gov": {
        "name": "Federal Reserve System",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "ecb.europa.eu": {
        "name": "European Central Bank",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "Europe",
        "official": True,
    },
    "bis.org": {
        "name": "Bank for International Settlements",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "oecd.org": {
        "name": "OECD Official Portal",
        "category": "Finance",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },

    # ==================================================================
    # 7. Fact Checking
    # ==================================================================

    "factcheck.org": {
        "name": "FactCheck.org",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "USA",
        "official": False,
    },
    "politifact.com": {
        "name": "PolitiFact",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "USA",
        "official": False,
    },
    "fullfact.org": {
        "name": "Full Fact UK",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "UK",
        "official": False,
    },
    "snopes.com": {
        "name": "Snopes",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "Global",
        "official": False,
    },
    "factcheck.afp.com": {
        "name": "AFP Fact Check",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "Global",
        "official": False,
    },
    "boomlive.in": {
        "name": "BOOM Live",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "India",
        "official": False,
    },
    "altnews.in": {
        "name": "Alt News India",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "India",
        "official": False,
    },
    "factly.in": {
        "name": "Factly India",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "India",
        "official": False,
    },
    "vishvasnews.com": {
        "name": "Vishvas News India",
        "category": "Fact Checking",
        "trust": "high",
        "priority": 3,
        "region": "India",
        "official": False,
    },

    # ==================================================================
    # 8. International News
    # ==================================================================

    "reuters.com": {
        "name": "Reuters",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "apnews.com": {
        "name": "Associated Press",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "afp.com": {
        "name": "Agence France-Presse",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "bbc.com": {
        "name": "BBC News",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "UK",
        "official": False,
    },
    "bbc.co.uk": {
        "name": "BBC UK",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "UK",
        "official": False,
    },
    "aljazeera.com": {
        "name": "Al Jazeera English",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "cnn.com": {
        "name": "CNN",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "nbcnews.com": {
        "name": "NBC News",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "abcnews.go.com": {
        "name": "ABC News US",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "dw.com": {
        "name": "Deutsche Welle",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Germany",
        "official": False,
    },
    "nhk.or.jp": {
        "name": "NHK World Japan",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Japan",
        "official": False,
    },
    "cbc.ca": {
        "name": "CBC News Canada",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Canada",
        "official": False,
    },
    "euronews.com": {
        "name": "Euronews",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Europe",
        "official": False,
    },
    "theguardian.com": {
        "name": "The Guardian",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "UK",
        "official": False,
    },
    "npr.org": {
        "name": "National Public Radio",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "abc.net.au": {
        "name": "ABC News Australia",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Australia",
        "official": False,
    },
    "bloomberg.com": {
        "name": "Bloomberg",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "ft.com": {
        "name": "Financial Times",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },
    "wsj.com": {
        "name": "The Wall Street Journal",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "nytimes.com": {
        "name": "The New York Times",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "washingtonpost.com": {
        "name": "The Washington Post",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "time.com": {
        "name": "TIME Magazine",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "USA",
        "official": False,
    },
    "economist.com": {
        "name": "The Economist",
        "category": "International News",
        "trust": "high",
        "priority": 4,
        "region": "Global",
        "official": False,
    },

    # ==================================================================
    # 9. Indian National News
    # ==================================================================

    "thehindu.com": {
        "name": "The Hindu",
        "category": "Indian National News",
        "trust": "high",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "indianexpress.com": {
        "name": "The Indian Express",
        "category": "Indian National News",
        "trust": "high",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "timesofindia.indiatimes.com": {
        "name": "The Times of India",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "indiatimes.com": {
        "name": "IndiaTimes Portal",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "hindustantimes.com": {
        "name": "Hindustan Times",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "ndtv.com": {
        "name": "NDTV",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "deccanherald.com": {
        "name": "Deccan Herald",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "tribuneindia.com": {
        "name": "The Tribune India",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "telegraphindia.com": {
        "name": "The Telegraph India",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "theprint.in": {
        "name": "ThePrint",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "newslaundry.com": {
        "name": "Newslaundry",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "scroll.in": {
        "name": "Scroll.in",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "thewire.in": {
        "name": "The Wire India",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "outlookindia.com": {
        "name": "Outlook India",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "indiatoday.in": {
        "name": "India Today",
        "category": "Indian National News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },

    # ==================================================================
    # 10. Business News
    # ==================================================================

    "livemint.com": {
        "name": "Mint (Livemint)",
        "category": "Business News",
        "trust": "high",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "business-standard.com": {
        "name": "Business Standard",
        "category": "Business News",
        "trust": "high",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "economictimes.indiatimes.com": {
        "name": "The Economic Times",
        "category": "Business News",
        "trust": "high",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "financialexpress.com": {
        "name": "Financial Express India",
        "category": "Business News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },
    "cnbc.com": {
        "name": "CNBC",
        "category": "Business News",
        "trust": "medium",
        "priority": 5,
        "region": "USA",
        "official": False,
    },
    "marketwatch.com": {
        "name": "MarketWatch",
        "category": "Business News",
        "trust": "medium",
        "priority": 5,
        "region": "USA",
        "official": False,
    },
    "moneycontrol.com": {
        "name": "Moneycontrol India",
        "category": "Business News",
        "trust": "medium",
        "priority": 5,
        "region": "India",
        "official": False,
    },

    # ==================================================================
    # 11. Cybersecurity & Technology
    # ==================================================================

    "msrc.microsoft.com": {
        "name": "Microsoft Security Response Center",
        "category": "Cybersecurity",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "microsoft.com": {
        "name": "Microsoft Official Portal",
        "category": "Technology",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "security.googleblog.com": {
        "name": "Google Security Blog",
        "category": "Cybersecurity",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "google.com": {
        "name": "Google Official Portal",
        "category": "Technology",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "cisa.gov": {
        "name": "Cybersecurity and Infrastructure Security Agency (CISA)",
        "category": "Cybersecurity",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "nist.gov": {
        "name": "National Institute of Standards and Technology (NIST)",
        "category": "Technology",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "mitre.org": {
        "name": "MITRE Corporation",
        "category": "Cybersecurity",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "cert-in.org.in": {
        "name": "Indian Computer Emergency Response Team (CERT-In)",
        "category": "Cybersecurity",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "arstechnica.com": {
        "name": "Ars Technica",
        "category": "Technology",
        "trust": "medium",
        "priority": 6,
        "region": "USA",
        "official": False,
    },
    "wired.com": {
        "name": "Wired",
        "category": "Technology",
        "trust": "medium",
        "priority": 6,
        "region": "USA",
        "official": False,
    },
    "techcrunch.com": {
        "name": "TechCrunch",
        "category": "Technology",
        "trust": "medium",
        "priority": 6,
        "region": "USA",
        "official": False,
    },
    "theverge.com": {
        "name": "The Verge",
        "category": "Technology",
        "trust": "medium",
        "priority": 6,
        "region": "USA",
        "official": False,
    },
    "bleepingcomputer.com": {
        "name": "BleepingComputer",
        "category": "Cybersecurity",
        "trust": "high",
        "priority": 6,
        "region": "USA",
        "official": False,
    },
    "krebsonsecurity.com": {
        "name": "Krebs on Security",
        "category": "Cybersecurity",
        "trust": "high",
        "priority": 6,
        "region": "USA",
        "official": False,
    },

    # ==================================================================
    # 12. Academic Institutions & Research Organizations
    # ==================================================================

    "arxiv.org": {
        "name": "arXiv Research Repository",
        "category": "Academic Institutions",
        "trust": "high",
        "priority": 2,
        "region": "Global",
        "official": False,
    },
    "mit.edu": {
        "name": "Massachusetts Institute of Technology",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "stanford.edu": {
        "name": "Stanford University",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "harvard.edu": {
        "name": "Harvard University",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "USA",
        "official": True,
    },
    "ox.ac.uk": {
        "name": "University of Oxford",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "UK",
        "official": True,
    },
    "cam.ac.uk": {
        "name": "University of Cambridge",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "UK",
        "official": True,
    },
    "iisc.ac.in": {
        "name": "Indian Institute of Science Bangalore",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "India",
        "official": True,
    },
    "iitb.ac.in": {
        "name": "Indian Institute of Technology Bombay",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "India",
        "official": True,
    },
    "iitd.ac.in": {
        "name": "Indian Institute of Technology Delhi",
        "category": "Academic Institutions",
        "trust": "official",
        "priority": 2,
        "region": "India",
        "official": True,
    },
    "ncbi.nlm.nih.gov": {
        "name": "NCBI / National Library of Medicine",
        "category": "Research Organizations",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "pubmed.ncbi.nlm.nih.gov": {
        "name": "PubMed Central",
        "category": "Research Organizations",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },

    # ==================================================================
    # 13. Weather & Climate
    # ==================================================================

    "imd.gov.in": {
        "name": "India Meteorological Department",
        "category": "Weather",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "mausam.imd.gov.in": {
        "name": "Mausam IMD Portal",
        "category": "Weather",
        "trust": "official",
        "priority": 1,
        "region": "India",
        "official": True,
    },
    "weather.gov": {
        "name": "National Weather Service US",
        "category": "Weather",
        "trust": "official",
        "priority": 1,
        "region": "USA",
        "official": True,
    },
    "wmo.int": {
        "name": "World Meteorological Organization",
        "category": "Weather",
        "trust": "official",
        "priority": 1,
        "region": "Global",
        "official": True,
    },
    "metoffice.gov.uk": {
        "name": "UK Met Office",
        "category": "Weather",
        "trust": "official",
        "priority": 1,
        "region": "UK",
        "official": True,
    },
}

# ----------------------------------------------------------------------
# Helper Functions
# ----------------------------------------------------------------------

def extract_domain(url: str) -> str:
    """
    Extract the host domain from a URL or raw domain string.

    Examples
    --------
    https://www.reuters.com/world/news
        -> www.reuters.com

    http://mobile.reuters.com/article/123
        -> mobile.reuters.com

    reuters.com/world
        -> reuters.com
    """
    if not url:
        return ""

    url_str = url.strip()
    if not url_str.startswith(("http://", "https://")):
        url_str = "https://" + url_str

    parsed = urlparse(url_str)
    domain = parsed.netloc.lower()

    # Strip port number if present
    if ":" in domain:
        domain = domain.split(":")[0]

    return domain


def normalize_domain(url: str) -> str:
    """
    Normalize a domain before comparison by stripping common harmless subdomains
    (such as www., m., mobile., news., amp., touch., web.).

    Examples
    --------
    https://www.reuters.com/world
        -> reuters.com

    https://mobile.reuters.com/news
        -> reuters.com

    https://m.bbc.com/news
        -> bbc.com
    """
    domain = extract_domain(url)
    if not domain:
        return ""

    prefixes = (
        "www.",
        "m.",
        "mobile.",
        "news.",
        "amp.",
        "touch.",
        "web.",
    )

    changed = True
    while changed:
        changed = False
        for prefix in prefixes:
            if domain.startswith(prefix):
                domain = domain[len(prefix):]
                changed = True
                break

    return domain


def is_trusted_source(url: str) -> bool:
    """
    Check whether a URL belongs to a trusted source registered in TruthLens.
    Supports exact domain, normalized domain, and parent domain fallback matching.
    """
    domain = normalize_domain(url)
    if not domain:
        return False

    if domain in TRUSTED_SOURCES:
        return True

    # Fallback check for subdomains against registered domains (e.g. factcheck.pib.gov.in -> pib.gov.in)
    parts = domain.split(".")
    for i in range(1, len(parts) - 1):
        parent_domain = ".".join(parts[i:])
        if parent_domain in TRUSTED_SOURCES:
            return True

    return False


def get_source_metadata(url: str) -> Optional[Dict[str, Any]]:
    """
    Return metadata dictionary for a trusted source.
    Supports exact domain, normalized domain, and parent domain fallback.

    Returns None if the domain is not recognized as a trusted source.
    """
    domain = normalize_domain(url)
    if not domain:
        return None

    if domain in TRUSTED_SOURCES:
        return TRUSTED_SOURCES[domain]

    # Fallback check for subdomains (e.g. factcheck.pib.gov.in -> pib.gov.in)
    parts = domain.split(".")
    for i in range(1, len(parts) - 1):
        parent_domain = ".".join(parts[i:])
        if parent_domain in TRUSTED_SOURCES:
            return TRUSTED_SOURCES[parent_domain]

    return None


def get_priority(url: str) -> int:
    """
    Return trust priority integer for evidence ranking.

    Lower integer values represent higher trust/priority (e.g. 1 = Official Gov).
    Unknown or untrusted sources receive the lowest priority (999).
    """
    metadata = get_source_metadata(url)
    if metadata is None:
        return 999

    return int(metadata.get("priority", 999))