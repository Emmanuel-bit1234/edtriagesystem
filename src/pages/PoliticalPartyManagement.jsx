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

export const PoliticalPartyManagement = () => {
    const toast = useRef(null);
    const [showAddPartyForm, setShowAddPartyForm] = useState(false);
    let [data, setData] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedObjections, setSelectedObjections] = useState("");

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
            // draggable={false}
            // header={<h4>Objection Details</h4>}
            // style={{ width: "75%", height: "75%" }}
            // modal
            // visible={showDialog}
            // onHide={(e) => {
            //     setShowDialog(false);
            // }}
            >
                {/* <TabView>
                    <TabPanel header="Objection">
                        <DataTable size="small" scrollable={true} value={ObjectionDetails()} dataKey="id" responsiveLayout="scroll" resizableColumns>
                            <Column style={{ width: "100px" }} body={(e) => <b>{e.name}</b>}></Column>
                            <Column body={(e) => e.value}></Column>
                        </DataTable>
                    </TabPanel>
                </TabView> */}
            </Dialog>

            <AddPoliticalParty show={showAddPartyForm} setShow={setShowAddPartyForm} />

            <DataTable
                size="small"
                scrollable={true}
                value={data}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} political parties"
                emptyMessage="No political party found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedObjections}
                onSelectionChange={(e) => setSelectedObjections(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="name"
                globalFilterFields={["name"]}
            >
                <Column field="name" header="Name" sortable></Column>
                <Column field="abbreviation" header="Abbreviation" sortable></Column>
                <Column field="description" header="Description"></Column>
                <Column field="slogan" header="Slogan"></Column>
                <Column header="Logo" headerStyle={{ width: "14%", minWidth: "10rem" }}></Column>
                <Column field="Date Registered" header="Date Registered"></Column>
                <Column field="Anniversary" header="Anniversary"></Column>
                <Column
                    field="actions"
                    header="Actions"
                    // body={(e) => (
                    //     <>
                    //         {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" /> */}
                    //         <Button
                    //             style={{
                    //                 textAlign: "center",
                    //                 width: "30px",
                    //                 height: "30px",
                    //             }}
                    //             icon={"pi pi-eye"}
                    //             tooltipOptions={{ position: "top" }}
                    //             className="p-button-primary p-button-rounded mr-2"
                    //             tooltip="Click to View"
                    //             onClick={(a) => {
                    //                 setShowDialog(true);
                    //                 setSelectedObjections(e);
                    //             }}
                    //         />
                    //         {/* <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" /> */}
                    //     </>
                    // )}
                ></Column>
            </DataTable>
        </div>
    );
};
