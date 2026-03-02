import { GripVertical } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { STAFFING_COLS, type StaffCard } from "../utils/boardState";

interface StaffingBoardProps {
  cards: StaffCard[];
  onCardMove: (cardId: string, newCol: string) => void;
  isLocked: boolean;
  showToast: (msg: string) => void;
}

export function StaffingBoard({
  cards,
  onCardMove,
  isLocked,
  showToast,
}: StaffingBoardProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const cardsByBucket = useMemo(() => {
    const m: Record<string, StaffCard[]> = {};
    // Initialize all section keys and flat drop keys
    for (const col of STAFFING_COLS) {
      if (col.sections) {
        for (const sec of col.sections) {
          m[sec.key] = [];
        }
      } else if (col.dropKey) {
        m[col.dropKey] = [];
      }
    }
    for (const c of cards) {
      if (m[c.col] !== undefined) {
        m[c.col].push(c);
      } else {
        m.staff_na = m.staff_na || [];
        m.staff_na.push(c);
      }
    }
    return m;
  }, [cards]);

  function onDragStart(e: React.DragEvent, cardId: string) {
    if (isLocked) {
      e.preventDefault();
      showToast("Locked. Unlock to edit.");
      return;
    }
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(cardId);
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function allowDrop(e: React.DragEvent) {
    if (isLocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e: React.DragEvent, bucketKey: string) {
    if (isLocked) {
      showToast("Locked. Unlock to edit.");
      return;
    }
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain");
    if (!cardId) return;
    onCardMove(cardId, bucketKey);
    setDragOverId(null);
    setDraggingId(null);
  }

  return (
    <div
      style={{
        marginTop: "14px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
      }}
      className="staffing-board"
    >
      <style>{`
        @media (max-width: 1180px) { .staffing-board { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px)  { .staffing-board { grid-template-columns: 1fr !important; } }
      `}</style>

      {STAFFING_COLS.map((col) => {
        const colCount = col.sections
          ? col.sections.reduce(
              (sum, s) => sum + (cardsByBucket[s.key]?.length || 0),
              0,
            )
          : cardsByBucket[col.dropKey ?? "staff_na"]?.length || 0;

        return (
          <div
            key={col.key}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              background: "#111827",
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
              minHeight: "420px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: "12px 14px 10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.2px",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {col.title}
              </h2>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "1px 8px",
                  fontWeight: 600,
                }}
              >
                {colCount}
              </span>
            </div>

            {/* Sections or flat drop zone */}
            <div
              style={{
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
              }}
            >
              {col.sections
                ? col.sections.map((sec) => {
                    const isDragTarget = !isLocked && dragOverId === sec.key;
                    const sectionCards = cardsByBucket[sec.key] || [];
                    return (
                      <div
                        key={sec.key}
                        style={{
                          border: isDragTarget
                            ? "1px solid rgba(99,179,237,0.5)"
                            : "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background: isDragTarget
                            ? "rgba(99,179,237,0.06)"
                            : "rgba(0,0,0,0.25)",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                        onDragOver={(e) => {
                          allowDrop(e);
                          if (!isLocked) setDragOverId(sec.key);
                        }}
                        onDragEnter={(e) => {
                          allowDrop(e);
                          if (!isLocked) setDragOverId(sec.key);
                        }}
                        onDrop={(e) => onDrop(e, sec.key)}
                        onDragLeave={() => setDragOverId(null)}
                      >
                        {/* Section header */}
                        <div
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "12px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.75)",
                            }}
                          >
                            {sec.title}
                          </span>
                          <span
                            style={{
                              color: "rgba(255,255,255,0.45)",
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {sectionCards.length}
                          </span>
                        </div>

                        {/* Cards */}
                        <div
                          style={{
                            padding: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            minHeight: "60px",
                          }}
                        >
                          {sectionCards.length === 0 && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.3)",
                                border: "1px dashed rgba(255,255,255,0.12)",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                minHeight: "24px",
                              }}
                            />
                          )}
                          {sectionCards.map((card) => (
                            <StaffCardItem
                              key={card.id}
                              card={card}
                              isLocked={isLocked}
                              isDragging={draggingId === card.id}
                              onDragStart={onDragStart}
                              onDragEnd={onDragEnd}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                : // Flat drop zone for "Not Assigned" — NO subsection header
                  (() => {
                    const dropKey = col.dropKey ?? "staff_na";
                    const isDragTarget = !isLocked && dragOverId === dropKey;
                    const zoneCards = cardsByBucket[dropKey] || [];
                    return (
                      <div
                        style={{
                          border: isDragTarget
                            ? "1px solid rgba(99,179,237,0.5)"
                            : "1px solid rgba(255,255,255,0.09)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background: isDragTarget
                            ? "rgba(99,179,237,0.06)"
                            : "rgba(0,0,0,0.25)",
                          transition: "border-color 0.15s, background 0.15s",
                          flex: 1,
                        }}
                        onDragOver={(e) => {
                          allowDrop(e);
                          if (!isLocked) setDragOverId(dropKey);
                        }}
                        onDragEnter={(e) => {
                          allowDrop(e);
                          if (!isLocked) setDragOverId(dropKey);
                        }}
                        onDrop={(e) => onDrop(e, dropKey)}
                        onDragLeave={() => setDragOverId(null)}
                      >
                        {/* No subsection header — direct card area */}
                        <div
                          style={{
                            padding: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            minHeight: "80px",
                          }}
                        >
                          {zoneCards.length === 0 && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "rgba(255,255,255,0.3)",
                                border: "1px dashed rgba(255,255,255,0.12)",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                minHeight: "24px",
                              }}
                            />
                          )}
                          {zoneCards.map((card) => (
                            <StaffCardItem
                              key={card.id}
                              card={card}
                              isLocked={isLocked}
                              isDragging={draggingId === card.id}
                              onDragStart={onDragStart}
                              onDragEnd={onDragEnd}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StaffCardItemProps {
  card: StaffCard;
  isLocked: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

function StaffCardItem({
  card,
  isLocked,
  isDragging,
  onDragStart,
  onDragEnd,
}: StaffCardItemProps) {
  return (
    <div
      draggable={!isLocked}
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      title={isLocked ? "Locked" : "Drag to move"}
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "10px 12px",
        background: isDragging
          ? "rgba(255,255,255,0.12)"
          : "rgba(255,255,255,0.06)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        cursor: isLocked ? "default" : "grab",
        opacity: isDragging ? 0.5 : 1,
        transition: "opacity 0.15s, background 0.15s",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        {!isLocked && (
          <GripVertical
            size={14}
            style={{
              color: "rgba(255,255,255,0.3)",
              marginTop: "2px",
              flexShrink: 0,
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <p className="staff-card-name">
            {card.personName}{" "}
            <span className="staff-card-login">({card.login})</span>
          </p>
          <div className="staff-card-subline">
            {card.shiftCoHost} - {card.shiftPattern}
          </div>
        </div>
      </div>
    </div>
  );
}
