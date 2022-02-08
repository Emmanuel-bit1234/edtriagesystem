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
import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import StaffService from "../service/StaffService";
import { Dialog } from "primereact/dialog";
import UsersService from "../service/UsersService";
import { useHistory } from "react-router-dom";
export default function AddEventGroup({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
   
    // var sysGroupService = new SysGroupService();
    // var [groups, setGroup] = useState([]);
    // const [selectedGroups, setSelecedGroups] = useState([]);

    // var [staffPosition, setStaffPosition] = useState([]);

    // var genderService = new GenderService();

    // var [gender, setGender] = useState([]);

    useEffect(() => {
        // genderService.getAllGender().then((data) => {
        //     setGender(data);
        // });
        // staffService.getStaffType().then((data) => {
        //     setStaffType(data);
        // });
        // staffService.getStaffPosition().then((data) => {
        //     setStaffPosition(data);
        // });
        // registrationService.getRegistrationCentres().then((data) => {
        //     setCentre(data);
        // });
        // sysGroupService.getSysAllGroup().then((data) => {
        //     // console.log(data);
        //     setGroup(data);
        // });
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
        staffTypeID: "",
        address: "address",
        signatureImage: "",
        appointmentDate: "",
        contactNumber: "contactNumber",
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

    function SubmitForm() {
        // var groupIDs = [];
        // var centerIDS = [];
        // if (selectedGroups != null && Array.isArray(selectedGroups) == true) selectedGroups.map((group) => groupIDs.push(group.id));
        // if (selectedCentre != null && Array.isArray(selectedCentre) == true) selectedCentre.map((centre) => centerIDS.push(centre.id));

        // form.registrationCentreIds = centerIDS;
        // form.sysGroupIds = groupIDs;
        // form.appointmentDate = formatDate(form.appointmentDate) + " 00:00";

        // var usersService = new UsersService();
        // usersService.createUser(form).then((res) => {
        //     console.log(res);
        // });
        // console.log(form);
        /***
         * message
         * catch
         */

     
        window.location.reload();
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
            style={{ width: "95%", height: "90%" }}
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
