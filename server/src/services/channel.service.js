import bot from "../bot/bot.js";
import Channel from "../models/Channel.js"
import { formatDate } from "../utils/date.js";

export default {
    getAll: async () => {
        const channels = await Channel.find();
        const data = [];
        for (const c of channels) {
            data.push({
                _id: c._id,
                id: c.id,
                name: c.name,
                url: c.url,
                created: formatDate(c.created),
                target: c.target,
                result: await c.result()
            })
        }
        return data;
    },
    checkAdmin: async (chId, uId) => {
        const result = await bot.api.getChatMember(chId, uId);
        return result;
    },
    createInviteLink: async (chId) => {
        return bot.api.createChatInviteLink(chId);
    },
    getChannelInfo: async (chId) => {
        return bot.api.getChat(chId);
    },
    getOne: async (chId) => {
        const c = await Channel.findOne({ _id: chId });
        return {
            _id: c._id,
            id: c.id,
            name: c.name,
            url: c.url,
            created: formatDate(c.created),
            target: c.target,
            result: await c.result()
        }
    },
    delete: async (chId) => {
        return Channel.findByIdAndDelete(chId);
    },
}