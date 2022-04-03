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
export default function EditUser({ show = false, setShow }) {
    const toast = useRef(null);

    var sysGroupService = new SysGroupService();
    var [groups, setGroup] = useState([]);
    const [selectedGroups, setSelecedGroups] = useState([]);

    var delimitationServices = new DelimitationServices();
    var [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState([]);

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
        auditUser: "auditUser",
        staffPositionID: "",
        physicalAddress: "",
        signatureImage: "signatureImage",
        appointmentDate: "",
        gender: "",
        contactNumber: "",

        district: "district",
        districtId: 1,
        otherName: "",
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

        if (selectedGroups != null && Array.isArray(selectedGroups) === true) selectedGroups.map((group) => groupIDs.push(group.id));
        else groupIDs.push(selectedGroups.id);

        if (selectedCentre != null && Array.isArray(selectedCentre) === true) selectedCentre.map((centre) => centerIDS.push(centre.id));

        var newForm = {};

        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });

        newForm["registrationCentreIds"] = centerIDS;
        newForm["sysGroupIds"] = groupIDs;
        newForm["appointmentDate"] = formatDate(form.appointmentDate) + " 00:00";
        newForm["dateOfBirth"] = formatDate(form.dateOfBirth) + " 00:00";

        var error = false;

        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value?.length === 0) {
                error = true;
            }
        });

        if (error === true) {
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
            return false;
        }

        var usersService = new UsersService();
        usersService
            .createUser(newForm)
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
            header="Add User"
            footer={
                <>
                    {pageIndex === 0 ? (
                        <>
                            <Button onClick={forwardPage} label="Next" icon="pi pi-forward" />
                        </>
                    ) : (
                        ""
                    )}

                    {pageIndex === 1 ? (
                        <>
                            <Button onClick={backWardPage} className="mx-1" label="Back" icon="pi pi-backward" />
                            <Button onClick={forwardPage} label="Next" icon="pi pi-forward" />
                        </>
                    ) : (
                        ""
                    )}

                    {pageIndex === 2 ? (
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
                            <TabPanel header="Personal Details" disabled={pageIndex === 0 ? false : true}>
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
                            <TabPanel header="Appointment Details" disabled={pageIndex === 1 ? false : true} activeIndex={pageIndex}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <DropDown value={form.staffPositionID} onChange={(e) => setForm({ ...form, staffPositionID: e.value })} options={staffPosition} label="Position" optionLabel="description" optionValue="id" />
                                    </div>

                                    {/* <div className="col-12  lg:col-4">
                                        <DropDown value={form.staffTypeID} onChange={(e) => setForm({ ...form, staffTypeID: e.value })} options={staffType} label="Staff Type" optionLabel="description" optionValue="id" />
                                    </div> */}
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Date Employed" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel header="Access Allocation" disabled={pageIndex === 2 ? false : true} activeIndex={pageIndex}>
                                <div className="flex">
                                    <div className="grid" style={{ flex: 1 }}>
                                        <div className="col-12 lg:col-12">
                                            <label>Select groups</label>
                                            <Dropdown filter style={{ width: "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelecedGroups(e.value)} optionLabel="name" placeholder="Select groups" className="multiselect-custom" display="chip" />
                                        </div>
                                    </div>
                                    <Divider layout="vertical" />

                                    <div className="grid" style={{ flex: 1 }}>
                                        <div className="col-12 lg:col-12">
                                            <label>District</label>
                                            <Dropdown filter style={{ width: "100%" }} value={selectedDistrict} options={district} onChange={(e) => setSelectedDistrict(e.value)} optionLabel="name" placeholder="Select District" />
                                        </div>
                                        <div className="col-12 lg:col-12">
                                            <label>Registration Centre</label>
                                            <MultiSelect style={{ width: "100%" }} value={selectedCentre} options={centre} onChange={(e) => setSelectedCentre(e.value)} optionLabel="name" placeholder="Select Registration Centre" filter className="multiselect-custom" display="chip" />
                                            {selectedCentre != null && selectedCentre?.length > 0 ? <OrderList value={selectedCentre} header="List of assigned Registration Centres" listStyle={{ height: "auto" }} dataKey="id" itemTemplate={(item) => item.name}></OrderList> : ""}
                                        </div>
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
