import moment from 'moment-timezone';
import { InlineKeyboard } from 'grammy';

const sendBatchMessages = async (ctx, users) => {
    let success = 0;
    let fail = 0;
    const batchSize = 30; // ⚡️ Telegram limiti: 30 ta xabar/sekund
    const startTime = Date.now();
    const totalUsers = users.length;

    // 📌 Admin uchun statistikani yuborish
    const statsMessage = await ctx.reply(`
📊 <b>Yuborish statistikasi</b>
👥 Users: <b>${totalUsers}</b>
✅ Success: <b>${success}</b>
❌ Faileds: <b>${fail}</b>
⏳ Start time: <b>${moment(startTime).format('DD.MM.YYYY | HH:mm:ss')}</b>
🕰 Time left: <b>Hisoblanmoqda...</b>
    `, { parse_mode: "HTML" });

    let lastStatsUpdate = Date.now(); // ⏳ Oxirgi statistikani yangilash vaqti

    const updateStats = async () => {
        const now = Date.now();
        if (now - lastStatsUpdate < 1000) return; // 🔥 Faqat har 1 sekundda yangilaymiz

        lastStatsUpdate = now;
        const elapsed = Math.floor((now - startTime) / 1000);
        const avgTimePerUser = elapsed / (success + fail || 1);
        const remainingUsers = totalUsers - (success + fail);
        const timeLeft = remainingUsers * avgTimePerUser;

        const updatedStats = `
📊 <b>Yuborish statistikasi</b>
👥 Users: <b>${totalUsers}</b>
✅ Success: <b>${success}</b>
❌ Faileds: <b>${fail}</b>
⏳ Start time: <b>${moment(startTime).format('DD.MM.YYYY | HH:mm:ss')}</b>
🕰 Time left: <b>${new Date(timeLeft * 1000).toISOString().substr(11, 8)}</b>
        `;

        ctx.api.editMessageText(ctx.chat.id, statsMessage.message_id, updatedStats, { parse_mode: "HTML" })
            .catch(() => { });
    };

    let index = 0;

    const sendNextBatch = async () => {
        if (index >= users.length) {
            updateStats(); // 🔥 Yakuniy statistikani yangilash

            const finalStats = `
🏁 <b>Yuborish yakunlandi!</b>
👥 Users: <b>${totalUsers}</b>
✅ Success: <b>${success}</b>
❌ Faileds: <b>${fail}</b>
⏳ Start time: <b>${moment(startTime).format('DD.MM.YYYY | HH:mm:ss')}</b>
            `;

            ctx.api.editMessageText(ctx.chat.id, statsMessage.message_id, finalStats, { parse_mode: "HTML" })
                .catch(() => { });

            ctx.reply("Xabar yuborish yakunlandi!", {
                parse_mode: "HTML",
                reply_markup: new InlineKeyboard()
                    .text('Ortga', 'adminMain')
            }).catch(() => { });

            return;
        }

        const batch = users.slice(index, index + batchSize);
        index += batchSize;

        // 🔥 **Parallel yuborish** (30 ta xabar bir vaqtning o‘zida yuboriladi)
        await Promise.all(
            batch.map(async (u) => {
                if (!u?.isAdmin) {
                    try {
                        await ctx.copyMessage(u?.id, {
                            reply_markup: ctx.message?.reply_markup
                        });
                        success++;
                    } catch (error) {
                        fail++;
                    }
                }
            })
        );

        updateStats(); // 🔄 Statistikani yangilash

        setTimeout(sendNextBatch, 1000); // 🔥 Telegram limiti bo‘yicha 1 sekund kutamiz
    };

    sendNextBatch(); // 🔥 Xabar yuborishni boshlash
};

export default sendBatchMessages;
