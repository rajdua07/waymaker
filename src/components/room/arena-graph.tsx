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
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
          <stop offset="40%" stopColor="#0D9488" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="centerGlowOuter">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
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
      <circle cx={cx} cy={cy} r="250" fill="url(#centerGlowOuter)" />
      <circle cx={cx} cy={cy} r="160" fill="url(#centerGlow)" />

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
            {/* Glow layer behind edge */}
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={color} strokeWidth="6" strokeOpacity="0.08"
              strokeDasharray={dashArray}
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.4"
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
      {/* Pulsing outer ring */}
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.1" className="animate-pulse-glow" />
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
        r="34"
        fill="#0F1B2D"
        stroke="#0D9488"
        strokeWidth="2.5"
        filter="url(#glowStrong)"
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
            {/* Selection glow halo */}
            {isSelected && (
              <circle
                cx={node.x}
                cy={node.y}
                r="40"
                fill={node.color}
                fillOpacity="0.06"
                filter="url(#glow)"
              />
            )}
            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={node.x}
                cy={node.y}
                r="38"
                fill="none"
                stroke={node.color}
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="4 2"
              />
            )}
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r="30"
              fill="#142236"
              stroke={node.color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeOpacity={isSelected ? 1 : 0.6}
              filter={isSelected ? "url(#glow)" : undefined}
            />
            {/* Initials */}
            <text
              x={node.x}
              y={node.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="12"
              fontWeight="700"
            >
              {node.initials}
            </text>
            {/* Name label below */}
            <text
              x={node.x}
              y={node.y + 46}
              textAnchor="middle"
              fill="white"
              fontSize="11"
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
