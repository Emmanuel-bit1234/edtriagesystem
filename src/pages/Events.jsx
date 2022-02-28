import { FilterMatchMode, FilterOperator } from "primereact/api";
import React from "react";
import { useState, useEffect } from "react";
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

export const Events = () => {
    const [showAddEventForn, setshowAddEventForn] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [objectionNumber, setObjectionNumber] = useState("");
    let [data, setData] = useState([]);
    const eventGroupOptions = [
        { key: "NAME1", name: "NAME1", label: "EventGroup1" },
        { key: "NAME2", name: "NAME2", label: "EventGroup2" },
        { key: "NAME3", name: "NAME3", label: "EventGroup3" },
    ];
    var [form, setForm] = useState({
        eventGroup: "SELECT AN OPTION",
    });
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

    function EventDetails() {
        return [
            {
                name: "Event Name:",
                value: selectedEvents?.Text,
            },
            {
                name: "Status:",
                value: selectedEvents?.Value,
            },
        ];
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Events</h5>
        </div>
    );

    var eventService = new EventService();
    useEffect(() => {
        eventService.getAllEvents().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);
    // function activateHandler(id) {
    //     eventService.activateEvent(id).then((res) => {
    //         eventGroupService.getAllEvents().then((data) => {
    //             console.log(data);
    //             setData(data);
    //         });
    //     });
    // }

    // function deActivateHandler(id) {
    //     eventService.deActivateEvent(id).then((res) => {
    //         eventGroupService.getAllEvents().then((data) => {
    //             console.log(data);
    //             setData(data);
    //         });
    //     });
    // }

    return (
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="">
                                <DropDown label={"Event Group"} options={eventGroupOptions} value={form.eventGroup} onChange={(e) => getInput("eventGroup", e)} />
                            </div>
                        </div>
                    }
                ></Toolbar>
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Event" onClick={(e) => setshowAddEventForn(true)} />
                        </div>
                    }
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
                visible={showDialog}
                style={{ width: "50%", height: "50%" }}
                modal
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Event Details">
                        <DataTable size="small" scrollable={true} value={EventDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} field="name" body={(e) => <b>{e.name}</b>}></Column>
                            <Column field="value"></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>

            {/* add users */}
            {/* <AddUsers show={showAddEventForn} setShow={setshowAddEventForn} /> */}
            <AddEvent show={showAddEventForn} setShow={setshowAddEventForn} />
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
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                emptyMessage="No Events found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedEvents}
                onSelectionChange={(e) => setSelectedEvents(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="Text"
                globalFilterFields={["Text"]}
            >
                <Column field="Text" header="Name" sortable></Column>
                <Column
                    field="active"
                    header="Status"
                    body={(e) =>
                        parseInt(e.Value) == 1 ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                    // body={(e) =>
                    // <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" />

                    // }
                    sortable
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-success p-button-rounded mr-2 " tooltip="Click to Edit" />

                            {parseInt(e.Value) == 1 ? (
                                <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to De-Activate" />
                            ) : (
                                <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Activate" />
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
                                }}
                            />
                            {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to De-Activate" />

                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Activate" />

                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-success p-button-rounded mr-2 " tooltip="Click to Edit" /> */}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
