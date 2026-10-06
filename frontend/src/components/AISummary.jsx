import { Sparkles, ThumbsUp, Wrench, UserCheck, Lightbulb } from "lucide-react";

const Block = ({ icon: Icon, title, items, tone, testId }) => (
  <div className="flex-1 min-w-[200px]" data-testid={testId}>
    <div className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-2 ${tone}`}><Icon className="w-4 h-4" />{title}</div>
    <ul className="space-y-1.5 text-sm text-[#1d1d1f] leading-relaxed">
      {items.map((t, n) => <li key={n} className="flex gap-2"><span className="text-[#d2d2d7]">•</span><span>{t}</span></li>)}
    </ul>
  </div>
);

export const Thinking = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-[#6e6e73]" data-testid="ai-loading">
    <span className="flex gap-1">
      {[0, 1, 2].map((n) => <span key={n} className="w-1.5 h-1.5 rounded-full bg-[#0071e3] pulse-dot" style={{ animationDelay: `${n * 0.2}s` }} />)}
    </span>
    {text}
  </div>
);

export const AISummary = ({ summary, loading, showImprove = false, title = "What learners say, in short" }) => (
  <section className="bk-card p-6 sm:p-8" data-testid="ai-summary">
    <div className="flex items-center justify-between gap-3 mb-1">
      <h2 className="text-lg font-semibold text-[#1d1d1f] inline-flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#0071e3]" />{title}</h2>
      {summary?.source && <span className="text-[11px] text-[#86868b]">{summary.source === "ai" ? "AI summary of all stories" : "Summary based on ratings"}</span>}
    </div>
    <p className="text-sm text-[#86868b] mb-5">A short, balanced read of every learner story so you don't have to go through them all.</p>
    {loading && <Thinking text="Reading learner stories and summarising…" />}
    {!loading && summary && summary.story_count === 0 && (
      <p className="text-sm text-[#6e6e73]" data-testid="ai-summary-empty">No learner stories yet. Be the first to share one and a summary will appear here.</p>
    )}
    {!loading && summary && summary.story_count > 0 && (
      <div className="flex flex-col md:flex-row gap-6 fade-in">
        <Block icon={ThumbsUp} title="Strengths" items={summary.strengths} tone="text-[#34c759]" testId="summary-strengths" />
        <Block icon={Wrench} title="Could be better" items={summary.could_be_better} tone="text-[#ff9500]" testId="summary-could-be-better" />
        <Block icon={UserCheck} title="Best suited for" items={summary.best_suited_for} tone="text-[#0071e3]" testId="summary-best-suited" />
        {showImprove && <Block icon={Lightbulb} title="What to improve" items={summary.what_to_improve} tone="text-[#af52de]" testId="summary-what-to-improve" />}
      </div>
    )}
  </section>
);
