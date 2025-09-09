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
        Chief_complain: ""
    });
    useEffect(() => {
        console.log("Test")
        prediction.getAllPredictions().then((data) => {
            console.log("ALL PREDICTIONS HERE:", data);
            setAllPredictions(data?.logs)
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var [predictionResults, setPredictionResults] = useState();

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
        console.log(newForm)

        prediction.getPrediction(newForm).then((data) => {
            console.log(data);
            setPredictionResults(data);
            setLoad(false);
        });

    }

    return (

        <div className="card  p-align-stretch vertical-container">
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={<div> <Button className="p-button-success mr-2" icon="pi pi-plus" label="Start Triage" onClick={(e) => setshowPredictionForm(true)} /></div>}
                // right={
                //     // <div>
                //     //     <span className="block mt-2 md:mt-0 p-input-icon-left">
                //     //         <i className="pi pi-search" />
                //     //         {/* <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Event Name" /> */}
                //     //     </span>
                //     // </div>
                // }
                ></Toolbar>
            </div>
            <div className="col-12">
                <div className="card">
                    <Dialog
                        header="Patient Triage"
                        visible={showPredictionForm}
                        style={{ width: "80%", height: "100vh" }}
                        modal
                        onHide={(e) => {
                            setshowPredictionForm(false);
                        }}
                        footer={
                            <>
                                <Button label="Predict" onClick={predict} className="p-button-success" type="submit" />
                            </>
                        }
                    >
                        <div className="grid">
                            <div className="col-12 lg:col-12">
                                <form method="post">
                                    <TabView>
                                        <TabPanel header="Triage">
                                            <div className="grid">
                                                <div className="col-12  lg:col-3">
                                                    <InputArea
                                                        label="Patient Number"
                                                        placeholder="Enter a Patient Number"
                                                        value={form.patientNumber}
                                                        min={1}
                                                        max={1000000}
                                                        onChange={(e) => setForm({ ...form, patientNumber: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <label>
                                                        Gender
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
                                                        Arrival mode
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
                                                        Injury
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
                                                        Mental Status
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
                                                        Pain
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
                                                        Pain score NRS
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
                                                    <strong className="big-text">Results</strong> <br /> <br />
                                                    <span
                                                        style={{
                                                            display: "inline-block",
                                                            textAlign: "center",
                                                            padding: "0.5rem 1rem",
                                                            borderRadius: "20px",
                                                            backgroundColor: (() => {
                                                                switch (predictionResults?.data?.Ktas_Explained?.Title) {
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
                                                            color: "white",
                                                            marginBottom: "0.5rem",
                                                        }}
                                                    >
                                                        <b>{predictionResults?.data?.Ktas_Explained?.Title}</b>
                                                    </span>
                                                    <br />
                                                    <span>
                                                        <strong>Explanation:</strong> {predictionResults?.data?.Ktas_Explained?.Meaning}
                                                    </span>

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
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Predictions"
                        emptyMessage="No predictions found."
                        //header={header}
                        responsiveLayout="scroll"
                        resizableColumns
                        columnResizeMode="expand"
                        //filters={filters}
                        filterDisplay="menu"
                        globalFilterFields={["ktasExplained.Title", "ktasExplained.Meaning", "model"]}
                    >
                        <Column field="patientNumber" header="Patient Number" sortable body={(item) => <b>{item.patientNumber}</b>}></Column>
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
                                    color: "white",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {item.ktasExplained?.Title}
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
                        <Column field="createdAt" header="Created At" sortable body={(item) => new Date(item.createdAt).toLocaleString()}></Column>
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
                style={{ width: "70%", maxWidth: "800px" }}
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
                                    <strong>Created At:</strong> {new Date(selectedPrediction.createdAt).toLocaleString()}
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
                                    <strong>Gender:</strong> {selectedPrediction.inputs?.Sex === 1 ? 'Female' : 'Male'}
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

                        {/* Prediction Results */}
                        <div className="col-12">
                            <h4>Prediction Results</h4>
                            <div className="grid">
                                <div className="col-12">
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <strong>KTAS Level:</strong>
                                        <span
                                            style={{
                                                display: "inline-block",
                                                textAlign: "center",
                                                padding: "0.5rem 1rem",
                                                borderRadius: "20px",
                                                backgroundColor: (() => {
                                                    switch (selectedPrediction.ktasExplained?.Title) {
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
                                                            return "grey";
                                                    }
                                                })(),
                                                color: "white",
                                            }}
                                        >
                                            Level {selectedPrediction.ktasExplained?.Level} - {selectedPrediction.ktasExplained?.Title}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <strong>Explanation:</strong>
                                    <p style={{ 
                                        padding: '10px', 
                                        backgroundColor: '#f8f9fa', 
                                        borderRadius: '4px',
                                        border: '1px solid #dee2e6',
                                        marginTop: '5px'
                                    }}>
                                        {selectedPrediction.ktasExplained?.Meaning}
                                    </p>
                                </div>
                                {/* <div className="col-12">
                                    <strong>Triage Target:</strong> {selectedPrediction.ktasExplained?.Triage_target}
                                </div>
                                <div className="col-12">
                                    <strong>Model Used:</strong> {selectedPrediction.model}
                                </div> */}
                                {/* <div className="col-12">
                                    <strong>Prediction Confidence:</strong>
                                    <div style={{ marginTop: '5px' }}>
                                        {selectedPrediction.probs && selectedPrediction.probs.map((prob, index) => (
                                            <span key={index} style={{ 
                                                marginRight: '10px',
                                                padding: '2px 8px',
                                                backgroundColor: '#e9ecef',
                                                borderRadius: '3px',
                                                fontSize: '0.9em'
                                            }}>
                                                Level {index + 1}: {(parseFloat(prob) * 100).toFixed(1)}%
                                            </span>
                                        ))}
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div >
    );
};
