# Patients API Implementation

This document describes the implementation of the Patients API based on the provided documentation. The implementation includes a complete API service, React components, and usage examples.

## Files Created

### 1. API Service
- **`src/service/PatientsAPI.js`** - Main API service class with all endpoints

### 2. React Components
- **`src/pages/PatientManagement.jsx`** - Complete patient management interface
- **Updated `src/App.js`** - Added Patient Management route and menu item

### 3. Usage Examples
- **`src/examples/PatientsAPIExample.js`** - Comprehensive usage examples

## API Service Features

### Core Endpoints
- ✅ `createPatient(patientData)` - Create new patient
- ✅ `getPatientById(id)` - Get patient by database ID
- ✅ `getPatientByNumber(patientNumber)` - Get patient by patient number
- ✅ `getPatientWithPredictions(id)` - Get patient with prediction history
- ✅ `searchPatients(query)` - Search patients by name or number
- ✅ `updatePatient(id, updateData)` - Update patient information
- ✅ `deletePatient(id)` - Soft delete patient

### Advanced Features
- ✅ `getPatientsByAgeRange(minAge, maxAge)` - Filter patients by age
- ✅ `getPatientsByRiskLevel(riskLevel)` - Filter patients by risk level
- ✅ `getMultiplePatients(ids)` - Batch retrieve multiple patients
- ✅ `validatePatientData(data)` - Validate patient data before submission
- ✅ `formatPatientData(data)` - Format data for API submission

### Helper Methods
- ✅ `calculateAge(dateOfBirth)` - Calculate age from date of birth
- ✅ `getRiskLevel(predictions)` - Determine risk level from predictions
- ✅ `analyzePredictionTrends(predictions)` - Analyze prediction trends
- ✅ `categorizePredictions(predictions)` - Categorize predictions by urgency
- ✅ `handleError(error)` - Standardized error handling

## React Component Features

### PatientManagement Component
- **Search Functionality**: Search patients by name or patient number
- **Patient Creation**: Complete form for creating new patients
- **Patient Details**: Comprehensive patient information display
- **Risk Analysis**: Visual representation of patient risk levels
- **Prediction History**: Display of patient prediction history
- **Medical Information**: Medical history and allergies management
- **Emergency Contacts**: Emergency contact information
- **Data Validation**: Client-side validation before API calls
- **Error Handling**: User-friendly error messages
- **Loading States**: Loading indicators for better UX

### UI Components Used
- DataTable for patient listing
- Dialog for patient details and creation
- Form components (InputText, Dropdown, Calendar, etc.)
- Toast notifications for feedback
- Tags and Chips for data display
- Panels for organized information display

## Usage Examples

### Basic Usage
```javascript
import PatientsAPI from '../service/PatientsAPI';

const patientsAPI = new PatientsAPI();

// Create a new patient
const patientData = {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1985-03-15T00:00:00Z",
    gender: "male",
    phoneNumber: "+1234567890",
    address: "123 Main St, City, State 12345"
};

const response = await patientsAPI.createPatient(patientData);
```

### Advanced Usage
```javascript
// Get patient with predictions and risk analysis
const patientWithPredictions = await patientsAPI.getPatientWithPredictions(patientId);

// Search patients
const searchResults = await patientsAPI.searchPatients("John");

// Get patients by age range
const patientsInAgeRange = await patientsAPI.getPatientsByAgeRange(30, 50);

// Get patients by risk level
const highRiskPatients = await patientsAPI.getPatientsByRiskLevel("critical");
```

## API Configuration

### Base URL
The API service is configured to use:
```
http://localhost:3000/patients
```

### Authentication
All API calls include JWT token authentication:
```javascript
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
```

## Data Validation

### Required Fields
- `firstName` (string)
- `lastName` (string)
- `dateOfBirth` (ISO 8601 timestamp)
- `gender` ("male" | "female")

