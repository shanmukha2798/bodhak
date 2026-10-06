import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Briefcase, CalendarDays, Lock, PenLine } from "lucide-react";
import { Avatar } from "@/components/InstructorCard";
import { ScoreBadge, HowCalculated, Stars } from "@/components/ScoreBadge";
import { AISummary } from "@/components/AISummary";
import { StoryForm } from "@/components/StoryForm";
import { fetchInstructor, fetchSummary } from "@/lib/api";

const Section = ({ title, hint, children, testId }) => (
  <section className="bk-card p-6 sm:p-8" data-testid={testId}>
    <h2 className="text-lg font-semibold">{title}</h2>
    {hint && <p className="text-sm text-[#86868b] mb-4">{hint}</p>}
    {children}
  </section>
);

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ProfilePage() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [storyOpen, setStoryOpen] = useState(false);
  const { data: i, isLoading, isError } = useQuery({ queryKey: ["instructor", id], queryFn: () => fetchInstructor(id) });
  const { data: summary, isFetching: summaryLoading } = useQuery({ queryKey: ["summary", id], queryFn: () => fetchSummary(id), staleTime: 5 * 60_000 });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["instructor", id] });
    qc.invalidateQueries({ queryKey: ["summary", id] });
    qc.invalidateQueries({ queryKey: ["instructors"] });
    qc.invalidateQueries({ queryKey: ["dashboard", id] });
  };

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-24 text-[#86868b]" data-testid="profile-loading">Loading profile…</div>;
  if (isError || !i) return <div className="max-w-5xl mx-auto px-4 py-24 text-center"><p className="text-[#6e6e73]">We couldn't find this instructor.</p><Link to="/" className="bk-btn-link mt-2">Back to all instructors</Link></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-5 fade-in" data-testid="instructor-profile">
      <Link to="/" className="bk-btn-link" data-testid="back-to-instructors"><ArrowLeft className="w-4 h-4" />Back to all instructors</Link>

      <header className="bk-card p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center" data-testid="profile-header">
        <Avatar src={i.avatar} name={i.name} className="w-24 h-24 sm:w-28 sm:h-28" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" data-testid="profile-name">{i.name}</h1>
            <span className={`bk-chip-blue ${i.verified ? "" : "bg-[#f5f5f7] text-[#6e6e73]"}`} data-testid="verified-badge"><BadgeCheck className="w-3.5 h-3.5" />{i.verified ? "Verified instructor" : "New profile"}</span>
          </div>
          <p className="text-base md:text-lg text-[#6e6e73] mt-1" data-testid="profile-headline">{i.headline}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-[#1d1d1f]">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[#86868b]" />{i.years_experience} years teaching and building</span>
            {i.industry_role && <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[#86868b]" />{i.industry_role}</span>}
          </div>
          {i.bio && <p className="text-sm text-[#6e6e73] mt-3 leading-relaxed max-w-2xl">{i.bio}</p>}
        </div>
        <div className="md:text-right shrink-0" data-testid="profile-score-block">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">Bodhak Score</div>
          <div className="text-5xl font-semibold tracking-tight mt-1" data-testid="profile-score">{i.bodhak_score == null ? "–" : i.bodhak_score.toFixed(1)}<span className="text-xl text-[#86868b] font-normal"> / 5</span></div>
          <div className="text-sm text-[#6e6e73]" data-testid="profile-rating-count">{i.story_count} {i.story_count === 1 ? "rating" : "ratings"}</div>
          <div className="mt-1"><HowCalculated testId="profile-how-calculated" /></div>
          <div className="flex md:justify-end gap-2 mt-4">
            <button className="bk-btn-primary" onClick={() => setStoryOpen(true)} data-testid="share-story-button"><PenLine className="w-4 h-4" />Share your story</button>
          </div>
          <button className="bk-btn-outline mt-2 w-full md:w-auto" disabled data-testid="book-session-button"><Lock className="w-3.5 h-3.5" />Book a 1:1 session (coming soon)</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-5">
        <Section title="Teaches on" hint="Each platform, the courses taught there and how learners rated them." testId="teaches-on-section">
          <ul className="space-y-4">
            {i.platforms.map((p) => (
              <li key={p.name} className="flex items-start justify-between gap-3" data-testid={`platform-row-${p.name}`}>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <ul className="text-sm text-[#6e6e73]">{p.courses.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
                <div className="text-right shrink-0">
                  <ScoreBadge score={p.rating} testId={`platform-score-${p.name}`} />
                  <div className="text-[11px] text-[#86868b] mt-1">{p.rating_count ? `${p.rating_count} ${p.rating_count === 1 ? "story" : "stories"} here` : "platform rating"}</div>
                </div>
              </li>
            ))}
            {i.platforms.length === 0 && <li className="text-sm text-[#6e6e73]">No platforms listed yet.</li>}
          </ul>
        </Section>
        <div className="space-y-5">
          <Section title="Skills" hint="What this instructor teaches." testId="skills-section">
            <div className="flex flex-wrap gap-2">{i.skills.map((s) => <span key={s} className="bk-chip text-sm px-3 py-1.5">{s}</span>)}</div>
          </Section>
          <Section title="Upcoming batches" hint="When and where you can join next." testId="batches-section">
            {i.batches.length === 0 ? <p className="text-sm text-[#6e6e73]">No upcoming batches announced yet.</p> : (
              <ul className="space-y-3">
                {i.batches.map((b, n) => (
                  <li key={n} className="flex items-center justify-between gap-3 text-sm" data-testid={`batch-row-${n}`}>
                    <div><div className="font-medium">{b.course}</div><div className="text-[#6e6e73]">{b.platform}</div></div>
                    <div className="text-right shrink-0"><div>{b.start_date ? fmt(b.start_date) : "Date TBA"}</div><span className="bk-chip">{b.mode}</span></div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>

      <AISummary summary={summary} loading={summaryLoading && !summary} />

      <Section title="Learner stories" hint="Real experiences shared by people who took this instructor's courses." testId="stories-section">
        {i.stories.length === 0 ? (
          <div className="text-sm text-[#6e6e73] bg-[#f5f5f7] rounded-2xl p-5" data-testid="stories-empty">No stories yet. Took a course with {i.name.split(" ")[0]}? Be the first to <button className="bk-btn-link" onClick={() => setStoryOpen(true)}>share your story</button>.</div>
        ) : (
          <ul className="divide-y divide-[#f0f0f2]">
            {i.stories.map((s) => (
              <li key={s.id} className="py-5 first:pt-0 last:pb-0" data-testid={`story-${s.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{s.learner_name}</div>
                  <div className="flex items-center gap-3 text-xs text-[#86868b]"><Stars value={s.rating} testIdPrefix={`story-${s.id}-star`} />{fmt(s.date)}</div>
                </div>
                <div className="text-xs text-[#6e6e73] mt-0.5">{s.course} · {s.platform}</div>
                <p className="text-sm leading-relaxed mt-2">{s.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {storyOpen && <StoryForm instructor={i} open={storyOpen} onOpenChange={setStoryOpen} onSaved={refresh} />}
    </div>
  );
}
