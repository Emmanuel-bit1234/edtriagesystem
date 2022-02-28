import { FilterMatchMode, FilterOperator } from "primereact/api";
import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddEventGroup from "../componets/AddEventGroup";
import EventGroupService from "../service/EventGroupService";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from 'primereact/tabview'

export const EventGroup = () => {
    const [showAddEventGroupForm, setShowAddEventGroupForm] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    let [data, setData] = useState([]);

    const [selectedEventGroup, setSelectedEventGroup] = useState(null);

    function EventGroupDetails() {
        return [
            {
                name: "EventGroup Name:",
                value: selectedEventGroup?.Name,
            },
            {
                name: "EventGroup Description:",
                value: selectedEventGroup?.Description,
            },
            {
                name: "Status reason:",
                value: selectedEventGroup?.StatusReason,
            },
        ];
    }
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">EventGroups</h5>
        </div>
    );

    var eventGroupService = new EventGroupService();
    useEffect(() => {
        eventGroupService.getAllEventGroups().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);
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

    function activateHandler(id) {
        eventGroupService.activateEventGroup(id).then((res) => {
            eventGroupService.getAllEventGroups().then((data) => {
                console.log(data);
                setData(data);
            });
        });
    }

    function deActivateHandler(id) {
        eventGroupService.deActivateEventGroup(id).then((res) => {
            eventGroupService.getAllEventGroups().then((data) => {
                console.log(data);
                setData(data);
            });
        });
    }

    return (
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add EventGroup" onClick={(e) => setShowAddEventGroupForm(true)} />
                        </div>
                    }
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search EventGroup Name" />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>
            <Dialog
                header="EventGroup Details"
                visible={showDialog}
                style={{ width: "50%", height: "50%" }}
                modal
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="EventGroup Details">
                        <DataTable size="small" scrollable={true} value={EventGroupDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} field="name" body={(e) => <b>{e.name}</b>}></Column>
                            <Column field="value"></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>

            {/* add users */}
            <AddEventGroup show={showAddEventGroupForm} setShow={setShowAddEventGroupForm} />
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
                emptyMessage="No eventgroup found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedEventGroup}
                onSelectionChange={(e) => setSelectedEventGroup(e.value)}
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
                        parseInt(e.Status) == 1 ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
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

                            {parseInt(e.Status) == 1 ? (
                                <Button onClick={(a) => deActivateHandler(e.sysUser?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to De-Activate" />
                            ) : (
                                <Button onClick={(a) => activateHandler(e.sysUser?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Activate" />
                            )}
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-eye"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to View" 
                            onClick={(a) => {
                                setShowDialog(true)
                                setSelectedEventGroup(e)
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
