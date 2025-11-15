import React from 'react';
import { ChromePicker } from 'react-color';

const ColorPicker = ({ color, onChange }) => {
  return (
    <div style={{ position: 'relative' }}>
      <ChromePicker
        color={color}
        onChange={(color) => onChange(color.rgb)}
      />
    </div>
  );
};

export default ColorPicker; 