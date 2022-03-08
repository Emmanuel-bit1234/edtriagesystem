import { FilterMatchMode, FilterOperator } from "primereact/api";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddEventGroup from "../componets/AddEventGroup";
import EventGroupService from "../service/EventGroupService";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import TextInput from "../componets/TextInput";

export const EventGroup = () => {
    const toast = useRef(null);
    const [showAddEventGroupForm, setShowAddEventGroupForm] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [editDialog, seEditDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    let [data, setData] = useState([]);

    const [selectedEventGroup, setSelectedEventGroup] = useState(null);

    const [showEditForm, setShowEditForm] = useState(false);
    const [showEditEventGroup, setshowEditEventGroup] = useState(false);
    const [editInput, setEditInput] = useState("");

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

    function onEditHandler()
    {
        eventGroupService.updateEventGroup(selectedEventGroup).then((response) => {
            console.log(response)
            eventGroupService.getAllEventGroups().then((data) => {
                console.log(data);
                setData(data);
                setshowEditEventGroup(false);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "Event Group was updated successfully",
                    life: 2000,
                });
            });
        })
    }
    function activateHandler(id) {
        eventGroupService.activateEventGroup(id).then((res) => {
            eventGroupService.getAllEventGroups().then((data) => {
                console.log(data);
                setData(data);
            });
        });
    }

    function deActivateHandler() {
        if (editInput.trim().length == 0)
            return toast.current.show({
                severity: "error",
                summary: "Error Message",
                detail: "please fill the required field",
                life: 3000,
            });
        var id = selectedEventGroup?.EventGroupID;

        eventGroupService.deActivateEventGroup(id, editInput).then((e) => {
            eventGroupService.getAllEventGroups().then((data) => {
                setData(data);
                setShowEditForm(false);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "Event Group was de-activated successfully",
                    life: 2000,
                });
            });
        });
    }

    return (
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
            <div className="">
                <Toast ref={toast} />
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
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search By EventGroup Name" />
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

            <Dialog
                header="EventGroup Details"
                visible={showEditForm}
                style={{ width: "50%", height: "50%" }}
                modal
                onHide={(e) => {
                    setShowEditForm(false);
                }}
            >
                <div className="grid">
                    <div className="col-12">
                        <label>
                            Reason for <b> {selectedEventGroup?.Name}</b>
                        </label>
                    </div>
                    <div className="col-12">
                        <InputTextarea value={editInput} style={{ width: "100%" }} onChange={(e) => setEditInput(e.target.value)} />
                    </div>
                    <div className="col-12">
                        <Button className="p-button-success" label="Submit" onClick={deActivateHandler} />
                    </div>
                </div>
            </Dialog>
            <Dialog
                header="Edit EventGroup"
                footer={
                    <>
                        <Button
                            label="Submit"
                            onClick={onEditHandler}
                            className="p-button-success"
                            icon="pi pi-plus"
                            type="submit"
                        />
                    </>
                }
                visible={showEditEventGroup}
                style={{ width: "50%", height: "50%" }}
                modal
                onHide={(e) => {
                    setshowEditEventGroup(false);
                }}
            >
            <TextInput label="Name" value={selectedEventGroup?.Name} disabled ={true}/><br/>
            <TextInput label="Description" value={selectedEventGroup?.Description} onChange={(e) => setSelectedEventGroup({ ...selectedEventGroup, Description: e.target.value })} /><br/>
            {/* <TextInput label="Reason" value={selectedEventGroup?.StatusReason} disabled ={true} /> */}
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
                    sortable
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            {parseInt(e.Status) == 1 ? (
                                <Button
                                    style={{ textAlign: "center", width: "30px", height: "30px" }}
                                    icon={"pi pi-pencil"}
                                    className="p-button-primary p-button-rounded mr-2 "
                                    tooltip="Click to Edit"
                                    onClick={(a) => {
                                        setshowEditEventGroup(true);
                                        setSelectedEventGroup(e);
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
                                    setSelectedEventGroup(e);
                                }}
                            />
                            {parseInt(e.Status) == 1 ? (
                                <Button
                                    onClick={(a) => {
                                        setShowEditForm(true);
                                        setSelectedEventGroup(e);
                                    }}
                                    style={{ textAlign: "center", width: "30px", height: "30px" }}
                                    icon={"pi pi-times"}
                                    className="p-button-danger p-button-rounded mr-2"
                                    tooltip="Click to De-Activate"
                                />
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
