# Colony OS - Architecture Memory

## Project Overview
**Colony OS** is a skeuomorphic web application built with modern web technologies, featuring tactile, physical UI elements that evoke real-world materials and depth.

## Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Native Auth
- **UI Components**: shadcn/ui (customized for Skeuomorphism 2.0)
- **Icons**: Lucide React

## Design Philosophy: Skeuomorphism 2.0
The design system emphasizes physical realism through:
- **3D Depth**: Multi-layered shadows (inner/outer), elevation effects
- **Tactile Materials**: Brushed metal, frosted glass, leather textures, embossed surfaces
- **Physical Lighting**: Top-down light source, ambient occlusion, highlights and reflections
- **Interactive Feedback**: Press states, haptic-like animations, realistic button depressions
- **Avoid**: Flat design, pure minimalism, harsh edges

### Material Palette
- **Metal**: Brushed aluminum, chrome accents
- **Glass**: Frosted, semi-transparent overlays with blur
- **Leather**: Soft textures for large surfaces
- **Plastic**: Glossy buttons with specular highlights

### Elevation System
- Level 0: Base surface (brushed metal)
- Level 1: Raised elements (+2px, subtle outer shadow)
- Level 2: Interactive elements (+4px, pronounced shadow)
- Level 3: Floating panels (+8px, soft shadow with blur)
- Level 4: Modals/overlays (+16px, ambient shadow)

## Internationalization (i18n)
**Mandatory Languages**:
- English (Canada) - `en-CA`
- French (Québec) - `fr-QC`

### Implementation Strategy
- Next.js i18n routing with locale detection
- JSON translation files in `/locales/{locale}/`
- Context-based language switching
- Date/time formatting respects locale
- Currency formatting (CAD)

## Architecture Principles
1. **Modularity**: Components are isolated, reusable, single-purpose
2. **Type Safety**: Strict TypeScript, no `any` types
3. **Security**: RLS enabled on all tables, authenticated-first design
4. **Performance**: Code splitting, lazy loading, optimized images
5. **Accessibility**: WCAG 2.1 AA compliance minimum

## Directory Structure
```
/app                    # Next.js App Router pages
  /[locale]            # Locale-based routing
  /api                 # API routes
/components
  /ui                  # shadcn/ui base components (customized)
  /colony              # Colony OS specific components
/lib
  /supabase           # Supabase client & utilities
  /i18n               # Internationalization utilities
  /design-system      # Design tokens, mixins
/locales
  /en-CA              # English (Canada) translations
  /fr-QC              # French (Québec) translations
/supabase
  /migrations         # Database migrations
/public
  /textures           # Material textures (optional)
```

## Design Tokens
### Colors (Skeuomorphic Palette)
- **Metal Base**: #C0C5CE (brushed aluminum)
- **Metal Dark**: #65737E (shadowed metal)
- **Metal Highlight**: #E8ECF0 (chrome highlight)
- **Glass**: rgba(255, 255, 255, 0.1) with backdrop-blur
- **Leather Dark**: #2B2D30
- **Leather Light**: #3C3F41
- **Accent Blue**: #4A9EFF (glossy button)
- **Accent Green**: #5FB04B (success states)
- **Accent Red**: #E74C3C (destructive actions)

### Shadows (Physical Lighting)
- **Inner Shadow**: inset 0 2px 4px rgba(0,0,0,0.3)
- **Outer Shadow (subtle)**: 0 1px 3px rgba(0,0,0,0.2)
- **Outer Shadow (raised)**: 0 4px 8px rgba(0,0,0,0.25)
- **Outer Shadow (floating)**: 0 8px 24px rgba(0,0,0,0.3)
- **Highlight**: inset 0 1px 0 rgba(255,255,255,0.2)

### Typography
- **Sans**: Inter (maintained from base)
- **Weights**: 400 (regular), 500 (medium), 700 (bold)
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px

## Database Schema (Initial)
### Core Tables
- `profiles`: User profiles (extends auth.users)
- `settings`: User preferences, locale

