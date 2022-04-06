import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import TextInput from "./TextInput";
import { TabPanel, TabView } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import InputTextArea from "./InputTextArea";
import { FileUpload } from 'primereact/fileupload'

export default function AddPoliticalParty({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    const toast = useRef(null);

    var [form, setForm] = useState({
        Name: "",
        Abbreviation: "",
        Description: "",
        Slogan: "",
        DateRegistered: "",
        Anniversary: "",
        Logo: null,
    });
    var submittedForm = false;

    function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    function SubmitForm() {       
    }

    return (
        <Dialog
            draggable={false}
            header={
                <>
                    <li className="pi pi-plus"> </li>
                    <span>Add Party</span>
                </>
            }
            footer={
                <>
                    <Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />
                </>
            }
            visible={show}
            onHide={(e) => setShow(false)}
            style={{ width: "95%", height: "90%" }}
        >
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <Toast ref={toast} />
                    <form method="post">
                        <TabView>
                            <TabPanel header="Political Party Details">
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Name" optionLabel="Name" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Abbreviation" value={form.Abbreviation} optionLabel="abbreviation" onChange={(e) => setForm({ ...form, Abbreviation: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Date registered" value={form.DateRegistered} onChange={(e) => setForm({ ...form, DateRegistered: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <InputTextArea rows="2" cols="61" label="Description" value={form.Description} optionLabel="description" onChange={(e) => setForm({ ...form, Description: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <InputTextArea rows="2" cols="61" label="Slogan" value={form.Slogan} optionLabel="slogan" onChange={(e) => setForm({ ...form, Slogan: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Anniversary" value={form.Anniversary} onChange={(e) => setForm({ ...form, Anniversary: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <label htmlFor="description">Logo/Symbol</label>
                                        <React.Fragment>
                                            <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Choose file" chooseLabel="Choose file" />
                                        </React.Fragment>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </form>
                </div>
            </div>
        </Dialog>
    );
}
