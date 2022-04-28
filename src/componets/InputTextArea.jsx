import { InputTextarea } from "primereact/inputtextarea";
import React from "react";

export default function InputTextArea ({placeholder="",label = "", type = "text", value = "", onChange = null, disabled = false }) {
    return (
        <div className="p-fluid">
            <label>{label}</label>
            {/* <div style={{ visibility: "hidden" }}>LOGO</div>   */}
            <InputTextarea placeholder={placeholder} value={value} onChange={onChange} disabled={disabled} />
        </div>
    )   
}
