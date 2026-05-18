import axios from 'axios';
import {Equation, OdeRequest, OdeResult} from "../types";

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


export const odeApi = {
    getEquations: async (): Promise<Equation[]> => {
        const response = await api.get<Equation[]>('/ode/equations');
        return response.data;
    },
    solve: async (data: OdeRequest): Promise<   OdeResult[]> => {
        const response = await api.post<OdeResult[]>('/ode/solve', data);
        return response.data;
    }
};