# Spotify Clone - README

## Overview
This project is a Spotify Clone built using **HTML, CSS, and JavaScript**, which dynamically fetches data from **Spotify API**. It allows authenticated users to view their playlists and play music directly from Spotify.

## Features
- **Spotify Authentication:** Users authenticate using their Spotify account.
- **Fetch Playlists:** Display user playlists dynamically.
- **Play Music:** Play songs directly from Spotify.

## Prerequisites
Before running the project, ensure you have:
- A **Spotify Developer Account**
- A registered **Spotify App** (to get Client ID)
- **Live Server** (or any HTTP server to run the frontend)

## Setting Up Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Click **Create an App**
3. Set **Redirect URI** to `http://localhost:5500`
4. Copy **Client ID** and use it in the `script.js`

## Project Structure
```
📂 spotify-clone
 ├── 📜 index.html      # Main page
 ├── 📜 styles.css      # Styling
 ├── 📜 script.js       # Main logic for fetching Spotify data
 ├── 📜 README.md       # This guide
```

## How to Run
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/spotify-clone.git
   cd spotify-clone
   ```
2. Open `index.html` in Live Server or a browser.

## Authentication Flow
1. **Click Login Button** → Redirects to Spotify Auth Page.
2. **User Grants Access** → Redirects back with `access_token`.
3. **Fetch Data** → Playlists & music are loaded dynamically.

## API Endpoints Used
- **Authorization:** `https://accounts.spotify.com/authorize`
- **Get User Playlists:** `https://api.spotify.com/v1/me/playlists`
- **Play Track:** `https://api.spotify.com/v1/me/player/play`

## Future Enhancements
- Implement Search Functionality
- Add Volume and Playback Controls
- Improve UI/UX and Responsive

## Troubleshooting
- **Invalid Token?** Ensure your Spotify App's Redirect URI matches.
- ** Make sure your Spotify Account have premium to adapt the policy API of Spotify :(((
- **No Sound?** Make sure a device is active on Spotify.


