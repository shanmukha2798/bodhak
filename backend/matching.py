import hashlib
import math
import os
import re

import httpx

EMBED_MODEL = os.environ.get("GEMINI_EMBED_MODEL", "gemini-embedding-001")
EMBED_DIMS = 768
MODES = ("Online", "Offline", "Weekend")


async def embed_texts(texts, task_type, timeout=30):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{EMBED_MODEL}:batchEmbedContents"
    out = []
    async with httpx.AsyncClient(timeout=timeout) as http:
        for start in range(0, len(texts), 100):
            reqs = [{"model": f"models/{EMBED_MODEL}", "content": {"parts": [{"text": t}]}, "taskType": task_type,
                     "outputDimensionality": EMBED_DIMS} for t in texts[start:start + 100]]
            r = await http.post(url, headers={"x-goog-api-key": key}, json={"requests": reqs})
            r.raise_for_status()
            out += [e["values"] for e in r.json()["embeddings"]]
    return out


def profile_text(i, stories):
    courses = ", ".join(c for p in i["platforms"] for c in p["courses"])
    quotes = " ".join(s["text"][:220] for s in sorted(stories, key=lambda s: s["date"], reverse=True)[:6])
    return (f"{i['name']}. {i['headline']}. {i.get('bio', '')} Role: {i['industry_role']}. Domain: {i.get('domain', '')}. "
            f"Category: {i.get('category', '')}. Skills: {', '.join(i['skills'])}. Courses: {courses}. "
            f"Batch modes: {', '.join(sorted({b['mode'] for b in i['batches']}))}. Learners say: {quotes}")


def text_hash(text):
    return hashlib.sha256(f"{EMBED_MODEL}:{EMBED_DIMS}:{text}".encode()).hexdigest()[:16]


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    na, nb = math.sqrt(sum(x * x for x in a)), math.sqrt(sum(y * y for y in b))
    return dot / (na * nb) if na and nb else 0.0


_DOMAIN_WORDS = {
    "Software & Data": r"software|data|python|java|ai\b|ml\b|machine learning|genai|llm|cloud|devops|cyber|web|app development|analytics|coding|programming",
    "Civil": r"civil|structur|construction|surveying",
    "Mechanical": r"mechanical|cad|manufactur|thermodynamic|cnc",
    "Electronics": r"electronic|embedded|vlsi|iot|pcb|circuit",
    "Architecture": r"architect|urban design|interior",
    "Biomedical": r"biomedical|medical device|clinical|bioinformatic",
    "Management": r"management|product manag|marketing|finance|hr\b|operations|strategy|mba",
}


def rule_constraints(goal, domains):
    g = goal.lower()
    mode = "Weekend" if "weekend" in g else "Offline" if re.search(r"offline|in[- ]person|classroom", g) else "Online" if re.search(r"online|remote", g) else None
    level = "beginner" if re.search(r"fresher|beginner|student|no experience|starting out|from scratch|new to", g) else \
        "working" if re.search(r"working professional|switch|career change|upskill|job", g) else None
    min_years = 7 if re.search(r"senior|experienced|industry expert", g) else None
    domain = next((d for d in domains if re.search(_DOMAIN_WORDS.get(d, re.escape(d.lower())), g)), None)
    return {"mode": mode, "level": level, "min_years": min_years, "domain": domain}


def clean_constraints(raw, domains):
    mode = raw.get("mode") if raw.get("mode") in MODES else None
    level = raw.get("level") if raw.get("level") in ("beginner", "working") else None
    domain = raw.get("domain") if raw.get("domain") in domains else None
    years = raw.get("min_years")
    return {"mode": mode, "level": level, "domain": domain, "min_years": years if isinstance(years, int) and 0 < years <= 30 else None}


def _norm(values):
    lo, hi = min(values), max(values)
    return [(v - lo) / (hi - lo) if hi > lo else 0.5 for v in values]


def hybrid_rank(keyword_ranked, qvec, vectors, constraints):
    """Blend semantic similarity, keyword hits and Bodhak Score, then apply soft constraint bonuses."""
    use_sem = bool(qvec and vectors)
    sem = _norm([cosine(qvec, vectors[i["id"]]) if i["id"] in vectors else 0.0 for _, _, i in keyword_ranked]) if use_sem else [0.0] * len(keyword_ranked)
    kw = _norm([h for _, h, _ in keyword_ranked])
    w_sem, w_kw, w_bk = (0.5, 0.25, 0.15) if use_sem else (0, 0.6, 0.3)
    out = []
    for n, (_, hits, i) in enumerate(keyword_ranked):
        bk = (i.get("bodhak_score") or 3.5) / 5
        bonus = 0.0
        if constraints.get("domain"):
            bonus += 0.15 if i.get("domain") == constraints["domain"] else -0.15
        if constraints.get("mode") and any(b["mode"] == constraints["mode"] for b in i["batches"]):
            bonus += 0.10
        if constraints.get("min_years") and i["years_experience"] >= constraints["min_years"]:
            bonus += 0.05
        out.append((w_sem * sem[n] + w_kw * kw[n] + w_bk * bk + bonus, hits, i))
    out.sort(key=lambda r: r[0], reverse=True)
    return out
