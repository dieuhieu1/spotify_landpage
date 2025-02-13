import { main, player, playlistItems, spotifyPlayer } from "../app.js";
import { getCurrentPlayingTrack } from "../fetchAPI.js";
import { renderFooterSong } from "./renderData.js";

export async function handlePlayNextTrack() {
  try {
    // Chuyển bài hát tiếp theo ngay lập tức
    const res = await spotifyPlayer.nextTrack();
    console.log(res);
    // Thêm khoảng trễ nhỏ để đảm bảo trạng thái bài hát được cập nhật
    await new Promise((resolve) => setTimeout(resolve, 200)); // 0.5 giây để tăng tốc độ

    // Lấy thông tin bài hát đang phát
    const currentTrack = await getCurrentPlayingTrack();
    console.log(currentTrack);
    if (!currentTrack || !currentTrack.item) {
      console.error("Không thể lấy thông tin bài hát hiện tại.");
      return;
    }

    // Render dữ liệu Footer
    // Tìm chỉ số bài hát trong playlist
    const currentIndex = playlistItems.findIndex(
      (item) => item.track.id === currentTrack.item.id
    );
    // Kiểm tra xem bài hát có trong danh sách phát hay không
    if (currentIndex === -1) {
      // Nếu không có, hiển thị bài hát từ API
      renderFooterSong(-1, currentTrack);
      main.addChangeProgress(-1, currentTrack);
    } else {
      // Nếu có, cập nhật UI với bài hát từ danh sách phát
      renderFooterSong(currentIndex, "");
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
export async function handlePlayPrevTrack() {
  try {
    // Chuyển sang bài hát trước ngay lập tức
    await spotifyPlayer.previousTrack();
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Lấy thông tin bài hát đang phát sau khi chuyển
    const currentTrack = await getCurrentPlayingTrack();

    if (!currentTrack || !currentTrack.item) {
      console.error("Không thể lấy thông tin bài hát hiện tại.");
      return;
    }

    // Render dữ liệu Footer
    // Tìm chỉ số bài hát trong playlist
    const currentIndex = playlistItems.findIndex(
      (item) => item.track.id === currentTrack.item.id
    );

    // Kiểm tra xem bài hát trước có tồn tại trong playlist không
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
