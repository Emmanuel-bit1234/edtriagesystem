import PatientsAPI from '../service/PatientsAPI';

/**
 * Patients API Usage Examples
 * 
 * This file demonstrates how to use the PatientsAPI service
 * with all the endpoints defined in the API documentation.
 */

// Initialize the API service
const patientsAPI = new PatientsAPI();

// Example 1: Create a new patient
export const createPatientExample = async () => {
    try {
        const patientData = {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1985-03-15T00:00:00Z",
            gender: "male",
            phoneNumber: "+1234567890",
            address: "123 Main St, City, State 12345",
            emergencyContact: {
                name: "Jane Doe",
                relationship: "Spouse",
                phone: "+1234567891"
            },
            medicalHistory: ["Diabetes", "Hypertension"],
            allergies: ["Penicillin", "Shellfish"]
        };

        const response = await patientsAPI.createPatient(patientData);
        
        if (response.success) {
            console.log('Patient created successfully:', response.patient);
            return response.patient;
        } else if (response.exists) {
            console.log('Patient already exists:', response.patient);
            return response.patient;
        } else {
            console.error('Failed to create patient:', response.error);
            return null;
        }
    } catch (error) {
        console.error('Error creating patient:', error);
        return null;
    }
};

// Example 2: Get patient by ID
export const getPatientByIdExample = async (patientId) => {
    try {
        const response = await patientsAPI.getPatientById(patientId);
        
        if (response.success) {
            console.log('Patient found:', response.patient);
            return response.patient;
        } else {
            console.error('Patient not found:', response.error);
            return null;
        }
    } catch (error) {
        console.error('Error getting patient:', error);
        return null;
    }
};

// Example 3: Get patient by patient number
export const getPatientByNumberExample = async (patientNumber) => {
    try {
        const response = await patientsAPI.getPatientByNumber(patientNumber);
        
        if (response.success) {
            console.log('Patient found:', response.patient);
            return response.patient;
        } else {
            console.error('Patient not found:', response.error);
            return null;
        }
    } catch (error) {
        console.error('Error getting patient by number:', error);
        return null;
    }
};

// Example 4: Get patient with predictions and risk analysis
export const getPatientWithPredictionsExample = async (patientId) => {
    try {
        const response = await patientsAPI.getPatientWithPredictions(patientId);
        
        if (response.success) {
            const patient = response.patient;
            console.log('Patient with predictions:', {
                basicInfo: {
                    name: `${patient.firstName} ${patient.lastName}`,
                    patientNumber: patient.patientNumber,
                    age: patientsAPI.calculateAge(patient.dateOfBirth)
                },
                riskAnalysis: {
                    riskLevel: patient.riskLevel,
                    totalPredictions: patient.totalPredictions,
                    averagePredictionLevel: patient.averagePredictionLevel,
                    trendDirection: patient.riskAnalysis?.trendDirection,
                    confidenceLevel: patient.riskAnalysis?.confidenceLevel
                },
                recentPredictions: patient.predictions?.slice(0, 3)
            });
            return patient;
        } else {
            console.error('Failed to get patient with predictions:', response.error);
            return null;
        }
    } catch (error) {
        console.error('Error getting patient with predictions:', error);
        return null;
    }
};

// Example 5: Search patients
export const searchPatientsExample = async (searchQuery) => {
    try {
        const response = await patientsAPI.searchPatients(searchQuery);
        
        if (response.success) {
            console.log(`Found ${response.total} patients:`, response.patients);
            return response.patients;
        } else {
            console.error('Search failed:', response.error);
            return [];
        }
    } catch (error) {
        console.error('Error searching patients:', error);
        return [];
    }
};

