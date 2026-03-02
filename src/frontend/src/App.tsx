import { Lock, Unlock } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SNHUBoard } from "./components/SNHUBoard";
import { StaffingBoard } from "./components/StaffingBoard";
import { Toast } from "./components/Toast";
import { UnlockModal } from "./components/UnlockModal";
import { useBoardState, useUpdateBoardState } from "./hooks/useQueries";
import { type AppBoardState, defaultAppState } from "./utils/boardState";

const LOGIN_NAME = "migudavc";
const LOCK_KEY = `swb_locked_${LOGIN_NAME}`;
const LAST_UPDATED_KEY = "swb_lastUpdated";

function todayStr() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function liveClockStr() {
  return new Date().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function nowStamp() {
  return new Date().toLocaleString();
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred. Please try again.";
}

export default function App() {
  const [activeBoard, setActiveBoard] = useState<"amazon" | "snhu">("amazon");
  const [isLocked, setIsLocked] = useState(
    () => localStorage.getItem(LOCK_KEY) === "1",
  );
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [liveTime, setLiveTime] = useState(() => liveClockStr());
  const [lastUpdated, setLastUpdated] = useState(
    () => localStorage.getItem(LAST_UPDATED_KEY) || nowStamp(),
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(liveClockStr()), 1000);
    return () => clearInterval(t);
  }, []);

  // Persist lock state
  useEffect(() => {
    localStorage.setItem(LOCK_KEY, isLocked ? "1" : "0");
  }, [isLocked]);

  // Backend / localStorage state via React Query
  const { data: boardState, isLoading } = useBoardState();
  const updateMutation = useUpdateBoardState();

  // Derive the current state directly from React Query cache — no separate localState
  // React Query's optimistic update in useUpdateBoardState keeps this always fresh
  const state: AppBoardState = boardState ?? defaultAppState();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  }, []);

  function touchUpdate(nextState: AppBoardState) {
    const stamp = nowStamp();
    setLastUpdated(stamp);
    localStorage.setItem(LAST_UPDATED_KEY, stamp);

    updateMutation.mutate(nextState, {
      onError: (err) => {
        showToast(`Save failed: ${extractErrorMessage(err)}`);
      },
    });
  }

  function handleStaffCardMove(cardId: string, newCol: string) {
    if (isLocked) {
      showToast("Locked. Unlock to edit.");
      return;
    }
    const nextState: AppBoardState = {
      ...state,
      staffing: {
        cards: state.staffing.cards.map((c) =>
          c.id === cardId ? { ...c, col: newCol } : c,
        ),
      },
    };
    touchUpdate(nextState);
  }

  function handleCourseCardMove(cardId: string, newCol: string) {
    if (isLocked) {
      showToast("Locked. Unlock to edit.");
      return;
    }
    const nextState: AppBoardState = {
      ...state,
      university: {
        cards: state.university.cards.map((c) =>
          c.id === cardId ? { ...c, col: newCol } : c,
        ),
      },
    };
    touchUpdate(nextState);
  }

  function lockNow() {
    setIsLocked(true);
    showToast("Board locked.");
  }

  function requestUnlock() {
    setUnlockModalOpen(true);
  }

  function confirmUnlock() {
    setIsLocked(false);
    setUnlockModalOpen(false);
    showToast("Board unlocked.");
  }

  const appId = encodeURIComponent(
    typeof window !== "undefined"
      ? window.location.hostname
      : "my-digital-board",
  );

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Topbar ── */}
      <header
        className="topbar-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "12px",
          alignItems: "center",
          padding: "14px 16px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "16px",
          background: "rgba(13,20,40,0.92)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <style>{`
          @media (max-width: 560px) {
            .topbar-grid { grid-template-columns: 1fr !important; }
            .topbar-right { align-items: flex-start !important; }
            .topbar-controls { justify-content: flex-start !important; }
            .board-toggle { width: 100% !important; }
          }
        `}</style>

        {/* LEFT: board selector + last updated */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-start",
            minWidth: 0,
          }}
        >
          <select
            className="board-toggle"
            value={activeBoard}
            onChange={(e) =>
              setActiveBoard(e.target.value as "amazon" | "snhu")
            }
            title="Select board"
            style={{
              width: "360px",
              maxWidth: "100%",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.92)",
              borderRadius: "12px",
              padding: "9px 12px",
              fontSize: "13px",
              outline: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              appearance: "auto",
            }}
          >
            <option value="amazon">
              Amazon Workplace: Demorians Department
            </option>
            <option value="snhu">
              Southern New Hampshire University (SNHU)
            </option>
          </select>

          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.55)",
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span>
              <strong style={{ color: "rgba(255,255,255,0.7)" }}>
                Last Updated:
              </strong>{" "}
              {lastUpdated}
            </span>
            {(isLoading || updateMutation.isPending) && (
              <span style={{ color: "rgba(99,179,237,0.7)" }}>Syncing…</span>
            )}
          </div>
        </div>

        {/* CENTER: title + date + clock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.2px",
              color: "rgba(255,255,255,0.95)",
              whiteSpace: "nowrap",
            }}
          >
            My Digital Board 2.0
          </h1>
          <div
            style={{
              fontSize: "13px",
              opacity: 0.82,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {todayStr()}
            <span style={{ opacity: 0.45 }}>•</span>
            <span
              style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
            >
              {liveTime}
            </span>
          </div>
        </div>

        {/* RIGHT: lock/unlock */}
        <div
          className="topbar-right"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <div
            className="topbar-controls"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {isLocked ? (
              <button
                type="button"
                onClick={requestUnlock}
                title="Unlock board"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  border: "1px solid rgba(239,68,68,0.4)",
                  background: "rgba(239,68,68,0.12)",
                  color: "rgba(239,68,68,0.9)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                <Lock size={13} />
                Unlock
              </button>
            ) : (
              <button
                type="button"
                onClick={lockNow}
                title="Lock makes the board view-only"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  border: "1px solid rgba(251,191,36,0.4)",
                  background: "rgba(251,191,36,0.1)",
                  color: "rgba(251,191,36,0.9)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s",
                }}
              >
                <Unlock size={13} />
                Lock
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Board ── */}
      <main style={{ flex: 1 }}>
        {activeBoard === "amazon" ? (
          <StaffingBoard
            cards={state.staffing.cards}
            onCardMove={handleStaffCardMove}
            isLocked={isLocked}
            showToast={showToast}
          />
        ) : (
          <SNHUBoard
            cards={state.university.cards}
            onCardMove={handleCourseCardMove}
            isLocked={isLocked}
            showToast={showToast}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          marginTop: "32px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "rgba(255,255,255,0.35)",
          gap: "4px",
        }}
      >
        <span>
          © {new Date().getFullYear()} My Digital Board 2.0 · Built with
        </span>
        <span style={{ color: "rgba(239,68,68,0.7)" }}>♥</span>
        <span>using</span>
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "rgba(99,179,237,0.6)", textDecoration: "none" }}
        >
          caffeine.ai
        </a>
      </footer>

      {/* ── Overlays ── */}
      <Toast message={toast} />
      <UnlockModal
        isOpen={unlockModalOpen}
        onConfirm={confirmUnlock}
        onCancel={() => setUnlockModalOpen(false)}
      />
    </div>
  );
}
