import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Hero } from "@/components/Hero";
import { Avatar } from "@/components/InstructorCard";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Thinking } from "@/components/AISummary";
import { Leaderboard, ShortlistButton, ShortlistPanel } from "@/components/Leaderboard";
import { useShortlist } from "@/hooks/useShortlist";
import { fetchLeaderboard, fetchMeta, postPlatformSearch } from "@/lib/api";

const EXAMPLES = ["Top GenAI instructors with industry experience", "Cloud instructors who can run offline weekend batches", "Beginner-friendly data science mentors"];

export default function PlatformPage() {
  const shortlist = useShortlist();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [skill, setSkill] = useState("All skills");
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: fetchMeta });
  const { data: rows, isLoading } = useQuery({ queryKey: ["leaderboard", skill], queryFn: () => fetchLeaderboard(skill === "All skills" ? "" : skill) });

  const search = async (text) => {
    const q = (text ?? query).trim();
    if (q.length < 3) return toast("Describe the instructor you need in a few words.");
    setQuery(q);
    setSearching(true);
    try {
      setResult(await postPlatformSearch(q));
    } catch {
      toast.error("Something went wrong with the search. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fade-in" data-testid="platform-page">
      <Hero
        icon={Building2}
        badge="For edtech platforms"
        title={<>Find and feature the best instructors <span className="bk-gradient-text">for your programs.</span></>}
        description="Describe who you need in plain English, compare instructors by what their learners say, and build a shortlist."
        bottomPad="pb-16"
        testId="platform-hero"
      >
        <form onSubmit={(e) => { e.preventDefault(); search(); }} className="mt-9 flex flex-col sm:flex-row gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
            <input className="bk-input pl-12 py-4 text-base rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] border-transparent" placeholder="Describe the instructor you need" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Describe the instructor you need" data-testid="platform-query-input" />
          </div>
          <button type="submit" className="bk-btn-primary px-7 py-4 text-base shadow-[0_8px_30px_rgba(0,113,227,0.45)]" disabled={searching} data-testid="platform-search-button"><Sparkles className="w-4 h-4" />{searching ? "Searching…" : "Find instructors"}</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2 max-w-3xl">
          <span className="text-xs text-white/50 self-center">Try:</span>
          {EXAMPLES.map((ex, n) => <button key={ex} type="button" onClick={() => search(ex)} className="bk-chip-dark" data-testid={`platform-example-${n}`}>{ex}</button>)}
        </div>
      </Hero>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          {(searching || result) && (
            <section className="bk-card p-6 sm:p-8" data-testid="platform-results">
              <h2 className="text-lg font-semibold">Ranked for: <span className="text-[#0071e3]">"{query}"</span></h2>
              <p className="text-sm text-[#86868b] mb-5">{result?.source === "ai" ? "Ranked by AI using profiles, skills and learner stories." : "Ranked using skills and Bodhak Scores."}</p>
              {searching && <Thinking text="Comparing instructors against your brief…" />}
              {!searching && result && (
                <ol className="space-y-4">
                  {result.results.map((r, n) => (
                    <li key={r.instructor.id} className="flex flex-col sm:flex-row gap-4 rounded-2xl bg-[#f5f5f7] p-4 fade-up" style={{ animationDelay: `${n * 60}ms` }} data-testid={`platform-result-${r.instructor.id}`}>
                      <div className="text-2xl font-semibold text-[#d2d2d7] w-8 shrink-0">{n + 1}</div>
                      <Avatar src={r.instructor.avatar} name={r.instructor.name} className="w-12 h-12" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/instructor/${r.instructor.id}`} className="font-semibold hover:text-[#0071e3] transition-colors">{r.instructor.name}</Link>
                          <ScoreBadge score={r.instructor.bodhak_score} testId={`result-score-${r.instructor.id}`} />
                          <span className="text-xs text-[#86868b]">{r.instructor.story_count} stories · {r.instructor.years_experience} yrs</span>
                        </div>
                        <p className="text-sm text-[#6e6e73]">{r.instructor.headline}</p>
                        <ul className="mt-2 space-y-1 text-sm">{r.reasons.map((x, k) => <li key={k} className="flex gap-2"><span className="text-[#0071e3]">•</span>{x}</li>)}</ul>
                      </div>
                      <div className="shrink-0 self-start"><ShortlistButton instructor={r.instructor} shortlist={shortlist} /></div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
          <Leaderboard rows={rows || []} skill={skill} setSkill={setSkill} skills={meta?.skills || []} shortlist={shortlist} loading={isLoading} />
        </div>
        <ShortlistPanel shortlist={shortlist} />
      </div>
      </div>
    </div>
  );
}
