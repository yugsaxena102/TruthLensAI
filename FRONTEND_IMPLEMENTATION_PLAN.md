# FRONTEND IMPLEMENTATION PLAN

## 1. High Level Project Understanding
TruthLens AI is a production-grade AI-powered Fake News Verification Platform. The backend is fully complete and serves as a strict API contract. It utilizes machine learning models (XGBoost), transformer pipelines (RoBERTa, BERT, DistilBERT), and an advanced LLM-based verification layer (Gemini). 

This plan details the exact frontend upgrades required to bring the React/Vite interface to parity with the backend's rich feature set. The goal is to build a polished, production-ready AI user experience where every backend capability (especially Research Mode and Evidence-Based Verification) is thoughtfully communicated to the user, without modifying backend behavior, redesigning the existing aesthetic, or replacing the architecture.

---

## 2. Production Mode Representation
The frontend must fully leverage the `ProductionResponse` object.
*   **Current State:** Utilizes ML predictions, confidence, inference time, keywords, and reason.
*   **Improvements Required:** 
    *   Integrate the `verification` object seamlessly into the results view.
    *   **Evidence-Based Verification:** Display the `verdict`, `confidence`, `summary`, and `reasoning`.
    *   **Trusted Sources:** Present the array of trusted sources natively.
    *   **Information Hierarchy:** Separate the RoBERTa ML classification from the Gemini Verification clearly. 

---

## 3. Research Mode (First-Class Experience)
Research Mode is a major feature of TruthLens AI and must be treated with equal weight to Production Mode.
*   **Current State:** Evaluates BERT, DistilBERT, RoBERTa, and majority voting.
*   **Improvements Required:**
    *   **XGBoost Inclusion:** The backend returns an optional `xgboost` prediction. The frontend must gracefully handle and visualize XGBoost alongside the transformers.
    *   **Detailed Comparisons:** Utilize the comprehensive `comparison` object (which holds explicit predictions and confidence scores for every model).
    *   **Research Verification:** Like Production Mode, Research Mode now includes the Gemini `verification` object. This must be presented as the final capstone of the research ensemble.
    *   **Visual Parity:** Research mode results should have identical polish, utilizing clear progress bars for every model in the ensemble to visually justify the `majority_voting` outcome.

---

## 4. Pipeline Visualization (`Pipeline.tsx`)
The pipeline component must make the AI feel alive, transparent, and actively working.
*   **Backend Alignment:** 
    *   *Production:* Input → Preprocessing → RoBERTa → XAI → **Trusted Search** → **Retriever** → **Gemini Verification** → Final Response.
    *   *Research:* Input → Preprocessing → BERT → DistilBERT → RoBERTa → **XGBoost** → Majority Voting → XAI → **Trusted Search** → **Retriever** → **Gemini Verification** → Final Response.
*   **Animation & Progress:** Nodes should actively pulse or highlight during their simulated execution. 
*   **System Logs:** The scrolling system logs below the pipeline must output text matching these new phases (e.g., "[RETRIEVER] Querying trusted databases...", "[GEMINI] Generating verification summary...").
*   **Loading States:** Introduce smooth transitions between steps to give the illusion of deep analytical processing, preventing a jarring instant-snap to the results.

---

## 5. Verification & Source Presentation
The `verification` payload provides rich context that requires professional presentation.
*   **Verdict Presentation:** Distinct visual styles for verdicts (e.g., `Verified` = Emerald, `False` = Red, `Misleading` = Amber/Gold, `Insufficient Evidence` = Slate/Gray).
*   **Summary & Reasoning:** 
    *   **Summary:** Rendered as a bold, high-level TL;DR block.
    *   **Reasoning:** Rendered in a readable, well-spaced typographic block, maintaining line-height and legibility for long LLM outputs.
*   **Source Presentation:** 
    *   Do not just render plain HTML links. 
    *   Create **Source Cards/Badges**: Clickable, pill-shaped or card-based badges that include a link icon, the source name, and an external indicator.
    *   **Official Source Indication:** Visually differentiate sources to emphasize credibility.

---

## 6. Confidence Visualization
Confidence should not just be a text percentage.
*   **Progress Indicators:** Use horizontal capacity bars or circular progress rings to map 0-100% confidence visually.
*   **Status Colors:** Map confidence thresholds to colors (e.g., >80% strong green/red, 50-80% moderate amber).
*   **Consistency:** Maintain the same visual language for ML confidence, Verification confidence, and Individual Transformer confidence in Research mode.

---

