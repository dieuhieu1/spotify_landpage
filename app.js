let deviceId;
let isRepeat = false;
let isRandom = false;

var libPlaylistsData;
var userId;
var playlistData;
var playlistTime = 0;
var playlistItems;
var songDuration = 0;
var playlistName;
var playerSpotify;
var playlistId;

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const player = $(".player");
const library = $(".library");
const main_content = $(".main");
const mainPlaylist = $(".main .main-playlist");
const songInfo = $(".track-list .song-info");
const stickyHeader = $(".main .sticky-header");
const stickyHeaderVisible = $(".main .sticky-header.visible");
const stickyNamePlaylist = $(".main .sticky-playlist-info");
const audioContainerSlider = $(".audio-silide-container");
const toggleBtn = $(".btn-toggle-play");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const repeatBtn = $(".btn-repeat");
const randomBtn = $(".btn-random");

// Lấy token từ URL và bắt đầu quá trình

const hash = window.location.hash
  .substring(1) // Remove the '#' at the start
  .split("&") // Split into an array by '&'
  .reduce(function (initial, item) {
    if (item) {
      var parts = item.split("="); // Split each item by '='
      initial[parts[0]] = decodeURIComponent(parts[1]); // Decode and assign to initial object
    }
    return initial; // Return the updated object
  }, {});
// window.location.hash = "";
let accessToken = hash.access_token;
// const authEndpoint = "https://accounts.spotify.com/authorize";

// // Replace with your app's client ID, redirect URI and desired scopes
// const clientId = "8faa7d71093543769378d035b9216c65";
// const redirectUri = "http://127.0.0.1:5500/index.html";
// const scopes = [
//   "streaming",
//   "user-modify-playback-state",
//   "user-library-modify",
//   "user-read-private",
//   "user-read-email",
//   "playlist-read-private",
//   " playlist-read-collaborative",
//   "user-read-playback-state ",
// ];

// // If there is no token, redirect to Spotify authorization
// if (!accessToken) {
//   window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
//     "%20"
//   )}&response_type=token`;
// }

// Set token
window.onSpotifyWebPlaybackSDKReady = () => {
  const token = accessToken;

  playerSpotify = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });

  // Ready
  playerSpotify.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    deviceId = device_id;
    console.log(deviceId);
  });

  // Not Ready
  playerSpotify.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  playerSpotify.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });

  playerSpotify.addListener("authentication_error", ({ message }) => {
    console.error(message);
  });

  playerSpotify.addListener("account_error", ({ message }) => {
    console.error(message);
  });
  playerSpotify.connect();
};

