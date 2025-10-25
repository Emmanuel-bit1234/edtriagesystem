import axios from "axios";

export default function PatientAPI() {
    // Helper function to get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Helper function to get headers with auth token
    const getAuthHeaders = () => {
        const token = getAuthToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Base URL for patient API
    const baseURL = "https://triagecdssproxy.vercel.app";

    // Create a new patient
    this.createPatient = (patientData) => {
        const url = `${baseURL}/patients`;
        return axios.post(url, patientData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }).then((response) => response.data);
    };

    // Get patient by ID
    this.getPatientById = (id) => {
        const url = `${baseURL}/patients/${id}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Get patient by patient number
    this.getPatientByNumber = (patientNumber) => {
        const url = `${baseURL}/patients/number/${patientNumber}`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Update patient
    this.updatePatient = (id, patientData) => {
        const url = `${baseURL}/patients/${id}`;
        return axios.put(url, patientData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }).then((response) => response.data);
    };

    // Search patients with filters
    this.searchPatients = (filters = {}) => {
        const url = `${baseURL}/patients`;
        const params = new URLSearchParams();
        
        // Add filters to query parameters
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        return axios.get(fullUrl, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Get patient statistics
    this.getPatientStats = () => {
        const url = `${baseURL}/patients/stats/overview`;
        return axios.get(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Delete patient
    this.deletePatient = (id) => {
        const url = `${baseURL}/patients/${id}`;
        return axios.delete(url, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Helper function to format patient data for forms
    this.formatPatientForForm = (patient) => {
        if (!patient) return {};
        
        return {
            id: patient.id, // Include the ID for updates
            patientNumber: patient.patientNumber || '',
            firstName: patient.firstName || '',
            lastName: patient.lastName || '',
            dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
            gender: patient.gender || '',
            phoneNumber: patient.phoneNumber || '',
            email: patient.email || '',
            address: patient.address || '',
            emergencyContact: patient.emergencyContact || {
                name: '',
                relationship: '',
                phoneNumber: ''
            },
            medicalHistory: patient.medicalHistory || [],
            allergies: patient.allergies || [],
            medications: patient.medications || [],
            insuranceInfo: patient.insuranceInfo || {
                provider: '',
                policyNumber: '',
                groupNumber: ''
            }
        };
    };

    // Helper function to calculate age from date of birth
    this.calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Helper function to calculate detailed age (years, months, days)
    this.calculateDetailedAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        
        // Calculate total days difference
        const timeDiff = today.getTime() - birthDate.getTime();
        const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // If less than 1 year, calculate months and days
        if (totalDays < 365) {
            const months = Math.floor(totalDays / 30);
            const remainingDays = totalDays % 30;
            
            if (totalDays < 30) {
                return `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
            } else if (months < 12) {
                // Show months and days for more precision
                if (remainingDays > 0) {
                    return `${months} month${months !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
                } else {
                    return `${months} month${months !== 1 ? 's' : ''}`;
                }
            }
        }
        
        // For 1 year and above, use the existing calculation
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return `${age} year${age !== 1 ? 's' : ''}`;
    };

    // Helper function to format date for display
    this.formatDate = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Helper function to format datetime for display
    this.formatDateTime = (dateString) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
}

