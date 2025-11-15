# DevMood DJ 🎧

I built DevMood DJ because I always get stuck trying to choose the “right” playlist when I sit down to code. Instead of scrolling through Spotify and overthinking it, I wanted something that would just suggest a few good options and let me start working.

DevMood DJ is a small but polished full-stack app that does exactly that: it takes your current coding mood and local weather, talks to OpenWeather and Spotify, and returns a handful of matching playlists so you can simply pick one and get into flow.

---


## Screenshots

| Light mode hero | Dark mode hero |
| --- | --- |
| ![Light mode homepage](docs/screenshots/pageLight.png) | ![Dark mode homepage](docs/screenshots/pageDark.png) |

| Spotify search results (light) | Spotify search results (dark) |
| --- | --- |
| ![Playlist search light](docs/screenshots/playlistsearchedLight.png) | ![Playlist search dark](docs/screenshots/playlistsearchedDark.png) |

| Responsive preview | Fallback recommendation |
| --- | --- |
| ![Responsive layouts](docs/screenshots/responsiveDark.png) | ![Fallback playlist state](docs/screenshots/fallbackDark.png) |

---

## Features

- 🎛 **Mood selector for coding**  
  Choose between different coding moods (Deep Focus, Light coding, Motivation, Feel good).

- 🌦 **Live weather integration**  
  Uses the OpenWeather API to fetch current weather for the selected city and bucket it into `Clear`, `Rain` or `Clouds`.

- 🎧 **Spotify playlist suggestions**  
  For each (mood, weather) combination, the backend builds a search query and calls the Spotify Web API to fetch multiple matching playlists. The frontend then shows a small grid of playlist cards (cover image + name), and you can pick your favourite.

- ☁️ **Serverless backend on AWS**  
  A single AWS Lambda function (Node.js 22, ESM) exposed via a Function URL. No servers to manage.

- 💅 **Modern, portfolio‑style UI**  
  React + Vite + Tailwind CSS with a polished dark theme, gradient background, “pill” mood buttons and a compact “Now playing” card.

- 🛡 **Graceful fallback**  
  If Spotify is unavailable or the API returns nothing, the Lambda falls back to a curated set of hard‑coded playlists so you still get a useful recommendation.

---

## Tech stack

**Frontend**

- React (Vite)
- Tailwind CSS
- Fetch-based API client using `VITE_API_BASE_URL`

**Backend**

- AWS Lambda (Node.js 22, ESM)
- Lambda Function URL as the HTTP endpoint
- OpenWeather REST API (`/data/2.5/weather`)
- Spotify Web API (client credentials flow, `/api/token` + `/v1/search`)

---

## High‑level architecture

```text
[React + Tailwind frontend]
      |
      |  POST / (JSON: { mood, city })
      v
[AWS Lambda Function URL]
      |
      |-- calls OpenWeather -> current weather for city
      |
      |-- maps weather.main -> bucket: Clear / Rain / Clouds
      |
      |-- uses bucket + mood -> builds Spotify search query
      |-- calls Spotify Web API (client credentials)
      |
      |-- selects 1–3 matching playlists
      |
      v
[JSON response with mood, weather, playlists[]]
```

The frontend renders this data into:

- a grid of playlist options (cover + title) you can click
- a button that opens the selected playlist in Spotify

---

## API response shape

Example successful response from the Lambda:

```json
{
  "mood": "DeepFocus",
  "weather": "Clouds",
  "playlistName": "Some Cloudy Focus Playlist",
  "playlistUrl": "https://open.spotify.com/playlist/...",
  "note": "Pilviselle päivälle tasainen fokustila.",
  "source": "spotify",
  "options": [
    {
      "name": "Playlist 1",
      "url": "https://open.spotify.com/playlist/...",
      "imageUrl": "https://i.scdn.co/image/...",
      "owner": "Spotify"
    },
    {
      "name": "Playlist 2",
      "url": "https://open.spotify.com/playlist/...",
      "imageUrl": "https://i.scdn.co/image/...",
      "owner": "Some user"
    },
    {
      "name": "Playlist 3",
      "url": "https://open.spotify.com/playlist/...",
      "imageUrl": "https://i.scdn.co/image/...",
      "owner": "Another user"
    }
  ]
}
```

