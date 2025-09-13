import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '../primitives/input.jsx';

export function TextField({ name, label, control, rules, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={name} className="text-sm font-medium text-[var(--text)]">
          {label}
        </label>
      ) : null}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <Input id={name} placeholder={placeholder} type={type} {...field} />
            {fieldState.error ? (
              <div className="text-xs" style={{ color: 'var(--accent)' }}>
                {fieldState.error.message}
              </div>
            ) : null}
          </>
        )}
      />
    </div>
  );
}
