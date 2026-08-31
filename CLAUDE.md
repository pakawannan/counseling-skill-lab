# CLAUDE.md — Counseling Skill Lab

## Project mission

Counseling Skill Lab is a Thai university learning platform for deliberate practice of counseling skills. Its educational identity is **Counselor in Progress — ทุกการฝึก คือการเติบโต**.

The app supports:

- public landing page
- student room entry with room code, student ID, and PIN
- Student Dashboard and Lesson Hub
- Learn → Identify → Choose → Produce → Practice pathway
- immediate feedback and personal score history
- instructor-only dashboard
- room creation, invite link, and QR code
- quiz builder, essay grading, and student analytics
- Cloudflare D1 persistence

## Non-negotiable academic and ethical rules

1. Preserve the person-centered foundation associated with Carl Rogers.
2. Use the Thai term **ความเข้าใจอย่างลึกซึ้ง (empathic understanding)**.
3. Use **การเผชิญหน้า (Confrontation)**.
4. Use **การประเมินความปลอดภัยและการดูแลเมื่อพบสัญญาณอันตราย**.
5. Do not present quiz scores as the sole evidence of professional readiness.
6. Do not turn learning activities into diagnostic or mental-health assessment tools.
7. Do not infer diagnosis, intention, trauma, or risk beyond the information in a scenario.
8. When a scenario suggests danger to self or others, prioritize direct safety assessment and institutional procedure over ordinary skill practice.
9. Maintain dignity, autonomy, confidentiality, informed consent, cultural sensitivity, and appropriate referral.
10. Do not rewrite academic content, answers, citations, or safety guidance without explicit approval from the project owner.

## Language rules

- The interface and teaching content are Thai-first.
- Keep the skill name in Thai followed by English when first introduced.
- Client speech labeled `Cl` must sound like ordinary spoken Thai, not textbook prose.
- Counselor speech labeled `Co` must sound natural, respectful, concise, and professionally appropriate.
- Avoid translation-like phrases and excessive abstract nouns.
- Prefer everyday Thai such as `อะไร`, `เรื่องไหน`, and `ใคร` over unnecessarily formal forms such as `สิ่งใด`, `เรื่องใด`, and `ผู้ใด`.
- Incorrect examples must be wrong because of counseling technique, not because the sentence is obviously unnatural.

## Design system

- Primary: Sage Green / Soft Teal `#7A9A95`
- Background: Warm Sand / Soft Cream `#FBF9F1`
- Accent: Soft Terracotta `#E07A5F`
- Text: Dark Slate `#2D3748`
- Rounded corners: 12–16px
- Minimum interactive target: 44×44 CSS pixels
- Body copy should normally be 15–16px or larger.
- Maintain WCAG 2.2 AA contrast.
- Preserve Light and Dark modes.
- Practice pages must not use a timer unless a teacher-created quiz explicitly requires one.

## Architecture

- React 19 + TypeScript
- Vinext / Vite
- Tailwind CSS 4 and Shadcn UI
- Cloudflare Worker
- Cloudflare D1 + Drizzle ORM

Important locations:

- `app/counseling-app.tsx` — student UI and primary client flows
- `app/teacher/` — instructor-only dashboard
- `app/api/student/` — student APIs
- `app/api/teacher/` — instructor APIs
- `app/data/` — lesson content and question banks
- `app/globals.css` — visual system and responsive styling
- `db/schema.ts` — database schema
- `drizzle/` — database migrations
- `public/mascots/` — mascot assets

## Authentication and authorization

- Students authenticate locally with room code, student ID, and a four-digit PIN.
- The teacher route is protected server-side.
- On OpenAI Sites, teacher identity is supplied through Sign in with ChatGPT.
- `TEACHER_EMAILS` is the server-side allowlist.
- Hiding the teacher menu is not authorization.
- If porting away from OpenAI Sites, replace `app/chatgpt-auth.ts` with the target platform's authentication while preserving server-side allowlist or role checks.

## Data protection

- Never log raw PINs, session tokens, student answers, or identifying information.
- Do not expose answer keys in student-facing API responses before submission.
- Keep teacher APIs server-authorized.
- Preserve hashing and session validation.
- Treat student IDs, answers, scores, and feedback as protected educational data.
- Before production use, define retention, deletion, export, breach response, and access policies consistent with PDPA and university policy.

## Setup

Requirements:

- Node.js 22.13+
- npm
- Cloudflare D1-compatible environment for full persistence

Commands:

```bash
npm ci
npm run dev
npm run build
```

Environment:

```text
TEACHER_EMAILS=teacher@example.ac.th
```

The D1 binding must be named `DB`. Apply migrations from `drizzle/` in numerical order.

## Development workflow

Before changing code:

1. Read this file.
2. Identify whether the change affects academic content, ethics, safety, authentication, or student data.
3. Preserve existing behavior unless the user explicitly requests a change.
4. Make the smallest coherent change.
5. Validate JSON question banks with `jq empty`.
6. Run `npm run build`.
7. Report exactly what changed and any remaining deployment configuration.

## Content editing checks

When changing question banks:

- keep 24 items per skill unless explicitly instructed otherwise
- preserve the intended balance of correct and incorrect items
- verify `answer`, `reason`, `fix`, and `note` remain aligned
- confirm `Cl` and `Co` roles have not been reversed
- review sensitive language
- avoid adding unsupported clinical claims

## Do not

- do not remove server-side instructor authorization
- do not hard-code real teacher email addresses, tokens, project IDs, or student data
- do not replace D1 persistence with browser-only storage for production records
- do not auto-grade free-text counseling responses as professionally correct without an approved rubric and human oversight
- do not change references or counseling theory by guessing
- do not add timers to reflective skill practice
