"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RoomDocument } from "@/types";

interface ContextDocumentsProps {
  roomId: string;
  documents: RoomDocument[];
  isCreator: boolean;
  onUpdated: () => void;
}

export function ContextDocuments({
  roomId,
  documents,
  isCreator,
  onUpdated,
}: ContextDocumentsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/rooms/${roomId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim() }),
    });

    setLoading(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      setIsAdding(false);
      onUpdated();
    }
  }

  async function handleDelete(docId: string) {
    await fetch(`/api/rooms/${roomId}/documents?id=${docId}`, {
      method: "DELETE",
    });
    onUpdated();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-gray uppercase tracking-[2px]">
          Context ({documents.length})
        </h3>
        {isCreator && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[10px] text-teal hover:text-teal-light font-semibold"
          >
            + Add
          </button>
        )}
      </div>

      {/* Add document form */}
      {isAdding && (
        <div className="bg-navy-light border border-white/[0.06] rounded-lg p-3 space-y-2">
          <Input
            placeholder="Document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-navy border-white/10 text-white text-xs placeholder:text-slate-gray h-8"
          />
          <Textarea
            placeholder="Paste document content, meeting notes, research, data..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-navy border-white/10 text-white text-xs placeholder:text-slate-gray resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleAdd}
              disabled={loading || !title.trim() || !content.trim()}
              size="sm"
              className="bg-teal hover:bg-teal-light text-white text-xs h-7 flex-1"
            >
              {loading ? "Adding..." : "Add Document"}
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setTitle("");
                setContent("");
              }}
              size="sm"
              variant="secondary"
              className="bg-navy border border-white/10 text-slate-gray text-xs h-7 hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Document list */}
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="bg-navy-light border border-white/[0.06] rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
            className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span className="text-xs font-medium text-white truncate">
                {doc.title}
              </span>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-slate-gray shrink-0 transition-transform ${
                expandedId === doc.id ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {expandedId === doc.id && (
            <div className="px-3 pb-3 border-t border-white/[0.04]">
              <pre className="text-[11px] text-white/70 leading-relaxed whitespace-pre-wrap mt-2 max-h-48 overflow-y-auto">
                {doc.content}
              </pre>
              {isCreator && (
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-[10px] text-conflict/70 hover:text-conflict mt-2"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {documents.length === 0 && !isAdding && (
        <p className="text-[10px] text-slate-gray/50 text-center py-3">
          No context documents added yet.
        </p>
      )}
    </div>
  );
}
