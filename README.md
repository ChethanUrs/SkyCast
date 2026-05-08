# 🌤️ SkyCast — Premium MERN Weather App

> **"Where beauty meets real-time intelligence"**

A production-grade, Awwwards-caliber weather forecasting application built with the MERN stack (MongoDB · Express · React · Node.js).

---

## ✨ Features

- **Cinematic Splash Screen** — time-aware gradient, Framer Motion logo entrance, typewriter tagline
- **Live Weather Data** — powered by OpenWeatherMap API (current, forecast, AQI, geocoding)
- **Glassmorphism UI** — frosted glass cards, backdrop blur, dynamic gradients
- **Light/Dark Mode** — system preference auto-detect, smooth 300ms theme transition
- **JWT Authentication** — register, login, Google OAuth one-tap
- **Saved Locations** — up to 10 cities per user, stored in MongoDB
- **7-Day Forecast** — expandable cards with temp range bar
- **24-Hour Hourly** — scrollable timeline
- **Air Quality Index** — animated gauge with health labels
- **Recharts Visualizations** — temperature trend, precipitation, humidity/wind
- **Outfit & Activity Recommender** — AI-style suggestions based on conditions
- **Skeleton Loading** — shimmer wave on every fetch
- **Responsive** — 320px to 2560px

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd skycast

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

```bash
# In server/
cp ../.env.example .env
```

Edit `server/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) — Free tier |
| `MONGODB_URI` | Local: `mongodb://localhost:27017/skycast` or Atlas |
| `JWT_SECRET` | Any 64-char random string |
| `GOOGLE_CLIENT_ID` + `SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| `NEWS_API_KEY` | [newsapi.org](https://newsapi.org) (optional) |

### 3. Run Development Servers

```bash
# Terminal 1 — API Server (port 5000)
cd server && npm run dev

# Terminal 2 — React Client (port 3000)
cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
skycast/
├── client/                    # Vite + React 18
│   └── src/
│       ├── components/        # UI components
│       ├── context/           # Theme, Auth contexts
│       ├── pages/             # Route pages
│       ├── services/          # Axios API layer
│       └── store/             # Redux Toolkit slices
├── server/                    # Express + Mongoose
│   ├── config/                # DB + Passport
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth, errors, rate limit
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routers
│   └── services/             # Weather API + cache
├── .env.example
└── README.md
```

---

## 🔑 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/me` | Current user |
| GET | `/api/weather/current` | Current conditions |
| GET | `/api/weather/forecast` | 7-day + hourly |
| GET | `/api/weather/aqi` | Air quality |
| GET | `/api/weather/search` | City autocomplete |
| GET | `/api/locations` | Saved locations |
| POST | `/api/locations` | Save location |
| DELETE | `/api/locations/:id` | Remove location |
| GET | `/api/preferences` | User preferences |
| PATCH | `/api/preferences` | Update preferences |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Framer Motion, Recharts, Redux Toolkit, React Query, Axios |
| **Backend** | Node.js, Express 4, Mongoose, JWT, Passport (Google OAuth) |
| **Database** | MongoDB |
| **Styling** | Vanilla CSS with CSS custom properties |
| **Security** | Helmet, express-rate-limit, bcryptjs |
| **Caching** | node-cache (10min TTL) |

---

## 📜 License

MIT © SkyCast 2025
