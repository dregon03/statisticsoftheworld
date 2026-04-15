"""SOTW API client."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

import requests

BASE_URL = "https://statisticsoftheworld.com"


class SOTWError(Exception):
    """Raised when the API returns an error."""

    def __init__(self, message: str, status_code: int | None = None):
        super().__init__(message)
        self.status_code = status_code


class SOTW:
    """Client for the Statistics of the World API.

    Args:
        api_key: Optional API key for higher rate limits.
            Get one free at https://statisticsoftheworld.com/pricing
        base_url: Override the default API base URL.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = BASE_URL,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self._session = requests.Session()
        self._session.headers["Accept"] = "application/json"
        if api_key:
            self._session.headers["X-API-Key"] = api_key

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{path}"
        resp = self._session.get(url, params=params, timeout=30)
        if not resp.ok:
            body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
            msg = body.get("error") or body.get("message") or f"HTTP {resp.status_code}"
            raise SOTWError(msg, status_code=resp.status_code)
        return resp.json()

    # ── Endpoints ──────────────────────────────────────────────

    def countries(self) -> Dict[str, Any]:
        """List all 218 countries with metadata.

        Returns:
            dict with ``count`` and ``data`` (list of country dicts).

        Example::

            sotw = SOTW()
            for c in sotw.countries()["data"]:
                print(c["id"], c["name"])
        """
        return self._get("/api/v1/countries")

    def country(self, country_id: str) -> Dict[str, Any]:
        """Get a single country with all latest indicator values.

        Args:
            country_id: ISO-3166 alpha-3 code (e.g. ``"USA"``, ``"CAN"``).

        Returns:
            dict with ``country`` and ``indicators`` list.

        Example::

            data = sotw.country("CAN")
            print(data["country"]["name"])  # Canada
            for ind in data["indicators"]:
                print(ind["id"], ind["value"])
        """
        return self._get(f"/api/v1/countries/{country_id}")

    def indicators(self) -> Dict[str, Any]:
        """List all 490+ indicators with categories and metadata.

        Returns:
            dict with ``count``, optional ``categories``, and ``data``.
        """
        return self._get("/api/v1/indicators")

    def indicator(self, indicator_id: str) -> Dict[str, Any]:
        """Get a single indicator ranked across all countries.

        Args:
            indicator_id: Indicator code (e.g. ``"IMF.NGDPD"``).

        Returns:
            dict with ``indicator``, ``count``, and ``data`` (ranked list).
        """
        return self._get(f"/api/v1/indicators/{indicator_id}")

    def history(self, indicator: str, country: str) -> Dict[str, Any]:
        """Get 20+ years of historical data for an indicator-country pair.

        Args:
            indicator: Indicator code (e.g. ``"IMF.NGDPD"``).
            country: ISO-3 country code (e.g. ``"CAN"``).

        Returns:
            dict with ``indicator``, ``country``, and ``data``
            (list of ``{year, value}`` dicts).

        Example::

            hist = sotw.history("IMF.NGDPD", "CAN")
            for row in hist["data"]:
                print(row["year"], row["value"])
        """
        return self._get(f"/api/v1/history/{indicator}/{country}")

    def rankings(
        self, indicator: str, *, limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get countries ranked by an indicator.

        Args:
            indicator: Indicator code (e.g. ``"SP.POP.TOTL"``).
            limit: Optional max number of results.

        Returns:
            dict with ``indicator``, ``count``, and ``data``
            (list of ``{rank, countryId, country, value}`` dicts).

        Example::

            top10 = sotw.rankings("IMF.NGDPD", limit=10)
            for entry in top10["data"]:
                print(f"#{entry['rank']} {entry['country']}: ${entry['value']:,.0f}")
        """
        params = {"limit": limit} if limit else None
        return self._get(f"/api/v1/rankings/{indicator}", params=params)

    # ── Pandas helpers ─────────────────────────────────────────

    def history_df(self, indicator: str, country: str):
        """Get historical data as a pandas DataFrame.

        Requires ``pip install statisticsoftheworld[pandas]``.

        Returns:
            DataFrame with ``year`` and ``value`` columns.
        """
        import pandas as pd

        data = self.history(indicator, country)
        return pd.DataFrame(data["data"])

    def rankings_df(self, indicator: str, *, limit: Optional[int] = None):
        """Get rankings as a pandas DataFrame.

        Requires ``pip install statisticsoftheworld[pandas]``.

        Returns:
            DataFrame with ``rank``, ``countryId``, ``country``, ``value`` columns.
        """
        import pandas as pd

        data = self.rankings(indicator, limit=limit)
        return pd.DataFrame(data["data"])

    def country_df(self, country_id: str):
        """Get all indicators for a country as a pandas DataFrame.

        Requires ``pip install statisticsoftheworld[pandas]``.

        Returns:
            DataFrame with indicator details and values.
        """
        import pandas as pd

        data = self.country(country_id)
        return pd.DataFrame(data["indicators"])


def create_client(
    api_key: Optional[str] = None,
    base_url: str = BASE_URL,
) -> SOTW:
    """Create a new SOTW client.

    Args:
        api_key: Optional API key for higher rate limits.
        base_url: Override the default API base URL.
    """
    return SOTW(api_key=api_key, base_url=base_url)
