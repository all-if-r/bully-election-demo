import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button } from "./ui";

const NODE_SIZE = 64;

const initialNodes = [
  { id: 1, alive: true },
  { id: 2, alive: true },
  { id: 3, alive: true },
  { id: 4, alive: true },
  { id: 5, alive: true },
  { id: 6, alive: true }, // highest priority
];

function stepsForElection(starterId, nodes) {
  const higherAlive = nodes
    .filter((n) => n.alive && n.id > starterId)
    .map((n) => n.id);

  const msgs = [];
  // 1) starter asks higher IDs: "ELECTION?"
  higherAlive.forEach((hid) =>
    msgs.push({ type: "send", from: starterId, to: hid, label: "ELECTION" })
  );
  // 2) higher IDs reply: "OK, I'm alive"
  higherAlive.forEach((hid, i) =>
    msgs.push({
      type: "reply",
      from: hid,
      to: starterId,
      label: "OK",
      alt: i,
    })
  );
  // 3) highest alive node announces itself leader
  const aliveIds = nodes.filter((n) => n.alive).map((n) => n.id);
  if (aliveIds.length) {
    const maxAlive = Math.max(...aliveIds);
    msgs.push({
      type: "announce",
      from: maxAlive,
      to: "all",
      label: "COORDINATOR",
    });
  }
  return msgs;
}

