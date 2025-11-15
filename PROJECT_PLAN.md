# DevMood DJ - Project Plan

## 1. Goal

Build a personal web application that:

- combines **weather**, **time**, and **coding mood** (e.g., Deep Focus, Light Coding, Motivation, Feel Good)
- suggests a suitable Spotify playlist for the user
- runs on an **AWS serverless architecture**
- is easy to extend later (more users, additional rules, analytics)

---

## 2. MVP user journey

**In the MVP (Minimum Viable Product) version:**

1. The user opens the app in a browser.
2. The page shows:
  - current **weather** (e.g., temperature + short description)
  - a **mood selector** (buttons/dropdown: Deep Focus, Light Coding, Motivation, Feel Good)
  - a button: **"Get recommendation"**.
3. The user selects a mood and presses the button.
4. The frontend calls the backend endpoint.
5. The backend:
  - fetches the current weather via a weather API
  - uses simple rule logic (hard-coded or from DynamoDB) to choose a playlist
6. The frontend displays:
  - the recommended playlist name
  - an "Open in Spotify" button (link to Spotify).

In the MVP the user does not have to sign in to Spotify yet; we can rely on preselected public playlist URLs.

---

## 3. Architecture (MVP)

### 3.1 Overview

- **Frontend (`frontend/`):**
  - React + Vite
  - Calls the backend HTTP API
  - Hosted on AWS S3 (static website hosting)

- **Backend (`backend/`):**
  - 1-2 AWS Lambda functions
  - AWS API Gateway REST/HTTP API in front

- **External APIs:**
  - Weather API (e.g., OpenWeather) -> current weather
  - Spotify:
    - MVP: use hard-coded playlist URLs
    - Later version: real Spotify Web API + OAuth

- **Data (MVP):**
  - Initially we may not need a database:
    - mood + weather -> playlist can be mapped with hard-coded rules
  - Later:
    - DynamoDB table for user rules

---

## 4. Backend: endpoints (MVP)

### 4.1 `GET /status` (optional in the MVP)

- Purpose: verify that the backend is alive.
- Returns e.g.:
  ```json
  {
    "ok": true,
    "message": "DevMood DJ backend up"
  }
  ```

### 4.2 `POST /recommendation`

- Request body (example):
  ```json
  {
    "mood": "DeepFocus"
  }
  ```
- The backend:
  1. Fetches current weather via the weather API (e.g., Clear / Clouds / Rain / Snow).
  2. Combines it with the selected mood.
  3. Picks a suitable playlist (MVP: hard-coded mapping).

- Response (example):
  ```json
  {
    "mood": "DeepFocus",
    "weather": "Rain",
    "playlistName": "Deep Focus on Rainy Days",
    "playlistUrl": "https://open.spotify.com/playlist/123...",
    "note": "Rainy-day deep focus playlist suggestion."
  }
  ```

---

## 5. Rule logic (MVP)

The MVP can keep a very simple mapping, for example:

```txt
Weather: Clear, Mood: DeepFocus     -> Playlist A
Weather: Clear, Mood: FeelGood      -> Playlist B
Weather: Rain,  Mood: DeepFocus     -> Playlist C
Weather: Rain,  Mood: Motivation    -> Playlist D
Weather: Clouds, Mood: LightCoding  -> Playlist E
```

This can be implemented as:

- a hard-coded object mapping in the backend **or**
- storing the mapping in a DynamoDB table later.

Future extensions:

- more mood options
- include time of day / weekday in the logic
- user-specific rules.

---

## 6. Data models (for later, not required in the MVP)

### 6.1 Rules (future DynamoDB structure)

```json
{
  "userId": "uuid_or_fixed_user_for_now",
  "ruleId": "uuid",
  "name": "Rainy evening motivation",
  "weather": ["Rain"],
  "mood": "Motivation",
  "timeOfDay": { "from": "17:00", "to": "23:00" },
  "daysOfWeek": ["Mon", "Tue", "Wed", "Thu"],
  "playlistId": "spotify_playlist_id",
  "playlistUrl": "https://open.spotify.com/playlist/..."
}
```

In the MVP we can use:

```json
{
  "weather": "Rain",
  "mood": "Motivation",
  "playlistUrl": "https://open.spotify.com/playlist/..."
}
```

---

## 7. MVP scope (checklist)

**Frontend:**

- [ ] React + Vite project under `frontend/`
- [ ] Simple UI:
  - [ ] Mood selector (buttons/dropdown)
  - [ ] "Get recommendation" button
  - [ ] Displays the recommended playlist name + link

**Backend:**

- [ ] Node.js-based Lambda function under `backend/`
- [ ] API Gateway endpoint `POST /recommendation`
- [ ] Weather API integration (current weather for a single location)
- [ ] Hard-coded mood + weather -> playlist mapping

**Infra:**

- [ ] AWS account & IAM user
- [ ] Lambda deployment (zip etc.)
- [ ] API Gateway URL configured in the frontend environment variable
- [ ] Frontend built and hosted in S3

---

## 8. Post-MVP ideas

- Spotify OAuth:
  - expose the user's own playlists
  - allow the user to pick which playlist to use in each mood
- User-specific rules in DynamoDB (multi-user support)
- More advanced rule engine (time of day, weekday, audio features)
- Small analytics view showing which playlists are used most in different weathers and moods.
