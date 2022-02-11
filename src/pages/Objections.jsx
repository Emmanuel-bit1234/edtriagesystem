import React from "react";
import { useState, useEffect} from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import DropDown from "../componets/DropDown";
import ObjectionsService from "../service/ObjectionsService";
import AddObjections from "../componets/AddObjections";

export const Objections = () => {
    const [showAddObjectionForm, setShowAddObjectionForm] = useState(false);
    let [data, setData] = useState([
        {
            name: "Mark",
            DateLodged: "",
            IDNumber: "",
            RegistrationNumber: "",
            actions: (
                <>
                    <Button icon={"pi pi-pencil"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Delete" />
                    <Button icon={"pi pi-trash"} className="p-button-danger p-button-rounded" tooltip="Click to Delete" />
                </>
            ),
        },
    ]);
    const eventGroupOptions = [
        { key: "NAME1", name: "NAME1", label: "EventGroup1" },
        { key: "NAME2", name: "NAME2", label: "EventGroup2" },
        { key: "NAME3", name: "NAME3", label: "EventGroup3" },
    ];
    var [form, setForm] = useState({
        eventGroup: "SELECT AN OPTION",
        event: "SELECT AN OPTION",
        registration: "SELECT AN OPTION",
    });
    var getInput = (key, ev) => {
        setForm({ ...form, [key]: ev.value });
    };

    const [selectedObjections, setSelectedObjections] = useState(null);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Objections</h5>
        </div>
    );

    var objectionsService = new ObjectionsService();
    useEffect(() => {
        objectionsService.getAllObjections().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);
    return (
        <div className="card  p-align-stretch vertical-container" style={{height: "calc(100vh - 9rem)"}}>
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="grid  p-grid p-align-stretch vertical-container">
                                <div className="col-12 lg:col-3">
                                    <DropDown
                                        label={"Event Group"}
                                        options={eventGroupOptions}
                                        value={form.eventGroup}
                                        onChange={(e) => getInput("eventGroup", e)}
                                        // error={'invalid  selection'}
                                    />
                                </div>
                                <div className="col-12 lg:col-1"></div>
                                <div className="col-12 lg:col-3">
                                    <DropDown
                                        label={"Event"}
                                        options={eventGroupOptions}
                                        value={form.event}
                                        onChange={(e) => getInput("event", e)}
                                        // error={'invalid  selection'}
                                    />
                                </div>
                                <div className="col-12 lg:col-1"></div>
                                <div className="col-12 lg:col-3">
                                {/* <InputText type="text" placeholder="Registration number" tooltip="Enter your username" tooltipOptions={{position: 'bottom'}} /> */}
                                    <TextInput tooltip="Registration number" tooltipOptions={{position: 'bottom'}} label="Registration No"></TextInput>
                                </div>
                                <Button
                                    className="p-button mr-1"
                                    icon="pi pi-plus"
                                    label="GO"
                                    style={{
                                        width: 80,
                                        height: 40,
                                        marginTop: 24,
                                    }}
                                    // onClick={(e) => setAddCandidatePage(true)}
                                />
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
                                <InputText type="search" placeholder="Search..." />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>

            {/* add users */}
            {/* <AddUsers show={showAddObjectionForm} setShow={setShowAddObjectionForm} /> */}
            <AddObjections show={showAddObjectionForm} setShow={setShowAddObjectionForm} />
            {/* end */}

            <DataTable
                size="small"
                scrollable={true}
                value={data}
                dataKey="id"
                paginator
                rows={10}
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
            >
                <Column field="Name" header="Name" sortable></Column>
                <Column field="DateLodged" header="Date Lodged"></Column>
                <Column field="IDNumber" header="ID Number"></Column>
                <Column field="RegistrationNumber" header="Registration Number"></Column>

                {/* <Column
                    field="active"
                    header="Status"
                    body={(e) => (e.active == "Y" ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />)}
                    sortable
                ></Column> */}
                <Column
                    field="actions"
                    header="Actions"
                    body={() => (
                        <>
                            {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to De-Activate" /> */}

                            {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Activate" /> */}
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" />
                            {/* 
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-success p-button-rounded mr-2 " tooltip="Click to Edit" />

                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-trash"} className="p-button-danger p-button-rounded" tooltip="Click to Delete" /> */}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
