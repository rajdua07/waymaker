"use client";

import type { ArenaNode, ArenaEdge } from "@/types";
import { EDGE_COLORS } from "@/lib/constants";

interface ArenaGraphProps {
  nodes: ArenaNode[];
  edges: ArenaEdge[];
  selectedId: string | null;
  onSelectNode: (id: string) => void;
  confidence: number | null;
}

export function ArenaGraph({ nodes, edges, selectedId, onSelectNode, confidence }: ArenaGraphProps) {
  const cx = 300;
  const cy = 300;

  return (
    <svg viewBox="0 0 600 600" className="w-full h-full">
      <defs>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="600" height="600" fill="url(#grid)" />
      <circle cx={cx} cy={cy} r="200" fill="url(#centerGlow)" />

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = edge.from === "center"
          ? { x: cx, y: cy }
          : nodes.find((n) => n.id === edge.from) || { x: cx, y: cy };
        const to = edge.to === "center"
          ? { x: cx, y: cy }
          : nodes.find((n) => n.id === edge.to) || { x: cx, y: cy };
        const color = EDGE_COLORS[edge.type];
        const dashArray = edge.type === "agree" ? "6 4" : edge.type === "partial" ? "3 3" : "none";

        return (
          <g key={`edge-${i}`}>
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.3"
              strokeDasharray={dashArray}
              className="transition-all duration-500"
            />
            {edge.label && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 6}
                fill={color}
                fontSize="8"
                textAnchor="middle"
                opacity="0.6"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Center Waymaker node */}
      <circle cx={cx} cy={cy} r="60" fill="#0D9488" fillOpacity="0.05" />
      <circle
        cx={cx}
        cy={cy}
        r="42"
        fill="none"
        stroke="#0D9488"
        strokeWidth="1"
        strokeDasharray="4 3"
        strokeOpacity="0.4"
        className="animate-rotate-slow"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      <circle
        cx={cx}
        cy={cy}
        r="32"
        fill="#0F1B2D"
        stroke="#0D9488"
        strokeWidth="2"
        filter="url(#glow)"
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#0D9488" fontSize="10" fontWeight="800" letterSpacing="1.5">
        WAY
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="white" fontSize="10" fontWeight="800" letterSpacing="1.5">
        MAKER
      </text>
      {confidence !== null && (
        <text x={cx} y={cy + 22} textAnchor="middle" fill="#94A3B8" fontSize="8">
          {confidence}%
        </text>
      )}

      {/* Participant nodes */}
      {nodes.map((node) => {
        const isSelected = selectedId === node.id;
        return (
          <g
            key={node.id}
            className="cursor-pointer transition-transform duration-200 hover:scale-105"
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            onClick={() => onSelectNode(node.id)}
          >
            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={node.x}
                cy={node.y}
                r="36"
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                strokeOpacity="0.3"
                strokeDasharray="4 2"
              />
            )}
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="28"
              fill="#1A2940"
              stroke={node.color}
              strokeWidth={isSelected ? 3 : 2}
              strokeOpacity={isSelected ? 1 : 0.8}
            />
            {/* Initials */}
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="11"
              fontWeight="700"
            >
              {node.initials}
            </text>
            {/* Name label below */}
            <text
              x={node.x}
              y={node.y + 44}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="600"
            >
              {node.name.split(" ")[0]}
            </text>
            {/* Score badge */}
            {node.score !== null && (
              <g>
                <circle
                  cx={node.x + 20}
                  cy={node.y - 20}
                  r="12"
                  fill={node.color}
                  fillOpacity="0.2"
                  stroke={node.color}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={node.x + 20}
                  y={node.y - 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={node.color}
                  fontSize="8"
                  fontWeight="700"
                >
                  {node.score.toFixed(1)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
