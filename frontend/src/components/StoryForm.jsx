import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stars } from "@/components/ScoreBadge";
import { postStory } from "@/lib/api";

export const StoryForm = ({ instructor, open, onOpenChange, onSaved }) => {
  const courses = instructor.platforms.flatMap((p) => p.courses.map((c) => ({ course: c, platform: p.name })));
  const [form, setForm] = useState({ learner_name: "", course: courses[0]?.course || "", platform: courses[0]?.platform || instructor.platforms[0]?.name || "", rating: 5, text: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.learner_name.trim() || !form.text.trim() || !form.course || !form.platform) {
      toast.error("Please fill in your name, course, platform and story.");
      return;
    }
    setSaving(true);
    try {
      const res = await postStory(instructor.id, form);
      toast.success(`Thank you. ${instructor.name.split(" ")[0]}'s Bodhak Score is now ${res.bodhak_score.toFixed(1)}.`);
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("We couldn't save your story. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[18px] max-w-lg" data-testid="story-dialog">
        <DialogHeader>
          <DialogTitle className="text-xl">Share your story about {instructor.name}</DialogTitle>
          <DialogDescription>Tell future learners what it was like. It takes a minute and updates the Bodhak Score instantly.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="bk-label" htmlFor="story-name">Your name</label>
            <input id="story-name" className="bk-input" placeholder="e.g. Aarav Patel" value={form.learner_name} onChange={set("learner_name")} data-testid="story-name-input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="bk-label" htmlFor="story-course">Course you took</label>
              <select id="story-course" className="bk-input" value={form.course} data-testid="story-course-select"
                onChange={(e) => { const c = courses.find((x) => x.course === e.target.value); setForm((f) => ({ ...f, course: e.target.value, platform: c?.platform || f.platform })); }}>
                {courses.map((c) => <option key={c.course + c.platform} value={c.course}>{c.course}</option>)}
                {courses.length === 0 && <option value="">No courses listed</option>}
              </select>
            </div>
            <div>
              <label className="bk-label" htmlFor="story-platform">Platform</label>
              <select id="story-platform" className="bk-input" value={form.platform} onChange={set("platform")} data-testid="story-platform-select">
                {instructor.platforms.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <span className="bk-label">Your rating</span>
            <Stars value={form.rating} onChange={(n) => setForm((f) => ({ ...f, rating: n }))} size="w-7 h-7" testIdPrefix="story-star" />
          </div>
          <div>
            <label className="bk-label" htmlFor="story-text">Your story</label>
            <textarea id="story-text" rows={4} className="bk-input resize-none" placeholder="What did this instructor do well? What could be better?" value={form.text} onChange={set("text")} data-testid="story-text-input" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="bk-btn-secondary" onClick={() => onOpenChange(false)} data-testid="story-cancel-button">Cancel</button>
            <button type="submit" className="bk-btn-primary" disabled={saving} data-testid="story-submit-button">{saving ? "Saving your story…" : "Submit my story"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
