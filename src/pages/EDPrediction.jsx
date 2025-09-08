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

export const EDPrediction = (props) => {

    var prediction = new PredictionAPI();
    var [load, setLoad] = useState(false);

    var [showPredictionForm, setshowPredictionForm] = useState(false);

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
                                                    <TextInput label="Age (18-120)" placeholder="Enter an Age" value={form.Age}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '');
                                                            setForm({ ...form, Age: value });
                                                        }} />
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
                                                    <TextInput label="Systolic Blood Pressure (60–240)" placeholder="Enter a SBP" value={form.SBP} onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setForm({ ...form, SBP: value });
                                                    }} />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <TextInput label="Diastolic Blood Pressure (30–140)" placeholder="Enter a DBP" value={form.DBP} onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setForm({ ...form, DBP: value });
                                                    }} />
                                                </div>

                                                <div className="col-12  lg:col-3">
                                                    <TextInput label="Heart Rate in beats per min (30–200)" placeholder="Enter a Heart Rate" value={form.HR} onChange={(e) => setForm({ ...form, HR: e.target.value })} />
                                                </div>
                                                <div className="col-12  lg:col-3">
                                                    <TextInput label="Respiratory Rate in breaths per min (8–40)" placeholder="Enter a Respiratory Rate" value={form.RR} onChange={(e) => setForm({ ...form, RR: e.target.value })} />
                                                </div>

                                                <div className="col-12  lg:col-3">
                                                    <TextInput label="Body Temperature in °C (34.0–42.0)" placeholder="Enter a Body Temperature" value={form.BT} onChange={(e) => setForm({ ...form, BT: e.target.value })} />
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
                                                                switch (predictionResults?.Ktas_Explained?.Title) {
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
                                                        <b>{predictionResults?.Ktas_Explained?.Title}</b>
                                                    </span>
                                                    <br />
                                                    <span>
                                                        <strong>Explanation:</strong> {predictionResults?.Ktas_Explained?.Meaning}
                                                    </span>
                                                    <br />
                                                    <span>
                                                        <strong>Triage Target:</strong> {predictionResults?.Ktas_Explained?.Triage_target}
                                                    </span>
                                                    <br />
                                                    <span>
                                                        <strong>Model Used:</strong>{" "}
                                                        {predictionResults?.Model?.replace(/^Model\s*\d+:\s*/, "")}
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
                        //value={data}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Voter Allocation Params"
                        emptyMessage="No predictions found."
                        //header={header}
                        responsiveLayout="scroll"
                        resizableColumns
                        columnResizeMode="expand"
                        //filters={filters}
                        filterDisplay="menu"
                        globalFilterFields={["name"]}
                    >
                        <Column filterField="name" field="name" header="Prediction Level" sortable body={(item) => <b>{item.name}</b>}></Column>
                        <Column field="MinimumVotersPS" header="Prediction Title" sortable></Column>
                        <Column field="MinimumVotersPS" header="Prediction Meaning" sortable></Column>
                        <Column field="MinimumVotersPS" header="Triage target" sortable></Column>

                        <Column
                            field="action"
                            header="Action"
                            body={(item) => (
                                <>
                                    <Button
                                        // onClick={(e) => {
                                        //     setIsEdit(true);
                                        //     setShowDialog(true);
                                        // }}
                                        tooltip="Click to Edit"
                                        icon={"pi pi-pencil"}
                                        className="p-button-success p-button-rounded mr-2"
                                    />
                                    {/* <Button
                                        onClick={(e) => {
                                            setIsEdit(false);
                                            setShowDialog(true);
                                        }}
                                        tooltip="Click to View"
                                        icon={"pi pi-eye"}
                                        className=" p-button-rounded mr-2"
                                    /> */}
                                </>
                            )}
                        ></Column>
                    </DataTable>
                </div>
            </div >
        </div >
    );
};
