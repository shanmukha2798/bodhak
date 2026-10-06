import { Link } from "react-router-dom";
import { Check, Plus, X, Trophy } from "lucide-react";
import { Avatar } from "@/components/InstructorCard";
import { ScoreBadge, HowCalculated } from "@/components/ScoreBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ShortlistButton = ({ instructor, shortlist, size = "sm" }) => {
  const added = shortlist.has(instructor.id);
  return (
    <button
      type="button"
      onClick={() => (added ? shortlist.remove(instructor.id) : shortlist.add(instructor))}
      className={`${added ? "bk-btn-secondary" : "bk-btn-outline"} ${size === "sm" ? "px-3 py-1.5 text-xs" : ""}`}
      data-testid={`shortlist-toggle-${instructor.id}`}
    >
      {added ? <><Check className="w-3.5 h-3.5" />Shortlisted</> : <><Plus className="w-3.5 h-3.5" />Add to shortlist</>}
    </button>
  );
};

export const Leaderboard = ({ rows, skill, setSkill, skills, shortlist, loading }) => (
  <section className="bk-card p-6 sm:p-8" data-testid="leaderboard">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-lg font-semibold inline-flex items-center gap-2"><Trophy className="w-5 h-5 text-[#0071e3]" />Leaderboard by skill</h2>
        <p className="text-sm text-[#86868b]">Instructors ranked by Bodhak Score for the skill you pick. <HowCalculated testId="leaderboard-how-calculated" /></p>
      </div>
      <Select value={skill} onValueChange={setSkill}>
        <SelectTrigger className="rounded-full h-10 w-full sm:w-64 bg-white border-[#d2d2d7]" data-testid="leaderboard-skill-select"><SelectValue /></SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value="All skills">All skills</SelectItem>
          {skills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className="overflow-x-auto -mx-6 sm:mx-0">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-[#6e6e73] border-b border-[#e5e5ea]">
            <th className="py-2 pl-6 sm:pl-0 pr-2 font-semibold">Rank</th>
            <th className="py-2 pr-2 font-semibold">Instructor</th>
            <th className="py-2 pr-2 font-semibold">Bodhak Score</th>
            <th className="py-2 pr-2 font-semibold">Stories</th>
            <th className="py-2 pr-2 font-semibold">Platforms</th>
            <th className="py-2 pr-2 font-semibold">Experience</th>
            <th className="py-2 pr-6 sm:pr-0" />
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={7} className="py-6 text-center text-[#86868b]">Loading leaderboard…</td></tr>}
          {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-[#86868b]" data-testid="leaderboard-empty">No instructors teach this skill yet. Try another skill.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[#f0f0f2] hover:bg-[#fafafa] transition-colors" data-testid={`leaderboard-row-${r.id}`}>
              <td className="py-3 pl-6 sm:pl-0 pr-2 font-semibold text-[#6e6e73]">#{r.rank}</td>
              <td className="py-3 pr-2">
                <Link to={`/instructor/${r.id}`} className="flex items-center gap-3 hover:text-[#0071e3] transition-colors" data-testid={`leaderboard-link-${r.id}`}>
                  <Avatar src={r.avatar} name={r.name} className="w-9 h-9" />
                  <span><span className="font-semibold block">{r.name}</span><span className="text-xs text-[#86868b] line-clamp-1">{r.headline}</span></span>
                </Link>
              </td>
              <td className="py-3 pr-2"><ScoreBadge score={r.bodhak_score} testId={`leaderboard-score-${r.id}`} /></td>
              <td className="py-3 pr-2">{r.story_count}</td>
              <td className="py-3 pr-2"><div className="flex flex-wrap gap-1">{r.platforms.map((p) => <span key={p.name} className="bk-chip">{p.name}</span>)}</div></td>
              <td className="py-3 pr-2 whitespace-nowrap">{r.years_experience} yrs</td>
              <td className="py-3 pr-6 sm:pr-0 text-right"><ShortlistButton instructor={r} shortlist={shortlist} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export const ShortlistPanel = ({ shortlist }) => (
  <aside className="bk-card p-6 lg:sticky lg:top-24" data-testid="shortlist-panel">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-lg font-semibold">My shortlist</h2>
      {shortlist.items.length > 0 && <button className="bk-btn-link text-xs" onClick={shortlist.clear} data-testid="shortlist-clear-button">Clear all</button>}
    </div>
    <p className="text-sm text-[#86868b] mb-4">Instructors you've saved to reach out to. Stored on this device only.</p>
    {shortlist.items.length === 0 ? (
      <p className="text-sm text-[#6e6e73] bg-[#f5f5f7] rounded-2xl p-4" data-testid="shortlist-empty">Your shortlist is empty. Click "Add to shortlist" next to any instructor to save them here.</p>
    ) : (
      <ul className="space-y-3">
        {shortlist.items.map((i) => (
          <li key={i.id} className="flex items-center gap-3" data-testid={`shortlist-item-${i.id}`}>
            <Avatar src={i.avatar} name={i.name} className="w-9 h-9" />
            <Link to={`/instructor/${i.id}`} className="flex-1 min-w-0 hover:text-[#0071e3] transition-colors">
              <span className="font-semibold text-sm block truncate">{i.name}</span>
              <span className="text-xs text-[#86868b]">Score {i.bodhak_score?.toFixed(1) ?? "–"} · {i.story_count} stories</span>
            </Link>
            <button aria-label={`Remove ${i.name} from shortlist`} className="p-1.5 text-[#86868b] hover:text-red-500 transition-colors" onClick={() => shortlist.remove(i.id)} data-testid={`shortlist-remove-${i.id}`}><X className="w-4 h-4" /></button>
          </li>
        ))}
      </ul>
    )}
  </aside>
);
