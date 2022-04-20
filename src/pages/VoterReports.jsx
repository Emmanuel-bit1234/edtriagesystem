import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import DelimitationServices from "../service/DelimitationServices";
import ReportService from "../service/ReportService";
import Viewer, { Worker, defaultLayout } from "@phuocng/react-pdf-viewer";
import "@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css";
import { LOCALHOST_NET_IP, NET_IP } from "../config/Config";
import { Dialog } from "primereact/dialog";

export const VoterReports = () => {
    const options = [
        { name: "Eligible Voter", reportID: 0 },
        { name: "Ineligible Voter", reportID: 1 },
        { name: "Source Data Report", reportID: 2 },
        { name: "The Deceased Report", reportID: 3 },
        { name: "Underage Electors Report", reportID: 4 },
        { name: "Pending Transfers Report", reportID: 5 },
    ];

    var [selectedOption, setSelectedOption] = useState(null);
    const toast = useRef(null);
    var delimitationServices = new DelimitationServices();
    var [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");

    var [constituency, setConstituency] = useState([]);
    const [selectedConstituency, setSelectedConstituency] = useState("");

    var [PollingDivision, setPollingDivision] = useState([]);
    const [selectedPollingDivision, setSelectedPollingDivision] = useState("");

    var [village, setVillage] = useState([]);
    const [selectedVillage, setSelectedVillage] = useState("");

    var [registrationCentre, setRegistrationCentre] = useState([]);
    const [selectedRegistrationCentre, setSelectedRegistrationCentre] = useState("");

    var [reportLoaded, setReportLoaded] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    function clear_when_updating_district() {
        setSelectedConstituency("");
        setConstituency([]);

        setSelectedVillage("");
        setVillage([]);

        setRegistrationCentre([]);
        setSelectedRegistrationCentre("");

        setPollingDivision([]);
        setSelectedPollingDivision("");
    }

    function clear_when_updating_constituency() {
        setSelectedVillage("");
        setVillage([]);

        setRegistrationCentre([]);
        setSelectedRegistrationCentre("");

        setPollingDivision([]);
        setSelectedPollingDivision("");
    }

    function clear_when_updating_polling_division() {
        setSelectedVillage("");
        setVillage([]);

        setRegistrationCentre([]);
        setSelectedRegistrationCentre("");
    }

    function clear_when_updating_registration_centre() {
        setSelectedVillage("");
        setVillage([]);
    }

    function DistrictHandler(id) {
        setSelectedDistrict(id);
        clear_when_updating_district();
        delimitationServices.getConstituency(id.id).then((data) => {
            setConstituency(data);
        });
    }

    function ConstituencyHandler(id) {
        setSelectedConstituency(id);
        clear_when_updating_constituency();
        delimitationServices.pollingDivision(id.id).then((data) => {
            setPollingDivision(data);
        });
    }

    function PollingHandler(id) {
        setSelectedPollingDivision(id);
        clear_when_updating_polling_division();
        delimitationServices.registrationCentre(id.id).then((data) => {
            setRegistrationCentre(data);
        });
    }

    function RegistrationCentreHandler(id) {
        setSelectedRegistrationCentre(id);
        clear_when_updating_registration_centre();
        delimitationServices.getVillage(id.id).then((data) => {
            setVillage(data);
        });
    }

    function ClearHandler() {
        setSelectedDistrict("");

        setSelectedConstituency("");
        setConstituency([]);

        setSelectedVillage("");
        setVillage([]);

        setRegistrationCentre([]);
        setSelectedRegistrationCentre("");

        setPollingDivision([]);
        setSelectedPollingDivision("");
    }

    useEffect(() => {
        delimitationServices.getAllDistrict().then((data) => {
            setDistrict(data);
        });
    }, []);

    function SubmitFilter() {
        setReportLoaded(false);
        // selectedDistrict?.id
        var report = new ReportService();
        report

            .getReport({
                district: selectedDistrict?.id,
                village: selectedVillage?.id,
                constituency: selectedConstituency.id,
                polling: selectedPollingDivision.id,
                centre: selectedRegistrationCentre.id,
                reportID: selectedOption?.reportID,
            })
            .then((res) => {
                if (res?.reportHasData == false) {
                    return toast.current.show({ severity: "error", summary: "Error Message", detail: "No data to display for this filter", life: 3000 });
                }
                if (res?.status == true) {
                    setReportLoaded(true);
                    setShowDialog(false);
                    toast.current.show({ severity: "success", summary: "Success Message", detail: res?.message, life: 3000 });
                } else {
                    toast.current.show({ severity: "error", summary: "Error Message", detail: res?.message, life: 3000 });
                }
            });
    }

    const layout = (isSidebarOpened, container, main, toolbar, sidebar) => {
        return defaultLayout(isSidebarOpened, container, main, toolbar(renderToolbar), sidebar);
    };
    const renderToolbar = (toolbarSlot) => {
        return (
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    width: "100%",
                    position: "sticky",
                    top: 0,
                }}
            >
                <div
                    style={{
                        alignItems: "center",
                        display: "flex",
                        flexGrow: 1,
                        flexShrink: 1,
                        justifyContent: "center",
                    }}
                >
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.fullScreenButton}</div>
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.previousPageButton}</div>
                    <div style={{ padding: "0 2px" }}>
                        {toolbarSlot.currentPage + 1} / {toolbarSlot.numPages}
                    </div>
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.nextPageButton}</div>
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.zoomOutButton}</div>
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.zoomPopover}</div>
                    <div style={{ padding: "0 2px" }}>{toolbarSlot.zoomInButton}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <Dialog
                    draggable={false}
                    header={
                        <b>
                            <h5>Voter Report Filter - ({selectedOption?.name})</h5>
                        </b>
                    }
                    style={{ width: "75%", height: "75%" }}
                    modal
                    visible={showDialog}
                    onHide={(e) => {
                        setShowDialog(false);
                    }}
                    footer={
                        <>
                            <Button className="my-2  p-button-primary" label="Clear" onClick={ClearHandler} icon="pi pi-times" />
                            <Button className="my-2  p-button-success" label="Preview" onClick={SubmitFilter} icon="pi pi-eye" />
                        </>
                    }
                >
                    <div className="grid">
                        <div className="col-4">
                            <label>District</label>
                            <Dropdown style={{ width: "100%" }} filter value={selectedDistrict} options={district} onChange={(e) => DistrictHandler(e.value)} optionLabel="name" placeholder="Select District" />
                        </div>

                        {constituency?.length > 0 ? (
                            <div className="col-4">
                                <label>Constituency </label>
                                <Dropdown style={{ width: "100%" }} filter value={selectedConstituency} options={constituency} onChange={(e) => ConstituencyHandler(e.value)} optionLabel="name" placeholder="Select  Constituency" />
                            </div>
                        ) : (
                            ""
                        )}

                        {PollingDivision?.length > 0 ? (
                            <div className="col-4">
                                <label>Polling Division</label>
                                <Dropdown style={{ width: "100%" }} value={selectedPollingDivision} options={PollingDivision} onChange={(e) => PollingHandler(e.value)} optionLabel="name" placeholder="Select Polling Division" />
                            </div>
                        ) : (
                            ""
                        )}

                        {registrationCentre?.length > 0 ? (
                            <div className="col-4">
                                <label>Registration Centre</label>
                                <Dropdown style={{ width: "100%" }} value={selectedRegistrationCentre} options={registrationCentre} onChange={(e) => RegistrationCentreHandler(e.value)} optionLabel="name" placeholder="Select Registration Centre" />
                            </div>
                        ) : (
                            ""
                        )}
                        {village?.length > 0 ? (
                            <div className="col-4">
                                <label>Village</label>
                                <Dropdown style={{ width: "100%" }} filter value={selectedVillage} options={village} onChange={(e) => setSelectedVillage(e.value)} optionLabel="summary" placeholder="Select Village" />
                            </div>
                        ) : (
                            ""
                        )}
                    </div>
                </Dialog>

                <div className="card">
                    <div className="">
                        <Toolbar
                            className="mb-4"
                            left={
                                <div className="grid">
                                    <div className="col-10">
                                        <label>Voter Reports</label>
                                        <Dropdown filter style={{ width: "100%" }} optionLabel="name" value={selectedOption} onChange={(e) => setSelectedOption(e.value)} options={options} placeholder="Select a Voter Report" />
                                    </div>

                                    {selectedOption != null && (
                                        <div className="col-2">
                                            <div style={{ visibility: "hidden" }}>View</div>
                                            <Button label="Filter" className="p-button-success ml-2" icon="pi pi-search" onClick={(e) => setShowDialog(true)} />
                                        </div>
                                    )}
                                </div>
                            }
                        ></Toolbar>
                    </div>

                    {reportLoaded == true ? (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.13.216/build/pdf.worker.min.js">
                            <div
                                className="App"
                                style={
                                    {
                                        // height: 900,
                                    }
                                }
                            >
                                {/* layout={layout} */}
                                <Viewer zoomInButton={true} defaultScale={1} onDocumentLoad={console.log} fileUrl={`${LOCALHOST_NET_IP}/report/preview`} />
                            </div>
                        </Worker>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        </div>
    );
};
