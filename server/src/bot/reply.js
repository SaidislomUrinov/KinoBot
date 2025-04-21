import { InlineKeyboard } from "grammy";
import { formatDate, formatDuration, getNow } from "../utils/date.js";
const br = `\n${'-'.repeat(40)}\n`
export const userReply = {
    start: {
        txt: "<b>👋Salom</b>\n📱Bot orqali sevimli <b>kino</b> va <b>seriallarni</b> topishingiz mumkin\n🔢Kino kodini yuboring yoki pastdagi <b>🎬Kinolar</b> tugmasini bosing!",
        btn: new InlineKeyboard()
            .webApp("🎬Kinolar", 'https://kino.saidnet.uz').row()
        // .url("📨Aloqa", 'https://t.me/saidweb')
        // .switchInlineCurrent("🔎Qidirish", "")
    },
    back: new InlineKeyboard().text("🔙Ortga", 'main'),
    sendMe: (media, video, index) => {
        let txt = `<b>${media?.name}</b>${media?.type === 'serial' ? `\n${(+index + 1)}-qism` : ''}\n⏳Davomiyligi: <code>${formatDuration(video?.duration)}</code>\n📋Janrlar: <code>${media?.genres?.map((g) => g?.name).join(", ")}</code>\n🗓️Chiqarilgan: <code>${media?.year}</code>\n--------------------------------\n<i>${media?.desc || ''}</i>`;
        const btn = [];
        let tempRow = [];
        if (media?.type === 'serial') {
            media.mediaIds?.forEach((m, i) => {
                tempRow.push({
                    text: `${i === index ? '▶️' : ''}${i + 1}`,
                    callback_data: `${i === index ? '---' : `sendMe_${media._id}_${i}`}`
                });
                if (tempRow.length === 5) {
                    btn.push(tempRow);
                    tempRow = [];
                }
            });
            if (tempRow.length > 0) {
                btn.push(tempRow);
            }
        }
        btn.push(
            [
                // {
                //     text: "🔗Ulashish",
                //     switch_inline_query: `${media?._id}`
                // },
                {
                    text: "🖼️Kino va serialar",
                    web_app: {
                        url: "https://kino.saidnet.uz"
                    }
                }
            ],
            [
                {
                    text: "🔙Ortga",
                    callback_data: "main"
                }
            ]
        );
        return {
            txt,
            btn: new InlineKeyboard(btn)
        };
    }
};

