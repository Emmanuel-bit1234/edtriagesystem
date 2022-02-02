import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useState } from "react";
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
export default function AddUsers({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    var sysGroupService = new SysGroupService();
    var [groups, setGroup] = useState([]);
    const [selectedGroups, setSelecedGroups] = useState(null);

    var registrationService = new RegistrationCentreService();
    var [centre, setCentre] = useState([]);
    const [selectedCentre, setSelectedCentre] = useState(null);

    var staffService = new StaffService();
    var [staffType, setStaffType] = useState([]);
    const [staffTypeValue, setStaffTypeValue] = useState("Select Staff Type");

    var [staffPosition, setStaffPosition] = useState([]);
    const [staffPositionValue, setStaffPositionValue] = useState("Select Staff Position");

    var genderService = new GenderService();
    const [genderValue, setGenderValue] = useState("Select Gender");
    var [gender, setGender] = useState([]);

    useEffect(() => {
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
        sysGroupService.getSysAllGroup().then((data) => {
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
        username: "username",
        name: "name",
        surname: "surname",
        email: "email",
        password: "password",
        createdBy: 3,
        registrationCentreIds: [],
        sysGroupIds: [],
        auditUser: "auditUser",
        staffPositionID: "staffPositionID",
        staffTypeID: "staffTypeID",
        address: "address",
        signatureImage: "",
        appointmentDate: "2021-06-06 00:00",
        gender: "gender",
        contactNumber: "contactNumber",
    });

    return (
        <Dialog
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
                            <Button label="Submit" className="p-button-success" icon="pi pi-plus" type="submit" />
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
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <form method="post">
                        <TabView onTabChange={(e) => (e.index = pageIndex)} activeIndex={pageIndex}>
                            <TabPanel header="Personal Details" disabled={pageIndex == 0 ? false : true}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="User Name" value={form.username} onChange={(e) => setForm({ ...form, username: e.value })} />
                                    </div>

                                    <div className="col-12 lg:col-4">
                                        <TextInput value={form.password} onChange={(e) => setForm({ ...form, password: e.value })} label="Password" />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Surname" value={form.surname} onChange={(e) => setForm({ ...form, surname: e.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Contact Number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.value })} />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.value })} />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <DropDown
                                         value={genderValue} onChange={(e) => setGenderValue(e.value)} options={gender} label="Gender" optionLabel="description" optionValue="id" />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel header="Staff Details" disabled={pageIndex == 1 ? false : true} activeIndex={pageIndex}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <DropDown value={staffPositionValue} onChange={(e) => setStaffTypeValue(e.value)} options={staffPosition} label="Staff Position" optionLabel="description" optionValue="id" />
                                    </div>

                                    <div className="col-12  lg:col-4">
                                        <DropDown value={staffTypeValue} onChange={(e) => setStaffTypeValue(e.value)} options={staffType} label="Staff Type" optionLabel="description" optionValue="id" />
                                    </div>
                                    <div className="col-12  lg:col-4">
                                        <TextInput type="Calendar" label="Appointment Date"  value={form.appointmentDate} onChange={(e) => setForm({ ...form,appointmentDate: e.value })}  />
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel header="Access Allocation" disabled={pageIndex == 2 ? false : true} activeIndex={pageIndex}>
                                <div className="grid">
                                    <div className="col-12 lg:col-6">
                                        <MultiSelect style={{ width: "100%" }} value={selectedGroups} options={groups} onChange={(e) => setSelecedGroups(e.value)} optionLabel="name" placeholder="Select groups" filter className="multiselect-custom" display="chip" />
                                        {selectedGroups != null && selectedGroups?.length > 0 ? <OrderList value={selectedGroups} header="List of assigned System Groups" listStyle={{ height: "auto" }} dataKey="id" itemTemplate={(item) => item.name}></OrderList> : ""}
                                    </div>

                                    <div className="col-12 lg:col-6">
                                        <MultiSelect style={{ width: "100%" }} value={selectedCentre} options={centre} onChange={(e) => setSelectedCentre(e.value)} optionLabel="name" placeholder="Select Registration Centre" filter className="multiselect-custom" display="chip" />
                                        {selectedCentre != null && selectedCentre?.length > 0 ? <OrderList value={selectedCentre} header="List of assigned Registration Centres" listStyle={{ height: "auto" }} dataKey="id" itemTemplate={(item) => item.name}></OrderList> : ""}
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
