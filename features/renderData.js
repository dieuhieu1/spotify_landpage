import {
  $,
  audioContainerSlider,
  libPlaylistsData,
  library,
  main,
  mainPlaylist,
  playlistId,
  playlistItems,
  recommendPlaylists,
  recommendsList,
  stickyNamePlaylist,
  tracksList,
  userId,
} from "../app.js";
import {
  getNewAlbumReleased,
  getPlaylistData,
  getTopItems,
  getUserPlaylists,
  getUserTrack,
} from "../fetchAPI.js";
import { adjustBrightness } from "../ultiz/adjustBrightness.js";
import { formatDate } from "../ultiz/formatDate.js";
import { getAverageColor } from "../ultiz/getAverageColor.js";
import { getNonNullObjects } from "../ultiz/getNonNull.js";
import { timeCalculator } from "../ultiz/timeCalculator.js";
var playlistName;

export function renderLibrary() {
  if (!libPlaylistsData || libPlaylistsData.length === 0) return;
  // Render danh sách playlist
  const libPlaylists = libPlaylistsData.map((playlist) => {
    if (!playlist) {
      return;
    }
    return `
      <div class="playlist" id="${playlist.id}">
      <div class="thumb" style="background-image: url('${playlist.images[0].url}');"></div>
      <div class="body">
      <h3 class="title roboto-bold">${playlist.name}</h3>
      <p class="song-info roboto-regular">${playlist.type} &bull; ${playlist.owner.display_name}</p>
      </div>
      </div>
      `;
  });

  library.innerHTML += libPlaylists.join(""); // Cập nhật nội dung thư viện
}
export function renderPlaylist(playlistData) {
  const { playlistTime } = playlistData;

  const time = timeCalculator(playlistTime);

  playlistName = playlistData.name;
  const playlistInfo = `
      <div class="playlist-cover"
           style="background-image: url('${playlistData.images[0].url}');">
      </div>
      <div class="playlist-info">
      <div class="info-container">
      <p class="roboto-medium">Playlist</p>
      <h1 class="roboto-black">${playlistData.name}</h1>
      <p class="roboto-medium">
      <span class="roboto-bold">${playlistData.display_name}</span> &bull; ${
    playlistData.followers
  } lượt lưu
          &bull; ${playlistData.items.length} bài hát, 
          ${time.hour > 0 ? `${time.hour} giờ ` : ""}${time.minute} phút ${
    time.second
  } giây
        </p>
        </div>
        </div>
        `;
  mainPlaylist.innerHTML = playlistInfo;

  // Thêm tên của playlist mới
  const stickyName = `
      <div class="toggle-play-btn play-playlist-btn" >
        <i class="fa-solid fa-play icon-play"></i>
        <i class="fa-solid fa-pause icon-pause"></i>
      </div>
      <h2>${playlistName}</h2>
      `;
  stickyNamePlaylist.innerHTML = stickyName;
  // const playlist = playlistData.map((index, playlistInfo) => {});

  const playlistControl = $(".songs-in-playlist");
  const trackList = $(".track-list");
  const imageSrc = playlistData.images[0].url; // Đường dẫn ảnh
  console.log(imageSrc);
  getAverageColor(imageSrc, function (averageColor) {
    if (averageColor) {
      const lighter = adjustBrightness(averageColor, 1.2);

      const darker = adjustBrightness(averageColor, 0.8);

      // Áp dụng màu làm màu nền cho trang
      mainPlaylist.style.backgroundImage = `linear-gradient(to bottom, rgb(${lighter}), rgb(${darker}))`;
      const controlColor = adjustBrightness(averageColor, 0.4);
      playlistControl.style.background = `rgb(${controlColor})`;
      trackList.style.backgroundImage = `linear-gradient(to bottom, rgb(${controlColor}), #121212)`;
    } else {
      console.error("Không thể lấy màu trung bình từ ảnh.");
    }
  });
}
export function renderTrackList(playlistItems) {
  const songs = playlistItems.map((item, index) => {
    const isoDate = item.added_at;
    const formated = formatDate(isoDate);

    const timeAdded = `${formated.day} thg ${formated.month}, ${formated.year}`;
    if (item.track === null) {
      return;
    }
    const songDuration = item.track.duration_ms / 1000;
    const timeData = timeCalculator(songDuration);
    if (timeData.second == 0) {
      timeData.second = "00";
    } else if (timeData.second < 10) {
      const second = timeData.second;
      timeData.second = "0" + second;
    }

    // Tạo hàng của bài hát
    return `
        <tr class="song-row" data-index="${index}">
          <td class="number">${index + 1}</td>
          <td>
            <div class="title">
              <div
              class="thumb"
              style="background-image: url('${item.track.album.images[0].url}');
              "></div>
              <div class="body">
                <h3 class="title roboto-bold">${item.track.name}</h3>
                <p class="song-info roboto-regular">
                  ${item.track.artists[0].name}
                </p>
              </div>
            </div>
          </td>
          <td>${item.track.album.name}</td>
          <td>${timeAdded}</td>
          <td>${timeData.minute > 0 ? timeData.minute : "0"}:${
      timeData.second
    }</td>
        </tr>`;
  });

  tracksList.innerHTML = songs.join("");
  main.attachSongClickHandlers();
}
export function renderRecommmends() {
  var tempQueue = [];
  const songs = recommendPlaylists.map((item) => {
    // Tạo hàng của bài hát
    tempQueue.push(item.track.uri);
    return `
         <tr class="song-row" trackURI=${item.track.uri} id=${item.track.id}>
            <td>
              <div class="title">
                <div
                  class="thumb"
                  style="
                    background-image: url('${item.track.album.images[0].url}');
                  "
                ></div>
                <div>
                  <h3 class="title roboto-bold">${item.track.name}</h3>
                  <p class="song-info roboto-regular">${item.track.artists[0].name}</p>
                </div>
              </div>
            </td>
            <td>${item.track.album.name}</td>
            <td><button class="add-btn roboto-medium">Thêm</button></td>
        </tr>`;
  });

  recommendsList.innerHTML = songs.join("");
  main.attachSongClickHandlers();
}
export function renderFooterSong(index, track) {
  var song;
  if (track) {
    song = track;
  } else {
    song = playlistItems[index].track; // Lấy bài hát tương ứng từ playlistItems
  }
  console.log(song);

  const songDuration = song.duration_ms / 1000;
  const timeData = timeCalculator(songDuration);
  if (timeData.second == 0) {
    timeData.second = "00";
  } else if (timeData.second < 10) {
    const second = timeData.second;
    timeData.second = "0" + second;
  }

  const songInfo = {
    id: song.id,
    name: song.name,
    artist: song.artists[0].name,
    image: song.album.images[0].url,
  };

  // Hiển thị thông tin bài hát ở Footer
  const play = $(".play");
  play.innerHTML = `
    <div class="play">
        <div
          class="play-thumb"
          style="
            background-image: url('${songInfo.image}');
          "
        ></div>
        <div class="play-info">
          <h2 class="roboto-medium">${songInfo.name}</h2>
          <span>
            <p class="roboto-regular">${songInfo.artist}</p>
          </span>
        </div>
      </div>
  `;
  audioContainerSlider.innerHTML = `
    <p id="current-time">00:00</p>
      <div class="slideContainer">
        <input
          type="range"
          min="1"
          max="100"
          value="1"
          id="myRange"
          class="slider"
        />
        </div>
    <p id="duration">${timeData.minute}:${timeData.second}</p>
  `;
}
export async function renderHomePage() {
  const main = $(".main");
  const playlists = getNonNullObjects(libPlaylistsData, 8);
  console.log(playlists);
  const topItems = await getTopItems(8);
  const forUser = await getNewAlbumReleased(5);
  const reListen = await getUserTrack(5);
  console.log(topItems.items, forUser.albums.items, reListen.items);
  const htmlTopItems = playlists.map((item) => {
    return `<div class="home-playlist">
    <div>
      <div
          class="thumb"
          style="background-image: url('${item.images[0].url}')"
      ></div>
    </div>
    <div>${item.name}</div>
    </div>`;
  });
  // $(".playlist-categories").innerHTML = htmlTopItems;
  const forUserHTML = forUser.albums.items.map((item) => {
    return ` <div class="mix-item">
            <div
                class="thumb"
                style="background-image: url('${item.images[0].url}')"
            ></div>
            <p>${item.name}</p>
          </div>`;
  });
  // $(".section .daly-mix-1").innerHTML = forUserHTML;
  const reListenHTML = reListen.items.map((item) => {
    return ` <div class="mix-item">
            <div
                class="thumb"
                style="background-image: url('${item.track.album.images[0].url}')"
            ></div>
            <p>${item.track.name}</p>
          </div>`;
  });
  // $(".section .daly-mix-2").innerHTML = reListenHTML;
  const playlist_cate = `<div class="playlist-categories">
      ${htmlTopItems.join("")}
    </div>`;
  const dailyMix1 = `<div class="section">
      <h2>Dành cho loser hieu</h2>
      <div class="daily-mix-1">
      ${forUserHTML.join("")}
      </div>
    </div>`;
  const dailyMix2 = `<div class="section">
      <h2>Mới phát gần đây</h2>
      <div class="daily-mix-2">
      ${reListenHTML.join("")}
      </div>
    </div>`;
  console.log(
    `<div class="container">
    ${playlist_cate}  ${dailyMix1}  ${dailyMix2}
  </div>`
  );
  mainPlaylist.innerHTML = `<div class="container">
  <div class="home-header">
          <button class="tab active">Tất cả</button>
          <button class="tab">Âm nhạc</button>
          <button class="tab">Podcasts</button>
        </div>
    ${playlist_cate}  ${dailyMix1}  ${dailyMix2}
  </div>`;
}
