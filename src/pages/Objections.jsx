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
import AddObjections from "../componets/AddObjections";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import EventGroupService from "../service/EventGroupService";
import EventService from "../service/EventServices";

export const Objections = () => {
    const toast = useRef(null);
    var eventGroupService = new EventGroupService();
    var [eventGroup, setEventGroup] = useState([]);
    let [event, setEvent] = useState([]);
    var [selectedEvent, setSelectedEvent] = useState("Select an Event");
    const [showAddObjectionForm, setShowAddObjectionForm] = useState(false);
    const [objectionNumber, setObjectionNumber] = useState("");
    let [data, setData] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    var [objectionType, setObjectionType] = useState([]);
    var [SelectedObjectionTypeID, setselectedObjectionTypeID] = useState();
    var [objectionStatus, setObjectionStatus] = useState("");
    var [SelectedObjectionStatus, setselectedObjectionStatus] = useState("Select a status");
    const [selectedObjections, setSelectedObjections] = useState("");
    var [eventgroupHolder, setEvenGroupHolder] = useState({
        eventGroup: "Select an Event group",
    });
    var eventService = new EventService();

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
        eventGroupService.getAllEventGroups().then((data) => {
            setEventGroup(data);
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
    var [form, setForm] = useState({
        ObjectionType: "Select a Type",
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    function eventGroupHandler(e) {
        setEvenGroupHolder({ ...eventgroupHolder, eventGroup: e.value.Name });
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        if (id == null) return setEvent([]);
        eventService.getAllEvents(id).then((data) => {
            setEvent(data);
            setSelectedEvent("Select an Event");
        });
        setObjectionNumber("")
    }
    function searchHandler(e) {
        var id1 = SelectedObjectionTypeID ? SelectedObjectionTypeID : null;
        var id2 = SelectedObjectionStatus?.StatusID ? SelectedObjectionStatus?.StatusID : null;
        var id3 = selectedEvent?.EventID ? selectedEvent?.EventID : null;
        console.log(id1, id2, id3);
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2, id3).then((e) => {
            setData(e);
        });
    }
    function eventHandler(e) {
        setForm({ ...form, event: e.value.Name });
        setSelectedEvent(e.value);
        setObjectionNumber("")
    }
    function onRegistrationHandler(){
        setselectedObjectionStatus("Select a Status");
        setSelectedEvent("Select an Event");
        setForm({
            ObjectionType: "Select a Type",
        });
        setEvenGroupHolder({
            eventGroup: "Select an Event group",
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
            <Toast ref={toast} />
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="grid">
                                <div className="col-12  lg:col-2">
                                    <DropDown style={{ maxWidth: 300 }} label="Objection Type" optionLabel="Name" onChange={(e) => objectionTypeHandler(e)} options={objectionType} value={form.ObjectionType} />
                                </div>
                                <div className="col-12  lg:col-2">
                                    <DropDown style={{ maxWidth: 300 }} label="Objection Status" optionLabel="Name" onChange={(e) => objectionStatusHandler(e)} value={SelectedObjectionStatus} options={objectionStatus} />
                                </div>
                                <div className="col-12  lg:col-2">
                                    <DropDown style={{ maxWidth: 300 }} label="Event Group " optionLabel="Name" onChange={(e) => eventGroupHandler(e)} options={eventGroup} value={eventgroupHolder.eventGroup} />
                                </div>
                                <div className="col-12  lg:col-2">
                                    <DropDown style={{ maxWidth: 300 }} label="Event" optionLabel="Name" onChange={(e) => eventHandler(e)} options={event} value={selectedEvent} placeholder="Select an Event" />
                                </div>
                               
                                    <div className="col-12  lg:col-3">
                                    <div style={{ visibility: "hidden" }}>Search</div>
                                        <InputText type="search" placeholder="Search by Registration Number" value={objectionNumber} onChange ={onRegistrationHandler} onInput={(e) => setObjectionNumber(e.target.value)} style={{ width: "90%" }} />
                                        {/* <Button className="p-button-success ml-4" label="Search" onClick={submitForm} /> */}
                                    </div>
                              
                                <div className="col-12  lg:col-1">
                                    <div style={{ visibility: "hidden" }}>Search</div>
                                    <Button onClick={objectionNumber?.length > 11 ? submitForm : searchHandler} className="p-button-success ml-12" label="Search"></Button>
                                </div>
                            </div>
                        </div>
                    }
                ></Toolbar>
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Objection" onClick={(e) => setShowAddObjectionForm(true)} />
                        </div>
                    }
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

            <AddObjections show={showAddObjectionForm} setShow={setShowAddObjectionForm} />

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
                            {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" /> */}
                            <Button
                                style={{
                                    textAlign: "center",
                                    width: "30px",
                                    height: "30px",
                                }}
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
