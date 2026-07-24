This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Current Version: 0.5
Status: Editable Guide Intelligence complete
Next: Official SwissTopo Layers

## Version 0.7 – GPX Route Reports

### Goal

Allow a user to import a GPX route, display it on the map and generate a report of Guide Intelligence notes that are relevant to the route.

### Planned Features

- GPX import
- Display GPX on map
- Route analysis
- Route report
- Future support for line-based guide notes
```
guide-intelligence-map-v2
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  └─ demo-route
│  │     ├─ 20260706_114111.jpg
│  │     ├─ chain.jpg
│  │     ├─ exposed_path_1.jpg
│  │     ├─ snow_patch_1.jpg
│  │     └─ snow_patch_2.jpg
│  ├─ nae-logo-cropped.png
│  ├─ nae-logo.png
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ app
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ GPX
│  │  │  ├─ GPXImportButton.tsx
│  │  │  ├─ GPXLayer.tsx
│  │  │  ├─ GPXReport.tsx
│  │  │  └─ RoutePanel.tsx
│  │  ├─ Info
│  │  │  ├─ AddGuideNotePanel.tsx
│  │  │  ├─ GuideNoteForm.tsx
│  │  │  └─ GuideNotePanel.tsx
│  │  ├─ Layers
│  │  │  └─ OfficialLayers.tsx
│  │  ├─ Layout
│  │  │  ├─ AppLayout.tsx
│  │  │  └─ Header.tsx
│  │  ├─ Map
│  │  │  ├─ AddGuideNoteButton.tsx
│  │  │  ├─ GuideMarker.tsx
│  │  │  ├─ GuideSectionLayer.tsx
│  │  │  ├─ markerColours.ts
│  │  │  ├─ markerIcons.ts
│  │  │  └─ SwissMap.tsx
│  │  ├─ Sidebar
│  │  │  └─ Sidebar.tsx
│  │  └─ UI
│  │     ├─ CollapsibleSection.tsx
│  │     └─ ToggleSwitch.tsx
│  ├─ Data
│  │  ├─ guideNotes.ts
│  │  ├─ guideSections.ts
│  │  └─ officialSwissTopoLayers.ts
│  ├─ lib
│  │  ├─ gpxAnalysis.ts
│  │  ├─ guideNoteStorage.ts
│  │  └─ parseGPX.ts
│  └─ Types
│     ├─ GPXRoute.ts
│     ├─ GuideFilters.ts
│     ├─ GuideNote.ts
│     ├─ GuideSection.ts
│     └─ OfficialLayerFilters.ts
└─ tsconfig.json

```
```
guide-intelligence-map-v2
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  └─ demo-route
│  │     ├─ 20260706_114111.jpg
│  │     ├─ chain.jpg
│  │     ├─ exposed_path_1.jpg
│  │     ├─ snow_patch_1.jpg
│  │     └─ snow_patch_2.jpg
│  ├─ nae-logo-cropped.png
│  ├─ nae-logo.png
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ importGuideNotes.ts
│  └─ importGuideSections.ts
├─ src
│  ├─ app
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ test-supabase
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ GPX
│  │  │  ├─ GPXImportButton.tsx
│  │  │  ├─ GPXLayer.tsx
│  │  │  ├─ GPXReport.tsx
│  │  │  └─ RoutePanel.tsx
│  │  ├─ Info
│  │  │  ├─ AddGuideNotePanel.tsx
│  │  │  ├─ GuideNoteForm.tsx
│  │  │  └─ GuideNotePanel.tsx
│  │  ├─ Layers
│  │  │  └─ OfficialLayers.tsx
│  │  ├─ Layout
│  │  │  ├─ AppLayout.tsx
│  │  │  └─ Header.tsx
│  │  ├─ Map
│  │  │  ├─ AddGuideNoteButton.tsx
│  │  │  ├─ GuideMarker.tsx
│  │  │  ├─ GuideSectionLayer.tsx
│  │  │  ├─ markerColours.ts
│  │  │  ├─ markerIcons.ts
│  │  │  └─ SwissMap.tsx
│  │  ├─ Sidebar
│  │  │  └─ Sidebar.tsx
│  │  └─ UI
│  │     ├─ CollapsibleSection.tsx
│  │     └─ ToggleSwitch.tsx
│  ├─ Data
│  │  ├─ guideNotes.backup.ts
│  │  ├─ guideSections.backup.ts
│  │  └─ officialSwissTopoLayers.ts
│  ├─ hooks
│  │  ├─ useGuideNotes.ts
│  │  └─ useGuideSections.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ gpxAnalysis.ts
│  │  ├─ guideNoteDatabase.ts
│  │  ├─ guideNoteStorage.ts
│  │  ├─ guideSectionDatabase.ts
│  │  ├─ loadGuideNotes.ts
│  │  ├─ parseGPX.ts
│  │  ├─ supabase.ts
│  │  └─ testSupabase.ts
│  └─ Types
│     ├─ GPXRoute.ts
│     ├─ GuideFilters.ts
│     ├─ GuideNote.ts
│     ├─ GuideSection.ts
│     └─ OfficialLayerFilters.ts
└─ tsconfig.json

```
```
guide-intelligence-map-v2
├─ AGENTS.md
├─ CLAUDE.md
├─ eslint.config.mjs
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  └─ demo-route
│  │     ├─ 20260706_114111.jpg
│  │     ├─ chain.jpg
│  │     ├─ exposed_path_1.jpg
│  │     ├─ snow_patch_1.jpg
│  │     └─ snow_patch_2.jpg
│  ├─ nae-logo-cropped.png
│  ├─ nae-logo.png
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ scripts
│  ├─ importGuideNotes.ts
│  └─ importGuideSections.ts
├─ src
│  ├─ app
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ page.tsx
│  │  ├─ page.tsx
│  │  └─ test-supabase
│  │     └─ page.tsx
│  ├─ components
│  │  ├─ auth
│  │  │  └─ AuthGuard.tsx
│  │  ├─ GPX
│  │  │  ├─ GPXImportButton.tsx
│  │  │  ├─ GPXLayer.tsx
│  │  │  ├─ GPXReport.tsx
│  │  │  └─ RoutePanel.tsx
│  │  ├─ Info
│  │  │  ├─ AddGuideNotePanel.tsx
│  │  │  ├─ GuideNoteForm.tsx
│  │  │  └─ GuideNotePanel.tsx
│  │  ├─ Layers
│  │  │  └─ OfficialLayers.tsx
│  │  ├─ Layout
│  │  │  ├─ AppLayout.tsx
│  │  │  └─ Header.tsx
│  │  ├─ Map
│  │  │  ├─ AddGuideNoteButton.tsx
│  │  │  ├─ GuideMarker.tsx
│  │  │  ├─ GuideSectionLayer.tsx
│  │  │  ├─ markerColours.ts
│  │  │  ├─ markerIcons.ts
│  │  │  └─ SwissMap.tsx
│  │  ├─ Sidebar
│  │  │  └─ Sidebar.tsx
│  │  └─ UI
│  │     ├─ CollapsibleSection.tsx
│  │     ├─ DataSources.tsx
│  │     └─ ToggleSwitch.tsx
│  ├─ context
│  │  └─ ProfileContext.tsx
│  ├─ Data
│  │  ├─ guideNotes.backup.ts
│  │  ├─ guideSections.backup.ts
│  │  └─ officialSwissTopoLayers.ts
│  ├─ hooks
│  │  ├─ useAuth.ts
│  │  ├─ useGuideNotes.ts
│  │  ├─ useGuideSections.ts
│  │  └─ useProfile.ts
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ gpxAnalysis.ts
│  │  ├─ guideNoteDatabase.ts
│  │  ├─ guideNoteStorage.ts
│  │  ├─ guideSectionDatabase.ts
│  │  ├─ loadGuideNotes.ts
│  │  ├─ parseGPX.ts
│  │  ├─ permissions.ts
│  │  ├─ supabase.ts
│  │  └─ testSupabase.ts
│  └─ Types
│     ├─ GPXRoute.ts
│     ├─ GuideFilters.ts
│     ├─ GuideNote.ts
│     ├─ GuideSection.ts
│     └─ OfficialLayerFilters.ts
└─ tsconfig.json

```