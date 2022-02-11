import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddUserGroup from "../componets/AddUserGroup";
import SysGroupService from "../service/SysGroupService";

export const UserGroups = () => {
    const [showAddUserGroupForm, setShowAddUserGroupForm] = useState(false);

    let [data, setData] = useState([
        {
            email: "Mark",
            "last name": " Blue",
            actions: (
                <>
                    <Button icon={"pi pi-check-square"} className="p-button-info p-button-rounded mr-2" tooltip="Click to Select" />
                    <Button icon={"pi pi-pencil"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Delete" />
                    <Button icon={"pi pi-trash"} className="p-button-danger p-button-rounded" tooltip="Click to Delete" />
                </>
            ),
        },
    ]);

    const [selectedGroup, setSelectedGroup] = useState(null);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">User Groups</h5>
        </div>
    );

    var usersGroupService = new SysGroupService();
    useEffect(() => {
        usersGroupService.getAllSysGroup().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);

    return (
        <div className="card  p-align-stretch vertical-container">
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add User Group" onClick={(e) => setShowAddUserGroupForm(true)} />
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
            <AddUserGroup show={showAddUserGroupForm} setShow={setShowAddUserGroupForm} />
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
                selection={selectedGroup}
                onSelectionChange={(e) => selectedGroup(e.value)}
                resizableColumns
                columnResizeMode="expand"
            >
                <Column field="name" header="Name" sortable></Column>
                <Column field="description" header="Description"></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-pencil"} className="p-button-primary p-button-rounded mr-2 " tooltipOptions={{ position: "top" }} tooltip="Click to Edit" />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-eye"} className="p-button-primary p-button-rounded mr-2 " tooltipOptions={{ position: "top" }} tooltip="Click to View" />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-trash"} className="p-button-danger p-button-rounded" tooltipOptions={{ position: "top" }} tooltip="Click to Delete" />
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
