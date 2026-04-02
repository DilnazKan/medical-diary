import httpx

PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH_URL  = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

async def search_pubmed(query: str, max_results: int = 10) -> list:
    # Step 1: Search for paper IDs
    async with httpx.AsyncClient() as client:
        search_resp = await client.get(PUBMED_SEARCH_URL, params={
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json"
        })
        search_data = search_resp.json()

    ids = search_data.get("esearchresult", {}).get("idlist", [])
    if not ids:
        return []

    # Step 2: Fetch paper details using the IDs
    async with httpx.AsyncClient() as client:
        fetch_resp = await client.get(PUBMED_FETCH_URL, params={
            "db": "pubmed",
            "id": ",".join(ids),
            "retmode": "json"
        })
        fetch_data = fetch_resp.json()

    papers = []
    uids = fetch_data.get("result", {}).get("uids", [])
    for uid in uids:
        paper = fetch_data["result"].get(uid, {})
        papers.append({
            "pubmed_id": uid,
            "title": paper.get("title", ""),
            "authors": [a.get("name", "") for a in paper.get("authors", [])],
            "published_date": paper.get("pubdate", ""),
            "source": paper.get("source", ""),
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{uid}/"
        })

    return papers
