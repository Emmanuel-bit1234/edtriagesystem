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

export default function AddPoliticalParty({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    const toast = useRef(null);

    var [form, setForm] = useState({
        Name: "",
        Abbreviation: "",
        Description: "",
        Slogan: "",
        DateRegistered: "",
        Annivesary: "",
        Logo: null,
        Created_By: 1.0,
        Created_Date: "2022-04-08T00:00:00",
        Updated_Date: "2022-04-08T00:00:00",
        Updated_By: 1.0,
        Status: 1,
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
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        newForm["DateRegistered"] = formatDate(form.DateRegistered) + " 00:00";
        newForm["Annivesary"] = formatDate(form.Annivesary) + " 00:00";
        var error = false;

       
        let formdata = new FormData();

        //formdata.append("product[image]", { uri: photo.uri, name: "image.jpg", type: "image/jpeg" });
        //Image type can be image/png

        // fetch('http://192.168.1.0:3000/image',{
        //   method: 'post',
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        //   body: formdata
        //   }).then(response => {
        //     console.log("image uploaded")
        //   }).catch(err => {
        //     console.log(err)
        //   })
        // }

        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            formdata.append(key, newForm[key]);
            if (value === "") {
                error = true;
            }
        });

        // if (error == true) {
        //     toast.current.show({
        //         severity: "error",
        //         summary: "Error Message",
        //         detail: "please fill the required fields",
        //         life: 3000,
        //     });
        //     return false;
        // }

        var PoliticalParty = new PoliticalPartyService();
        console.log(form)
        // PoliticalParty.createFetchApi(newForm)
        //     .then((res) => {
        //         setTimeout(() => {
        //             window.location.reload();
        //             submittedForm = true;
        //         }, 1500);
        //         return toast.current.show({
        //             severity: "success",
        //             summary: "Success Message",
        //             detail: "Political party was added successfully",
        //             life: 1500,
        //         });
        //     })
        //     .catch((e) => {
        //         submittedForm = false;
        //         return toast.current.show({
        //             severity: "error",
        //             summary: "Error Message",
        //             detail: "Ooops, The is a technical problem,Please Try Again",
        //             life: 2000,
        //         });
        //     });
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
                                    <div className="col-12  lg:col-4">
                                        <label htmlFor="description">Logo/Symbol</label>
                                        <React.Fragment>
                                            <FileUpload mode="basic" accept="image/*"  maxFileSize={1000000} url="./upload" label="Choose file" chooseLabel="Choose file" onUpload ={e=>setForm({ ...form, Logo: e.files[0] })} />
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
