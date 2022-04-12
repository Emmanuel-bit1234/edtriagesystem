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

export const PoliticalPartyManagement = () => {
    const toast = useRef(null);
    const [showAddPartyForm, setShowAddPartyForm] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [SelectedPoliticalParty, setSelectedPoliticalParty] = useState("");
    var [PoliticalParties, setPoliticalParties] = useState([]);

    var PoliticalParty = new PoliticalPartyService();
    useEffect(() => {
        PoliticalParty.getAllPoliticalParties().then((data) => {
            console.log(data);
            setPoliticalParties(data);
        });
    }, []);

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
    let [data, setData] = useState([
        {
            name: "ANC",
            abbreviation: "ANC",
            description: "ANC",
            slogan: "ANC",
            "Date Registered": "1912-01-08",
            Anniversary: "1912-01-08",
            Image: (
                <>
                    <Image src="https://www.linkpicture.com/q/ANC.jpg" template="Logo" alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />
                </>
            ),
            active: 1,
            actions: (
                <>
                    <Button icon={"pi pi-pencil"} className="p-button-info p-button-rounded mr-2" tooltip="Click to Edit" />
                    <Button icon={"pi pi-eye"} className="p-button p-button-rounded" tooltip="Click to View" onClick={(e) => setShowDialog(true)} />
                </>
            ),
        },
    ]);
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
                value: SelectedPoliticalParty?.DateRegistered,
            },
            {
                name: "Anniversary",
                value: SelectedPoliticalParty?.Annivesary,
            },
            {
                name: "Logo",
                value: <Image src="https://www.linkpicture.com/q/ANC.jpg" template="Logo" alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />,
            },
        ];
    }
    // const imageBodyTemplate = (rowData) => {
    //     return (
    //       <>
    //         {/* <span className="p-column-title">Abbreviation</span> */}
    //         <img
    //           src={`assets/demo/images/product/${rowData.image}`}
    //           alt={rowData.image}
    //           className="shadow-2"
    //           width="100"
    //         />
    //       </>
    //     )
    //   }
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
                    <TabPanel header="Executive Members"></TabPanel>
                    <TabPanel header="Members"></TabPanel>
                </TabView>
            </Dialog>

            <AddPoliticalParty show={showAddPartyForm} setShow={setShowAddPartyForm} />

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
                <Column field="Logo" header="Logo" body={(e) => <Image preview={true} src="https://www.linkpicture.com/q/ANC.jpg" template="Logo" alt="Logo" width="100px" style={{ width: "100px", objectFit: "cover" }} />} headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                <Column field="DateRegistered" header="Date Registered" body={e=>e?.DateRegistered?.split("T")[0]}></Column>
                <Column field="Annivesary" header="Anniversary" body={e=>e?.Annivesary?.split("T")[0]}></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={(e) => (
                        <>
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
                                        // setShowEditForm(true);
                                        // setSelectedEventGroup(e);
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
