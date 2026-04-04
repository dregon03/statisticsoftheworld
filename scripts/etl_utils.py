"""Shared utilities for SOTW ETL scripts."""

import json
import time
import urllib.request

USER_AGENT = "Mozilla/5.0 (StatisticsOfTheWorld ETL)"


def fetch_json(url, retries=3, timeout=60):
    """Fetch JSON from URL with exponential backoff retry."""
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            })
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read())
        except Exception as e:
            if attempt < retries - 1:
                wait = 2 ** attempt
                print(f"  Retry {attempt + 1}/{retries - 1} for {url[:80]}... (waiting {wait}s): {e}")
                time.sleep(wait)
            else:
                raise
