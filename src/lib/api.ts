import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://codigo-facial-api.onrender.com',
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
