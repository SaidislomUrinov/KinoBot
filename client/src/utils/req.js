import axios from "axios"
export const API = 'https://kino-srv.saidnet.uz'
// export const API = 'http://localhost:5000'
export const getReq = (pref = '', query = {}, access = '') => {
    return axios.get(`${API}/api${pref}`, {
        params: query,
        headers: {
            'x-auth-token': `Bearer ${access}`,
        },
    });
};

export const postReq = (pref = '', data = {}, access = '') => {
    return axios.post(`${API}/api${pref}`, data, {
        headers: {
            'x-auth-token': `Bearer ${access}`,
        },
    });
}