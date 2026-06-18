# TODO - Frontend TerangaSkills (Only Backend-Real Data)

## Dashboard
- [x] Update `admin-dashboard/src/pages/Dashboard.tsx` to use `src/lib/axios.ts` (`api`) instead of raw `axios`.
- [x] Ensure call uses `GET /api/v1/dashboard/statistics`.
- [x] TypeScript check.
- [x] Build check.


## Complaints

- [ ] Update `admin-dashboard/src/pages/Complaints.tsx`: remove static `complaints` mock and KPI mocks.

- [ ] Use `admin-dashboard/src/services/complaints.service.ts` (`complaintsService.getAll()` -> `GET /complaints`).
- [ ] Render table from backend data.
- [ ] Update `admin-dashboard/src/pages/ComplaintDetails.tsx`: remove all mock data.
- [ ] Read `id` from react-router params and call `complaintsService.getById(id)` -> `GET /complaints/:id`.
- [ ] TypeScript check.
- [ ] Build check.

## Lost Documents

- [ ] Create `admin-dashboard/src/services/missing-documents.service.ts` if missing.
- [ ] Update `admin-dashboard/src/pages/LostDocuments.tsx` to remove `documents` mock and fetch `GET /missing-documents`.
- [ ] TypeScript check.
- [ ] Build check.

## Analytics

- [ ] Update `admin-dashboard/src/pages/Analytics.tsx` to remove all mock chart/KPI data.
- [ ] Use `GET /dashboard/statistics` and only display available KPIs.
- [ ] Simplify charts if backend doesn’t provide monthly/series data.
- [ ] TypeScript check.
- [ ] Build check.

## Settings

- [ ] Update `admin-dashboard/src/pages/Settings.tsx`:
  - [ ] If an endpoint for connected user exists, use it.
  - [ ] Otherwise, use `admin-dashboard/src/data/currentUser.ts`.
  - [ ] Remove all mock profile data.
- [ ] TypeScript check.
- [ ] Build check.
