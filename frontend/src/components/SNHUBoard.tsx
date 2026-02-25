import React, { useMemo, useState } from 'react';
import { SNHU_COLS, type CourseCard } from '../utils/boardState';
import { BookOpen, GripVertical } from 'lucide-react';

interface SNHUBoardProps {
  cards: CourseCard[];
  onCardMove: (cardId: string, newCol: string) => void;
  isLocked: boolean;
  showToast: (msg: string) => void;
}

export function SNHUBoard({ cards, onCardMove, isLocked, showToast }: SNHUBoardProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const buckets = useMemo(() => {
    const m: Record<string, CourseCard[]> = {
      cur_pending: [],
      cur_progress: [],
      up_pending: [],
      up_progress: [],
      snhu_na: [],
    };
    for (const c of cards) {
      if (m[c.col] !== undefined) {
        m[c.col].push(c);
      } else {
        m['snhu_na'].push(c);
      }
    }
    return m;
  }, [cards]);

  function onDragStart(e: React.DragEvent, cardId: string) {
    if (isLocked) {
      e.preventDefault();
      showToast('Locked. Unlock to edit.');
      return;
    }
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(cardId);
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function allowDrop(e: React.DragEvent) {
    if (isLocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDrop(e: React.DragEvent, bucketKey: string) {
    if (isLocked) {
      showToast('Locked. Unlock to edit.');
      return;
    }
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    onCardMove(cardId, bucketKey);
    setDragOverId(null);
    setDraggingId(null);
  }

  return (
    <div
      style={{
        marginTop: '14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}
      className="snhu-board"
    >
      <style>{`
        @media (max-width: 820px)  { .snhu-board { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px)  { .snhu-board { grid-template-columns: 1fr !important; } }
      `}</style>

      {SNHU_COLS.map((col) => {
        const colCount = col.sections
          ? col.sections.reduce((sum, s) => sum + (buckets[s.key]?.length || 0), 0)
          : buckets[col.dropKey ?? 'snhu_na']?.length || 0;

        return (
          <div
            key={col.key}
            style={{
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              background: 'rgba(18,26,51,0.65)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              minHeight: '420px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <div
              style={{
                padding: '12px 14px 10px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={14} style={{ color: 'rgba(99,179,237,0.8)' }} />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.2px',
                    color: 'rgba(255,255,255,0.92)',
                  }}
                >
                  {col.title}
                </h2>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '1px 8px',
                  fontWeight: 600,
                }}
              >
                {colCount}
              </span>
            </div>

            {/* Sections or flat drop zone */}
            <div
              style={{
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flex: 1,
              }}
            >
              {col.sections ? (
                col.sections.map((sec) => {
                  const isDragTarget = !isLocked && dragOverId === sec.key;
                  const sectionCards = buckets[sec.key] || [];
                  return (
                    <div
                      key={sec.key}
                      style={{
                        border: isDragTarget
                          ? '1px solid rgba(99,179,237,0.5)'
                          : '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: isDragTarget
                          ? 'rgba(99,179,237,0.06)'
                          : 'rgba(255,255,255,0.025)',
                        transition: 'border-color 0.15s, background 0.15s',
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
                      <div
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                          {sec.title}
                        </span>
                        <span
                          style={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {sectionCards.length}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          minHeight: '60px',
                        }}
                      >
                        {sectionCards.length === 0 && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.3)',
                              border: '1px dashed rgba(255,255,255,0.12)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              minHeight: '24px',
                            }}
                          />
                        )}
                        {sectionCards.map((card) => (
                          <CourseCardItem
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
              ) : (
                // Flat drop zone for "Not Assigned"
                (() => {
                  const dropKey = col.dropKey ?? 'snhu_na';
                  const isDragTarget = !isLocked && dragOverId === dropKey;
                  const zoneCards = buckets[dropKey] || [];
                  return (
                    <div
                      style={{
                        border: isDragTarget
                          ? '1px solid rgba(99,179,237,0.5)'
                          : '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: isDragTarget
                          ? 'rgba(99,179,237,0.06)'
                          : 'rgba(255,255,255,0.025)',
                        transition: 'border-color 0.15s, background 0.15s',
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
                      <div
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
                          Not Assigned
                        </span>
                        <span
                          style={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {zoneCards.length}
                        </span>
                      </div>
                      <div
                        style={{
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          minHeight: '80px',
                        }}
                      >
                        {zoneCards.length === 0 && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.3)',
                              border: '1px dashed rgba(255,255,255,0.12)',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              minHeight: '24px',
                            }}
                          />
                        )}
                        {zoneCards.map((card) => (
                          <CourseCardItem
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
                })()
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CourseCardItemProps {
  card: CourseCard;
  isLocked: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

function CourseCardItem({ card, isLocked, isDragging, onDragStart, onDragEnd }: CourseCardItemProps) {
  return (
    <div
      draggable={!isLocked}
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      title={isLocked ? 'Locked' : 'Drag to move'}
      style={{
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        padding: '10px 12px',
        background: isDragging ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        cursor: isLocked ? 'default' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        {!isLocked && (
          <GripVertical
            size={14}
            style={{ color: 'rgba(255,255,255,0.3)', marginTop: '2px', flexShrink: 0 }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: '13px',
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1.4,
            }}
          >
            {card.title}
          </p>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(99,179,237,0.8)',
              marginTop: '4px',
              fontWeight: 500,
            }}
          >
            {card.term}
          </div>
        </div>
      </div>
    </div>
  );
}
