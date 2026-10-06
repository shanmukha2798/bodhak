"""Backend API tests for Bodhak."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read from frontend env file
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ---------- meta & instructors list ----------
def test_meta(s):
    r = s.get(f"{API}/meta", timeout=15)
    assert r.status_code == 200
    data = r.json()
    for k in ("skills", "platforms", "categories"):
        assert k in data and isinstance(data[k], list) and len(data[k]) > 0


def test_list_instructors_count_and_fields(s):
    r = s.get(f"{API}/instructors", timeout=15)
    assert r.status_code == 200
    docs = r.json()
    assert len(docs) == 24
    for d in docs:
        assert "bodhak_score" in d and "story_count" in d
        assert "name" in d and "skills" in d and "platforms" in d


def test_list_instructors_filters_and_sort(s):
    r = s.get(f"{API}/instructors", params={"skill": "Kafka"}, timeout=15)
    assert r.status_code == 200
    assert all(any("kafka" in sk.lower() for sk in d["skills"]) or "kafka" in d.get("category","").lower() for d in r.json())
    r = s.get(f"{API}/instructors", params={"platform": "Udemy"}, timeout=15)
    assert all(any(p["name"] == "Udemy" for p in d["platforms"]) for d in r.json())
    r = s.get(f"{API}/instructors", params={"min_rating": 4.5}, timeout=15)
    assert all((d["bodhak_score"] or 0) >= 4.5 for d in r.json())
    r = s.get(f"{API}/instructors", params={"min_years": 10}, timeout=15)
    assert all(d["years_experience"] >= 10 for d in r.json())
    r = s.get(f"{API}/instructors", params={"sort": "name"}, timeout=15)
    names = [d["name"] for d in r.json()]
    assert names == sorted(names)
    r = s.get(f"{API}/instructors", params={"sort": "years"}, timeout=15)
    yrs = [d["years_experience"] for d in r.json()]
    assert yrs == sorted(yrs, reverse=True)


# ---------- instructor details ----------
@pytest.fixture(scope="session")
def sample_id(s):
    r = s.get(f"{API}/instructors", timeout=15)
    return r.json()[0]["id"]


def test_get_instructor(s, sample_id):
    r = s.get(f"{API}/instructors/{sample_id}", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert "stories" in d and isinstance(d["stories"], list)
    assert "platforms" in d
    for p in d["platforms"]:
        assert "rating" in p and "rating_count" in p
    assert "batches" in d


def test_get_instructor_404(s):
    r = s.get(f"{API}/instructors/does-not-exist", timeout=15)
    assert r.status_code == 404


# ---------- summary ----------
def test_summary_and_cache(s, sample_id):
    r = s.get(f"{API}/instructors/{sample_id}/summary", timeout=90)
    assert r.status_code == 200
    data = r.json()
    for k in ("strengths", "could_be_better", "best_suited_for", "what_to_improve"):
        assert k in data
    assert data.get("source") in ("ai", "fallback", "none")
    assert "story_count" in data
    # Second call: should be cached and fast
    t0 = time.time()
    r2 = s.get(f"{API}/instructors/{sample_id}/summary", timeout=15)
    dt = time.time() - t0
    assert r2.status_code == 200
    assert dt < 5, f"Cached summary too slow: {dt}s"


# ---------- stories ----------
def test_create_story_invalid_rating(s, sample_id):
    r = s.post(f"{API}/instructors/{sample_id}/stories", json={
        "learner_name": "TEST_User", "course": "X", "platform": "Udemy", "rating": 9, "text": "nope"
    }, timeout=15)
    assert r.status_code == 422


def test_create_story_and_cache_invalidation(s, sample_id):
    # ensure summary cached
    r0 = s.get(f"{API}/instructors/{sample_id}/summary", timeout=90)
    prev_count = r0.json().get("story_count", 0)

    r = s.post(f"{API}/instructors/{sample_id}/stories", json={
        "learner_name": "TEST_Learner", "course": "Test Course",
        "platform": "Udemy", "rating": 5, "text": "Great teacher, loved it."
    }, timeout=15)
    assert r.status_code == 201
    body = r.json()
    assert body["story"]["rating"] == 5
    assert body["story_count"] == prev_count + 1
    assert body["bodhak_score"] is not None

    r2 = s.get(f"{API}/instructors/{sample_id}/summary", timeout=90)
    assert r2.status_code == 200
    assert r2.json()["story_count"] == prev_count + 1


# ---------- dashboard ----------
def test_dashboard(s, sample_id):
    r = s.get(f"{API}/instructors/{sample_id}/dashboard", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d["rating_by_platform"], list)
    assert isinstance(d["trend"], list)
    for row in d["rating_by_platform"]:
        assert "platform" in row and "rating" in row
    for row in d["trend"]:
        assert "month" in row and "rating" in row and "cumulative" in row


# ---------- AI endpoints ----------
def test_match(s):
    r = s.post(f"{API}/match", json={"goal": "I want to learn Kafka on weekends"}, timeout=60)
    assert r.status_code == 200
    body = r.json()
    assert body["source"] in ("ai", "fallback")
    assert len(body["matches"]) == 3
    for m in body["matches"]:
        assert "instructor" in m
        assert isinstance(m["match"], int)
        assert 2 <= len(m["reasons"]) <= 3


def test_platform_search(s):
    r = s.post(f"{API}/platform-search", json={"query": "senior data engineer who can teach Spark"}, timeout=60)
    assert r.status_code == 200
    body = r.json()
    assert body["source"] in ("ai", "fallback")
    assert 1 <= len(body["results"]) <= 5
    for res in body["results"]:
        assert "instructor" in res and "reasons" in res


# ---------- leaderboard ----------
def test_leaderboard(s):
    r = s.get(f"{API}/leaderboard", timeout=15)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 24
    scores = [row["bodhak_score"] or 0 for row in rows]
    assert scores == sorted(scores, reverse=True)
    assert rows[0]["rank"] == 1

    r2 = s.get(f"{API}/leaderboard", params={"skill": "Kafka"}, timeout=15)
    assert r2.status_code == 200
    assert all(any("kafka" in sk.lower() for sk in d["skills"]) for d in r2.json())


# ---------- create/update instructor ----------
def test_create_and_update_instructor(s):
    payload = {
        "name": "TEST_Instructor", "headline": "Test headline",
        "bio": "", "years_experience": 5, "industry_role": "Tester",
        "category": "Data Engineering", "skills": ["SQL"],
        "platforms": [{"name": "Udemy", "courses": ["Test Course"], "rating": 4.5}],
        "batches": [],
    }
    r = s.post(f"{API}/instructors", json=payload, timeout=15)
    assert r.status_code == 201
    created = r.json()
    assert created["verified"] is False
    iid = created["id"]

    upd = {**payload, "headline": "Updated headline"}
    r2 = s.put(f"{API}/instructors/{iid}", json=upd, timeout=15)
    assert r2.status_code == 200
    assert r2.json()["headline"] == "Updated headline"

    r3 = s.get(f"{API}/instructors/{iid}", timeout=15)
    assert r3.status_code == 200
    assert r3.json()["headline"] == "Updated headline"