## 7. Result Organization
Users must easily distinguish between the deterministic ML layer and the generative Verification layer.
*   **Hierarchy:** 
    1.  **Top Level:** Final Verdict / Classification (The big takeaway).
    2.  **Middle Level:** The AI Models (RoBERTa / Ensemble) & Explainable AI Keywords.
    3.  **Bottom Level:** The Evidence-Based Verification (Summary, Reasoning, Sources).
*   **Layout:** Use distinct glass-panel cards with clear headers (e.g., "ML Classification" vs "Evidence Verification") to prevent cognitive overload.

---

## 8. Page-by-Page Feature Mapping

### Single Analysis (`SingleAnalysis.tsx`)
*   Fully implement the updated Pipeline.
*   Implement the Result Organization hierarchy.
*   Display the complete Verification payload.

### Batch Analysis (`BatchAnalysis.tsx`)
*   The API returns an array of `PredictResponse` (which includes Verification).
*   **Action:** Add an expandable row feature or a "Details" modal/tooltip for each table item, allowing users to view the `verdict`, `verification.confidence`, and `summary` for bulk items without cluttering the main table columns.

### Analytics (`Analytics.tsx`) & Dashboard (`Dashboard.tsx`)
*   While the backend analytics/history payloads do not currently include verification metrics, the frontend components must be hardened for edge cases.
*   **Action:** Improve loading skeleton states. Add graceful empty states if the timeline or pie distributions are completely empty.

### History Logs (`HistoryLogs.tsx`)
*   **Action:** Ensure the UI scales horizontally for smaller screens. Provide distinct visual badges for Production vs Research mode to make scanning the history table easier.

---

## 9. Error Handling & Edge Cases
The application must handle real-world failures gracefully without breaking the UI.
*   **Network Failures & Timeouts:** Catch Axios errors and display a stylized error card (using existing red/amber warning styles) instead of native browser alerts.
*   **Missing Evidence / Unavailable Verification:** If `result.verification` is unexpectedly null or missing sources (e.g., backend search failure), display a fallback state: "Verification details unavailable at this time."
*   **Graceful Fallbacks:** Never crash the React tree. Use Optional Chaining (`?.`) aggressively when reading deeply nested response fields.

---

## 10. Responsiveness & Reusability
*   **Mobile/Tablet:** Stack the glass-panel cards vertically on mobile. Ensure long reasoning texts allow scrolling and don't overflow the container.
*   **Tables:** Ensure tables in Batch Analysis and History Logs use `overflow-x-auto` to prevent horizontal clipping.
*   **Reusability:** Introduce two new lightweight reusable components to keep `SingleAnalysis` clean:
    1.  `VerificationPanel`: Handles the rendering of Summary, Reasoning, and Verdict.
    2.  `SourceBadge`: Handles the rendering of a clickable trusted source.

---

## 11. File-by-File Implementation Plan

### `frontend/src/services/api.ts`
*   **Current Responsibility:** API client and TS definitions.
*   **Required Changes:** Add `VerificationSource`, `VerificationResponse`, and inject them into `ProductionResponse` and `ResearchResponse`. Ensure `xgboost` is marked optional in `ResearchResponse`.
*   **UX Impact:** None visually.
*   **Complexity / Risks:** Low.

### `frontend/src/components/Pipeline.tsx`
*   **Current Responsibility:** Visualizes the model execution pipeline.
*   **Required Changes:** 
    *   Append `Trusted Search`, `Retriever`, and `Gemini Verification` steps for both modes.
    *   Add `XGBoost` to the Research mode step list.
    *   Update the System Logs dictionary to narrate these new steps.
*   **Backend Fields Consumed:** Hardcoded UI representations of backend pipeline architecture.
*   **UX Impact:** Makes the AI feel comprehensive and transparent.
*   **Complexity / Risks:** Medium. Must synchronize animations tightly with parent component states.

### `frontend/src/components/VerificationPanel.tsx` (NEW)
*   **Current Responsibility:** N/A (New).
*   **Required Changes:** Create a reusable UI component inheriting the `glass-panel` style to neatly format the Verdict, Confidence Bar, Summary, Reasoning, and a mapped list of `SourceBadge` components.
*   **Backend Fields Consumed:** `verification.verdict`, `verification.confidence`, `verification.summary`, `verification.reasoning`, `verification.sources`.
*   **UX Impact:** Dramatically improves readability of the LLM verification response.
*   **Complexity / Risks:** Low. Promotes code reuse and cleanliness.

### `frontend/src/components/SourceBadge.tsx` (NEW)
*   **Current Responsibility:** N/A (New).
*   **Required Changes:** Create a small, clickable pill/badge component for URLs with a link icon and hover state.
*   **Backend Fields Consumed:** `source.name`, `source.url`.
*   **UX Impact:** Makes trusted sources feel like official citations rather than raw hyperlinks.
*   **Complexity / Risks:** Low.

