#!/usr/bin/env python3
"""Test Yahoo Finance economic calendar data extraction."""

import urllib.request
import gzip
import json
import re
import html

url = "https://finance.yahoo.com/calendar/economic"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
resp = urllib.request.urlopen(req, timeout=15)

raw = resp.read()
try:
    data = gzip.decompress(raw).decode()
except:
    data = raw.decode()

# Yahoo embeds JSON in a data attribute with HTML entity encoding
# Find the economicEvents JSON blob
pattern = r'data-ttl="5">(.*?)</script'
matches = re.findall(pattern, data, re.DOTALL)

for i, m in enumerate(matches):
    if "economicEvents" in m:
        # This is HTML-encoded JSON wrapper
        decoded = html.unescape(m)
        try:
            wrapper = json.loads(decoded)
            body_str = wrapper.get("body", "")
            body = json.loads(body_str)
            events = body["finance"]["result"]["economicEvents"]
            print(f"Found {len(events)} event groups")
            for event_group in events[:2]:
                print(json.dumps(event_group, indent=2)[:600])
                print("---")
            break
        except Exception as e:
            print(f"Parse attempt {i}: {e}")
            print(decoded[:200])
