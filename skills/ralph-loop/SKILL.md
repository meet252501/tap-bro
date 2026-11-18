---
name: ralph-loop
description: >
  Autonomous iterative execution harness based on the Ralph / snarktank loop.
  Solves context rot by executing small user stories in ephemeral, clean-context
  sub-sessions driven by prd.json, atomic git commits, and progress.txt tracking.
  Use when executing multi-story milestones autonomously without context degradation.
argument-hint: "[init|start|status|resume|<story-id>]"
license: MIT
---

# Ralph Loop -- Ephemeral Context Autonomous Story Iteration

**Core Axiom:** *Defeat context rot by restarting.*
Long-running AI agent sessions degrade: token histories saturate, hallucination rates climb, and error recovery fails. The Ralph Loop breaks engineering epics into independent, single-story micro-sessions. The agent process is disposable; persistent state lives strictly on disk in `prd.json`, `progress.txt`, and the Git commit log.

---

## 1. The 5 Invariants

1. **One Story Per Session:** Never execute more than one user story in a single conversation context. Complete the story, commit, log, and exit.
2. **Git is the Source of Truth:** Every completed story ends with an atomic git commit (`feat(<story-id>): <title>`). Uncommitted changes are discarded on failure.
3. **No Pass, No Commit:** A story is ONLY marked `completed` if its explicit `verification_command` exits with code 0. Stale evidence or self-review does not count.
4. **Append-Only Progress Audit:** `progress.txt` is never rewritten or cleared during a loop. Every attempt, pass, fail, and lesson learned is appended chronologically.
5. **Clean Working Tree:** Before starting a story, `git status --porcelain` must be clean. If uncommitted work exists, stash or commit it first.

---

## 2. Operational Modes & Commands

| Command | Action |
|---------|--------|
| `/ralph-loop init` | Scaffolds a new `prd.json` and empty `progress.txt` template in the workspace root. |
| `/ralph-loop start` | Reads `prd.json`, selects the first eligible pending story, and begins execution. |
| `/ralph-loop status` | Outputs completion summary: total stories, completed, pending, blocked, and remaining budget. |
| `/ralph-loop resume` | Resumes the loop after resolving a blocker or test failure. |
| `/ralph-loop <story-id>` | Forces execution of a specific story (e.g. `/ralph-loop US-003`), validating dependencies first. |

---

## 3. Standard Execution Lifecycle (Per Iteration)

Each iteration follows an uncompromising 7-step sequence:

```
[Boot Clean Session]
         │
         ▼
 1. Check Git Clean ────(Dirty)───► [Stash / Abort]
         │ (Clean)
         ▼
 2. Read prd.json & progress.txt
         │
         ▼
 3. Select Next Eligible "pending" Story
         │
         ▼
 4. Set Status = "in_progress" in prd.json
         │
         ▼
 5. Implement Story (Shortest Working Diff / YAGNI)
         │
         ▼
 6. Run verification_command
         │
    ┌────┴──────────────────────────┐
(Passed)                         (Failed)
    │                               │
    ▼                               ▼
Commit: feat(US-xxx): ...       Fix within 2 attempts?
Update prd.json: "completed"        ├─ Yes ─► (Re-test)
Append to progress.txt              └─ No  ─► [git restore .]
    │                                         Update: "failed" / "blocked"
    ▼                                         Log error in progress.txt
[Exit Cleanly for Next Session]               [Exit / Halt Loop]
```

### Step-by-Step Procedure

1. **Working Tree Check:**
   Execute `git status --porcelain`. If output is non-empty, stop immediately. Do not build on dirty state.

2. **State & Memory Ingestion:**
   - Read `prd.json` to inspect all user stories and dependency chains.
   - Read the last 30 lines of `progress.txt` to internalize lessons learned, pitfalls, and architectural choices from previous sessions.

3. **Story Selection:**
   Find the first story where `status == "pending"` and all story IDs in `dependencies` have `status == "completed"`. If no stories qualify, check if all are done:
   - If all completed: emit `"ALL STORIES COMPLETED"` and exit.
   - If pending stories have unmet dependencies or blockers: report blocker and halt.

4. **Claim Story:**
   Update `prd.json` setting `status: "in_progress"` and `started_at: "<UTC-TIMESTAMP>"`.

5. **Implementation:**
   - Read target files, existing tests, and callers before mutating.
   - Apply the shortest working diff that satisfies the `acceptance_criteria`.
   - Never add speculative features, wrappers, or unnecessary abstractions.

6. **Deterministic Verification:**
   Run the exact `verification_command` defined on the story (e.g., `pytest tests/test_feature.py -v`).
   - If tests fail: diagnose and attempt up to 2 focused fixes.
   - If still failing: abort. Run `git restore .` to revert uncommitted mutations. Update `status: "failed"` in `prd.json`, append error details to `progress.txt`, and exit.

