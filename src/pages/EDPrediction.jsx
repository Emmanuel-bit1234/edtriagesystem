import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import TextInput from "../componets/TextInput";
import InputTextArea from "../componets/InputTextArea";
import { Toolbar } from "primereact/toolbar";
import { TabPanel, TabView } from "primereact/tabview";
import PredictionAPI from "../service/predictionAPI";
import { ProgressSpinner } from 'primereact/progressspinner';
import InputArea from "../componets/InputArea";
import FloatInputArea from "../componets/FloatInputArea";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";

export const EDPrediction = (props) => {

    var prediction = new PredictionAPI();
    var [load, setLoad] = useState(false);
    var [allPredictions, setAllPredictions] = useState()

    var [showPredictionForm, setshowPredictionForm] = useState(false);
    var [showDetailsDialog, setShowDetailsDialog] = useState(false);
    var [selectedPrediction, setSelectedPrediction] = useState(null);

    const Genders = [
        { name: "Male", value: 2 },
        { name: "Female", value: 1 }
    ]
    var [gender, setGender] = useState();

    const PainPresent = [
        { name: "No", value: 0 },
        { name: "Yes", value: 1 }
    ]
    var [painPresent, setPainPresent] = useState();

    const PainScore = [
        { name: "1", value: 1 },
        { name: "2", value: 2 },
        { name: "3", value: 3 },
        { name: "4", value: 4 },
        { name: "5", value: 5 },
        { name: "6", value: 6 },
        { name: "7", value: 7 },
        { name: "8", value: 8 },
        { name: "9", value: 9 },
        { name: "10", value: 10 }
    ]
    var [painScore, setPainScore] = useState();

    const ArrivalModes = [
        { name: "Walk-in (self-presented)", value: 1 },
        { name: "Transfer (from another facility)", value: 2 },
        { name: "Ambulance (EMS)", value: 3 }
    ]
    var [arrivalMode, setArrivalMode] = useState();

    const Injury = [
        { name: "No (medical complaint)", value: 0 },
        { name: "Yes (trauma/injury)", value: 1 }
    ]
    var [injury, setInjury] = useState();

    const Mental = [
        { name: "Alert (fully awake, oriented)", value: 1 },
        { name: "Voice (responds to verbal stimulus)", value: 2 },
        { name: "Pain (responds only to painful stimulus)", value: 3 },
        { name: "Unresponsive (no response to voice or pain)", value: 4 }
    ]
    var [mentalState, setMentalState] = useState();

    var [form, setForm] = useState({
        Sex: null,
        patientNumber: "",
        Age: "",
        Arrival_mode: null,
        Injury: null,
        Mental: null,
        Pain: null,
        NRS_pain: null,
        SBP: "",
        DBP: "",
        HR: "",
        RR: "",
        BT: "",
        Chief_complain: "",
        nurseName: "",
        nurseId: ""
    });
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    // Helper function to load predictions based on user role
    const loadPredictions = () => {
        const storedUser = localStorage.getItem('user');
        let isAdminUser = false;
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                isAdminUser = userData.name === 'Admin' || 
                              userData.username === 'Admin' || 
                              userData.email === 'Admin@edtriage.co.za';
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }

        // Load predictions based on user role
        if (isAdminUser) {
            // Admin sees all predictions
            prediction.getAllPredictions().then((data) => {
                setAllPredictions(data?.logs)
            });
        } else {
            // Regular nurses see only their own predictions
            const nurseId = JSON.parse(storedUser || '{}').id;
            if (nurseId) {
                prediction.getAllPredictions().then((data) => {
                    const allPredictions = data?.logs || [];
                    // Filter predictions by current nurse ID
                    const nursePredictions = allPredictions.filter(pred => 
                        pred.user?.id === nurseId || pred.user?.id === String(nurseId)
                    );
                    setAllPredictions(nursePredictions);
                });
            }
        }
    };

    useEffect(() => {
        // Get nurse information from local storage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setForm(prevForm => ({
                    ...prevForm,
                    nurseName: userData.name || "",
                    nurseId: userData.id || ""
                }));
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }

        // Load initial predictions
        loadPredictions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var [predictionResults, setPredictionResults] = useState();

    // Function to reset all form data and state
    const resetForm = () => {
        setGender(undefined);
        setPainPresent(undefined);
        setPainScore(undefined);
        setArrivalMode(undefined);
        setInjury(undefined);
        setMentalState(undefined);
        setPredictionResults(null);

        // Reset form to initial state but preserve nurse info
        setForm({
            Sex: null,
            patientNumber: "",
            Age: "",
            Arrival_mode: null,
            Injury: null,
            Mental: null,
            Pain: null,
            NRS_pain: null,
            SBP: "",
            DBP: "",
            HR: "",
            RR: "",
            BT: "",
            Chief_complain: "",
            nurseName: form.nurseName, // Preserve nurse info
            nurseId: form.nurseId      // Preserve nurse info
        });
    };

    // Function to validate if all required fields are filled and no prediction exists yet
    const isFormValid = () => {
        const allFieldsFilled = (
            form.patientNumber.trim() !== "" &&
            gender !== undefined &&
            form.Age.trim() !== "" &&
            arrivalMode !== undefined &&
            injury !== undefined &&
            mentalState !== undefined &&
            painPresent !== undefined &&
            painScore !== undefined &&
            form.SBP.trim() !== "" &&
            form.DBP.trim() !== "" &&
            form.HR.trim() !== "" &&
            form.RR.trim() !== "" &&
            form.BT.trim() !== "" &&
            form.Chief_complain.trim() !== ""
        );

        // Disable if fields are not filled OR if prediction already exists
        return allFieldsFilled && !predictionResults;
    };

    function predict() {
        setLoad(true);
        form.Sex = gender;
        form.Arrival_mode = arrivalMode;
        form.Injury = injury;
        form.Mental = mentalState;
        form.Pain = painPresent;
        form.NRS_pain = painScore;
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        // eslint-disable-next-line no-unused-vars
        var error = false;
        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value === "") {
                error = true;
            }
        });
        prediction.getPrediction(newForm).then((data) => {
            console.log("Prediction Results:", data);
            setPredictionResults(data);
            setLoad(false);
        });

    }

    return (

        <div className="card  p-align-stretch vertical-container">
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={<div> <Button className="p-button-success mr-2" icon="pi pi-plus" label="Start Triage" onClick={(e) => {
                        setshowPredictionForm(true);
                        // Reset all form data when starting new triage
                        resetForm();
                    }} /></div>}
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText placeholder="Search..." value={globalFilterValue}
                                    onChange={onGlobalFilterChange}
                                />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>
            <div className="col-12">
                <div className="card">
                    <Dialog
                        header="Patient Triage"
                        visible={showPredictionForm}
                        style={{ width: "90%", height: "100vh" }}
                        modal
                        onHide={(e) => {
                            setshowPredictionForm(false);
                            // Reset all form data when dialog is closed
                            resetForm();
                            // Refresh predictions based on user role when dialog is closed
                            setLoad(true);
                            loadPredictions();
                            setLoad(false);
                        }}
                        footer={
                            <>
                                <Button
                                    label="Predict"
                                    onClick={predict}
                                    className="p-button-success"
                                    type="submit"
                                    disabled={!isFormValid()}
                                />
                            </>
                        }
                    >
                        <div className="grid">
                            <div className="col-12 lg:col-12">
                                <form method="post">
                                    <TabView>
                                        <TabPanel header="Triage">
                                            {/* Nurse Information Display */}
                                            <div className="col-12 mb-3">
                                                <div className="p-3" style={{
                                                    backgroundColor: '#e3f2fd',
                                                    borderRadius: '8px',
                                                    border: '1px solid #bbdefb'
                                                }}>
                                                    <h5 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Current Nurse</h5>
                                                    <p style={{ margin: '0', color: '#424242' }}>
                                                        <strong>Name:</strong> {form.nurseName || 'Not available'} |
                                                        <strong> ID:</strong> {form.nurseId || 'Not available'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid">
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Patient Number"
                                                        placeholder="Enter a Patient Number"
                                                        value={form.patientNumber}
                                                        min={1}
                                                        max={999999999}
                                                        onChange={(e) => setForm({ ...form, patientNumber: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Gender</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setGender(e.value)}
                                                        value={gender}
                                                        options={Genders}
                                                        placeholder="Select a Gender"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Age (18-120)"
                                                        placeholder="Enter an Age"
                                                        value={form.Age}
                                                        min={18}
                                                        max={120}
                                                        onChange={(e) => setForm({ ...form, Age: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Arrival mode</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setArrivalMode(e.value)}
                                                        value={arrivalMode}
                                                        options={ArrivalModes}
                                                        placeholder="Select an Arrival Mode"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Injury</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setInjury(e.value)}
                                                        value={injury}
                                                        options={Injury}
                                                        placeholder="Injury Present?"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Mental Status</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setMentalState(e.value)}
                                                        value={mentalState}
                                                        options={Mental}
                                                        placeholder="Select a Mental Status"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>

                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Pain</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setPainPresent(e.value)}
                                                        value={painPresent}
                                                        options={PainPresent}
                                                        placeholder="Pain Present?"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        <strong>Pain score NRS</strong>
                                                    </label>
                                                    <Dropdown
                                                        onChange={(e) => setPainScore(e.value)}
                                                        value={painScore}
                                                        options={PainScore}
                                                        placeholder="Pain score NRS"
                                                        optionLabel="name"
                                                        style={{ width: "100%" }}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Systolic Blood Pressure (60–240)"
                                                        placeholder="Enter a SBP"
                                                        value={form.SBP}
                                                        min={60}
                                                        max={240}
                                                        hint="Typical adult normal ≈ 90–120."
                                                        onChange={(e) => setForm({ ...form, SBP: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Diastolic Blood Pressure (30–140)"
                                                        placeholder="Enter a DBP"
                                                        value={form.DBP}
                                                        min={30}
                                                        max={140}
                                                        hint="Typical adult normal ≈ 60–80."
                                                        onChange={(e) => setForm({ ...form, DBP: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Heart Rate in beats per min (30–200)"
                                                        placeholder="Enter a Heart Rate"
                                                        value={form.HR}
                                                        min={30}
                                                        max={200}
                                                        hint="Typical adult resting ≈ 60–100 bpm."
                                                        onChange={(e) => setForm({ ...form, HR: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Respiratory Rate in breaths per min (8–40)"
                                                        placeholder="Enter a Respiratory Rate"
                                                        value={form.RR}
                                                        min={8}
                                                        max={40}
                                                        hint="Typical adult resting ≈ 12–20."
                                                        onChange={(e) => setForm({ ...form, RR: e.target.value })}
                                                    />
                                                </div>

                                                <div className="col-12  lg:col-3">
                                                    <FloatInputArea
                                                        label="Body Temperature in °C (34.0–42.0)"
                                                        placeholder="Enter a Body Temperature"
                                                        value={form.BT}
                                                        min={34.0}
                                                        max={42.0}
                                                        hint="Typical normal ≈ 36.5–37.5 °C."
                                                        onChange={(e) => setForm({ ...form, BT: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-6">
                                                    <InputTextArea label="Chief complain" placeholder="Enter a Chief Complain" value={form.Chief_complain} onChange={(e) => setForm({ ...form, Chief_complain: e.target.value })} />
                                                </div>

                                            </div>
                                            {predictionResults && (
                                                <>
                                                    <hr style={{ margin: "20px 0" }} />
                                                    <strong className="big-text">Triage Prediction Results</strong> <br /> <br />

                                                    {/* Main Prediction Badge */}
                                                    <div className="text-center mb-4">
                                                        <span
                                                            style={{
                                                                display: "inline-block",
                                                                textAlign: "center",
                                                                padding: "0.8rem 1.5rem",
                                                                borderRadius: "25px",
                                                                backgroundColor: (() => {
                                                                    switch (predictionResults?.data?.Ktas_Explained?.Title) {
                                                                        case "Resuscitation":   // Level I
                                                                            return "#dc3545";
                                                                        case "Emergency":       // Level II
                                                                            return "#fd7e14";
                                                                        case "Urgent":          // Level III
                                                                            return "#ffc107";
                                                                        case "Less Urgent":     // Level IV
                                                                            return "#28a745";
                                                                        case "Non-Urgent":      // Level V
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
                                                            {predictionResults?.data?.Ktas_Explained?.Title}
                                                        </span>
                                                    </div>

                                                    {/* Top Contributing Factors and Clinical Reasoning - Conditional Layout */}
                                                    <div className="mb-3">
                                                        {(() => {
                                                            const factors = [];
                                                            const inputs = predictionResults?.data?.inputs;

                                                            // Check critical vital signs based on proper ranges
                                                            if (inputs?.HR) {
                                                                const hr = parseInt(inputs.HR);
                                                                if (hr > 120) {
                                                                    factors.push({
                                                                        label: "Heart Rate",
                                                                        value: `${hr} BPM`,
                                                                        status: hr > 150 ? "critical" : "high",
                                                                        reason: hr > 150 ? "Tachycardia: >150 BPM (normal: 60-100)" : "Elevated: >120 BPM"
                                                                    });
                                                                } else if (hr < 60) {
                                                                    factors.push({
                                                                        label: "Heart Rate",
                                                                        value: `${hr} BPM`,
                                                                        status: hr < 50 ? "critical" : "high",
                                                                        reason: hr < 50 ? "Bradycardia: <50 BPM" : "Low: <60 BPM"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.SBP) {
                                                                const sbp = parseInt(inputs.SBP);
                                                                if (sbp < 90) {
                                                                    factors.push({
                                                                        label: "Systolic BP",
                                                                        value: `${sbp} mmHg`,
                                                                        status: "critical",
                                                                        reason: "Hypotensive: <90 mmHg (normal: 90-120)"
                                                                    });
                                                                } else if (sbp > 180) {
                                                                    factors.push({
                                                                        label: "Systolic BP",
                                                                        value: `${sbp} mmHg`,
                                                                        status: "high",
                                                                        reason: "Hypertensive: >180 mmHg"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.DBP) {
                                                                const dbp = parseInt(inputs.DBP);
                                                                if (dbp < 60) {
                                                                    factors.push({
                                                                        label: "Diastolic BP",
                                                                        value: `${dbp} mmHg`,
                                                                        status: "critical",
                                                                        reason: "Low diastolic: <60 mmHg (normal: 60-80)"
                                                                    });
                                                                } else if (dbp > 100) {
                                                                    factors.push({
                                                                        label: "Diastolic BP",
                                                                        value: `${dbp} mmHg`,
                                                                        status: "high",
                                                                        reason: "High diastolic: >100 mmHg"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.NRS_pain) {
                                                                const pain = parseInt(inputs.NRS_pain);
                                                                if (pain >= 8) {
                                                                    factors.push({
                                                                        label: "Pain Score",
                                                                        value: `${pain}/10`,
                                                                        status: "high",
                                                                        reason: "Severe pain: ≥8/10 (0=no pain, 10=worst)"
                                                                    });
                                                                } else if (pain >= 6) {
                                                                    factors.push({
                                                                        label: "Pain Score",
                                                                        value: `${pain}/10`,
                                                                        status: "moderate",
                                                                        reason: "Moderate pain: 6-7/10"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.RR) {
                                                                const rr = parseInt(inputs.RR);
                                                                if (rr > 25) {
                                                                    factors.push({
                                                                        label: "Respiratory Rate",
                                                                        value: `${rr} breaths/min`,
                                                                        status: rr > 30 ? "critical" : "high",
                                                                        reason: rr > 30 ? "Tachypnea: >30/min" : "Elevated: >25/min (normal: 12-20)"
                                                                    });
                                                                } else if (rr < 12) {
                                                                    factors.push({
                                                                        label: "Respiratory Rate",
                                                                        value: `${rr} breaths/min`,
                                                                        status: "high",
                                                                        reason: "Bradypnea: <12/min"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.BT) {
                                                                const temp = parseFloat(inputs.BT);
                                                                if (temp > 38.5) {
                                                                    factors.push({
                                                                        label: "Body Temperature",
                                                                        value: `${temp}°C`,
                                                                        status: temp > 39.5 ? "critical" : "high",
                                                                        reason: temp > 39.5 ? "High fever: >39.5°C" : "Fever: >38.5°C (normal: 36.5-37.5°C)"
                                                                    });
                                                                } else if (temp < 36.0) {
                                                                    factors.push({
                                                                        label: "Body Temperature",
                                                                        value: `${temp}°C`,
                                                                        status: "high",
                                                                        reason: "Hypothermia: <36.0°C"
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.Mental) {
                                                                const mental = parseInt(inputs.Mental);
                                                                const mentalStatus = {
                                                                    1: "Alert",
                                                                    2: "Voice responsive",
                                                                    3: "Pain responsive",
                                                                    4: "Unresponsive"
                                                                };
                                                                if (mental >= 3) {
                                                                    factors.push({
                                                                        label: "Mental Status",
                                                                        value: mentalStatus[mental],
                                                                        status: mental === 4 ? "critical" : "high",
                                                                        reason: ""
                                                                    });
                                                                }
                                                            }

                                                            if (inputs?.Injury && parseInt(inputs.Injury) === 1) {
                                                                factors.push({
                                                                    label: "Injury Present",
                                                                    value: "Yes",
                                                                    status: "high",
                                                                    reason: "Trauma/injury reported"
                                                                });
                                                            }

                                                            if (inputs?.Arrival_mode) {
                                                                const arrival = parseInt(inputs.Arrival_mode);
                                                                const arrivalModes = {
                                                                    1: "Walk-in",
                                                                    2: "Transfer",
                                                                    3: "Ambulance"
                                                                };
                                                                if (arrival === 3) {
                                                                    factors.push({
                                                                        label: "Arrival Mode",
                                                                        value: arrivalModes[arrival],
                                                                        status: "high",
                                                                        reason: "EMS transport indicates urgency"
                                                                    });
                                                                }
                                                            }

                                                            // Sort factors by priority (critical > high > moderate) and take top 3
                                                            const sortedFactors = factors.sort((a, b) => {
                                                                const priorityOrder = { 'critical': 3, 'high': 2, 'moderate': 1 };
                                                                return priorityOrder[b.status] - priorityOrder[a.status];
                                                            }).slice(0, 3);

                                                            const hasFactors = sortedFactors.length > 0;
                                                            const isLowUrgency = predictionResults?.data?.Ktas_Explained?.Title === "Less Urgent" ||
                                                                predictionResults?.data?.Ktas_Explained?.Title === "Non-Urgent";

                                                            return (
                                                                <>
                                                                    {hasFactors && !isLowUrgency ? (
                                                                        // Side-by-side layout when factors exist and not low urgency
                                                                        <>
                                                                            <style>
                                                                                {`
                                                                                    .prediction-layout {
                                                                                        display: flex;
                                                                                        flex-direction: column;
                                                                                        gap: 15px;
                                                                                    }
                                                                                    @media (min-width: 1024px) {
                                                                                        .prediction-layout {
                                                                                            flex-direction: row !important;
                                                                                        }
                                                                                        .prediction-item {
                                                                                            flex: 0 0 48% !important;
                                                                                            margin-bottom: 0 !important;
                                                                                        }
                                                                                    }
                                                                                `}
                                                                            </style>
                                                                            <div className="prediction-layout">
                                                                                {/* Top Contributing Factors */}
                                                                                <div className="prediction-item" style={{
                                                                                    flex: '1',
                                                                                    marginBottom: '15px'
                                                                                }}>
                                                                                    <h5><i className="pi pi-info-circle mr-2"></i>Top Contributing Factors</h5>
                                                                                    <div className="p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
                                                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                                            {sortedFactors.map((factor, index) => (
                                                                                                <div key={index} style={{
                                                                                                    display: 'flex',
                                                                                                    alignItems: 'center',
                                                                                                    padding: '8px',
                                                                                                    backgroundColor: factor.status === 'critical' ? '#f8d7da' :
                                                                                                        factor.status === 'high' ? '#fff3cd' : '#d1ecf1',
                                                                                                    borderRadius: '4px',
                                                                                                    border: `1px solid ${factor.status === 'critical' ? '#f5c6cb' :
                                                                                                        factor.status === 'high' ? '#ffeaa7' : '#bee5eb'}`,
                                                                                                    minWidth: 'fit-content',
                                                                                                    flex: '0 0 auto',
                                                                                                    marginRight: '4px'
                                                                                                }}>
                                                                                                    <div style={{ marginRight: '4px' }}>
                                                                                                        <strong>{factor.label}:</strong>
                                                                                                    </div>
                                                                                                    <div style={{ marginRight: '4px' }}>
                                                                                                        <span className={`badge ${factor.status === 'critical' ? 'bg-danger' :
                                                                                                            factor.status === 'high' ? 'bg-warning' : 'bg-info'
                                                                                                            }`}>
                                                                                                            {factor.value}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                                                                                                        {factor.reason}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Clinical Reasoning */}
                                                                                <div className="prediction-item" style={{
                                                                                    flex: '1'
                                                                                }}>
                                                                                    <h5><i className="pi pi-lightbulb mr-2"></i>Clinical Reasoning</h5>
                                                                                    <div className="p-2" style={{ backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
                                                                                        <div className="mb-2">
                                                                                            <strong>Why Level {predictionResults?.data?.Ktas_Explained?.Level} Classification:</strong>
                                                                                        </div>
                                                                                        <div>
                                                                                            <strong>Primary Assessment:</strong> {predictionResults?.data?.Ktas_Explained?.Meaning}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        // Centered layout when no factors OR low urgency
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
                                                                                    <strong>Why Level {predictionResults?.data?.Ktas_Explained?.Level} Classification:</strong>
                                                                                </div>
                                                                                <div>
                                                                                    <strong>Primary Assessment:</strong> {predictionResults?.data?.Ktas_Explained?.Meaning}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                </>
                                            )}
                                        </TabPanel>
                                    </TabView>
                                </form>
                            </div>
                        </div>
                        <div className="loading-container">
                            {load && <div className="spinner-overlay">
                                <ProgressSpinner />
                            </div>}
                        </div>
                    </Dialog>

                    <DataTable
                        size="small"
                        scrollable={true}
                        value={allPredictions}
                        dataKey="id"
                        paginator
                        rows={9}
                        rowsPerPageOptions={[9, 18, 27]}
                        className="datatable-responsive"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Predictions"
                        emptyMessage="No predictions found."
                        //header={header}
                        responsiveLayout="scroll"
                        resizableColumns
                        columnResizeMode="expand"
                        filters={filters}
                        filterDisplay="menu"
                        globalFilterFields={["ktasExplained.Title", "patientNumber", "user.name"]}
                        onRowClick={(e) => {
                            setSelectedPrediction(e.data);
                            setShowDetailsDialog(true);
                        }}
                        selectionMode="single"
                        metaKeySelection={false}
                    >
                        <Column field="patientNumber" header="Patient Number" sortable body={(item) => <b>{item.patientNumber}</b>}></Column>
                        <Column field="gender" header="Gender" sortable body={(item) => <b>{item.inputs?.Sex === 1 ? 'Female' : item.inputs?.Sex === 2 ? 'Male' : 'Unknown'}</b>}></Column>
                        <Column field="ktasExplained.Level" header="Prediction Level" sortable body={(item) => <b>{item.ktasExplained?.Level}</b>}></Column>
                        <Column field="ktasExplained.Title" header="Prediction Title" sortable body={(item) => (
                            <span
                                style={{
                                    display: "inline-block",
                                    textAlign: "center",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "20px",
                                    backgroundColor: (() => {
                                        switch (item.ktasExplained?.Title) {
                                            case "Resuscitation":   // Level I
                                                return "red";
                                            case "Emergency":       // Level II
                                                return "orange";
                                            case "Urgent":          // Level III
                                                return "yellow";
                                            case "Less Urgent":     // Level IV
                                                return "green";
                                            case "Non-Urgent":      // Level V
                                                return "blue";
                                            default:
                                                return "grey"; // fallback for unknown values
                                        }
                                    })(),
                                    color: (() => {
                                        switch (item.ktasExplained?.Title) {
                                            case "Urgent":          // Level III - dark text for better contrast on yellow
                                                return "#333333";
                                            default:
                                                return "white";
                                        }
                                    })(),
                                    marginBottom: "0.5rem",
                                    fontWeight: "bold",
                                    fontSize: "0.9rem"
                                }}
                            >
                                <b>{item.ktasExplained?.Title}</b>
                            </span>
                        )}></Column>
                        <Column
                            field="ktasExplained.Meaning"
                            header="Prediction Meaning"
                            sortable
                            body={(item) => (
                                <div
                                    style={{
                                        maxWidth: '300px',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.4'
                                    }}
                                    title={item.ktasExplained?.Meaning}
                                >
                                    {item.ktasExplained?.Meaning}
                                </div>
                            )}
                        ></Column>
                        <Column
                            field="createdAt"
                            header="Created Date"
                            sortable
                            body={(item) => (
                                <div
                                    style={{
                                        maxWidth: '200px',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.4'
                                    }}
                                    title={new Date(item.createdAt).toLocaleString()}
                                >
                                    {new Date(item.createdAt).toLocaleString()}
                                </div>
                            )}
                        ></Column>
                        <Column field="user.name" header="Nurse" sortable body={(item) => <b>{item.user.name}</b>}></Column>
                        <Column field="user.id" header="Nurse ID" sortable body={(item) => <b>{item.user.id}</b>}></Column>
                        <Column
                            field="action"
                            header="Action"
                            body={(item) => (
                                <>
                                    <Button
                                        onClick={(e) => {
                                            setSelectedPrediction(item);
                                            setShowDetailsDialog(true);
                                        }}
                                        tooltip="Click to View"
                                        icon={"pi pi-eye"}
                                        className=" p-button-rounded mr-2"
                                    />
                                </>
                            )}
                        ></Column>
                    </DataTable>
                </div>
            </div >

            {/* Details Dialog */}
            <Dialog
                header="Prediction Details"
                visible={showDetailsDialog}
                style={{ width: "90%", maxWidth: "800px" }}
                modal
                onHide={() => {
                    setShowDetailsDialog(false);
                    setSelectedPrediction(null);
                }}
                footer={
                    <Button
                        label="Close"
                        onClick={() => {
                            setShowDetailsDialog(false);
                            setSelectedPrediction(null);
                        }}
                        className="p-button-secondary"
                    />
                }
            >
                {selectedPrediction && (
                    <div className="grid">
                        {/* Patient Information */}
                        <div className="col-12">
                            <h4>Patient Information</h4>
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Patient Number:</strong> {selectedPrediction.patientNumber}
                                </div>
                                <div className="col-6">
                                    <strong>Created Date:</strong> {new Date(selectedPrediction.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Nurse Information */}
                        <div className="col-12">
                            <h4>Nurse Information</h4>
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Nurse Name:</strong> {selectedPrediction.user?.name || 'N/A'}
                                </div>
                                <div className="col-6">
                                    <strong>Nurse ID:</strong> {selectedPrediction.user?.id || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Input Parameters */}
                        <div className="col-12">
                            <h4>Input Parameters</h4>
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Age:</strong> {selectedPrediction.inputs?.Age} years
                                </div>
                                <div className="col-6">
                                    <strong>Gender:</strong> {selectedPrediction.inputs?.Sex === 1 ? 'Female' : selectedPrediction.inputs?.Sex === 2 ? 'Male' : 'Unknown'}
                                </div>
                                <div className="col-6">
                                    <strong>Arrival Mode:</strong> {
                                        selectedPrediction.inputs?.Arrival_mode === 1 ? 'Walk-in (self-presented)' :
                                            selectedPrediction.inputs?.Arrival_mode === 2 ? 'Transfer (from another facility)' :
                                                selectedPrediction.inputs?.Arrival_mode === 3 ? 'Ambulance (EMS)' : 'Unknown'
                                    }
                                </div>
                                <div className="col-6">
                                    <strong>Injury Present:</strong> {selectedPrediction.inputs?.Injury === 1 ? 'Yes (trauma/injury)' : 'No (medical complaint)'}
                                </div>
                                <div className="col-6">
                                    <strong>Mental Status:</strong> {
                                        selectedPrediction.inputs?.Mental === 1 ? 'Alert (fully awake, oriented)' :
                                            selectedPrediction.inputs?.Mental === 2 ? 'Voice (responds to verbal stimulus)' :
                                                selectedPrediction.inputs?.Mental === 3 ? 'Pain (responds only to painful stimulus)' :
                                                    selectedPrediction.inputs?.Mental === 4 ? 'Unresponsive (no response to voice or pain)' : 'Unknown'
                                    }
                                </div>
                                <div className="col-6">
                                    <strong>Pain Present:</strong> {selectedPrediction.inputs?.Pain === 1 ? 'Yes' : 'No'}
                                </div>
                                <div className="col-6">
                                    <strong>Pain Score (NRS):</strong> {selectedPrediction.inputs?.NRS_pain}/10
                                </div>
                                <div className="col-6">
                                    <strong>Body Temperature:</strong> {selectedPrediction.inputs?.BT}°C
                                </div>
                            </div>
                        </div>

                        {/* Vital Signs */}
                        <div className="col-12">
                            <h4>Vital Signs</h4>
                            <div className="grid">
                                <div className="col-6">
                                    <strong>Systolic BP:</strong> {selectedPrediction.inputs?.SBP} mmHg
                                </div>
                                <div className="col-6">
                                    <strong>Diastolic BP:</strong> {selectedPrediction.inputs?.DBP} mmHg
                                </div>
                                <div className="col-6">
                                    <strong>Heart Rate:</strong> {selectedPrediction.inputs?.HR} bpm
                                </div>
                                <div className="col-6">
                                    <strong>Respiratory Rate:</strong> {selectedPrediction.inputs?.RR} breaths/min
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
                                {selectedPrediction.inputs?.Chief_complain}
                            </p>
                        </div>

                        {/* Enhanced Prediction Results */}
                        <div className="col-12">
                            <h4>Triage Prediction Results</h4>

                            {/* Main Prediction Badge */}
                            <div className="text-center mb-4">
                                <span
                                    style={{
                                        display: "inline-block",
                                        textAlign: "center",
                                        padding: "0.8rem 1.5rem",
                                        borderRadius: "25px",
                                        backgroundColor: (() => {
                                            switch (selectedPrediction.ktasExplained?.Title) {
                                                case "Resuscitation":   // Level I
                                                    return "#dc3545";
                                                case "Emergency":       // Level II
                                                    return "#fd7e14";
                                                case "Urgent":          // Level III
                                                    return "#ffc107";
                                                case "Less Urgent":     // Level IV
                                                    return "#28a745";
                                                case "Non-Urgent":      // Level V
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
                                    {selectedPrediction.ktasExplained?.Title}
                                </span>
                            </div>

                            {/* Top Contributing Factors and Clinical Reasoning */}
                            <div className="mb-3">
                                {(() => {
                                    const factors = [];
                                    const inputs = selectedPrediction.inputs;

                                    // Check critical vital signs based on proper ranges
                                    if (inputs?.HR) {
                                        const hr = parseInt(inputs.HR);
                                        if (hr > 120) {
                                            factors.push({
                                                label: "Heart Rate",
                                                value: `${hr} BPM`,
                                                status: hr > 150 ? "critical" : "high",
                                                reason: hr > 150 ? "Tachycardia: >150 BPM (normal: 60-100)" : "Elevated: >120 BPM"
                                            });
                                        } else if (hr < 60) {
                                            factors.push({
                                                label: "Heart Rate",
                                                value: `${hr} BPM`,
                                                status: hr < 50 ? "critical" : "high",
                                                reason: hr < 50 ? "Bradycardia: <50 BPM" : "Low: <60 BPM"
                                            });
                                        }
                                    }

                                    if (inputs?.SBP) {
                                        const sbp = parseInt(inputs.SBP);
                                        if (sbp < 90) {
                                            factors.push({
                                                label: "Systolic BP",
                                                value: `${sbp} mmHg`,
                                                status: "critical",
                                                reason: "Hypotensive: <90 mmHg (normal: 90-120)"
                                            });
                                        } else if (sbp > 180) {
                                            factors.push({
                                                label: "Systolic BP",
                                                value: `${sbp} mmHg`,
                                                status: "high",
                                                reason: "Hypertensive: >180 mmHg"
                                            });
                                        }
                                    }

                                    if (inputs?.DBP) {
                                        const dbp = parseInt(inputs.DBP);
                                        if (dbp < 60) {
                                            factors.push({
                                                label: "Diastolic BP",
                                                value: `${dbp} mmHg`,
                                                status: "critical",
                                                reason: "Low diastolic: <60 mmHg (normal: 60-80)"
                                            });
                                        } else if (dbp > 100) {
                                            factors.push({
                                                label: "Diastolic BP",
                                                value: `${dbp} mmHg`,
                                                status: "high",
                                                reason: "High diastolic: >100 mmHg"
                                            });
                                        }
                                    }

                                    if (inputs?.NRS_pain) {
                                        const pain = parseInt(inputs.NRS_pain);
                                        if (pain >= 8) {
                                            factors.push({
                                                label: "Pain Score",
                                                value: `${pain}/10`,
                                                status: "high",
                                                reason: "Severe pain: ≥8/10 (0=no pain, 10=worst)"
                                            });
                                        } else if (pain >= 6) {
                                            factors.push({
                                                label: "Pain Score",
                                                value: `${pain}/10`,
                                                status: "moderate",
                                                reason: "Moderate pain: 6-7/10"
                                            });
                                        }
                                    }

                                    if (inputs?.RR) {
                                        const rr = parseInt(inputs.RR);
                                        if (rr > 25) {
                                            factors.push({
                                                label: "Respiratory Rate",
                                                value: `${rr} breaths/min`,
                                                status: rr > 30 ? "critical" : "high",
                                                reason: rr > 30 ? "Tachypnea: >30/min" : "Elevated: >25/min (normal: 12-20)"
                                            });
                                        } else if (rr < 12) {
                                            factors.push({
                                                label: "Respiratory Rate",
                                                value: `${rr} breaths/min`,
                                                status: "high",
                                                reason: "Bradypnea: <12/min"
                                            });
                                        }
                                    }

                                    if (inputs?.BT) {
                                        const temp = parseFloat(inputs.BT);
                                        if (temp > 38.5) {
                                            factors.push({
                                                label: "Body Temperature",
                                                value: `${temp}°C`,
                                                status: temp > 39.5 ? "critical" : "high",
                                                reason: temp > 39.5 ? "High fever: >39.5°C" : "Fever: >38.5°C (normal: 36.5-37.5°C)"
                                            });
                                        } else if (temp < 36.0) {
                                            factors.push({
                                                label: "Body Temperature",
                                                value: `${temp}°C`,
                                                status: "high",
                                                reason: "Hypothermia: <36.0°C"
                                            });
                                        }
                                    }

                                    if (inputs?.Mental) {
                                        const mental = parseInt(inputs.Mental);
                                        const mentalStatus = {
                                            1: "Alert",
                                            2: "Voice responsive",
                                            3: "Pain responsive",
                                            4: "Unresponsive"
                                        };
                                        if (mental >= 3) {
                                            factors.push({
                                                label: "Mental Status",
                                                value: mentalStatus[mental],
                                                status: mental === 4 ? "critical" : "high",
                                                reason: ""
                                            });
                                        }
                                    }

                                    if (inputs?.Injury && parseInt(inputs.Injury) === 1) {
                                        factors.push({
                                            label: "Injury Present",
                                            value: "Yes",
                                            status: "high",
                                            reason: "Trauma/injury reported"
                                        });
                                    }

                                    if (inputs?.Arrival_mode) {
                                        const arrival = parseInt(inputs.Arrival_mode);
                                        const arrivalModes = {
                                            1: "Walk-in",
                                            2: "Transfer",
                                            3: "Ambulance"
                                        };
                                        if (arrival === 3) {
                                            factors.push({
                                                label: "Arrival Mode",
                                                value: arrivalModes[arrival],
                                                status: "high",
                                                reason: "EMS transport indicates urgency"
                                            });
                                        }
                                    }

                                    // Sort factors by priority (critical > high > moderate) and take top 3
                                    const sortedFactors = factors.sort((a, b) => {
                                        const priorityOrder = { 'critical': 3, 'high': 2, 'moderate': 1 };
                                        return priorityOrder[b.status] - priorityOrder[a.status];
                                    }).slice(0, 3);

                                    const hasFactors = sortedFactors.length > 0;
                                    const isLowUrgency = selectedPrediction.ktasExplained?.Title === "Less Urgent" ||
                                        selectedPrediction.ktasExplained?.Title === "Non-Urgent";

                                    return (
                                        <>
                                            {hasFactors && !isLowUrgency ? (
                                                // Responsive layout when factors exist and not low urgency
                                                <>
                                                    <style>
                                                        {`
                                                            .prediction-layout-dialog {
                                                                display: flex;
                                                                flex-direction: column;
                                                                gap: 15px;
                                                            }
                                                            @media (min-width: 1024px) {
                                                                .prediction-layout-dialog {
                                                                    flex-direction: row !important;
                                                                }
                                                                .prediction-item-dialog {
                                                                    flex: 0 0 48% !important;
                                                                    margin-bottom: 0 !important;
                                                                }
                                                            }
                                                        `}
                                                    </style>
                                                    <div className="prediction-layout-dialog">
                                                        {/* Top Contributing Factors - Full width on phone, half width on laptop+ */}
                                                        <div className="prediction-item-dialog" style={{
                                                            flex: '1',
                                                            marginBottom: '15px'
                                                        }}>
                                                            <h5><i className="pi pi-info-circle mr-2"></i>Top Contributing Factors</h5>
                                                            <div className="p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                    {sortedFactors.map((factor, index) => (
                                                                        <div key={index} style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            padding: '8px',
                                                                            backgroundColor: factor.status === 'critical' ? '#f8d7da' :
                                                                                factor.status === 'high' ? '#fff3cd' : '#d1ecf1',
                                                                            borderRadius: '4px',
                                                                            border: `1px solid ${factor.status === 'critical' ? '#f5c6cb' :
                                                                                factor.status === 'high' ? '#ffeaa7' : '#bee5eb'}`,
                                                                            minWidth: 'fit-content',
                                                                            flex: '0 0 auto',
                                                                            marginRight: '4px'
                                                                        }}>
                                                                            <div style={{ marginRight: '4px' }}>
                                                                                <strong>{factor.label}:</strong>
                                                                            </div>
                                                                            <div style={{ marginRight: '4px' }}>
                                                                                <span className={`badge ${factor.status === 'critical' ? 'bg-danger' :
                                                                                    factor.status === 'high' ? 'bg-warning' : 'bg-info'
                                                                                    }`}>
                                                                                    {factor.value}
                                                                                </span>
                                                                            </div>
                                                                            <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                                                                                {factor.reason}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Clinical Reasoning - Full width on phone, half width on laptop+ */}
                                                        <div className="prediction-item-dialog" style={{
                                                            flex: '1'
                                                        }}>
                                                            <h5><i className="pi pi-lightbulb mr-2"></i>Clinical Reasoning</h5>
                                                            <div className="p-2" style={{ backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
                                                                <div className="mb-2">
                                                                    <strong>Why Level {selectedPrediction.ktasExplained?.Level} Classification:</strong>
                                                                </div>
                                                                <div>
                                                                    <strong>Primary Assessment:</strong> {selectedPrediction.ktasExplained?.Meaning}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                // Centered layout when no factors OR low urgency
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
                                                            <strong>Why Level {selectedPrediction.ktasExplained?.Level} Classification:</strong>
                                                        </div>
                                                        <div>
                                                            <strong>Primary Assessment:</strong> {selectedPrediction.ktasExplained?.Meaning}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div >
    );
};
