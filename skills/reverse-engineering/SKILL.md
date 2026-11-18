---
name: reverse-engineering
description: Reverse engineering and system archeology engine for Antigravity. Inspects APIs, web endpoints, obfuscated code, binary payloads, network requests, DOM structures, and proprietary protocols to extract structured data, reproduce algorithms, and reconstruct functional specifications.
---

# Reverse Engineering & System Archeology Skill

The **Reverse Engineering** skill empowers Antigravity to deconstruct unfamiliar, undocumented, or obfuscated systems, network APIs, web platforms, and binary assets to understand their behavior and build clean-room implementations.

## Core Capabilities

1. **Web & Network API Reverse Engineering:**
   - Inspecting network requests, GraphQL queries, internal JSON payloads (e.g. `ytInitialData`, Instagram GraphQL endpoints, Twitch IRC WebSockets).
   - Bypassing heavy client wrappers by isolating underlying REST/WebSocket protocols.
   - Parsing client-side JavaScript bundles and DOM structures to extract embedded state.

2. **Code & Protocol Archeology:**
   - Deconstructing undocumented libraries and reverse-engineering data contracts (schemas, protobufs, JSON models).
   - Rebuilding clean-room Python / TypeScript implementations from minified or compiled source code.
   - Tracing execution flow from entry points to I/O sinks.

3. **Media & Format Reverse Engineering:**
   - Slicing and demuxing video/audio bitstreams via FFmpeg without transcoding.
   - Parsing binary metadata, EXIF, and container formats (MP4, MKV, ASS, WAV).
   - Reverse-engineering visual UI layouts and reproducing them with programmatic frameworks (Remotion, CSS, Three.js).

## Standard Workflow

```
[Target Asset / URL / Binary]
           │
           ▼
[Surface Reconnaissance]      (Headers, network calls, query params, DOM entities)
           │
           ▼
[Payload Isolation]           (Capturing raw JSON, stream URLs, or bytecode)
           │
           ▼
[Schema & Protocol Modeling]  (Defining Pydantic / TypeScript data contracts)
           │
           ▼
[Clean-Room Implementation]   (Writing native, zero-dependency client logic)
```
