import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Columns2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar } from "@/components/InstructorCard";
import { HowCalculated } from "@/components/ScoreBadge";
import { fetchInstructor, fetchInstructors } from "@/lib/api";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const RowLabel = ({ children }) => <div className="text-xs font-semibold uppercase tracking-wide text-[#6e6e73] mb-1.5">{children}</div>;

const Column = ({ i, side }) => {
  if (!i) {
    return <div className="bk-card p-8 text-sm text-[#6e6e73] text-center" data-testid={`compare-empty-${side}`}>Pick an instructor above to see their details here.</div>;
  }
  return (
    <div className="bk-card p-6 sm:p-8 space-y-6 fade-in" data-testid={`compare-column-${side}`}>
      <div className="flex items-center gap-4">
        <Avatar src={i.avatar} name={i.name} className="w-16 h-16" />
        <div className="min-w-0">
          <Link to={`/instructor/${i.id}`} className="font-semibold text-lg hover:text-[#0071e3] transition-colors inline-flex items-center gap-1.5" data-testid={`compare-name-${side}`}>
            {i.name}{i.verified && <BadgeCheck className="w-4 h-4 text-[#0071e3]" />}
          </Link>
          <p className="text-sm text-[#86868b] line-clamp-2">{i.headline}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#f5f5f7] p-4">
          <RowLabel>Bodhak Score</RowLabel>
          <div className="text-3xl font-semibold tracking-tight" data-testid={`compare-score-${side}`}>{i.bodhak_score == null ? "–" : i.bodhak_score.toFixed(1)}<span className="text-sm text-[#86868b] font-normal"> / 5</span></div>
          <div className="text-xs text-[#6e6e73]">{i.story_count} {i.story_count === 1 ? "rating" : "ratings"}</div>
        </div>
        <div className="rounded-2xl bg-[#f5f5f7] p-4">
          <RowLabel>Experience</RowLabel>
          <div className="text-3xl font-semibold tracking-tight">{i.years_experience}<span className="text-sm text-[#86868b] font-normal"> yrs</span></div>
          <div className="text-xs text-[#6e6e73] line-clamp-1">{i.industry_role}</div>
        </div>
      </div>
      <div>
        <RowLabel>Skills</RowLabel>
        <div className="flex flex-wrap gap-1.5" data-testid={`compare-skills-${side}`}>{i.skills.map((s) => <span key={s} className="bk-chip">{s}</span>)}</div>
      </div>
      <div>
        <RowLabel>Teaches on</RowLabel>
        <ul className="text-sm space-y-1">{i.platforms.map((p) => <li key={p.name} className="flex justify-between gap-2"><span>{p.name}</span><span className="text-[#6e6e73]">{p.rating ? `${p.rating.toFixed(1)} / 5` : "–"}</span></li>)}</ul>
      </div>
      <div>
        <RowLabel>Upcoming batches</RowLabel>
        {i.batches.length === 0 ? <p className="text-sm text-[#6e6e73]">No upcoming batches announced yet.</p> : (
          <ul className="text-sm space-y-2" data-testid={`compare-batches-${side}`}>
            {i.batches.map((b, n) => (
              <li key={n} className="flex justify-between gap-3">
                <span><span className="font-medium">{b.course}</span><span className="text-[#6e6e73]"> · {b.platform}</span></span>
                <span className="text-right shrink-0 text-[#6e6e73]">{b.start_date ? fmt(b.start_date) : "TBA"} · {b.mode}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const a = params.get("a") || "";
  const b = params.get("b") || "";
  const { data: instructors } = useQuery({ queryKey: ["instructors", { sort: "name" }], queryFn: () => fetchInstructors({ sort: "name" }) });
  const qa = useQuery({ queryKey: ["instructor", a], queryFn: () => fetchInstructor(a), enabled: !!a });
  const qb = useQuery({ queryKey: ["instructor", b], queryFn: () => fetchInstructor(b), enabled: !!b });
  const setSide = (key) => (value) => { const p = new URLSearchParams(params); p.set(key, value); setParams(p); };

  const Picker = ({ value, onChange, exclude, side }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-full h-11 bg-white border-[#d2d2d7]" data-testid={`compare-select-${side}`}><SelectValue placeholder={`Choose instructor ${side.toUpperCase()}`} /></SelectTrigger>
      <SelectContent className="max-h-80">
        {instructors?.filter((i) => i.id !== exclude).map((i) => <SelectItem key={i.id} value={i.id}>{i.name} · {i.headline}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 fade-in" data-testid="compare-page">
      <Link to="/" className="bk-btn-link" data-testid="compare-back-link"><ArrowLeft className="w-4 h-4" />Back to all instructors</Link>
      <div>
        <p className="bk-eyebrow mb-2 inline-flex items-center gap-1.5"><Columns2 className="w-4 h-4" />Compare</p>
        <h1 className="bk-h2 text-3xl sm:text-4xl">Compare two instructors</h1>
        <p className="bk-sub mt-2 max-w-2xl">Pick any two instructors to see their Bodhak Scores, skills and upcoming batches side by side. <HowCalculated testId="compare-how-calculated" /></p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-4"><Picker value={a} onChange={setSide("a")} exclude={b} side="a" /><Column i={qa.data} side="a" /></div>
        <div className="space-y-4"><Picker value={b} onChange={setSide("b")} exclude={a} side="b" /><Column i={qb.data} side="b" /></div>
      </div>
    </div>
  );
}
