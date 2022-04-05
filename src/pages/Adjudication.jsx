import React from "react";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import DropDown from "../componets/DropDown";
import ObjectionsService from "../service/ObjectionsService";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";

export const Adjudication = () => {
    const [objectionNumber, setObjectionNumber] = useState("");
    var [objectionStatus, setObjectionStatus] = useState([]);
    let [data, setData] = useState([]);
    var [objectionType, setObjectionType] = useState([]);
    var [SelectedObjectionTypeID, setselectedObjectionTypeID] = useState();
    var [SelectedObjectionType, setselectedObjectionType] = useState();
    var [SelectedObjectionStatus, setselectedObjectionStatus] = useState("Select a Status");
    var [SelectedObjectionStatusForAdjuducate, setSelectedObjectionStatusForAdjuducate] = useState("Select a status");
    const [showDialog, setShowDialog] = useState(false);
    const [showAdjudicateObjection, setshowAdjudicateObjection] = useState(false);
    const toast = useRef(null);
    const [selectedObjections, setSelectedObjections] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    var objectionTypeService = new ObjectionsService();
    var objectionStatusService = new ObjectionsService();
    useEffect(() => {
        objectionTypeService.getAllObjectionType().then((data) => {
            setObjectionType(data);
        });
        objectionStatusService.getAllObjectionStatuses().then((data) => {
            setObjectionStatus(data);
        });
    }, []);
    function objectionTypeHandler(e) {
        setForm({ ...form, ObjectionType: e.value });
        setselectedObjectionTypeID(e.value.ObjectionTypeID);
        setObjectionNumber("")
    }
    function objectionStatusHandler(e) {
        setForm({ ...form, ObjectionStatus: e.value });
        setselectedObjectionStatus(e.value);
        setObjectionNumber("")
    }

    function objStatusHandler(e) {
        setadjForm({ ...adjForm, ObjectionStatusID: e.value.StatusID });
        setSelectedObjectionStatusForAdjuducate(e.value);
    }
    var [form, setForm] = useState({
        ObjectionType: "Select a Type",
        ObjectionStatus: "Select a Status",
        Event: "Select an Event",
        EventGroup: "Select an Event Group",
    });
    var [adjForm, setadjForm] = useState({
        ObjectionStatusID: "",
        StatusReason: "",
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    function searchHandler(e) {
        var id1 = SelectedObjectionTypeID ? SelectedObjectionTypeID : null;
        var id2 = SelectedObjectionStatus?.StatusID ? SelectedObjectionStatus?.StatusID : null;
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2).then((e) => {
            setData(e);
        });
    }
    function onRegistrationHandler(){
        setselectedObjectionStatus("Select a Status");
        setForm({
            ObjectionType: "Select a Type",
        });
    }
    function submitAdjudication() {
        var id1 = selectedObjections?.ObjectionID;
        var id2 = adjForm?.ObjectionStatusID;
        var reason = adjForm?.StatusReason;
        if (reason == "" || adjForm?.ObjectionStatusID == "") {
            return toast.current.show({
                severity: "error",
                summary: "Error Message",
                detail: "The Status Reason and Objection Status cannot be empty ",
                life: 2000,
            });
        }
        objectionsService.adjudicateObjection(id1, id2, reason).then((e) => {
            var i1 = SelectedObjectionTypeID ? SelectedObjectionTypeID : null;
            var i2 = SelectedObjectionStatus?.StatusID ? SelectedObjectionStatus?.StatusID : null;
            objectionsService.getObjectionsByTypeStatusAndEvent(i1, i2).then((e) => {
                setData(e);
                setshowAdjudicateObjection(false);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "Objecction adjudicated successfully",
                    life: 2000,
                });
            });
        });
    }
    function ObjectionDetails() {
        return [
            {
                name: "Registration number",
                value: selectedObjections?.RegistrationNumber,
            },
            {
                name: "Name",
                value: selectedObjections?.ObjectionType,
            },
            {
                name: "Date Lodged",
                value: selectedObjections?.DateLodged,
            },
            {
                name: "Objection Description",
                value: selectedObjections?.ObjectionDescription,
            },
            {
                name: "Lodged By",
                value: selectedObjections?.LodgedBy,
            },
            {
                name: "Captured By",
                value: selectedObjections?.CapturedBy,
            },
            {
                name: "Objection Status",
                value: selectedObjections?.ObjectionStatus,
            },
            {
                name: "Status Reason",
                value: selectedObjections?.ObjectionStatusReason,
            },
        ];
    }

    const header = <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">{data?.length > 1 ? <h5 className="m-0">Objections - ({data?.length} Objections) </h5> : <h5 className="m-0">Objections - ({data?.length} Objection)</h5>}</div>;
    var objectionsService = new ObjectionsService();
    function submitForm() {
        console.log(objectionNumber);
        objectionsService.getObjectionsByID(objectionNumber).then((e) => {
            console.log(e);
            setData(e);
        });
    }
    return (
        <div className="card  p-align-stretch vertical-container">
            <div className="">
                <Toast ref={toast} />
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="grid">
                                <div className="col-12  lg:col-3">
                                    <DropDown style={{ maxWidth: 300 }} label="Objection Type" optionLabel="Name" onChange={(e) => objectionTypeHandler(e)} options={objectionType} value={form.ObjectionType} />
                                </div>
                                <div className="col-12  lg:col-3">
                                    <DropDown style={{ maxWidth: 300 }} label="Objection Status" optionLabel="Name" onChange={(e) => objectionStatusHandler(e)} value={SelectedObjectionStatus} options={objectionStatus} />
                                </div>
                                <div className="col-12  lg:col-4">
                                    <div style={{ visibility: "hidden" }}>Search</div>
                                    <InputText type="search" placeholder="Search by Registration Number" value={objectionNumber} onChange ={onRegistrationHandler} onInput={(e) => setObjectionNumber(e.target.value)} style={{ width: "90%" }}/>
                                    {/* <Button className="p-button-success ml-4" label="Search" onClick={submitForm} />   */}
                                </div>

                                <div className="col-12  lg:col-2">
                                    <div style={{ visibility: "hidden" }}>Search</div>
                                    <Button onClick={objectionNumber?.length > 11 ? submitForm : searchHandler} className="p-button-success ml-12" label="Search"></Button>
                                </div>
                            </div>
                        </div>
                    }
                ></Toolbar>
                <Toolbar
                    className="mb-4"
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Objection" />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>
            <Dialog
                draggable={false}
                header={<h4>Objection Details</h4>}
                style={{ width: "75%", height: "75%" }}
                modal
                visible={showDialog}
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Objection">
                        <DataTable size="small" scrollable={true} value={ObjectionDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} body={(e) => <b>{e.name}</b>}></Column>
                            <Column body={(e) => e.value}></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>

            <Dialog
                draggable={false}
                header="Adjudicate Objection"
                footer={
                    <>
                        <Button label="Adjudicate" onClick={submitAdjudication} className="p-button-success" icon="pi pi-plus" type="submit" />
                    </>
                }
                visible={showAdjudicateObjection}
                style={{ width: "95%", height: "95%" }}
                modal
                onHide={(e) => {
                    setshowAdjudicateObjection(false);
                }}
            >
                <div className="grid">
                    <div className="col-12  lg:col-4">
                        <TextInput label="Registration Number" value={selectedObjections?.RegistrationNumber} disabled={true} />
                    </div>
                    <div className="col-12  lg:col-4">
                        <TextInput label="Lodged By" value={selectedObjections?.LodgedBy} disabled={true} />
                    </div>
                    <div className="col-12  lg:col-4">
                        <TextInput label="Description" value={selectedObjections?.Description} disabled={true} />
                    </div>
                    <div className="col-12  lg:col-4">
                        <TextInput label="Objection Type" value={selectedObjections?.ObjectionType} disabled={true} />
                    </div>
                    <div className="col-12  lg:col-4">
                        <TextInput label=" Status Reason" value={adjForm.StatusReason} onChange={(e) => setadjForm({ ...adjForm, StatusReason: e.target.value })} />
                    </div>
                    <div className="col-12  lg:col-4">
                        <DropDown label="Objection Status" optionLabel="Name" onChange={(e) => objStatusHandler(e)} value={SelectedObjectionStatusForAdjuducate} options={objectionStatus} />
                    </div>
                </div>
            </Dialog>

            <DataTable
                size="small"
                scrollable={true}
                value={data}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                emptyMessage="No Objections found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedObjections}
                onSelectionChange={(e) => setSelectedObjections(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="ObjectionType"
                globalFilterFields={["ObjectionType"]}
            >
                <Column field="ObjectionType" header="Objection Type" sortable></Column>
                <Column field="DateLodged" header="Date Lodged" sortable></Column>
                <Column field="RegistrationNumber" header="Registration Number"></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            {e.ObjectionStatus == "Captured" ? (
                                <Button
                                    style={{ textAlign: "center", width: "30px", height: "30px" }}
                                    icon="pi pi-pencil"
                                    tooltip="Click to Adjudicate"
                                    className="p-button-rounded p-button-success mr-2"
                                    onClick={(a) => {
                                        setshowAdjudicateObjection(true);
                                        setSelectedObjections(e);
                                    }}
                                />
                            ) : (
                                <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" tooltip="Click to Adjudicate" className="p-button-rounded p-button-success mr-2" />
                            )}

                            <Button
                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                icon={"pi pi-eye"}
                                tooltipOptions={{ position: "top" }}
                                className="p-button-primary p-button-rounded mr-2"
                                tooltip="Click to View"
                                onClick={(a) => {
                                    setShowDialog(true);
                                    setSelectedObjections(e);
                                }}
                            />
                            {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" /> */}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
