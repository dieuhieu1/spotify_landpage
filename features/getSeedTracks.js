import { playlistItems } from "../app.js";

export async function getSeedTracks() {
  const seedTracks = playlistItems.slice(2, 10).map((item) => item.track.id);

  return seedTracks;

  //   console.log(playlistItems);
}
