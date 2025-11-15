# DevMood DJ

_Weather- and mood-driven Spotify helper for developers._

DevMood DJ is a personal tool that recommends music to match your current coding mood.
The app combines:

- **Spotify Web API** - user playlists and favorites
- **Weather API** (e.g., OpenWeather) - current conditions
- **AWS serverless backend** - logic and rules
- **React frontend** - a simple UI to kick off a coding session

> Example: if it is raining outside and you pick the _Motivation_ mood, the app suggests
> an energetic boost playlist. On a sunny Saturday morning the same mood can route to a lighter feel-good list.

## Tech stack

- **Frontend:** React + Vite, single-page app (SPA)
- **Backend:** AWS Lambda + API Gateway (serverless)
- **Data:** DynamoDB (user rules, settings, and profile)
- **Infra:** S3 (frontend hosting), possibly CloudFront later
- **APIs:**
  - Spotify Web API (OAuth2, playlist fetch and management)
  - Weather API (e.g., OpenWeather current weather)

## Secrets policy

This repo does not contain any secrets:

- No Spotify client secret or access tokens
- No weather API key
- No AWS access key

All secrets are set via **environment variables** (e.g., `.env` locally and Lambda environment variables in the cloud).

## Project status

- [ ] Project plan (`PROJECT_PLAN.md`)
- [ ] Frontend skeleton (React + Vite)
- [ ] Backend skeleton (Lambda handler + API Gateway plan)
- [ ] DynamoDB schema for rules
- [ ] Spotify + weather API integration
- [ ] Deploy to S3 (frontend) + Lambda (backend)
