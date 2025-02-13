import { getSeedTracks } from "./features/getSeedTracks.js";
import {
  renderFooterSong,
  renderLibrary,
  renderPlaylist,
  renderTrackList,
  renderRecommmends,
  renderHomePage,
} from "./features/renderData.js";
import {
  handlePlayNextTrack,
  handlePlayPrevTrack,
} from "./features/songController.js";
import {
  getCurrentPlayingTrack,
  getPlaylistData,
  getPlaylistItems,
  getRecommendations,
  getTopItems,
  getTrackById,
  getUserData,
  getUserPlaylists,
  getUserSavedTrack,
  playSong,
  playSongInPlaylist,
} from "./fetchAPI.js";
import { timeCalculator } from "./ultiz/timeCalculator.js";

export let deviceId;
export let isRepeat = false;
export let isRandom = false;
export let activePlaylist;

export var libPlaylistsData;
export var userId;
export var playlistData;
export var recommendPlaylists;

export var playlistItems;
export var songDuration = 0;
export var playlistId;
export var spotifyPlayer;
export var playedSongs;
export const $ = document.querySelector.bind(document);
export const $$ = document.querySelectorAll.bind(document);
export const player = $(".player");
export const library = $(".library");
export const main_content = $(".main");
export const mainPlaylist = $(".main .main-playlist");
export const tracksList = $(".track-list .song-info");
export const recommendsList = $(".recommend-list .song-info");

export const stickyHeader = $(".main .sticky-header");
export const stickyHeaderVisible = $(".main .sticky-header.visible");
export const stickyNamePlaylist = $(".main .sticky-playlist-info");
export const audioContainerSlider = $(".audio-silide-container");
export const toggleBtn = $(".btn-toggle-play");
export const nextBtn = $(".btn-next");
export const prevBtn = $(".btn-prev");
export const repeatBtn = $(".btn-repeat");
export const randomBtn = $(".btn-random");
export const homeBtn = $(".home-container");

// Lấy token từ URL và bắt đầu quá trình
export const hash = window.location.hash
  .substring(1) // Bỏ dấu #
  .split("&") // Cắt array bắt đấu sau dấu &
  .reduce(function (initial, item) {
    if (item) {
      // access_token=BQsadad
      var parts = item.split("=");
      // array part = [access_token, URICode]
      initial[parts[0]] = decodeURIComponent(parts[1]);
      // Key Value thêm vào array
    }
    return initial;
  }, {});
// window.location.hash = "";
export let accessToken = hash.access_token;
export const authEndpoint = "https://accounts.spotify.com/authorize";

export const clientId = "8faa7d71093543769378d035b9216c65";
export const redirectUri = "http://127.0.0.1:5500/index.html";
const scopes = [
  "ugc-image-upload",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "app-remote-control",
  "streaming",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-follow-modify",
  "user-follow-read",
  "user-read-playback-position",
  "user-top-read",
  "user-read-recently-played",
  "user-library-modify",
  "user-library-read",
  "user-read-email",
  "user-read-private",
];

