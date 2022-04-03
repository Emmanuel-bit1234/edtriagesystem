import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import React, { useState } from "react";

export const AdministrationReports = () => {
    const options = [{ name: "kit-configuration", code: "kit-configuration" }];
    var [selectedOption, setSelectedOption] = useState();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <div className="">
                        <Toolbar
                            className="mb-4"
                            left={
                                <div>
                                    <Dropdown optionLabel="name" value={selectedOption} onChange={(e) => setSelectedOption(e.value)} options={options} placeholder="Select a  Administration Report" />
                                    <Button label="view" className="p-button-success ml-3" />
                                </div>
                            }
                        ></Toolbar>
                    </div>

                    <iframe frameBorder="0" src="https://localhost:44379/WebForm2.aspx" width={"100%"} height="700px" title="W3Schools Free Online Web Tutorials"></iframe>
                </div>
            </div>
        </div>
    );
};
