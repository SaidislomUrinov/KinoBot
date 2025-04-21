import bot from "../bot/bot.js";
import Channel from "../models/Channel.js"
import Join from "../models/Join.js";
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
            type: c?.type,
            result: await c.result()
        }
    },
    delete: async (chId) => {
        return Channel.findByIdAndDelete(chId);
    },
    checkMember: async (id) => {
        try {
            const channels = await Channel.find();
            // 
            let result = false;
            for (let c of channels) {
                if (c.type === 'request') {
                    const join = await Join.findOne({ user: id, channel: c?._id });
                    if (!join) {
                        result = false;
                        break
                    }
                }
            };

            return result
        } catch (error) {
            return false
        }
    }
}