// Nếu không có token, điều hướng về trang login
if (!accessToken) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token`;
}

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = accessToken;

  spotifyPlayer = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });

  // Ready
  spotifyPlayer.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    deviceId = device_id;
  });

  // Not Ready
  spotifyPlayer.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  spotifyPlayer.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });

  spotifyPlayer.addListener("authentication_error", ({ message }) => {
    console.error(message);
  });

  spotifyPlayer.addListener("account_error", ({ message }) => {
    console.error(message);
  });
  spotifyPlayer.connect();
};

export const main = {
  playedSongs: [],
  // handleRandom: async function () {
  //   const currentTrack = await getCurrentPlayingTrack();
  //   if (this.playedSongs.length === playlistItems.length) {
  //     this.playedSongs = [];
  //   }
  //   var check;
  //   var randomIndex;
  //   this.playedSongs.push(currentTrack.item.id);
  //   do {
  //     randomIndex = Math.floor(Math.random() * playlistItems.length);
  //     console.log(playlistItems[randomIndex]);
  //     check = this.playedSongs.find(
  //       (id) => id === playlistItems[randomIndex].track.id
  //     );
  //   } while (check);
  //   playSong(deviceId, playlistId, randomIndex);
  // },
  attachSongClickHandlers: function () {
    $$(".song-row").forEach((songRow) => {
      songRow.addEventListener("dblclick", async function () {
        const index = this.getAttribute("data-index");
        console.log(index);
        // Nếu có data-index thì play các bài trong playlist
        if (index) {
          main.handleSongClick(index);
        }
        // Nếu đó là các bài trong Recommend thì playsong theo track
        if (!index) {
          const trackURI = this.getAttribute("trackURI");
          const trackId = this.getAttribute("id");
          console.log(trackURI);
          const track = await getTrackById(trackId);
          playSong(deviceId, trackURI);
          renderFooterSong(-1, track);
        }
      });
    });
  },

  handleSongClick: function (index) {
    console.log(playlistId);
    renderFooterSong(index);
    playSongInPlaylist(deviceId, playlistId, index);
    player.classList.add("playing");
    // Bắt đầu chơi nhạc cập nhật thanh nhạc liên tục
    this.onUpdateSeekBar(index);

    main.addChangeProgress(index);
  },
  addChangeProgress: function (index) {
    const rangeInput = document.getElementById("myRange");
    let seekTime;
    // Nếu không có index thì không tính toán tổng thời lượng bài hát
    // Return ngay lập tức
    if (index !== 0 && !index) {
      console.error("Invalid index provided");
      return;
    }
    rangeInput.addEventListener("input", function (e) {
      // Index lấy đúng thời gian track đang play
      const songDuration = playlistItems[index].track.duration_ms / 1000;
      seekTime = (e.target.value * songDuration) / 100;
      spotifyPlayer
        .seek(seekTime * 1000)
        .then()
        .catch((error) => {
          console.error("Error seeking:", error);
        });
    }); // Tính toán thời gian tua theo giây
  },
  onUpdateSeekBar: function () {
    let intervalId = setInterval(() => {
      spotifyPlayer.getCurrentState().then((state) => {
        if (state) {
          const { position, duration } = state;
          main.updateSeekBar(state);
          // Kiểm tra nếu bài hát đã kết thúc
          if (position >= duration) {
            main.playNextTrack();
            // Ngừng kiểm tra
            // Next sang bài tiếp theo
          } else if (state.paused) {
            clearInterval(intervalId); // Ngừng kiểm tra
          }
        }
      });
    }, 100);
  },
  updateSeekBar: function (state) {
    const currentTime = $("#current-time");
    const seekBar = $("#myRange");
    const currentTimeState = timeCalculator(state.position / 1000);
    if (currentTimeState.second == 0) {
      currentTimeState.second = "00";
    } else if (currentTimeState.second < 10) {
      const second = currentTimeState.second;
      currentTimeState.second = "0" + second;
    }

    currentTime.textContent = `${currentTimeState.minute}:${currentTimeState.second}`;

    const seekBarPercent = (state.position / state.duration) * 100;

    seekBar.value = `${seekBarPercent}`;
    var x = seekBar.value;

    if (seekBar.matches(":hover")) {
      seekBar.style.background =
        "linear-gradient(90deg, rgb(117, 252, 117)" +
        x +
        "%, rgb(64, 64, 64)" +
        x +
        "%)";
    } else {
      seekBar.style.background =
        "linear-gradient(90deg, rgb(255, 255, 255)" +
        x +
        "%, rgb(64, 64, 64)" +
        x +
        "%)";
    }
  },
  handleEvent: function () {
    $$(".playlist").forEach((playlistElement) => {
      playlistElement.onclick = playlistHandleClick;
    });
    function playlistHandleClick(e) {
      if (playlistId !== e.currentTarget.id) {
        playlistId = e.currentTarget.id; // Lấy id của bài hát
        // activePlaylist.classList.remove("active");
      }
      // Tự động gọi hàm sau khi dữ liệu được trả về
      (async () => {
        // Lấy data playlist phần header
        playlistData = await getPlaylistData(playlistId);
        renderPlaylist(playlistData);
        // Lấy data các items có trong playlist
        playlistItems = await getPlaylistItems(playlistId);
        renderTrackList(playlistItems);

        recommendPlaylists = await getUserSavedTrack();
        renderRecommmends();
        // Qua denn...
        // const seed = await getSeedTracks();
        // recommendPlaylists = await getRecommendations(seed);
        // renderRecommmends();
      })();
      activePlaylist = libPlaylistsData.find((playlist) => {
        return playlist.id === playlistId;
      });
      // console.log(activePlaylist);
      // if (activePlaylist) {
      //   activePlaylist.classList.add("active");
      // }
    }

    $$(".play-playlist-btn").forEach((playBtn) => {
      playBtn.onclick = handleStartPlaylist;
    });
    function handleStartPlaylist() {
      console.log("abc");
      // Chơi từ bài đầu trong playlist
      // main.handleSongClick(startIndex);
      playSongInPlaylist(deviceId, playlistId, 0);
      renderFooterSong(0);
      player.classList.add("playing");
      // Bắt đầu chơi nhạc cập nhật thanh nhạc liên tục
      main.onUpdateSeekBar(0);
      main.addChangeProgress(0);
      // Kiểm tra và thay đổi trạng thái của nút (chơi/pause)
      const play = $$(".play-playlist-btn")[0];
      console.log(play.classList);

      if (play.classList.contains("playing")) {
        const plays = $$(".play-playlist-btn");
        plays.forEach((button) => {
          button.classList.remove("playing");
        });
      } else {
        const plays = $$(".play-playlist-btn");
        plays.forEach((button) => {
          button.classList.add("playing");
        });
      }
    }
    // Khi resume/pause chơi nhạc
    toggleBtn.onclick = function () {
      if (player.classList.contains("playing")) {
        player.classList.remove("playing");
        spotifyPlayer
          .pause()
          .then(() => {
            // Thêm lớp paused vào slider
            console.log("Music paused");
            spotifyPlayer.getCurrentState().then((state) => {
              if (state) {
                const slider = $("#myRange");
                const seekBarPercent = (state.position / state.duration) * 100;
                console.log(seekBarPercent);

                var x = seekBarPercent;

                slider.addEventListener("mouseover", function () {
                  slider.style.background =
                    "linear-gradient(90deg, rgb(117, 252, 117)" +
                    x +
                    "%, rgb(64, 64, 64)" +
                    x +
                    "%)";
                });

                slider.addEventListener("mouseout", function () {
                  slider.style.background =
                    "linear-gradient(90deg, rgb(255, 255, 255)" +
                    x +
                    "%, rgb(64, 64, 64)" +
                    x +
                    "%)";
                });
              }
            });
          })
          .catch((error) => {
            console.error("Error pausing music:", error);
          });
      } else {
        player.classList.add("playing");
        spotifyPlayer
          .resume()
          .then(() => {
            main.onUpdateSeekBar();
            console.log("Music resumed");
          })
          .catch((error) => {
            console.error("Error resuming music:", error);
          });
      }
    };
    // Khi next nhạc
    nextBtn.onclick = function () {
      //Nếu không có random
      if (!isRandom) {
        handlePlayNextTrack();
      } else {
        main.handleRandom();
      }
    };
    prevBtn.onclick = function () {
      handlePlayPrevTrack();
    };
    repeatBtn.onclick = function () {
      if (!isRepeat) {
        isRepeat = true;
        $(".repeat-icon path").setAttribute("fill", "#00FF00");
      } else {
        isRepeat = false;
        $(".repeat-icon path").setAttribute("fill", "#000000");
      }
      console.log(isRepeat);
    };
    randomBtn.onclick = function () {
      const paths = $$(".btn-random path"); // Chọn tất cả các thẻ path trong .btn-random
      if (!isRandom) {
        isRandom = true;
        paths.forEach(function (path) {
          path.setAttribute("fill", "#00FF00"); // Màu xanh lá cây
        });
      } else {
        isRandom = false;
        paths.forEach(function (path) {
          path.setAttribute("fill", "#000000"); // Màu xanh lá cây
        });
      }
      console.log(isRepeat);
    };
    homeBtn.onclick = function () {
      renderHomePage();
    };
    main_content.onscroll = function () {
      const scrollTop = main_content.scrollTop;

      if (scrollTop >= 420) {
        stickyHeader.classList.add("visible");
      } else {
        stickyHeader.classList.remove("visible");
      }
    };

    //Lắng nghe sự kiện kéo library
    library.onscroll = function () {
      library.classList.add("scrolling"); // Thêm class khi cuộn
      // console.log(library.scrollTop);

      // Loại bỏ class sau khi dừng cuộn
      clearTimeout(library.scrollTimeout);
      library.scrollTimeout = setTimeout(function () {
        library.classList.remove("scrolling");
      }, 1000); // Sau 1 giây không cuộn, ẩn thanh cuộn
    };
  },
  start: async function () {
    try {
      // Lấy danh sách playlist và userId
      userId = await getUserData(accessToken);
      libPlaylistsData = await getUserPlaylists(userId, 50);
      // Render thư viện sau khi có dữ liệu
      renderLibrary();
      // Lấy dữ liệu playlist đầu tiên và render
      playlistData = await getPlaylistData(libPlaylistsData[20].id);
      renderPlaylist(playlistData);
      // Lấy dữ liệu các bài hát trong playlist và render
      playlistItems = await getPlaylistItems(libPlaylistsData[20].id);
      renderTrackList(playlistItems);
      // Cho playlistId de phat cac song trong playlist
      playlistId = libPlaylistsData[20].id;
      // Fake Recommend từ User Saved Tracks
      recommendPlaylists = await getUserSavedTrack();
      renderRecommmends();
      // Qua den....
      // Lấy các bài hát trong playlist

      // const seed = await getSeedTracks();

      // Call API Recommned dựa trên các bài trong playlist
      // Render

      // recommendPlaylists = await getRecommendations(seed);
      // renderRecommmends();
      this.handleEvent();
    } catch (error) {
      console.error("Error:", error);
    }
  },
};

main.start();