7. **Commit & Handoff:**
   - Stage relevant files: `git add <modified_files> prd.json progress.txt`.
   - Commit: `git commit -m "feat(<story-id>): <title>"`.
   - Capture commit SHA: `git rev-parse --short HEAD`.
   - Update `prd.json`: `status: "completed"`, `commit_sha: "<sha>"`, `completed_at: "<UTC-TIMESTAMP>"`.
   - Append completion record to `progress.txt` using the standard entry format.
   - Exit the process cleanly so the outer loop restarts with 0 prior token baggage.

---

## 4. Reference Templates

### 4.1 `prd.json` Schema & Template

Store at workspace root: `prd.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "project": "Autonomous Multimodal AI Director",
  "version": "1.0.0",
  "description": "Production multimodal director pipeline spanning perception, decision, framing, and rendering.",
  "stories": [
    {
      "id": "US-001",
      "title": "Active Speaker Floor Attribution Module",
      "description": "Extract speech boundaries and attribute active speaker conversational turns using RMS audio energy and pitch contour.",
      "dependencies": [],
      "acceptance_criteria": [
        "Returns active speaker intervals with start/end timestamps",
        "Computes 50ms sliding RMS energy envelope",
        "Emits ClipPerceptionMetadata draft-07 valid JSON",
        "Unit tests pass with 100% assertion coverage"
      ],
      "verification_command": "pytest tests/test_multimodal_director.py -k test_active_speaker -v",
      "status": "pending",
      "assigned_to": null,
      "commit_sha": null,
      "started_at": null,
      "completed_at": null
    },
    {
      "id": "US-002",
      "title": "Scene Cut Boundary Detector",
      "description": "Detect video cut transitions via visual scene difference and TransNetV2 shot prediction.",
      "dependencies": ["US-001"],
      "acceptance_criteria": [
        "Identifies hard and soft scene transitions",
        "Outputs shotBoundariesSec array matching video duration",
        "Passes edge case test with static 10-second video"
      ],
      "verification_command": "pytest tests/test_multimodal_director.py -k test_scene_cuts -v",
      "status": "pending",
      "assigned_to": null,
      "commit_sha": null,
      "started_at": null,
      "completed_at": null
    }
  ]
}
```

### 4.2 `progress.txt` Audit Log Template

Store at workspace root: `progress.txt`

```text
================================================================================
RALPH LOOP AUDIT LOG
Project: Autonomous Multimodal AI Director
Initialized: 2026-11-17T11:30:00Z
================================================================================

--------------------------------------------------------------------------------
[2026-11-17T11:40:00Z] STORY COMPLETED: US-001 - Active Speaker Floor Attribution
Status: SUCCESS
Commit SHA: e4f2b1a
Duration: 184s
Modified Files:
  - openshorts/multimodal_perception.py
  - tests/test_multimodal_director.py
Verification Output:
  Command: pytest tests/test_multimodal_director.py -k test_active_speaker -v
  Result: PASSED (6 passed in 1.42s)
Lessons Learned & Architectural Notes:
  - 50ms sliding window requires minimum 0.05s buffer to avoid boundary underflow.
  - Silent intervals under 300ms should be bridged to prevent rapid speaker jitter.
--------------------------------------------------------------------------------
```

---

## 5. Outer Loop Harness Implementation

To run Ralph Loop continuously across ephemeral sessions, execute an outer runner script on the host system:

### PowerShell Runner (`ralph.ps1`)
```powershell
param (
    [string]$PrdPath = "prd.json",
    [int]$MaxIterations = 20
)

$iteration = 0
while ($iteration -lt $MaxIterations) {
    $iteration++
    Write-Host "`n>>> [Ralph Loop] Starting Iteration #$iteration (Prd: $PrdPath) <<<" -ForegroundColor Cyan
    
    # Check if pending stories remain
    $prd = Get-Content $PrdPath | ConvertFrom-Json
    $pending = $prd.stories | Where-Object { $_.status -eq "pending" }
    if (-not $pending) {
        Write-Host ">>> [Ralph Loop] All stories completed! Exiting loop." -ForegroundColor Green
        break
    }
    
    # Invoke fresh subagent or CLI harness here (e.g., gemini, claude, or teamwork agent)
    # The session MUST be ephemeral and exit upon finishing one story
    Write-Host ">>> [Ralph Loop] Invoking fresh agent session for story $($pending[0].id)..." -ForegroundColor Yellow
    
    # Wait for process exit and inspect updated prd.json
    Start-Sleep -Seconds 2
}
```
