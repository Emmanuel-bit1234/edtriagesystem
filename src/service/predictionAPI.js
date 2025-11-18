import axios from "axios";

export default function PredictionAPI() {
    // Helper function to get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Helper function to get headers with auth token
    const getAuthHeaders = () => {
        const token = getAuthToken();   
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    this.getPrediction = (data) => {
        var url = "https://triagecdssproxy.vercel.app/predict";
        return axios.post(url, data, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };
    
    this.getAllPredictions = () => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    this.getPredictionsByNurse = (nurseId) => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs/nurse/${nurseId}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    this.getStatsSummary = () => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs/stats/summary`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    this.getLast24HoursStats = () => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs/stats/last-24h`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    this.getGenderStats = () => {
        var url = `https://triagecdssproxy.vercel.app/prediction-logs/stats/patient-gender`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // New authentication methods
    this.login = (email, password) => {
        var url = "https://triagecdssproxy.vercel.app/auth/login";
        return axios.post(url, { email, password })
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user || { email }));
                }
                return response.data;
            });
    };

    this.register = (name, email, password, role = 'Nurse') => {
        var url = "https://triagecdssproxy.vercel.app/auth/register";
        return axios.post(url, { name, email, password, role })
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user || { email, name, role }));
                }
                return response.data;
            });
    };

    this.logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    this.isAuthenticated = () => {
        return !!getAuthToken();
    };

    this.getCurrentUser = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    };
}
