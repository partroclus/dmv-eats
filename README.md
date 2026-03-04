# DMV Eats — AI-Powered Restaurant Discovery for DC/Maryland/Virginia

**Status**: MVP Development Phase (Weeks 1-12)  
**Started**: March 3, 2026  
**Team**: 6-8 engineers + 1 PM + 1 designer  
**Timeline**: 6-8 months to MVP, $650K budget

## Overview

DMV Eats is a hyper-local restaurant discovery app built for the Washington DC, Maryland, and Virginia region. Unlike generic apps (Yelp, Google Maps), DMV Eats leverages AI conversational search, social gamification, real-time crowd tracking, AR menu previews, and commuter-aware routing to solve unmet dining needs for 6M DMV residents and 27M annual visitors.

## Key Features (MVP Priority)

1. **AI Conversational Search** — Chat-like interface for natural language queries ("quiet Georgetown brunch under $20")
2. **Social Community & Gamification** — Photo feed with badges, challenges, friend following
3. **Real-Time Availability** — Live crowd levels, wait times, flash deals
4. **AR-Enhanced Menus** — 3D preview of dishes before ordering
5. **Commuter/Route Recommendations** — Suggest stops along your route (car/Metro)
6. **Local/Sustainable Filters** — Organic, BIPOC-owned, vegan, allergy-safe tags
7. **Social Dining Events** — Group meetups, food crawls, themed dinners
8. **Group Decision Tools** — Voting/polling to pick restaurants with friends
9. **Cultural/Language Support** — Multilingual (Spanish, Chinese, Amharic), themed guides
10. **Advanced Filters & Transparency** — Mood/ambiance, noise level, portion size, social proof

## Tech Stack

### Mobile
- **React Native 0.83** + **Expo SDK 55** (New Architecture mandatory)
- **React Navigation v7** (file-based routing)
- **Reanimated 4.x** (120fps animations)
- **@rnmapbox/maps** (dark-mode maps, 3D)
- **NativeWind 4.x** (Tailwind CSS for RN)

### Backend
- **Fastify v5.7.4** + **tRPC v11.8.1** (end-to-end TypeScript)
- **Node.js 20+** (required for Fastify v5)
- **Zod v3** (input validation)
- **TanStack React Query v5** (state management)

### Database & Real-Time
- **Supabase** (PostgreSQL 17 + PostGIS) — $25/month Pro
- **Redis** (session cache, real-time pubsub)
- **Pinecone** (vector DB for AI search) — Free tier: 25K MAU

### AI/ML & APIs
- **OpenAI API** (GPT-4, embeddings for conversational search)
- **Google Places API** (restaurant data, photos)
- **Mapbox** (maps, directions, routing) — 25K MAU free
- **WMATA API** (Metro/transit data)
- **Stripe** (payments for subscriptions)

### DevOps & Monitoring
- **AWS** (ECS Fargate, RDS Aurora, S3, CloudFront, Lambda)
- **Clerk** (authentication, OAuth, MFA)
- **PostHog** or **Mixpanel** (analytics)
- **GitHub Actions** (CI/CD)

## Project Structure

```
dmv-eats/
├── apps/
│   ├── mobile/               # React Native (Expo) app
│   │   ├── src/
│   │   │   ├── screens/      # Home, Search, Social, Profile
│   │   │   ├── components/   # RestaurantCard, BottomSheet, Map
│   │   │   ├── hooks/        # useLocation, useSearch
│   │   │   ├── services/     # tRPC client, API calls
│   │   │   └── utils/        # theme, constants, helpers
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── backend/              # Fastify + tRPC server
│       ├── src/
│       │   ├── routers/      # tRPC procedures (search, social, events)
│       │   ├── services/     # Business logic (AI, maps, real-time)
│       │   ├── db/           # Supabase client, migrations
│       │   ├── jobs/         # Cron jobs (embeddings, real-time sync)
│       │   ├── middleware/   # Auth, rate limiting, logging
│       │   └── utils/
│       ├── prisma/
│       │   ├── schema.prisma # Data models
│       │   └── migrations/
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── types/                # Shared TypeScript types
│   └── config/               # Shared environment configs
│
├── infra/                     # Infrastructure as Code
│   ├── aws/                  # CloudFormation / Terraform
│   └── supabase/             # SQL migrations
│
├── docs/                      # API docs, design specs, runbooks
├── tests/                     # E2E, integration, unit tests
├── .github/workflows/         # CI/CD pipelines
├── .gitignore
├── README.md
└── LICENSE (MIT)
```

## Phase 1: MVP (Weeks 1-12)

| Week | Milestone | Deliverables |
|------|-----------|--------------|
| 1-2 | Setup & Architecture | Expo project, Clerk auth, Supabase schema |
| 3-4 | Restaurant Data | Seed 5K restaurants from Google Places |
| 5-6 | Search UI | Mapbox integration, basic filters |
| 7-8 | AI Search Integration | OpenAI conversational search, Pinecone vectors |
| 9-10 | Social Features | Feed, check-ins, gamification |
| 11-12 | Testing & Beta | Internal QA, 50-user closed beta |

**Success Metrics**:
- 500 beta users
- 70% onboarding completion
- <3s search response time
- 0 critical bugs

## Development Guidelines

### Code Style
- TypeScript strict mode for all code
- ESLint + Prettier (configs included)
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

### Branches
- `main` — production-ready code
- `develop` — integration branch (default)
- `feature/*` — feature branches
- `bugfix/*` — bug fix branches

### Git Workflow
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ai-search
# ... make changes ...
git commit -m "feat: add conversational search with OpenAI"
git push origin feature/ai-search
# Create PR → code review → merge
```

### Environment Variables
Create `.env.local` (not committed):
```
# Backend
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
MAPBOX_API_KEY=...
CLERK_SECRET_KEY=...
STRIPE_SECRET_KEY=...

# Frontend (Expo)
EXPO_PUBLIC_MAPBOX_API_KEY=...
EXPO_PUBLIC_TRPC_URL=http://localhost:3000
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- Xcode 16.1+ (for iOS development)
- Android Studio (for Android emulator)

### Installation

```bash
# Clone and install
git clone https://github.com/Partroclus/dmv-eats.git
cd dmv-eats
npm install

# or with pnpm (faster)
pnpm install
```

### Running MVP

**Mobile (Expo)**:
```bash
cd apps/mobile
npx expo start
# Scan QR with Expo Go app on phone
```

**Backend (Fastify)**:
```bash
cd apps/backend
npm run dev
# Server at http://localhost:3000
```

### Database Setup

```bash
# Apply Supabase migrations
npx supabase migration up
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (Detox for React Native)
npm run test:e2e
```

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for AWS/Supabase setup.

```bash
# Build mobile APK/IPA
cd apps/mobile
npx eas build --platform all

# Deploy backend
cd apps/backend
npm run build
docker build -t dmv-eats-api .
# Push to AWS ECR and trigger ECS update
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m 'feat: add feature'`)
4. Push to branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## Roadmap

- **Phase 1 (Weeks 1-12)**: MVP with basic search, social, real-time
- **Phase 2 (Weeks 13-24)**: AR menus, advanced AI, cultural trails
- **Phase 3 (Weeks 25-48)**: Monetization, B2B partnerships, scaling

## License

MIT License. See [`LICENSE`](LICENSE) for details.

## Contact

- **Product Manager**: TBD
- **GitHub**: github.com/Partroclus/dmv-eats
- **Email**: [to be confirmed]

---

**Last Updated**: March 3, 2026  
**Phase**: MVP Development  
**Status**: 🚀 Initializing Phase 1
