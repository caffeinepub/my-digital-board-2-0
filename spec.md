# Specification

## Summary
**Goal:** Build a dual-board personal dashboard ("My Digital Board 2.0") with a Motoko backend for persistent state, featuring an Amazon Workplace Staffing Board and an SNHU University Course Tracker Board, both with drag-and-drop, lock/unlock functionality, and a dark deep-space visual theme.

**Planned changes:**
- Motoko backend actor with stable storage to persist board state (staffing + university cards) keyed by user login, exposing query and update endpoints.
- App shell with a three-section responsive topbar: board selector dropdown (Amazon / SNHU), app title + full date + live clock (updates every second), and a Lock/Unlock button with last-updated timestamp.
- Amazon Staffing Board with 5 columns and their defined subsections (Process Guide → Stow/Pick; In Path Function → Downstacker/Stower/Picker/Transporter; Problem Solve → QXY2/XLX7/IOL-ICQA; LaborShare → Inbound/Outbound; Not Assigned → Default). Each card shows person name, login, shift co-host code, and shift pattern. Drag-and-drop between any subsection with visual drop-target highlighting and per-column/subsection card counts.
- Seed staffing board with Miguel A Davalos card (login: migudavc, shift co-host: DB3T0700, shift pattern: Back Half Days) in Not Assigned/Default; always present on load with no duplicates; legacy key migration included.
- SNHU Course Tracker Board with 3 columns (Current Term, Upcoming Term, Not Assigned). Current and Upcoming each have Pending and In Progress subsections; Not Assigned is a flat drop zone. Seed 4 canonical course cards: ENG 190 (C-2 Term), IDS 105 (C-2 Term), ECO 202 (C-3 Term), PHL 260 (C-3 Term). Cards are draggable between all zones; canonical cards never duplicated; legacy key migration included.
- Board lock/unlock: locked state disables all drag-and-drop on both boards; attempted drag shows a toast "Locked. Unlock to edit."; Unlock requires confirmation modal; lock state persisted and restored on reload.
- Transient toast notification component displayed bottom-center, auto-dismissing after 1.8 seconds; rapid triggers reset the timer.
- Dark deep-space theme: deep navy radial gradient background, frosted-glass panels with backdrop blur, muted white typography, green-tinted primary buttons, amber/red-tinted lock button.

**User-visible outcome:** The user can switch between their Amazon staffing board and SNHU course tracker, drag cards between sections to track assignments and course progress, lock the board to prevent accidental edits, and have all state automatically saved and restored across page reloads via the backend canister.
