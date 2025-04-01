import moment from "moment-timezone";
const TZ = 'Asia/Tashkent';

export const getNow = () => moment.tz(TZ).unix();

export const formatDate = (timestamp) => moment.unix(timestamp).tz(TZ).format('YYYY-MM-DD HH:mm:ss');
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60); // Faqat qoldiq soniyalarni olish

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};
