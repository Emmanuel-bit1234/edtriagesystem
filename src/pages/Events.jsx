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
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";

export const Events = () => {
    const toast = useRef(null);
    const [showAddEventForn, setshowAddEventForn] = useState(false);
    const [showEditEvent, setshowEditEvent] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [objectionNumber, setObjectionNumber] = useState("");
    let [data, setData] = useState([]);
    let [ByElecData, setByElecData] = useState([]);
    var [form, setForm] = useState({
        eventGroup: "SELECT AN EVENT GROUP",
    });
    var eventGroupService = new EventGroupService();
    var [eventGroup, setEventGroup] = useState([]);
    var [form2, setForm2] = useState({
        Name: "",
        Description: "",
        EventDate: "",
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
    function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }
    function submitByElection() {
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
        if (error == true) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
            return false;
        }
    }
    useEffect(() => {
        eventGroupService.getAllEventGroups().then((data) => {
            setEventGroup(data);
            console.log(data);
        });
    }, []);

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
        setForm({ ...form, eventGroup: e.value });
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        if (id == null) return setData([]);
        eventService.getAllEvents(id).then((data) => {
            setData(data);
        });
    }

    return (
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="">
                                <DropDown label={"Event Group"} optionLabel="Name" onChange={(e) => eventHandler(e)} options={eventGroup} value={form.eventGroup} />
                            </div>
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
                header="Event Details"
                footer={<></>}
                visible={showEditEvent}
                style={{ width: "50%", height: "60%" }}
                modal
                onHide={(e) => {
                    setshowEditEvent(false);
                }}
            >
                <TabView>
                    <TabPanel header="Edit Event">
                        <TextInput label="Name" value={selectedEvents?.Name} disabled={true} /> <br />
                        <TextInput label="Description" value={selectedEvents?.Description} onChange={(e) => setSelectedEvents({ ...selectedEvents, Description: e.target.value })} /> <br />
                        <Button
                            label="Submit"
                            // onClick={onEditHandler}
                            className="p-button-success"
                            icon="pi pi-plus"
                            type="submit"
                        />
                    </TabPanel>
                    <TabPanel header="Add By-Election">
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
                        </div>
                        <br />
                        <Button label="Submit" onClick={submitByElection} className="p-button-success" icon="pi pi-plus" type="submit" />
                    </TabPanel>
                </TabView>
            </Dialog>

            <Dialog
                header="Event Details"
                visible={showDialog}
                style={{ width: "70%", height: "70%" }}
                modal
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Event Details">
                        <DataTable size="small" scrollable={true} value={EventDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
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
                            paginator
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
                                sortable
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
                                                console.log(e);
                                            }}
                                        />
                                        {parseInt(e.IsActive) == 1 ? (
                                            <Button onClick={(aa) => deActivateHandler(e)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to De-Activate" />
                                        ) : (
                                            <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Activate" />
                                        )}
                                    </>
                                )}
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
                        parseInt(e.IsActive) == 1 ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                    sortable
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
                                    console.log(e);
                                }}
                            />
                            {parseInt(e.IsActive) == 1 ? (
                                <Button onClick={(aa) => deActivateHandler(e)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to De-Activate" />
                            ) : (
                                <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Activate" />
                            )}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
