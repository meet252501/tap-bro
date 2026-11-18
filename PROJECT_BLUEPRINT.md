# Review AI — Website Design & UI Review Engine

**Review AI** is an autonomous AI system designed to ingest short-form reels, screen recordings, and videos of modern website designs, review their UI/UX architecture, and automatically reconstruct responsive, high-fidelity frontend code.

---

## 🎯 Core Capabilities

1. **Reel-to-Web Deconstruction**:
   - Extracts design DNA directly from video frames: color palettes, typography hierarchy, margins, grid structures, and bento layouts.
   - Identifies micro-interactions: hover states, scroll triggers, kinetic text animations, and 3D canvas objects.

2. **Automated UI/UX Design Review**:
   - Heuristic evaluation (visual hierarchy, cognitive load, accessibility contrast ratios WCAG 2.1).
   - Generates an executive Design Review Scorecard (Awwwards-style rating: Design, Usability, Creativity, Content).

3. **Autonomous Code Synthesis**:
   - Converts the analyzed design into modern frontend components using **React / Next.js**, **Tailwind CSS**, **shadcn/ui**, and **Aceternity UI**.
   - Implements motion dynamics via **Framer Motion**, **GSAP**, and **Lenis** smooth scrolling.

---

## 🛠️ The Tech Stack: AI Models & Production Libraries

### 1. Vision & Multimodal AI Layer
* **Gemini 2.5 Pro / Flash**: Multimodal video frame understanding; extracts layout structure, component boundaries, and typography styling.
* **OpenCV (`opencv-python`)**: Color quantization, dominant palette extraction (hex codes), and UI bounding box detection.

### 2. Frontend & Component Framework
* **Next.js 15 (React 19)**: Modern React framework with App Router and Server Components.
* **Tailwind CSS**: Utility-first styling for dark-mode, glassmorphism, and neon gradient palettes.
* **shadcn/ui**: Accessible UI primitives built on Radix UI.
* **Aceternity UI**: Pre-built viral components (bento grids, spotlight cards, glowing borders, background beams).
* **Magic UI**: Kinetic micro-interactions (animated beams, marquee scrollers, blur fades).

### 3. Motion & 3D Interactive Layer
* **Framer Motion (`motion/react`)**: Spring physics, layout animations, and gesture interactions.
* **GSAP + ScrollTrigger**: Cinematic scroll-driven animations and kinetic typography reveals.
* **Lenis**: Studio Freight smooth momentum scrolling.
* **Spline (`@splinetool/react-spline`)**: Embed interactive 3D elements with mouse tracking.
* **Three.js / React Three Fiber**: WebGL 3D rendering and custom particle shaders.

---

## 📁 Project Architecture

```
reviewai/
├── skills/               # Engineering, reverse-engineering, and review skills
├── rules/                # Operational rules
├── PROJECT_BLUEPRINT.md  # System architecture & stack specification
└── src/                  # (Coming) Review AI ingestion & generation pipeline
```
