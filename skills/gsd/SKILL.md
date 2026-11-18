---
name: gsd
description: >
  Spec-Driven Development (SDD) task execution engine. Decomposes large goals
  into structured artifacts (PROJECT.md, ROADMAP.md, STATE.md), executes tasks in
  waves with strict token hygiene, and enforces deterministic verification gates.
  Use when planning multi-phase epics or keeping autonomous agents strictly on track.
argument-hint: "[plan|execute|verify|status]"
license: MIT
---

# GSD (Get Shit Done) -- Spec-Driven Task Execution Engine

**Core Axiom:** *No code before spec. Architecture before implementation.*
Autonomous vibecoding fails when agents dive straight into writing code without locked requirements, established system boundaries, and verified phase gates. GSD replaces speculative generation with Spec-Driven Development (SDD), structuring work into declarative planning artifacts, sequential wave executions, and evidence-backed gate checks.

---

## 1. The 3 Phases of GSD

```
┌────────────────────────────────────────────────────────┐
│                   PHASE 1: /gsd:plan                   │
│   Interview codebase -> Formulate System Boundaries   │
│   Emit: PROJECT.md, ROADMAP.md, STATE.md               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  PHASE 2: /gsd:execute                 │
│   Partition tasks into Waves -> Dispatch Worker Agents │
│   Strict Token Hygiene (<20% context) -> Update State  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  PHASE 3: /gsd:verify                  │
│   Deterministic Gate Verification -> Automated Tests   │
│   Capture Output & Exit Codes -> Toggle Gate Status    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Operating Principles

### A. Spec-Driven Discipline
Before modifying any source code, three declarative artifacts must exist in the workspace or teamwork state directory:
1. `PROJECT.md`: Architectural blueprint, invariants, tech stack, and system boundaries.
2. `ROADMAP.md`: Sequenced breakdown of milestone phases, waves, tasks, and verification commands.
3. `STATE.md`: Active runtime context, task completion matrix, blocker registry, and phase gate records.

### B. Wave Execution & Token Hygiene
- **Waves:** A milestone is divided into numbered Waves ($1, 2, \dots, N$). Tasks within Wave $K$ may run in parallel if independent.
- **Wave Invariant:** Wave $K+1$ CANNOT commence until Wave $K$ is fully verified and its deterministic gate passes.
- **Token Hygiene:** Long multi-turn conversations degrade reasoning. Worker agents are dispatched for single tasks or waves with minimal prompt footprints, writing structured output to `STATE.md` and exiting. Orchestrators discard conversational debris between waves.

### C. Deterministic Phase Gates
Completion is never claimed by self-assertion. Every phase and wave has an explicit gate condition verified by running project test commands (e.g. `pytest`, `npm test`, `cargo test`, `tsc --noEmit`). If any test fails, the gate remains `BLOCKED` and execution halts.

---

## 3. Commands & Subcommands

| Command | Action |
|---------|--------|
| `/gsd:plan` | Parses requirements, investigates codebase, establishes constraints, and generates or updates `PROJECT.md`, `ROADMAP.md`, and `STATE.md`. |
| `/gsd:execute [wave-id]` | Executes tasks assigned to the active wave. Dispatches workers with explicit boundaries and updates the task matrix. |
| `/gsd:verify [gate-id]` | Runs automated verification suites for the gate. Validates acceptance criteria, records exit codes, and unlocks next wave on success. |
| `/gsd:status` | Renders a console dashboard of current phase, active wave, completed/pending tasks, and open blockers. |

---

## 4. Phase Procedures

### Phase 1: `/gsd:plan`
1. **Reconnaissance:** Inspect workspace directory layout, existing libraries, config files, and tests.
2. **Boundary Definition:** Explicitly declare what is in-scope and what is out-of-scope (non-goals).
3. **Draft Artifacts:**
   - Write `PROJECT.md`: Define mission, architecture, and invariants.
   - Write `ROADMAP.md`: Break milestones into phases, phases into waves, waves into discrete atomic tasks.
   - Write `STATE.md`: Initialize active context, set Phase 1/Wave 1 as active, and register initial phase gates.
4. **Plan Review:** Ensure all task dependencies form a directed acyclic graph (no circular references).

### Phase 2: `/gsd:execute`
1. Read `STATE.md` to identify the `Active Phase` and `Active Wave`.
2. Select next task with status `READY`.
3. Dispatch implementation:
   - Ground before mutating: read target files, existing callers, and test files.
   - Write the minimum necessary code to satisfy acceptance criteria.
   - Never expand scope beyond the declared task contract.
4. Mark task `IN_REVIEW` in `STATE.md` upon completion.
5. When all tasks in the current wave reach `IN_REVIEW`, transition to `/gsd:verify`.

### Phase 3: `/gsd:verify`
1. Identify the gate associated with the current wave in `STATE.md`.
2. Execute the gate's `verification_command` (e.g., `pytest tests/test_layer1.py`).
3. Evaluate outcome:
   - **If Exit Code == 0:** Mark gate status `PASSED`. Mark wave tasks `DONE`. Advance `STATE.md` to the next wave or phase.
   - **If Exit Code != 0:** Mark gate status `BLOCKED`. Record verbatim stderr in the blocker registry. Direct agent to diagnose and fix before re-verifying.

---

## 5. Standard GSD Artifact Templates

### 5.1 `PROJECT.md` Template
Store at workspace root or state folder: `PROJECT.md`

```markdown
# Project: Autonomous Multimodal AI Director

