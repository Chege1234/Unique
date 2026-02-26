import { supabase } from './supabaseClient';

// Helper to handle order by string like '-created_date'
const applyOrder = (query, orderBy) => {
    if (!orderBy) return query;
    const isDesc = orderBy.startsWith('-');
    const column = isDesc ? orderBy.substring(1) : orderBy;
    return query.order(column, { ascending: !isDesc });
};

export const base44 = {
    auth: {
        isAuthenticated: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return !!session;
        },
        redirectToLogin: (returnUrl) => {
            window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;
        },
        me: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Get user role/profile info from a profile table if needed
            // For now, mimicking structure
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            return profile || {
                id: user.id,
                email: user.email,
                role: 'user' // default role
            };
        },
        logout: async () => {
            await supabase.auth.signOut();
        }
    },
    entities: {
        Department: {
            list: async (orderBy) => {
                const { data, error } = await applyOrder(supabase.from('departments').select('*'), orderBy);
                if (error) console.error(error);
                return data || [];
            },
            filter: async (filters, orderBy) => {
                let query = supabase.from('departments').select('*');
                for (const [key, value] of Object.entries(filters)) {
                    query = query.eq(key, value);
                }
                const { data, error } = await applyOrder(query, orderBy);
                if (error) console.error(error);
                return data || [];
            }
        },
        QueueTicket: {
            list: async (orderBy) => {
                const { data, error } = await applyOrder(supabase.from('queue_tickets').select('*'), orderBy);
                if (error) console.error(error);
                return data || [];
            },
            filter: async (filters, orderBy) => {
                let query = supabase.from('queue_tickets').select('*');
                for (const [key, value] of Object.entries(filters)) {
                    query = query.eq(key, value);
                }
                const { data, error } = await applyOrder(query, orderBy);
                if (error) console.error(error);
                return data || [];
            },
            create: async (payload) => {
                const { data, error } = await supabase.from('queue_tickets').insert([payload]).select().single();
                if (error) throw error;
                return data;
            },
            update: async (id, payload) => {
                const { data, error } = await supabase.from('queue_tickets').update(payload).eq('id', id).select().single();
                if (error) throw error;
                return data;
            }
        },
        User: {
            list: async (orderBy) => {
                const { data, error } = await applyOrder(supabase.from('users').select('*'), orderBy);
                if (error) console.error(error);
                return data || [];
            }
        },
        StaffRequest: {
            list: async (orderBy) => {
                const { data, error } = await applyOrder(supabase.from('staff_requests').select('*'), orderBy);
                if (error) console.error(error);
                return data || [];
            },
            create: async (payload) => {
                const { data, error } = await supabase.from('staff_requests').insert([payload]).select().single();
                if (error) throw error;
                return data;
            },
            update: async (id, payload) => {
                const { data, error } = await supabase.from('staff_requests').update(payload).eq('id', id).select().single();
                if (error) throw error;
                return data;
            }
        }
    }
};
