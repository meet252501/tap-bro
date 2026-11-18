---
name: viral-video-reverse-engineer
description: Reverse-engineers any viral short-form video, Instagram Reel, TikTok, or podcast clip into a scene-by-scene edit blueprint (shot list, camera movement, typography/caption style, cut pacing, and sound design) and generates executable FFmpeg/Remotion replication pipelines.
---

# Viral Video Reverse-Engineering & Style Replicator Skill

The **Viral Video Reverse-Engineer** skill empowers Antigravity to deconstruct any high-performing reference short-form video (Instagram Reel, TikTok, YouTube Short, or podcast clip) into its fundamental filmmaking DNA. It extracts scene-by-scene shot cuts, camera movements, caption typography, edit pacing, and sound design cues, and compiles an executable code blueprint to reproduce the exact aesthetic on any raw footage.

---

## 1. Core Principles & Strict Invariants

### 🚫 The Split-Screen Invariant
* **NEVER split a single-person shot:** Splitting a camera shot that only features one subject cuts their face in half and duplicates them across panels.
* **Split-screens require concurrent subjects:** A stacked split-screen ($1080 \times 960$ top, $1080 \times 960$ bottom) is **ONLY** valid when:
  1. The footage is a genuine wide two-shot where both host and guest are physically in the frame (`face_count >= 2`).
  2. The video is a screencast walkthrough where the top panel is the presenter and the bottom panel is the screen recording/demo UI.
* **Multi-Camera Single Shots:** When the footage consists of alternating close-ups, use **Dynamic Active-Speaker Auto-Cutting** (Opus Clip / AutoPod standard) with kinetic punch-in zooms.

---

## 2. 5-Layer Reverse-Engineering Workflow

```
[Reference URL or Local MP4]
           │
           ▼
[Layer 1: Scene & Shot Archeology]      (TransNetV2 / Scene Detection, Face Count, Framing)
           │
           ▼
[Layer 2: Camera Movement Extraction]   (Kinetic Punch-In Zooms: 1.12x-1.25x, Panning, Holds)
           │
           ▼
[Layer 3: Caption & Typography DNA]     (Font, Size, Glowing Active-Word Color, Safe Zones)
           │
           ▼
[Layer 4: Edit Rhythm & Sound Design]   (Cut Tempo BPM, 808 Bass Drops, Whooshes, -14 LUFS)
           │
           ▼
[Layer 5: Replicator Code Generator]    (Executable FFmpeg / Remotion Composition)
```

---

## 3. Style Archetypes Catalog

Based on empirical analysis of viral reference reels:

| Archetype | Reference Reel | Key Characteristics | Caption Style | Camera Dynamics |
| :--- | :--- | :--- | :--- | :--- |
| **Dark Studio Podcast** | `Dfj-XDABg3G` | Dark moody studio, SM7B mic, warm rim light, wooden desk | Modern bold sans-serif, **Electric Lime (`#C6FF00`)** glowing pop, 2-line safe zone | Medium shot establishing $\rightarrow$ $1.25\times$ punch-in zoom on emphasis |
| **Hormozi Kinetic Pop** | `hormozi_doac` | High-energy founder masterclass, intense eye contact | Anton uppercase, **Gold (`#FFE500`)** active word, 7px black outline | Frequent $1.15\times$ punch-in cuts on power words ("PAIN", "PROFIT") |
| **Screencast + Hook Pill** | `Dc_cSU9TbCD` & `DfvEkf3KpgA` | Screen recording / UI demo with floating presenter cutout | Subtitle pill badge (dark rounded rect), white text with active pop | Zoom-ins to cursor clicks and active software windows |
| **Bold Impact Hook** | `Df1Uf1eqwzq` | Direct-to-camera creator, high energy, immediate hook | Large uppercase **Yellow Impact** text anchored in top third | Handheld dynamic energy, tight framing |
| **Minimalist Tech Explainer** | `De_y3h3x-8e` | Creator hook with physical prop (forehead mic, sticky note) | Black frosted floating card with serif/clean text | Eye-level direct gaze, fast cuts (< 2.5s) |

---

## 4. How to Use the Engine

### CLI Command:
```bash
py -3 openshorts/reverse_engineer_video.py --input <path_or_url> --output-dir openshorts/output/reverse_engineered_<id>
```

### Outputs Generated:
1. `REVERSE_ENGINEERED_BLUEPRINT.json`: Machine-readable data contract containing all scenes, timestamps, bounding boxes, and typography attributes.
2. `REVERSE_ENGINEERED_DOSSIER.md`: Human-readable executive audit table with shot-by-shot breakdown.
3. `scene_XX_<time>s.jpg`: Extracted high-res midpoint preview frames for visual verification.

---

## 5. Replicating the Style onto Raw Footage

Once the blueprint is generated, apply it to target footage using `apply_reverse_engineered_style.py` or by passing the JSON parameters to the `OpenShorts` autonomous director pipeline.

### Verification Gate:
Every generated video MUST pass `quality_gate_critic.py` with score $\ge 80/100$ and zero face-severance or duplicate-person defects.