### `frontend/src/pages/SingleAnalysis.tsx`
*   **Current Responsibility:** Main single-document analysis interface.
*   **Required Changes:** 
    *   Import and render `VerificationPanel`.
    *   Update `handlePredict` `setTimeout` logic to step through the new Pipeline stages accurately.
    *   Ensure XGBoost results render safely using optional chaining.
*   **Backend Fields Consumed:** Entire `PredictResponse`.
*   **UX Impact:** Delivers the complete "Production AI" experience.
*   **Complexity / Risks:** Major. State timing and layout grid spacing must be managed carefully.

### `frontend/src/pages/BatchAnalysis.tsx`
*   **Current Responsibility:** Bulk classification.
*   **Required Changes:** Add an "Expand Row" or "View Details" button to the table rows to display the `verification.verdict` and `verification.summary` for each item.
*   **Backend Fields Consumed:** Array of `PredictResponse`.
*   **UX Impact:** Exposes rich verification data previously hidden in bulk processes.
*   **Complexity / Risks:** Medium. Requires updating the table state to support expanded rows.

### `frontend/src/pages/Dashboard.tsx` & `frontend/src/pages/Analytics.tsx` & `frontend/src/pages/HistoryLogs.tsx`
*   **Current Responsibility:** General system metrics and logs.
*   **Required Changes:** 
    *   Implement try/catch visual error banners if the backend is down.
    *   Ensure `overflow-x-auto` is correctly applied to prevent mobile clipping.
    *   Add responsive grid breakpoints (`lg:grid-cols-2`, `sm:grid-cols-1`).
*   **Backend Fields Consumed:** Analytics and History schemas.
*   **UX Impact:** Prevents app crashes, ensures smooth mobile viewing, handles empty states gracefully.
*   **Complexity / Risks:** Low.

---

## 12. Implementation Safety & Architectural Constraints
This section defines the absolute boundaries for any AI or developer executing this plan. These constraints are non-negotiable to prevent architectural drift, regression, or accidental backend damage.

*   **Strict API Contract (Backend is Frozen):** The backend serves as the single source of truth. The frontend MUST adapt to the backend. You are strictly forbidden from modifying FastAPI routes, python endpoints, backend response schemas, environment variables, or prediction logic.
*   **Backward Compatibility:** Every existing frontend feature must continue to function exactly as before. The implementation must extend the application, not replace it. No regressions are acceptable. Do not remove any existing functionality unless explicitly instructed.
*   **API Contract Validation:** Future implementers must verify all assumptions against `backend/app/schemas/response.py` before modifying `frontend/src/services/api.ts`. Never invent or remove request/response fields.
*   **Minimal & Incremental Changes:** Read and understand a file entirely before modifying it. Avoid rewriting entire files. Modify only the required sections. Reuse existing logical flows whenever possible. No large-scale rewrites or framework replacements (e.g., do not introduce Redux, Zustand, or React Query).

## 13. Type Safety & Reliability
To ensure the frontend is resilient and production-ready:
*   **Strict TypeScript:** Ensure strict typing for all new payloads. The use of `any` is strictly prohibited.
*   **Null / Undefined Safety:** Backend AI models may return partial responses under error conditions or specific configurations (like missing XGBoost). The frontend must implement optional chaining (`?.`) and nullish coalescing (`??`) defensively on all nested fields (e.g., `result.verification?.summary ?? "Summary unavailable"`).
*   **Interface Consistency:** Define all API models firmly in `api.ts` and import them across components to prevent duplication of TypeScript interfaces.

## 14. Component Design & Performance
*   **Clean Component Responsibilities:** Do not create bloated components. The introduction of `VerificationPanel` and `SourceBadge` must strictly encapsulate their specific rendering logic to keep `SingleAnalysis` clean.
*   **Prop Drilling:** Pass only the necessary typed props to new components (e.g., `VerificationPanel` should take the `verification` object directly, not the entire `result`).
*   **Performance Optimization:** Avoid unnecessary rerenders. Use `React.memo` or `useMemo` for heavily rendered lists (like `SourceBadge` arrays or Batch Analysis rows) if profiling demands it, ensuring long reasoning rendering and large source lists do not degrade performance.