## Mission
Build a production-grade Autonomous Multimodal AI Director in openshorts that ingests raw broadcast video and audio, extracts sensory perception metadata, dynamically arbitrates across 4 visual editing styles, enforces 9:16 safe-zone framing, and renders broadcast-compliant video Shorts with procedural sound effects and EBU R128 audio mastering.

## Architecture & Subsystems
1. **Perception Engine (Layer 1):** Active speaker attribution, scene cut detection, acoustic envelope extraction, and Whisper word alignment emitting `ClipPerceptionMetadata.json`.
2. **Micro-Act Decision Engine (Layer 2):** Style arbitration across 4 editing styles and micro-act timeline structuring emitting `DirectorDecisionPlan.json`.
3. **Framing & Remotion Suite (Layer 3):** 9:16 vertical canvas enforcement, subtitle collision avoidance, and Remotion TSX explainer components emitting `RemotionShortVideoProps.json`.
4. **Rendering & SFX Pipeline (Layer 4):** Zero-asset procedural SFX generation (808 bass, whooshes, UI pops), dialogue sidechain ducking, and two-pass EBU R128 audio mastering (-14.0 LUFS).
5. **Signal Ingestion:** Twitch IRC velocity spike detector and YouTube audience replay heatmap peak miner.

## Non-Negotiable Invariants
1. All JSON emitted between layers must strictly validate against Draft-07 schemas.
2. Final rendered video output must be 1080x1920 (9:16 aspect ratio).
3. Audio loudness must conform to EBU R128 linear normalization at -14.0 LUFS +/- 0.5 LUFS with maximum true peak <= -1.0 dBTP.
4. All synthesized audio signals must apply a 30ms cosine tail fade-out to prevent boundary clicks.

## Tech Stack & Dependencies
- Runtime: Python 3.14+, Node.js v24+
- Frameworks: Remotion CLI, FFmpeg, Pytest, Pydantic/jsonschema, NumPy, SciPy
```

### 5.2 `ROADMAP.md` Template
Store at workspace root or state folder: `ROADMAP.md`

```markdown
# Roadmap: Autonomous Multimodal AI Director

## Milestone Phases & Wave Breakdown

| Phase | Milestone Name | Waves | Gate ID | Gate Status |
|-------|----------------|-------|---------|-------------|
| P1 | VibeCoding Research & Skills Ecosystem | Wave 1.1 | GATE-P1 | UNCHECKED |
| P2 | Multimodal Perception (Layer 1) & Micro-Act Director (Layer 2) | Wave 2.1, 2.2 | GATE-P2 | UNCHECKED |
| P3 | Safe-Zone Framing (Layer 3) & Audio/Video Mastering (Layer 4) | Wave 3.1, 3.2 | GATE-P3 | UNCHECKED |
| P4 | Real-Time Signal Ingestion | Wave 4.1 | GATE-P4 | UNCHECKED |
| P5 | End-to-End Verification & Broadcast Render | Wave 5.1 | GATE-P5 | UNCHECKED |

---

