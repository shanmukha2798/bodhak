import json
import logging
import os
import re

import httpx

log = logging.getLogger("bodhak.ai")
SYSTEM = "You are Bodhak, a plain-English assistant that helps people pick instructors. Reply with valid JSON only, no prose, no markdown fences."


def _parse(text):
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.M).strip()
    start = min([i for i in (text.find("{"), text.find("[")) if i >= 0])
    end = max(text.rfind("}"), text.rfind("]"))
    return json.loads(text[start:end + 1])


async def llm_json(prompt, timeout=45):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY missing")
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "thinkingConfig": {"thinkingBudget": 0}},
    }
    async with httpx.AsyncClient(timeout=timeout) as http:
        r = await http.post(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                            headers={"x-goog-api-key": key}, json=body)
        r.raise_for_status()
    return _parse(r.json()["candidates"][0]["content"]["parts"][0]["text"])


def compact(i):
    return {
        "id": i["id"], "name": i["name"], "headline": i["headline"], "skills": i["skills"], "years": i["years_experience"],
        "industry_role": i["industry_role"], "bodhak_score": i.get("bodhak_score"), "stories": i.get("story_count", 0),
        "platforms": [p["name"] for p in i["platforms"]],
        "courses": [c for p in i["platforms"] for c in p["courses"]],
        "batch_modes": sorted({b["mode"] for b in i["batches"]}),
    }


def _tokens(text):
    stop = {"i", "a", "an", "the", "and", "to", "on", "in", "for", "of", "with", "want", "learn", "am", "my", "me", "is", "who", "that", "need", "top", "best", "instructor", "instructors", "course", "courses"}
    return [t for t in re.findall(r"[a-z0-9+#.]+", text.lower()) if t not in stop and len(t) > 1]


def keyword_rank(query, instructors):
    toks = _tokens(query)
    ranked = []
    for i in instructors:
        hay_skills = " ".join(i["skills"]).lower() + " " + i.get("category", "").lower()
        hay_head = (i["headline"] + " " + i.get("bio", "") + " " + i["industry_role"]).lower()
        hay_courses = " ".join(c for p in i["platforms"] for c in p["courses"]).lower()
        hits = 0
        for t in toks:
            if t in hay_skills:
                hits += 3
            if t in hay_head:
                hits += 2
            if t in hay_courses:
                hits += 1
        if "weekend" in toks and any(b["mode"] == "Weekend" for b in i["batches"]):
            hits += 2
        if any(t in ("industry", "experience", "experienced", "senior") for t in toks):
            hits += min(i["years_experience"] / 5, 2)
        score = hits + (i.get("bodhak_score") or 3.5) * 0.6 + min(i.get("story_count", 0), 6) * 0.1
        ranked.append((score, hits, i))
    ranked.sort(key=lambda r: r[0], reverse=True)
    return ranked


def fallback_reasons(i, query, hits):
    toks = set(_tokens(query))
    matched = [s for s in i["skills"] if any(t in s.lower() for t in toks)][:2]
    reasons = []
    if matched:
        reasons.append(f"Teaches {' and '.join(matched)}, which is exactly what you asked for")
    reasons.append(f"Rated {i.get('bodhak_score') or '–'} by {i.get('story_count', 0)} learners across {', '.join(p['name'] for p in i['platforms'])}")
    weekend = next((b for b in i["batches"] if b["mode"] == "Weekend"), None)
    if weekend and "weekend" in toks:
        reasons.append(f"Weekend batch of {weekend['course']} starts {weekend['start_date']}")
    else:
        reasons.append(f"{i['years_experience']} years in industry as {i['industry_role']}")
    return reasons[:3]


def fallback_match(query, instructors, n=3):
    ranked = keyword_rank(query, instructors)
    top = ranked[:n]
    best = top[0][0] if top else 1
    out = []
    for rank, (score, hits, i) in enumerate(top):
        pct = int(max(62, min(96, 96 - rank * 6 - (best - score) * 4)))
        out.append({"instructor": i, "match": pct, "reasons": fallback_reasons(i, query, hits)})
    return out


async def ai_match(goal, instructors):
    candidates = [c[2] for c in keyword_rank(goal, instructors)[:10]]
    try:
        prompt = (
            f"A learner says: \"{goal}\"\n\nHere are candidate instructors as JSON:\n{json.dumps([compact(c) for c in candidates])}\n\n"
            "Pick the 3 best matches. Return JSON: {\"matches\":[{\"id\":str,\"match\":int (50-99, how well they fit the goal),"
            "\"reasons\":[2 or 3 short plain-English sentences under 15 words each, addressing the learner as 'you', each starting 'Why this instructor' is implied so do not repeat it]}]}"
        )
        data = await llm_json(prompt)
        by_id = {c["id"]: c for c in candidates}
        out = [{"instructor": by_id[m["id"]], "match": int(m["match"]), "reasons": list(m["reasons"])[:3]}
               for m in data["matches"] if m.get("id") in by_id][:3]
        if len(out) < 3:
            seen = {o["instructor"]["id"] for o in out}
            out += [f for f in fallback_match(goal, instructors, 6) if f["instructor"]["id"] not in seen][:3 - len(out)]
        return out, "ai"
    except Exception as e:
        log.warning("ai_match fallback: %s", e)
        return fallback_match(goal, instructors), "fallback"


