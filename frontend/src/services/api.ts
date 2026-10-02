import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/math';

export const odeApi = {
    getEquations: async () => {
        const response = await axios.get(`${API_BASE_URL}/ode/equations`);
        return response.data;
    },
    solve: async (params: any) => {
        const response = await axios.post(`${API_BASE_URL}/ode/solve`, params);
        return response.data;
    }
};

export const sweepApi = {
    solve: async (data: { a: number[]; c: number[]; b: number[]; f: number[] }): Promise<number[]> => {
        const response = await axios.post(`${API_BASE_URL}/sweep/solve`, data);
        return response.data;
    }
};