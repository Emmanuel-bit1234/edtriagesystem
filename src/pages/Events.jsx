import { FilterMatchMode, FilterOperator } from "primereact/api";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import DropDown from "../componets/DropDown";
import EventService from "../service/EventServices";
import AddEvent from "../componets/AddEvent";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import EventGroupService from "../service/EventGroupService";
import EventTypeService from "../service/EventTypeService";
import { Toast } from "primereact/toast";

export const Events = () => {
    const toast = useRef(null);
    const [showAddEventForn, setshowAddEventForn] = useState(false);
    const [showEditEvent, setshowEditEvent] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [eventType, setEventType] = useState(false);
    var [selectedEventType, setSelectedEventType] = useState("SELECT AN EVENT TYPE");
    var [selectedEventGroupID, setselectedEventGroupID] = useState([]);
    const [objectionNumber, setObjectionNumber] = useState("");
    let [data, setData] = useState([]);
    let [ByElecData, setByElecData] = useState([]);
    let [ActiveByElecData, setActiveByElecData] = useState([]);
    var [form, setForm] = useState({
        eventGroup: "SELECT AN EVENT GROUP",
        eventType: "SELECT AN EVENT TYPE",
    });
    var eventGroupService = new EventGroupService();
    var eventTypeService = new EventTypeService();
    var [eventGroup, setEventGroup] = useState([]);
    var [form2, setForm2] = useState({
        Name: "",
        Description: "",
        EventDate: "",
        EventGroupID: null,
        SelectedEventCategory: null,
        SelectedEventType: null,
        SelectedParentEvent: null,
    });
    const [showEditForm, setShowEditForm] = useState(false);

    function deActivateHandler(e) {
        eventService.deActivateEvent(e.EventID).then((e) => {
            var id = form.eventGroup?.EventGroupID ? form.eventGroup?.EventGroupID : null;
            if (id == null) return setData([]);
            eventService.getAllEvents(id).then((data) => {
                setData(data);
            });
        });
    }
    function deActivateByelectionHandler() {
        eventService.deActivateByElection(ActiveByElecData[0]?.EventID).then((e) => {
            eventService.getByElections(selectedEvents?.EventID).then((data) => {
                setActiveByElecData(data);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "By-election de-activated successfully",
                    life: 2000,
                });
            });
        });
    }
    function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }
    var submittedForm = false;
    function submitByElection() {
        form2.EventGroupID = form.eventGroup.EventGroupID;
        form2.SelectedParentEvent = selectedEvents?.EventID;
        console.log(selectedEvents.EventDate_s)
        var newForm = {};
        Object.keys(form2).map((key) => {
            newForm[key] = form2[key];
        });
        newForm["EventDate"] = formatDate(form2.EventDate) + " 00:00";
        var error = false;
        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value === "") {
                error = true;
            }
        });
        const date1 = new Date(selectedEvents.EventDate_s)
        const date2 = new Date(newForm["EventDate"]);
        const diffTime = date2 - date1;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "Invalid date, the date of the By-Election should be at least a day after the Event", life: 5000 });
            return false;
        }
        console.log(diffDays + " days");
        console.log(new Date);
        console.log(newForm);
        if (error == true) {
            toast.current.show({
                severity: "error",
                summary: "Error Message",
                detail: "please fill the required fields",
                life: 2000,
            });
            return false;
        }
        var eventService = new EventService();
        eventService
            .createEvent(newForm)
            .then((res) => {
                submittedForm = true;
                eventService.getAllEvents(form.eventGroup.EventGroupID).then((data) => {
                    setData(data);
                    setshowEditEvent(false);
                    setForm2(" ");
                    return toast.current.show({
                        severity: "success",
                        summary: "Success Message",
                        detail: "By-election was added successfully",
                        life: 2000,
                    });
                });
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({
                    severity: "error",
                    summary: "Error Message",
                    detail: "Ooops, The is a technical problem,Please Try Again",
                    life: 3000,
                });
            });
    }
    useEffect(() => {
        eventGroupService.getAllEventGroups().then((data) => {
            setEventGroup(data);
            console.log(data);
        });
        eventTypeService.getEventTypes().then((data) => {
            setEventType(data);
        });
    }, []);
    function byElectionHandler() {
        eventService.getByElections(selectedEvents?.EventID).then((data) => {
            setByElecData(data);
        });
        eventService.getActiveByElections(selectedEvents?.EventID).then((data) => {
            setActiveByElecData(data);
        })
    }

    var getInput = (key, ev) => {
        setForm({ ...form, [key]: ev.value });
    };
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    const [selectedEvents, setSelectedEvents] = useState(null);
    const [selectedByElection, setSelectedByElection] = useState(null);

    function EventDetails() {
        return [
            {
                name: "Name",
                value: selectedEvents?.Name,
            },
            {
                name: "Description",
                value: selectedEvents?.Description,
            },
        ];
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Events</h5>
        </div>
    );
    var eventService = new EventService();
    function eventHandler(e) {
        setselectedEventGroupID(e.value.EventGroupID);
        setForm({ ...form, eventGroup: e.value });
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        if (id == null) return setData([]);
        eventService.getAllEvents(id).then((data) => {
            setData(data);
            setSelectedEventType("SELECT AN EVENT TYPE");
        });
    }
    function typeHandler(e) {
        setSelectedEventType(e.value);
        setForm({ ...form, eventType: e.value });
        var id1 = selectedEventGroupID;
        if (id1 == "") {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "An event group should be selected first", life: 4000 });
            return false;
        }
        if (id1 != "") {
            var id2 = e.value?.Value ? e.value.Value : null;
            if (id2 == null) return setData([]);
            eventService.getEventBasedOnGroupAndType(id1, id2).then((data) => {
                setData(data);
            });
        }
    }
    return (
        <div className="card  p-align-stretch vertical-container">
            <Toast ref={toast} />
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <div className="grid">
                                    <div className="col-12  lg:col-5">
                                        <DropDown style={{maxWidth: 300}} label={"Event Group"} optionLabel="Name" onChange={(e) => eventHandler(e)} options={eventGroup} value={form.eventGroup}  className="ml-4" />
                                    </div>
                                    <div className="col-12  lg:col-5">
                                        <DropDown style={{maxWidth: 300}} label={"Event Type"} options={eventType} onChange={(e) => typeHandler(e)} optionLabel="Text" value={selectedEventType} className="ml-4" />
                                    </div>
                                </div>
                            </span>
                        </div>
                    }
                ></Toolbar>
                <Toolbar
                    className="mb-4"
                    left={<div>{form?.eventGroup?.Status == 1 ? <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Event" onClick={(e) => setshowAddEventForn(true)} /> : <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Event" disabled />}</div>}
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Event Name" />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>
            <Dialog
                draggable={false}
                header={<h4>{`Event Details - ${selectedEvents?.Name} `}</h4>}
                footer={<></>}
                visible={showEditEvent}
                style={{ width: "95%", height: "95%" }}
                modal
                onShow={() => {
                    byElectionHandler();
                }}
                onHide={(e) => {
                    setshowEditEvent(false);
                }}
            >
                <TabView>
                    <TabPanel header="Edit Event">
                        <div className="grid">
                            <div className="col-12  lg:col-6">
                                <TextInput label="Name" value={selectedEvents?.Name} disabled={true} />
                            </div>
                            <div className="col-12  lg:col-6">
                                <TextInput label="Description" value={selectedEvents?.Description} onChange={(e) => setSelectedEvents({ ...selectedEvents, Description: e.target.value })} />
                            </div>
                        </div>
                        <Button
                            label="Submit"
                            // onClick={onEditHandler}
                            className="p-button-success"
                            icon="pi pi-plus"
                            type="submit"
                        />
                    </TabPanel>
                    <TabPanel header="By-Elections">
                        {ActiveByElecData?.length > 0 && ActiveByElecData[0]?.IsActive == 1 ? (
                            <DataTable
                                size="small"
                                scrollable={true}
                                value={ActiveByElecData}
                                dataKey="id"
                                rows={5}
                                className="datatable-responsive"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} By-Elections"
                                emptyMessage="No By-Election found."
                                eventGroup=""
                                responsiveLayout="scroll"
                                selection={selectedByElection}
                                onSelectionChange={(e) => setSelectedByElection(e.value)}
                                resizableColumns
                                columnResizeMode="expand"
                                filters={filters}
                                filterDisplay="Name"
                                globalFilterFields={["Name"]}
                            >
                                <Column field="Name" header="Name" sortable></Column>
                                <Column field="Description" header="Description"></Column>
                                <Column field="EventDate_s" header="Date"></Column>
                                <Column
                                    field="active"
                                    header="Status"
                                    body={(e) =>
                                        parseInt(e.IsActive) == 1 ? (
                                            <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" />
                                        ) : (
                                            <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                                        )
                                    }
                                ></Column>
                                <Column
                                    field="actions"
                                    header="Actions"
                                    body={(e) => (
                                        <>
                                            <Button
                                                onClick={(a) => {
                                                    deActivateByelectionHandler();
                                                }}
                                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                                icon={"pi pi-times"}
                                                className="p-button-danger p-button-rounded mr-2"
                                                tooltip="Click to De-Activate"
                                            />
                                        </>
                                    )}
                                ></Column>
                            </DataTable>
                        ) : (
                            <div className="grid">
                                <div className="col-12  lg:col-4">
                                    <TextInput label="Event Name" value={form2.Name} onChange={(e) => setForm2({ ...form2, Name: e.target.value })} />
                                </div>
                                <div className="col-12  lg:col-4">
                                    <TextInput label="Description" value={form2.Description} onChange={(e) => setForm2({ ...form2, Description: e.target.value })} />
                                </div>
                                <div className="col-12  lg:col-4">
                                    <TextInput type="Calendar" label="Event Date" value={form2.EventDate} onChange={(e) => setForm2({ ...form2, EventDate: e.target.value })} />
                                </div>
                                <br />
                                <Button label="Add By-Election" onClick={submitByElection} className="p-button-success" icon="pi pi-plus" type="submit" />
                            </div>
                        )}
                    </TabPanel>
                </TabView>
            </Dialog>

            <Dialog
                draggable={false}
                header={
                    <>
                        <li className="pi pi-eye"> </li>
                        <span>{` Event Details - ${selectedEvents?.Name} `}</span>
                    </>
                }
                visible={showDialog}
                style={{ width: "95%", height: "95%" }}
                modal
                onShow={() => {
                    byElectionHandler();
                }}
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Event Details">
                        <DataTable size="small" scrollable={true} value={
                            EventDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} body={(e) => <b>{e.name}</b>}></Column>
                            <Column body={(e) => e.value}></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="By-Elections">
                        <DataTable
                            size="small"
                            scrollable={true}
                            value={ByElecData}
                            dataKey="id"
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} By-Elections"
                            emptyMessage="No By-Election found."
                            eventGroup=""
                            responsiveLayout="scroll"
                            selection={selectedByElection}
                            onSelectionChange={(e) => setSelectedByElection(e.value)}
                            resizableColumns
                            columnResizeMode="expand"
                            filters={filters}
                            filterDisplay="Name"
                            globalFilterFields={["Name"]}
                        >
                            <Column field="Name" header="Name" sortable></Column>
                            <Column field="Description" header="Description"></Column>
                            <Column field="EventDate_s" header="Date"></Column>
                            <Column
                                field="active"
                                header="Status"
                                body={(e) =>
                                    parseInt(e.IsActive) == 1 ? (
                                        <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" />
                                    ) : (
                                        <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                                    )
                                }
                            ></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>

            {/* add event */}
            <AddEvent show={showAddEventForn} setShow={setshowAddEventForn} setData={setData} eventGroup={form.eventGroup} />
            {/* end */}

            <DataTable
                size="small"
                scrollable={true}
                value={data}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Events"
                emptyMessage="No Events found."
                header={header}
                eventGroup=""
                responsiveLayout="scroll"
                selection={selectedEvents}
                onSelectionChange={(e) => setSelectedEvents(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="Name"
                globalFilterFields={["Name"]}
            >
                <Column field="Name" header="Name" sortable></Column>
                <Column
                    field="active"
                    header="Status"
                    body={(e) =>
                        parseInt(e.IsActive) === 1 ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            {parseInt(e.IsActive) == 1 ? (
                                <Button
                                    style={{ textAlign: "center", width: "30px", height: "30px" }}
                                    icon={"pi pi-pencil"}
                                    className="p-button-primary p-button-rounded mr-2 "
                                    tooltip="Click to Edit"
                                    onClick={(a) => {
                                        setshowEditEvent(true);
                                        setSelectedEvents(e);
                                    }}
                                />
                            ) : (
                                <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-primary p-button-rounded mr-2 " tooltip="Click to Edit" />
                            )}
                            <Button
                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                icon={"pi pi-eye"}
                                tooltipOptions={{ position: "top" }}
                                className="p-button-primary p-button-rounded mr-2"
                                tooltip="Click to View"
                                onClick={(a) => {
                                    setShowDialog(true);
                                    setSelectedEvents(e);
                                    console.log(e.EventID);
                                }}
                            />
                            {/* {parseInt(e.IsActive) == 1 ? (
                                <Button onClick={(aa) => deActivateHandler(e)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to De-Activate" />
                            ) : (
                                <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Activate" />
                            )} */}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
