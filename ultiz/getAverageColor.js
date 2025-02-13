export function getAverageColor(imageSrc, callback) {
  const img = new Image();
  img.crossOrigin = "Anonymous"; // Để xử lý hình ảnh từ nguồn khác
  img.src = imageSrc;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Cài đặt kích thước canvas bằng với kích thước ảnh
    canvas.width = img.width;
    canvas.height = img.height;

    // Vẽ ảnh lên canvas
    context.drawImage(img, 0, 0, img.width, img.height);

    // Lấy dữ liệu pixel từ ảnh
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let pixelCount = 0;

    // Duyệt qua từng pixel
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Bỏ qua pixel trong suốt
      if (a === 0) continue;

      totalR += r;
      totalG += g;
      totalB += b;
      pixelCount++;
    }

    // Tính màu trung bình
    const avgR = Math.floor(totalR / pixelCount);
    const avgG = Math.floor(totalG / pixelCount);
    const avgB = Math.floor(totalB / pixelCount);

    const averageColor = `${avgR},${avgG},${avgB}`;
    callback(averageColor);
  };

  img.onerror = function () {
    console.error("Không thể tải ảnh");
    callback(null);
  };
}
