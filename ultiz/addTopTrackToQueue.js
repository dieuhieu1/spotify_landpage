import { accessToken } from "../app";

export async function addToQueue(trackURI) {
  const url = `https://api.spotify.com/v1/me/player/queue?uri=${trackURI}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    console.log(`Đã thêm ${trackURI} vào queue.`);
  } else {
    console.error("Không thể thêm bài hát vào queue:", await response.json());
  }
}
