export function formatDate(isoDate) {
  const dateObj = new Date(isoDate);

  // Lấy ngày, tháng, năm
  const year = dateObj.getFullYear(); // Năm
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Tháng (Cộng 1 vì tháng tính từ 0)
  const day = dateObj.getDate().toString().padStart(2, "0"); // Ngày

  // Hiển thị ngày tháng năm theo định dạng bạn muốn
  return {
    day,
    month,
    year,
  };
}
