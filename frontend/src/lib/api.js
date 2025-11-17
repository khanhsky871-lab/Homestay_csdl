// src/lib/api.js
const API_BASE_URL = "http://localhost:8080/api";

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (e) {
         errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
       return await response.json();
    } else {
        return await response.text();
    }
  } catch (error) {
    console.error(`API call failed: ${options.method || 'GET'} ${url} - api.js:36`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export const api = {
  getShowtimeSeatInfo: (showtimeId) => fetchApi(`/booking/showtime/${showtimeId}/seats`),
  createBooking: (bookingData) => fetchApi('/booking', { method: 'POST', body: JSON.stringify(bookingData) }),

  getAllRooms: () => fetchApi('/admin/rooms'),
  getRoomById: (roomId) => fetchApi(`/admin/rooms/${roomId}`),
  createRoom: (roomData) => fetchApi('/admin/rooms', { method: 'POST', body: JSON.stringify(roomData) }),
  updateRoom: (roomId, roomData) => fetchApi(`/admin/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify(roomData) }),
  deleteRoom: (roomId) => fetchApi(`/admin/rooms/${roomId}`, { method: 'DELETE' }),
  getRoomLayout: (roomId) => fetchApi(`/admin/rooms/${roomId}/layout`),
  updateRoomLayout: (roomId, layoutData) => fetchApi(`/admin/rooms/${roomId}/layout`, { method: 'PUT', body: JSON.stringify(layoutData) }),

  getAllOrdersAdmin: () => fetchApi('/admin/orders'),
  getOrderDetailAdmin: (orderId) => fetchApi(`/admin/orders/${orderId}`),
  updateOrderStatusAdmin: (orderId, newStatus) => fetchApi(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ newStatus }) }),

  getAllTransactionsAdmin: () => fetchApi('/admin/transactions'),

  getUserBookings: () => fetchApi('/user/orders/my'),
  cancelBookingUser: (orderId) => fetchApi(`/user/orders/${orderId}/cancel`, { method: 'PUT' }),

  getAllMovies: () => { console.warn("API not implemented: getAllMovies - api.js:62"); return Promise.resolve([]); },
  getMovieById: (movieId) => { console.warn("API not implemented: getMovieById - api.js:63"); return Promise.resolve(null); },
  createMovie: (movieData) => { console.warn("API not implemented: createMovie - api.js:64"); return Promise.resolve(movieData); },
  updateMovie: (movieId, movieData) => { console.warn("API not implemented: updateMovie - api.js:65"); return Promise.resolve(movieData); },
  deleteMovie: (movieId) => { console.warn("API not implemented: deleteMovie - api.js:66"); return Promise.resolve(); },

  getShowtimesByMovie: (movieId) => { console.warn("API not implemented: getShowtimesByMovie - api.js:68"); return Promise.resolve([]); },
  getAllShowtimesAdmin: () => { console.warn("API not implemented: getAllShowtimesAdmin - api.js:69"); return Promise.resolve([]); },
   createShowtime: (showtimeData) => 
  fetchApi('/showtimes', { 
    method: 'POST', 
    body: JSON.stringify(showtimeData) 
  }),

   updateShowtime: (showtimeId, showtimeData) => { console.warn("API not implemented: updateShowtime - api.js:71"); return Promise.resolve(showtimeData); },
   deleteShowtime: (showtimeId) => { console.warn("API not implemented: deleteShowtime - api.js:72"); return Promise.resolve(); },

    getAllTicketsAdmin: () => { console.warn("API not implemented: getAllTicketsAdmin - api.js:74"); return Promise.resolve([]); },
    updateTicketStatusAdmin: (ticketId, status) => { console.warn("API not implemented: updateTicketStatusAdmin - api.js:75"); return Promise.resolve({id: ticketId, status}); },

    getAllStaffAdmin: () => { console.warn("API not implemented: getAllStaffAdmin - api.js:77"); return Promise.resolve([]); },
    createStaffAdmin: (staffData) => { console.warn("API not implemented: createStaffAdmin - api.js:78"); return Promise.resolve(staffData); },
    updateStaffAdmin: (staffId, staffData) => { console.warn("API not implemented: updateStaffAdmin - api.js:79"); return Promise.resolve(staffData); },
    deleteStaffAdmin: (staffId) => { console.warn("API not implemented: deleteStaffAdmin - api.js:80"); return Promise.resolve(); },

};