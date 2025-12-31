// frontend/src/components/FloatingLabelSelect.jsx
import React from 'react';

const FloatingLabelSelect = ({ label, name, options, value, onChange }) => {
    return (
        <div className="cp_ipselect06">
            <select 
                className="cp_sl06" 
                name={name} 
                value={value} 
                onChange={onChange} 
                required
            >
                <option value="" hidden disabled></option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <span className="cp_sl06_selectbar"></span>
            <label className="cp_sl06_selectlabel">{label}</label>
        </div>
    );
};

export default FloatingLabelSelect;