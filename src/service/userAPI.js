import axios from "axios";

export default function UserAPI() {
    // Helper function to get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Helper function to get headers with auth token
    const getAuthHeaders = () => {
        const token = getAuthToken();   
        return token ? { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : { 'Content-Type': 'application/json' };
    };

    // Base URL - update this to match your backend IP
    const baseURL = "https://triagecdssproxy.vercel.app";

    // 1. Get All Users
    this.getAllUsers = (params = {}) => {
        const { role, limit = 50, offset = 0, search } = params;
        let url = `${baseURL}/users?limit=${limit}&offset=${offset}`;
        
        if (role) {
            url += `&role=${role}`;
        }
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 2. Get User by ID
    this.getUserById = (id) => {
        const url = `${baseURL}/users/${id}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 3. Update User (name, email)
    this.updateUser = (id, data) => {
        const url = `${baseURL}/users/${id}`;
        return axios.put(url, data, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 4. Update User Role (Admin only)
    this.updateUserRole = (id, role) => {
        const url = `${baseURL}/users/${id}/role`;
        return axios.put(url, { role }, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 5. Delete User (Admin only)
    this.deleteUser = (id) => {
        const url = `${baseURL}/users/${id}`;
        return axios.delete(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 6. Search Users
    this.searchUsers = (params = {}) => {
        const { query, role, limit = 20 } = params;
        let url = `${baseURL}/users/search?query=${encodeURIComponent(query)}&limit=${limit}`;
        
        if (role) {
            url += `&role=${role}`;
        }
        
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };
}

