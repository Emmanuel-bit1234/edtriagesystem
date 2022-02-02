import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import React from 'react';

export default function TextInput({ label = "", type = "text" }) {
    return type == 'text' ?
        <div className="p-fluid">
            <label>{label}</label>
            <InputText  required />
            <small style={{ width: "100%" }} className="p-error">input error </small>
        </div> :
        <div className="p-fluid">
            <label>{label}</label>

            <Calendar showIcon={true} required/>
            <small style={{ width: "100%" }} className="p-error">input error </small>
        </div>
}

