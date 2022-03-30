import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import DropDown from "./DropDown";
import TextInput from "./TextInput";
import GroupInput from "./groupInput";
import EventGroupService from "../service/EventGroupService";
import EventService from "../service/EventServices";
import { TabPanel, TabView } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import ObjectionsService from "../service/ObjectionsService";
import { Toolbar } from "primereact/toolbar";

export default function AddObjections({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    var eventGroupService = new EventGroupService();
    var objectionTypeService = new ObjectionsService();
    const toast = useRef(null);
    var [eventGroup, setEventGroup] = useState([]);
    var [objectionType, setObjectionType] = useState([]);
    var [SelectedObjectionType, setselectedObjectionType] = useState("Select an Objection Type");
    let [event, setEvent] = useState([]);
    var [selectedEvent, setSelectedEvent] = useState("Select an Event");

    useEffect(() => {
        eventGroupService.getAllEventGroups().then((data) => {
            setEventGroup(data);
        });
        objectionTypeService.getAllObjectionType().then((data) => {
            setObjectionType(data);
        });
    }, []);
    function objectionTypeHandler(e) {
        setForm({ ...form, SelectedObjectionType: e.value.Name });
        setselectedObjectionType(e.value);
    }
    var eventService = new EventService();
    function eventGroupHandler(e) {
        setEvenGroupHolder({ ...eventgroupHolder, eventGroup: e.value.Name });
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        if (id == null) return setEvent([]);
        eventService.getAllEvents(id).then((data) => {
            setEvent(data);
        });
    }
    function eventHandler(e) {
        setForm({ ...form, event: e.value.Name });
        setSelectedEvent(e.value);
    }

    var [form, setForm] = useState({
        EventID: null,
        ObjectionReason: "Testing",
        Name: "",
        IDnumber: "",
        DateLodged: "",
        RegistrationNumber: "",
        SelectedObjectionType: null,
        Comment: "",
        CapturedBy: 1,
        ObjectionEntityID: 1,
    });
    var [eventgroupHolder, setEvenGroupHolder] = useState({
        eventGroup: "Select an Event Group",
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
        form.SelectedObjectionType = SelectedObjectionType?.ObjectionTypeID;
        form.EventID = selectedEvent.EventID;
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        newForm["DateLodged"] = formatDate(form.DateLodged) + " 00:00";
        var error = false;
        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value === "") {
                error = true;
            }
        });
        var LodgedBy = `${newForm.Name} ${newForm.IDnumber}`;
        delete newForm.Name;
        delete newForm.IDnumber;
        delete newForm.event;
        newForm.LodgedBy = LodgedBy;
        console.log(4444, newForm);
        if (error == true) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
            return false;
        }
        var createdObjection = new ObjectionsService();
        createdObjection
            .createObjection(newForm)
            .then((res) => {
                submittedForm = true;
                window.location.reload();
                return toast.current.show({ severity: "success", summary: "Success Message", detail: "Objection was added successfully", life: 4000 });
            }, 2000)
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({ severity: "error", summary: "Error Message", detail: "Ooops, The is a technical problem,Please Try Again", life: 3000 });
            });
    }

    return (
        <Dialog
            draggable={false}
            header={
                <>
                    <li className="pi pi-plus"> </li>
                    <span>Add Objection</span>
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
                            <TabPanel header="Objection Details">
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Registration Number" value={form.RegistrationNumber} onChange={(e) => setForm({ ...form, RegistrationNumber: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown label="Event group" optionLabel="Name" onChange={(e) => eventGroupHandler(e)} options={eventGroup} value={eventgroupHolder.eventGroup} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown label="Event" optionLabel="Name" onChange={(e) => eventHandler(e)} options={event} value={selectedEvent} placeholder="Select an Event" />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown label="Objection Type" optionLabel="Name" placeholder="Select objection type" options={objectionType} onChange={(e) => objectionTypeHandler(e)} value={SelectedObjectionType} style={{ width: "100%" }} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Objection Description" value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Comment" value={form.Comment} onChange={(e) => setForm({ ...form, Comment: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Date Lodged" value={form.DateLodged} onChange={(e) => setForm({ ...form, DateLodged: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                    <Toolbar
                                        left={
                                            <div className="grid">
                                                <div className="col-12  lg:col-6">
                                                    <TextInput placeholder="Enter the name" label="Lodged by - Name" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
                                                </div>
                                                <div className="col-12  lg:col-6">
                                                    <TextInput placeholder="Enter the ID number" label="Lodged by - ID Number" value={form.IDnumber} onChange={(e) => setForm({ ...form, IDnumber: e.target.value })} />
                                                </div>
                                            </div>
                                        }
                                    ></Toolbar>
                                    </div>
                                    {/* <div className="col-12  lg:col-4">
                                        <TextInput placeholder="Enter the name" label="Lodged by - Name" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput placeholder="Enter the ID number" label="Lodged by - ID Number"  value={form.IDnumber} onChange={(e) => setForm({ ...form, IDnumber: e.target.value })} />
                                    </div> */}

                                    {/* <div className="col-12 md:col-4" >
                                        <p>Lodged by</p>
                                        <GroupInput placeholder="Name"></GroupInput>
                                        <GroupInput placeholder="ID Number"></GroupInput>
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
