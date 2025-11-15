import React, { useState } from 'react';
import ColorPicker from '../../components/ColorPicker';
import { palette } from '../../data/wwwMarkers';

const MapColorManager = () => {
  const [colors, setColors] = useState(palette);

  const handleColorChange = (category, colorName, newColor) => {
    const rgba = `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, ${newColor.a})`;
    setColors(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [colorName]: rgba
      }
    }));
  };

  return (
    <div className="color-manager">
      <h2>颜色管理</h2>
      {Object.entries(colors).map(([category, colorSet]) => (
        <div key={category}>
          <h3>{category}</h3>
          <div className="color-grid">
            {Object.entries(colorSet).map(([colorName, colorValue]) => (
              <div key={colorName} className="color-item">
                <label>{colorName}</label>
                <ColorPicker
                  color={colorValue}
                  onChange={(color) => handleColorChange(category, colorName, color)}
                />
                <div 
                  className="color-preview"
                  style={{ backgroundColor: colorValue }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapColorManager; 