import axios from "axios";

export default function PatientsAPI() {
    // Helper function to get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    // Helper function to get headers with auth token
    const getAuthHeaders = () => {
        const token = getAuthToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    // Base URL for the Patients API
    const baseURL = "http://localhost:3000/patients";

    // 1. Create Patient
    this.createPatient = (patientData) => {
        return axios.post(baseURL, patientData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }).then((response) => response.data);
    };

    // 2. Get Patient by ID
    this.getPatientById = (id) => {
        return axios.get(`${baseURL}/${id}`, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 3. Get Patient by Patient Number
    this.getPatientByNumber = (patientNumber) => {
        return axios.get(`${baseURL}/number/${patientNumber}`, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 4. Get Patient with Predictions
    this.getPatientWithPredictions = (id) => {
        return axios.get(`${baseURL}/${id}/predictions`, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 5. Search Patients
    this.searchPatients = (query) => {
        return axios.get(`${baseURL}/search`, {
            params: { q: query },
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // 6. Update Patient
    this.updatePatient = (id, patientData) => {
        return axios.put(`${baseURL}/${id}`, patientData, {
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            }
        }).then((response) => response.data);
    };

    // 7. Delete Patient
    this.deletePatient = (id) => {
        return axios.delete(`${baseURL}/${id}`, {
            headers: getAuthHeaders()
        }).then((response) => response.data);
    };

    // Helper method to format patient data for creation
    this.formatPatientData = (patientData) => {
        const formattedData = {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            dateOfBirth: patientData.dateOfBirth,
            gender: patientData.gender
        };

        // Add optional fields if they exist
        if (patientData.phoneNumber) formattedData.phoneNumber = patientData.phoneNumber;
        if (patientData.address) formattedData.address = patientData.address;
        if (patientData.emergencyContact) formattedData.emergencyContact = patientData.emergencyContact;
        if (patientData.medicalHistory) formattedData.medicalHistory = patientData.medicalHistory;
        if (patientData.allergies) formattedData.allergies = patientData.allergies;

        return formattedData;
    };

    // Helper method to validate patient data
    this.validatePatientData = (patientData) => {
        const errors = [];

        if (!patientData.firstName || patientData.firstName.trim() === '') {
            errors.push('First name is required');
        }

        if (!patientData.lastName || patientData.lastName.trim() === '') {
            errors.push('Last name is required');
        }

        if (!patientData.dateOfBirth) {
            errors.push('Date of birth is required');
        }

        if (!patientData.gender || !['male', 'female'].includes(patientData.gender)) {
            errors.push('Gender is required and must be male or female');
        }

        // Validate date format if provided
        if (patientData.dateOfBirth && !this.isValidISODate(patientData.dateOfBirth)) {
            errors.push('Date of birth must be in ISO 8601 format');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    // Helper method to validate ISO date format
    this.isValidISODate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toISOString() === dateString;
        } catch (error) {
            return false;
        }
    };

    // Helper method to calculate age from date of birth
    this.calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };

    // Helper method to format emergency contact data
    this.formatEmergencyContact = (contactData) => {
        if (!contactData) return null;

        return {
            name: contactData.name || '',
            relationship: contactData.relationship || '',
            phone: contactData.phone || ''
        };
    };

    // Helper method to get risk level from predictions
    this.getRiskLevel = (predictions) => {
        if (!predictions || predictions.length === 0) {
            return 'unknown';
        }

        const hasCritical = predictions.some(p => p.predict <= 2);
        const hasModerate = predictions.some(p => p.predict === 3);
        const hasLow = predictions.some(p => p.predict >= 4);

        if (hasCritical) return 'critical';
        if (hasModerate) return 'moderate';
        if (hasLow) return 'low';
        
        return 'unknown';
    };

    // Helper method to analyze prediction trends
    this.analyzePredictionTrends = (predictions) => {
        if (!predictions || predictions.length < 2) {
            return {
                trendDirection: 'stable',
                confidenceLevel: 'low'
            };
        }

        // Sort predictions by date (most recent first)
        const sortedPredictions = [...predictions].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        const recent = sortedPredictions.slice(0, Math.min(3, sortedPredictions.length));
        const older = sortedPredictions.slice(Math.min(3, sortedPredictions.length));

        if (recent.length === 0 || older.length === 0) {
            return {
                trendDirection: 'stable',
                confidenceLevel: 'low'
            };
        }

        const recentAvg = recent.reduce((sum, p) => sum + p.predict, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.predict, 0) / older.length;

        let trendDirection = 'stable';
        if (recentAvg < olderAvg) {
            trendDirection = 'improving';
        } else if (recentAvg > olderAvg) {
            trendDirection = 'declining';
        }

        // Calculate confidence based on prediction probabilities
        const avgConfidence = recent.reduce((sum, p) => {
            const probs = p.probs ? p.probs.map(prob => parseFloat(prob)) : [];
            const maxProb = Math.max(...probs);
            return sum + maxProb;
        }, 0) / recent.length;

        let confidenceLevel = 'low';
        if (avgConfidence > 0.8) {
            confidenceLevel = 'high';
        } else if (avgConfidence > 0.6) {
            confidenceLevel = 'medium';
        }

        return {
            trendDirection,
            confidenceLevel
        };
    };

    // Helper method to categorize predictions
    this.categorizePredictions = (predictions) => {
        if (!predictions || predictions.length === 0) {
            return {
                criticalPredictions: 0,
                moderatePredictions: 0,
                lowUrgencyPredictions: 0
            };
        }

        return predictions.reduce((acc, prediction) => {
            if (prediction.predict <= 2) {
                acc.criticalPredictions++;
            } else if (prediction.predict === 3) {
                acc.moderatePredictions++;
            } else {
                acc.lowUrgencyPredictions++;
            }
            return acc;
        }, {
            criticalPredictions: 0,
            moderatePredictions: 0,
            lowUrgencyPredictions: 0
        });
    };

    // Helper method to handle API errors
    this.handleError = (error) => {
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                error: error.response.data.error || 'An error occurred',
                code: error.response.data.code || 'SERVER_ERROR',
                status: error.response.status
            };
        } else if (error.request) {
            // Request was made but no response received
            return {
                success: false,
                error: 'Network error - unable to connect to server',
                code: 'NETWORK_ERROR'
            };
        } else {
            // Something else happened
            return {
                success: false,
                error: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR'
            };
        }
    };

    // Batch operations for multiple patients
    this.getMultiplePatients = async (ids) => {
        try {
            const promises = ids.map(id => this.getPatientById(id));
            const results = await Promise.allSettled(promises);
            
            return results.map((result, index) => ({
                id: ids[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            }));
        } catch (error) {
            throw this.handleError(error);
        }
    };

    // Get patients by age range
    this.getPatientsByAgeRange = async (minAge, maxAge) => {
        try {
            // This would require a backend endpoint that supports age filtering
            // For now, we'll search all patients and filter client-side
            const allPatients = await this.searchPatients('');
            
            if (!allPatients.success) {
                throw new Error(allPatients.error);
            }

            const filteredPatients = allPatients.patients.filter(patient => {
                const age = this.calculateAge(patient.dateOfBirth);
                return age >= minAge && age <= maxAge;
            });

            return {
                success: true,
                patients: filteredPatients,
                total: filteredPatients.length
            };
        } catch (error) {
            throw this.handleError(error);
        }
    };

    // Get patients by risk level
    this.getPatientsByRiskLevel = async (riskLevel) => {
        try {
            // This would require a backend endpoint that supports risk level filtering
            // For now, we'll search all patients and filter client-side
            const allPatients = await this.searchPatients('');
            
            if (!allPatients.success) {
                throw new Error(allPatients.error);
            }

            const patientsWithRisk = await Promise.all(
                allPatients.patients.map(async (patient) => {
                    try {
                        const patientWithPredictions = await this.getPatientWithPredictions(patient.id);
                        if (patientWithPredictions.success) {
                            return {
                                ...patient,
                                riskLevel: patientWithPredictions.patient.riskLevel
                            };
                        }
                    } catch (error) {
                        console.warn(`Failed to get predictions for patient ${patient.id}:`, error);
                    }
                    return {
                        ...patient,
                        riskLevel: 'unknown'
                    };
                })
            );

            const filteredPatients = patientsWithRisk.filter(patient => 
                patient.riskLevel === riskLevel
            );

            return {
                success: true,
                patients: filteredPatients,
                total: filteredPatients.length
            };
        } catch (error) {
            throw this.handleError(error);
        }
    };
}
