// ─── Column / section definitions ────────────────────────────────────────────

export const STAFFING_COLS = [
  {
    key: "pg",
    title: "Process Guide",
    sections: [
      { key: "pg_stow", title: "Stow" },
      { key: "pg_pick", title: "Pick" },
    ],
    dropKey: null as string | null,
  },
  {
    key: "ipf",
    title: "In Path Function",
    sections: [
      { key: "ipf_down", title: "Downstacker" },
      { key: "ipf_stow", title: "Stower" },
      { key: "ipf_pick", title: "Picker" },
      { key: "ipf_trans", title: "Transporter (Stow or Pick)" },
      { key: "ipf_qxy2_ps", title: "QXY2 Problem Solve" },
      { key: "ipf_icqa_iol", title: "ICQA IOL" },
    ],
    dropKey: null as string | null,
  },
  {
    key: "ls",
    title: "LaborShare",
    sections: [
      { key: "ls_in_ps", title: "XLX7 Inbound Problem Solve" },
      { key: "ls_out_ps", title: "XLX7 Outbound Problem Solve" },
      { key: "ls_ws", title: "XLX7 WaterSpider" },
    ],
    dropKey: null as string | null,
  },
  {
    key: "na",
    title: "Not Assigned",
    sections: null as null,
    dropKey: "staff_na" as string | null,
  },
];

export const SNHU_COLS = [
  {
    key: "cur",
    title: "Current Term",
    sections: [
      { key: "cur_pending", title: "Assignments Pending" },
      { key: "cur_progress", title: "In Progress Assignments" },
    ] as { key: string; title: string }[] | null,
    dropKey: null as string | null,
  },
  {
    key: "up",
    title: "Upcoming Term",
    sections: null as { key: string; title: string }[] | null,
    dropKey: "up_term" as string | null,
  },
  {
    key: "na",
    title: "Not Assigned",
    sections: null as { key: string; title: string }[] | null,
    dropKey: "snhu_na" as string | null,
  },
];

// ─── Card types ───────────────────────────────────────────────────────────────

export interface StaffCard {
  id: string;
  personName: string;
  login: string;
  shiftCoHost: string;
  shiftPattern: string;
  col: string;
  createdBy: string;
  createdAt: string;
}

export interface CourseCard {
  id: string;
  title: string;
  term: string;
  col: string;
  createdBy: string;
  createdAt: string;
}

export interface AppBoardState {
  staffing: { cards: StaffCard[] };
  university: { cards: CourseCard[] };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function miguelCard(): StaffCard {
  return {
    id: "miguel-fixed",
    personName: "Miguel A Davalos",
    login: "migudavc",
    shiftCoHost: "DB3T0700",
    shiftPattern: "Back Half Days",
    col: "staff_na",
    createdBy: "migudavc",
    createdAt: new Date().toISOString(),
  };
}

export function snhuCanonicalCards(): CourseCard[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: "snhu-eng190",
      title: "ENG 190: Research and Persuasion",
      term: "C-2 Term - March thru April 2026",
      col: "snhu_na",
      createdBy: "migudavc",
      createdAt: nowIso,
    },
    {
      id: "snhu-ids105",
      title: "IDS 105: Awareness and Online Learning",
      term: "C-2 Term - March thru April 2026",
      col: "snhu_na",
      createdBy: "migudavc",
      createdAt: nowIso,
    },
    {
      id: "snhu-eco202",
      title: "ECO 202: Macroeconomics",
      term: "C-3 Term - May thru June 2026",
      col: "snhu_na",
      createdBy: "migudavc",
      createdAt: nowIso,
    },
    {
      id: "snhu-phl260",
      title: "PHL 260: Ethical Decision-Making & Problem-Solving",
      term: "C-3 Term - May thru June 2026",
      col: "snhu_na",
      createdBy: "migudavc",
      createdAt: nowIso,
    },
  ];
}

// ─── Migration ────────────────────────────────────────────────────────────────

const VALID_STAFFING_COLS = new Set([
  "pg_stow",
  "pg_pick",
  "ipf_down",
  "ipf_stow",
  "ipf_pick",
  "ipf_trans",
  "ipf_qxy2_ps",
  "ipf_icqa_iol",
  "ls_in_ps",
  "ls_out_ps",
  "ls_ws",
  "staff_na",
]);

export function migrateStaffingCol(oldCol: string): string {
  if (VALID_STAFFING_COLS.has(oldCol)) return oldCol;
  // Old Problem Solve column sections → IPF / LaborShare
  if (oldCol === "ps_qxy2") return "ipf_qxy2_ps";
  if (oldCol === "ps_iol") return "ipf_icqa_iol";
  if (oldCol === "ps_xlx7") return "ls_in_ps";
  // Old LaborShare sections
  if (oldCol === "ls_in") return "ls_in_ps";
  if (oldCol === "ls_out") return "ls_out_ps";
  // Other legacy keys
  if (oldCol === "na_default") return "staff_na";
  if (oldCol === "na") return "staff_na";
  if (oldCol === "planned") return "pg_stow";
  if (oldCol === "onFloor") return "ipf_qxy2_ps";
  if (oldCol === "break") return "ls_in_ps";
  if (oldCol === "off") return "staff_na";
  return "staff_na";
}

