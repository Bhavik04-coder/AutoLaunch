<div align="center">

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/large.png" alt="AutoLaunch Logo" width="180px" />

<br/>

# ⚡ AutoLaunch

### AI-Powered Social Media Management Platform

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" />
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a>
</p>

</div>

---

## ✨ What is AutoLaunch?

AutoLaunch is a **full-stack social media management platform** that lets you schedule posts, generate AI content, manage your media library, track analytics, and connect all your social accounts — all from one beautiful dashboard.

> Built for the **April Hackathon 2025** 🚀

---

## 🖼️ Screenshots

<div align="center">

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web1.png" alt="Dashboard" width="100%" style="border-radius:10px; margin-bottom:10px;" />

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web2.png" alt="Post Scheduling" width="100%" style="border-radius:10px; margin-bottom:10px;" />

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web3.png" alt="AI Agents" width="100%" style="border-radius:10px; margin-bottom:10px;" />

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web4.png" alt="Analytics" width="100%" style="border-radius:10px; margin-bottom:10px;" />

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web5.png" alt="Media Library" width="100%" style="border-radius:10px; margin-bottom:10px;" />

<img src="https://raw.githubusercontent.com/Bhavik04-coder/AutoLaunch/main/public/web6.png" alt="Integrations" width="100%" style="border-radius:10px;" />

</div>

---

## � Features

<table>
  <tr>
    <td>📅 <b>Post Scheduling</b></td>
    <td>Schedule posts across multiple platforms with calendar & list views</td>
  </tr>
  <tr>
    <td>🤖 <b>AI Agents</b></td>
    <td>Content Writer, Hashtag Optimizer, Trend Spotter & Nabr Visual Prompt Builder</td>
  </tr>
  <tr>
    <td>🎨 <b>Image Generation</b></td>
    <td>Generate images from captions via Nabr AI — directly from the schedule panel</td>
  </tr>
  <tr>
    <td>📊 <b>Analytics</b></td>
    <td>Track impressions, engagement, follower growth with per-platform breakdowns</td>
  </tr>
  <tr>
    <td>🖼️ <b>Media Library</b></td>
    <td>Upload, manage and preview images & videos with drag-and-drop support</td>
  </tr>
  <tr>
    <td>� <b>Integrations</b></td>
    <td>Connect Instagram, LinkedIn, Facebook, TikTok, YouTube, Pinterest & more</td>
  </tr>
  <tr>
    <td>🏷️ <b>Brand Hub</b></td>
    <td>Manage brand identity, voice, colors, logo, templates and exports</td>
  </tr>
  <tr>
    <td>🔌 <b>Plugins</b></td>
    <td>Extend functionality with toggleable plugins per workspace</td>
  </tr>
  <tr>
    <td>💳 <b>Billing</b></td>
    <td>Free, Pro and Business plans with upgrade flow</td>
  </tr>
  <tr>
    <td>⚙️ <b>Settings</b></td>
    <td>Profile, notifications, team members, API keys</td>
  </tr>
</table>

---

## ⚡ Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Bhavik04-coder/AutoLaunch.git
cd AutoLaunch

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase + NextAuth credentials

# 4. Run the dev server
npm run dev
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 🔑 Auth

Use any email and password to log in — no setup required for demo mode.

```
Email:    test@example.com
Password: 123
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + SCSS Modules + Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth v5 |
| AI | Pollinations.ai · Ollama (llama3.2 / llava) |
| 3D / Shaders | Three.js · @react-three/fiber · ShaderGradient |
| Deployment | Netlify |
| Monitoring | Sentry |

---

## 📁 Project Structure

```
AutoLaunch/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── (site)/          # Main app pages
│   │   │   │   ├── launches/    # Post scheduling
│   │   │   │   ├── agents/      # AI agents
│   │   │   │   ├── analytics/   # Analytics dashboard
│   │   │   │   ├── media/       # Media library
│   │   │   │   ├── billing/     # Billing & plans
│   │   │   │   └── settings/    # User settings
│   │   │   └── auth/            # Login / Register
│   │   └── api/                 # API routes
│   ├── components/              # React components
│   ├── contexts/                # Global state (React Context)
│   └── lib/                     # DB helpers, auth, Supabase
├── supabase/
│   └── schema.sql               # Database schema
└── public/                      # Static assets
```

---

## 📝 Scripts

```bash
npm run dev      # Dev server on port 4200
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint
```

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key into `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:4200
```

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

<div align="center">

Made with ❤️ for the April 2025 Hackathon

<img src="https://img.shields.io/github/last-commit/Bhavik04-coder/AutoLaunch?style=flat-square&color=6366f1" />
<img src="https://img.shields.io/github/languages/top/Bhavik04-coder/AutoLaunch?style=flat-square&color=6366f1" />

</div>