### RLS Policy Pattern
All tables must have RLS enabled with policies for:
- SELECT: authenticated users, ownership checks
- INSERT: authenticated users only
- UPDATE: authenticated users, ownership checks
- DELETE: authenticated users, ownership checks

## Authentication Flow
1. Supabase email/password (default)
2. Session management via Supabase client
3. Protected routes via middleware
4. User profile creation on signup

## Key Features (Planned)
- User dashboard with skeuomorphic UI
- Settings panel (language, theme preferences)
- Modular workspace system
- Real-time collaboration features

## Development Guidelines
- Always use `"use client"` for hooks (useState, useEffect)
- Follow shadcn/ui patterns but customize for skeuomorphism
- Test in both EN-CA and FR-QC
- Ensure all interactive elements have tactile feedback
- Maintain 3D depth hierarchy

## Implementation Status

### ✅ Completed (v0.1.0 - 2026-03-14)

1. **Design System (Skeuomorphism 2.0)**
   - Complete design token system in `/lib/design-system/tokens.ts`
   - Tailwind CSS configuration extended with skeuomorphic tokens
   - Global styles with metal, glass, and leather materials
   - Physical shadow system (inner/outer/highlight)
   - Custom utility classes for tactile effects

2. **Internationalization**
   - Full i18n infrastructure for EN-CA and FR-QC
   - Next.js middleware for locale detection and routing
   - Translation files in `/locales/{locale}/common.json`
   - Client-side LanguageProvider with context
   - Server-side dictionary loading with getDictionary()

3. **Supabase Integration**
   - Modern @supabase/ssr implementation
   - Browser client in `/lib/supabase/client.ts`
   - Server client in `/lib/supabase/server.ts`
   - TypeScript types in `/lib/supabase/database.types.ts`
   - Profiles table with RLS policies
   - Auto-profile creation on user signup (trigger)
   - Updated_at timestamp management (trigger)

4. **Database Schema**
   - `profiles` table with complete RLS
   - Policies: SELECT, INSERT, UPDATE for authenticated users
   - Automatic profile creation via auth trigger
   - Email indexing for performance
   - Locale support (en-CA, fr-QC)

5. **UI Components (Colony-specific)**
   - MetalButton: Tactile button with press animation
   - GlassCard: Frosted glass card with elevation
   - ColonyWelcome: Feature showcase landing page

6. **Routing**
   - Locale-based routing with `[locale]` dynamic segment
   - Middleware handles automatic locale detection
   - Cookie-based locale preference storage
   - Accept-Language header fallback

### 🔧 Technical Notes

- Using @supabase/ssr (modern approach, not deprecated auth-helpers)
- Next.js 13.5.1 with App Router
- Middleware at root level handles locale routing
- Build verified successfully with static generation

### 📋 Next Steps (Recommended)

1. **Authentication UI**
   - Login/signup forms with skeuomorphic design
   - Password reset flow
   - Profile management page

2. **Dashboard**
   - User dashboard with widgets
   - Settings panel with locale switcher
   - Theme preferences (future: dark mode toggle)

3. **Enhanced Components**
   - MetalInput (text input with inset shadow)
   - MetalSelect (dropdown with physical depth)
   - MetalModal (floating dialog with glass effect)
   - Navigation components (sidebar, header)

4. **Features**
   - User onboarding flow
   - Profile editing
   - Real-time features (if needed)

## Version History
- **v0.1.0** (2026-03-14): Initial architecture, design system, i18n (EN-CA, FR-QC), Supabase, core UI components
- **v0.2.0** (2026-03-14): Global scale — 5-locale i18n (EN-CA, FR-QC, ES, DE, JA), GlobeView 3D sidebar, ConsoleCard Dark Chrome variant, Conversion Catalyst Pod (/pods/conversion-catalyst), Revenue Radar canvas animation, Nixie Profit Tracker, multi-step scan engine, jsPDF Profit Blueprint, global_leads Supabase table, dashboard mode toggle (Legal / Profit)

---
*Last Updated: 2026-03-14 by Lead Architect*
