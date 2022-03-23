import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import AddUserGroup from "../componets/AddUserGroup";
import SysGroupService from "../service/SysGroupService";
import ModuleService from "../service/ModuleService";
import TextInput from "../componets/TextInput";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import { OrderList } from "primereact/orderlist";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";

export const UserGroups = () => {
    const toast = useRef(null);
    let [data, setData] = useState([]);
    const [showAddUserGroupForm, setShowAddUserGroupForm] = useState(false);
    const [showViewUserGroupForm, setShowViewUserGroupForm] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState(null);

    var usersGroupService = new SysGroupService();
    var moduleService = new ModuleService();
    var [module, setModule] = useState([]);
    const [selectedModule, setselectedModule] = useState([]);
    var [form, setForm] = useState({
        description: "",
        name: "",
        moduleIds: [],
    });

    useEffect(() => {
        moduleService.getAllModules().then((data) => {
            setModule(data);
            console.log(data);
        });

        usersGroupService.getAllSysGroup().then((data) => {
            console.log(data);
            setData(data);
        });
    }, []);

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">User Groups</h5>
        </div>
    );

    var submittedForm = false;
    function SubmitForm() {
        var moduleIds = [];

        if (selectedModule != null && Array.isArray(selectedModule) == true) selectedModule.map((module) => moduleIds.push(module.id));

        var newForm = {};

        Object.keys(form).map((key) => {
            newForm[key] = form[key];
        });

        newForm["moduleIds"] = moduleIds;

        var error = false;

        Object.keys(newForm).map((key) => {
            var value = newForm[key];
            if (value?.length === 0) {
                error = true;
            }
        });

        if (error == true) {
            toast.current.show({
                severity: "error",
                summary: "Error Message",
                detail: "please fill the required fields",
                life: 3000,
            });
            return false;
        }

        var userGroupService = new SysGroupService();

        var requestBody = {
            sysGroup: {
                description: newForm.description,
                name: newForm.name,
            },
            moduleIds: newForm.moduleIds,
        };

        userGroupService
            .createSysGroup(requestBody)
            .then((res) => {
                setTimeout(() => {
                    window.location.reload();
                    submittedForm = true;
                }, 2000);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "User group was added successfully",
                    life: 2000,
                });
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({
                    severity: "error",
                    summary: "Error Message",
                    detail: "Ooops, The is a technical problem,Please Try Again",
                    life: 3000,
                });
            });
    }

    function selectedGroupData1() {
        return [
            {
                col1: "Name",
                col21: selectedGroup?.name,
                col3: "Description",
                col4: selectedGroup?.description,
            },
            {
                col1: "Captured By",
                col2: selectedGroup?.createdBy,
                col3: "Captured Date",
                col4: new Date(selectedGroup?.createdDate).toLocaleString(),
            },
        ];
    }

    function selectedGroupData2() {
        return [
            {
                col1: "Updated By",
                col2: selectedGroup?.updatedBy,
                col3: "Updated Date",
                col4: new Date(selectedGroup?.updatedDate).toLocaleString(),
            },
        ];
    }

    return (
        <div className="card  p-align-stretch vertical-container">
            <div className="">
                <Toast ref={toast} />
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
            {/* <AddUserGroup
        show={showAddUserGroupForm}
        setShow={setShowAddUserGroupForm}
      /> */}
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
                            <Button
                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                icon={"pi pi-eye"}
                                className="p-button-primary p-button-rounded mr-2 "
                                tooltipOptions={{ position: "top" }}
                                tooltip="Click to View"
                                onClick={(a) => {
                                    setSelectedGroup(e);
                                    setShowViewUserGroupForm(true);
                                }}
                            />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-times"} className="p-button-primary p-button-rounded   mr-2 " tooltipOptions={{ position: "top" }} tooltip="Click to De-activate" />

                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-trash"} className="p-button-danger p-button-rounded" tooltipOptions={{ position: "top" }} tooltip="Click to Delete" />
                        </>
                    )}
                ></Column>
            </DataTable>

            <Dialog
                draggable={false}
                header={
                    <>
                        <i className="pi pi-plus"></i>
                        <span> Add User Group</span>
                    </>
                }
                footer={<Button label="Submit" onClick={SubmitForm} className="p-button-success" icon="pi pi-plus" type="submit" />}
                visible={showAddUserGroupForm}
                onHide={(e) => setShowAddUserGroupForm(false)}
                style={{ width: "45%", height: "90%" }}
            >
                <div className="grid">
                    <div className="col-12">
                        <TextInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div className="col-12">
                        <TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} label="Description" />
                    </div>

                    <div className="col-12">
                        <label>Modules</label>
                        <MultiSelect style={{ width: "100%" }} value={selectedModule} options={module} onChange={(e) => setselectedModule(e.value)} optionLabel="descriiption" placeholder="Select modules" filter className="multiselect-custom" display="chip" />
                        {selectedModule != null && selectedModule?.length > 0 ? <OrderList value={selectedModule} listStyle={{ height: "auto" }} dataKey="id" itemTemplate={(item) => item.descriiption}></OrderList> : ""}
                    </div>
                </div>
            </Dialog>

            <Dialog
                draggable={false}
                header={
                    <>
                        <i className="pi pi-eye"></i>
                        <span> User Group</span>
                    </>
                }
                visible={showViewUserGroupForm}
                onHide={(e) => setShowViewUserGroupForm(false)}
                style={{ width: "60%", height: "90%" }}
            >
                <TabView>
                    <TabPanel header="User Group">
                        <DataTable size="small" scrollable={true} dataKey="id" className="datatable-responsive" responsiveLayout="scroll" resizableColumns columnResizeMode="expand" value={selectedGroupData1()}>
                            <Column field="col1" body={(e) => <b>{e.col1}</b>}></Column>
                            <Column field="col2"></Column>
                            <Column field="col3" body={(e) => <b>{e.col3}</b>}></Column>
                            <Column field="col4"></Column>
                        </DataTable>

                        <DataTable size="small" scrollable={true} dataKey="id" className="datatable-responsive" responsiveLayout="scroll" resizableColumns columnResizeMode="expand" value={selectedGroupData2()}>
                            <Column field="col1" body={(e) => <b>{e.col1}</b>}></Column>
                            <Column field="col2"></Column>
                            <Column field="col3" body={(e) => <b>{e.col3}</b>}></Column>
                            <Column field="col4"></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>
        </div>
    );
};