const main = {
  playedSongs: [],
  renderLibrary: function () {
    if (!libPlaylistsData || libPlaylistsData.length === 0) return;

    // Render danh sách playlist
    const libPlaylists = libPlaylistsData.map(
      (playlist) => `
      <div class="playlist" id="${playlist.id}">
        <div class="thumb" style="background-image: url('${playlist.images[0].url}');"></div>
        <div class="body">
          <h3 class="title roboto-bold">${playlist.name}</h3>
          <p class="song-info roboto-regular">${playlist.type} &bull; ${playlist.owner.display_name}</p>
        </div>
      </div>
    `
    );

    library.innerHTML += libPlaylists.join(""); // Cập nhật nội dung thư viện
  },
  renderPlaylist: function () {
    // console.log(playlistData);
    const time = main.timeCalculator(playlistTime);

    playlistName = playlistData.name;
    const playlistInfo = `
      <div class="playlist-cover"
           style="background-image: url('${playlistData.images[0].url}');">
      </div>
      <div class="playlist-info">
        <p class="roboto-medium">Playlist</p>
        <h1 class="roboto-black">${playlistData.name}</h1>
        <p class="roboto-medium">
          <span class="roboto-bold">${
            playlistData.display_name
          }</span> &bull; ${playlistData.followers} lượt lưu
          &bull; ${playlistData.items.length} bài hát, 
          ${time.hour > 0 ? `${time.hour} giờ ` : ""}${time.minute} phút ${
      time.second
    } giây
        </p>
      </div>
    `;
    mainPlaylist.innerHTML = playlistInfo;
    // const playlist = playlistData.map((index, playlistInfo) => {});
  },
  renderTrackList: function () {
    const songs = playlistItems.map((item, index) => {
      const isoDate = item.added_at;
      const format = this.formatDate(isoDate);
      const timeAdded = `${format.day} thg ${format.month}, ${format.year}`;
      const songDuration = item.track.duration_ms / 1000;
      const timeData = this.timeCalculator(songDuration);
      if (timeData.second == 0) {
        timeData.second = "00";
      } else if (timeData.second < 10) {
        const second = timeData.second;
        timeData.second = "0" + second;
      }

      // Tạo hàng của bài hát
      return `
        <tr class="song-row" data-index="${index}" >
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

    songInfo.innerHTML = songs.join("");
    this.attachSongClickHandlers();
  },

  formatDate: function (isoDate) {
    const dateObj = new Date(isoDate);

    // Lấy ngày, tháng, năm
    const year = dateObj.getFullYear(); // Năm
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Tháng (Cộng 1 vì tháng tính từ 0)
    const day = dateObj.getDate().toString().padStart(2, "0"); // Ngày

    // Hiển thị ngày tháng năm theo định dạng bạn muốn
    return (formattedDate = { day: day, month: month, year: year });
  },
  timeCalculator: function (time) {
    const hour = Math.floor(time / 3600);
    const minute =
      hour > 0 ? Math.floor((time - hour * 3600) / 60) : Math.floor(time / 60);
    const second = Math.floor(time % 60);
    const dataTime = { hour: hour, minute: minute, second: second };
    return dataTime;
  },
  attachSongClickHandlers: function () {
    $$(".song-row").forEach((songRow) => {
      songRow.addEventListener("dblclick", function () {
        const index = this.getAttribute("data-index");
        main.handleSongClick(index); // Gọi hàm xử lý khi nhấp
      });
    });
  },
  renderFooterSong: function (index, track) {
    var song;
    if (track) {
      song = track;
    } else {
      song = playlistItems[index].track; // Lấy bài hát tương ứng từ playlistItems
    }
    console.log(song);

    const songDuration = song.duration_ms / 1000;
    const timeData = this.timeCalculator(songDuration);
    if (timeData.second == 0) {
      timeData.second = "00";
    } else if (timeData.second < 10) {
      const second = timeData.second;
      timeData.second = "0" + second;
    }

    const songInfo = {
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
  },
  handleSongClick: function (index) {
    main.renderFooterSong(index);

    playSong(deviceId, playlistId, index);
    // Bắt đầu chơi nhạc cập nhật thanh nhạc liên tục
    player.classList.add("playing");
    this.onUpdateSeekBar(index);

    main.addChangeProgress(index);
  },
  addChangeProgress: function (index, id) {
    const rangeInput = document.getElementById("myRange");
    let seekTime;
    if (index) {
      rangeInput.addEventListener("input", function (e) {
        const songDuration = playlistItems[index].track.duration_ms / 1000;
        seekTime = (e.target.value * songDuration) / 100;
      }); // Tính toán thời gian tua theo giây
    } else {
    }

    playerSpotify
      .seek(seekTime * 1000)
      .then(() => {})
      .catch((error) => {
        console.error("Error seeking:", error);
      });
  },
  onUpdateSeekBar: function () {
    let intervalId = setInterval(() => {
      playerSpotify.getCurrentState().then((state) => {
        if (state) {
          const { position, duration } = state;
          main.updateSeekBar(state);
          // Kiểm tra nếu bài hát đã kết thúc
          if (position >= duration) {
            // main.playNextTrack(); // Ngừng kiểm tra
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
    const currentTimeState = this.timeCalculator(state.position / 1000);
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
      playlistId = e.currentTarget.id; // Lấy id của bài hát
      // Tự động gọi hàm sau khi dữ liệu được trả về
      (async () => {
        await getPlaylistData(playlistId);
        await getPlaylistItems(playlistId);
      })();
    }
    // Khi resume/pause chơi nhạc
    toggleBtn.onclick = function () {
      if (player.classList.contains("playing")) {
        player.classList.remove("playing");
        playerSpotify
          .pause()
          .then(() => {
            console.log("Music paused");
          })
          .catch((error) => {
            console.error("Error pausing music:", error);
          });
      } else {
        player.classList.add("playing");
        playerSpotify
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
        handleRandom();
      }
    };
    prevBtn.onclick = function () {
      handlePlayPrevTrack();
    };
    async function handleRandom() {
      const currentTrack = await getCurrentPlayingTrack();
      if (this.playedSongs.length === playlistItems.length) {
        this.playedSongs = [];
      }
      do {
        const randomSong = Math.floor(Math.random() * playlistItems.length);
      } while (this.playedSongs.randomSong);
      this.playedSongs.push(currentTrack.item.id);
    }
    async function handlePlayNextTrack() {
      try {
        // Chuyển bài hát tiếp theo ngay lập tức
        await playerSpotify.nextTrack();

        // Thêm khoảng trễ nhỏ để đảm bảo trạng thái bài hát được cập nhật
        await new Promise((resolve) => setTimeout(resolve, 200)); // 0.5 giây để tăng tốc độ

        // Lấy thông tin bài hát đang phát
        const currentTrack = await getCurrentPlayingTrack();

        if (!currentTrack || !currentTrack.item) {
          console.error("Không thể lấy thông tin bài hát hiện tại.");
          return;
        }

        // Tìm chỉ số bài hát trong playlist
        const currentIndex = playlistItems.findIndex(
          (item) => item.track.id === currentTrack.item.id
        );
        // Kiểm tra xem bài hát có trong danh sách phát hay không
        if (currentIndex === -1) {
          // Nếu không có, hiển thị bài hát từ API
          main.renderFooterSong(-1, currentTrack);
          main.addChangeProgress(-1, currentTrack);
        } else {
          // Nếu có, cập nhật UI với bài hát từ danh sách phát
          main.renderFooterSong(currentIndex, "");
          main.addChangeProgress(currentIndex, "");
        }

        if (!player.classList.contains("playing")) {
          player.classList.add("playing");
        }
        console.log(`Chuyển sang bài hát: ${currentTrack.item.name}`);
      } catch (error) {
        console.error("Lỗi khi chuyển sang bài hát tiếp theo:", error);
      }
    }
    async function handlePlayPrevTrack() {
      try {
        // Chuyển sang bài hát trước ngay lập tức
        await playerSpotify.previousTrack();
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Lấy thông tin bài hát đang phát sau khi chuyển
        const currentTrack = await getCurrentPlayingTrack();

        if (!currentTrack || !currentTrack.item) {
          console.error("Không thể lấy thông tin bài hát hiện tại.");
          return;
        }

        // Tìm chỉ số bài hát trong playlist
        const currentIndex = playlistItems.findIndex(
          (item) => item.track.id === currentTrack.item.id
        );

        // Kiểm tra xem bài hát trước có tồn tại không
        if (currentIndex === -1) {
          console.log("Không có bài hát trước.");
          return;
        }

        const prevTrack = playlistItems[currentIndex].track;

        // Cập nhật UI với bài hát trước
        main.renderFooterSong(currentIndex, "");
        main.addChangeProgress(currentIndex, "");

        console.log(`Chuyển về bài hát trước: ${prevTrack.name}`);
        if (!player.classList.contains("playing")) {
          player.classList.add("playing");
        }
      } catch (error) {
        console.error("Lỗi khi chuyển về bài hát trước:", error);
      }
    }
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
    main_content.onscroll = function () {
      main_content.classList.add("scrolling"); // Thêm class khi cuộn
      const scrollTop = main_content.scrollTop;

      if (scrollTop >= 420) {
        stickyHeader.classList.add("visible");
      } else {
        stickyHeader.classList.remove("visible");
      }

      // Loại bỏ class sau khi dừng cuộn
      clearTimeout(main_content.scrollTimeout);
      main_content.scrollTimeout = setTimeout(function () {
        main_content.classList.remove("scrolling");
      }, 1000); // Sau 1 giây không cuộn, ẩn thanh cuộn
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
      await getUserData(accessToken);
      await getUserPlaylists(userId, accessToken);
      // Render thư viện sau khi có dữ liệu
      this.renderLibrary();
      this.handleEvent();
    } catch (error) {
      console.error("Error:", error);
    }
  },
};

// Hàm lấy danh sách playlist và userId
const getUserData = async (token) => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const data = await response.json();
    // console.log(data);
    userId = data.id;
    // Lưu userId nếu có
  } catch (error) {
    console.error("Error fetching playlist data:", error);
  }
};

// Hàm lấy thông tin playlist của người dùng
const getUserPlaylists = async (userId, token) => {
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?limit=20`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const data = await response.json();
    // console.log(data);
    libPlaylistsData = data.items;
    console.log(libPlaylistsData);

    // Lưu dữ liệu playlist
  } catch (error) {
    console.error("Error fetching user playlists:", error);
  }
};
const getPlaylistData = async (playlistId) => {
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
    playlistTime = 0;

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
    playlistData = {
      id,
      name,
      images,
      type,
      followers: total,
      display_name,
      items: items,
    };
    main.renderPlaylist();
    stickyNamePlaylist.innerHTML = "";

    // Thêm tên của playlist mới
    const stickyName = `
            <i class="fa-solid fa-pause toggle-play-btn"></i>
            <h2>${playlistName}</h2>
          `;
    stickyNamePlaylist.innerHTML = stickyName;
  } catch (error) {
    console.error("Error fetching playlists:", error);
  }
};

const getPlaylistItems = async (playlistId) => {
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

    playlistItems = data.items;
    main.renderTrackList();
  } catch (error) {
    console.error("Error fetching playlists items", error);
  }
};
const playSong = async function (device_id, playlistId, trackIndex) {
  const url = `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`;
  const token = accessToken; // Đảm bảo biến _token chứa token hợp lệ

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context_uri: `spotify:playlist:${playlistId}`, // URI của playlist
        offset: { position: trackIndex }, // Bài hát tại index này sẽ được phát
        position_ms: 0, // Bắt đầu từ đầu bài hát
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      const errorText = await response.text();
      console.error(
        "Error playing track:",
        response.status,
        response.statusText,
        errorText
      );
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
async function getCurrentPlayingTrack() {
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
main.start();
