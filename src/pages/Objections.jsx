import React from "react";
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import TextInput from "../componets/TextInput";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import DropDown from "../componets/DropDown";
import ObjectionsService from "../service/ObjectionsService";
import AddObjections from "../componets/AddObjections";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Toast } from "primereact/toast";

export const Objections = () => {
    const toast = useRef(null);
    const [showAddObjectionForm, setShowAddObjectionForm] = useState(false);
    const [objectionNumber, setObjectionNumber] = useState("");
    let [data, setData] = useState([]);
    var [objectionType, setObjectionType] = useState([]);
    var [SelectedObjectionTypeID, setselectedObjectionTypeID] = useState();
    var [objectionStatus, setObjectionStatus] = useState([]);
    var [SelectedObjectionStatus, setselectedObjectionStatus] = useState( "SELECT A STATUS");

    const [selectedObjections, setSelectedObjections] = useState(null);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: {
            operator: FilterOperator.AND,
            constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
    });
    var objectionTypeService = new ObjectionsService();
    var objectionStatusService = new ObjectionsService();
    useEffect(() => {
        objectionTypeService.getAllObjectionType().then((data) => {
            setObjectionType(data);
        });
        objectionStatusService.getAllObjectionStatuses().then((data) => {
            setObjectionStatus(data);
        });
    }, []);
    function objectionTypeHandler(e) {
        setForm({ ...form, ObjectionType: e.value });
        setselectedObjectionTypeID(e.value.ObjectionTypeID);
        var id = e.value?.ObjectionTypeID ? e.value?.ObjectionTypeID : null;
        if (id == null) return setData([]);
        objectionsService.getObjectionsByTypeStatusAndEvent(id).then((e) => {
            setData(e);
        });
    }
    function objectionStatusHandler(e) {
        setForm({ ...form, ObjectionStatus: e.value });
        setselectedObjectionStatus(e.value);
        var id1 = SelectedObjectionTypeID;
        var id2 = e.value?.StatusID ? e.value?.StatusID : null;
        if (id2 == null) return setData([]);
        objectionsService.getObjectionsByTypeStatusAndEvent(id1, id2).then((e) => {
            setData(e);
        });
    }
    var [form, setForm] = useState({
        ObjectionType: "SELECT A TYPE",
    });
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters1 = { ...filters };
        _filters1["global"].value = value;
        setFilters(_filters1);
        setGlobalFilterValue(value);
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Objections</h5>
        </div>
    );

    var objectionsService = new ObjectionsService();
    function submitForm() {
        console.log(objectionNumber);
        objectionsService.getObjectionsByID(objectionNumber).then((e) => {
            console.log(e);
            setData(e);
        });
    }
    return (
        <div className="card  p-align-stretch vertical-container">
            <Toast ref={toast} />
            <div className="">
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="grid">
                                <div className="col-12  lg:col-6">
                                    <DropDown label="Objection Type" optionLabel="Name" onChange={(e) => objectionTypeHandler(e)} options={objectionType} value={form.ObjectionType} />
                                </div>
                                <div className="col-12  lg:col-6">
                                    <DropDown label="Objection Status" optionLabel="Name" onChange={(e) => objectionStatusHandler(e)} value={SelectedObjectionStatus} options={objectionStatus} />
                                </div>
                            </div>
                        </div>
                    }
                    right={
                        <div>
                            <div className="">
                                <InputText type="search" placeholder="Search by Registration Number" value={objectionNumber} onInput={(e) => setObjectionNumber(e.target.value)} style={{ width: "250px" }} />
                                <Button className="p-button-success ml-4" label="Search" onClick={submitForm} />
                            </div>
                        </div>
                    }
                ></Toolbar>
                {/* <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <div className="">
                                <InputText type="search" placeholder="Search by Registration Number" value={objectionNumber} onInput={(e) => setObjectionNumber(e.target.value)} style={{ width: "250px" }} />
                                <Button className="p-button-success ml-4" label="Search" onClick={submitForm} />
                            </div>
                        </div>
                    }
                ></Toolbar> */}
                <Toolbar
                    className="mb-4"
                    left={
                        <div>
                            <Button className="p-button-success mr-2" icon="pi pi-plus" label="Add Objection" onClick={(e) => setShowAddObjectionForm(true)} />
                        </div>
                    }
                    right={
                        <div>
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Search Objection" />
                            </span>
                        </div>
                    }
                ></Toolbar>
            </div>

            <AddObjections show={showAddObjectionForm} setShow={setShowAddObjectionForm} />

            <DataTable
                size="small"
                scrollable={true}
                value={data}
                dataKey="id"
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                className="datatable-responsive"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                emptyMessage="No Objections found."
                header={header}
                responsiveLayout="scroll"
                selection={selectedObjections}
                onSelectionChange={(e) => setSelectedObjections(e.value)}
                resizableColumns
                columnResizeMode="expand"
                filters={filters}
                filterDisplay="ObjectionType"
                globalFilterFields={["ObjectionType"]}
            >
                <Column field="ObjectionType" header="Objection Type" sortable></Column>
                <Column field="DateLodged" header="Date Lodged" sortable></Column>
                <Column field="RegistrationNumber" header="Registration Number"></Column>
                <Column
                    field="actions"
                    header="Actions"
                    body={() => (
                        <>
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon={"pi pi-eye"} tooltipOptions={{ position: "top" }} className="p-button-primary p-button-rounded mr-2" tooltip="Click to View" onClick={(a) => {}} />
                            <Button style={{ textAlign: "center", width: "30px", height: "30px" }} icon="pi pi-trash" className="p-button-rounded p-button-danger mr-2" />
                        </>
                    )}
                ></Column>
            </DataTable>
        </div>
    );
};