### Optional Fields
- `phoneNumber` (string)
- `address` (string)
- `emergencyContact` (object with name, relationship, phone)
- `medicalHistory` (array of strings)
- `allergies` (array of strings)

### Validation Rules
- First name and last name cannot be empty
- Date of birth must be in ISO 8601 format
- Gender must be one of: male, female
- Phone numbers should follow standard format
- Emergency contact requires name, relationship, and phone

## Error Handling

### Standardized Error Responses
```javascript
{
    success: false,
    error: "Error message",
    code: "ERROR_CODE",
    status: 400 // HTTP status code
}
```

### Common Error Codes
- `PATIENT_NOT_FOUND` - Patient with specified ID/number not found
- `INVALID_PATIENT_ID` - Invalid patient ID format
- `SEARCH_QUERY_REQUIRED` - Search query parameter missing
- `PATIENT_EXISTS` - Patient with same name and DOB already exists
- `SERVER_ERROR` - Internal server error
- `NETWORK_ERROR` - Network connectivity issues

## Risk Analysis Features

### Risk Level Calculation
- **Critical**: Has predictions with level 1-2 (immediate/very urgent)
- **Moderate**: Has predictions with level 3 (urgent)
- **Low**: Has predictions with level 4-5 (less urgent/standard)

### Risk Analysis Components
- `criticalPredictions`: Count of level 1-2 predictions
- `moderatePredictions`: Count of level 3 predictions
- `lowUrgencyPredictions`: Count of level 4-5 predictions
- `trendDirection`: "improving" | "stable" | "declining"
- `confidenceLevel`: "high" | "medium" | "low"

## Integration with Existing System

### Menu Integration
The Patient Management component is integrated into the main application menu:
```javascript
{
    label: "Patient Management",
    icon: "pi pi-fw pi-users",
    to: "/patient-management",
}
```

### Route Integration
```javascript
<Route path="/patient-management" component={PatientManagement} />
```

### Authentication Integration
Uses the existing authentication system with JWT tokens stored in localStorage.

## Testing and Examples

### Running Examples
```javascript
import { PatientsAPIExamples } from '../examples/PatientsAPIExample';

// Run complete workflow example
await PatientsAPIExamples.completeWorkflow();

// Run individual examples
await PatientsAPIExamples.createPatient();
await PatientsAPIExamples.searchPatients("John");
```

### Example Workflows
1. **Complete Patient Workflow**: Create → Retrieve → Update → Search → Analyze
2. **Error Handling**: Invalid data, network errors, validation failures
3. **Batch Operations**: Multiple patient retrieval and processing
4. **Risk Analysis**: Patient risk assessment and trend analysis

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket integration for live patient data
2. **Advanced Search**: Filtering by multiple criteria simultaneously
3. **Export Functionality**: Export patient data to various formats
4. **Audit Trail**: Track all patient data changes
5. **Integration**: Connect with external medical systems
6. **Mobile Support**: Responsive design improvements
7. **Offline Support**: Local storage for offline functionality

### Performance Optimizations
1. **Caching**: Implement client-side caching for frequently accessed data
2. **Pagination**: Server-side pagination for large datasets
3. **Lazy Loading**: Load patient details on demand
4. **Debouncing**: Optimize search input handling

## Security Considerations

### Data Protection
- All API calls require authentication
- Sensitive data is not logged in console
- Input validation prevents injection attacks
- Error messages don't expose sensitive information

### Access Control
- Patient data access is controlled by authentication
- Role-based access can be implemented
- Audit logging for data access

## Conclusion

The Patients API implementation provides a complete solution for patient management within the triage CDSS system. It includes:

- ✅ Complete API service with all documented endpoints
- ✅ Comprehensive React component for patient management
- ✅ Detailed usage examples and documentation
- ✅ Error handling and validation
- ✅ Risk analysis and prediction integration
- ✅ Integration with existing authentication system

The implementation follows the provided API documentation exactly and provides additional features for enhanced usability and functionality.
