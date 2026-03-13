"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DECISION_TYPES } from "@/lib/constants";
import type { DecisionType, CriterionDef, UserBasic } from "@/types";
import { PairwiseTuner } from "@/components/room/pairwise-tuner";

interface TeamData {
  id: string;
  name: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    user: UserBasic;
  }>;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [decisionType, setDecisionType] = useState<DecisionType | null>(null);
  const [criteria, setCriteria] = useState<CriterionDef[]>([]);
  const [showTuner, setShowTuner] = useState(false);
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Team-based participants
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const fetchTeams = useCallback(async () => {
    const res = await fetch("/api/teams");
    if (res.ok) {
      const data = await res.json();
      setTeams(data);
    }
    setTeamsLoading(false);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  function handleTeamSelect(teamId: string) {
    setSelectedTeamId(teamId);
    setSelectedUserIds(new Set());
  }

  function toggleMember(userId: string) {
    // Can't deselect yourself (creator is always included)
    if (userId === session?.user?.id) return;
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });
    if (res.ok) {
      const team = await res.json();
      await fetchTeams();
      setSelectedTeamId(team.id);
      setNewTeamName("");
    }
    setCreatingTeam(false);
  }

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
    if (!selectedTeamId) {
      setError("Select a team");
      return;
    }
    if (selectedUserIds.size === 0) {
      setError("Select at least one team member");
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
        teamId: selectedTeamId,
        participantUserIds: [...selectedUserIds],
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold text-white mb-1">
        Create Decision Room
      </h1>
      <p className="text-sm text-slate-gray mb-8">
        Define the topic, pick a decision type, select your team.
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

        {/* --- Team & Participants --- */}
        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-3">
            Team & Participants
          </label>

          {teamsLoading ? (
            <div className="text-xs text-slate-gray py-4 text-center">Loading teams...</div>
          ) : teams.length === 0 ? (
            <div className="bg-navy-light border border-white/10 rounded-lg p-4">
              <p className="text-xs text-slate-gray mb-3">
                You need a team to create a room. Create one to get started.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Team name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTeam();
                    }
                  }}
                  className="bg-navy border-white/10 text-white placeholder:text-slate-gray"
                />
                <Button
                  type="button"
                  onClick={handleCreateTeam}
                  disabled={creatingTeam || !newTeamName.trim()}
                  className="bg-teal hover:bg-teal-light text-white text-xs shrink-0"
                >
                  {creatingTeam ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Team selector */}
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamSelect(e.target.value)}
                className="w-full bg-navy-light border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-teal/50 mb-3"
              >
                <option value="">Select a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.members.length} member{team.members.length !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>

              {/* Inline create team */}
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Or create a new team..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTeam();
                    }
                  }}
                  className="bg-navy-light border-white/10 text-white text-xs placeholder:text-slate-gray"
                />
                <Button
                  type="button"
                  onClick={handleCreateTeam}
                  disabled={creatingTeam || !newTeamName.trim()}
                  variant="secondary"
                  className="bg-navy-light border border-white/10 text-white hover:bg-white/5 text-xs shrink-0"
                >
                  {creatingTeam ? "..." : "Create"}
                </Button>
              </div>

              {/* Member checkboxes */}
              {selectedTeam && (
                <div className="space-y-1">
                  {selectedTeam.members.map((member) => {
                    const isCreator = member.userId === session?.user?.id;
                    const isSelected = isCreator || selectedUserIds.has(member.userId);
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleMember(member.userId)}
                        disabled={isCreator}
                        className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all text-left ${
                          isSelected
                            ? "border-teal/40 bg-teal/5"
                            : "border-white/10 bg-navy-light hover:border-white/20"
                        } ${isCreator ? "opacity-70 cursor-default" : ""}`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-teal border-teal"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(member.user.name || member.user.email)[0].toUpperCase()}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {member.user.name || member.user.email.split("@")[0]}
                            {isCreator && (
                              <span className="text-[10px] text-teal ml-2 font-normal">you (auto-included)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-gray truncate">{member.user.email}</p>
                        </div>
                      </button>
                    );
                  })}
                  <p className="text-[10px] text-slate-gray mt-1">
                    {selectedUserIds.size + 1} participant{selectedUserIds.size + 1 !== 1 ? "s" : ""} selected (including you)
                  </p>
                </div>
              )}
            </>
          )}
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
