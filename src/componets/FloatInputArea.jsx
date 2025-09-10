import { InputText } from "primereact/inputtext";
import React from "react";

export default function FloatInputArea({
    placeholder = "",
    label = "",
    value = "",
    onChange = null,
    disabled = false,
    min = null,
    max = null,
    hint = "",    // ✅ new prop for hints
}) {
    // Allow digits and one decimal point while typing
    const handleChange = (e) => {
        if (!onChange) return;
        let raw = e.target.value ?? "";

        // remove invalid chars, but allow one "."
        raw = raw.replace(/[^0-9.]/g, "");
        const parts = raw.split(".");
        if (parts.length > 2) {
            raw = parts[0] + "." + parts.slice(1).join(""); // collapse multiple dots
        }

        onChange({ ...e, target: { ...e.target, value: raw } });
    };

    // On blur: clamp into [min, max] and normalize
    const handleBlur = (e) => {
        if (!onChange) return;
        const raw = e.target.value ?? "";
        if (raw === "" || isNaN(raw)) return;

        let num = parseFloat(raw);

        if (typeof min === "number" && num < min) num = min;
        if (typeof max === "number" && num > max) num = max;

        // round to 1 decimal place for consistency
        const normalized = num.toFixed(1);

        onChange({ ...e, target: { ...e.target, value: normalized } });
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
                inputMode="decimal"   // numeric keypad with dot on mobile
            />
            {hint && (
                <small style={{ width: "100%", color: "#6c757d", fontSize: "0.875rem" }}>
                    {hint}
                </small>
            )}
            <small style={{ width: "100%" }} className="p-error" />
        </div>
    );
}