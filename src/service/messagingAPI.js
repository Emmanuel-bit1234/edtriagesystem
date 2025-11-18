import axios from "axios";

export default function MessagingAPI() {
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

    // 1. Search Users
    this.searchUsers = (query) => {
        const url = `${baseURL}/messages/users/search?query=${encodeURIComponent(query)}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 2. Get or Create Direct Conversation
    this.getOrCreateDirectConversation = (userId) => {
        const url = `${baseURL}/messages/conversations/direct`;
        return axios.post(url, { userId }, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 3. Get User's Conversations
    this.getConversations = (params = {}) => {
        const { type, limit = 50, offset = 0 } = params;
        let url = `${baseURL}/messages/conversations?limit=${limit}&offset=${offset}`;
        
        if (type) {
            url += `&type=${type}`;
        }
        
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 4. Get Conversation Messages
    this.getConversationMessages = (conversationId, params = {}) => {
        const { limit = 50, before, after } = params;
        let url = `${baseURL}/messages/conversations/${conversationId}/messages?limit=${limit}`;
        
        if (before) {
            url += `&before=${before}`;
        }
        if (after) {
            url += `&after=${after}`;
        }
        
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 5. Send Message
    this.sendMessage = (conversationId, content, messageType = 'text', metadata = null) => {
        const url = `${baseURL}/messages/conversations/${conversationId}/messages`;
        const body = { content, messageType };
        if (metadata) {
            body.metadata = metadata;
        }
        return axios.post(url, body, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 6. Mark Conversation as Read
    this.markConversationAsRead = (conversationId) => {
        const url = `${baseURL}/messages/conversations/${conversationId}/read`;
        return axios.put(url, {}, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 7. Create Group (Admin only)
    this.createGroup = (name, description, userIds) => {
        const url = `${baseURL}/messages/groups`;
        return axios.post(url, { name, description, userIds }, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 8. Get Group Details
    this.getGroupDetails = (groupId) => {
        const url = `${baseURL}/messages/groups/${groupId}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 9. Add Users to Group (Admin only)
    this.addUsersToGroup = (groupId, userIds) => {
        const url = `${baseURL}/messages/groups/${groupId}/participants`;
        return axios.post(url, { userIds }, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 10. Remove User from Group (Admin only)
    this.removeUserFromGroup = (groupId, userId) => {
        const url = `${baseURL}/messages/groups/${groupId}/participants/${userId}`;
        return axios.delete(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 11. Get All Groups (Admin only)
    this.getAllGroups = (params = {}) => {
        const { limit = 50, offset = 0 } = params;
        const url = `${baseURL}/messages/groups?limit=${limit}&offset=${offset}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 12. Delete Group (Admin only)
    this.deleteGroup = (groupId) => {
        const url = `${baseURL}/messages/groups/${groupId}`;
        return axios.delete(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };
}

