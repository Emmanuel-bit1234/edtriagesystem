import React from "react";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import DropDown from "../componets/DropDown";
import AddPoliticalParty from "../componets/AddPoliticalParty";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";
import { Image } from "primereact/image";
import PoliticalPartyService from "../service/PoliticalPartyService";
import imageToBase64 from "image-to-base64/browser";
import { FileUpload } from "primereact/fileupload";
import { NET_IP } from "../config/Config";
import axios from "axios";

export const PoliticalPartyManagement = () => {
    const toast = useRef(null);
    const [showAddPartyForm, setShowAddPartyForm] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [SelectedPoliticalParty, setSelectedPoliticalParty] = useState("");
    var [PoliticalParties, setPoliticalParties] = useState([]);
    var [executiveRoles, setExecutiveRoles] = useState([]);
    var [selectedExecutiveRole, setSelectedExecutiveRole] = useState("Select an Executive Role");
    var [form, setForm] = useState({
        File: "",
        FileName: "",
    });
    let [data, setData] = useState([]);
    const [registrationNumber, setRegistrationNumber] = useState("");
    const inputFileRef = useRef(null);
    const onBtnClick = () => {
        inputFileRef.current.click();
    };
    var PoliticalParty = new PoliticalPartyService();
    useEffect(() => {
        PoliticalParty.getAllPoliticalParties().then((data) => {
            console.log(data);
            setPoliticalParties(data);
        });
        PoliticalParty.getAllExecutiveRoles().then((data) => {
            setExecutiveRoles(data);
        });
    }, []);

    function getExecData() {
        PoliticalParty.getExecutiveDetails(registrationNumber).then((e) => {
            setData(e);
        });
    }

    const [count, setCount] = useState(0);
    const [rowData, setRowData] = useState({});
    function generateRow() {
        return (
            <div className="grid">
                <div className="col-16  lg:col-3">
                    <div style={{ visibility: "hidden" }}>Search</div>
                    <InputText placeholder="Registration Number" value={registrationNumber} onInput={(e) => setRegistrationNumber(e.target.value)} style={{ width: "100%" }} />
                </div>
                <div className="col-16  lg:col-3">
                    <TextInput label="First name" value={data?.Firstname} disabled />
                </div>
                <div className="col-16 lg:col-3">
                    <TextInput label="Surname" value={data?.Surname} disabled />
                </div>
                <div className="col-16  lg:col-3">
                    <DropDown options={executiveRoles} optionLabel="Name" value={selectedExecutiveRole} onChange={(e) => typeHandler(e)} label="Party Executive Role" />
                </div>
            </div>
        );
    }
    const [row, setRow] = useState([generateRow()]);
    var d = {id:"", name:""}
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };
    function deActivateHandler(id) {
        PoliticalParty.deActivatePoliticalParty(id).then((e) => {
            PoliticalParty.getAllPoliticalParties().then((data) => {
                setPoliticalParties(data);
                return toast.current.show({
                    severity: "success",
                    summary: "Success Message",
                    detail: "Political party de-activated successfully",
                    life: 2000,
                });
            });
        });
    }
    async function onUploadHandler(e) {
        let headersList = {
            Accept: "*/*",
            // "User-Agent": "Thunder Client (https://www.thunderclient.com)"
        };

        let formdata = new FormData();
        var file = e.target.files[0];
        console.log(file);
        formdata.append("csvFile", file);
        setForm({ ...form, FileName: file.name });

        let bodyContent = formdata;

        let reqOptions = {
            url: "http://20.87.43.104:84/API/AddPoliticalPartyMembersCSV",
            method: "POST",
            headers: headersList,
            body: bodyContent,
        };
        axios.request(reqOptions).then(function (response) {
            console.log(response.data);
        });
    }

    function typeHandler(e) {
        setSelectedExecutiveRole(e.value);
    }
    function formRowsHandler(){
        setRow([... row, generateRow()])
        setRowData({})
    }

    function PartyDetails() {
        return [
            {
                name: "Party name",
                value: SelectedPoliticalParty?.Name,
            },
            {
                name: "Abbreviation",
                value: SelectedPoliticalParty?.Abbreviation,
            },
            {
                name: "Description",
                value: SelectedPoliticalParty?.Description,
            },
            {
                name: "Slogan",
                value: SelectedPoliticalParty?.Slogan,
            },
            {
                name: "Date Registered",
                value: SelectedPoliticalParty?.DateRegistered?.split("T")[0],
            },
            {
                name: "Anniversary",
                value: SelectedPoliticalParty?.Annivesary?.split("T")[0],
            },
            {
                name: "Logo",
                value: <Image preview={true} src={`data:image/png;base64,${SelectedPoliticalParty?.Logo}`} template="Logo" alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />,
            },
        ];
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            {" "}
            <h5> Political Parties</h5>
        </div>
    );
    return (
        <div className="card  p-align-stretch vertical-container">
            <Toast ref={toast} />
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Party" onClick={(e) => setShowAddPartyForm(true)} />
                        </div>
                    }
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search a Political Party" />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>
            <Dialog
                draggable={false}
                header={<h4>Political party details</h4>}
                style={{ width: "90%", height: "90%" }}
                modal
                visible={showEditDialog}
                onHide={(e) => {
                    setShowEditDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Party Details">
                        <DataTable size="small" scrollable={true} value={PartyDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} body={(e) => <b>{e.name}</b>}></Column>
                            <Column body={(e) => e.value}></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Executive Members">
                        <div className="grid">
                            <div className="col-5  lg:col-1">
                                <Button onClick={formRowsHandler} className="p-button-success" icon="pi pi-plus" label="Add"></Button>
                            </div>
                        </div>
                        <div className="grid">
                            <div className="col-16  lg:col-3">
                                <div style={{ visibility: "hidden" }}>Search</div>
                                <InputText placeholder="Registration Number" value={registrationNumber} onInput={(e) => setRegistrationNumber(e.target.value)} style={{ width: "100%" }} />
                            </div>
                            <div className="col-16  lg:col-3">
                                <TextInput label="First name" value={data?.Firstname} disabled />
                            </div>
                            <div className="col-16 lg:col-3">
                                <TextInput label="Surname" value={data?.Surname} disabled />
                            </div>
                            <div className="col-16  lg:col-3">
                                <DropDown options={executiveRoles} optionLabel="Name" value={selectedExecutiveRole} onChange={(e) => typeHandler(e)} label="Party Executive Role" />
                            </div>
                        </div>
                        {row.map((e) => e)}
                        <div className="grid">
                            <div className="col-16  lg:col-1">
                                <Button label="Save" className="p-button-success" icon="pi pi-plus" type="submit" />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Members">
                        <div className="col">
                            <label htmlFor="description">Upload a CSV</label> <br></br>
                            <React.Fragment>
                                <Button label={form.FileName.trim().length === 0 ? "Select a file" : form.FileName} onClick={onBtnClick} className="p-button-success" icon={form.FileName.trim().length === 0 ? "pi pi-plus" : ""} />
                                <input ref={inputFileRef} type={"file"} onChange={(e) => onUploadHandler(e)} style={{ display: "none" }}></input>
                            </React.Fragment>
                        </div>
                        <DataTable
                            size="small"
                            scrollable={true}
                            // value={PoliticalParties}
                            dataKey="id"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
                            emptyMessage="No members found."
                            responsiveLayout="scroll"
                            // selection={SelectedPoliticalParty}
                            // onSelectionChange={(e) => setSelectedPoliticalParty(e.value)}
                            resizableColumns
                            columnResizeMode="expand"
                            filters={filters}
                            filterDisplay="Name"
                            globalFilterFields={["Name"]}
                        >
                            <Column field="Name" header="Political Party"></Column>
                            <Column field="Receipt No" header="Receipt No" sortable></Column>
                            <Column field="Name" header="Name" sortable></Column>
                            <Column field="Surname" header="Surname" sortable></Column>
                            <Column field="Status" header="Status"></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>
            <Dialog
                draggable={false}
                header={<h4>Political party details</h4>}
                style={{ width: "90%", height: "90%" }}
                modal
                visible={showDialog}
                onHide={(e) => {
                    setShowDialog(false);
                }}
            >
                <TabView>
                    <TabPanel header="Party Details">
                        <DataTable size="small" scrollable={true} value={PartyDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} body={(e) => <b>{e.name}</b>}></Column>
                            <Column body={(e) => e.value}></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Executive Members">
                        <DataTable
                            size="small"
                            scrollable={true}
                            // value={PoliticalParties}
                            dataKey="id"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
                            emptyMessage="No members found."
                            responsiveLayout="scroll"
                            // selection={SelectedPoliticalParty}
                            // onSelectionChange={(e) => setSelectedPoliticalParty(e.value)}
                            resizableColumns
                            columnResizeMode="expand"
                            filters={filters}
                            filterDisplay="Name"
                            globalFilterFields={["Name"]}
                        >
                            <Column field="Name" header="Political Party"></Column>
                            <Column field="Receipt No" header="Receipt No" sortable></Column>
                            <Column field="Name" header="Name" sortable></Column>
                            <Column field="Surname" header="Surname" sortable></Column>
                            <Column field="Status" header="Status"></Column>
                        </DataTable>
                    </TabPanel>
                    <TabPanel header="Members">
                        <DataTable
                            size="small"
                            scrollable={true}
                            // value={PoliticalParties}
                            dataKey="id"
                            paginator
                            rows={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Members"
                            emptyMessage="No members found."
                            responsiveLayout="scroll"
                            // selection={SelectedPoliticalParty}
                            // onSelectionChange={(e) => setSelectedPoliticalParty(e.value)}
                            resizableColumns
                            columnResizeMode="expand"
                            filters={filters}
                            filterDisplay="Name"
                            globalFilterFields={["Name"]}
                        >
                            <Column field="Name" header="Political Party"></Column>
                            <Column field="Receipt No" header="Receipt No" sortable></Column>
                            <Column field="Name" header="Name" sortable></Column>
                            <Column field="Surname" header="Surname" sortable></Column>
                            <Column field="Status" header="Status"></Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </Dialog>

            <AddPoliticalParty setPoliticalParties={setPoliticalParties} show={showAddPartyForm} setShow={setShowAddPartyForm} />

            <DataTable
                size="small"
                scrollable={true}
                value={PoliticalParties}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} political parties"
                emptyMessage="No political party found."
                header={header}
                responsiveLayout="scroll"
                selection={SelectedPoliticalParty}
                onSelectionChange={(e) => setSelectedPoliticalParty(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="Name"
                globalFilterFields={["Name"]}
            >
                <Column field="Name" header="Name" sortable></Column>
                <Column field="Abbreviation" header="Abbreviation" sortable></Column>
                <Column field="Description" header="Description"></Column>
                <Column field="Slogan" header="Slogan"></Column>
                <Column field="Logo" header="Logo" body={(e) => <Image preview={true} src={`data:image/png;base64,${e.Logo}`} template="Logo" alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                <Column field="DateRegistered" header="Date Registered" body={(e) => e?.DateRegistered?.split("T")[0]}></Column>
                <Column field="Annivesary" header="Anniversary" body={(e) => e?.Annivesary?.split("T")[0]}></Column>
                <Column
                    field="Status"
                    header="Status"
                    body={(e) =>
                        parseInt(e.Status) == 1 ? <Button label="Active" style={{ textAlign: "center", height: "30px" }} className="p-button-success p-button-rounded" /> : <Button label="Not Active" style={{ textAlign: "center", height: "30px" }} className="p-button-danger p-button-rounded" />
                    }
                ></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
                            <Button
                                style={{ textAlign: "center", width: "30px", height: "30px" }}
                                icon={"pi pi-pencil"}
                                className="p-button-primary p-button-rounded mr-2 "
                                tooltip="Click to Edit"
                                onClick={(a) => {
                                    setShowEditDialog(true);
                                    setSelectedPoliticalParty(e);
                                }}
                            />
                            <Button
                                style={{
                                    textAlign: "center",
                                    width: "30px",
                                    height: "30px",
                                }}
                                icon={"pi pi-eye"}
                                tooltipOptions={{ position: "top" }}
                                className="p-button-primary p-button-rounded mr-2"
                                tooltip="Click to View"
                                onClick={(a) => {
                                    setShowDialog(true);
                                    setSelectedPoliticalParty(e);
                                }}
                            />
                            {parseInt(e.Status) == 1 ? (
                                <Button
                                    onClick={(a) => {
                                        deActivateHandler(e.PoliticalPartyID);
                                    }}
                                    style={{ textAlign: "center", width: "30px", height: "30px" }}
                                    icon={"pi pi-times"}
                                    className="p-button-danger p-button-rounded mr-2"
                                    tooltip="Click to De-Activate"
                                />
                            ) : (
                                <Button disabled style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi- pi-times"} className="p-button-danger p-button-rounded mr-2" tooltip="Click to Activate" />
                            )}
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
