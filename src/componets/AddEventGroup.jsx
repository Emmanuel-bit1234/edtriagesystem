import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useState, useRef } from "react";
import RegistrationCentreService from "../service/RegistrationCentreService";
import DropDown from "./DropDown";
import TextInput from "./TextInput";
import { OrderList } from "primereact/orderlist";
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import StaffService from "../service/StaffService";
import { Dialog } from "primereact/dialog";
import { useHistory } from "react-router-dom";
import { Toast } from "primereact/toast";
import EventGroupService from "../service/EventGroupService";
export default function AddEventGroup({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    var [pageIndex, setPageIndex] = useState(0);
    const toast = useRef(null);
    var [form, setForm] = useState({
        Name: "",
        Description: "",
        EventDate: "",
        Status: 1,
        StatusReason: null,
        Events: null,
    });

    function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    var submittedForm = false;
    function SubmitForm() {
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        newForm["EventDate"] = formatDate(form.dateOfBirth) + " 00:00";
        var error = false;
        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value?.length === 0) {
                error = true;
            }
        });
        
        if (error == true) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
            return false;
        }
        var eventGroupService  = new EventGroupService();
        eventGroupService
            .createEventGroup(newForm)
            .then((res) => {
                setTimeout(() => {
                    window.location.reload();
                    submittedForm = true;
                }, 2000);
                return toast.current.show({ severity: "success", summary: "Success Message", detail: "User was added successfully", life: 2000 });
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({ severity: "error", summary: "Error Message", detail: "Ooops, The is a technical problem,Please Try Again", life: 3000 });
            });
    }
    return (
        <Dialog
            header="Add EventGroup"
            footer={
                <>
                    {/* {pageIndex == 0 ? (
                        <>
                            <Button onClick={forwardPage} label="Next" icon="pi pi-forward" />
                        </>
                    ) : (
                        ""
                    )}

                    {pageIndex == 1 ? (
                        <>
                            <Button onClick={backWardPage} className="mx-1" label="Back" icon="pi pi-backward" />
                            <Button onClick={forwardPage} label="Next" icon="pi pi-forward" />
                        </>
                    ) : (
                        ""
                    )} */}

                    {pageIndex == 0 ? (
                        <>
                            {/* <Button onClick={backWardPage} className="mx-1" label="Back" icon="pi pi-backward" /> */}
                            <Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />
                        </>
                    ) : (
                        ""
                    )}
                </>
            }
            visible={show}
            onHide={(e) => setShow(false)}
            style={{ width: "50%", height: "50%" }}
        >
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <form method="post">
                        <TabView onTabChange={(e) => (e.index = pageIndex)} activeIndex={pageIndex}>
                            <TabPanel header="EventGroup Details" disabled={pageIndex == 0 ? false : true}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="EventGroup Name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Description" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="EventDate" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, EventDate: e.target.value })} />
                                    </div>
                                    {/* <div className="col-12  lg:col-4">
                                        <TextInput label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
                                    </div> */}
                                    {/* <div className="col-12  lg:col-4">
                                        <DropDown label="Objection Type" optionLabel="Objection Type" optionValue="id" />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown label="Objection Status" optionLabel="Objection Status" optionValue="id" />
                                    </div> */}
                                    {/* <div className="col-12  lg:col-4">
                                        <DropDown value={form.gender} onChange={(e) => setForm({ ...form, gender: e.value })} options={gender} label="Gender" optionLabel="description" optionValue="id" />
                                    </div> */}
                                </div>
                            </TabPanel>
                        </TabView>
                    </form>
                </div>
            </div>
        </Dialog>
    );
}
