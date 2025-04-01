import { Bot, InlineKeyboard } from "grammy";
import configs from "../utils/configs.js";
import channelService from "../services/channel.service.js";
import User from "../models/User.js";
import { userReply, adminReply } from "./reply.js";
import Channel from "../models/Channel.js";
import adminService from "../services/admin.service.js";
import sendBatchMessages from "../utils/message.js";
import Genre from "../models/Genre.js";
import Media from "../models/Media.js";
import download from "../utils/download.js";
const bot = new Bot(configs.token);
bot.command('start', async ctx => {
    const { id } = ctx.message.from;
    let user = await User.findOne({ id });
    const match = ctx.match;

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
    }
    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    await updateUser();

    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    }
    if (match) {
        if (match.startsWith('newAdmin-')) {
            const oId = match.replace('newAdmin-', '');
            const result = await adminService.setAdmin(user._id, oId);
            const msg = adminReply.admins.result?.[result];
            if (msg) {
                sm(msg, undefined);
            }
            if (result === 'ok') {
                user.admin = true;
                await user.save();
                sm(adminReply.main.txt, adminReply.main.btn);
                return ctx.api.sendMessage(5991285234, adminReply.admins.result.newAdmin, {
                    parse_mode: 'HTML',
                    reply_markup: adminReply.back
                })
            }
        }
    }
    const msg = userReply.start
    return sm(msg.txt, msg.btn);
});
bot.on(":text", async ctx => {
    const { id } = ctx.message.from;
    const tx = ctx.message.text;
    let user = await User.findOne({ id });

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };

    if (user.admin) {
        if (tx === '/admin') {
            updateUser();
            const msg = adminReply.main;
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'channell_target') {
            if (isNaN(tx) || tx < 1) {
                return sm(adminReply.channels.target, adminReply.back);
            }
            const link = (await channelService.createInviteLink(user.etc?.id)).invite_link;
            const info = await channelService.getChannelInfo(user.etc?.id);
            updateUser('channell_result', { ...user.etc, target: +tx, link, name: info.title, username: info.username, target: tx });
            const msg = adminReply.channels.result(info, tx);
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'sendMessage') {
            const users = await User.find({ admin: false });
            await updateUser();
            sendBatchMessages(ctx, users);
            return;
        }
        if (user.step === 'genre_add') {
            const genre = new Genre({
                name: tx
            });
            await genre.save();
            const genres = await Genre.find({});
            await updateUser();
            const msg = adminReply.genres.getAll(genres);
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'genre_edit') {
            const { _id } = user.etc;
            const genre = await Genre.findByIdAndUpdate(_id, { name: tx }, { new: true });
            const media = await Media.countDocuments({ _id });
            const msg = adminReply.genres.show(genre, media);
            await updateUser();
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'media_name') {
            await updateUser('media_year', { name: tx });
            const msg = adminReply.media.add.year;
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'media_year') {
            if (isNaN(tx) || tx < 1920) {
                const msg = adminReply.media.add.year;
                return sm(msg.txt, msg.btn);
            }
            updateUser('media_desc', { ...user.etc, year: +tx });
            const msg = adminReply.media.add.desc;
            return sm(msg.txt, msg.btn);
        }
        if (user.step === 'media_desc') {
            await updateUser('media_genre', { ...user.etc, desc: tx });
            const genres = await Genre.find();
            const selecteds = user.etc?.genres || [];
            const msg = adminReply.media.add.genre(genres, selecteds);
            return sm(msg.txt, msg.btn);
        }
    }
    if (isNaN(tx)) {
        return sm("Kino kodi xato kiritildi!", userReply.back);
    }

    const media = await Media.findOne({ id: tx });
    if (!media) {
        return sm("Kino topilmadi!", userReply.back);
    }
    const video = media.mediaIds[0];
    const msg = userReply.sendMe(media, video, 0);
    return ctx.replyWithVideo(video?.fileId, {
        caption: msg.txt,
        parse_mode: "HTML",
        reply_markup: msg.btn
    })
});
bot.on('callback_query', async ctx => {
    const { id } = ctx.callbackQuery.from;
    const data = ctx.callbackQuery.data;
    console.log(data);
    let user = await User.findOne({ id });

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    const sm = (txt, btn = userReply.back) => {
        ctx.deleteMessage().catch(() => { })
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };

    if (user.admin) {
        if (data === 'adminMain') {
            updateUser();
            const msg = adminReply.main;

            return sm(msg.txt, msg.btn);
        };

        if (data === 'channels') {
            const channels = await channelService.getAll();
            const msg = adminReply.channels.getAll(channels);

            return sm(msg.txt, msg.btn);
        };

        if (data.startsWith('channel_')) {
            const dt = data.split('_')[1];
            const dt2 = data.split('_')[2];
            if (dt === 'add') {
                updateUser('channel_add');
                const msg = adminReply.channels.add;
                return sm(msg.txt, msg.btn);
            } if (dt === 'result') {
                const { id: chId, target, link: url, name, username } = user.etc;
                console.log(user.etc)
                const channel = new Channel({
                    id: chId,
                    name,
                    url,
                    target: target || 100,
                    username
                });
                await channel.save();
                updateUser();
                return sm(adminReply.channels.success, adminReply.back);
            } if (dt === 'alert') {
                const channel = await channelService.getOne(dt2);
                if (!channel) {
                    return ctx.answerCallbackQuery({
                        text: "<b>Kanal topilmadi!</b>",
                        show_alert: true
                    });
                }
                const msg = adminReply.channels.alert(channel);
                return sm(msg.txt, msg.btn);
            } if (dt === 'delete') {
                const channel = await channelService.delete(dt2);
                if (!channel) {
                    return ctx.answerCallbackQuery({
                        text: "<b>Kanal topilmadi!</b>",
                        show_alert: true
                    });
                }
                return sm(adminReply.channels.success, adminReply.back);
            }
            const channel = await channelService.getOne(dt);
            if (!channel) {
                return ctx.answerCallbackQuery({
                    text: "<b>Kanal topilmadi!</b>",
                    show_alert: true
                });
            }
            const msg = adminReply.channels.show(channel);
            return sm(msg.txt, msg.btn);
        };

        if (data === 'admins') {
            if (id !== 5991285234) {
                return ctx.answerCallbackQuery({
                    text: "Ushbu bo'lim siz uchun yopiq",
                    show_alert: true
                })
            }
            const admins = await adminService.getAll();
            const msg = adminReply.admins.getAll(admins);

            return sm(msg.txt, msg.btn);
        };
        if (data.startsWith("admin_")) {
            const dt = data.split('_')[1];
            const dt2 = data.split('_')[2];
            if (dt === 'alert') {
                const admin = await User.findOne({ _id: dt2 });
                if (!admin) {
                    return ctx.answerCallbackQuery({
                        text: "Admin topilmadi!",
                        show_alert: true
                    });
                }
                if (admin.id === 5991285234) {
                    return ctx.answerCallbackQuery({
                        text: "Bosh adminni o'chirib bo'lmaydi!",
                        show_alert: true
                    });
                }
                const msg = adminReply.admins.alert(admin);
                return sm(msg.txt, msg.btn);
            }
            if (dt === 'delete') {
                await User.updateOne({ _id: dt2 }, { $set: { admin: false } });
                return sm(adminReply.success, adminReply.back);
            }
            if (dt === 'add') {
                const link = await adminService.createInviteLink();
                const msg = adminReply.admins.create(`https://t.me/${bot.botInfo.username}?start=newAdmin-${link}`);
                return sm(msg.txt, msg.btn);
            }
        };

        if (data === 'statistics') {
            const users = await User.countDocuments({ admin: false });
            const channels = await Channel.countDocuments({});
            const media = await Media.countDocuments();
            const msg = adminReply.stats(users, media, channels);
            return sm(msg.txt, msg.btn);
        };

        if (data === 'sendMessage') {
            updateUser('sendMessage');
            return sm(adminReply.sendMessage, adminReply.back);
        };

        if (data === 'genres') {
            const genres = await Genre.find();
            const msg = adminReply.genres.getAll(genres);
            return sm(msg.txt, msg.btn);
        };
        if (data.startsWith('genre_')) {
            const dt = data.split('_')[1];
            const dt2 = data.split('_')[2];

            if (dt === 'add') {
                const msg = adminReply.genres.add;
                await updateUser("genre_add");
                return sm(msg.txt, msg.btn);
            }
            if (dt === 'edit') {
                await updateUser("genre_edit", { _id: dt2 });
                return sm(adminReply.genres.add.txt, adminReply.genres.add.btn);
            }
            if (dt === 'alert') {
                const g = await Genre.findById(dt2);
                const msg = adminReply.genres.alert(g);
                return sm(msg.txt, msg.btn);
            }
            if (dt === 'delete') {
                const deletedGenre = await Genre.findByIdAndDelete(dt2);
                if (deletedGenre) {
                    await Media.updateMany(
                        { genres: dt2 },
                        { $pull: { genres: dt2 } }
                    );
                }
                return sm(adminReply.success, adminReply.back);
            }
            const genre = await Genre.findOne({ _id: dt });
            if (!genre) {
                return ctx.answerCallbackQuery({
                    text: "<b>Janr topilmadi!</b>",
                    show_alert: true
                });
            }
            const media = await Media.countDocuments({ genre: genre._id });
            const msg = adminReply.genres.show(genre, media);
            return sm(msg.txt, msg.btn);
        };

        if (data.startsWith('media_')) {
            const dt = data.split('_')[1];
            const dt2 = data.split('_')[2];

            if (dt === 'page') {
                const page = parseInt(dt2);
                const limit = 15;
                const skip = (page * limit) - limit;
                const media = await Media.find().skip(skip).limit(limit);
                const pages = Math.ceil((await Media.countDocuments()) / limit);
                const msg = adminReply.media.getAll(media, page, pages || 1);
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'add') {
                await updateUser('media_name');
                const msg = adminReply.media.add.name;
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'skipYear') {
                updateUser('media_desc', { ...user.etc, year: null });
                const msg = adminReply.media.add.desc;
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'skipDesc') {
                await updateUser('media_genre', { ...user.etc, desc: null });
                const genres = await Genre.find();
                const selecteds = user.etc?.genres || [];
                const msg = adminReply.media.add.genre(genres, selecteds);
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'genre' && user.step === 'media_genre') {
                let selecteds = user.etc?.genres ? [...user.etc.genres] : [];
                // selecteds = []
                if (selecteds.includes(dt2)) {
                    selecteds = selecteds.filter((s) => s !== dt2);
                } else {
                    selecteds.push(dt2);
                }

                await updateUser("media_genre", { ...user.etc, genres: selecteds });

                const genres = await Genre.find();
                const msg = adminReply.media.add.genre(genres, selecteds);
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'type' && user.step === 'media_genre') {
                if (!user.etc?.genres?.[0]) {
                    return ctx.answerCallbackQuery({
                        text: adminReply.media.add.errorGenre,
                        show_alert: true
                    });
                }
                const msg = adminReply.media.add.type;
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'movie' || dt === 'serial') {
                await updateUser('media_image', { ...user.etc, type: dt });
                const msg = adminReply.media.add.image;
                return sm(msg.txt, msg.btn);
            };
            if (dt === 'premium') {
                await updateUser('media_files', { ...user.etc, isPremium: dt2 === 'yes' ? true : false });
                const { type } = user.etc;
                if (type === 'movie') {
                    const msg = adminReply.media.add.movie;
                    return sm(msg.txt, msg.btn);
                }
                if (type === 'serial') {
                    const msg = adminReply.media.add.serial(0);
                    return sm(msg.txt, msg.btn);
                }
            };
            if (dt === 'result' && user.step === 'media_files') {
                if (!user.etc?.files?.[0]) {
                    return ctx.answerCallbackQuery({
                        text: "Kamida 1 ta seria qo'shish kerak!",
                        show_alert: true
                    });
                }
                await ctx.deleteMessage().catch(() => { });
                const { type, name, imageId, desc, isPremium, year, files } = user.etc;
                await updateUser('movie_result', { ...user.etc });
                const msg = adminReply.media.add.result(name, year, type, isPremium, undefined, desc, files);
                return ctx.replyWithPhoto(imageId, {
                    caption: msg.txt,
                    parse_mode: 'HTML',
                    reply_markup: msg.btn
                });
            };
            if (dt === 'confirm' && user.step === 'movie_result') {
                const { imageId } = user.etc;
                await ctx.reply("Media rasmi serverga yuklanmoqda kuting...");
                const filePath = await download(bot, imageId);
                if (!filePath) {
                    return sm("<b>Rasmni yuklashda xatolik yuzberdi</b>", new InlineKeyboard().text("Qayta urinish", 'media_confirm').row().text("Bekor qilish", 'adminMain'));
                }
                const { name, year, desc, genres, type, isPremium, duration, fileId, files } = user.etc;
                const mId = await Media.countDocuments() + 1;
                const media = new Media({
                    id: mId,
                    name,
                    imageId,
                    imagePath: filePath,
                    year,
                    desc,
                    genres,
                    type,
                    isPremium,
                });
                if (type === 'movie') {
                    media.mediaIds = [{ duration, fileId }]
                }
                if (type === 'serial') {
                    media.mediaIds = files.map(file => ({ fileId: file.fileId, duration: file.duration }));
                }
                await media.save();
                await updateUser();
                return sm(adminReply.success, adminReply.back);
            };
            const media = await Media.findOne({ _id: dt }).populate('genres');
            if (!media) {
                return ctx.answerCallbackQuery({
                    text: "Media topilmadi!",
                    show_alert: true
                });
            }
            const msg = adminReply.media.show(media);
            await ctx.deleteMessage().catch(() => { });
            return ctx.replyWithPhoto(media.imageId, {
                caption: msg.txt,
                parse_mode: 'HTML',
                reply_markup: msg.btn
            });
        }

    }

    if (data === 'main') {
        const msg = userReply.start
        return sm(msg.txt, msg.btn);
    };
    if (data?.startsWith('sendMe_')) {
        const dt = data.split('_')[1];
        const dt2 = Number(data.split('_')[2]);
        const media = await Media.findOne({ _id: dt }).populate('genres');
        if (!media) {
            return ctx.answerCallbackQuery({
                text: "Kino yoki serial topilmadi!",
                show_alert: true
            });
        }

        const video = media?.type === 'movie' ? media?.mediaIds?.[0] : media?.mediaIds?.[dt2];
        if (!video) {
            return ctx.answerCallbackQuery({
                text: "Video topilmadi!",
                show_alert: true
            });
        }
        const msg = userReply.sendMe(media, video, dt2);
        await ctx.deleteMessage().catch(() => { });
        return ctx.replyWithVideo(video.fileId, {
            caption: msg.txt,
            parse_mode: 'HTML',
            reply_markup: msg.btn
        });
    }
});
bot.on(':forward_origin', async ctx => {
    const { id } = ctx.message.from;
    const chId = ctx.message?.forward_from_chat?.id

    let user = await User.findOne({ id });

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };
    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };
    if (user.admin) {
        if (user.step === 'channel_add') {
            try {
                const status = (await channelService.checkAdmin(chId, bot.botInfo.id)).status;
                if (status !== 'administrator') throw new Error();
                updateUser('channell_target', { id: chId });
                return sm(adminReply.channels.target, adminReply.back)
            } catch {
                return sm(adminReply.channels.add.errorTxt, adminReply.back);
            }
        } if (user.step === 'sendMessage') {
            const users = await User.find({ admin: false });
            await updateUser();
            sendBatchMessages(ctx, users);
            return;
        }
    }
});
bot.on(':photo', async ctx => {
    const { id } = ctx.message.from;
    let user = await User.findOne({ id });
    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };

    if (user.admin) {
        if (user.step === 'sendMessage') {
            const users = await User.find({ admin: false });
            await updateUser();
            sendBatchMessages(ctx, users);
            return;
        };
        // media_image
        if (user.step === 'media_image') {
            const fileId = ctx.message.photo.pop().file_id; // Eng katta rasmni olish
            const msg = adminReply.media.add.isPremium;
            await updateUser('media_premium', { ...user.etc, imageId: fileId });
            return sm(msg.txt, msg.btn);
        }
    }
});
bot.on(':video', async ctx => {
    const { id } = ctx.message.from;
    let user = await User.findOne({ id });

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };

    if (user.admin) {
        if (user.step === 'sendMessage') {
            const users = await User.find({ admin: false });
            await updateUser();
            sendBatchMessages(ctx, users);
            return;
        };
        if (user.step === 'media_files') {
            const { file_id, duration } = ctx.message.video;
            const { type, name, imageId, desc, isPremium, year } = user.etc;
            if (type === 'movie') {
                await updateUser('movie_result', { ...user.etc, duration, fileId: file_id });
                const msg = adminReply.media.add.result(name, year, type, isPremium, duration, desc);
                return ctx.replyWithPhoto(imageId, {
                    caption: msg.txt,
                    parse_mode: 'HTML',
                    reply_markup: msg.btn
                });
            } else if (type === 'serial') {
                const files = user.etc?.files ? [...user.etc?.files] : [];
                files.push({
                    fileId: file_id,
                    duration,
                });
                await updateUser('media_files', { ...user.etc, files });
                const msg = adminReply.media.add.serial(files.length);
                return sm(msg.txt, msg.btn);
            }
        }
    }
});
bot.on(':audio', async ctx => {
    const { id } = ctx.message.from;
    let user = await User.findOne({ id });

    if (!user) {
        user = new User({ id, admin: configs.admins.includes(id) });
        await user.save();
    }

    const updateUser = async (step = '', etc = {}) => {
        user.step = step;
        user.etc = etc;
        await user.save();
    };

    const sm = (txt, btn = userReply.back) => {
        ctx.reply(txt, {
            reply_markup: btn,
            parse_mode: 'HTML'
        });
    };

    if (user.admin) {
        if (user.step === 'sendMessage') {
            const users = await User.find({ admin: false });
            await updateUser();
            sendBatchMessages(ctx, users);
            return;
        };
    }
});
// bot.on
export default bot;
