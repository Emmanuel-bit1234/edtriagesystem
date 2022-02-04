import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import DropDown from "../componets/DropDown";
import { Sidebar } from "primereact/sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { TabPanel, TabView } from "primereact/tabview";
import { Checkbox } from "primereact//checkbox";

import { FileUpload } from "primereact/fileupload";
import TextInput from "../componets/TextInput";
import { Carousel } from "primereact/carousel";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import AddEdit from "../componets/AddEdit";
import { InputText } from "primereact/inputtext";
import AddUsers from "../componets/AddUsers";
import UsersService from "../service/UsersService";
import { Chip } from "primereact/chip";
import { Toast } from "primereact/toast";

export const Users = () => {
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    // const [addUserFooter,setAddUserFooter]

    let [data, setData] = useState([]);

    const [selectedUsers, setSelectedUsers] = useState(null);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Users</h5>
        </div>
    );

    var usersService = new UsersService();
    useEffect(() => {
        usersService.getAllUsers().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);

    function activateHandler(id) {
        usersService.activateUser(id).then((res) => {
            usersService.getAllUsers().then((data) => {
                console.log(data);
                setData(data);
            });
        });
    }

    function deActivateHandler(id) {
        usersService.deActivateUser(id).then((res) => {
            usersService.getAllUsers().then((data) => {
                console.log(data);
                setData(data);
            });
        });
    }

    return (
        <div className="card  p-align-stretch vertical-container">
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
            <AddUsers show={showAddUserForm} setShow={setShowAddUserForm} />
            {/* end */}

            <DataTable
                size="small"
                scrollable={true}
                value={data}
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
                <Column field="email" header="Email" sortable body={(e) => e.sysUser?.email}></Column>
                <Column field="username" header="Username" body={(e) => e.sysUser?.username}></Column>

                <Column header="Surname - Name" body={(e) => e.appointment?.surname + ", " + e.appointment?.firstName}></Column>

                <Column
                    field="active"
                    header="Status"
                    body={(e) =>
                        e.sysUser.active == "Y" ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                    sortable
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            {e.sysUser?.active == "Y" ? (
                                <Button onClick={(a) => deActivateHandler(e.sysUser?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to De-Activate" />
                            ) : (
                                <Button onClick={(a) => activateHandler(e.sysUser?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Activate" />
                            )}
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-success p-button-rounded mr-2 " tooltip="Click to Edit" />
                        </>
                    )}
                ></Column>
            </DataTable>
            
        </div>
    );
};
