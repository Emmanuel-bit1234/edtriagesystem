import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import React, { useState } from "react";

export default function VoterAllocationParams() {
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    let [data, setData] = useState([
        {
            name: "Election 1",
            MinimumVotersPS: "",
            SortField: "...",
            SortedOrder: "...",
            SortedField: "...",
            Threshold: "...",
            //ThresholdAction: "...",
        },
        {
            name: "Local election 58",
            MinimumVotersPS: "some description",
            SortedOrder: "some description",
            SortedField: "some description",
            Threshold: "some description",
            //ThresholdAction: "some description",
        },
    ]);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;

        setFilters(_filters1);
        setGlobalFilterValue(value);
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Voter Allocation Params</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search By Event Name" />
            </span>
        </div>
    );

    var [tableData, setTableData] = useState([
        {
            name: "MinimumVotersinPS",
            description: <InputText style={{ width: "100%" }} />,
            value: <InputText style={{ width: "100%" }} />,
        },
        {
            name: "SortOrder",
            description: <InputText style={{ width: "100%" }} />,
            value: <Dropdown placeholder="Select Sort Order" style={{ width: "100%" }} />,
        },
        {
            name: "SortField",
            description: <InputText style={{ width: "100%" }} />,
            value: <Dropdown placeholder="Select Sort Field" style={{ width: "100%" }} />,
        },
        {
            name: "Threshold",
            description: <InputText style={{ width: "100%" }} />,
            value: <InputText style={{ width: "100%" }} />,
        },
        {
            name: "ThresholdAction",
            description: <InputText style={{ width: "100%" }} />,
            value: <Dropdown placeholder="Select Threshold Action" style={{ width: "100%" }} />,
        },
    ]);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Dialog
                        header="Voter Allocation Params"
                        visible={showDialog}
                        style={{ width: "80%", height: "100vh" }}
                        modal
                        onHide={(e) => {
                            setIsEdit(false);
                            setShowDialog(false);
                        }}
                    >
                        <DataTable
                            size="small"
                            scrollable={true}
                            value={tableData}
                            dataKey="id"
                            className="datatable-responsive"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Voter Allocation Params"
                            emptyMessage="No voter allocation params found."
                            responsiveLayout="scroll"
                            resizableColumns
                            columnResizeMode="expand"
                            filters={filters}
                            filterDisplay="menu"
                            globalFilterFields={["name"]}
                        >
                            <Column field="name" header="Name"></Column>
                            <Column field="description" header="Description"></Column>
                            <Column field="value" header="Value"></Column>
                        </DataTable>
                        {isEdit == true ? (
                            <div className="grid">
                                <div className="col-12">
                                    <Button className="my-2  p-button-success" label="Save" icon="pi pi-save" />
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                    </Dialog>

                    <DataTable
                        size="small"
                        scrollable={true}
                        value={data}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} Voter Allocation Params"
                        emptyMessage="No voter allocation params found."
                        header={header}
                        responsiveLayout="scroll"
                        resizableColumns
                        columnResizeMode="expand"
                        filters={filters}
                        filterDisplay="menu"
                        globalFilterFields={["name"]}
                    >
                        <Column filterField="name" field="name" header="Event Name" sortable body={(item) => <b>{item.name}</b>}></Column>
                        <Column field="MinimumVotersPS" header="MinimumVotersPS" sortable></Column>
                        {/* <Column field="SortedOrder" header="SortedOrder"></Column>
                        <Column field="SortedField" header="SortedField"></Column>
                        <Column field="Threshold" header="Threshold"></Column> */}
                        {/* <Column field="ThresholdAction" header="ThresholdAction"></Column> */}
                        <Column
                            field="action"
                            header="Action"
                            body={(item) => (
                                <>
                                    <Button
                                        onClick={(e) => {
                                            setIsEdit(true);
                                            setShowDialog(true);
                                        }}
                                        tooltip="Click to Edit"
                                        icon={"pi pi-pencil"}
                                        className="p-button-success p-button-rounded mr-2"
                                    />
                                    <Button
                                        onClick={(e) => {
                                            setIsEdit(false);
                                            setShowDialog(true);
                                        }}
                                        tooltip="Click to View"
                                        icon={"pi pi-eye"}
                                        className=" p-button-rounded mr-2"
                                    />
                                </>
                            )}
                        ></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
