import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddUsers from "../componets/AddUsers";
import EditUser from "../componets/EditUser";
import UsersService from "../service/UsersService";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import DelimitationServices from "../service/DelimitationServices";
import RegistrationCentreService from "../service/RegistrationCentreService";
import { Accordion, AccordionTab } from "primereact/accordion";
import { OrderList } from "primereact/orderlist";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import TextInput from "../componets/TextInput";
import { Toast } from "primereact/toast";

export const Users = () => {
    const toast = useRef(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showEditUserForm, setShowEditUserForm] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);

    let [userData, setUserData] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    var updatedDelimtation = {};
    var [delimtation, setDelimtation] = useState({});

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Users</h5>
        </div>
    );

    function delimitationHandler() {
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
        delete delimtation[id];
        delimtation = { ...delimtation };
        setDelimtation(delimtation);
        console.log("ddd");
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


    function userRowData() {
        var gender = JSON?.parse(localStorage.getItem("genders"))?.filter((e) => e.id === selectedUser?.gender)[0]?.description;
        return [
            {
                col1: "Name",
                col2: selectedUser?.firstName,
                col3: "Surname",
                col4: selectedUser?.surname,
            },
            {
                col1: "Email",
                col2: selectedUser?.emailAddress,
                col3: "Phone Number",
                col4: selectedUser?.phoneNumber,
            },
            {
                col1: "ID Number",
                col2: selectedUser?.idCardNumber,
                col3: "Gender",
                col4: gender,
            },
            {
                col1: "Postal Address",
                col2: selectedUser?.postalAddress,
                col3: "Residential Address",
                col4: selectedUser?.residentialAddress,
            },
            {
                col1: "Captured By",
                col2: selectedUser?.createdBy,
            },
        ];
    }

    var usersService = new UsersService();

    var delimitationServices = new DelimitationServices();
    var [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState(null);

    var registrationService = new RegistrationCentreService();
    var [centre, setCentre] = useState([]);
    const [selectedCentre, setSelectedCentre] = useState(null);

    useEffect(() => {
        usersService.getAllUsers().then((data) => {
            console.log("Users --------->");
            console.log(data);
            setUserData(data);
        });

        delimitationServices.getAllDistrict().then((data) => {
            setDistrict(data);
        });
        registrationService.getRegistrationCentres().then((data) => {
            setCentre(data);
        });
    }, []);

    function activateHandler(id) {
        usersService.activateUser(id).then((res) => {
            usersService.getAllUsers().then((data) => {
                console.log(data);
                setUserData(data);
            });
        });
    }

    function deActivateHandler(id) {
        usersService.deActivateUser(id).then((res) => {
            usersService.getAllUsers().then((data) => {
                console.log(data);
                setUserData(data);
            });
        });
    }

    return (
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
            <Toast ref={toast} />
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add User" onClick={(e) => setShowAddUserForm(true)} />
                        </div>
                    }
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText type="search" placeholder="Search..." />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>

            {/* add users */}
            <AddUsers show={showAddUserForm} setShow={setShowAddUserForm} setUserData={setUserData} />
            {/* <EditUser show={showEditUserForm} setShow={setShowEditUserForm} /> */}
            {/* end */}

            <Dialog draggable={false} onHide={(e) => setShowViewDialog(false)} visible={showViewDialog} style={{ width: "65%", height: "98vh" }} modal header={<h6>{`User Details -  ${selectedUser?.surname}, ${selectedUser?.firstName}  (${selectedUser?.emailAddress})`}</h6>}>
                <TabView>
                    <TabPanel header="User Details">
                        <DataTable size="small" scrollable={true} dataKey="id" className="datatable-responsive" responsiveLayout="scroll" resizableColumns columnResizeMode="expand" value={userRowData()}>
                            <Column field="col1" body={(e) => <b>{e.col1}</b>}></Column>
                            <Column field="col2"></Column>
                            <Column field="col3" body={(e) => <b>{e.col3}</b>}></Column>
                            <Column field="col4"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Registration Centre">
                        <Accordion multiple>
                            <AccordionTab header="Butha-Buthe">Butha-Buthe</AccordionTab>
                            <AccordionTab header="Mafeteng">Mafeteng</AccordionTab>
                            <AccordionTab header="HMokhotlong">Mokhotlong</AccordionTab>
                        </Accordion>
                    </TabPanel>
                </TabView>
            </Dialog>

            <DataTable
                size="small"
                scrollable={true}
                value={userData}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                emptyMessage="No users found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedUsers}
                onSelectionChange={(e) => setSelectedUsers(e.value)}
                resizableColumns
                columnResizeMode="expand"
            >
                <Column field="email" header="Email" sortable body={(e) => e.user?.email}></Column>
                <Column field="username" header="Username" body={(e) => e.user?.username}></Column>

                <Column header="Name & Surname " body={(e) => e.firstName + ",  " + e.surname}></Column>

                <Column
                    field="active"
                    header="Status"
                    body={(e) =>
                        e.user.active === "Y" ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                    sortable
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            <Button onClick={(a) => setShowEditUserForm(true)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Edit" />
                            <Button
                                onClick={(a) => {
                                    setShowViewDialog(true);
                                    setSelectedUser(e);
                                }}
                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                icon={"pi pi-eye"}
                                tooltipOptions={{ position: "top" }}
                                className="p-button-primary p-button-rounded mr-2"
                                tooltip="Click to View"
                            />
                            {e.user?.active === "Y" ? (
                                <Button onClick={(a) => deActivateHandler(e.user?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-danger p-button-rounded mr-2" tooltipOptions={{ position: "top" }} tooltip="Click to De-Activate" />
                            ) : (
                                <Button onClick={(a) => activateHandler(e.user?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-success p-button-rounded mr-2" tooltipOptions={{ position: "top" }} tooltip="Click to Activate" />
                            )}
                        </>
                    )}
                ></Column>
            </DataTable>

            <Dialog
                header={
                    <>
                        <i className="pi pi-pencil"></i>
                        <span> Update User</span>
                    </>
                }
                draggable={false}
                visible={showEditUserForm}
                onHide={(e) => setShowEditUserForm(false)}
                style={{ width: "75%", height: "90%" }}
            >
                <div className="grid" style={{ flex: 1 }}>
                    <div className="col-12 lg:col-12">
                        <TextInput label="Contact Number" />
                    </div>
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
                        {Object.keys(delimtation).length > 0 ? <h6 className="flex flex-column md:flex-row md:align-items-center">Registration Centres</h6> : ""}
                        <Accordion multiple h>
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
                                                    className="p-button-danger p-button-sm  p-button-rounded  p-button-icon-only mr-5"
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
            </Dialog>
        </div>
    );
};
