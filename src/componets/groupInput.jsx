import { InputText } from "primereact/inputtext";
import React from "react";

export default function GroupInput({ placeholder = "", value = "", onChange = null, disabled = false }) {
    return (
        <InputText placeholder={placeholder} value={value} onChange={onChange} required />
    );
}
