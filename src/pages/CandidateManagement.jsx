import React, { useState } from "react";
import { Button } from "primereact/button";
import DropDown from "../componets/DropDown";
import { Sidebar } from "primereact/sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { TabPanel, TabView } from "primereact/tabview";

import { FileUpload } from 'primereact/fileupload';


export const CandidateManagement = () => {

    var [tabIndex, setTabIndex] = useState(0);
    function forward() { tabIndex++; setTabIndex(tabIndex); }
    function back() { tabIndex--; setTabIndex(tabIndex); }


    var [form, setForm] = useState({
        eventGroup: "SELECT AN OPTION",
        eventType: "SELECT AN OPTION",
        district: "SELECT AN OPTION",
        constituency: "SELECT AN OPTION",
        candidate: "SELECT AN OPTION"
    })

    var getInput = (key, ev) => {
        setForm({ ...form, [key]: ev.value })
    }


    const eventGroupOptions = [
        { key: 'NAME1', name: 'NAME1', label: 'DESCRIPTION1' },
        { key: 'NAME2', name: 'NAME2', label: 'DESCRIPTION2' },
        { key: 'NAME3', name: 'NAME3', label: 'DESCRIPTION3' }
    ];

    let data =
        [
            {
                "first name": <b>Mark</b>,
                "last name": <b>Blue</b>,
                "gender": <b>Male</b>,
                "active": <b>1</b>,
                actions: <>
                    <Button icon={"pi pi-pencil"} className="p-button-info p-button-rounded mr-2" onClick={forward} tooltip='Click to Edit' />
                    <Button icon={"pi pi-eye-slash"} className="p-button-danger p-button-rounded" onClick={forward} tooltip='Click to De-Activate' />
                </>
            }
        ];


    let proportionalData =
        [
            {
                "Political Party": <b>Stephan Gouws</b>,
                "Receipt No": <b>314</b>,
                "Name": <b>Sandra</b>,
                "Surname": <b>Nel</b>,
                "Status": <b>Valid</b>,

            }
        ];

    const [selectedProducts, setSelectedProducts] = useState(null);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Candidate Management</h5>
        </div>
    );


    const addCadidateDialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" />
            <Button label="Save" icon="pi pi-check" className="p-button-text" />
        </>
    );

    const proportionalListHeader = () => (<div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
        <h5 className="m-0"> Proportional List / Women Representatives</h5>
    </div>)

    const agentHeader = () => (<div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
        <h5 className="m-0">Agent</h5>
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <FileUpload name="demo" url="./upload" mode="basic" />
            <Button label="Import" icon="pi pi-check" className="ml-2 p-button-success" />
        </div>
    </div>)
    return (
        <div className="card  p-align-stretch vertical-container" >
            <div className="">
                <Toolbar className="mb-4" left={<div>
                    <div className="grid  p-grid p-align-stretch vertical-container">

                        <div className="col-12 lg:col-2">
                            <DropDown
                                label={"Event Group"}
                                options={eventGroupOptions}
                                value={form.eventGroup}
                                onChange={e => getInput("eventGroup", e)}
                                error={"invalid  selection"}
                            />

                        </div>

                        <div className="col-12 lg:col-2">
                            <DropDown
                                label={"Event Type"}
                                options={eventGroupOptions}
                                value={form.eventType}
                                onChange={e => getInput("eventType", e)}
                                error={"invalid  selection"}
                            />
                        </div>
                        <div className="col-12 lg:col-2">

                            <DropDown
                                label={"District"}
                                options={eventGroupOptions}
                                value={form.district}
                                onChange={e => getInput("district", e)}
                                error={"invalid  selection"}
                            />
                        </div>

                        <div className="col-12 lg:col-2">

                            <DropDown
                                label={"Constituency"}
                                options={eventGroupOptions}
                                value={form.constituency}
                                onChange={e => getInput("constituency", e)}
                                error={"invalid  selection"}
                            />

                        </div>

                        <div className="col-12 lg:col-2">
                            <DropDown
                                label={"Candidate Type"}
                                options={eventGroupOptions}
                                value={form.candidate}
                                onChange={e => getInput("candidate", e)}
                                error={"invalid  selection"}
                            />
                        </div>
                    </div>

                    <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Candidate" onClick={forward} />

                </div>}></Toolbar>

            </div>


            <DataTable

                value={data}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                // paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Candidates"
                emptyMessage="No political parties found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value)}
            >
                <Column field="first name" header="First name" ></Column>
                <Column field="last name" header="Last name"></Column>
                <Column field="gender" header="Gender"></Column>
                <Column field="active" header="Active" ></Column>
                <Column field="actions" header="Actions"></Column>
            </DataTable>



            <div style={{ width: "550px" }} className="p-fluid">
                <div className="card" style={{ display: "none" }}>
                    <h5>Candidate List</h5>
                    <DropDown
                        label={"Event Group"}
                        options={eventGroupOptions}
                        value={form.eventGroup}
                        onChange={e => getInput("eventGroup", e)}
                        error={"invalid  selection"}
                    />


                    <DropDown
                        label={"Event Type"}
                        options={eventGroupOptions}
                        value={form.eventType}
                        onChange={e => getInput("eventType", e)}
                        error={"invalid  selection"}
                    />

                    <DropDown
                        label={"District"}
                        options={eventGroupOptions}
                        value={form.district}
                        onChange={e => getInput("district", e)}
                        error={"invalid  selection"}
                    />

                    <DropDown
                        label={"Constituency"}
                        options={eventGroupOptions}
                        value={form.constituency}
                        onChange={e => getInput("constituency", e)}
                        error={"invalid  selection"}
                    />



                    <DropDown
                        label={"Candidate Type"}
                        options={eventGroupOptions}
                        value={form.candidate}
                        onChange={e => getInput("candidate", e)}
                        error={"invalid  selection"}
                    />
                    <Button className="p-button-success" icon="pi pi-check-square" label="Load" />

                </div>



                <Sidebar visible={true} fullScreen >
                    <TabView>
                        <TabPanel header='Details' >

                        </TabPanel>
                        <TabPanel header='Proposer' >
                        </TabPanel>
                        <TabPanel header='Agent'>

                            <DataTable
                                value={proportionalData}
                                dataKey="id"
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Proportional List"
                                emptyMessage="No Proportional List / Women Representatives found."
                                header={agentHeader}
                                responsiveLayout="scroll"
                                selection={selectedProducts}
                            >
                                <Column field="Political Party" header="Political Party" ></Column>
                                <Column field="Receipt No" header="Receipt No"></Column>
                                <Column field="Name" header="Name"></Column>
                                <Column field="Surname" header="Surname" ></Column>
                                <Column field="Status" header="Status"></Column>
                            </DataTable>
                        </TabPanel>

                        <TabPanel header='Proportional List'>

                            <DataTable
                                value={proportionalData}
                                dataKey="id"
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25]}
                                className="datatable-responsive"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Proportional List"
                                emptyMessage="No Proportional List / Women Representatives found."
                                header={proportionalListHeader}
                                responsiveLayout="scroll"
                                selection={selectedProducts}
                            >
                                <Column field="Political Party" header="Political Party" ></Column>
                                <Column field="Receipt No" header="Receipt No"></Column>
                                <Column field="Name" header="Name"></Column>
                                <Column field="Surname" header="Surname" ></Column>
                                <Column field="Status" header="Status"></Column>
                            </DataTable>
                        </TabPanel>


                    </TabView>
                </Sidebar>
            </div>


        </div>
    );
};
