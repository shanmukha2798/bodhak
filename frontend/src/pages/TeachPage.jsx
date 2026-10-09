import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, GraduationCap, UserPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hero } from "@/components/Hero";
import { ProfileForm } from "@/components/ProfileForm";
import { Dashboard } from "@/components/Dashboard";
import { AISummary } from "@/components/AISummary";
import { fetchDashboard, fetchInstructors, fetchMeta, fetchSummary } from "@/lib/api";

export default function TeachPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const { data: instructors } = useQuery({ queryKey: ["instructors", { sort: "name" }], queryFn: () => fetchInstructors({ sort: "name" }) });
  const { data: meta } = useQuery({ queryKey: ["meta"], queryFn: fetchMeta });
  const creating = selectedId === "new";
  const current = !creating && instructors?.find((i) => i.id === selectedId);
  const { data: dashboard } = useQuery({ queryKey: ["dashboard", selectedId], queryFn: () => fetchDashboard(selectedId), enabled: !!current });
  const { data: summary, isFetching: summaryLoading } = useQuery({ queryKey: ["summary", selectedId], queryFn: () => fetchSummary(selectedId), enabled: !!current, staleTime: 5 * 60_000 });

  useEffect(() => {
    if (!selectedId && instructors?.length) setSelectedId(instructors[0].id);
  }, [instructors, selectedId]);

  const onSaved = (saved) => {
    qc.invalidateQueries({ queryKey: ["instructors"] });
    qc.invalidateQueries({ queryKey: ["instructor", saved.id] });
    qc.invalidateQueries({ queryKey: ["meta"] });
    setSelectedId(saved.id);
  };

  return (
    <div className="fade-in" data-testid="teach-page">
      <Hero
        icon={GraduationCap}
        badge="For instructors"
        title={<>Build your teaching profile once. <span className="bk-gradient-text">Carry it everywhere.</span></>}
        description="One profile and one reputation across every platform you teach on. Pick a profile to see what it looks like, or create your own."
        bottomPad="pb-20"
        testId="teach-hero"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20 -mt-10 relative space-y-8">
      <div className="bk-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4" data-testid="view-as-bar">
        <div className="flex-1">
          <span className="bk-label">View as</span>
          <Select value={creating ? "new" : selectedId || ""} onValueChange={setSelectedId}>
            <SelectTrigger className="rounded-full h-11 bg-white border-[#d2d2d7] sm:max-w-md" data-testid="view-as-select"><SelectValue placeholder="Pick an instructor to view their profile and dashboard" /></SelectTrigger>
            <SelectContent className="max-h-80">
              {creating && <SelectItem value="new">New profile (unsaved)</SelectItem>}
              {instructors?.map((i) => <SelectItem key={i.id} value={i.id}>{i.name} · {i.headline}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {current && <Link to={`/instructor/${current.id}`} className="bk-btn-outline" data-testid="view-public-profile-link"><ExternalLink className="w-4 h-4" />See my public profile</Link>}
          <button className="bk-btn-primary" onClick={() => setSelectedId("new")} disabled={creating} data-testid="create-profile-button"><UserPlus className="w-4 h-4" />Create new profile</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
        <ProfileForm key={creating ? "new" : current?.id || "none"} instructor={current || null} meta={meta} onSaved={onSaved} />
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">{current ? `${current.name.split(" ")[0]}'s dashboard` : "Your dashboard"}</h2>
            <p className="text-sm text-[#86868b]">How learners rate you, across every platform, in one place.</p>
          </div>
          {creating ? (
            <div className="bk-card p-6 text-sm text-[#6e6e73]" data-testid="dashboard-new-hint">Save your profile first. Your Bodhak Score, charts and feedback summary will appear here as learners share stories.</div>
          ) : (
            <>
              <Dashboard data={dashboard} />
              {current && <AISummary summary={summary} loading={summaryLoading && !summary} showImprove title="What learners say and what to improve" />}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
