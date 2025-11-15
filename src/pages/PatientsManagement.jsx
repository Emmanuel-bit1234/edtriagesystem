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
import { ProgressSpinner } from "primereact/progressspinner";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import PatientAPI from "../service/patientAPI";
import PhoneInput from "../componets/PhoneInput";

// Country codes mapping
const countryCodesList = [
    { value: '+27', iso: 'ZA', maxLength: 9 },
    { value: '+266', iso: 'LS', maxLength: 8 },
    { value: '+1', iso: 'US', maxLength: 10 },
    { value: '+44', iso: 'GB', maxLength: 10 },
    { value: '+234', iso: 'NG', maxLength: 10 },
    { value: '+254', iso: 'KE', maxLength: 9 },
    { value: '+233', iso: 'GH', maxLength: 9 },
    { value: '+267', iso: 'BW', maxLength: 8 },
    { value: '+268', iso: 'SZ', maxLength: 8 },
    { value: '+263', iso: 'ZW', maxLength: 9 },
    { value: '+260', iso: 'ZM', maxLength: 9 },
    { value: '+258', iso: 'MZ', maxLength: 9 },
    { value: '+265', iso: 'MW', maxLength: 9 },
    { value: '+255', iso: 'TZ', maxLength: 9 },
    { value: '+256', iso: 'UG', maxLength: 9 },
    { value: '+250', iso: 'RW', maxLength: 9 },
    { value: '+251', iso: 'ET', maxLength: 10 },
    { value: '+20', iso: 'EG', maxLength: 10 },
    { value: '+91', iso: 'IN', maxLength: 10 },
    { value: '+86', iso: 'CN', maxLength: 11 },
    { value: '+61', iso: 'AU', maxLength: 9 },
    { value: '+1', iso: 'CA', maxLength: 10 },
    { value: '+49', iso: 'DE', maxLength: 11 },
    { value: '+33', iso: 'FR', maxLength: 9 },
    { value: '+34', iso: 'ES', maxLength: 9 },
    { value: '+39', iso: 'IT', maxLength: 10 },
    { value: '+55', iso: 'BR', maxLength: 11 },
    { value: '+52', iso: 'MX', maxLength: 10 },
    { value: '+54', iso: 'AR', maxLength: 10 },
    { value: '+90', iso: 'TR', maxLength: 10 },
];

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
    const [newNoteInput, setNewNoteInput] = useState('');
    const [notesExpanded, setNotesExpanded] = useState(false);
    const [detailNotesExpanded, setDetailNotesExpanded] = useState(false);
    const [patientVisits, setPatientVisits] = useState(null);
    const [loadingVisits, setLoadingVisits] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [showVisitDetails, setShowVisitDetails] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [patientCountryCode, setPatientCountryCode] = useState('+27');
    const [emergencyContactCountryCode, setEmergencyContactCountryCode] = useState('+27');
    const toast = useRef(null);
    const patientAPI = new PatientAPI();

    // Check if current user is admin
    const isAdminUser = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return false;
        try {
            const userData = JSON.parse(storedUser);
            return userData.name === 'Admin' || 
                   userData.username === 'Admin' || 
                   userData.email === 'Admin@edtriage.co.za';
        } catch (error) {
            return false;
        }
    };

    // Validate email
    const validateEmail = (email) => {
        if (!email || email.trim() === '') return true; // Allow empty email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate phone number
    const validatePhoneNumber = (phoneNumber, countryCode) => {
        if (!phoneNumber || phoneNumber.trim() === '') return true; // Allow empty phone
        if (!countryCode) return true;
        
        try {
            const countryInfo = countryCodesList.find(c => c.value === countryCode);
            if (!countryInfo) return true;
            
            // Check minimum length (at least 7 digits for most countries)
            const minLength = Math.max(7, Math.floor(countryInfo.maxLength * 0.7));
            if (phoneNumber.length < minLength) {
                return false;
            }
            
            const fullNumber = `${countryCode}${phoneNumber}`;
            const parsed = parsePhoneNumberFromString(fullNumber, countryInfo.iso);
            return parsed ? parsed.isValid() : false;
        } catch (error) {
            return false;
        }
    };

    // Handle email change with validation
    const handleEmailChange = (value) => {
        setPatient({ ...patient, email: value });
        if (value && value.trim() !== '') {
            if (!validateEmail(value)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        } else {
            setEmailError('');
        }
    };

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
            },
            notes: []
        });
        setMedicalHistoryInput('');
        setAllergiesInput('');
        setMedicationsInput('');
        setNewNoteInput('');
        setNotesExpanded(false);
        setSubmitted(false);
        setPatientCountryCode('+27');
        setEmergencyContactCountryCode('+27');
        setPatientDialog(true);
    };

    const editPatient = (patientData) => {
        const formattedPatient = patientAPI.formatPatientForForm(patientData);
        
        // Parse country code from existing phone numbers
        let countryCode = '+27';
        let emergencyCountryCode = '+27';
        
        if (formattedPatient.phoneNumber && formattedPatient.phoneNumber.startsWith('+')) {
            const match = formattedPatient.phoneNumber.match(/^(\+\d{1,3})/);
            if (match) {
                countryCode = match[1];
                // Extract just the number part (without country code)
                formattedPatient.phoneNumber = formattedPatient.phoneNumber.substring(match[1].length).trim();
            }
        }
        
        if (formattedPatient.emergencyContact?.phoneNumber && formattedPatient.emergencyContact.phoneNumber.startsWith('+')) {
            const match = formattedPatient.emergencyContact.phoneNumber.match(/^(\+\d{1,3})/);
            if (match) {
                emergencyCountryCode = match[1];
                // Extract just the number part (without country code)
                formattedPatient.emergencyContact.phoneNumber = formattedPatient.emergencyContact.phoneNumber.substring(match[1].length).trim();
            }
        }
        
        setPatient(formattedPatient);
        setMedicalHistoryInput('');
        setAllergiesInput('');
        setMedicationsInput('');
        setNewNoteInput('');
        setSubmitted(false);
        setPatientCountryCode(countryCode);
        setEmergencyContactCountryCode(emergencyCountryCode);
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

    const addNote = () => {
        if (newNoteInput.trim()) {
            const newNote = {
                content: newNoteInput.trim()
            };
            const updatedNotes = [...(patient.notes || []), newNote];
            setPatient({ ...patient, notes: updatedNotes });
            setNewNoteInput('');
        }
    };

    const removeNote = (index) => {
        const updatedNotes = patient.notes.filter((_, i) => i !== index);
        setPatient({ ...patient, notes: updatedNotes });
    };

    const viewPatientDetails = async (patient) => {
        // Fetch full patient data with notes
        try {
            const fullPatientData = await patientAPI.getPatientById(patient.id);
            setSelectedPatient(fullPatientData.patient || patient);
        } catch (error) {
            console.error('Error fetching patient details:', error);
            setSelectedPatient(patient);
        }
        setDetailNotesExpanded(false);
        setPatientDetailDialog(true);
        
        // Load patient visits
        try {
            setLoadingVisits(true);
            const visitsData = await patientAPI.getPatientVisits(patient.patientNumber);
            setPatientVisits(visitsData);
        } catch (error) {
            console.error('Error fetching patient visits:', error);
            setPatientVisits({ visits: [], totalVisits: 0 });
        } finally {
            setLoadingVisits(false);
        }
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
        // Validate email
        if (patient.email && patient.email.trim() !== '' && !validateEmail(patient.email)) {
            setEmailError('Please enter a valid email address');
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please enter a valid email address'
            });
            return;
        }

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

        // Validate phone numbers if provided
        if (patient.phoneNumber && !validatePhoneNumber(patient.phoneNumber, patientCountryCode)) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please enter a valid phone number (minimum 7 digits)'
            });
            return;
        }

        if (patient.emergencyContact?.phoneNumber && !validatePhoneNumber(patient.emergencyContact.phoneNumber, emergencyContactCountryCode)) {
            toast.current.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please enter a valid emergency contact phone number (minimum 7 digits)'
            });
            return;
        }

        // Capitalize first letter of names
        const capitalizeName = (name) => {
            if (!name) return name;
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        };

        // Concatenate country codes with phone numbers
        const fullPhoneNumber = patient.phoneNumber 
            ? `${patientCountryCode}${patient.phoneNumber}` 
            : '';
        
        const fullEmergencyPhoneNumber = patient.emergencyContact?.phoneNumber 
            ? `${emergencyContactCountryCode}${patient.emergencyContact.phoneNumber}` 
            : '';

        // Prepare patient data with capitalized names and full phone numbers
        const patientData = {
            ...patient,
            firstName: capitalizeName(patient.firstName),
            lastName: capitalizeName(patient.lastName),
            phoneNumber: fullPhoneNumber,
            emergencyContact: {
                ...patient.emergencyContact,
                phoneNumber: fullEmergencyPhoneNumber
            }
        };

        try {
            if (patient.id) {
                // Update existing patient - exclude patientNumber from update data
                const { patientNumber, ...updateData } = patientData;
                
                // Handle notes for updates
                if (updateData.notes && updateData.notes.length > 0) {
                    // Separate existing notes (with id) from new notes (without id)
                    const newNotes = updateData.notes.filter(note => note.content && !note.id);
                    
                    if (newNotes.length > 0) {
                        // We have new notes to add
                        // Use newNote field for the latest note (API will append it)
                        // If there are multiple new notes, we'll send them one by one
                        // Start with the first new note
                        const firstNewNote = newNotes[0].content;
                        updateData.newNote = firstNewNote;
                        delete updateData.notes;
                        
                        // Update patient with first note
                        await patientAPI.updatePatient(patient.id, updateData);
                        
                        // If there are more new notes, add them sequentially
                        if (newNotes.length > 1) {
                            for (let i = 1; i < newNotes.length; i++) {
                                await patientAPI.updatePatient(patient.id, {
                                    newNote: newNotes[i].content
                                });
                            }
                        }
                    } else {
                        // No new notes - remove notes from update
                        delete updateData.notes;
                        await patientAPI.updatePatient(patient.id, updateData);
                    }
                } else {
                    // No notes in update data - remove it
                    delete updateData.notes;
                    await patientAPI.updatePatient(patient.id, updateData);
                }
                
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
                }, 1500);
            } else {
                // Create new patient
                // For new patients, include notes array if it has content
                const createData = { ...patientData };
                if (createData.notes && createData.notes.length > 0) {
                    // Filter out empty notes and ensure they have content
                    createData.notes = createData.notes.filter(note => note.content && note.content.trim());
                } else {
                    // Remove empty notes array
                    delete createData.notes;
                }
                
                await patientAPI.createPatient(createData);
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
                }, 1500);
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
            }, 1500);
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
                disabled={!!emailError}
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
                
                <TabPanel header="ED Visits">
                    {loadingVisits ? (
                        <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                            <ProgressSpinner />
                        </div>
                    ) : (
                        <div className="grid">
                            {patientVisits?.visits && patientVisits.visits.length > 0 && (
                                <div className="col-12">
                                    <div className="mb-3">
                                        <Badge value={patientVisits.totalVisits} severity="info" />
                                        <span className="ml-2 text-lg font-semibold">Total ED Visits</span>
                                    </div>
                                </div>
                            )}
                            <div className="col-12">
                                {patientVisits?.visits && patientVisits.visits.length > 0 ? (
                                    <DataTable
                                        value={patientVisits.visits}
                                        paginator
                                        rows={10}
                                        className="datatable-responsive"
                                        emptyMessage="No ED visits found."
                                        resizableColumns
                                        columnResizeMode="expand"
                                        responsiveLayout="scroll"
                                    >
                                        <Column field="ktasExplained.Level" header="Level" sortable 
                                            body={(rowData) => <b>{rowData.ktasExplained?.Level}</b>}
                                            style={{ minWidth: '80px' }}
                                        />
                                        <Column field="ktasExplained.Title" header="Title" sortable
                                            body={(rowData) => (
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        textAlign: "center",
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "20px",
                                                        backgroundColor: (() => {
                                                            switch (rowData.ktasExplained?.Title) {
                                                                case "Resuscitation":
                                                                    return "red";
                                                                case "Emergency":
                                                                    return "orange";
                                                                case "Urgent":
                                                                    return "yellow";
                                                                case "Less Urgent":
                                                                    return "green";
                                                                case "Non-Urgent":
                                                                    return "blue";
                                                                default:
                                                                    return "grey";
                                                            }
                                                        })(),
                                                        color: rowData.ktasExplained?.Title === "Urgent" ? "#333333" : "white",
                                                        fontWeight: "bold",
                                                        fontSize: "0.9rem"
                                                    }}
                                                >
                                                    <b>{rowData.ktasExplained?.Title}</b>
                                                </span>
                                            )}
                                            style={{ minWidth: '150px' }}
                                        />
                                        <Column field="ktasExplained.Meaning" header="Meaning" 
                                            body={(rowData) => (
                                                <div
                                                    style={{
                                                        maxWidth: '300px',
                                                        wordWrap: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}
                                                    title={rowData.ktasExplained?.Meaning}
                                                >
                                                    {rowData.ktasExplained?.Meaning}
                                                </div>
                                            )}
                                            style={{ minWidth: '200px' }}
                                        />
                                        <Column field="inputs.Chief_complain" header="Chief Complaint"
                                            body={(rowData) => (
                                                <div
                                                    style={{
                                                        maxWidth: '200px',
                                                        wordWrap: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: '1.4'
                                                    }}
                                                >
                                                    {rowData.inputs?.Chief_complain}
                                                </div>
                                            )}
                                            style={{ minWidth: '150px' }}
                                        />
                                        <Column field="createdAt" header="Created Date" sortable
                                            body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
                                            style={{ minWidth: '180px' }}
                                        />
                                        {isAdminUser() && (
                                            <Column field="user.name" header="Nurse" 
                                                body={(rowData) => <b>{rowData.user?.name}</b>}
                                                style={{ minWidth: '120px' }}
                                            />
                                        )}
                                        {isAdminUser() && (
                                            <Column field="user.id" header="Nurse ID" 
                                                body={(rowData) => <b>{rowData.user?.id}</b>}
                                                style={{ minWidth: '100px' }}
                                            />
                                        )}
                                        <Column
                                            header="Action"
                                            body={(rowData) => (
                                                <Button
                                                    icon="pi pi-eye"
                                                    className="p-button-rounded mr-2"
                                                    tooltip="View Visit Details"
                                                    onClick={() => {
                                                        setSelectedVisit(rowData);
                                                        setShowVisitDetails(true);
                                                    }}
                                                />
                                            )}
                                            style={{ minWidth: '80px' }}
                                        />
                                    </DataTable>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-400">No ED visits found for this patient.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </TabPanel>
                
                <TabPanel header="Clinical Notes">
                    <div className="grid">
                        <div className="col-12">
                            <div className="field">
                                <label className="font-semibold">Clinical Notes</label>
                                <div className="flex flex-column mt-3">
                                    {selectedPatient.notes && selectedPatient.notes.length > 0 ? (
                                        <>
                                            {(detailNotesExpanded ? selectedPatient.notes : selectedPatient.notes.slice(0, 3)).map((note, index) => (
                                                <Card key={note.id || index} className="surface-50" style={{ marginBottom: index < (detailNotesExpanded ? selectedPatient.notes.length : Math.min(selectedPatient.notes.length, 3)) - 1 ? '1.5rem' : '0' }}>
                                                    <div className="mb-2">
                                                        <p className="m-0 text-900" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                    {note.author && (
                                                        <div className="flex align-items-center mt-2 pt-2 border-top-1 surface-border">
                                                            <i className="pi pi-user text-500 mr-2"></i>
                                                            <span className="text-sm text-600 font-semibold">{note.author.name}</span>
                                                            {note.author.email && (
                                                                <span className="text-sm text-500 ml-1">({note.author.email})</span>
                                                            )}
                                                            {note.createdAt && (
                                                                <>
                                                                    <i className="pi pi-calendar text-500 ml-3 mr-2"></i>
                                                                    <span className="text-sm text-600">
                                                                        {patientAPI.formatDateTime(note.createdAt)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </Card>
                                            ))}
                                            {selectedPatient.notes.length > 3 && (
                                                <div className="mt-3">
                                                    <Button
                                                        label={detailNotesExpanded ? "Show Less" : `Show All (${selectedPatient.notes.length - 3} more)`}
                                                        icon={detailNotesExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                                                        className="p-button-text p-button-sm"
                                                        onClick={() => setDetailNotesExpanded(!detailNotesExpanded)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-400 py-4">
                                            <i className="pi pi-file-edit text-3xl mb-2"></i>
                                            <p className="m-0">No clinical notes recorded for this patient.</p>
                                        </div>
                                    )}
                                </div>
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
                        onRowClick={(e) => {
                            setSelectedPatient(e.data);
                            setPatientDetailDialog(true);
                        }}
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
                                        <label htmlFor="gender" style={{ fontWeight: 'bold' }}>Gender *</label>
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
                                        <label htmlFor="firstName" style={{ fontWeight: 'bold' }}>First Name *</label>
                                        <InputText
                                            id="firstName"
                                            value={patient.firstName}
                                            onChange={(e) => setPatient({ ...patient, firstName: e.target.value })}
                                            placeholder="Enter first name"
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
                                        <label htmlFor="lastName" style={{ fontWeight: 'bold' }}>Last Name *</label>
                                        <InputText
                                            id="lastName"
                                            value={patient.lastName}
                                            onChange={(e) => setPatient({ ...patient, lastName: e.target.value })}
                                            placeholder="Enter last name"
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
                                        <label htmlFor="dateOfBirth" style={{ fontWeight: 'bold' }}>Date of Birth *</label>
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
                                    <PhoneInput
                                        label="Phone Number"
                                        value={patient.phoneNumber || ''}
                                        countryCode={patientCountryCode}
                                        onChange={(e) => setPatient({ ...patient, phoneNumber: e.target.value })}
                                        onCountryCodeChange={(e) => {
                                            setPatientCountryCode(e.value);
                                        }}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <div className="field">
                                        <label htmlFor="email" style={{ fontWeight: 'bold' }}>Email</label>
                                        <InputText
                                            id="email"
                                            type="email"
                                            value={patient.email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="Enter email address"
                                            className={emailError ? 'p-invalid' : ''}
                                        />
                                        {emailError && (
                                            <small className="p-error">{emailError}</small>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="address" style={{ fontWeight: 'bold' }}>Address</label>
                                        <InputTextarea
                                            id="address"
                                            value={patient.address}
                                            onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                                            placeholder="Enter street address"
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
                                        <label htmlFor="emergencyName" style={{ fontWeight: 'bold' }}>Name</label>
                                        <InputText
                                            id="emergencyName"
                                            value={patient.emergencyContact?.name || ''}
                                            onChange={(e) => setPatient({
                                                ...patient,
                                                emergencyContact: { ...patient.emergencyContact, name: e.target.value }
                                            })}
                                            placeholder="Enter contact name"
                                        />
                                    </div>
                                </div>
                                <div className="col-12 md:col-4">
                                    <div className="field">
                                        <label htmlFor="emergencyRelationship" style={{ fontWeight: 'bold' }}>Relationship</label>
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
                                    <PhoneInput
                                        label="Phone Number"
                                        value={patient.emergencyContact?.phoneNumber || ''}
                                        countryCode={emergencyContactCountryCode}
                                        onChange={(e) => setPatient({
                                            ...patient,
                                            emergencyContact: { ...patient.emergencyContact, phoneNumber: e.target.value }
                                        })}
                                        onCountryCodeChange={(e) => {
                                            if (e && e.value) {
                                                setEmergencyContactCountryCode(e.value.value || e.value);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </TabPanel>
                        
                        <TabPanel header="Medical Information">
                            <div className="grid">
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="medicalHistory" style={{ fontWeight: 'bold' }}>Medical History</label>
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
                                        <label htmlFor="allergies" style={{ fontWeight: 'bold' }}>Allergies</label>
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
                                        <label htmlFor="medications" style={{ fontWeight: 'bold' }}>Current Medications</label>
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
                                        <label htmlFor="insuranceProvider" style={{ fontWeight: 'bold' }}>Provider</label>
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
                                        <label htmlFor="policyNumber" style={{ fontWeight: 'bold' }}>Policy Number</label>
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
                        
                        <TabPanel header="Notes">
                            <div className="grid">
                                <div className="col-12">
                                    <div className="field">
                                        <label htmlFor="newNote" style={{ fontWeight: 'bold' }}>Add Clinical Note</label>
                                        <div className="flex flex-column">
                                            <div className="flex">
                                                <InputTextarea
                                                    id="newNote"
                                                    value={newNoteInput}
                                                    onChange={(e) => setNewNoteInput(e.target.value)}
                                                    placeholder="Enter a clinical note..."
                                                    rows={4}
                                                    className="mr-3"
                                                />
                                                <Button
                                                    icon="pi pi-plus"
                                                    className="p-button-outlined"
                                                    onClick={addNote}
                                                    tooltip="Add note"
                                                    disabled={!newNoteInput.trim()}
                                                />
                                            </div>
                                            <div className="text-sm text-500 mt-2">
                                                <i className="pi pi-info-circle mr-2"></i>
                                                Notes are automatically timestamped and attributed to you.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-semibold">Existing Notes</label>
                                        <div className="flex flex-column mt-3">
                                            {patient.notes && patient.notes.length > 0 ? (
                                                <>
                                                    {(notesExpanded ? patient.notes : patient.notes.slice(0, 3)).map((note, displayIndex) => {
                                                        const actualIndex = notesExpanded ? displayIndex : patient.notes.findIndex(n => n === note);
                                                        return (
                                                        <Card key={actualIndex} className="surface-50" style={{ marginBottom: displayIndex < (notesExpanded ? patient.notes.length : Math.min(patient.notes.length, 3)) - 1 ? '1.5rem' : '0' }}>
                                                            <div className="flex justify-content-between align-items-start mb-2">
                                                                <div className="flex-1">
                                                                    <p className="m-0 text-900" style={{ whiteSpace: 'pre-wrap' }}>
                                                                        {note.content}
                                                                    </p>
                                                                </div>
                                                                {!note.id && (
                                                                    <Button
                                                                        icon="pi pi-times"
                                                                        className="p-button-rounded p-button-text p-button-danger p-button-sm"
                                                                        onClick={() => removeNote(actualIndex)}
                                                                        tooltip="Remove note"
                                                                    />
                                                                )}
                                                            </div>
                                                            {note.author && (
                                                                <div className="flex align-items-center mt-2 pt-2 border-top-1 surface-border">
                                                                    <i className="pi pi-user text-500 mr-2"></i>
                                                                    <span className="text-sm text-600">{note.author.name}</span>
                                                                    {note.author.email && (
                                                                        <span className="text-sm text-500 ml-1">({note.author.email})</span>
                                                                    )}
                                                                    {note.createdAt && (
                                                                        <>
                                                                            <i className="pi pi-calendar text-500 ml-3 mr-2"></i>
                                                                            <span className="text-sm text-600">
                                                                                {patientAPI.formatDateTime(note.createdAt)}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Card>
                                                        );
                                                    })}
                                                    {patient.notes.length > 3 && (
                                                        <div className="mt-3">
                                                            <Button
                                                                label={notesExpanded ? "Show Less" : `Show All (${patient.notes.length - 3} more)`}
                                                                icon={notesExpanded ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                                                                className="p-button-text p-button-sm"
                                                                onClick={() => setNotesExpanded(!notesExpanded)}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-center text-400 py-4">
                                                    <i className="pi pi-file-edit text-3xl mb-2"></i>
                                                    <p className="m-0">No notes added yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </Dialog>

                {/* Patient Detail Dialog */}
                <Dialog
                    visible={patientDetailDialog}
                    style={{ width: '95vw', maxWidth: '1200px' }}
                    header={`Patient Details - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`}
                    modal
                    onHide={hidePatientDetailDialog}
                    maximizable
                >
                    {patientDetailDialogContent()}
                </Dialog>

                {/* Visit Details Dialog */}
                <Dialog
                    header="Prediction Details"
                    visible={showVisitDetails}
                    style={{ width: "90%", maxWidth: "800px" }}
                    modal
                    onHide={() => {
                        setShowVisitDetails(false);
                        setSelectedVisit(null);
                    }}
                    footer={
                        <div className="flex justify-content-end">
                            <Button
                                label="Close"
                                icon="pi pi-times"
                                onClick={() => {
                                    setShowVisitDetails(false);
                                    setSelectedVisit(null);
                                }}
                                className="p-button-secondary"
                            />
                        </div>
                    }
                >
                    {selectedVisit && (
                        <div className="grid">
                            {/* Patient Information */}
                            <div className="col-12">
                                <h4>Patient Information</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>Patient Number:</strong> {selectedVisit.patientNumber}
                                    </div>
                                    <div className="col-6">
                                        <strong>Created Date:</strong> {new Date(selectedVisit.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Nurse Information - Only for Admin */}
                            {isAdminUser() && (
                                <div className="col-12">
                                    <h4>Nurse Information</h4>
                                    <div className="grid">
                                        <div className="col-6">
                                            <strong>Nurse Name:</strong> {selectedVisit.user?.name || 'N/A'}
                                        </div>
                                        <div className="col-6">
                                            <strong>Nurse ID:</strong> {selectedVisit.user?.id || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Input Parameters */}
                            <div className="col-12">
                                <h4>Input Parameters</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>Age:</strong> {selectedVisit.inputs?.Age} years
                                    </div>
                                    <div className="col-6">
                                        <strong>Gender:</strong> {selectedVisit.inputs?.Sex === 1 ? 'Female' : selectedVisit.inputs?.Sex === 2 ? 'Male' : 'Unknown'}
                                    </div>
                                    <div className="col-6">
                                        <strong>Arrival Mode:</strong> {
                                            selectedVisit.inputs?.Arrival_mode === 1 ? 'Walk-in (self-presented)' :
                                                selectedVisit.inputs?.Arrival_mode === 2 ? 'Transfer (from another facility)' :
                                                    selectedVisit.inputs?.Arrival_mode === 3 ? 'Ambulance (EMS)' : 'Unknown'
                                        }
                                    </div>
                                    <div className="col-6">
                                        <strong>Injury Present:</strong> {selectedVisit.inputs?.Injury === 1 ? 'Yes (trauma/injury)' : 'No (medical complaint)'}
                                    </div>
                                    <div className="col-6">
                                        <strong>Mental Status:</strong> {
                                            selectedVisit.inputs?.Mental === 1 ? 'Alert (fully awake, oriented)' :
                                                selectedVisit.inputs?.Mental === 2 ? 'Voice (responds to verbal stimulus)' :
                                                    selectedVisit.inputs?.Mental === 3 ? 'Pain (responds only to painful stimulus)' :
                                                        selectedVisit.inputs?.Mental === 4 ? 'Unresponsive (no response to voice or pain)' : 'Unknown'
                                        }
                                    </div>
                                    <div className="col-6">
                                        <strong>Pain Present:</strong> {selectedVisit.inputs?.Pain === 1 ? 'Yes' : 'No'}
                                    </div>
                                    <div className="col-6">
                                        <strong>Pain Score (NRS):</strong> {selectedVisit.inputs?.NRS_pain}/10
                                    </div>
                                    <div className="col-6">
                                        <strong>Body Temperature:</strong> {selectedVisit.inputs?.BT}°C
                                    </div>
                                </div>
                            </div>

                            {/* Vital Signs */}
                            <div className="col-12">
                                <h4>Vital Signs</h4>
                                <div className="grid">
                                    <div className="col-6">
                                        <strong>Systolic BP:</strong> {selectedVisit.inputs?.SBP} mmHg
                                    </div>
                                    <div className="col-6">
                                        <strong>Diastolic BP:</strong> {selectedVisit.inputs?.DBP} mmHg
                                    </div>
                                    <div className="col-6">
                                        <strong>Heart Rate:</strong> {selectedVisit.inputs?.HR} bpm
                                    </div>
                                    <div className="col-6">
                                        <strong>Respiratory Rate:</strong> {selectedVisit.inputs?.RR} breaths/min
                                    </div>
                                </div>
                            </div>

                            {/* Chief Complaint */}
                            <div className="col-12">
                                <h4>Chief Complaint</h4>
                                <p style={{
                                    padding: '10px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    {selectedVisit.inputs?.Chief_complain}
                                </p>
                            </div>

                            {/* Triage Prediction Results */}
                            <div className="col-12">
                                <h4>Triage Prediction Results</h4>
                                <div className="text-center mb-4">
                                    <span
                                        style={{
                                            display: "inline-block",
                                            textAlign: "center",
                                            padding: "0.8rem 1.5rem",
                                            borderRadius: "25px",
                                            backgroundColor: (() => {
                                                switch (selectedVisit.ktasExplained?.Title) {
                                                    case "Resuscitation":
                                                        return "#dc3545";
                                                    case "Emergency":
                                                        return "#fd7e14";
                                                    case "Urgent":
                                                        return "#ffc107";
                                                    case "Less Urgent":
                                                        return "#28a745";
                                                    case "Non-Urgent":
                                                        return "#007bff";
                                                    default:
                                                        return "#6c757d";
                                                }
                                            })(),
                                            color: "white",
                                            fontSize: "1.2rem",
                                            fontWeight: "bold",
                                            boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                                        }}
                                    >
                                        <i className="pi pi-exclamation-triangle mr-2"></i>
                                        {selectedVisit.ktasExplained?.Title}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    <div style={{ textAlign: 'center' }}>
                                        <h5><i className="pi pi-lightbulb mr-2"></i>Clinical Reasoning</h5>
                                        <div className="p-3" style={{
                                            backgroundColor: "#e7f3ff",
                                            borderRadius: "8px",
                                            border: "1px solid #b3d9ff",
                                            maxWidth: '600px',
                                            margin: '0 auto'
                                        }}>
                                            <div className="mb-2">
                                                <strong>Why Level {selectedVisit.ktasExplained?.Level} Classification:</strong>
                                            </div>
                                            <div>
                                                <strong>Primary Assessment:</strong> {selectedVisit.ktasExplained?.Meaning}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
