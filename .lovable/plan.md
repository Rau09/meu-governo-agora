# Cantu Conecta - Auditoria e Aprimoramento Completo

Auditoria completa da plataforma para garantir funcionalidade total, estabilidade e consistência visual.

## User Experience (UX) Improvements

- **Navigation Audit**: Verify all `Link` and `Button` destinations.
- **Back Buttons**: Ensure consistency across all modules (`saude`, `causa-animal`, `comunidade`, `ocorrencia`).
- **Feedback & Feedback**: Add loading states to registration and scheduling flows.
- **Persistence**: Ensure `localStorage` logic is robust across refreshes.

## Feature Enhancements

### 1. Registration Flow (Registro)
- Refactor to a 4-step wizard:
  - **Step 1: Identification** (Name, Email/Phone, Password/PIN).
  - **Step 2: Location** (Municipality selection, Neighborhood).
  - **Step 3: Preferences** (Notifications for health, urban services, etc.).
  - **Step 4: Confirmation** (Success screen + redirection).
- Implement "Use my location" with Geolocation API.

### 2. Scheduling & Protocols (Saúde/Comunidade)
- **Status Lifecycle**: Received → In Analysis → Dispatched → In Progress → Resolved.
- **Unique Protocols**: Ensure `CANTU-YYYY-XXXXX` format is applied everywhere.
- **Queue Management**: Functional dashboard visualization for "Queue Gravity" (Normal, Attention, Critical, Emergency).

### 3. Causa Animal & Prevenção
- **Interactive Map**: Show health units, animal occurrences, and urban problems.
- **Fictional Data Expansion**: Seed consistent data for municipalities in the Cantuquiriguaçu region.

## Technical Tasks

- **Fix Missing Links**: Ensure all buttons in `causa-animal.tsx` and `perfil.tsx` are functional.
- **IA Integration**: Finalize the "Inteligência Cantu Conecta" area for administrative support.
- **Responsive Audit**: Check all layouts on mobile viewports for cut text or overlapping elements.
- **Code Optimization**: Remove any remaining "QI Cidadão" references in favor of "Cantu Conecta".

## Verification Plan

- [ ] Register a new user from scratch.
- [ ] Schedule a medical consultation and check if it appears in the dashboard.
- [ ] Report an urban problem with GPS and photo.
- [ ] Verify protocol status updates in the management panel.
- [ ] Test the platform on small mobile screens.
