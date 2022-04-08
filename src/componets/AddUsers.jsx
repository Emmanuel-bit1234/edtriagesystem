import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useRef, useState } from "react";
import RegistrationCentreService from "../service/RegistrationCentreService";
import DropDown from "./DropDown";
import TextInput from "./TextInput";

import { OrderList } from "primereact/orderlist";
import SysGroupService from "../service/SysGroupService";
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import StaffService from "../service/StaffService";
import { Dialog } from "primereact/dialog";
import GenderService from "../service/GenderService";
import UsersService from "../service/UsersService";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import DelimitationServices from "../service/DelimitationServices";
import { Accordion, AccordionTab } from "primereact/accordion";

var img = `data:image/png;base64,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`;
export default function AddUsers({ show = false, setShow, setUserData }) {
    const toast = useRef(null);

    var sysGroupService = new SysGroupService();
    var [groups, setGroup] = useState([]);
    const [selectedGroups, setSelecedGroups] = useState([]);

    var delimitationServices = new DelimitationServices();
    var [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState([]);
    var [delimtation, setDelimtation] = useState({});

    var registrationService = new RegistrationCentreService();
    var [centre, setCentre] = useState([]);
    const [selectedCentre, setSelectedCentre] = useState([]);

    var staffService = new StaffService();
    var [staffType, setStaffType] = useState([]);

    var [staffPosition, setStaffPosition] = useState([]);

    var genderService = new GenderService();

    var [gender, setGender] = useState([]);

    useEffect(() => {
        delimitationServices.getAllDistrict().then((data) => {
            setDistrict(data);
        });
        genderService.getAllGender().then((data) => {
            setGender(data);
        });
        staffService.getStaffType().then((data) => {
            setStaffType(data);
        });
        staffService.getStaffPosition().then((data) => {
            setStaffPosition(data);
        });
        registrationService.getRegistrationCentres().then((data) => {
            setCentre(data);
        });
        sysGroupService.getAllSysGroup().then((data) => {
            // console.log(data);
            setGroup(data);
        });
    }, []);

    var [pageIndex, setPageIndex] = useState(0);
    var backWardPage = () => {
        pageIndex--;
        setPageIndex(pageIndex);
    };
    var forwardPage = () => {
        pageIndex++;
        setPageIndex(pageIndex);
    };

    var [form, setForm] = useState({
        username: "",
        name: "",
        surname: "",
        email: "",
        password: "",
        createdBy: 3,
        registrationCentreIds: [],
        sysGroupIds: [],
        auditUser: 1,
        staffPositionID: 1,
        // staffTypeID: "",
        physicalAddress: "",
        //signatureImage: img,
        appointmentDate: "",
        gender: "",
        contactNumber: "",

        district: "district",
        districtId: 1,
        otherName: "",
        physicalAddress: "",
        residentialAddress: "",
        idNumber: "",
        dateOfBirth: "",
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
        var groupIDs = [];
        var centerIDS = [];

        if (Array.isArray(selectedGroups) == true) selectedGroups.map((group) => groupIDs.push(group.id));
        else groupIDs.push([]);

        if (delimtation != null) {
            Object.keys(delimtation).map((name) => {
                var all_centre = delimtation[name].centres;
                console.log(all_centre);
                all_centre.map((centre) => {
                    centerIDS.push(centre.id);
                });
            });
        }

        var newForm = {};

        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });

        newForm["registrationCentreIds"] = centerIDS;
        newForm["sysGroupIds"] = groupIDs;
        newForm["appointmentDate"] = formatDate(form.dateOfBirth) + " 00:00";
        newForm["dateOfBirth"] = formatDate(form.dateOfBirth) + " 00:00";

        var error = false;

        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value?.length === 0) {
                error = true;
            }
        });

        // if (error == true) {
        //     toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
        //     return false;
        // }

        // console.log(newForm);
        // return false;

        var usersService = new UsersService();
        usersService
            .createUser(newForm)
            .then((res) => {
                submittedForm = true;
                toast.current.show({ severity: "success", summary: "Success Message", detail: "User was added successfully", life: 2000 });
                usersService.getAllUsers().then((data) => {
                    console.log(data);
                    setUserData(data);
                    submittedForm = true;
                });
                setShow(false);
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({ severity: "error", summary: "Error Message", detail: "Ooops, The is a technical problem,Please Try Again", life: 3000 });
            });
    }

    function delimitationHandler() {
        // console.log(selectedDistrict);
        // console.log(selectedCentre);
        delimtation[selectedDistrict?.id] = { centres: selectedCentre, district: selectedDistrict };

        setDelimtation({ ...delimtation });
        console.log(delimtation);

        setSelectedCentre([]);
        setSelectedDistrict(null);

        toast.current.show({
            severity: "success",
            summary: "Success Message",
            detail: selectedDistrict?.description + " Registration Centre's Added",
            life: 3000,
        });
    }

    function clearDelimitationHandler() {
        setSelectedCentre([]);
        setSelectedDistrict(null);
        toast.current.show({
            severity: "error",
            summary: "Error Message",
            detail: "centre list  is empty",
            life: 3000,
        });
    }

    function removeAccordionTabByid(id = "") {
        toast.current.show({
            severity: "error",
            summary: "Error Message",
            detail: "district removed from the list",
            life: 3000,
        });
        delete delimtation[id];
        delimtation = { ...delimtation };
        setDelimtation(delimtation);
    }

    function setSelectedDistrictHandler(value) {
        setSelectedDistrict(value);
        var id = value?.id;
        if (id in delimtation) {
            var centres = delimtation[id].centres;
            setSelectedCentre(centres);
        } else {
            setSelectedCentre(null);
        }
    }

    return (
        <Dialog
            draggable={false}
            header="Add User"
            footer={
                <>
                    {pageIndex == 0 ? (
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
                    )}

                    {pageIndex == 2 ? (
                        <>
                            <Button onClick={backWardPage} className="mx-1" label="Back" icon="pi pi-backward" />
                            <Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />
                        </>
                    ) : (
                        ""
                    )}
                </>
            }
            visible={show}
            onHide={(e) => setShow(false)}
            style={{ width: "95%", height: "90%" }}
        >
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <form method="post">
                        <TabView onTabChange={(e) => (e.index = pageIndex)} activeIndex={pageIndex}>
                            <TabPanel header="Personal Details" disabled={pageIndex == 0 ? false : true}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="User Name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                    </div>

                                    <div className="col-12 lg:col-4">
                                        <TextInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} label="Password" />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Other Name" value={form.otherName} onChange={(e) => setForm({ ...form, otherName: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="ID Number" value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Contact Number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Physical Address" value={form.physicalAddress} onChange={(e) => setForm({ ...form, physicalAddress: e.target.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Residential Address" value={form.residentialAddress} onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown value={form.gender} onChange={(e) => setForm({ ...form, gender: e.value })} options={gender} label="Gender" optionLabel="description" optionValue="id" />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Date Of Birth" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="User Group Allocation " disabled={pageIndex == 1 ? false : true} activeIndex={pageIndex}>
                                <div className="grid" style={{ flex: 1 }}>
                                    <div className="col-12 lg:col-12">
                                        <label>Select groups</label>
                                        <MultiSelect filter style={{ width: "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelecedGroups(e.value)} optionLabel="name" placeholder="Select groups" className="multiselect-custom" display="chip" />

                                        {selectedGroups != null && selectedGroups?.length > 0 ? (
                                            <>
                                                <OrderList value={selectedGroups} dataKey="id" itemTemplate={(item) => item.name}></OrderList>
                                            </>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            </TabPanel>

                            <TabPanel header="Registration Centre Allocation" disabled={pageIndex == 2 ? false : true} activeIndex={pageIndex}>
                                <div className="grid">
                                    <div className="col-12 lg:col-6">
                                        <label>District</label>
                                        <Dropdown filter style={{ width: "100%" }} value={selectedDistrict} options={district} onChange={(e) => setSelectedDistrictHandler(e.value)} optionLabel="name" placeholder="Select District" />
                                    </div>
                                    <div className="col-12 lg:col-6">
                                        <label>Registration Centre</label>
                                        <MultiSelect style={{ width: "100%" }} value={selectedCentre} options={centre} onChange={(e) => setSelectedCentre(e.value)} optionLabel="name" placeholder="Select Registration Centre" filter className="multiselect-custom" display="chip" />
                                    </div>
                                    <div className="col-12 lg:col-12">
                                        {selectedCentre != null && selectedCentre?.length > 0 ? (
                                            <>
                                                <OrderList
                                                    value={selectedCentre}
                                                    header={
                                                        <div className="flex flex-column md:flex-row md:align-items-center">
                                                            <Button
                                                                style={{ textAlign: "center", width: "35px", height: "35px", padding: 0 }}
                                                                className="p-button-success p-button-sm  p-button-rounded  p-button-icon-only mr-2"
                                                                icon="pi pi-plus"
                                                                onClick={delimitationHandler}
                                                                tooltipOptions={{ position: "top" }}
                                                                tooltip="Click to Add"
                                                            />
                                                            <Button
                                                                style={{ textAlign: "center", width: "35px", height: "35px" }}
                                                                className="p-button-danger p-button-sm  p-button-rounded  p-button-icon-only mr-2"
                                                                icon="pi pi-trash"
                                                                onClick={clearDelimitationHandler}
                                                                tooltipOptions={{ position: "top" }}
                                                                tooltip="Click to Clear"
                                                            />
                                                            {selectedDistrict?.description} Registration Centres
                                                        </div>
                                                    }
                                                    dataKey="id"
                                                    itemTemplate={(item) => item.name}
                                                ></OrderList>
                                            </>
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                    <div className="col-12 lg:col-12">
                                        {Object.keys(delimtation).length > 0 ? (
                                            <h6 className="flex flex-column md:flex-row md:align-items-center">
                                                <b>Registration Centres</b>
                                            </h6>
                                        ) : (
                                            ""
                                        )}
                                        <Accordion>
                                            {Object.keys(delimtation).map((key, index) => {
                                                var d = delimtation[key].district;
                                                var centres = delimtation[key].centres;

                                                return (
                                                    <AccordionTab
                                                        header={
                                                            <span className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                                                <Button
                                                                    onClick={(e) => removeAccordionTabByid(key)}
                                                                    style={{ textAlign: "center", width: "35px", height: "35px" }}
                                                                    className="p-button-danger p-button-sm  p-button-rounded  p-button-icon-only mr-5 ml-5"
                                                                    icon="pi pi-trash"
                                                                    tooltipOptions={{ position: "top" }}
                                                                    tooltip="Click to Remove"
                                                                />
                                                                <div>{d?.description} Registration Centres</div>
                                                            </span>
                                                        }
                                                        key={index}
                                                    >
                                                        <OrderList value={centres} dataKey="id" itemTemplate={(item) => item.name}></OrderList>
                                                    </AccordionTab>
                                                );
                                            })}
                                        </Accordion>
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
