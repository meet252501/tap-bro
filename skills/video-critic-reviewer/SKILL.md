---
name: video-critic-reviewer
description: Adversarial multi-modal critic and reviewer agent skill for short-form video generation, podcast clipping, and creative production. Evaluates rendered MP4s against strict 9:16 safe-zone geometry, motion dynamics, anti-static slop rules, word-by-word karaoke typography, and EBU R128 loudness. Rejects substandard or frozen renders before user delivery.
---

# Video Critic Reviewer Agent Skill

Autonomous evaluator-optimizer agent skill inspired by `poseljacob/agentic-video-editor`, `Vchitect/Evaluation-Agent`, and `The-PR-Agent/pr-agent`.

Operates as an **adversarial quality gate** between video rendering and user delivery.

---

## 🎯 When to Use This Skill
- Whenever a video or podcast short is rendered or proposed for delivery.
- When evaluating whether a video clip suffers from "stock/template slop" (frozen cards, letterbox bars, static infographics).
- To verify EBU R128 (-14.0 LUFS) audio mastering, safe-zone clearance, and dynamic pacing.

---

## 📋 The 5-Point Adversarial Audit Rubric

Every candidate short-form video must pass all 5 checks with an overall score $\ge 80.0 / 100$:

| Dimension | Standard | Automatic Failure Condition |
| :--- | :--- | :--- |
| **1. Geometry** | Full-bleed $1080 \times 1920$ (9:16 vertical) | Aspect ratio $\ne 9:16$, letterbox bars, or black pillar bars. |
| **2. Motion Dynamics** | Transient visual shifts every 2.5s - 3.5s | Any static card or overlay lingering $> 4.0\text{s}$, or average inter-frame variance $< 10.0$. |
| **3. Safe Zones** | Subtitles between $Y = 1350\text{px}$ and $1700\text{px}$ | Text overlapping top status bar ($Y < 60$) or bottom platform UI ($Y > 1720$). |
| **4. Audio Loudness** | EBU R128: $-14.0 \pm 0.5\text{ LUFS}$, Peak $\le -1.0\text{ dBTP}$ | Integrated loudness outside $[-15.5, -12.5]\text{ LUFS}$ or clipping peaks $> 0.0\text{ dBFS}$. |
| **5. Subject Framing** | Eye-line in upper 35%-40% of slot, centered horizontally | Speaker mouth obscured by captions, or face cut off at edge of frame. |

---

## 💻 CLI Gatekeeper Execution

Run the deterministic Python auditor directly against any candidate MP4:

```bash
# Run quality gate with minimum 80.0 passing score
py -3 openshorts/quality_gate_critic.py --input <path_to_video.mp4> --min-score 80 --json-out review_report.json
```

### Exit Codes:
* `0`: **PASS** — Video approved for user delivery.
* `2`: **FAIL** — Video rejected! Inspect `criticisms` and `recommendations` in the report and trigger an automated recut.
