import React from "react";
import { useState, useEffect } from "react";
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
import EventGroupService from "../service/EventGroupService";
import EventService from "../service/EventServices";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";

export const Adjudication = () => {
    var eventGroupService = new EventGroupService();
    const [showAddObjectionForm, setShowAddObjectionForm] = useState(false);
    const [objectionNumber, setObjectionNumber] = useState("");
    var [objectionStatus, setObjectionStatus] = useState([]);
    let [data, setData] = useState([]);
    var [objectionType, setObjectionType] = useState([]);
    var [SelectedObjectionTypeID, setselectedObjectionTypeID] = useState();
    var [SelectedObjectionType, setselectedObjectionType] = useState();
    var [SelectedObjectionStatus, setselectedObjectionStatus] = useState("SELECT A STATUS");
    var [eventGroup, setEventGroup] = useState([]);
    let [event, setEvent] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    var [selectedEvent, setSelectedEvent] = useState("SELECT AN EVENT");

    const [selectedObjections, setSelectedObjections] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    var [eventgroupHolder, setEvenGroupHolder] = useState({
        eventGroup: "SELECT AN EVENT GROUP",
    });
    var eventService = new EventService();
    function eventGroupHandler(e) {
        setEvenGroupHolder({ ...eventgroupHolder, eventGroup: e.value.Name });
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        if (id == null) return setEvent([]);
        eventService.getAllEvents(id).then((data) => {
            setEvent(data);
            setSelectedEvent("SELECT AN EVENT")
        });
    }
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
        var id1 = e.value?.ObjectionTypeID ? e.value?.ObjectionTypeID : null;
        var id2 = SelectedObjectionStatus.StatusID;
        var id3 = selectedEvent.EventID;
        console.log("Selected type", id1)
        console.log("Selected Status", id2)
        console.log("Selected Event", id3)
        if (id1 == null) return setData([]);
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2, id3).then((e) => {
            setData(e);
        });
    }
    function objectionStatusHandler(e) {
        setForm({ ...form, ObjectionStatus: e.value });
        setselectedObjectionStatus(e.value);
        var id1 = SelectedObjectionTypeID;
        var id2 = e.value?.StatusID ? e.value?.StatusID : null;
        var id3 = selectedEvent.EventID;
        if (id2 == null) return setData([]);
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2, id3).then((e) => {
            setData(e);
        });
    }
    function eventHandler(e) {
        setForm({ ...form, event: e.value.Name });
        setSelectedEvent(e.value);
        var id1 = SelectedObjectionTypeID;
        var id2 = SelectedObjectionStatus?.StatusID
        var id3 = e.value?.EventID ? e.value?.EventID : null;
        if (id3 == null) return setData([]);
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2, id3).then((e) => {
            setData(e);
        });
    }
    var [form, setForm] = useState({
        ObjectionType: "SELECT A TYPE",
        ObjectionStatus: "SELECT A STATUS",
        Event: "SELECT AN EVENT",
        EventGroup: "SELECT AN EVENT GROUP",
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    function ObjectionDetails() {
        return [
            {
                name: "Registration number",
                value: selectedObjections?.RegistrationNumber
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

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Objections</h5>
        </div>
    );

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
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="grid">
                                <div className="col-12  lg:col-3">
                                    <DropDown label="Objection Type" optionLabel="Name" onChange={(e) => objectionTypeHandler(e)} options={objectionType} value={form.ObjectionType} />
                                </div>
                                <div className="col-12  lg:col-3">
                                    <DropDown label="Objection Status" optionLabel="Name" onChange={(e) => objectionStatusHandler(e)} value={SelectedObjectionStatus} options={objectionStatus} />
                                </div>
                                <div className="col-12  lg:col-3">
                                    <DropDown label="Event Group " optionLabel="Name" onChange={(e) => eventGroupHandler(e)} options={eventGroup} value={eventgroupHolder.eventGroup} />
                                </div>
                                <div className="col-12  lg:col-3">
                                    <DropDown label="Event" optionLabel="Name" onChange={(e) => eventHandler(e)} options={event} value={selectedEvent} placeholder="Select an Event" />
                                </div>
                            </div>
                        </div>
                    }
                ></Toolbar>
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="">
                                <InputText type="search" placeholder="Search by Registration Number" value={objectionNumber} onInput={(e) => setObjectionNumber(e.target.value)} style={{ width: "250px" }} />
                                <Button className="p-button-success ml-4" label="Search" onClick={submitForm} />
                            </div>
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
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-eye"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to View" onClick={(a) => {
                                    setShowDialog(true);
                                    setSelectedObjections(e);
                                }} />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" />
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
