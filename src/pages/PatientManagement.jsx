import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import PatientsAPI from '../service/PatientsAPI';

export const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientDialog, setShowPatientDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [patientDetails, setPatientDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [toast, setToast] = useState(null);
    const [newPatient, setNewPatient] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        gender: '',
        phoneNumber: '',
        address: '',
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        medicalHistory: [],
        allergies: []
    });

    const patientsAPI = new PatientsAPI();

    const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
    ];

    const relationshipOptions = [
        { label: 'Spouse', value: 'Spouse' },
        { label: 'Parent', value: 'Parent' },
        { label: 'Child', value: 'Child' },
        { label: 'Sibling', value: 'Sibling' },
        { label: 'Friend', value: 'Friend' },
        { label: 'Other', value: 'Other' }
    ];

    useEffect(() => {
        searchPatients();
    }, []);

    const searchPatients = async () => {
        if (!searchQuery.trim()) {
            setPatients([]);
            return;
        }

        setLoading(true);
        try {
            const response = await patientsAPI.searchPatients(searchQuery);
            if (response.success) {
                setPatients(response.patients);
            } else {
                showToast('error', 'Search Error', response.error);
            }
        } catch (error) {
            showToast('error', 'Search Error', 'Failed to search patients');
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPatientDetails = async (patientId) => {
        setLoadingDetails(true);
        try {
            const response = await patientsAPI.getPatientWithPredictions(patientId);
            if (response.success) {
                setPatientDetails(response.patient);
                setShowPatientDialog(true);
            } else {
                showToast('error', 'Error', response.error);
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to load patient details');
            console.error('Patient details error:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const createPatient = async () => {
        // Validate required fields
        if (!newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth || !newPatient.gender) {
            showToast('error', 'Validation Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const patientData = {
                ...newPatient,
                dateOfBirth: newPatient.dateOfBirth.toISOString(),
                medicalHistory: newPatient.medicalHistory.filter(item => item.trim() !== ''),
                allergies: newPatient.allergies.filter(item => item.trim() !== '')
            };

            const response = await patientsAPI.createPatient(patientData);
            
            if (response.success) {
                showToast('success', 'Success', 'Patient created successfully');
                setShowCreateDialog(false);
                resetNewPatient();
                searchPatients(); // Refresh search results
            } else if (response.exists) {
                showToast('warn', 'Patient Exists', response.message);
            } else {
                showToast('error', 'Error', response.error);
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to create patient');
            console.error('Create patient error:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePatient = async (patientId) => {
        if (!window.confirm('Are you sure you want to delete this patient?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await patientsAPI.deletePatient(patientId);
            if (response.success) {
                showToast('success', 'Success', 'Patient deleted successfully');
                searchPatients(); // Refresh search results
            } else {
                showToast('error', 'Error', response.error);
            }
        } catch (error) {
            showToast('error', 'Error', 'Failed to delete patient');
            console.error('Delete patient error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (severity, summary, detail) => {
        if (toast) {
            toast.show({ severity, summary, detail, life: 3000 });
        }
    };

    const resetNewPatient = () => {
        setNewPatient({
            firstName: '',
            lastName: '',
            dateOfBirth: null,
            gender: '',
            phoneNumber: '',
            address: '',
            emergencyContact: {
                name: '',
                relationship: '',
                phone: ''
            },
            medicalHistory: [],
            allergies: []
        });
    };

    const addMedicalHistoryItem = () => {
        setNewPatient(prev => ({
            ...prev,
            medicalHistory: [...prev.medicalHistory, '']
        }));
    };

    const updateMedicalHistoryItem = (index, value) => {
        setNewPatient(prev => ({
            ...prev,
            medicalHistory: prev.medicalHistory.map((item, i) => i === index ? value : item)
        }));
    };

    const removeMedicalHistoryItem = (index) => {
        setNewPatient(prev => ({
            ...prev,
            medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
        }));
    };

    const addAllergyItem = () => {
        setNewPatient(prev => ({
            ...prev,
            allergies: [...prev.allergies, '']
        }));
    };

    const updateAllergyItem = (index, value) => {
        setNewPatient(prev => ({
            ...prev,
            allergies: prev.allergies.map((item, i) => i === index ? value : item)
        }));
    };

    const removeAllergyItem = (index) => {
        setNewPatient(prev => ({
            ...prev,
            allergies: prev.allergies.filter((_, i) => i !== index)
        }));
    };

    const getRiskLevelSeverity = (riskLevel) => {
        switch (riskLevel) {
            case 'critical': return 'danger';
            case 'moderate': return 'warning';
            case 'low': return 'success';
            default: return 'info';
        }
    };

    const getPredictionLevelSeverity = (level) => {
        if (level <= 2) return 'danger';
        if (level === 3) return 'warning';
        return 'success';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const calculateAge = (dateOfBirth) => {
        return patientsAPI.calculateAge(dateOfBirth);
    };

    const patientSearchHeader = (
        <div className="flex flex-column gap-3">
            <div className="flex gap-2">
                <InputText
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or patient number..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                />
                <Button
                    label="Search"
                    icon="pi pi-search"
                    onClick={searchPatients}
                    loading={loading}
                />
                <Button
                    label="New Patient"
                    icon="pi pi-plus"
                    onClick={() => setShowCreateDialog(true)}
                    className="p-button-success"
                />
            </div>
        </div>
    );

    const patientTableColumns = [
        {
            field: 'patientNumber',
            header: 'Patient Number',
            style: { minWidth: '120px' }
        },
        {
            field: 'firstName',
            header: 'First Name',
            style: { minWidth: '120px' }
        },
        {
            field: 'lastName',
            header: 'Last Name',
            style: { minWidth: '120px' }
        },
        {
            field: 'dateOfBirth',
            header: 'Age',
            body: (rowData) => `${calculateAge(rowData.dateOfBirth)} years`,
            style: { minWidth: '80px' }
        },
        {
            field: 'gender',
            header: 'Gender',
            style: { minWidth: '80px' }
        },
        {
            field: 'phoneNumber',
            header: 'Phone',
            style: { minWidth: '120px' }
        },
        {
            field: 'actions',
            header: 'Actions',
            body: (rowData) => (
                <div className="flex gap-2">
                    <Button
                        icon="pi pi-eye"
                        className="p-button-rounded p-button-text p-button-sm"
                        onClick={() => getPatientDetails(rowData.id)}
                        loading={loadingDetails && selectedPatient?.id === rowData.id}
                        tooltip="View Details"
                    />
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-text p-button-sm p-button-danger"
                        onClick={() => deletePatient(rowData.id)}
                        tooltip="Delete Patient"
                    />
                </div>
            ),
            style: { minWidth: '120px' }
        }
    ];

    const patientDetailsContent = () => {
        if (!patientDetails) return <Skeleton height="200px" />;

        return (
            <div className="grid">
                <div className="col-12 md:col-6">
                    <Panel header="Basic Information" className="mb-3">
                        <div className="grid">
                            <div className="col-6">
                                <strong>Patient Number:</strong>
                                <p>{patientDetails.patientNumber}</p>
                            </div>
                            <div className="col-6">
                                <strong>Name:</strong>
                                <p>{patientDetails.firstName} {patientDetails.lastName}</p>
                            </div>
                            <div className="col-6">
                                <strong>Date of Birth:</strong>
                                <p>{formatDate(patientDetails.dateOfBirth)}</p>
                            </div>
                            <div className="col-6">
                                <strong>Age:</strong>
                                <p>{calculateAge(patientDetails.dateOfBirth)} years</p>
                            </div>
                            <div className="col-6">
                                <strong>Gender:</strong>
                                <p>{patientDetails.gender}</p>
                            </div>
                            <div className="col-6">
                                <strong>Phone:</strong>
                                <p>{patientDetails.phoneNumber || 'N/A'}</p>
                            </div>
                            <div className="col-12">
                                <strong>Address:</strong>
                                <p>{patientDetails.address || 'N/A'}</p>
                            </div>
                        </div>
                    </Panel>

                    <Panel header="Emergency Contact" className="mb-3">
                        {patientDetails.emergencyContact ? (
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Name:</strong>
                                    <p>{patientDetails.emergencyContact.name}</p>
                                </div>
                                <div className="col-6">
                                    <strong>Relationship:</strong>
                                    <p>{patientDetails.emergencyContact.relationship}</p>
                                </div>
                                <div className="col-12">
                                    <strong>Phone:</strong>
                                    <p>{patientDetails.emergencyContact.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p>No emergency contact information</p>
                        )}
                    </Panel>

                    <Panel header="Medical Information" className="mb-3">
                        <div className="mb-3">
                            <strong>Medical History:</strong>
                            {patientDetails.medicalHistory && patientDetails.medicalHistory.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {patientDetails.medicalHistory.map((item, index) => (
                                        <Chip key={index} label={item} />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2">No medical history recorded</p>
                            )}
                        </div>
                        <div>
                            <strong>Allergies:</strong>
                            {patientDetails.allergies && patientDetails.allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {patientDetails.allergies.map((item, index) => (
                                        <Chip key={index} label={item} className="p-chip-danger" />
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2">No known allergies</p>
                            )}
                        </div>
                    </Panel>
                </div>

                <div className="col-12 md:col-6">
                    <Panel header="Risk Analysis" className="mb-3">
                        <div className="grid">
                            <div className="col-6">
                                <strong>Risk Level:</strong>
                                <div className="mt-2">
                                    <Tag
                                        value={patientDetails.riskLevel || 'Unknown'}
                                        severity={getRiskLevelSeverity(patientDetails.riskLevel)}
                                    />
                                </div>
                            </div>
                            <div className="col-6">
                                <strong>Total Predictions:</strong>
                                <p>{patientDetails.totalPredictions || 0}</p>
                            </div>
                            <div className="col-6">
                                <strong>Last Prediction:</strong>
                                <p>{patientDetails.lastPrediction ? formatDateTime(patientDetails.lastPrediction) : 'N/A'}</p>
                            </div>
                            <div className="col-6">
                                <strong>Average Level:</strong>
                                <p>{patientDetails.averagePredictionLevel || 'N/A'}</p>
                            </div>
                        </div>

                        {patientDetails.riskAnalysis && (
                            <div className="mt-3">
                                <Divider />
                                <div className="grid">
                                    <div className="col-4">
                                        <strong>Critical:</strong>
                                        <p>{patientDetails.riskAnalysis.criticalPredictions}</p>
                                    </div>
                                    <div className="col-4">
                                        <strong>Moderate:</strong>
                                        <p>{patientDetails.riskAnalysis.moderatePredictions}</p>
                                    </div>
                                    <div className="col-4">
                                        <strong>Low Urgency:</strong>
                                        <p>{patientDetails.riskAnalysis.lowUrgencyPredictions}</p>
                                    </div>
                                    <div className="col-6">
                                        <strong>Trend:</strong>
                                        <p>{patientDetails.riskAnalysis.trendDirection}</p>
                                    </div>
                                    <div className="col-6">
                                        <strong>Confidence:</strong>
                                        <p>{patientDetails.riskAnalysis.confidenceLevel}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Panel>

                    <Panel header="Recent Predictions" className="mb-3">
                        {patientDetails.predictions && patientDetails.predictions.length > 0 ? (
                            <div className="space-y-3">
                                {patientDetails.predictions.slice(0, 5).map((prediction, index) => (
                                    <div key={index} className="border-1 border-300 p-3 border-round">
                                        <div className="flex justify-content-between align-items-center mb-2">
                                            <Tag
                                                value={`Level ${prediction.predict}`}
                                                severity={getPredictionLevelSeverity(prediction.predict)}
                                            />
                                            <small>{formatDateTime(prediction.createdAt)}</small>
                                        </div>
                                        <div className="text-sm">
                                            <strong>Chief Complaint:</strong> {prediction.inputs?.Chief_complain || 'N/A'}
                                        </div>
                                        <div className="text-sm">
                                            <strong>Nurse:</strong> {prediction.user?.name || 'Unknown'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No predictions available</p>
                        )}
                    </Panel>
                </div>
            </div>
        );
    };

    const createPatientDialogContent = () => (
        <div className="grid">
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="firstName">First Name *</label>
                    <InputText
                        id="firstName"
                        value={newPatient.firstName}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="lastName">Last Name *</label>
                    <InputText
                        id="lastName"
                        value={newPatient.lastName}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                    <Calendar
                        id="dateOfBirth"
                        value={newPatient.dateOfBirth}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, dateOfBirth: e.value }))}
                        showIcon
                        className="w-full"
                        maxDate={new Date()}
                        yearRange="1900:2030"
                        showYearNavigator
                        showMonthNavigator
                        monthNavigator
                        yearNavigator
                        dateFormat="dd/mm/yy"
                        placeholder="Select date of birth"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="gender">Gender *</label>
                    <Dropdown
                        id="gender"
                        value={newPatient.gender}
                        options={genderOptions}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, gender: e.value }))}
                        placeholder="Select Gender"
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-6">
                <div className="field">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <InputText
                        id="phoneNumber"
                        value={newPatient.phoneNumber}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12">
                <div className="field">
                    <label htmlFor="address">Address</label>
                    <InputTextarea
                        id="address"
                        value={newPatient.address}
                        onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="col-12">
                <Divider />
                <h5>Emergency Contact</h5>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="emergencyName">Name</label>
                    <InputText
                        id="emergencyName"
                        value={newPatient.emergencyContact.name}
                        onChange={(e) => setNewPatient(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                        }))}
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="emergencyRelationship">Relationship</label>
                    <Dropdown
                        id="emergencyRelationship"
                        value={newPatient.emergencyContact.relationship}
                        options={relationshipOptions}
                        onChange={(e) => setNewPatient(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, relationship: e.value }
                        }))}
                        placeholder="Select Relationship"
                        className="w-full"
                    />
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="field">
                    <label htmlFor="emergencyPhone">Phone</label>
                    <InputText
                        id="emergencyPhone"
                        value={newPatient.emergencyContact.phone}
                        onChange={(e) => setNewPatient(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                        }))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="col-12">
                <Divider />
                <div className="flex justify-content-between align-items-center">
                    <h5>Medical History</h5>
                    <Button
                        icon="pi pi-plus"
                        className="p-button-sm"
                        onClick={addMedicalHistoryItem}
                    />
                </div>
                {newPatient.medicalHistory.map((item, index) => (
                    <div key={index} className="field flex gap-2">
                        <InputText
                            value={item}
                            onChange={(e) => updateMedicalHistoryItem(index, e.target.value)}
                            placeholder="Enter medical condition"
                            className="flex-1"
                        />
                        <Button
                            icon="pi pi-trash"
                            className="p-button-sm p-button-danger"
                            onClick={() => removeMedicalHistoryItem(index)}
                        />
                    </div>
                ))}
            </div>

            <div className="col-12">
                <Divider />
                <div className="flex justify-content-between align-items-center">
                    <h5>Allergies</h5>
                    <Button
                        icon="pi pi-plus"
                        className="p-button-sm"
                        onClick={addAllergyItem}
                    />
                </div>
                {newPatient.allergies.map((item, index) => (
                    <div key={index} className="field flex gap-2">
                        <InputText
                            value={item}
                            onChange={(e) => updateAllergyItem(index, e.target.value)}
                            placeholder="Enter allergy"
                            className="flex-1"
                        />
                        <Button
                            icon="pi pi-trash"
                            className="p-button-sm p-button-danger"
                            onClick={() => removeAllergyItem(index)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card title="Patient Management" className="mb-4">
                    <DataTable
                        value={patients}
                        columns={patientTableColumns}
                        header={patientSearchHeader}
                        loading={loading}
                        emptyMessage="No patients found. Try searching by name or patient number."
                        className="p-datatable-sm"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        showGridlines
                    />
                </Card>
            </div>

            <Dialog
                header="Patient Details"
                visible={showPatientDialog}
                onHide={() => setShowPatientDialog(false)}
                style={{ width: '90vw', maxWidth: '1200px' }}
                maximizable
            >
                {patientDetailsContent()}
            </Dialog>

            <Dialog
                header="Create New Patient"
                visible={showCreateDialog}
                onHide={() => {
                    setShowCreateDialog(false);
                    resetNewPatient();
                }}
                style={{ width: '90vw', maxWidth: '800px' }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            onClick={() => {
                                setShowCreateDialog(false);
                                resetNewPatient();
                            }}
                            className="p-button-text"
                        />
                        <Button
                            label="Create Patient"
                            icon="pi pi-check"
                            onClick={createPatient}
                            loading={loading}
                            className="p-button-success"
                        />
                    </div>
                }
            >
                {createPatientDialogContent()}
            </Dialog>

            <Toast ref={(el) => setToast(el)} />
        </div>
    );
};

export default PatientManagement;
