import { API_BASE_URL } from '../config';
const SERVICE_URL = `${API_BASE_URL}/services`;
const GROUP_URL = `${API_BASE_URL}/service-groups`;

export const serviceApi = {
    getGroups: async () => {
        const response = await fetch(GROUP_URL);
        if (!response.ok) return [];
        return await response.json();
    },
    getServices: async () => {
        const response = await fetch(SERVICE_URL);
        if (!response.ok) return [];
        return await response.json();
    },
    addService: async (newService) => {
        const response = await fetch(SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newService),
        });
        if (!response.ok) throw new Error('Lỗi khi thêm dịch vụ');
        return await response.json();
    },
    deleteService: async (id) => {
        const response = await fetch(`${SERVICE_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Lỗi khi xóa dịch vụ');
        return true;
    },
};