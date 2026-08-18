# Plan - Visual Alignment of Administrative Panel

Enhance the "Gestão" (Administrative) panel to match the consumer-facing app's visual style (Cantu Conecta), moving away from the "corporate/strict" look towards the friendly, rounded, and vibrant aesthetic used elsewhere.

## Proposed Changes

### 1. Theming & Components
- Replace strict `uppercase` labels with standard casing for a friendlier tone.
- Update rectangular buttons and cards to use the `rounded-3xl` or `rounded-2xl` pattern from the main app.
- Transition high-contrast "admin" colors to use the primary `oklch(0.53 0.13 175)` (teal/green) and primary-soft backgrounds.

### 2. Login Page Alignment
- Update the login card to use `rounded-3xl` and `shadow-card`.
- Change "Sistema oficial de gestão" to a more welcoming tone like "Portal da Gestão Cantu Conecta".
- Adjust input styles to match the registration flow (rounded-2xl).

### 3. Dashboard (Gestão) Alignment
- Refactor the "Resumo superior" cards to use the same rounded aesthetic as the Home screen shortcuts.
- Soften the "Protocolos Prioritários" section (currently very red/aggressive) to use warning/soft tones that fit the app's palette.
- Update "Focos de Monitoramento" items to use rounded-2xl containers.
- Standardize the "Indicadores" grid to match the home screen's "Serviços em Destaque" feel.

### 4. Technical Details
- Change `rounded-xl` to `rounded-3xl` in `src/routes/gestao.tsx`.
- Remove `uppercase` and `tracking-widest` from headers.
- Update `TopBar` titles to match the consumer app's friendly tone.
- Ensure `AppShell` usage remains consistent for layout structure.

---
**Note:** I will maintain all existing logic (authentication, state, data processing) while purely updating the CSS classes and textual tone.