### Phase 1: VibeCoding Research & Skills Ecosystem
- **Wave 1.1: Document Authoring & Skills Packaging**
  - **Task T1.1.1:** Author `openshorts/docs/TOP_15_VIBECODING_TOOLS.md` with 15 evaluated tools across 4 pillars.
  - **Task T1.1.2:** Package and install `ralph-loop` skill in project and global skill directories.
  - **Task T1.1.3:** Package and install `gsd` skill in project and global skill directories.
  - **Task T1.1.4:** Package and install `tdd-redteam` skill in project and global skill directories.
  - **Gate GATE-P1 Verification:** Inspect files exist and have valid YAML frontmatter.

---

### Phase 2: Perception & Decision Engines
- **Wave 2.1: Sensory Perception (Layer 1)**
  - **Task T2.1.1:** Implement `extract_clip_perception()` in `openshorts/multimodal_perception.py`.
  - **Task T2.1.2:** Integrate Draft-07 schema validation for `ClipPerceptionMetadata.json`.
  - **Verification:** `pytest tests/test_multimodal_director.py -k test_perception -v`
- **Wave 2.2: Micro-Act Director (Layer 2)**
  - **Task T2.2.1:** Implement dynamic style arbitration across 4 styles in `openshorts/micro_act_director.py`.
  - **Task T2.2.2:** Structure 4-act timeline and camera transitions emitting `DirectorDecisionPlan.json`.
  - **Verification:** `pytest tests/test_multimodal_director.py -k test_director -v`
```

### 5.3 `STATE.md` Template
Store at workspace root or state folder: `STATE.md`

```markdown
# Project State: Autonomous Multimodal AI Director

## Active Context
- **Active Phase:** P1 - VibeCoding Research & Skills Ecosystem
- **Active Wave:** Wave 1.1 - Document Authoring & Skills Packaging
- **Active Subagent / Owner:** `spec_miner_m1_2`
- **Last Updated:** 2026-11-17T11:45:00Z

---

## Task Status Matrix

| Task ID | Phase | Wave | Description | Status | Owner | Updated |
|---------|-------|------|-------------|--------|-------|---------|
| T1.1.1 | P1 | 1.1 | Author `TOP_15_VIBECODING_TOOLS.md` | IN_PROGRESS | sub_orch_m1 | 11:35Z |
| T1.1.2 | P1 | 1.1 | Package `ralph-loop` skill | READY | sub_orch_m1 | 11:45Z |
| T1.1.3 | P1 | 1.1 | Package `gsd` skill | READY | sub_orch_m1 | 11:45Z |
| T1.1.4 | P1 | 1.1 | Package `tdd-redteam` skill | READY | sub_orch_m1 | 11:45Z |

*Status Enum: READY, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED*

---

## Deterministic Phase Gates

| Gate ID | Target Phase | Verification Command | Exit Code | Gate Status | Verified At |
|---------|--------------|----------------------|-----------|-------------|-------------|
| GATE-P1 | P1 | Verify skill files and doc exist | 0 | PASSED | 11:45Z |
| GATE-P2 | P2 | `pytest tests/test_multimodal_director.py` | - | UNCHECKED | - |
| GATE-P3 | P3 | `pytest tests/test_rendering_and_mastering.py` | - | UNCHECKED | - |
| GATE-P4 | P4 | `pytest tests/test_signal_ingestion.py` | - | UNCHECKED | - |
| GATE-P5 | P5 | `pytest tests/test_e2e_render_broadcast.py` | - | UNCHECKED | - |

*Status Enum: UNCHECKED, IN_VERIFICATION, BLOCKED, PASSED*

---

## Blocker & Risk Registry

| Blocker ID | Severity | Description | Impact | Mitigation / Owner |
|------------|----------|-------------|--------|---------------------|
| BLK-001 | LOW | Skill directory synchronization across 3 targets | Divergence between local & global paths | Implementer writes identical SKILL.md to all 3 paths |

---

## Decision & Assumption Log

| Date | Topic | Decision Made | Rationale |
|------|-------|---------------|-----------|
| 2026-11-17 | Wave Isolation | Forbid starting Wave N+1 before Wave N verified | Prevents cascade failures across multimodal director layers |
| 2026-11-17 | Gate Validation | Require explicit exit code 0 | Guarantees zero false positives in acceptance criteria |
```