export default function BullyElectionDemo() {
  const [nodes, setNodes] = useState(initialNodes);
  const [coordinator, setCoordinator] = useState(6);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [starterId, setStarterId] = useState(3);
  const [stepIndex, setStepIndex] = useState(0);
  const [timeline, setTimeline] = useState(stepsForElection(3, initialNodes));

  // layout positions (horizontal row)
  const layout = useMemo(() => {
    const gap = 120;
    return nodes.map((n, i) => ({
      id: n.id,
      x: 32 + i * gap,
      y: 140,
    }));
  }, [nodes]);

  // current highest alive
  const coordId = useMemo(() => {
    const alive = nodes.filter((n) => n.alive);
    if (!alive.length) return null;
    return Math.max(...alive.map((n) => n.id));
  }, [nodes]);

  // rebuild timeline if starter or node up/down changes
  useEffect(() => {
    const msgs = stepsForElection(starterId, nodes);
    setTimeline(msgs);
    setStepIndex(0);
    setPlaying(false);
  }, [starterId, nodes]);

  // autoplay forward but stop at final state
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= timeline.length) {
      setPlaying(false);
      setCoordinator(coordId);
      return;
    }
    const t = setTimeout(
      () => setStepIndex((i) => Math.min(i + 1, timeline.length)),
      speed
    );
    return () => clearTimeout(t);
  }, [playing, stepIndex, speed, timeline.length, coordId]);

  // controls
  const reset = () => {
    setNodes(initialNodes);
    setCoordinator(6);
    setStarterId(3);
    setTimeline(stepsForElection(3, initialNodes));
    setStepIndex(0);
    setPlaying(false);
  };

  const toggleNode = (id) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, alive: !n.alive } : n)));
    if (coordinator === id) setCoordinator(null);
  };

  const startElection = () => {
    setPlaying(true);
  };

  const nextStep = () => {
    setPlaying(false);
    setStepIndex((i) => Math.min(i + 1, timeline.length));
  };

  const prevStep = () => {
    setPlaying(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const failLeader = () => {
    const aliveIds = nodes.filter((n) => n.alive).map((n) => n.id);
    if (!aliveIds.length) return;
    const currentLeader = Math.max(...aliveIds);
    setNodes((prev) => prev.map((n) => (n.id === currentLeader ? { ...n, alive: false } : n)));
    if (coordinator === currentLeader) setCoordinator(null);
  };

  /**
   * Arrow: straight or arc, with labelYOffset to avoid overlap
   */
  const Arrow = ({ from, to, active, label, parallelIndex = 0, parallelCount = 1, baseArc = 44 }) => {
    const a = layout.find((p) => p.id === from);
    const b = layout.find((p) => p.id === to);
    if (!a || !b) return null;
    const x1 = a.x + NODE_SIZE / 2;
    const y1 = a.y + NODE_SIZE / 2;
    const x2 = b.x + NODE_SIZE / 2;
    const y2 = b.y + NODE_SIZE / 2;

    // Distance influence keeps arcs reasonable for close/far nodes
    const dist = Math.abs(x2 - x1);
    const arcSpacing = 18;
    const arcHeight =
      baseArc + (parallelIndex - (parallelCount - 1) / 2) * arcSpacing + Math.max(0, dist / 8);

    const midX = (x1 + x2) / 2;
    const isUp = from < to;
    const midY = isUp ? Math.min(y1, y2) - arcHeight : Math.max(y1, y2) + arcHeight;

    const pathD = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
    const labelYOffset = (parallelIndex - (parallelCount - 1) / 2) * 14 + (isUp ? -8 : 8);
    const markerId = `arrowhead-${from}-${to}-${parallelIndex}`;

    return (
      <>
        <svg className="absolute left-0 top-0" width="100%" height="100%" style={{ pointerEvents: "none" }}>
          <defs>
            <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
            </marker>
          </defs>
          <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" markerEnd={`url(#${markerId})`} />
          <text x={midX} y={midY + labelYOffset} fontSize={10} textAnchor="middle" fill="currentColor">
            {label}
          </text>
        </svg>

        {active && (
          <motion.div
            className="absolute rounded-full bg-gray-900"
            style={{ width: 10, height: 10 }}
            initial={{ x: x1, y: y1, opacity: 0.95 }}
            animate={{ x: [x1, midX, x2], y: [y1, midY, y2], opacity: 0.95 }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </>
    );
  };

  const visibleMsgs = timeline.slice(0, stepIndex);
  const announceMsg = visibleMsgs.find((m) => m.type === "announce");
  const effectiveLeader = announceMsg ? announceMsg.from : null;

  // quick sanity test in console
  useEffect(() => {
    const t1 = stepsForElection(3, initialNodes);
    const sends = t1.filter((m) => m.type === "send").map((m) => m.to).sort();
    const replies = t1.filter((m) => m.type === "reply").map((m) => m.from).sort();
    const ann = t1.find((m) => m.type === "announce");

    console.assert(JSON.stringify(sends) === JSON.stringify([4, 5, 6]), "Test1 sends wrong");
    console.assert(JSON.stringify(replies) === JSON.stringify([4, 5, 6]), "Test1 replies wrong");
    console.assert(ann && ann.from === 6, "Test1 leader should be 6");
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Bully Election — Simple Animation</CardTitle>
          <p className="text-sm text-gray-600">
            Higher ID = stronger node. If a node thinks the leader is down, it asks bigger IDs to take over. Biggest alive node becomes the new coordinator.
          </p>
        </CardHeader>

        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <Button onClick={startElection} disabled={playing}>
              Auto-play
            </Button>

            <Button variant="secondary" onClick={prevStep}>
              Previous step
            </Button>

            <Button variant="secondary" onClick={nextStep}>
              Next step
            </Button>

            <Button variant="destructive" onClick={failLeader} disabled={playing}>
              Fail current leader
            </Button>

            <Button variant="ghost" onClick={reset} disabled={playing && stepIndex < timeline.length}>
              Reset
            </Button>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-700">Starter:</span>
              <select
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white"
                value={starterId}
                onChange={(e) => setStarterId(parseInt(e.target.value))}
                disabled={playing}
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Node {n.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm text-gray-700">Speed:</span>
              <input
                type="range"
                min={300}
                max={1500}
                step={100}
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-40"
              />
            </div>
          </div>

          {/* Graph area */}
          <div className="relative w-full h-[260px] rounded-2xl border border-gray-300 bg-white overflow-hidden">
            {/* arrows: expand visibleMsgs into per-target render items and stagger parallel arrows */}
            {(() => {
              const items = [];
              const counts = {};

              visibleMsgs.forEach((m, i) => {
                if (m.type === "announce") {
                  nodes
                    .filter((n) => n.id !== m.from && n.alive)
                    .forEach((n) => {
                      const key = `${Math.min(m.from, n.id)}-${Math.max(m.from, n.id)}`;
                      counts[key] = (counts[key] || 0) + 1;
                      items.push({ m, from: m.from, to: n.id, key, origIdx: i });
                    });
                } else {
                  const key = `${Math.min(m.from, m.to)}-${Math.max(m.from, m.to)}`;
                  counts[key] = (counts[key] || 0) + 1;
                  items.push({ m, from: m.from, to: m.to, key, origIdx: i });
                }
              });

              // assign order index per key
              const seq = {};
              items.forEach((it) => {
                seq[it.key] = seq[it.key] || 0;
                it.parallelIndex = seq[it.key]++;
                it.parallelCount = counts[it.key];
              });

              return items.map((it, i) => {
                const m = it.m;
                const isReply = m.type === "reply";
                return (
                  <Arrow
                    key={`msg-${i}-${it.from}-${it.to}`}
                    from={it.from}
                    to={it.to}
                    active
                    label={m.label}
                    parallelIndex={it.parallelIndex}
                    parallelCount={it.parallelCount}
                    baseArc={isReply ? 40 : 44}
                  />
                );
              });
            })()}

            {/* nodes */}
            {layout.map((pos) => {
              const n = nodes.find((x) => x.id === pos.id);
              const isCoord = coordinator === pos.id && n.alive;
              const isWinner = effectiveLeader === pos.id && n.alive;

              return (
                <motion.div
                  key={pos.id}
                  className={`absolute flex flex-col items-center justify-center text-sm font-semibold rounded-2xl border border-gray-400 bg-white text-gray-900 cursor-pointer select-none ${
                    isWinner ? "ring-4 ring-indigo-400 ring-offset-2" : ""
                  }`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: NODE_SIZE,
                    height: NODE_SIZE,
                  }}
                  onClick={() => toggleNode(pos.id)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 18,
                  }}
                  title="Click to toggle up/down"
                >
                  <div className="text-base">{`N${pos.id}`}</div>
                  <div className="text-[10px] text-gray-600">{n.alive ? "up" : "down"}</div>
                  {isCoord && <div className="text-[10px] mt-1 text-indigo-600">leader</div>}
                  {isWinner && <div className="text-[10px] mt-1 text-indigo-600">new leader</div>}
                </motion.div>
              );
            })}
          </div>

          {/* Info cards */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">How to use</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                  <li>Click any node to toggle it up/down (simulate crash/recovery).</li>
                  <li>
                    Choose a starter node, lalu tekan <b>Auto-play</b> atau jalan manual pakai{" "}
                    <b>Previous / Next step</b>.
                  </li>
                  <li>
                    Pencet <b>Fail current leader</b> buat matiin leader tertinggi, lalu jalankan election lagi dan lihat siapa jadi
                    leader baru.
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Step log</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  {timeline.slice(0, stepIndex).map((m, i) => (
                    <li key={i}>
                      {m.type === "send" && (
                        <>
                          Node {m.from} → Node {m.to}: <b>ELECTION</b> — nanya ke node ID lebih besar: “lu masih hidup nggak dan lu lebih kuat nggak?”
                        </>
                      )}
                      {m.type === "reply" && (
                        <>
                          Node {m.from} → Node {m.to}: <b>OK</b> — jawab: “gue hidup dan gue lebih kuat, gue yg handle.”
                        </>
                      )}
                      {m.type === "announce" && (
                        <>
                          Node {m.from}: <b>COORDINATOR</b> — deklarasi pemimpin baru. Semua node lain sekarang koordinasi ke dia.
                        </>
                      )}
                    </li>
                  ))}
                  {stepIndex === 0 && <li className="opacity-60">Press Auto-play / Next step…</li>}
                </ol>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
