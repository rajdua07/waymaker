"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export default function CreateRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [participantEmails, setParticipantEmails] = useState<string[]>([]);
  const [criteria, setCriteria] = useState({
    speed: 0.5,
    risk: 0.5,
    cost: 0.5,
    innovation: 0.5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addEmail() {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !participantEmails.includes(trimmed)) {
      setParticipantEmails([...participantEmails, trimmed]);
      setEmail("");
    }
  }

  function removeEmail(e: string) {
    setParticipantEmails(participantEmails.filter((p) => p !== e));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (participantEmails.length === 0) {
      setError("Add at least one participant");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, participantEmails, criteria }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create room");
      setLoading(false);
      return;
    }

    const room = await res.json();
    router.push(`/rooms/${room.id}`);
  }

  const criteriaLabels: Record<string, string> = {
    speed: "Speed",
    risk: "Risk Tolerance",
    cost: "Cost Efficiency",
    innovation: "Innovation",
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-1">Create Decision Room</h1>
      <p className="text-sm text-slate-gray mb-8">
        Define the topic, invite participants, and set decision criteria.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-2">
            Topic
          </label>
          <Input
            placeholder="What decision needs to be made?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-navy-light border-white/10 text-white placeholder:text-slate-gray"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-2">
            Description (optional)
          </label>
          <Textarea
            placeholder="Provide context for participants..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-navy-light border-white/10 text-white placeholder:text-slate-gray resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-2">
            Participants
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEmail();
                }
              }}
              className="bg-navy-light border-white/10 text-white placeholder:text-slate-gray"
            />
            <Button
              type="button"
              onClick={addEmail}
              variant="secondary"
              className="bg-navy-light border border-white/10 text-white hover:bg-white/5 shrink-0"
            >
              Add
            </Button>
          </div>
          {participantEmails.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {participantEmails.map((e) => (
                <Badge
                  key={e}
                  className="bg-teal/10 text-teal text-xs cursor-pointer hover:bg-teal/20"
                  onClick={() => removeEmail(e)}
                >
                  {e} &times;
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-4">
            Decision Criteria Weights
          </label>
          <div className="space-y-5">
            {Object.entries(criteria).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white font-medium">
                    {criteriaLabels[key]}
                  </span>
                  <span className="text-xs text-teal font-semibold">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
                <Slider
                  value={[value * 100]}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    setCriteria({ ...criteria, [key]: v / 100 });
                  }}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-teal hover:bg-teal-light text-white font-semibold py-3"
        >
          {loading ? "Creating..." : "Create Decision Room"}
        </Button>
      </form>
    </div>
  );
}