If Spotify fails or returns nothing, the response is the same shape, but:

- `source` is `"fallback"`
- `options` contains at least one curated fallback playlist

---

## Project structure (simplified)

```text
devmood-dj/
├── backend/
│   ├── package.json       # Lambda dependencies (Node.js 22, ESM)
│   └── index.mjs          # AWS Lambda handler
│
├── frontend/
│   ├── index.html
│   ├── vite.config.*
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── package.json
│   └── src/
│       ├── main.jsx       # React entry, imports Tailwind CSS
│       ├── App.jsx        # Main UI: mood, city, playlists, layout
│       └── index.css      # Tailwind directives + base styles
│
├── docs/
│   ├── screenshots/       # README visuals (light/dark/responsive states)
│   │   ├── pageLight.png
│   │   ├── pageDark.png
│   │   ├── playlistsearchedLight.png
│   │   ├── playlistsearchedDark.png
│   │   ├── responsiveDark.png
│   │   └── fallbackDark.png
│   └── PROJECT_PLAN.md    # Initial planning document / notes
└── README.md              # This file
```

---

## Configuration

### Frontend (`frontend/.env`)

Create a `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=https://your-lambda-function-url-here
```

This should be the **Function URL** of your AWS Lambda (e.g. `https://abc123.lambda-url.eu-north-1.on.aws/`).

### Backend (Lambda environment variables)

In the AWS Console, for your Lambda function, configure these environment variables:

```text
OPENWEATHER_API_KEY   = your-openweather-api-key
OPENWEATHER_CITY      = default city, e.g. Turku,FI

SPOTIFY_CLIENT_ID     = your Spotify app client id
SPOTIFY_CLIENT_SECRET = your Spotify app client secret
```

The Lambda also accepts a `city` field from the frontend request body:

```json
{
  "mood": "DeepFocus",
  "city": "Turku,FI"
}
```

If `city` is not provided, it falls back to `OPENWEATHER_CITY` and then to `Helsinki,FI` by default.

---

## Running locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).  
Make sure `VITE_API_BASE_URL` is set and points to your deployed Lambda Function URL.

### Backend

The backend is intended to run as an AWS Lambda, not as a local Express server.

However, the handler is simple and could be adapted to a local server if needed. In this project, the typical workflow is:

1. Edit `backend/index.mjs` locally.
2. Deploy the updated file to your Lambda (e.g. via AWS Console, SAM, CDK, or manual upload).
3. Test the Function URL in a browser or via `curl` / Postman.

---

## Development notes

- The backend uses **client credentials flow** for Spotify, so it does **not** access user-specific data, only public playlists.
- Playlist suggestions are based on search queries that take into account both mood and weather. The mapping from weather to buckets (`Clear`, `Rain`, `Clouds`) is intentionally simple.
- Fallback playlists ensure the app remains usable even if Spotify or OpenWeather are down or rate-limited.

---

## Future improvements

Some natural next steps if you want to extend this project:

- 🔐 **Spotify OAuth (user-specific playlists)**  
  Allow the user to log in with Spotify and pull their own playlists, or tag certain playlists as “DevMood” favourites.

- 💾 **Persistence & analytics**  
  Store selected moods, weather buckets and chosen playlists in a database (e.g. DynamoDB) to display stats about what works best for focus.

- 🌍 **Fine-grained weather mapping**  
  Expand weather buckets (Snow, Storm, Fog) and tune playlist search queries accordingly.

- ⚙️ **Infrastructure as code**  
  Use AWS SAM / CDK / Terraform to define the Lambda + Function URL + configuration in code.

---

## About the project

DevMood DJ is designed as a **portfolio-ready side project**: small enough to build in a few days, but realistic enough to demonstrate:

- frontend skills (modern React + Tailwind, clean UI/UX)
- backend skills (serverless Lambda, Node.js, working with external APIs)
- practical use of environment variables and API keys
- integrating multiple services into a coherent product idea
