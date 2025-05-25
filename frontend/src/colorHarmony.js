// Utilities for color harmony based on color theory
// Input: hex color string (e.g. #ff0000)
// Output: array of hex colors for each harmony type

function hexToHsl(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
  const r = parseInt(hex.substring(0,2),16)/255;
  const g = parseInt(hex.substring(2,4),16)/255;
  const b = parseInt(hex.substring(4,6),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h,s,l = (max+min)/2;
  if(max===min){h=s=0;}else{
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h = (g-b)/d + (g<b?6:0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h,s,l) {
  s/=100; l/=100;
  let c = (1-Math.abs(2*l-1))*s, x = c*(1-Math.abs((h/60)%2-1)), m=l-c/2;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  r = Math.round((r+m)*255); g = Math.round((g+m)*255); b = Math.round((b+m)*255);
  return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

export function getColorHarmonies(hex) {
  const [h,s,l] = hexToHsl(hex);
  return {
    'Complementary': [hslToHex((h+180)%360,s,l)],
    'Analogous': [hslToHex((h+30)%360,s,l), hslToHex((h+330)%360,s,l)],
    'Triadic': [hslToHex((h+120)%360,s,l), hslToHex((h+240)%360,s,l)],
    'Split Complementary': [hslToHex((h+150)%360,s,l), hslToHex((h+210)%360,s,l)],
    'Tetradic': [hslToHex((h+90)%360,s,l), hslToHex((h+180)%360,s,l), hslToHex((h+270)%360,s,l)]
  };
}