export const adminReply = {
    main: {
        txt: "<b>⭐Admin paneli</b>\n↓Kerakli bo'limni tanlang",
        btn: new InlineKeyboard()
            .text('📋Janrlar', 'genres').text("🖼️Kinolar", 'media_page_1').row()
            .text("📨Xabar yuborish", "sendMessage")
            .text("📊Statistika", 'statistics').row()
            .text("⭐Adminlar", "admins").text("🔗Majburiy obuna", "channels").row()
            .text("🔙Ortga", 'main')
    },
    back: new InlineKeyboard().text("🔙Ortga", "adminMain"),
    channels: {
        getAll: (channels) => {
            let txt = `<b>🔗Majburiy obunalar</b>${br}<i>🟠: Jarayonda\n🟢: Yakunlangan</i>${br}`;
            const btn = [];
            channels.forEach((c, i) => {
                txt += `${i + 1}. <code>${c.id}</code> - <b>${c.name}</b> - ${c.target > c.result ? '🟠' : '🟢'} - ${c.target} / ${c.result}\n`;
                btn.push([{
                    text: `${i + 1}. ${c.id} - ${c.name}`,
                    callback_data: `channel_${c._id}`
                }])
            });
            btn.push([
                {
                    text: "🔙Ortga",
                    callback_data: "adminMain"
                },
                {
                    text: "➕Qo'shish",
                    callback_data: "channel_add"
                }
            ]);
            return { txt, btn: new InlineKeyboard(btn) };
        },
        type: {
            txt: "<b>📋Kanal turini tanlang</b>",
            btn: new InlineKeyboard().text("Public", 'channel_type_public').text("Private", 'channel_type_private').text("Request", 'channel_type_request').row()
                .text("🔙Bosh sahifa", "adminMain").text("🔗Majburiy obunalar", "channels")
        },
        add: {
            txt: `<b>🔗Majburiy obuna uchun kanal qo'shish</b>${br}<i>🤖Botni kanalga admin qiling so'ng kanaldan istalgan postni botga <b>forward</b> qiling</i>`,
            btn: new InlineKeyboard().text("🔙Bosh sahifa", "adminMain").text("🔗Majburiy obunalar", "channels"),
            errorTxt: "<b>🤖Bot kanalga admin qilinmagan</b>"
        },
        target: "<b>👥Obunachilar sonini kiriting</b>\n📋Namuna: <code>1000</code>",
        result: (info, target) => {
            const txt = `<b>📨Tekshiring</b>${br}Nomi: <code>${info.title}</code>\nUsername: <code>${info.username || 'Yashirin'}</code>\nID: <code>${info.id}</code>\nMo'ljal: <code>${target}</code>\nTuri: <code>${info?.type}</code>${br}<i>🟢Barchasi to'g'ri bo'lsa <b>✅Tasdiqlash</b> tugmasini bosing!</i>`;
            const btn = new InlineKeyboard().text("✅Tasdiqlash", `channel_result`).row()
                .text("🔙Bosh sahifa", "adminMain").text("🔗Majburiy obunalar", "channels");
            return { txt, btn };
        },
        success: "<b>✅Bajarildi!</b>",
        show: (c) => {
            let txt = `<b>🔗Majburiy obuna</b>${br}ID: <code>${c.id}</code>\n📨Nomi: <code>${c.name}</code>\n🔗URL: <code>${c.username ? `@${c?.username}` : c.url}</code>\n👥Mo'ljal: <code>${c.result} / ${c.target}</code>\n🟢Turi: <code>${c?.type}</code>\n🗓️Qo'shilgan: <code>${c.created}</code>`;

            const btn = new InlineKeyboard()
                .text("🗑O'chirish", `channel_alert_${c._id}`).row()
                .text("🔙Bosh sahifa", "adminMain").text("🔗Majburiy obunalar", "channels");
            return { txt, btn };
        },
        alert: (ch) => {
            const txt = `⚠️Diqqat <b>${ch.name}</b> o'chirib tashlansinmi?`
            const btn = new InlineKeyboard().text("🔙Yo'q", `channel_${ch._id}`).text("🗑O'chirilsin", 'channel_delete_' + ch._id);
            return { txt, btn };
        }
    },
    success: "<b>✅Bajarildi!</b>",
    admins: {
        getAll: (admins) => {
            let txt = `<b>⭐Adminlar</b>${br}`;
            const btn = [];
            admins.forEach((a) => {
                txt += `1 - ID: <code>${a.id}</code>\n`;
                btn.push([
                    {
                        text: `ID: ${a.id}`,
                        callback_data: `---`
                    },
                    {
                        text: "🗑O'chirish",
                        callback_data: `admin_alert_${a._id}`
                    }
                ])
            });
            btn.push([
                {
                    text: "🔙Ortga",
                    callback_data: "adminMain"
                },
                {
                    text: "➕Qo'shish",
                    callback_data: "admin_add"
                }
            ])
            return { txt, btn: new InlineKeyboard(btn) };
        },
        alert: (a) => {
            const txt = `⚠️Diqqat <b>${a.id}</b> adminlikdan olinsinmi?`
            const btn = new InlineKeyboard().text("🔙Yo'q", `admins`).text("🗑Adminlikdan olish", 'admin_delete_' + a._id);
            return { txt, btn };
        },
        create: (link) => {
            const txt = `<b>⭐Admin qo'shish uchun URL manzili:</b>${br}<code>${link}</code>${br}<i>⚠️Diqqat ushbu URL manzilini admin qilmoqchi bo'lgan odamingizga yuboring</i>`;
            const btn = new InlineKeyboard().text("🔙Ortga", "adminMain").text("⭐Adminlar", "admins");
            return { txt, btn };
        },
        result: {
            notfound: "<b>🟠Ma'lumot topilmadi!</b>",
            inactive: "<b>🟠Ushbu URL bo'yicha allaqachon admin tayinlangan!</b>",
            ok: '<b>⭐Admin etib tayinlandingiz!</b>',
            newAdmin: "<b>⭐Yangi admin tayinlandi!</b>"
        }
    },
    stats: (users = 0, media = 0, channels = 0) => {
        return {
            txt: `<b>📊Statistika</b>${br}👥Foydalanuvchilar: <code>${users}</code>\n🖼️Kino va seriallar: <code>${media}</code>\n🔗Majburiy obunalar: <code>${channels}</code>${br}<code>${formatDate(getNow())}</code>`,
            btn: new InlineKeyboard().text('🔄Yangilash', 'statistics').row().text("🔙Ortga", "adminMain")
        };
    },
    sendMessage: `📨Xabar yuborish uchun <b>Text, Rasm, Video</b> yoki <b>Audio</b> yuboring!${br}<i><b>🟠DIQQAT AGARDA XABAR YUBORISHNI ISTAMASANGIZ PASTDAGI TUGMANI BOSING!!!!</b></i>`,
    genres: {
        getAll: (genres = []) => {
            let txt = `<b>📋Janrlar</b>${br}`;
            const btn = [];
            let tempRow = [];

            genres.forEach((g, i) => {
                txt += `${i + 1}. <b>${g.name}</b>\n`;

                tempRow.push({
                    text: `${i + 1}. ${g.name}`,
                    callback_data: `genre_${g._id}`
                });

                if (tempRow.length === 2) {
                    btn.push(tempRow);
                    tempRow = [];
                }
            });

            if (tempRow.length > 0) {
                btn.push(tempRow);
            }

            btn.push([
                {
                    text: "🔙Bosh sahifa",
                    callback_data: "adminMain"
                },
                {
                    text: "➕Qo'shish",
                    callback_data: "genre_add"
                }
            ]);
            return { txt, btn: new InlineKeyboard(btn) };
        },
        add: {
            txt: "<b>🟢Janr nomini kiriting</b>\n<i>📋Namuna: Komedia, Jangari, ...</i>",
            btn: new InlineKeyboard().text("🔙Bosh sahifa", "adminMain").text("📋Janrlar", "genres"),
        },
        show: (g, media) => {
            const txt = `📋Janr: <b>${g.name}</b>${br}\n🖼️Kino va seriallar: <code>${media}</code>`;
            const btn = new InlineKeyboard()
                .text("✏️Taxrirlash", `genre_edit_${g._id}`).text("🗑O'chirish", `genre_alert_${g._id}`).row()
                .text("🔙Bosh sahifa", "adminMain").text("📋Janrlar", "genres");
            return { txt, btn };
        },
        alert: (g) => {
            const txt = `⚠️Diqqat <b>${g.name}</b> janri o'chirib tashlansinmi?${br}<i>Barcha biriktirilgan kino va seriallardan olib tashlanadi!</i>`
            const btn = new InlineKeyboard().text("🔙Yo'q", `genre_${g._id}`).text("🗑O'chirilsin", 'genre_delete_' + g._id);
            return { txt, btn };
        }
    },
    media: {
        getAll: (media = [], page = 1, pages = 1) => {
            let txt = `<b>🖼️Kino va seriallar: ${media.length}</b>${br}📋Sahifa: ${page} / ${pages}${br}`;
            const btn = [];
            let tempRow = [];
            media.forEach((m, i) => {
                txt += `${i + 1}. <b>${m.name}</b>\n`;

                tempRow.push({
                    text: `${i + 1}. ${m.name}`,
                    callback_data: `media_${m._id}`
                });
                if (tempRow.length === 2) {
                    btn.push(tempRow);
                    tempRow = [];
                }
            });
            if (tempRow.length > 0) {
                btn.push(tempRow);
            }
            btn.push(
                [
                    {
                        text: page > 1 ? `⬅️` : '🚫',
                        callback_data: page > 1 ? `media_page_${page - 1}` : `--`
                    },
                    {
                        text: page,
                        callback_data: '-',
                    },
                    {
                        text: page < pages ? `➡️` : '🚫',
                        callback_data: page < pages ? `media_page_${page + 1}` : `--`
                    }
                ],
                [
                    {
                        text: "🔎Qidirish",
                        callback_data: "media_search"
                    },
                    {
                        text: "➕Qo'shish",
                        callback_data: "media_add"
                    },
                ],
                [
                    {
                        text: "🔙Bosh sahifa",
                        callback_data: "adminMain"
                    }
                ]
            );
            return { txt, btn: new InlineKeyboard(btn) };
        },
        add: {
            name: {
                txt: "<b>🖼️Kino, serial nomini kiriting</b>\n<i>📋Namuna: Qasoskorlar, Adolat ligasi, ...</i>",
                btn: new InlineKeyboard().text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1"),
            },
            year: {
                txt: "<b>🗓️Chiqarilgan yilini yuboring</b>\n<i>📋Namuna: 2012, 2023, 2024, ...</i>",
                btn: new InlineKeyboard().text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1").row()
                    .text("⏭️Tashlab ketish", "media_skipYear"),
            },
            desc: {
                txt: "<b>📋Kino haqida batafsil ma'lumotni yuboring!</b>",
                btn: new InlineKeyboard().text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1").row()
                    .text("⏭️Tashlab ketish", "media_skipDesc"),
            },
            genre: (genres = [], selecteds = []) => {
                let txt = `<b>📋Janrlarni tanlang</b>${br}`;
                const btn = [];
                let tempRow = [];

                genres.forEach((g, i) => {
                    txt += `${i + 1}. <b>${g.name}</b> ${selecteds.includes(g?._id?.toString()) ? "🟢" : ""} \n`;

                    tempRow.push({
                        text: `${i + 1}. ${g.name} ${selecteds.includes(g?._id?.toString()) ? "🟢" : ""}`,
                        callback_data: `media_genre_${g._id}`
                    });

                    if (tempRow.length === 2) {
                        btn.push(tempRow);
                        tempRow = [];
                    }
                });

                if (tempRow.length > 0) {
                    btn.push(tempRow);
                }

                btn.push([
                    {
                        text: "🔙Bekor qilish",
                        callback_data: "adminMain"
                    },
                    {
                        text: "⏭️Keyingi",
                        callback_data: "media_type"
                    }
                ]);
                return { txt, btn: new InlineKeyboard(btn) };
            },
            errorGenre: "🟠Kamida 1 ta janr tanlang!",
            type: {
                txt: "<b>🖼️Kino yoki serial tanlang!</b>",
                btn: new InlineKeyboard()
                    .text("Kino", 'media_movie').text("Serial", "media_serial").row()
                    .text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1")
            },
            image: {
                txt: "<b>🖼️Rasmini yuboring</b>\n<code>2x1 formatida</code>",
                btn: new InlineKeyboard().text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1")
            },
            isPremium: {
                txt: "<b>⭐Premiummi?</b>",
                btn: new InlineKeyboard()
                    .text("Xa", "media_premium_yes").text("Yo'q", "media_premium_nos").row()
                    .text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1")
            },
            movie: {
                txt: "<b>🖼️Kinoni yuboring</b>",
                btn: new InlineKeyboard().text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1")
            },
            serial: (series = 0) => {
                return {
                    txt: `<b>🖼️${series + 1} - seriani yuboring</b>`,
                    btn: new InlineKeyboard()
                        .text("⏭️Yakunlash", "media_result").row()
                        .text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1")
                }
            },
            result: (name = '', year = '', type = '', isPremium = false, duration = 0, desc = '', files = []) => {
                let txt = `<b>🖼️Tekshiring</b>${br}Nomi: <b>${name}</b>\nChiqarilgan yili: <code>${year}</code>\nTuri: <code>${type === 'movie' ? 'Kino' : "Serial"}</code>\nPremium: <code>${isPremium ? "Xa" : "Yo'q"}</code>`;
                if (type === 'movie') {
                    txt += `\nDavomiyligi: <code>${formatDuration(duration)}</code>`
                } else {
                    txt += `\nDavomiyligi:\n`;
                    files.forEach((f, i) => {
                        txt += `${i + 1}. <code>${formatDuration(f.duration)}</code>\n`;
                    });
                }
                txt += `${desc ? `${br}<i>${desc}</i>` : ''}${br}<i>Barchasi to'g'ri bo'lsa <b>✅Yakunlash</b> tugmasini bosing</i>`;
                const btn = new InlineKeyboard().text("✅Yakunlash", "media_confirm").row()
                    .text("🔙Bekor qilish", "adminMain").text("🖼️Kino va seriallar", "media_page_1");
                return { txt, btn };
            },
        },
        show: (media) => {
            let txt = `${media.type === 'movie' ? '🎥Kino' : '📹Serial'}: <b>${media?.name}</b>\n📋Janrlar: `;
            const btn = new InlineKeyboard()
                .text("✏️Nomi", `media_editname_${media?._id}`).text("🖼️Rasmi", `media_editimage_${media?._id}`).row()
                .text("📋Janrlar", `media_editgenres_${media?._id}`).text("⌨️Batafsilni", `media_editdesc_${media?._id}`).row()
                .text("⭐Premium", `media_editpremium_${media?._id}`)
            media.genres.forEach(g => {
                txt += `<code>${g?.name}</code>, `
            });
            txt = txt.slice(0, -2);
            txt += `\n🗓️Chiqarilgan yili: <code>${media?.year}</code>\n`;
            txt += `⭐Premium: <code>${media?.isPremium ? "Xa" : "Yo'q"}</code>\n`;
            if (media?.type === "movie") {
                btn.text("🔁Kinoni yangilash", `media_editmedia_${media?._id}`).row();
                txt += `⏳Davomiyligi: <code>${formatDuration(media?.mediaIds?.[0]?.duration)}</code>\n`;
            }
            else if (media?.type === "serial") {
                btn.text("🔢Qismlar", `media_serials_${media?._id}`).row();
                txt += `⏳Davomiyligi:\n`;
                media.mediaIds.forEach((f, i) => {
                    txt += `${i + 1} - <code>${formatDuration(f.duration)}</code>\n`;
                });
            }
            btn.text("🗑O'chirib tashlash", `media_alert_${media?._id}`).row()
                .text("🔙Ortga", "media_page_1")
            txt += `➕Qo'shilgan sanasi: <code>${formatDate(media?.created)}</code>${br}<i>${media?.desc || ''}</i>`;
            return { txt, btn };
        }
    }
}