// Example 6: Update patient information
export const updatePatientExample = async (patientId, updateData) => {
    try {
        const response = await patientsAPI.updatePatient(patientId, updateData);
        
        if (response.success) {
            console.log('Patient updated successfully:', response.patient);
            return response.patient;
        } else {
            console.error('Failed to update patient:', response.error);
            return null;
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        return null;
    }
};

// Example 7: Delete patient (soft delete)
export const deletePatientExample = async (patientId) => {
    try {
        const response = await patientsAPI.deletePatient(patientId);
        
        if (response.success) {
            console.log('Patient deleted successfully');
            return true;
        } else {
            console.error('Failed to delete patient:', response.error);
            return false;
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        return false;
    }
};

// Example 8: Validate patient data before creation
export const validatePatientDataExample = (patientData) => {
    const validation = patientsAPI.validatePatientData(patientData);
    
    if (validation.isValid) {
        console.log('Patient data is valid');
        return true;
    } else {
        console.error('Patient data validation errors:', validation.errors);
        return false;
    }
};

// Example 9: Format patient data for API
export const formatPatientDataExample = (rawPatientData) => {
    const formattedData = patientsAPI.formatPatientData(rawPatientData);
    console.log('Formatted patient data:', formattedData);
    return formattedData;
};

// Example 10: Get patients by age range
export const getPatientsByAgeRangeExample = async (minAge, maxAge) => {
    try {
        const response = await patientsAPI.getPatientsByAgeRange(minAge, maxAge);
        
        if (response.success) {
            console.log(`Found ${response.total} patients between ${minAge} and ${maxAge} years old:`, response.patients);
            return response.patients;
        } else {
            console.error('Failed to get patients by age range:', response.error);
            return [];
        }
    } catch (error) {
        console.error('Error getting patients by age range:', error);
        return [];
    }
};

// Example 11: Get patients by risk level
export const getPatientsByRiskLevelExample = async (riskLevel) => {
    try {
        const response = await patientsAPI.getPatientsByRiskLevel(riskLevel);
        
        if (response.success) {
            console.log(`Found ${response.total} patients with ${riskLevel} risk level:`, response.patients);
            return response.patients;
        } else {
            console.error('Failed to get patients by risk level:', response.error);
            return [];
        }
    } catch (error) {
        console.error('Error getting patients by risk level:', error);
        return [];
    }
};

// Example 12: Batch operations - get multiple patients
export const getMultiplePatientsExample = async (patientIds) => {
    try {
        const results = await patientsAPI.getMultiplePatients(patientIds);
        
        console.log('Batch patient results:', results);
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log(`Successfully retrieved ${successful.length} patients`);
        console.log(`Failed to retrieve ${failed.length} patients`);
        
        return {
            successful: successful.map(r => r.data),
            failed: failed.map(r => ({ id: r.id, error: r.error }))
        };
    } catch (error) {
        console.error('Error in batch operation:', error);
        return { successful: [], failed: [] };
    }
};

// Example 13: Complete patient workflow
export const completePatientWorkflowExample = async () => {
    console.log('=== Complete Patient Workflow Example ===');
    
    try {
        // Step 1: Create a new patient
        console.log('Step 1: Creating new patient...');
        const newPatient = await createPatientExample();
        
        if (!newPatient) {
            console.error('Failed to create patient, stopping workflow');
            return;
        }
        
        const patientId = newPatient.id;
        const patientNumber = newPatient.patientNumber;
        
        // Step 2: Get patient by ID
        console.log('Step 2: Getting patient by ID...');
        const patientById = await getPatientByIdExample(patientId);
        
        // Step 3: Get patient by patient number
        console.log('Step 3: Getting patient by patient number...');
        const patientByNumber = await getPatientByNumberExample(patientNumber);
        
        // Step 4: Search for the patient
        console.log('Step 4: Searching for patient...');
        const searchResults = await searchPatientsExample(newPatient.firstName);
        
        // Step 5: Get patient with predictions (if any exist)
        console.log('Step 5: Getting patient with predictions...');
        const patientWithPredictions = await getPatientWithPredictionsExample(patientId);
        
        // Step 6: Update patient information
        console.log('Step 6: Updating patient information...');
        const updateData = {
            phoneNumber: "+1987654321",
            address: "456 New Street, City, State 12345",
            medicalHistory: ["Diabetes", "Hypertension", "Previous heart surgery"],
            allergies: ["Penicillin", "Shellfish", "Latex"]
        };
        const updatedPatient = await updatePatientExample(patientId, updateData);
        
        // Step 7: Get patients by age range
        console.log('Step 7: Getting patients by age range...');
        const age = patientsAPI.calculateAge(newPatient.dateOfBirth);
        const patientsInAgeRange = await getPatientsByAgeRangeExample(age - 5, age + 5);
        
        // Step 8: Get patients by risk level
        console.log('Step 8: Getting patients by risk level...');
        const patientsByRisk = await getPatientsByRiskLevelExample('moderate');
        
        console.log('=== Workflow completed successfully ===');
        
        return {
            createdPatient: newPatient,
            retrievedById: patientById,
            retrievedByNumber: patientByNumber,
            searchResults: searchResults,
            patientWithPredictions: patientWithPredictions,
            updatedPatient: updatedPatient,
            patientsInAgeRange: patientsInAgeRange,
            patientsByRisk: patientsByRisk
        };
        
    } catch (error) {
        console.error('Error in complete workflow:', error);
        return null;
    }
};

// Example 14: Error handling patterns
export const errorHandlingExample = async () => {
    console.log('=== Error Handling Examples ===');
    
    // Example: Invalid patient ID
    try {
        await patientsAPI.getPatientById('invalid-id');
    } catch (error) {
        console.log('Expected error for invalid ID:', error);
    }
    
    // Example: Non-existent patient
    try {
        await patientsAPI.getPatientById(99999);
    } catch (error) {
        console.log('Expected error for non-existent patient:', error);
    }
    
    // Example: Invalid search query
    try {
        await patientsAPI.searchPatients('');
    } catch (error) {
        console.log('Expected error for empty search:', error);
    }
    
    // Example: Invalid patient data
    const invalidPatientData = {
        firstName: '', // Invalid: empty first name
        lastName: 'Doe',
        // Missing required fields
    };
    
    const validation = patientsAPI.validatePatientData(invalidPatientData);
    console.log('Validation result for invalid data:', validation);
};

// Export all examples for easy importing
export const PatientsAPIExamples = {
    createPatient: createPatientExample,
    getPatientById: getPatientByIdExample,
    getPatientByNumber: getPatientByNumberExample,
    getPatientWithPredictions: getPatientWithPredictionsExample,
    searchPatients: searchPatientsExample,
    updatePatient: updatePatientExample,
    deletePatient: deletePatientExample,
    validatePatientData: validatePatientDataExample,
    formatPatientData: formatPatientDataExample,
    getPatientsByAgeRange: getPatientsByAgeRangeExample,
    getPatientsByRiskLevel: getPatientsByRiskLevelExample,
    getMultiplePatients: getMultiplePatientsExample,
    completeWorkflow: completePatientWorkflowExample,
    errorHandling: errorHandlingExample
};

export default PatientsAPIExamples;