async def ai_platform_search(query, instructors):
    candidates = [c[2] for c in keyword_rank(query, instructors)[:12]]
    try:
        prompt = (
            f"An edtech platform is hiring and describes who they need: \"{query}\"\n\nCandidate instructors as JSON:\n{json.dumps([compact(c) for c in candidates])}\n\n"
            "Rank the 5 most suitable. Return JSON: {\"results\":[{\"id\":str,\"reasons\":[2 short plain-English sentences under 15 words each explaining the fit]}]} in rank order."
        )
        data = await llm_json(prompt)
        by_id = {c["id"]: c for c in candidates}
        out = [{"instructor": by_id[r["id"]], "reasons": list(r["reasons"])[:3]} for r in data["results"] if r.get("id") in by_id][:5]
        if out:
            return out, "ai"
        raise ValueError("empty results")
    except Exception as e:
        log.warning("platform search fallback: %s", e)
        return [{"instructor": f["instructor"], "reasons": f["reasons"]} for f in fallback_match(query, instructors, 5)], "fallback"


def fallback_answer(i, stories, question):
    toks = set(_tokens(question))
    n = len(stories)
    avg = round(sum(s["rating"] for s in stories) / n, 1) if n else None
    scored = sorted(stories, key=lambda s: sum(1 for t in toks if t in s["text"].lower()), reverse=True)
    hits = [s for s in scored[:2] if any(t in s["text"].lower() for t in toks)]
    intro = f"Across {n} learner stories, {i['name'].split()[0]} is rated {avg} out of 5." if n else "There are no learner stories yet for this instructor."
    if hits:
        quotes = " ".join(f"One learner from {s['course']} on {s['platform']} said: \"{s['text']}\"" for s in hits)
        return f"{intro} {quotes}"
    return f"{intro} Learners have not said anything specific about that yet, so it is worth asking the instructor directly before enrolling."


async def ai_answer(i, stories, question):
    try:
        prompt = (
            f"Instructor: {i['name']}, {i['headline']}. {i['years_experience']} years, {i['industry_role']}. Skills: {', '.join(i['skills'])}. "
            f"Upcoming batches: {json.dumps(i.get('batches', []))}.\n"
            f"Learner stories (rating out of 5):\n{json.dumps([{'rating': s['rating'], 'course': s['course'], 'platform': s['platform'], 'text': s['text']} for s in stories])}\n\n"
            f"A prospective learner asks: \"{question}\"\n"
            "Answer honestly in plain English, under 80 words, using only the profile and stories above. If the stories do not cover it, say so plainly. "
            "Return JSON: {\"answer\": str}"
        )
        data = await llm_json(prompt)
        answer = str(data.get("answer", "")).strip()
        if not answer:
            raise ValueError("empty answer")
        return answer, "ai"
    except Exception as e:
        log.warning("ask fallback: %s", e)
        return fallback_answer(i, stories, question), "fallback"


def fallback_summary(i, stories):
    n = len(stories)
    avg = round(sum(s["rating"] for s in stories) / n, 1) if n else None
    low = [s for s in stories if s["rating"] <= 3]
    return {
        "strengths": [
            f"Rated {avg} out of 5 across {n} learner stories" if avg else "No ratings yet",
            f"Strong on {', '.join(i['skills'][:3])}",
            f"Brings {i['years_experience']} years of industry experience as {i['industry_role']}",
        ],
        "could_be_better": [
            "Some learners found the pace fast in later weeks" if low else "Learners mention very little to improve",
            "A few asked for more interview-style practice",
        ],
        "best_suited_for": [
            f"Working professionals who want hands-on {i.get('category', 'technical')} skills",
            "Learners who like real production examples over slides",
        ],
        "what_to_improve": [
            "Share a weekly plan so learners can pace themselves",
            "Add short interview-practice sessions near the end",
            "Publish lab setup checklists before each session",
        ],
    }


async def ai_summary(i, stories):
    try:
        prompt = (
            f"Instructor: {i['name']}, {i['headline']}. Skills: {', '.join(i['skills'])}.\n"
            f"Learner stories (rating out of 5):\n{json.dumps([{'rating': s['rating'], 'course': s['course'], 'platform': s['platform'], 'text': s['text']} for s in stories])}\n\n"
            "Summarise honestly for a prospective learner. Return JSON: {\"strengths\":[3 short plain-English points],"
            "\"could_be_better\":[2 or 3 short points],\"best_suited_for\":[2 short points describing the ideal learner],"
            "\"what_to_improve\":[3 concrete, kind suggestions addressed to the instructor as 'you']}. Each point under 18 words."
        )
        data = await llm_json(prompt, timeout=60)
        out = {k: [str(x) for x in data.get(k, [])] for k in ("strengths", "could_be_better", "best_suited_for", "what_to_improve")}
        if not out["strengths"]:
            raise ValueError("empty summary")
        return out, "ai"
    except Exception as e:
        log.warning("summary fallback: %s", e)
        return fallback_summary(i, stories), "fallback"
