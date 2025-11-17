// frontend/src/services/customerApi.js
const API_BASE_URL = 'http://localhost:8081/api/customers'; // Endpoint Spring Boot

export const customerApi = {
    // READ (GET)
    getCustomers: async () => {
        const response = await fetch(API_BASE_URL);
        return response.ok ? await response.json() : [];
    },
    // CREATE (POST)
    addCustomer: async (newCustomer) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCustomer),
        });
        return await response.json();
    },
    // DELETE (DELETE)
    deleteCustomer: async (id) => {
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        return true;
    },
    // [Cần thêm updateCustomer tương tự]
};