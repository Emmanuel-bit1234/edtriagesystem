import { Button } from "primereact/button";
import React, { useEffect, useState, useRef } from "react";
import TextInput from "./TextInput";
import { TabPanel, TabView } from "primereact/tabview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import EventGroupService from "../service/EventGroupService";
import { Dropdown } from "primereact/dropdown";
import EventTypeService from "../service/EventTypeService";
import EventCategoryService from "../service/EventCategoryService";
import EventService from "../service/EventServices";

export default function AddEvent({ eventGroup = null, setData=[], buttonIcon = "pi pi-save", show = false, setShow }) {

    var [pageIndex, setPageIndex] = useState(0);
    const toast = useRef(null);
    var [form, setForm] = useState({
        Name: "",
        Description: "",
        EventDate: "",
        EventTypeNC: "NewEvent",
        EventGroupID: null,
        SelectedEventCategory: null,
        SelectedEventType: null,
    });
    var [form2, setForm2] = useState({
        Name: "",
        Description: "",
        EventDate: "",
        Status: 1,
        StatusReason: null,
        Events: null,
    });
    var [selectedEventGroup, setSelectedEventGroup] = useState(null);
    var [selectedType, setSelected] = useState(null);
    var [selectedCategory, setSelectedCategory] = useState(null);
    var [selectedEvent, setSelectedEvent] = useState(null);
    function ByEventHandler(e) {
        setSelectedEvent(e.value);
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        // if (id == null) return setData([]);
        // eventService.getAllEvents(id).then((data) => {
        //     setData(data);
        // });
    }
    function eventHandler(e) {
        setSelected(e.value);
        var id = e.value?.EventGroupID ? e.value.EventGroupID : null;
        // if (id == null) return setData([]);
        // eventService.getAllEvents(id).then((data) => {
        //     setData(data);
        // });
    }
    function categoryHandler(e) {
        setSelectedCategory(e.value);
        var id = e.value?.EventCategoryID ? e.value.EventCategoryID : null;
        eventTypeService.getAllEventTypes(id).then((data) => {
            setEventType(data);
            setSelected(null);
            console.log(data);
        });
    }
    var [eventType, setEventType] = useState([]);
    var [event, setEvent] = useState([]);
    var [eventCategory, setEventCategory] = useState([]);
    var [pageIndex, setPageIndex] = useState(0);
    var eventTypeService = new EventTypeService();
    var eventCategoryService = new EventCategoryService();
    var eventService = new EventService();
    useEffect(() => {
        eventTypeService.getAllEventTypes().then((data) => {
            setEventType(data);
            console.log(data);
        });
        eventCategoryService.getAllEventCategories().then((data) => {
            setEventCategory(data);
            // console.log(data);
        });
        eventService.getAllParentEvents().then((data) => {
            setEvent(data);
            console.log(JSON.stringify(data));
        });
    }, []);

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
        form.EventGroupID = eventGroup.EventGroupID
        form.SelectedEventCategory = selectedCategory.EventCategoryID
        form.SelectedEventType = selectedType.Value
        var newForm = {};
        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });
        newForm["EventDate"] = formatDate(form.EventDate) + " 00:00";
        var error = false;
        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value === "") {
                error = true;
            }
        });
        console.log(newForm);
        if (error == true) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
            return false;
        }
        var eventService = new EventService();
        eventService
            .createEvent(newForm)
            .then((res) => {
                    submittedForm = true;
                    eventService.getAllEvents(form.EventGroupID).then((data) => {
                        setData(data);
                        setShow(false)
                    });

                return toast.current.show({ severity: "success", summary: "Success Message", detail: "Event was added successfully", life: 2000 });
                
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({ severity: "error", summary: "Error Message", detail: "Ooops, The is a technical problem,Please Try Again", life: 3000 });
            });
            
    }
    return (
        <Dialog
            header="Add Event"
            footer={
                <>
                        {pageIndex == 0 ? (
                            <>
                                <Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />
                            </>
                        ) : (
                            ""
                        )}

                        {pageIndex == 1 ? (
                            <>
                                <Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />
                            </>
                        ) : (
                            ""
                        )}
                </>
            }
            visible={show}
            onHide={(e) => setShow(false)}
            style={{ width: "75%", height: "75%" }}
        >
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <Toast ref={toast} />
                    <form method="post">
                        <TabView activeIndex={pageIndex}>
                            <TabPanel header="Event Details" disabled={pageIndex == 0 ? false : true}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Event Name" value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Description" value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Event Date" value={form.EventDate} onChange={(e) => setForm({ ...form, EventDate: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <Dropdown optionLabel="Name" onChange={(e) => categoryHandler(e)} options={eventCategory} value={selectedCategory} placeholder="Event Category" style={{ width: "100%" }} />
                                    </div>
                                    {selectedCategory !== null ? (
                                        <div className="col-12  lg:col-4">
                                            <Dropdown optionLabel="Text" onChange={(e) => eventHandler(e)} options={eventType} value={selectedType} placeholder="Event Type" style={{ width: "100%" }} />
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </TabPanel>
                            <TabPanel header="By-Election Details">
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Event Date" value={form2.EventDate} onChange={(e) => setForm2({ ...form2, EventDate: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Description" value={form2.Description} onChange={(e) => setForm2({ ...form2, Description: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Event Name" value={form2.Name} onChange={(e) => setForm2({ ...form2, Name: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <Dropdown optionLabel="Name" onChange={(e) => ByEventHandler(e)} options={event} value={selectedEvent} placeholder="Event" style={{ width: "100%" }} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <Dropdown placeholder="District" style={{ width: "100%" }} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <Dropdown placeholder="Constituency" style={{ width: "100%" }} />
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
