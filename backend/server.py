from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from seed import build_seed, PLATFORMS, avatar  # noqa: E402
from ai import ai_match, ai_platform_search, ai_summary  # noqa: E402

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
app = FastAPI()
api = APIRouter(prefix="/api")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("bodhak")
NO_ID = {"_id": 0}


class Platform(BaseModel):
    name: str
    courses: List[str] = []
    rating: Optional[float] = None


class Batch(BaseModel):
    course: str
    platform: str
    start_date: str
    mode: str


class InstructorIn(BaseModel):
    name: str = Field(min_length=1)
    headline: str = ""
    bio: str = ""
    years_experience: int = 0
    industry_role: str = ""
    category: str = ""
    skills: List[str] = []
    platforms: List[Platform] = []
    batches: List[Batch] = []


class StoryIn(BaseModel):
    learner_name: str = Field(min_length=1)
    course: str = Field(min_length=1)
    platform: str = Field(min_length=1)
    rating: int = Field(ge=1, le=5)
    text: str = Field(min_length=1)


class GoalIn(BaseModel):
    goal: str = Field(min_length=2)


class QueryIn(BaseModel):
    query: str = Field(min_length=2)


async def story_stats():
    pipeline = [{"$group": {"_id": "$instructor_id", "count": {"$sum": 1}, "avg": {"$avg": "$rating"}}}]
    return {d["_id"]: d async for d in db.stories.aggregate(pipeline)}


def decorate(doc, stats):
    s = stats.get(doc["id"])
    doc["bodhak_score"] = round(s["avg"], 1) if s else None
    doc["story_count"] = s["count"] if s else 0
    return doc


async def all_instructors():
    stats = await story_stats()
    docs = await db.instructors.find({}, NO_ID).to_list(500)
    return [decorate(d, stats) for d in docs]


async def get_instructor_or_404(iid):
    doc = await db.instructors.find_one({"id": iid}, NO_ID)
    if not doc:
        raise HTTPException(404, "Instructor not found")
    return decorate(doc, await story_stats())


@api.get("/meta")
async def meta():
    docs = await db.instructors.find({}, {"_id": 0, "skills": 1, "platforms.name": 1, "category": 1}).to_list(500)
    skills = sorted({s for d in docs for s in d["skills"]})
    platforms = sorted({p["name"] for d in docs for p in d["platforms"]} | set(PLATFORMS))
    categories = sorted({d["category"] for d in docs if d.get("category")})
    return {"skills": skills, "platforms": platforms, "categories": categories, "modes": ["Online", "Offline", "Weekend"]}


@api.get("/instructors")
async def list_instructors(skill: Optional[str] = None, platform: Optional[str] = None, min_rating: float = 0,
                           min_years: int = 0, sort: str = "score"):
    docs = await all_instructors()
    if skill:
        docs = [d for d in docs if any(skill.lower() in s.lower() for s in d["skills"]) or skill.lower() in d.get("category", "").lower()]
    if platform:
        docs = [d for d in docs if any(p["name"] == platform for p in d["platforms"])]
    if min_rating:
        docs = [d for d in docs if (d["bodhak_score"] or 0) >= min_rating]
    if min_years:
        docs = [d for d in docs if d["years_experience"] >= min_years]
    keys = {"score": lambda d: (d["bodhak_score"] or 0, d["story_count"]), "years": lambda d: d["years_experience"],
            "stories": lambda d: d["story_count"], "name": lambda d: d["name"]}
    docs.sort(key=keys.get(sort, keys["score"]), reverse=sort != "name")
    return docs


@api.post("/instructors", status_code=201)
async def create_instructor(body: InstructorIn):
    doc = body.model_dump()
    doc.update({"id": str(uuid.uuid4()), "avatar": avatar(body.name), "verified": False,
                "created_at": datetime.now(timezone.utc).isoformat()})
    await db.instructors.insert_one(dict(doc))
    return decorate(doc, {})


@api.put("/instructors/{iid}")
async def update_instructor(iid: str, body: InstructorIn):
    existing = await db.instructors.find_one({"id": iid}, NO_ID)
    if not existing:
        raise HTTPException(404, "Instructor not found")
    update = body.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.instructors.update_one({"id": iid}, {"$set": update})
    return await get_instructor_or_404(iid)


