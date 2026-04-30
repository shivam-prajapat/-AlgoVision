import { motion } from "framer-motion";
import { ALGO_META } from "../algorithms/wasmAdapter";
const CAT_ORDER = ["Array Search", "Graph Traversal", "Weighted Graph"];
const CAT_COLOR = {
  "Array Search": {
    active: "#00d4ff",
    glow: "rgba(0,212,255,0.15)",
    badge: "rgba(0,212,255,0.1)",
    border: "rgba(0,212,255,0.3)",
  },
  "Graph Traversal": {
    active: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    badge: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.3)",
  },
  "Weighted Graph": {
    active: "#00ff88",
    glow: "rgba(0,255,136,0.15)",
    badge: "rgba(0,255,136,0.1)",
    border: "rgba(0,255,136,0.3)",
  },
};
function AlgoButton({ id, meta, selected, disabled, onClick }) {
  const col = CAT_COLOR[meta.category];
  return (
    <motion.button
      onClick={() => !disabled && onClick(id)}
      whileHover={!disabled ? { scale: 1.02, x: 2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${selected ? col.border : "rgba(255,255,255,0.07)"}`,
        background: selected ? col.glow : "rgba(255,255,255,0.02)",
        cursor: disabled && !selected ? "not-allowed" : "pointer",
        opacity: disabled && !selected ? 0.45 : 1,
        position: "relative",
        overflow: "hidden",
        transition: "background .25s, border-color .25s",
        boxShadow: selected ? `0 0 18px ${col.glow}` : "none",
      }}
    >
      {selected && (
        <motion.div
          layoutId="activeBar"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: 3,
            height: 28,
            borderRadius: "0 3px 3px 0",
            background: col.active,
            boxShadow: `0 0 8px ${col.active}`,
          }}
        />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{meta.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: selected ? "#e2e8f0" : "#94a3b8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {meta.name}
          </div>
          <span
            style={{
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 3,
              fontFamily: "monospace",
              fontWeight: 700,
              background: col.badge,
              color: col.active,
              border: `1px solid ${col.border}`,
            }}
          >
            {meta.timeComplexity}
          </span>
        </div>
      </div>
      {selected && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{
            marginTop: 6,
            fontSize: 10,
            color: "#64748b",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {meta.description}
        </motion.p>
      )}
    </motion.button>
  );
}
function SectionLabel({ children }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 6 }}>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#475569",
        }}
      >
        {children}
      </div>
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginTop: 4,
        }}
      />
    </div>
  );
}
function Toggle({ label, value, onChange, disabled }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 2px",
      }}
    >
      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
      <button
        onClick={onChange}
        disabled={disabled}
        style={{
          width: 38,
          height: 20,
          borderRadius: 10,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: value ? "rgba(168,85,247,0.7)" : "rgba(255,255,255,0.1)",
          position: "relative",
          transition: "background .3s",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 19 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .25s",
          }}
        />
      </button>
    </div>
  );
}
export default function Sidebar({
  selectedAlgorithm,
  onSelectAlgorithm,
  isRunning,
  isGraph,
  editMode,
  pendingEdge,
  weightInput,
  directed,
  startNode,
  nodes,
  edges,
  onEditModeChange,
  onWeightChange,
  onDirectedToggle,
  onStartNodeChange,
  onLoadPreset,
  onClearGraph,
  onRandomGraph,
  presets,
  isArray,
  isGrid,
  dataSize,
  onSizeChange,
  onCustomArray,
  target,
  onTargetChange,
  onGenerate,
}) {
  const grouped = CAT_ORDER.map((cat) => ({
    cat,
    items: Object.entries(ALGO_META).filter(([, m]) => m.category === cat),
  }));
  const btnStyle = (active, variant = "default") => ({
    width: "100%",
    textAlign: "left",
    padding: "7px 10px",
    borderRadius: 9,
    border: "none",
    fontSize: 11,
    fontWeight: 600,
    cursor: isRunning ? "not-allowed" : "pointer",
    opacity: isRunning ? 0.5 : 1,
    transition: "background .2s, box-shadow .2s",
    ...(active
      ? {
          background: "rgba(0,212,255,0.15)",
          color: "#00d4ff",
          boxShadow: "0 0 12px rgba(0,212,255,0.2)",
        }
      : variant === "danger"
        ? { background: "rgba(255,0,110,0.08)", color: "#ff006e" }
        : variant === "green"
          ? { background: "rgba(0,255,136,0.08)", color: "#00ff88" }
          : { background: "rgba(255,255,255,0.04)", color: "#94a3b8" }),
  });
  return (
    <motion.aside
      className="app-sidebar"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2.4, duration: 0.4 }}
    >
      {}
      {grouped.map(({ cat, items }) => (
        <div key={cat}>
          <SectionLabel>{cat}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {items.map(([id, meta]) => (
              <AlgoButton
                key={id}
                id={id}
                meta={meta}
                selected={selectedAlgorithm === id}
                disabled={isRunning}
                onClick={onSelectAlgorithm}
              />
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          margin: "14px 0",
        }}
      />
      {}
      {}
      {isArray && (
        <>
          <SectionLabel>Search Controls</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 10, color: "#64748b" }}>
              Array size: {dataSize}
            </label>
            <input
              type="range"
              min={5}
              max={50}
              value={dataSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              style={{ accentColor: "#00d4ff", cursor: "pointer" }}
            />
            <button
              onClick={onGenerate}
              disabled={isRunning}
              style={btnStyle(false, "green")}
            >
              New Array
            </button>
          </div>
        </>
      )}
      {}
      {isGrid && (
        <>
          <SectionLabel>Grid Controls</SectionLabel>
          <button
            onClick={onGenerate}
            disabled={isRunning}
            style={btnStyle(false, "green")}
          >
            New Grid
          </button>
          <p
            style={{
              fontSize: 10,
              color: "#475569",
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Click cells on the grid to toggle walls
          </p>
        </>
      )}
      {}
      {isGraph && (
        <>
          <SectionLabel>Edit Graph</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              ["addNode", "⊕ Add Node"],
              ["addEdge", "↔ Add Edge"],
              ["delete", " Delete Mode"],
            ].map(([m, l]) => (
              <button
                key={m}
                onClick={() => onEditModeChange(editMode === m ? null : m)}
                disabled={isRunning}
                style={btnStyle(editMode === m)}
              >
                {l}
              </button>
            ))}
          </div>
          {editMode === "addEdge" && (
            <div style={{ marginTop: 8 }}>
              <label
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Edge Weight
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={weightInput}
                onChange={(e) => onWeightChange(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  color: pendingEdge !== null ? "#00d4ff" : "#475569",
                  marginTop: 4,
                }}
              >
                {pendingEdge !== null
                  ? " Now click target node"
                  : "Click source node first"}
              </div>
            </div>
          )}
          {editMode === "delete" && (
            <div style={{ fontSize: 10, color: "#ff006e", marginTop: 6 }}>
              Right-click a node to delete it
            </div>
          )}
          <Toggle
            label="Directed"
            value={directed}
            onChange={onDirectedToggle}
            disabled={isRunning}
          />
          {selectedAlgorithm === "dijkstra" && (
            <>
              <label
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  display: "block",
                  marginTop: 6,
                  marginBottom: 4,
                }}
              >
                Start Node
              </label>
              <select
                value={startNode}
                onChange={(e) => onStartNodeChange(Number(e.target.value))}
                disabled={isRunning}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#e2e8f0",
                  fontSize: 11,
                  outline: "none",
                }}
              >
                {nodes.map((n) => (
                  <option
                    key={n.id}
                    value={n.id}
                    style={{ background: "#1a1a2e" }}
                  >
                    Node {n.label ?? n.id}
                  </option>
                ))}
              </select>
            </>
          )}
          <SectionLabel>Presets</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {Object.entries(presets).map(([k, p]) => (
              <button
                key={k}
                onClick={() => onLoadPreset(p)}
                disabled={isRunning}
                style={btnStyle(false)}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={onRandomGraph}
              disabled={isRunning}
              style={btnStyle(false, "green")}
            >
              Random Graph
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginTop: 8,
            }}
          >
            {[
              { l: "Nodes", v: nodes.length },
              { l: "Edges", v: edges.length },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  textAlign: "center",
                  padding: "6px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: "#00d4ff",
                  }}
                >
                  {s.v}
                </div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={onClearGraph}
            disabled={isRunning}
            style={{ ...btnStyle(false, "danger"), marginTop: 8 }}
          >
            Clear Graph
          </button>
        </>
      )}
      {}
      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 10,
          }}
        />
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#475569",
            marginBottom: 8,
          }}
        >
          Legend
        </div>
        {[
          { c: "#374151", b: "rgba(255,255,255,0.1)", l: "Unvisited" },
          { c: "#00d4ff", b: "#00d4ff", l: "Current / Active" },
          { c: "#a855f7", b: "#a855f7", l: "Visited / Settled" },
          { c: "#00ff88", b: "#00ff88", l: "Found / MST" },
          { c: "#ff006e", b: "#ff006e", l: "Rejected / Wall" },
          { c: "#f59e0b", b: "#f59e0b", l: "Start Node" },
          { c: "#ffd700", b: "#ffd700", l: "Examining" },
        ].map((item) => (
          <div
            key={item.l}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 5,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: item.c,
                border: `1px solid ${item.b}`,
                boxShadow:
                  item.c !== "#374151" ? `0 0 5px ${item.c}55` : "none",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10, color: "#64748b" }}>{item.l}</span>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
