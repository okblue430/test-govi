import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL

const api = {
    /**
     * @param filter: 'paid' | 'unpaid' | '_page'
     */
    getInvoices: async (params) => {
        const result = await axios.get(`${BASE_URL}/invoice`, {params})
        return result;
    },
    getPaginationInvoices: async (link, params) => {
        const result = await axios.get(link, {params})
        return result;
    },
}

export default api
