import { accessToken } from "./app.js";

// Hàm lấy danh sách playlist và userId
export const getUserData = async (token) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();

    if (data.id) {
      return data.id;
    }
    // Lưu userId nếu có
  } catch (error) {
    console.error("Error fetching playlist data:", error);
  }
};

// Hàm lấy thông tin playlist của người dùng
export const getUserPlaylists = async (userId, limit) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    const data = await response.json();
    return data.items;
    // Lưu dữ liệu playlist
  } catch (error) {
    console.error("Error fetching user playlists:", error);
  }
};
export const getPlaylistData = async (playlistId) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );

    const data = await response.json();
    // console.log(data);

    // Lấy ra thời lương của 1 playlist
    // Reset bằng 0 trước khi thay đổi playlist khác
    var playlistTime = 0;

    data.tracks.items.forEach((item) => {
      if (item.track && item.track.duration_ms) {
        playlistTime += item.track.duration_ms / 1000; // Tính tổng thời gian bằng giây
      }
    });

    // Destructuring
    const {
      id,
      name,
      images,
      type,
      followers: { total },
      owner: { display_name },
      tracks: { items },
    } = data;
    const playlistData = {
      id,
      name,
      images,
      type,
      followers: total,
      display_name,
      items: items,
      playlistTime,
    };
    return playlistData;
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
};

export const getPlaylistItems = async (playlistId) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    const data = await response.json();

    if (data) {
      return data.items;
    }
  } catch (error) {
    console.error("Error fetching playlists items", error);
  }
};
export const playSong = async function (device_id, trackUri) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri], // URI của bài hát cần phát
          position_ms: 0, // Bắt đầu từ đầu bài hát
        }),
      }
    );
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
export const playSongInPlaylist = async function (
  device_id,
  playlistId,
  trackIndex
) {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context_uri: `spotify:playlist:${playlistId}`, // URI của playlist
          offset: { position: trackIndex }, // Vị trí bài hát trong playlist
          position_ms: 0, // Phát từ đầu bài hát
        }),
      }
    );
    console.log(response);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
export async function getCurrentPlayingTrack() {
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/currently-playing`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  return data;
}
export async function getTopItems(limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  console.log(data);

  return data;
}
export async function getRecommendations(seedTracks) {
  console.log(seedTracks.join(","));

  const response = await fetch(
    `https://api.spotify.com/v1/tracks?ids=${seedTracks.join(",")}&limit=10`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  return data.tracks;
}
export async function getUserSavedTrack() {
  const response = await fetch(`https://api.spotify.com/v1/me/tracks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data.items;
}

export async function getTrackById(trackId) {
  const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return data;
}
export async function getNewAlbumReleased(limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  return data;
}
export async function getUserTrack(limit) {
  const response = await fetch(
    `https://api.spotify.com/v1/me/tracks?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  return data;
}
