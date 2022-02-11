import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import React, { useEffect, useRef, useState } from "react";
import TextInput from "./TextInput";
import { OrderList } from "primereact/orderlist";
import { TabPanel, TabView } from "primereact/tabview";
import ModuleService from "../service/ModuleService";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import SysGroupService from "../service/SysGroupService";
export default function AddUserGroup({ buttonName = "Save", buttonIcon = "pi pi-save", show = false, setShow }) {
    const toast = useRef(null);

    var moduleService = new ModuleService();
    var [module, setModule] = useState([]);
    const [selectedModule, setselectedModule] = useState([]);

    useEffect(() => {
        moduleService.getAllModules().then((data) => {
            setModule(data);
            console.log(data);
        });
    }, []);

    var [form, setForm] = useState({
        description: "",
        name: "",
        moduleIds: [],
    });

    var [pageIndex, setPageIndex] = useState(0);

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
            toast.current.show({ severity: "error", summary: "Error Message", detail: "please fill the required fields", life: 3000 });
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
                return toast.current.show({ severity: "success", summary: "Success Message", detail: "User group was added successfully", life: 2000 });
            })
            .catch((e) => {
                submittedForm = false;
                return toast.current.show({ severity: "error", summary: "Error Message", detail: "Ooops, The is a technical problem,Please Try Again", life: 3000 });
            });
    }

    return (
        <Dialog
            header="Add User Group"
            footer={
                <>
                    {pageIndex == 0 ? (
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
            style={{ width: "95%", height: "90%" }}
        >
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12 lg:col-12">
                    <form method="post">
                        <TabView onTabChange={(e) => (e.index = pageIndex)} activeIndex={pageIndex}>
                            <TabPanel header="User Group" disabled={pageIndex == 0 ? false : true}>
                                <div className="grid">
                                    <div className="col-12  lg:col-4">
                                        <TextInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>

                                    <div className="col-12 lg:col-4">
                                        <TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} label="Description" />
                                    </div>

                                    <div className="col-12 lg:col-4">
                                        <label>Modules</label>
                                        <MultiSelect style={{ width: "100%" }} value={selectedModule} options={module} onChange={(e) => setselectedModule(e.value)} optionLabel="descriiption" placeholder="Select modules" filter className="multiselect-custom" display="chip" />
                                        {selectedModule != null && selectedModule?.length > 0 ? <OrderList value={selectedModule} listStyle={{ height: "auto" }} dataKey="id" itemTemplate={(item) => item.descriiption}></OrderList> : ""}
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
