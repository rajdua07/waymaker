"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);

    if (res.ok) {
      await update();
      toast.success("Profile updated");
    } else {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Settings</h1>
      <p className="text-sm text-slate-gray mb-10">Manage your profile and preferences.</p>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-2">
            Email
          </label>
          <Input
            value={session?.user?.email || ""}
            disabled
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-gray uppercase tracking-wider mb-2">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="font-semibold"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
