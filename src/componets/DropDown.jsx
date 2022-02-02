import { Dropdown } from 'primereact/dropdown';
import React from 'react';

export default function DropDown({ label,optionLabel, optionValue,value, onChange, error, options = [] }) {
    return <div className="form-control">
        <label>{label}</label>
        <Dropdown required optionLabel={optionLabel} optionValue={optionValue} value={value} options={options} onChange={onChange} style={{ width: '100%' }} placeholder={`${value}`} />
        <small className="p-error">
            {error}
        </small>
    </div>
}