## 15. Accessibility (a11y) & Responsiveness
*   **Semantic HTML & ARIA:** Use semantic HTML5 elements. Ensure new UI pieces (like the expand buttons in Batch Analysis) have appropriate `aria-label`s and `aria-expanded` attributes for screen readers.
*   **Keyboard Navigation:** All interactive elements (buttons, source links, expand rows) must have visible focus states and be fully keyboard accessible.
*   **Responsive Layouts:** The implementation must look flawless on desktop, tablet, and mobile. Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`).
*   **Overflow Handling:** Specifically ensure that long generative AI strings (e.g., `reasoning`) and long URL strings do not break flexbox layouts or cause horizontal scrolling outside of defined areas. Ensure table layouts use `overflow-x-auto`.
*   **Color Contrast:** Ensure the text colors used for new Verdict badges (Emerald, Red, Amber) meet WCAG contrast requirements against their backgrounds in both light and dark modes.

## 16. Security & Future Extensibility
*   **Safe External Links:** All trusted source links must be rendered with `target="_blank"` and `rel="noopener noreferrer"` to prevent tab-nabbing vulnerabilities.
*   **Safe Rendering:** Do not use `dangerouslySetInnerHTML` for the AI generative text. Render it as standard React children to prevent XSS.
*   **Forward Compatibility:** The UI must ignore unknown optional backend fields gracefully. If the backend later adds `verification.metadata`, the frontend should not crash.
*   **Visual Consistency:** Do not invent new visual paradigms. Heavily reuse existing Tailwind spacing, typography, borders (`border-beige-200 dark:border-navy-700`), and theme colors to maintain current visual identity and dark mode consistency.

---

# IMPLEMENTATION GOVERNANCE

The following rules are mandatory for any AI model or developer implementing this plan.

These rules take precedence over implementation preferences.

---

## 17. Implementation Order

Implementation MUST follow this exact order.

1. frontend/src/services/api.ts

2. Shared reusable UI components (VerificationPanel, SourceBadge or approved equivalents)

3. frontend/src/components/Pipeline.tsx

4. frontend/src/pages/SingleAnalysis.tsx

5. frontend/src/pages/BatchAnalysis.tsx

6. frontend/src/pages/Dashboard.tsx

7. frontend/src/pages/Analytics.tsx

8. frontend/src/pages/HistoryLogs.tsx

Do not modify multiple unrelated files simultaneously.

Finish one logical unit completely before moving to the next.

---

## 18. File Verification Rules

After EVERY file modification verify:

• TypeScript compilation succeeds

• No ESLint errors

• No broken imports

• No missing exports

• No broken routes

• No broken props

• No runtime exceptions

• No new console errors

• Existing behaviour still works

Only proceed to the next file after verification succeeds.

---

## 19. Final Acceptance Checklist

Implementation is NOT complete until ALL of the following are true.

Backend

✓ Backend unchanged

✓ FastAPI unchanged

✓ API contract unchanged

✓ Response schemas unchanged

✓ Prediction logic unchanged

Frontend

✓ Production Mode fully implemented

✓ Research Mode fully implemented

✓ Verification UI complete

✓ Pipeline visualization complete

✓ Trusted Sources complete

✓ Confidence visualization complete

✓ Responsive layout verified

✓ Accessibility verified

✓ Error handling verified

✓ Loading states verified

✓ Existing functionality preserved

Engineering Quality

✓ TypeScript passes

✓ Build succeeds

✓ No console errors

✓ No runtime errors

✓ No duplicate code introduced

✓ No unnecessary components introduced

✓ No unnecessary files introduced

---

## 20. Implementation Strategy

Implementation should always prefer:

Incremental improvements

Small code changes

Minimal file modifications

Component reuse

Existing styling

Existing architecture

Strong typing

Maintainability

Avoid:

Large rewrites

Architecture refactoring

Unnecessary abstractions

Premature optimization

Code duplication

Feature creep

---

## 21. AI Decision Rules

If more than one implementation approach exists,

always choose the approach that:

requires the least architectural change,

introduces the fewest new files,

reuses the most existing code,

maintains the current UI,

and has the lowest long-term maintenance cost.

---

## 22. Assumption Policy

Never assume backend behaviour.

Never invent request fields.

Never invent response fields.

Never invent API endpoints.

Never invent frontend state.

Never invent component responsibilities.

If implementation requires assumptions that are not supported by the backend or the existing frontend,

STOP.

Request clarification instead of guessing.

---

## 23. Change Protection Rules

Never remove existing functionality.

Never remove existing styling.

Never remove existing animations.

Never remove existing routes.

Never remove existing components unless they become completely unused.

Every existing feature that currently works must continue working after implementation.

No regressions are acceptable.

---

## 24. Source of Truth

This document is the authoritative implementation specification.

Before writing any code, future AI models must read this document completely.

Implementation must follow this specification exactly.

Do not optimize beyond the approved scope.

Do not redesign the application.

Do not modify the backend.

If any conflict exists between this document and implementation assumptions,

this document takes precedence.
