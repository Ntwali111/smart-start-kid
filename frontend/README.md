# Smart Start Kids - Frontend

The React/Next.js frontend for the Smart Start Kids financial literacy platform.

## 🚀 Quick Start

See the main project README for complete setup:
- **Quick Setup (5 min)**: [../../QUICK_START.md](../../QUICK_START.md)
- **Full Setup Guide**: [../../README.md](../../README.md)
- **Deployment**: [../../DEPLOYMENT.md](../../DEPLOYMENT.md)

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on http://localhost:4000

### Installation

```bash
# Install dependencies
npm install

# Create .env.local
echo 'NEXT_PUBLIC_API_URL="http://localhost:4000"' > .env.local
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── dashboard/            # Child dashboard
│   ├── parent-dashboard/     # Parent account dashboard
│   ├── facilitator-dashboard/# Facilitator dashboard
│   ├── lessons/              # Lessons list & detail pages
│   ├── quiz/                 # Quiz pages
│   ├── goals/                # Savings goals page
│   └── progress/             # Progress tracking page
├── components/
│   └── AppNav.tsx            # Navigation component
└── lib/
    └── api.ts                # API client utilities
```

## 🎨 Features

- **Role-Based Pages**: Different layouts for Child, Parent, Facilitator
- **Interactive Lessons**: Learn about financial topics
- **Quizzes**: Test knowledge with immediate feedback
- **Savings Goals**: Track progress toward money-saving goals
- **Dashboard**: Personal dashboard with progress overview
- **Child-Friendly Design**: Vibrant colors, emojis, and animations
- **Responsive**: Works on desktop, tablet, and mobile

## 🛠 Technologies

- **Next.js 16**: React framework
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling
- **PostCSS**: CSS processing

## 📝 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## 🔗 Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

For production deployment (see [DEPLOYMENT.md](../../DEPLOYMENT.md)):
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 🚀 Deployment

For Vercel deployment instructions, see [DEPLOYMENT.md](../../DEPLOYMENT.md)

Quick deploy:
```bash
vercel
```

## ❓ Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**API connection errors?**
- Verify backend is running: `npm run dev` in `/backend`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Backend should be on http://localhost:4000

**Build failures?**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

See [README.md](../../README.md#troubleshooting) for more help.
