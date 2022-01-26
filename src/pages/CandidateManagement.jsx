import React, { useState } from "react";
import { Button } from "primereact/button";
import DropDown from "../componets/DropDown";
import { Dialog } from "primereact/dialog";
import { InputText } from 'primereact/inputtext'

import { TabPanel, TabView } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
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
                    <Button icon={"pi pi-pencil"} className="p-button-info p-button-rounded mr-2" onClick={forward} />
                    <Button icon={"pi pi-pencil"} className="p-button-danger p-button-rounded" onClick={forward} />
                </>
            }
        ];


    return (
        <div className="card" >
            <div className="">
                <Toolbar className="mb-4" left={<div>
                    <div className="grid">

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


            <DataTable value={data} className="my-3">
                <Column field="first name" header="First name"></Column>
                <Column field="last name" header="Last name"></Column>
                <Column field="gender" header="Gender"></Column>
                <Column field="active" header="Active"></Column>
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



                <div>

                    <Dialog
                        visible={false}
                        width='350px'
                        modal={true}
                        onHide={e => this.setState({ visible: false })}
                        maximizable={true}
                        style={{ width: "450px" }} header="Product Details" className="p-fluid"
                    >
                    </Dialog>
                </div>
            </div>


        </div>
    );
};
