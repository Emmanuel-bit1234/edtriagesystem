import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import TextInput from "./TextInput";
import { TabPanel, TabView } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import InputTextArea from "./InputTextArea";
import { FileUpload } from "primereact/fileupload";
import PoliticalPartyService from "../service/PoliticalPartyService";
import imageToBase64 from "image-to-base64/browser";
import { Image } from "primereact/image";

export default function AddPoliticalParty({ setPoliticalParties, buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    const toast = useRef(null);

    var [form, setForm] = useState({
        Name: "",
        Abbreviation: "",
        Description: "",
        Slogan: "",
        DateRegistered: "",
        Annivesary: "",
        FileName: "",
        Logo: null,
        Created_By: 1.0,
        Created_Date: "2022-04-08T00:00:00",
        Updated_Date: "2022-04-08T00:00:00",
        Updated_By: 1.0,
        Status: 1,
    });
    const inputFileRef = useRef(null);

    const onBtnClick = () => {
        inputFileRef.current.click();
    };

    var convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    async function onUploadHandler(e) {
        const file = e.files[0];
        const base64 = await convertBase64(file);
        var base64result = base64.split(",")[1];
        setForm({ ...form, Logo: base64result, FileName: file.name });
    }
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
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        newForm["DateRegistered"] = formatDate(form.DateRegistered);
        newForm["Annivesary"] = formatDate(form.Annivesary);
        var error = false;

        let formdata = new FormData();
        console.log(newForm);

        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            formdata.append(key, newForm[key]);
            if (value === "") {
                error = true;
            }
        });
        delete form.FileName;
        if (error == true) {
            toast.current.show({
                severity: "error",
                summary: "Error Message",
                detail: "please fill the required fields",
                life: 3000,
            });
            return false;
        }

        var PoliticalParty = new PoliticalPartyService();
        PoliticalParty.createParty(newForm)
            .then((res) => {
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "Political party was added successfully",
                    life: 1500,
                });
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({
                    severity: "error",
                    summary: "Error Message",
                    detail: "Ooops, The is a technical problem,Please Try Again",
                    life: 2000,
                });
            });
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
                    <div method="post">
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
                                        <TextInput type="Calendar" label="Date Registered" value={form.DateRegistered} onChange={(e) => setForm({ ...form, DateRegistered: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <InputTextArea rows="2" cols="61" label="Description" value={form.Description} optionLabel="description" onChange={(e) => setForm({ ...form, Description: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <InputTextArea rows="2" cols="61" label="Slogan" value={form.Slogan} optionLabel="slogan" onChange={(e) => setForm({ ...form, Slogan: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Anniversary" value={form.Annivesary} onChange={(e) => setForm({ ...form, Annivesary: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <label htmlFor="description">Logo/Symbol</label> <br></br>
                                        <React.Fragment>
                                            <Button label={form.FileName.trim().length === 0 ? "Select a file" : form.FileName} onClick={onBtnClick} className="p-button-success" icon={form.FileName.trim().length === 0 ? "pi pi-plus" : ""} />
                                            <input ref={inputFileRef} type={"file"} onChange={(e) => onUploadHandler(e.target)} style={{ display: "none" }}></input>
                                        </React.Fragment>
                                        <div style={{ visibility: "hidden" }}>LOGO</div>  
                                        {form.FileName.trim().length === 0 ? "" : <Image preview={true} src={`data:image/png;base64,${form.Logo}`} alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />}
                                    </div>
                                </div>
                              
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
