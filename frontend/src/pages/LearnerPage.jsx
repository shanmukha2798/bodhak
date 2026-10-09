import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Columns2, MessageSquareText, Search, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { InstructorCard } from "@/components/InstructorCard";
import { FilterBar } from "@/components/FilterBar";
import { Thinking } from "@/components/AISummary";
import { Hero } from "@/components/Hero";
import { HowCalculated } from "@/components/ScoreBadge";
import { fetchInstructors, fetchMeta, postMatch } from "@/lib/api";

const EXAMPLES = [
  "I'm a working professional and want to learn data engineering on weekends",
  "I want to build GenAI apps with LLMs and get a job in six months",
  "I'm a fresher who wants to get into cybersecurity with hands-on labs",
];

const STEPS = [
  { icon: Search, title: "Tell us your goal", text: "Describe what you want to learn in plain English." },
  { icon: Star, title: "See who learners rate", text: "Every instructor has a Bodhak Score built from real learner stories." },
  { icon: MessageSquareText, title: "Decide with confidence", text: "Compare teachers side by side before you enrol." },
];

const CountUp = ({ value = 0 }) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 900, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
};

const UNDERSTOOD_LABELS = {
  mode: (v) => `Format: ${v}`,
  level: (v) => `Level: ${v === "working" ? "working professional" : v}`,
  domain: (v) => `Domain: ${v}`,
  min_years: (v) => `Experience: ${v}+ yrs`,
};

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
  const { data: everyone } = useQuery({ queryKey: ["instructors", { sort: "score" }], queryFn: () => fetchInstructors({ sort: "score" }) });
  const stats = [
    { label: "Instructors", value: everyone?.length },
    { label: "Learner stories", value: everyone?.reduce((a, i) => a + i.story_count, 0) },
    { label: "Domains", value: meta?.domains?.length },
    { label: "Platforms", value: meta?.platforms?.length },
  ];

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
      <Hero
        icon={Sparkles}
        badge="For learners"
        title={<>Know your teacher <span className="bk-gradient-text">before you enrol.</span></>}
        description="Tell us your goal and we'll match you with the instructors learners actually rate highly, across Udemy, Coursera, upGrad, Great Learning and more."
        testId="learner-hero"
      >
          <form onSubmit={(e) => { e.preventDefault(); findMatches(); }} className="mt-9 flex flex-col sm:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#86868b] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                className="bk-input pl-12 py-4 text-base rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.25)] border-transparent"
                placeholder="Tell us what you want to learn"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                aria-label="Tell us what you want to learn"
                data-testid="goal-input"
              />
            </div>
            <button type="submit" className="bk-btn-primary px-7 py-4 text-base shadow-[0_8px_30px_rgba(0,113,227,0.45)]" disabled={matching} data-testid="find-instructor-button">
              <Sparkles className="w-4 h-4" />{matching ? "Finding your match…" : "Find my instructor"}
            </button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2 max-w-3xl">
            <span className="text-xs text-white/50 self-center">Try:</span>
            {EXAMPLES.map((ex, n) => (
              <button key={ex} type="button" onClick={() => findMatches(ex)} className="bk-chip-dark text-left" data-testid={`example-prompt-${n}`}>
                {ex}
              </button>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8" data-testid="hero-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-wider text-white/50">{s.label}</dt>
                <dd className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight">{s.value != null ? <CountUp value={s.value} /> : "–"}</dd>
              </div>
            ))}
          </dl>
      </Hero>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" data-testid="how-it-works">
        <p className="bk-eyebrow mb-2">How it works</p>
        <h2 className="bk-h2">Three steps to the right teacher</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, text }, n) => (
            <div key={title} className="bk-card p-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#e8f2ff] text-[#0071e3] inline-flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                <span className="text-xs font-semibold text-[#86868b]">STEP {n + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-[#1d1d1f]">{title}</h3>
              <p className="mt-1 text-sm text-[#6e6e73] leading-relaxed">{text}</p>
            </div>
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
            {!matching && result?.understood && Object.keys(result.understood).length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="understood-chips">
                <span className="text-xs text-[#86868b]">We understood:</span>
                {Object.entries(result.understood).map(([k, v]) => UNDERSTOOD_LABELS[k] && <span key={k} className="bk-chip-blue">{UNDERSTOOD_LABELS[k](v)}</span>)}
              </div>
            )}
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