const VALID_SNHU_COLS = new Set([
  "cur_pending",
  "cur_progress",
  "up_term",
  "snhu_na",
]);

export function migrateSnhuCol(oldCol: string): string {
  if (VALID_SNHU_COLS.has(oldCol)) return oldCol;
  // Legacy upcoming subsections → flat up_term
  if (oldCol === "up_pending" || oldCol === "up_progress") return "up_term";
  if (oldCol === "bus206_doing" || oldCol === "doing") return "cur_progress";
  if (oldCol === "bus206_todo") return "cur_pending";
  return "snhu_na";
}

// ─── Normalization ────────────────────────────────────────────────────────────

export function ensureMiguelCard(cards: StaffCard[]): StaffCard[] {
  const hasMiguel = cards.some(
    (c) =>
      c &&
      c.login === "migudavc" &&
      c.personName.toLowerCase().includes("miguel"),
  );
  if (hasMiguel) return cards;
  return [miguelCard(), ...cards];
}

export function normalizeSnhuCards(cards: CourseCard[]): CourseCard[] {
  const canonical = snhuCanonicalCards();
  const canonById = new Map(canonical.map((c) => [c.id, c]));
  const keyOf = (c: CourseCard) => `${c.title.trim()}||${c.term.trim()}`;
  const canonKeys = new Set(canonical.map(keyOf));

  const existingById = new Map<string, CourseCard>();
  for (const c of cards) if (c?.id) existingById.set(c.id, c);

  const result: CourseCard[] = [];
  for (const canon of canonical) {
    const existing = existingById.get(canon.id);
    // Always use canonical title/term, but preserve the user's col placement
    result.push({ ...canon, col: existing?.col ? existing.col : "snhu_na" });
  }
  for (const c of cards) {
    if (!c) continue;
    if (canonById.has(c.id)) continue;
    if (canonKeys.has(keyOf(c))) continue;
    result.push(c);
  }
  return result;
}

// ─── Default state ────────────────────────────────────────────────────────────

export function defaultAppState(): AppBoardState {
  return {
    staffing: { cards: [miguelCard()] },
    university: { cards: snhuCanonicalCards() },
  };
}

// ─── Backend serialization ────────────────────────────────────────────────────
// We encode our rich card data into the backend's Card type:
//   - staffCard: title = JSON of {personName, login, shiftCoHost, shiftPattern, id, createdBy, createdAt}
//                description = col (section key)
//                position = [0n, 0n]
//   - courseCard: title = JSON of {id, title, term, createdBy, createdAt}
//                 description = col (section key)
//                 position = [1n, 0n]

import type { BoardState, Card } from "../backend";

let _idCounter = 1n;
function nextId(): bigint {
  return _idCounter++;
}

export function appStateToBackend(state: AppBoardState): BoardState {
  const staffCards: Card[] = state.staffing.cards.map((c) => ({
    id: nextId(),
    title: JSON.stringify({
      id: c.id,
      personName: c.personName,
      login: c.login,
      shiftCoHost: c.shiftCoHost,
      shiftPattern: c.shiftPattern,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
    }),
    description: c.col,
    position: [0n, 0n] as [bigint, bigint],
  }));

  const courseCards: Card[] = state.university.cards.map((c) => ({
    id: nextId(),
    title: JSON.stringify({
      id: c.id,
      title: c.title,
      term: c.term,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
    }),
    description: c.col,
    position: [1n, 0n] as [bigint, bigint],
  }));

  return { staffCards, courseCards };
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function backendToAppState(bs: BoardState): AppBoardState {
  const staffCards: StaffCard[] = bs.staffCards
    .map((c) => {
      const parsed = safeParse<Partial<StaffCard>>(c.title, {});
      if (!parsed.id) return null;
      return {
        id: parsed.id,
        personName: parsed.personName ?? "",
        login: parsed.login ?? "",
        shiftCoHost: parsed.shiftCoHost ?? "",
        shiftPattern: parsed.shiftPattern ?? "",
        col: migrateStaffingCol(c.description),
        createdBy: parsed.createdBy ?? "",
        createdAt: parsed.createdAt ?? "",
      } as StaffCard;
    })
    .filter(Boolean) as StaffCard[];

  const courseCards: CourseCard[] = bs.courseCards
    .map((c) => {
      const parsed = safeParse<Partial<CourseCard>>(c.title, {});
      if (!parsed.id) return null;
      return {
        id: parsed.id,
        title: parsed.title ?? "",
        term: parsed.term ?? "",
        col: migrateSnhuCol(c.description),
        createdBy: parsed.createdBy ?? "",
        createdAt: parsed.createdAt ?? "",
      } as CourseCard;
    })
    .filter(Boolean) as CourseCard[];

  return {
    staffing: {
      cards: ensureMiguelCard(
        staffCards.map((c) => ({ ...c, col: migrateStaffingCol(c.col) })),
      ),
    },
    university: {
      cards: normalizeSnhuCards(
        courseCards.map((c) => ({ ...c, col: migrateSnhuCol(c.col) })),
      ),
    },
  };
}
