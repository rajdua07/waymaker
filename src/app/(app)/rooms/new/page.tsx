"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DECISION_TYPES } from "@/lib/constants";
import type { DecisionType, CriterionDef } from "@/types";
import { PairwiseTuner } from "@/components/room/pairwise-tuner";

export default function CreateRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [participantEmails, setParticipantEmails] = useState<string[]>([]);
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [criteria, setCriteria] = useState<CriterionDef[]>([]);
  const [showTuner, setShowTuner] = useState(false);
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectType(type: DecisionType) {
    const config = DECISION_TYPES.find((t) => t.id === type);
    setDecisionType(type);
    setCriteria(config?.defaultCriteria.map((c) => ({ ...c })) ?? []);
    setShowTuner(false);
  }

  function addCustomCriterion() {
    const name = customName.trim();
    if (!name || criteria.length >= 5 || criteria.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    const newCriteria = [...criteria, { name, weight: 0, isMustHave: false }];
    // Recalculate equal weights
    const w = +(1 / newCriteria.length).toFixed(4);
    setCriteria(newCriteria.map((c) => ({ ...c, weight: w })));
    setCustomName("");
  }

  function removeCustomCriterion(name: string) {
    const remaining = criteria.filter((c) => c.name !== name);
    if (remaining.length === 0) {
      setCriteria([]);
      return;
    }
    const w = +(1 / remaining.length).toFixed(4);
    setCriteria(remaining.map((c) => ({ ...c, weight: w })));
  }

  function toggleMustHave(name: string) {
    setCriteria(
      criteria.map((c) =>
        c.name === name ? { ...c, isMustHave: !c.isMustHave } : c
      )
    );
  }

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
    if (!decisionType) {
      setError("Pick a decision type");
      return;
    }
    if (criteria.length === 0) {
      setError("Add at least one criterion");
      return;
    }
    if (participantEmails.length === 0) {
      setError("Add at least one participant");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        participantEmails,
        decisionType,
        criteria,
      }),
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

  const selectedConfig = DECISION_TYPES.find((t) => t.id === decisionType);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-1">
        Create Decision Room
      </h1>
      <p className="text-sm text-slate-gray mb-8">
        Define the topic, pick a decision type, invite participants.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* --- Topic --- */}
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

        {/* --- Decision Type Selector --- */}
        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-3">
            Decision Type
          </label>
          <div className="grid grid-cols-1 gap-2">
            {DECISION_TYPES.map((dt) => {
              const selected = decisionType === dt.id;
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => selectType(dt.id)}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    selected
                      ? "border-teal bg-teal/10"
                      : "border-white/10 bg-navy-light hover:border-white/20"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        selected ? "text-teal" : "text-white"
                      }`}
                    >
                      {dt.label}
                    </span>
                    <span className="text-xs text-slate-gray italic">
                      {dt.question}
                    </span>
                  </div>
                  <p className="text-xs text-slate-gray mt-1">
                    {dt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Criteria Display --- */}
        {decisionType && decisionType !== "custom" && criteria.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-3">
              Criteria
            </label>
            <div className="space-y-2">
              {criteria.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between bg-navy-light border border-white/10 rounded-lg px-4 py-3"
                >
                  <span className="text-sm text-white font-medium">
                    {c.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMustHave(c.name)}
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded transition-colors ${
                      c.isMustHave
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/5 text-slate-gray hover:text-white/60"
                    }`}
                  >
                    {c.isMustHave ? "Must-have" : "Set must-have"}
                  </button>
                </div>
              ))}
            </div>

            {/* Pairwise Tuner Toggle */}
            {criteria.length >= 2 && (
              <div className="mt-4">
                {!showTuner ? (
                  <button
                    type="button"
                    onClick={() => setShowTuner(true)}
                    className="text-xs text-teal hover:text-teal-light transition-colors"
                  >
                    Fine-tune relative importance (optional, 15 sec)
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-gray">
                        Drag toward whichever matters more for this decision.
                        Center = equal.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowTuner(false)}
                        className="text-xs text-slate-gray hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <PairwiseTuner criteria={criteria} onChange={setCriteria} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- Custom Criteria --- */}
        {decisionType === "custom" && (
          <div>
            <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-3">
              Custom Criteria (up to 5)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Criterion name, e.g. Cost Efficiency"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCriterion();
                  }
                }}
                className="bg-navy-light border-white/10 text-white placeholder:text-slate-gray"
              />
              <Button
                type="button"
                onClick={addCustomCriterion}
                disabled={criteria.length >= 5}
                variant="secondary"
                className="bg-navy-light border border-white/10 text-white hover:bg-white/5 shrink-0"
              >
                Add
              </Button>
            </div>
            {criteria.length > 0 && (
              <div className="space-y-2">
                {criteria.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between bg-navy-light border border-white/10 rounded-lg px-4 py-3"
                  >
                    <span className="text-sm text-white font-medium">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleMustHave(c.name)}
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded transition-colors ${
                          c.isMustHave
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/5 text-slate-gray hover:text-white/60"
                        }`}
                      >
                        {c.isMustHave ? "Must-have" : "Set must-have"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCustomCriterion(c.name)}
                        className="text-slate-gray hover:text-red-400 text-sm"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pairwise Tuner for Custom */}
            {criteria.length >= 2 && (
              <div className="mt-4">
                {!showTuner ? (
                  <button
                    type="button"
                    onClick={() => setShowTuner(true)}
                    className="text-xs text-teal hover:text-teal-light transition-colors"
                  >
                    Fine-tune relative importance (optional, 15 sec)
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-slate-gray">
                        Drag toward whichever matters more. Center = equal.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowTuner(false)}
                        className="text-xs text-slate-gray hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <PairwiseTuner criteria={criteria} onChange={setCriteria} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- Participants --- */}
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
