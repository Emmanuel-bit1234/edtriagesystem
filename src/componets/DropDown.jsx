import { Dropdown } from 'primereact/dropdown';
import React from 'react';

export default function DropDown({ label, value, onChange, error, options = [] }) {
    return <div className="form-control">
        <label>{label}</label>
        <Dropdown  optionLabel="name" value={value} options={options} onChange={onChange} style={{ width: '100%' }} placeholder={`${value}`} />
        <small className="p-error">
            {error}
        </small>
    </div>
}
