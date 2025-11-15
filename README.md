# DevMood DJ

Personal “mood DJ” for developers: pick your coding mood, select the city you are in, and DevMood DJ returns a Spotify playlist that matches both your vibe and the current weather.

## Highlights

- 🎧 **Mood aware playlists** – Deep Focus, Motivation, Light Coding, Feel Good and more.
- 🌦️ **Live weather context** – Uses OpenWeather data for whichever city you pick.
- 🌓 **Dual theming** – Orange/black dark mode and white/blue light mode with instant switching.
- 🗺️ **City selector** – Preloads the biggest Finnish cities plus Stockholm and London.
- ⚡ **Serverless ready backend** – AWS Lambda combines mood + weather rules and returns playlists.

## System Architecture

- **Frontend (frontend/)**
  - React + Vite + Tailwind CSS v3.
  - Fetches `POST /recommendation` from the backend via `VITE_API_BASE_URL`.
  - Hosted on AWS S3/CloudFront (or any static host).
- **Backend (backend/)**
  - Node.js Lambda deployed behind API Gateway.
  - Calls OpenWeather API with the selected city and mood rules (hard-coded or future DynamoDB table).
  - Returns playlist metadata + Spotify URL.
- **External services**
  - OpenWeather API for current conditions.
  - Spotify public playlists (OAuth can be added later).

```
┌──────────────┐     POST /recommendation      ┌─────────────────────┐      ┌──────────────────┐
│  React/Vite  │ ───────────────────────────▶ │ AWS Lambda (Node.js) │ ───▶│ OpenWeather API  │
│  Frontend    │ ◀─────────────────────────── │ + API Gateway        │ ───▶│ Spotify Playlists│
└──────────────┘       playlist response       └─────────────────────┘      └──────────────────┘
```

## Tech Stack

| Layer      | Details |
|------------|---------|
| Frontend   | React 19, Vite, Tailwind CSS 3, custom theming |
| Backend    | AWS Lambda (Node.js), AWS API Gateway |
| Data       | Hard-coded rules → future DynamoDB table |
| Infra      | S3/CloudFront (frontend), Lambda + API Gateway (backend) |
| APIs       | OpenWeather, Spotify public playlists |

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup steps

```bash
cd frontend
npm install
cp .env.example .env   # create manually if the file does not exist
```

Edit `.env` and set:

```
VITE_API_BASE_URL=https://your-lambda-function-url.amazonaws.com
```

### Run the app

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run preview   # optional local preview of the dist/ folder
```

## Backend Contract

`POST /recommendation`

```json
{
  "mood": "DeepFocus",
  "city": "Helsinki,FI"
}
```

Response example:

```json
{
  "mood": "DeepFocus",
  "weather": "Rain",
  "playlistName": "Deep Focus Rain Sessions",
  "playlistUrl": "https://open.spotify.com/playlist/123",
  "note": "Rain helps you tunnel into the hard stuff."
}
```

## Secrets & Environment

- Never commit Spotify, OpenWeather, or AWS credentials.
- Frontend uses Vite env vars (`VITE_*`).
- Lambda stores its own environment variables for API keys.

## Deployment Notes

1. **Frontend** – `npm run build`, upload `frontend/dist` to S3/CloudFront.
2. **Backend** – Package Lambda (or use CDK/SAM) and expose `POST /recommendation` via API Gateway.
3. **Config** – Update `VITE_API_BASE_URL` to the gateway URL and redeploy the frontend.

## Roadmap

- [ ] Implement real OpenWeather + Spotify API hooks in the Lambda function.
- [ ] Store mood/weather rules in DynamoDB for easy edits.
- [ ] Add Spotify OAuth to allow personal playlists.
- [ ] Analytics view: what you listen to in each weather + mood combo.
