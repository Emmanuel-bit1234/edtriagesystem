import { InputText } from "primereact/inputtext";
import React from "react";

export default function InputArea({
    placeholder = "",
    label = "",
    value = "",
    onChange = null,
    disabled = false,
    min = null,   // ✅ new props
    max = null,   // ✅ new props
}) {
    // While typing: keep only digits, allow empty
    const handleChange = (e) => {
        if (!onChange) return;
        const raw = e.target.value ?? "";
        const digits = raw.replace(/\D/g, "");
        onChange({ ...e, target: { ...e.target, value: digits } });
    };

    // On blur: clamp to [min, max]
    const handleBlur = (e) => {
        if (!onChange) return;
        const raw = (e.target.value ?? "").replace(/\D/g, "");
        if (raw === "") return;
        let num = parseInt(raw, 10);

        if (typeof min === "number" && num < min) num = min;
        if (typeof max === "number" && num > max) num = max;

        onChange({ ...e, target: { ...e.target, value: String(num) } });
    };

    return (
        <div className="p-fluid">
            <label>{label}</label>
            <InputText
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                inputMode="numeric"
                pattern="\d*"
                maxLength={String(max ?? "").length} // prevent typing beyond max digits
            />
            <small style={{ width: "100%" }} className="p-error">
                {/* input error */}
            </small>
        </div>
    );
}