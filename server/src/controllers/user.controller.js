import { InlineKeyboard } from "grammy";
import bot from "../bot/bot.js";
import Genre from "../models/Genre.js";
import Media from "../models/Media.js";
import User from "../models/User.js";
import { formatDuration } from "../utils/date.js";
import { userReply } from "../bot/reply.js";

export default {
    signIn: async (req, res) => {
        try {
            const { id, first_name, photo_url } = req.body;
            const user = await User.findOne({ id });
            if (!user) return res.send({ ok: false, msg: "Telegram orqali kiring!" });

            const token = await user.signIn(first_name, photo_url);
            return res.send({ ok: true, token });

        } catch (error) {
            console.error(error);
            return res.send({
                ok: false,
                msg: error.message
            })
        }
    },
    getAllMedia: async (req, res) => {
        try {
            const { page = 1, genre, search } = req.query;

            let query = {};
            if (search) {
                query = { name: { $regex: search, $options: "i" } }; // Case-insensitive qidiruv
            } else if (genre) {
                query = { genres: genre };
            }
            const limit = 30;
            const skip = (page - 1) * limit;
            const totalMedia = await Media.countDocuments(query);
            const pages = Math.ceil(totalMedia / limit);
            const nextPage = page < pages ? page + 1 : null;

            const media = await Media.find(query)
                .sort({ created: -1 })
                .limit(limit)
                .skip(skip)
                .populate("genres");

            const data = media.map(m => ({
                _id: m._id,
                name: m.name,
                imagePath: m.imagePath,
                duration: formatDuration(m?.mediaIds?.[0]?.duration),
                year: m.year,
                type: m.type,
                genres: m.genres?.map(g => g.name).join(", ") || "",
                isPremium: m.isPremium,
                mediaIds: m.mediaIds?.map(med => ({
                    duration: formatDuration(med?.duration)
                })) || []
            }));

            return res.send({
                ok: true,
                data,
                nextPage,
            });
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                msg: error.message
            });
        }
    },
    getGenres: async (_, res) => {
        try {
            const genres = await Genre.find({}).select('name');
            return res.send({
                ok: true,
                genres
            })
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                msg: error.message
            })
        }
    },
    sendMe: async (req, res) => {
        try {
            const { _id, index } = req.body;
            const media = await Media.findOne({ _id }).populate('genres');

            const user = req.user;

            if (!media) throw new Error("Video topilmadi!");

            const video = media?.type === 'movie' ? media?.mediaIds?.[0] : media?.mediaIds?.[index];
            if (!video) throw new Error("Video topilmadi!");

            const ctx = userReply.sendMe(media, video, index);

            const msg = await bot.api.sendVideo(user.id, video?.fileId, {
                caption: ctx.txt,
                parse_mode: "HTML",
                reply_markup: ctx.btn
            });

            setTimeout(() => {
                bot.api.deleteMessage(user?.id, msg.message_id).then(() => {
                    bot.api.sendMessage(user?.id, `😁Xavfsizlik uchun <b>${media?.name}</b> chatdan o'chirildi!\n🟢Uni qayta ko'rish uchun pastdagi tugmani bosing`, {
                        parse_mode: "HTML",
                        reply_markup: new InlineKeyboard().text("🔄Qayta ko'rish", `sendMe_${media?._id}${media?.type === 'serial' ? `_${index}` : ''}`)
                    }).catch(() => { });
                }).catch(() => { });
            }, 1000 * 60 * 60 * 3);

            return res.send({
                ok: true,
                msg: "Video yuborildi!"
            })
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                msg: error.message
            })
        }
    }
}