import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import React from "react";

export default function TextInput({placeholder="",label = "", type = "text", value = "", onChange = null, disabled = false }) {
    return type === "text" ? (
        <div className="p-fluid">
            <label>{label}</label>
            <InputText placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />
            <small style={{ width: "100%" }} className="p-error">
                {/* input error{" "} */}
            </small>
        </div>
    ) : (
        <div className="p-fluid">
            <label>{label}</label>
            <Calendar  dateFormat="yy-mm-dd" value={value} onChange={onChange} showIcon={true} />
            <small style={{ width: "100%" }} className="p-error">
                {/* input error{" "} */}
            </small>
        </div>
    );
}
