import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddUsers from "../componets/AddUsers";
import EditUser from "../componets/EditUser";
import UsersService from "../service/UsersService";

export const Users = () => {
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [showEditUserForm, setShowEditUserForm] = useState(false);

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
            console.log("Users --------->");
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
        <div className="card  p-align-stretch vertical-container" style={{ height: "calc(100vh - 9rem)" }}>
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
            <EditUser show={showEditUserForm} setShow={setShowEditUserForm} />
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
                <Column field="email" header="Email" sortable body={(e) => e.user?.email}></Column>
                <Column field="username" header="Username" body={(e) => e.user?.username}></Column>

                <Column header="Name & Surname " body={(e) => e.firstName + "  " + e.surname}></Column>

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
                            <Button onClick={(a) => setShowEditUserForm(!showEditUserForm)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to Edit" />
                            <Button onClick={(a) => setShowEditUserForm(!showEditUserForm)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-eye"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to View" />
                            {e.user?.active === "Y" ? (
                                <Button onClick={(a) => deActivateHandler(e.sysUser?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-danger p-button-rounded mr-2" tooltipOptions={{ position: "top" }} tooltip="Click to De-Activate" />
                            ) : (
                                <Button onClick={(a) => activateHandler(e.user?.id)} style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-check"} className="p-button-success p-button-rounded mr-2" tooltipOptions={{ position: "top" }} tooltip="Click to Activate" />
                            )}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
