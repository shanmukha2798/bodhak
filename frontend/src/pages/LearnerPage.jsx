import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Columns2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { InstructorCard } from "@/components/InstructorCard";
import { FilterBar } from "@/components/FilterBar";
import { Thinking } from "@/components/AISummary";
import { HowCalculated } from "@/components/ScoreBadge";
import { fetchInstructors, fetchMeta, postMatch } from "@/lib/api";

const EXAMPLES = [
  "I'm a working professional and want to learn data engineering on weekends",
  "I want to build GenAI apps with LLMs and get a job in six months",
  "I'm a fresher who wants to get into cybersecurity with hands-on labs",
];

const MatchReasons = ({ match, reasons }) => (
  <div className="rounded-2xl bg-[#f5f5f7] p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-[#6e6e73]">Why this instructor</span>
      <span className="bk-chip-blue" data-testid="match-percent">{match}% match</span>
    </div>
    <ul className="space-y-1 text-sm text-[#1d1d1f]">
      {reasons.map((r, n) => <li key={n} className="flex gap-2"><span className="text-[#0071e3]">•</span>{r}</li>)}
    </ul>
  </div>
);

export default function LearnerPage() {
  const [goal, setGoal] = useState("");
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [filters, setFilters] = useState({ sort: "score" });
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: fetchMeta });
  const { data: instructors } = useQuery({ queryKey: ["instructors", filters], queryFn: () => fetchInstructors(filters) });

  const findMatches = async (text) => {
    const q = (text ?? goal).trim();
    if (q.length < 3) return toast("Tell us a little more about what you want to learn.");
    setGoal(q);
    setMatching(true);
    try {
      setResult(await postMatch(q));
      setTimeout(() => document.getElementById("ai-matches")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      toast.error("Something went wrong finding your match. Please try again.");
    } finally {
      setMatching(false);
    }
  };

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-14" data-testid="learner-hero">
        <p className="bk-eyebrow mb-4">For learners</p>
        <h1 className="bk-h1 max-w-3xl">Know your teacher before you enrol.</h1>
        <p className="bk-sub mt-5 max-w-2xl">Tell us your goal and we'll match you with the instructors learners actually rate highly, across Udemy, Coursera, upGrad, Great Learning and more.</p>
        <form onSubmit={(e) => { e.preventDefault(); findMatches(); }} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              className="bk-input pl-12 py-4 text-base rounded-full"
              placeholder="Tell us what you want to learn"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              aria-label="Tell us what you want to learn"
              data-testid="goal-input"
            />
          </div>
          <button type="submit" className="bk-btn-primary px-7 py-4 text-base" disabled={matching} data-testid="find-instructor-button">
            <Sparkles className="w-4 h-4" />{matching ? "Finding your match…" : "Find my instructor"}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 max-w-3xl">
          <span className="text-xs text-[#86868b] self-center">Try:</span>
          {EXAMPLES.map((ex, n) => (
            <button key={ex} type="button" onClick={() => findMatches(ex)} className="bk-chip hover:border-[#0071e3] hover:text-[#0071e3] transition-colors text-left" data-testid={`example-prompt-${n}`}>
              {ex}
            </button>
          ))}
        </div>
      </section>

      {(matching || result) && (
        <section id="ai-matches" className="bg-[#f5f5f7] py-14 scroll-mt-20" data-testid="ai-match-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="bk-eyebrow mb-2">AI Match</p>
            <h2 className="bk-h2">Your top 3 instructors</h2>
            <p className="bk-sub mt-2 max-w-2xl">Based on your goal: <span className="text-[#1d1d1f] font-medium">"{goal}"</span></p>
            {matching && <div className="mt-8"><Thinking text="Reading your goal and comparing instructors…" /></div>}
            {!matching && result && (
              <>
                <div className="mt-8 grid md:grid-cols-3 gap-5">
                  {result.matches.map((m, n) => (
                    <InstructorCard key={m.instructor.id} instructor={m.instructor} index={n} extra={<MatchReasons match={m.match} reasons={m.reasons} />} />
                  ))}
                </div>
                <p className="text-xs text-[#86868b] mt-4" data-testid="match-source">
                  {result.source === "ai" ? "Matched by AI using your goal and every instructor's profile and stories." : "Matched using skills and Bodhak Scores."} Click any card to see the full profile.
                </p>
              </>
            )}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="browse-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="bk-eyebrow mb-2">Browse</p>
            <h2 className="bk-h2">Browse all instructors</h2>
            <p className="bk-sub mt-2">Filter by what you want to learn, where, and how experienced you want your teacher to be. <HowCalculated /></p>
          </div>
          <Link to="/compare" className="bk-btn-outline shrink-0" data-testid="compare-instructors-link"><Columns2 className="w-4 h-4" />Compare two instructors</Link>
        </div>
        <FilterBar filters={filters} setFilters={setFilters} meta={meta} resultCount={instructors?.length} />
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="instructor-grid">
          {instructors?.map((i, n) => <InstructorCard key={i.id} instructor={i} index={n} />)}
        </div>
        {instructors && instructors.length === 0 && (
          <div className="bk-card p-8 text-center text-[#6e6e73] mt-6" data-testid="browse-empty">
            No instructors match these filters yet. Try removing a filter or lowering the minimum rating.
          </div>
        )}
      </section>
    </div>
  );
}
