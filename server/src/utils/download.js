import fs from "fs";
import https from "https";
import sharp from "sharp";

/**
 * Telegram faylini yuklab olish va serverga saqlash (kichraytirilgan holatda).
 *
 * @param {object} bot - Grammy bot obyekti.
 * @param {string} fileId - Telegram fayl IDsi.
 * @param {string} savePath - Saqlash yo‘li (masalan: `uploads/`).
 * @param {number} maxWidth - Maksimal kenglik (default: 300px).
 * @returns {Promise<string>} - Yuklangan va optimallashtirilgan fayl yo‘li.
 */
export default async function (bot, fileId, savePath = "uploads/", maxWidth = 300) {
    try {
        // 1️⃣ Fayl ma'lumotlarini olish
        const file = await bot.api.getFile(fileId);
        const filePath = file.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${filePath}`;

        const fileExtension = filePath.split(".").pop();
        const originalFileName = `${savePath}${fileId}.${fileExtension}`;
        const optimizedFileName = `${savePath}${fileId}_small.webp`; // WEBP formatida saqlaymiz

        return new Promise((resolve, reject) => {
            https.get(fileUrl, (response) => {
                const fileStream = fs.createWriteStream(originalFileName);
                response.pipe(fileStream);

                fileStream.on("finish", async () => {
                    fileStream.close();

                    // 2️⃣ Rasmlarni kichraytirish (Sharp orqali)
                    try {
                        await sharp(originalFileName)
                            .resize({ width: maxWidth }) // Maksimal kenglik
                            .toFormat("webp") // Eng yaxshi siqilish uchun WEBP
                            .toFile(optimizedFileName);

                        // Eski (katta) faylni o‘chiramiz
                        fs.unlinkSync(originalFileName);

                        resolve(optimizedFileName);
                    } catch (resizeError) {
                        reject(resizeError);
                    }
                });
            }).on("error", (error) => {
                reject(error);
            });
        });

    } catch (error) {
        console.error("❌ Xatolik:", error);
        throw error;
    }
}