@api.get("/instructors/{iid}")
async def get_instructor(iid: str):
    doc = await get_instructor_or_404(iid)
    stories = await db.stories.find({"instructor_id": iid}, NO_ID).sort("date", -1).to_list(500)
    per_platform = defaultdict(list)
    for s in stories:
        per_platform[s["platform"]].append(s["rating"])
    for p in doc["platforms"]:
        ratings = per_platform.get(p["name"])
        p["rating"] = round(sum(ratings) / len(ratings), 1) if ratings else p.get("rating")
        p["rating_count"] = len(ratings) if ratings else 0
    doc["stories"] = stories
    doc.pop("summary", None)
    return doc


@api.get("/instructors/{iid}/summary")
async def get_summary(iid: str):
    doc = await db.instructors.find_one({"id": iid}, NO_ID)
    if not doc:
        raise HTTPException(404, "Instructor not found")
    stories = await db.stories.find({"instructor_id": iid}, NO_ID).to_list(500)
    cached = doc.get("summary")
    if cached and cached.get("story_count") == len(stories):
        return cached
    if not stories:
        return {"story_count": 0, "source": "none", "strengths": [], "could_be_better": [], "best_suited_for": [], "what_to_improve": []}
    summary, source = await ai_summary(doc, stories)
    summary.update({"story_count": len(stories), "source": source, "generated_at": datetime.now(timezone.utc).isoformat()})
    await db.instructors.update_one({"id": iid}, {"$set": {"summary": summary}})
    return summary


@api.post("/instructors/{iid}/stories", status_code=201)
async def add_story(iid: str, body: StoryIn):
    if not await db.instructors.find_one({"id": iid}):
        raise HTTPException(404, "Instructor not found")
    story = body.model_dump()
    story.update({"id": str(uuid.uuid4()), "instructor_id": iid, "date": datetime.now(timezone.utc).date().isoformat()})
    await db.stories.insert_one(dict(story))
    await db.instructors.update_one({"id": iid}, {"$unset": {"summary": ""}})
    doc = await get_instructor_or_404(iid)
    return {"story": story, "bodhak_score": doc["bodhak_score"], "story_count": doc["story_count"]}


@api.get("/instructors/{iid}/dashboard")
async def dashboard(iid: str):
    doc = await get_instructor_or_404(iid)
    stories = await db.stories.find({"instructor_id": iid}, NO_ID).sort("date", 1).to_list(500)
    by_platform, by_month = defaultdict(list), defaultdict(list)
    for s in stories:
        by_platform[s["platform"]].append(s["rating"])
        by_month[s["date"][:7]].append(s["rating"])
    rating_by_platform = [{"platform": p["name"], "rating": round(sum(by_platform[p["name"]]) / len(by_platform[p["name"]]), 2) if by_platform.get(p["name"]) else 0,
                           "count": len(by_platform.get(p["name"], []))} for p in doc["platforms"]]
    trend = []
    running = []
    for month in sorted(by_month):
        running += by_month[month]
        label = datetime.strptime(month, "%Y-%m").strftime("%b %y")
        trend.append({"month": label, "rating": round(sum(by_month[month]) / len(by_month[month]), 2),
                      "cumulative": round(sum(running) / len(running), 2), "count": len(by_month[month])})
    return {"bodhak_score": doc["bodhak_score"], "story_count": doc["story_count"], "rating_by_platform": rating_by_platform, "trend": trend}


@api.post("/match")
async def match(body: GoalIn):
    results, source = await ai_match(body.goal, await all_instructors())
    return {"source": source, "matches": results}


@api.post("/platform-search")
async def platform_search(body: QueryIn):
    results, source = await ai_platform_search(body.query, await all_instructors())
    return {"source": source, "results": results}


@api.get("/leaderboard")
async def leaderboard(skill: Optional[str] = None):
    docs = await all_instructors()
    if skill and skill != "All skills":
        docs = [d for d in docs if any(skill.lower() in s.lower() for s in d["skills"]) or skill.lower() in d.get("category", "").lower()]
    docs.sort(key=lambda d: (d["bodhak_score"] or 0, d["story_count"], d["years_experience"]), reverse=True)
    return [{"rank": n + 1, **d} for n, d in enumerate(docs)]


@app.on_event("startup")
async def seed_on_first_run():
    if await db.instructors.count_documents({}) == 0:
        instructors, stories = build_seed()
        await db.instructors.insert_many([dict(i) for i in instructors])
        await db.stories.insert_many([dict(s) for s in stories])
        logger.info("Seeded %d instructors and %d stories", len(instructors), len(stories))
    await db.stories.create_index("instructor_id")
    await db.instructors.create_index("id", unique=True)


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
