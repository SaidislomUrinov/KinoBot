import Invite from "../models/Invite.js";
import User from "../models/User.js";

export default {
    getAll: async () => {
        const admins = await User.find({ admin: true }).select('id');
        return admins
    },
    createInviteLink: async () => {
        const inv = new Invite();
        await inv.save();
        return inv._id
    },
    setAdmin: async (uId, oId) => {
        const invite = await Invite.findOne({ _id: oId });
        if (!invite) {
            return 'notfound';
        } if (!invite.active) {
            return 'inactive';
        }
        invite.user = uId;
        invite.active = false;
        await invite.save();
        return 'ok';
    }
}