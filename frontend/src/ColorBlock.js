import React, { useState } from 'react';
import { getColorHarmonies } from './colorHarmony';
import { colornames as colorNames } from 'color-name-list';

// Helper: convert rgb array or string to hex
function rgbToHex(rgb) {
  let arr = rgb;
  if (typeof rgb === 'string') {
    // input like 'rgb(255, 255, 255)'
    arr = rgb.match(/\d+/g).map(Number);
  }
  if (!Array.isArray(arr) || arr.length < 3) return '#000000';
  return (
    '#' + arr.slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()
  );
}

// Helper: find nearest color name from color-name-list
function getColorName(hex) {
  let minDist = Infinity, name = 'Unknown';
  const hexToRgb = h => [parseInt(h.substr(1,2),16), parseInt(h.substr(3,2),16), parseInt(h.substr(5,2),16)];
  const rgb1 = hexToRgb(hex);
  for (const c of colorNames) {
    const rgb2 = hexToRgb(c.hex.toUpperCase());
    const dist = Math.sqrt(
      Math.pow(rgb1[0]-rgb2[0],2) +
      Math.pow(rgb1[1]-rgb2[1],2) +
      Math.pow(rgb1[2]-rgb2[2],2)
    );
    if (dist < minDist) {
      minDist = dist;
      name = c.name;
    }
  }
  return name;
}

const ColorBlock = ({ color, label }) => {
  const [showHarmonies, setShowHarmonies] = useState(false);
  const harmonyPopupTimeout = React.useRef();

  // Helper to show/hide popup with delay
  const handlePopupEnter = () => {
    clearTimeout(harmonyPopupTimeout.current);
    setShowHarmonies(true);
  };
  const handlePopupLeave = () => {
    harmonyPopupTimeout.current = setTimeout(() => setShowHarmonies(false), 120);
  };
  const hex = rgbToHex(color);
  const harmonies = /^#[0-9a-fA-F]{6}$/.test(hex) ? getColorHarmonies(hex) : {};
  const name = getColorName(hex);

  // SVG download logic
  function handleDownloadSVG() {
    const width = 700, cardH = 120, rowH = 70, margin = 32, swatch = 36, swatchGap = 36;
    const labelWidth = 250;
    const harmonyRows = Object.entries(harmonies);
    const height = cardH + harmonyRows.length * rowH + margin * 2;
    let svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' font-family='Montserrat,sans-serif'>`;
    // Card main color
    svg += `<rect x='${margin}' y='${margin}' width='${width-margin*2}' height='${cardH}' rx='18' fill='${hex}' />`;
    svg += `<text x='50%' y='${margin+48}' text-anchor='middle' font-size='1.4em' fill='#fff' font-weight='bold' dominant-baseline='middle'>${name}</text>`;
    svg += `<text x='50%' y='${margin+88}' text-anchor='middle' font-size='1.1em' fill='#fff' dominant-baseline='middle'>${hex}</text>`;
    // Harmony rows
    harmonyRows.forEach(([type, arr], idx) => {
      const y = cardH + margin + rowH * idx + 10;
      svg += `<text x='${margin+8}' y='${y+swatch/2}' font-size='1em' fill='#232946' font-weight='600' dominant-baseline='middle'>${type}:</text>`;
      arr.forEach((hcol, i) => {
        const sx = margin + labelWidth + i * (swatch + swatchGap);
        svg += `<rect x='${sx}' y='${y}' width='${swatch}' height='${swatch}' rx='8' fill='${hcol}' stroke='#e3e6f0' stroke-width='1.5' />`;
        svg += `<text x='${sx+swatch/2}' y='${y+swatch+22}' text-anchor='middle' font-size='0.93em' fill='#232946' dominant-baseline='middle'>${hcol.toUpperCase()}</text>`;
      });
    });
    svg += '</svg>';
    const blob = new Blob([svg], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-harmony-${name.replace(/\s+/g,'_')}.svg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  return (
    <div style={{position:'relative'}}>
      <div
        className="color-block color-block-hoverable"
        style={{ background: hex, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        title="Show color harmonies"
        onMouseEnter={e => {
          e.currentTarget.classList.add('hovered');
          handlePopupEnter();
        }}
        onMouseLeave={e => {
          e.currentTarget.classList.remove('hovered');
          handlePopupLeave();
        }}
      >
        <button
          title="Copy hex to clipboard"
          className="copy-center-btn"
          style={{
            display: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            zIndex: 2
          }}
          onClick={e => {e.stopPropagation();navigator.clipboard.writeText(hex);}}
        >
          <img src={require('./copy.svg').default} alt="Copy" style={{width:44,height:44,filter:'invert(1)',opacity:0.92}} />
        </button>
        <div className="color-label">{label}</div>
        <div
          className="color-hex-overlay"
          style={{position:'absolute', left:0, bottom:0, width:'100%', overflow:'hidden', pointerEvents: 'none'}}
        >
          <span className="color-hex-text">{hex}</span>
          <span className="color-name-text">{name}</span>
        </div>
      </div>
      {showHarmonies && (
        <div className="color-harmony-popup" style={{minWidth:'520px', maxWidth:'700px'}} 
          onMouseEnter={handlePopupEnter} 
          onMouseLeave={handlePopupLeave}
        >
          <div className="harmony-popup-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'}}>
            <span style={{fontWeight:'bold',fontSize:'1.1em'}}>{name}</span>
            {/* Download icons created by Creatype - Flaticon: https://www.flaticon.com/free-icons/download */}
            <button className="harmony-download-btn" title="Download SVG" style={{background:'none',border:'none',padding:0,cursor:'pointer'}} onClick={e => {e.stopPropagation(); handleDownloadSVG();}}>
              <img src={require('./download.svg').default} alt="Download" style={{width:22,height:22,verticalAlign:'middle'}} />
            </button>
          </div>
          {Object.entries(harmonies).map(([type, arr]) => (
            <div key={type} className="harmony-row">
              <span className="harmony-type">{type}:</span>
              {arr.map((hcol) => (
                <span key={hcol} className="harmony-swatch" style={{background:hcol}} title={hcol}></span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// SVG download logic (move above return in component)
// function handleDownloadSVG() { ... }

export default ColorBlock;
