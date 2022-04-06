import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import React, { useEffect, useRef, useState } from "react";
import DelimitationServices from "../service/DelimitationServices";
import ReportService from "../service/ReportService";

import Viewer, { Worker, defaultLayout } from "@phuocng/react-pdf-viewer";
import "@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css";

export const VoterReports = () => {
    const options = [
        { name: "Eligible Voter", code: "eligible" },
        { name: "Ineligible Voter", code: "ineligible" },
    ];
    var [selectedOption, setSelectedOption] = useState();
    const toast = useRef(null);
    var delimitationServices = new DelimitationServices();
    var [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    var [reportLoaded, setReportLoaded] = useState(false);

    useEffect(() => {
        delimitationServices.getAllDistrict().then((data) => {
            setDistrict(data);
        });
    }, []);

    function SubmitForm() {
        setReportLoaded(false);
        var report = new ReportService();
        report
            .getReport({
                district: selectedDistrict?.id == null ? "" : selectedDistrict.id,
                reportID: 0,
            })
            .then((res) => {
                if (res?.status == true) {
                    setReportLoaded(true);
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
                <div className="card">
                    <div className="">
                        <Toolbar
                            className="mb-4"
                            left={
                                <div className="grid">
                                    <div className="col-4">
                                        <label>VoterReports</label>
                                        <Dropdown style={{ width: "200px" }} optionLabel="name" value={selectedOption} onChange={(e) => setSelectedOption(e.value)} options={options} placeholder="Select a Voter Report" />
                                    </div>
                                    <div className="col-4">
                                        <label>District</label>
                                        <Dropdown style={{ width: "200px" }} value={selectedDistrict} options={district} onChange={(e) => setSelectedDistrict(e.value)} optionLabel="name" placeholder="Select District" />
                                    </div>

                                    <div className="col-4">
                                        <div style={{ visibility: "hidden" }}>View</div>
                                        <Button label="view" className="p-button-success ml-3" onClick={SubmitForm} />
                                    </div>
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
                                <Viewer zoomInButton={true} defaultScale={1} onDocumentLoad={console.log} fileUrl={"https://localhost:44317/report/preview"} />
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
