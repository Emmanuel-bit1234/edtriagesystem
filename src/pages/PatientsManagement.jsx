import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Chip } from "primereact/chip";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import { Toolbar } from "primereact/toolbar";
import { SplitButton } from "primereact/splitbutton";
import { Menu } from "primereact/menu";
import { Badge } from "primereact/badge";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { TabView, TabPanel } from "primereact/tabview";
import { ScrollPanel } from "primereact/scrollpanel";
import { Chart } from "primereact/chart";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { ToggleButton } from "primereact/togglebutton";
import PatientAPI from "../service/patientAPI";

export const PatientsManagement = (props) => {
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patientDialog, setPatientDialog] = useState(false);
    const [deletePatientDialog, setDeletePatientDialog] = useState(false);
    const [patientDetailDialog, setPatientDetailDialog] = useState(false);
    const [patient, setPatient] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [stats, setStats] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
    const [filters, setFilters] = useState({
        gender: null,
        ageRange: [0, 100],
        hasAllergies: null,
        hasMedications: null
    });
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
    const [allergiesInput, setAllergiesInput] = useState('');
    const [medicationsInput, setMedicationsInput] = useState('');
    const toast = useRef(null);
    const patientAPI = new PatientAPI();

    // Gender options
    const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' }
    ];

    // Relationship options
    const relationshipOptions = [
        { label: 'Spouse', value: 'Spouse' },
        { label: 'Parent', value: 'Parent' },
        { label: 'Child', value: 'Child' },
        { label: 'Sibling', value: 'Sibling' },
        { label: 'Friend', value: 'Friend' },
        { label: 'Other', value: 'Other' }
    ];

    // Filter options
    const booleanOptions = [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
    ];

    useEffect(() => {
        fetchPatients();
        fetchStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, patients]);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await patientAPI.searchPatients();
            setPatients(response.patients || []);
            setFilteredPatients(response.patients || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setError('Failed to fetch patients');
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch patients',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await patientAPI.getPatientStats();
            setStats(response.stats);
            prepareChartData(response.stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const prepareChartData = (statsData) => {
        if (!statsData) return;

        // Gender distribution chart
        const genderLabels = Object.keys(statsData.genderDistribution);
        const genderValues = Object.values(statsData.genderDistribution);
        
        setChartData({
            labels: genderLabels.map(g => g.charAt(0).toUpperCase() + g.slice(1)),
            datasets: [
                {
                    data: genderValues,
                    backgroundColor: [
                        '#3B82F6', // Blue for Male
                        '#EC4899', // Pink for Female
                        '#8B5CF6'  // Purple for Other
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            ]
        });

        setChartOptions({
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            }
        });
    };

    const applyFilters = () => {
        let filtered = [...patients];

        // Gender filter
        if (filters.gender) {
            filtered = filtered.filter(p => p.gender === filters.gender);
        }

        // Age range filter
        filtered = filtered.filter(p => {
            const age = patientAPI.calculateAge(p.dateOfBirth);
            return age >= filters.ageRange[0] && age <= filters.ageRange[1];
        });

        // Allergies filter
        if (filters.hasAllergies !== null) {
            filtered = filtered.filter(p => {
                const hasAllergies = p.allergies && p.allergies.length > 0;
                return hasAllergies === filters.hasAllergies;
            });
        }

        // Medications filter
        if (filters.hasMedications !== null) {
            filtered = filtered.filter(p => {
                const hasMedications = p.medications && p.medications.length > 0;
                return hasMedications === filters.hasMedications;
            });
        }

        setFilteredPatients(filtered);
    };

    const openNew = () => {
        setPatient({
            patientNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            phoneNumber: '',
            email: '',
            address: '',
            emergencyContact: {
                name: '',
                relationship: '',
                phoneNumber: ''
            },
            medicalHistory: [],
            allergies: [],
            medications: [],
            insuranceInfo: {
                provider: '',
                policyNumber: ''
            }
        });
        setMedicalHistoryInput('');
        setAllergiesInput('');
        setMedicationsInput('');
        setSubmitted(false);
        setPatientDialog(true);
    };

    const editPatient = (patient) => {
        const formattedPatient = patientAPI.formatPatientForForm(patient);
        setPatient(formattedPatient);
        setMedicalHistoryInput('');
        setAllergiesInput('');
        setMedicationsInput('');
        setSubmitted(false);
        setPatientDialog(true);
    };

    // Helper functions for chip-based inputs
    const addMedicalHistory = () => {
        if (medicalHistoryInput.trim()) {
            const updatedHistory = [...(patient.medicalHistory || []), medicalHistoryInput.trim()];
            setPatient({ ...patient, medicalHistory: updatedHistory });
            setMedicalHistoryInput('');
        }
    };

    const removeMedicalHistory = (index) => {
        const updatedHistory = patient.medicalHistory.filter((_, i) => i !== index);
        setPatient({ ...patient, medicalHistory: updatedHistory });
    };

    const addAllergy = () => {
        if (allergiesInput.trim()) {
            const updatedAllergies = [...(patient.allergies || []), allergiesInput.trim()];
            setPatient({ ...patient, allergies: updatedAllergies });
            setAllergiesInput('');
        }
    };

    const removeAllergy = (index) => {
        const updatedAllergies = patient.allergies.filter((_, i) => i !== index);
        setPatient({ ...patient, allergies: updatedAllergies });
    };

    const addMedication = () => {
        if (medicationsInput.trim()) {
            const updatedMedications = [...(patient.medications || []), medicationsInput.trim()];
            setPatient({ ...patient, medications: updatedMedications });
            setMedicationsInput('');
        }
    };

    const removeMedication = (index) => {
        const updatedMedications = patient.medications.filter((_, i) => i !== index);
        setPatient({ ...patient, medications: updatedMedications });
    };

    const viewPatientDetails = (patient) => {
        setSelectedPatient(patient);
        setPatientDetailDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPatientDialog(false);
    };

    const hideDeletePatientDialog = () => {
        setDeletePatientDialog(false);
    };

    const hidePatientDetailDialog = () => {
        setPatientDetailDialog(false);
    };

    const savePatient = async () => {
        setSubmitted(true);

        // Validation
        if (!patient.firstName || !patient.lastName || 
            !patient.dateOfBirth || !patient.gender) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields'
            });
            return;
        }

        // Capitalize first letter of names
        const capitalizeName = (name) => {
            if (!name) return name;
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        };

        // Prepare patient data with capitalized names
        const patientData = {
            ...patient,
            firstName: capitalizeName(patient.firstName),
            lastName: capitalizeName(patient.lastName)
        };

        try {
            if (patient.id) {
                // Update existing patient - exclude patientNumber from update data
                const { patientNumber, ...updateData } = patientData;
                await patientAPI.updatePatient(patient.id, updateData);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Patient updated successfully'
                });
                
                // Wait 3 seconds for toast to show before closing dialog and refreshing
                setTimeout(() => {
                    hideDialog();
                    fetchPatients();
                    fetchStats();
                }, 3000);
            } else {
                // Create new patient
                await patientAPI.createPatient(patientData);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Patient added successfully'
                });
                
                // Wait 3 seconds for toast to show before closing dialog and refreshing
                setTimeout(() => {
                    hideDialog();
                    fetchPatients();
                    fetchStats();
                }, 3000);
            }
        } catch (error) {
            console.error('Error saving patient:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.error || 'Failed to save patient'
            });
        }
    };

    const confirmDeletePatient = (patient) => {
        setSelectedPatient(patient);
        setDeletePatientDialog(true);
    };

    const deletePatient = async () => {
        try {
            await patientAPI.deletePatient(selectedPatient.id);
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Patient deleted successfully'
            });
            
            // Wait 3 seconds for toast to show before closing dialog and refreshing
            setTimeout(() => {
                hideDeletePatientDialog();
                fetchPatients();
                fetchStats();
            }, 3000);
        } catch (error) {
            console.error('Error deleting patient:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete patient'
            });
        }
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setGlobalFilter(value);
        
        if (value === '') {
            applyFilters();
        } else {
            const filtered = filteredPatients.filter(patient => {
                const searchValue = value.toLowerCase();
                return (
                    patient.patientNumber?.toLowerCase().includes(searchValue) ||
                    patient.firstName?.toLowerCase().includes(searchValue) ||
                    patient.lastName?.toLowerCase().includes(searchValue) ||
                    patient.email?.toLowerCase().includes(searchValue) ||
                    patient.phoneNumber?.toLowerCase().includes(searchValue)
                );
            });
            setFilteredPatients(filtered);
        }
    };

    const clearFilters = () => {
        setFilters({
            gender: null,
            ageRange: [0, 100],
            hasAllergies: null,
            hasMedications: null
        });
        setGlobalFilter('');
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap">
                <Button
                    label="Add Patient"
                    icon="pi pi-plus"
                    className="p-button-success mr-3 mb-2 sm:mb-0"
                    onClick={openNew}
                />
                <Button
                    label="Statistics"
                    icon="pi pi-chart-bar"
                    className="p-button-outlined mb-2 sm:mb-0"
                    onClick={() => setShowStats(true)}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={onGlobalFilterChange}
                        placeholder="Search patients..."
                        className="w-20rem"
                    />
                </span>
            </div>
        );
    };

    const filterPanel = () => {
        return (
            <Card title="Filters" className="mb-2">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <div className="field mb-2">
                            <label htmlFor="genderFilter" className="font-semibold">Gender</label>
                            <Dropdown
                                id="genderFilter"
                                value={filters.gender}
                                options={[{ label: 'All', value: null }, ...genderOptions]}
                                onChange={(e) => setFilters({ ...filters, gender: e.value })}
                                placeholder="Select Gender"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="field mb-2">
                            <label htmlFor="allergiesFilter" className="font-semibold">Has Allergies</label>
                            <Dropdown
                                id="allergiesFilter"
                                value={filters.hasAllergies}
                                options={[{ label: 'All', value: null }, ...booleanOptions]}
                                onChange={(e) => setFilters({ ...filters, hasAllergies: e.value })}
                                placeholder="Select Option"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="field mb-2">
                            <label htmlFor="medicationsFilter" className="font-semibold">Has Medications</label>
                            <Dropdown
                                id="medicationsFilter"
                                value={filters.hasMedications}
                                options={[{ label: 'All', value: null }, ...booleanOptions]}
                                onChange={(e) => setFilters({ ...filters, hasMedications: e.value })}
                                placeholder="Select Option"
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="field mb-2">
                            <label htmlFor="ageRange" className="font-semibold">Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years</label>
                            <Slider
                                id="ageRange"
                                value={filters.ageRange}
                                onChange={(e) => setFilters({ ...filters, ageRange: e.value })}
                                range
                                min={0}
                                max={100}
                                step={1}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-content-end mt-2">
                    <Button
                        label="Clear Filters"
                        icon="pi pi-filter-slash"
                        className="p-button-outlined p-button-sm"
                        onClick={clearFilters}
                    />
                </div>
            </Card>
        );
    };

    const patientNumberBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center">
                <Avatar
                    label={rowData.firstName?.charAt(0) + rowData.lastName?.charAt(0)}
                    className="mr-3"
                    style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                    size="small"
                />
                <span className="font-semibold text-blue-600">
                    {rowData.patientNumber}
                </span>
            </div>
        );
    };

    const nameBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-semibold text-900 mb-1">{rowData.firstName} {rowData.lastName}</div>
                <div className="text-sm text-500">{rowData.email}</div>
            </div>
        );
    };

    const genderBodyTemplate = (rowData) => {
        const getGenderIcon = (gender) => {
            switch (gender) {
                case 'male': return 'pi pi-mars';
                case 'female': return 'pi pi-venus';
                default: return 'pi pi-question';
            }
        };

        const getGenderColor = (gender) => {
            switch (gender) {
                case 'male': return 'blue';
                case 'female': return 'pink';
                default: return 'gray';
            }
        };

        return (
            <div className="flex align-items-center gap-2">
                <i className={`${getGenderIcon(rowData.gender)} text-${getGenderColor(rowData.gender)}-500`}></i>
                <span className="capitalize">{rowData.gender}</span>
            </div>
        );
    };

    const ageBodyTemplate = (rowData) => {
        const age = patientAPI.calculateAge(rowData.dateOfBirth);
        const detailedAge = patientAPI.calculateDetailedAge(rowData.dateOfBirth);
        const ageGroup = age < 18 ? 'Pediatric' : age < 65 ? 'Adult' : 'Elderly';
        const ageGroupColor = age < 18 ? 'orange' : age < 65 ? 'green' : 'blue';
        
        return (
            <div className="flex align-items-center">
                <span className="font-semibold mr-2">{detailedAge}</span>
                <Tag value={ageGroup} severity={ageGroupColor} />
            </div>
        );
    };

    const allergiesBodyTemplate = (rowData) => {
        if (!rowData.allergies || rowData.allergies.length === 0) {
            return <span className="text-400">None</span>;
        }
        
        return (
            <div className="flex flex-wrap">
                {rowData.allergies.slice(0, 2).map((allergy, index) => (
                    <Chip key={index} label={allergy} className="text-xs mr-2" />
                ))}
                {rowData.allergies.length > 2 && (
                    <Chip label={`+${rowData.allergies.length - 2}`} className="text-xs" />
                )}
            </div>
        );
    };

    const medicationsBodyTemplate = (rowData) => {
        if (!rowData.medications || rowData.medications.length === 0) {
            return <span className="text-400">None</span>;
        }
        
        return (
            <div className="flex flex-wrap">
                {rowData.medications.slice(0, 2).map((medication, index) => (
                    <Chip key={index} label={medication} className="text-xs mr-2" />
                ))}
                {rowData.medications.length > 2 && (
                    <Chip label={`+${rowData.medications.length - 2}`} className="text-xs" />
                )}
            </div>
        );
    };

    const createdAtBodyTemplate = (rowData) => {
        return (
            <div>
                <div className="font-semibold mb-1">{patientAPI.formatDate(rowData.createdAt)}</div>
                <div className="text-sm text-500">{patientAPI.formatDateTime(rowData.createdAt).split(' ')[1]}</div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded mr-2"
                    onClick={() => viewPatientDetails(rowData)}
                    tooltip="View Details"
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded mr-2"
                    onClick={() => editPatient(rowData)}
                    tooltip="Edit Patient"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded mr-2 p-button-danger"
                    onClick={() => confirmDeletePatient(rowData)}
                    tooltip="Delete Patient"
                />
            </div>
        );
    };

    const patientDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                onClick={savePatient}
            />
        </div>
    );

    const deletePatientDialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDeletePatientDialog}
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                className="p-button-danger"
                onClick={deletePatient}
            />
        </div>
    );

    const patientDetailDialogContent = () => {
        if (!selectedPatient) return null;

        return (
            <TabView>
                <TabPanel header="Basic Information">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Patient Number</label>
                                <p>{selectedPatient.patientNumber}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Name</label>
                                <p>{selectedPatient.firstName} {selectedPatient.lastName}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Gender</label>
                                <p className="capitalize">{selectedPatient.gender}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Age</label>
                                <p>{patientAPI.calculateDetailedAge(selectedPatient.dateOfBirth)}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Email</label>
                                <p>{selectedPatient.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Phone</label>
                                <p>{selectedPatient.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Address</label>
                                <p>{selectedPatient.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Medical Information">
                    <div className="grid">
                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Medical History</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedPatient.medicalHistory?.length > 0 ? 
                                        selectedPatient.medicalHistory.map((history, index) => (
                                            <Chip key={index} label={history} className="mr-2" />
                                        )) : 
                                        <span className="text-400">No medical history recorded</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Allergies</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedPatient.allergies?.length > 0 ? 
                                        selectedPatient.allergies.map((allergy, index) => (
                                            <Chip key={index} label={allergy} className="p-chip-danger mr-2" />
                                        )) : 
                                        <span className="text-400">No known allergies</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Current Medications</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedPatient.medications?.length > 0 ? 
                                        selectedPatient.medications.map((medication, index) => (
                                            <Chip key={index} label={medication} className="p-chip-success mr-2" />
                                        )) : 
                                        <span className="text-400">No current medications</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Emergency Contact">
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Name</label>
                                <p>{selectedPatient.emergencyContact?.name || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Relationship</label>
                                <p>{selectedPatient.emergencyContact?.relationship || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label className="font-semibold">Phone Number</label>
                                <p>{selectedPatient.emergencyContact?.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                
                <TabPanel header="Insurance">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Provider</label>
                                <p>{selectedPatient.insuranceInfo?.provider || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-semibold">Policy Number</label>
                                <p>{selectedPatient.insuranceInfo?.policyNumber || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        );
    };

    const statsDialog = () => {
        if (!stats) return null;

        return (
            <Dialog
                header="Patient Statistics Dashboard"
                visible={showStats}
                style={{ width: '95vw', maxWidth: '1200px' }}
                onHide={() => setShowStats(false)}
                maximizable
            >
                <div className="grid">
                    {/* Enhanced Statistics Cards */}
                    <div className="col-12">
                        <div className="grid">
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-blue-200 bg-blue-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-users text-blue-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-blue-600">
                                            {stats.totalPatients}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-blue-800 mb-1">Total Patients</div>
                                    <div className="text-sm text-blue-600">All registered patients</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-green-200 bg-green-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-user-plus text-green-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-green-600">
                                            {stats.recentRegistrations}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-green-800 mb-1">Recent Registrations</div>
                                    <div className="text-sm text-green-600">Last 30 days</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-orange-200 bg-orange-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-heart text-orange-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-orange-600">
                                            {stats.ageGroups?.pediatric || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-orange-800 mb-1">Pediatric Patients</div>
                                    <div className="text-sm text-orange-600">Under 18 years</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-purple-200 bg-purple-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-star text-purple-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-purple-600">
                                            {stats.ageGroups?.elderly || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-purple-800 mb-1">Elderly Patients</div>
                                    <div className="text-sm text-purple-600">65+ years</div>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Additional Statistics Row */}
                    <div className="col-12">
                        <div className="grid">
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-red-200 bg-red-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-exclamation-triangle text-red-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-red-600">
                                            {stats.commonAllergies?.filter(item => item.allergy && item.allergy.toLowerCase() !== 'none').length || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-red-800 mb-1">Allergy Cases</div>
                                    <div className="text-sm text-red-600">Patients with allergies</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-indigo-200 bg-indigo-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-capsule text-indigo-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-indigo-600">
                                            {stats.commonMedications?.filter(item => item.medication && item.medication.toLowerCase() !== 'none').length || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-indigo-800 mb-1">Medication Cases</div>
                                    <div className="text-sm text-indigo-600">Patients on medications</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-teal-200 bg-teal-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-mars text-teal-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-teal-600">
                                            {stats.genderDistribution?.male || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-teal-800 mb-1">Male Patients</div>
                                    <div className="text-sm text-teal-600">Gender distribution</div>
                                </Card>
                            </div>
                            <div className="col-12 sm:col-6 lg:col-3">
                                <Card className="text-center border-1 border-pink-200 bg-pink-50">
                                    <div className="flex align-items-center justify-content-center mb-3">
                                        <i className="pi pi-venus text-pink-600 text-2xl mr-2"></i>
                                        <div className="text-4xl font-bold text-pink-600">
                                            {stats.genderDistribution?.female || 0}
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-pink-800 mb-1">Female Patients</div>
                                    <div className="text-sm text-pink-600">Gender distribution</div>
                                </Card>
                            </div>
                        </div>
                    </div>
                    
                    {/* Charts Section */}
                    <div className="col-12">
                        <Card title="Age Groups" className="h-full">
                            <div className="space-y-4">
                                {Object.entries(stats.ageGroups || {}).map(([group, count]) => {
                                    const percentage = stats.totalPatients > 0 ? Math.round((count / stats.totalPatients) * 100) : 0;
                                    const getSeverity = (group) => {
                                        switch(group) {
                                            case 'pediatric': return 'warning';
                                            case 'adult': return 'success';
                                            case 'elderly': return 'info';
                                            default: return 'secondary';
                                        }
                                    };
                                    const getIcon = (group) => {
                                        switch(group) {
                                            case 'pediatric': return 'pi pi-heart';
                                            case 'adult': return 'pi pi-user';
                                            case 'elderly': return 'pi pi-star';
                                            default: return 'pi pi-circle';
                                        }
                                    };
                                    
                                    return (
                                        <div key={group} className="flex justify-content-between align-items-center p-4 border-1 border-round surface-100 mb-4">
                                            <div className="flex align-items-center">
                                                <i className={`${getIcon(group)} text-2xl mr-4 text-${getSeverity(group)}-600`}></i>
                                                <div className="flex flex-column">
                                                    <span className="capitalize font-semibold text-lg">{group}</span>
                                                    <span className="text-sm text-500">{count} patients</span>
                                                </div>
                                            </div>
                                            <div className="flex align-items-center">
                                                <ProgressBar
                                                    value={percentage}
                                                    style={{ width: '140px', height: '14px' }}
                                                    showValue={false}
                                                />
                                                <div className="ml-4">
                                                    <Badge value={`${percentage}%`} severity={getSeverity(group)} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!stats.ageGroups || Object.keys(stats.ageGroups).length === 0) && (
                                    <div className="text-center text-500 py-8">
                                        <i className="pi pi-chart-bar text-4xl mb-3"></i>
                                        <div>No age group data available</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </Dialog>
        );
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <Skeleton height="2rem" className="mb-2" />
                        <Skeleton height="200px" />
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />
                
                {/* Header */}
                <div className="flex justify-content-between align-items-center mb-3">
                    <div>
                        <h1 className="text-3xl font-bold text-900 m-0">Patients Management</h1>
                        <p className="text-600 mt-1 mb-0">Manage patient records and medical information</p>
                    </div>
                    <div className="flex align-items-center">
                        <div className="bg-blue-50 border-round px-4 py-3 flex align-items-center">
                            <i className="pi pi-users text-blue-600 mr-3"></i>
                            <span className="text-blue-900 font-semibold mr-2">{filteredPatients.length}</span>
                            <span className="text-blue-700">
                                {filteredPatients.length === 1 ? 'Patient Found' : 'Patients Found'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                {filterPanel()}

                {/* Main Content */}
                <Card className="mt-0">
                    <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate} className="mb-3" />
                    
                    <DataTable
                        value={filteredPatients}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        selectionMode="single"
                        dataKey="id"
                        emptyMessage="No patients found."
                        loading={loading}
                        responsiveLayout="scroll"
                        showGridlines
                        stripedRows
                    >
                        <Column
                            field="patientNumber"
                            header="Patient"
                            sortable
                            body={patientNumberBodyTemplate}
                            style={{ minWidth: '140px' }}
                        />
                        <Column
                            field="firstName"
                            header="Name & Contact"
                            sortable
                            body={nameBodyTemplate}
                            style={{ minWidth: '180px' }}
                        />
                        <Column
                            field="gender"
                            header="Gender"
                            sortable
                            body={genderBodyTemplate}
                            style={{ minWidth: '90px' }}
                        />
                        <Column
                            field="dateOfBirth"
                            header="Age"
                            sortable
                            body={ageBodyTemplate}
                            style={{ minWidth: '110px' }}
                        />
                        <Column
                            field="allergies"
                            header="Allergies"
                            body={allergiesBodyTemplate}
                            style={{ minWidth: '130px' }}
                        />
                        <Column
                            field="medications"
                            header="Medications"
                            body={medicationsBodyTemplate}
                            style={{ minWidth: '130px' }}
                        />
                        <Column
                            field="createdAt"
                            header="Created"
                            sortable
                            body={createdAtBodyTemplate}
                            style={{ minWidth: '110px' }}
                        />
                        <Column
                            header="Actions"
                            body={actionBodyTemplate}
                            exportable={false}
                            style={{ minWidth: '120px' }}
                        />
                    </DataTable>
                </Card>

                {/* Patient Dialog */}
                <Dialog
                    visible={patientDialog}
                    style={{ width: '90vw', maxWidth: '800px' }}
                    header={patient.id ? 'Edit Patient' : 'Add Patient'}
                    modal
                    className="p-fluid"
                    footer={patientDialogFooter}
                    onHide={hideDialog}
                    maximizable
                >
                    <TabView>
                        <TabPanel header="Basic Information">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="gender">Gender *</label>
                                        <Dropdown
                                            id="gender"
                                            value={patient.gender}
                                            options={genderOptions}
                                            onChange={(e) => setPatient({ ...patient, gender: e.value })}
                                            placeholder="Select Gender"
                                            required
                                            className={submitted && !patient.gender ? 'p-invalid' : ''}
                                        />
                                        {submitted && !patient.gender && (
                                            <small className="p-error">Gender is required.</small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="firstName">First Name *</label>
                                        <InputText
                                            id="firstName"
                                            value={patient.firstName}
                                            onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
                                            required
                                            className={submitted && !patient.firstName ? 'p-invalid' : ''}
                                        />
                                        {submitted && !patient.firstName && (
                                            <small className="p-error">First Name is required.</small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="lastName">Last Name *</label>
                                        <InputText
                                            id="lastName"
                                            value={patient.lastName}
                                            onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
                                            required
                                            className={submitted && !patient.lastName ? 'p-invalid' : ''}
                                        />
                                        {submitted && !patient.lastName && (
                                            <small className="p-error">Last Name is required.</small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="dateOfBirth">Date of Birth *</label>
                                        <Calendar
                                            id="dateOfBirth"
                                            value={patient.dateOfBirth ? new Date(patient.dateOfBirth) : null}
                                            onChange={(e) => setPatient({ ...patient, dateOfBirth: e.value ? e.value.toISOString().split('T')[0] : '' })}
                                            dateFormat="yy-mm-dd"
                                            showIcon
                                            yearRange="1800:2030"
                                            showButtonBar
                                            yearNavigator
                                            monthNavigator
                                            todayButtonClassName="p-hidden"
                                            required
                                            disabled={!!patient.id}
                                            className={submitted && !patient.dateOfBirth ? 'p-invalid' : ''}
                                        />
                                        {submitted && !patient.dateOfBirth && (
                                            <small className="p-error">Date of Birth is required.</small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="phoneNumber">Phone Number</label>
                                        <InputText
                                            id="phoneNumber"
                                            value={patient.phoneNumber}
                                            onChange={(e) => setPatient({ ...patient, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="email">Email</label>
                                        <InputText
                                            id="email"
                                            value={patient.email}
                                            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="address">Address</label>
                                        <InputTextarea
                                            id="address"
                                            value={patient.address}
                                            onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Emergency Contact">
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label htmlFor="emergencyName">Name</label>
                                        <InputText
                                            id="emergencyName"
                                            value={patient.emergencyContact?.name || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, name: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label htmlFor="emergencyRelationship">Relationship</label>
                                        <Dropdown
                                            id="emergencyRelationship"
                                            value={patient.emergencyContact?.relationship || ''}
                                            options={relationshipOptions}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, relationship: e.value }
                                            })}
                                            placeholder="Select Relationship"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label htmlFor="emergencyPhone">Phone Number</label>
                                        <InputText
                                            id="emergencyPhone"
                                            value={patient.emergencyContact?.phoneNumber || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, phoneNumber: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Medical Information">
                            <div className="grid">
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="medicalHistory">Medical History</label>
                                        <div className="flex flex-column gap-2">
                                            <div className="flex">
                                                <InputText
                                                    id="medicalHistory"
                                                    value={medicalHistoryInput}
                                                    onChange={(e) => setMedicalHistoryInput(e.target.value)}
                                                    placeholder="Enter a medical condition and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addMedicalHistory();
                                                        }
                                                    }}
                                                    className="mr-3"
                                                />
                                                <Button
                                                    icon="pi pi-plus"
                                                    className="p-button-outlined"
                                                    onClick={addMedicalHistory}
                                                    tooltip="Add condition"
                                                />
                                            </div>
                                            <div className="flex flex-wrap mt-3">
                                                {patient.medicalHistory?.map((condition, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={condition}
                                                        removable
                                                        onRemove={() => removeMedicalHistory(index)}
                                                        className="mr-2 mb-2"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="allergies">Allergies</label>
                                        <div className="flex flex-column gap-2">
                                            <div className="flex">
                                                <InputText
                                                    id="allergies"
                                                    value={allergiesInput}
                                                    onChange={(e) => setAllergiesInput(e.target.value)}
                                                    placeholder="Enter an allergy and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addAllergy();
                                                        }
                                                    }}
                                                    className="mr-3"
                                                />
                                                <Button
                                                    icon="pi pi-plus"
                                                    className="p-button-outlined"
                                                    onClick={addAllergy}
                                                    tooltip="Add allergy"
                                                />
                                            </div>
                                            <div className="flex flex-wrap mt-3">
                                                {patient.allergies?.map((allergy, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={allergy}
                                                        removable
                                                        onRemove={() => removeAllergy(index)}
                                                        className="p-chip-danger mr-2 mb-2"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="medications">Current Medications</label>
                                        <div className="flex flex-column gap-2">
                                            <div className="flex">
                                                <InputText
                                                    id="medications"
                                                    value={medicationsInput}
                                                    onChange={(e) => setMedicationsInput(e.target.value)}
                                                    placeholder="Enter a medication and press Enter"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addMedication();
                                                        }
                                                    }}
                                                    className="mr-3"
                                                />
                                                <Button
                                                    icon="pi pi-plus"
                                                    className="p-button-outlined"
                                                    onClick={addMedication}
                                                    tooltip="Add medication"
                                                />
                                            </div>
                                            <div className="flex flex-wrap mt-3">
                                                {patient.medications?.map((medication, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={medication}
                                                        removable
                                                        onRemove={() => removeMedication(index)}
                                                        className="p-chip-success mr-2 mb-2"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Insurance">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="insuranceProvider">Provider</label>
                                        <InputText
                                            id="insuranceProvider"
                                            value={patient.insuranceInfo?.provider || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                insuranceInfo: { ...patient.insuranceInfo, provider: e.target.value }
                                            })}
                                            placeholder="e.g., Blue Cross, Aetna"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="policyNumber">Policy Number</label>
                                        <InputText
                                            id="policyNumber"
                                            value={patient.insuranceInfo?.policyNumber || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                insuranceInfo: { ...patient.insuranceInfo, policyNumber: e.target.value }
                                            })}
                                            placeholder="e.g., BC123456789"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </Dialog>

                {/* Patient Detail Dialog */}
                <Dialog
                    visible={patientDetailDialog}
                    style={{ width: '90vw', maxWidth: '800px' }}
                    header={`Patient Details - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
                    modal
                    onHide={hidePatientDetailDialog}
                    maximizable
                >
                    {patientDetailDialogContent()}
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    visible={deletePatientDialog}
                    style={{ width: '450px' }}
                    header="Confirm Deletion"
                    modal
                    footer={deletePatientDialogFooter}
                    onHide={hideDeletePatientDialog}
                >
                    <div className="flex align-items-center justify-content-center">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {selectedPatient && (
                            <span>
                                Are you sure you want to delete <b>{selectedPatient.firstName} {selectedPatient.lastName}</b>?
                                This action cannot be undone.
                            </span>
                        )}
                    </div>
                </Dialog>

                {/* Statistics Dialog */}
                {statsDialog()}
            </div>
        </div>
    );
};
