// // services/ordersService.js
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// class OrdersService {
//     constructor() {
//         this.baseURL = `${API_BASE_URL}/api/orders`;
//     }

//     // Get auth headers
//     getAuthHeaders() {
//         const token = localStorage.getItem('token');
//         return {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//         };
//     }

//     // Handle API response
//     async handleResponse(response) {
//         const data = await response.json();
        
//         if (!response.ok) {
//             throw new Error(data.message || 'Something went wrong');
//         }
        
//         return data;
//     }

//     // Get all orders with filters and pagination
//     async getAllOrders(params = {}) {
//         try {
//             const searchParams = new URLSearchParams();
            
//             // Add pagination params
//             if (params.page) searchParams.append('page', params.page);
//             if (params.limit) searchParams.append('limit', params.limit);
            
//             // Add filter params
//             if (params.orderStatus) searchParams.append('orderStatus', params.orderStatus);
//             if (params.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus);
//             if (params.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
//             if (params.startDate) searchParams.append('startDate', params.startDate);
//             if (params.endDate) searchParams.append('endDate', params.endDate);

//             const url = `${this.baseURL}?${searchParams.toString()}`;
            
//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: this.getAuthHeaders()
//             });

//             return this.handleResponse(response);
//         } catch (error) {
//             console.error('Get all orders error:', error);
//             throw error;
//         }
//     }

//     // Get order by ID
//     async getOrderById(orderId) {
//         try {
//             const response = await fetch(`${this.baseURL}/${orderId}`, {
//                 method: 'GET',
//                 headers: this.getAuthHeaders()
//             });

//             return this.handleResponse(response);
//         } catch (error) {
//             console.error('Get order by ID error:', error);
//             throw error;
//         }
//     }

//     // Update order status
//     async updateOrderStatus(orderId, statusData) {
//         try {
//             const response = await fetch(`${this.baseURL}/${orderId}/status`, {
//                 method: 'PATCH',
//                 headers: this.getAuthHeaders(),
//                 body: JSON.stringify(statusData)
//             });

//             return this.handleResponse(response);
//         } catch (error) {
//             console.error('Update order status error:', error);
//             throw error;
//         }
//     }

//     // Get orders by user ID
//     async getOrdersByUser(userId) {
//         try {
//             const response = await fetch(`${this.baseURL}/user/${userId}`, {
//                 method: 'GET',
//                 headers: this.getAuthHeaders()
//             });

//             return this.handleResponse(response);
//         } catch (error) {
//             console.error('Get orders by user error:', error);
//             throw error;
//         }
//     }
// }

// export default new OrdersService();