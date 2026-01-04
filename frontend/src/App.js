import React, { useState } from 'react';
import BlobsBackground from './BlobsBackground';
import AnimatedRainbowText from './AnimatedRainbowText';
import ColorBlock from './ColorBlock';
import './App.css';

function rgbToHex(arr) {
  // arr: [r,g,b] or [r,g,b,a]
  if (!arr || !Array.isArray(arr) || arr.length < 3) return '#fff';
  return (
    '#' + arr.slice(0,3).map(x => (typeof x === 'number' && !isNaN(x) ? x.toString(16).padStart(2, '0') : '00')).join('')
  );
}

function App() {
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    setProgress(0);
    setProgressText('Preparing analysis...');
    if (!url || url.length < 3) {
      setError('Please enter a valid website URL');
      setProgress(0);
      setProgressText('');
      return;
    }
    let fullUrl = url.trim();
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = 'https://' + fullUrl;
    }
    setLoading(true);
    setProgress(10);
    setProgressText('Connecting to server...');
    try {
      await new Promise(res => setTimeout(res, 400)); // Simulate progress
      setProgress(30);
      setProgressText('Analyzing website...');
      const res = await fetch('http://72.61.243.152:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl })
      });
      setProgress(60);
      setProgressText('Processing results...');
      await new Promise(res => setTimeout(res, 350)); // Simulate processing
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze site');
      }
      const data = await res.json();
      setProgress(100);
      setProgressText('Done!');
      setResult(data);
    } catch (e) {
      setError(e.message);
      setProgressText('Error occurred');
    } finally {
      setLoading(false);
      setTimeout(() => { setProgress(0); setProgressText(''); }, 1200);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setImageFile(file);
    setError('');
    setResult(null);
    if (file && file.type && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  // Accept file param for drag-and-drop auto-upload
  const handleImageUpload = async (fileParam) => {
    const fileToUpload = fileParam || imageFile;
    setError('');
    setResult(null);
    setProgress(0);
    setProgressText('Preparing image upload...');
    if (!fileToUpload) {
      setError('Please select an image file');
      setProgress(0);
      setProgressText('');
      return;
    }
    setLoading(true);
    setProgress(10);
    setProgressText('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('image', fileToUpload);
      await new Promise(res => setTimeout(res, 300)); // Simulate progress
      setProgress(40);
      setProgressText('Analyzing image...');
      const res = await fetch('http://72.61.243.152:5000/upload-image', {
        method: 'POST',
        body: formData
      });
      setProgress(70);
      setProgressText('Processing results...');
      await new Promise(res => setTimeout(res, 250)); // Simulate processing
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze image');
      }
      const data = await res.json();
      setProgress(100);
      setProgressText('Done!');
      setResult(data);
    } catch (e) {
      setError(e.message);
      setProgressText('Error occurred');
    } finally {
      setLoading(false);
      setTimeout(() => { setProgress(0); setProgressText(''); }, 1200);
    }
  };

  return (
    <div className="app">
      <BlobsBackground
        colors={
          result && result.palette
            ? [
                ...(result.palette.primary ? [result.palette.primary] : []),
                ...(result.palette.secondary ? [result.palette.secondary] : []),
                ...(result.palette.tertiary ? [result.palette.tertiary] : []),
                ...(Array.isArray(result.palette.others) ? result.palette.others : [])
              ].map(c => (Array.isArray(c) ? rgbToHex(c) : c || '#fff'))
            : undefined
        }
      />
      <header className="app-header">
        <div className={`center-hero${result ? ' hero-animate-up' : ''}`}>
          <h1 className="font-h1" style={{marginBottom: 10}}>MoodMorph</h1>
          <AnimatedRainbowText className="app-desc" text="A website color palette analysis tool." />
        </div>
        <div className="analyze-form">
          <div style={{
            position:'relative',
            display:'flex',alignItems:'center',width:520,maxWidth:'90vw',margin:'0 auto',
            background:'rgba(255,255,255,0.18)',
            border:'1.5px solid rgba(255,255,255,0.35)',
            borderRadius:18,
            overflow:'hidden',
            boxShadow:'0 8px 32px 0 rgba(31,38,135,0.18)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            borderTop:'1.5px solid rgba(255,255,255,0.45)',
            borderLeft:'1.5px solid rgba(255,255,255,0.25)',
            borderRight:'1.5px solid rgba(255,255,255,0.25)',
            borderBottom:'1.5px solid rgba(255,255,255,0.12)',
            minHeight:48
          }}>
            {/* Progress bar layer */}
            <div style={{
              position:'absolute',left:0,top:0,height:'100%',
              width:`${progress}%`,
              background:'linear-gradient(90deg, rgba(97,218,251,0.19) 0%, rgba(97,251,218,0.13) 100%)',
              backdropFilter:'blur(8px)',
              WebkitBackdropFilter:'blur(8px)',
              zIndex:1,
              transition:'width 0.35s cubic-bezier(.4,1.2,.4,1)',
              pointerEvents:'none'
            }} />
            {/* Content layer */}
            <div style={{position:'relative',display:'flex',alignItems:'center',width:'100%',zIndex:2}}>
            {imageFile ? (
              <>
                <div style={{display:'flex',alignItems:'center',height:48,paddingLeft:20,flex:1,overflow:'hidden'}}>
                  <img src={require('./attach.svg').default} alt="Attach" style={{width:20,height:20,opacity:0.8,marginRight:10,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.07))'}} />
                  <span style={{whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',fontSize:16,maxWidth:180,color:'#222',letterSpacing:'0.01em'}} title={imageFile.name}>{imageFile.name}</span>
                </div>
                <button onClick={()=>{setImageFile(null);setUrl('');setError('');setResult(null);}} style={{background:'none',border:'none',outline:'none',height:48,width:48,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}} title="Remove image">
                  <img src={require('./close.svg').default} alt="Remove" style={{width:20,height:20,opacity:0.7,transition:'opacity 0.2s',filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.09))'}} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7} />
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id="attach-input"
                  style={{display:'none'}}
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <label htmlFor="attach-input" style={{display:'flex',alignItems:'center',justifyContent:'center',height:48,width:48,cursor:'pointer',background:'none',border:'none',padding:0,margin:0}} title="Attach image">
                  <img src={require('./attach.svg').default} alt="Attach" style={{width:22,height:22,opacity:0.7,transition:'opacity 0.2s',filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.09))'}} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7} />
                </label>
                <input
                  type="text"
                  placeholder="Enter website URL or drop an image here..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className={`url-input${dragActive ? ' drag-active' : ''}`}
                  disabled={loading}
                  onKeyDown={e => { if (e.key === 'Enter') handleAnalyze(); }}
                  onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                  onDrop={e => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];
                      if (file.type.startsWith('image/')) {
                        setImageFile(file);
                        setUrl('');
                        setError('');
                        setResult(null);
                        handleImageUpload(file); // Start analysis immediately
                      } else {
                        setError('Only image files are supported for drag-and-drop.');
                      }
                    }
                  }}
                  style={{border:'none',outline:'none',height:48,boxSizing:'border-box',flex:1,fontSize:17,paddingLeft:0,paddingRight:48,background:'transparent',borderRadius:0,color:'#222',letterSpacing:'0.01em'}}
                />
                {/* Analysis/clear icon at right edge */}
                <div style={{position:'absolute',top:0,right:0,height:48,width:48,display:'flex',alignItems:'center',justifyContent:'center',zIndex:4}}>
                  {(progress === 100 && result) ? (
                    <button onClick={()=>{setResult(null);setProgress(0);setProgressText('');}} style={{background:'none',border:'none',outline:'none',height:48,width:48,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',padding:0}} title="Clear analysis">
                      <img src={require('./close.svg').default} alt="Clear" style={{width:22,height:22,opacity:0.8,transition:'opacity 0.2s'}} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.8} />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (loading) return;
                        if (imageFile) {
                          handleImageUpload();
                        } else {
                          handleAnalyze();
                        }
                      }}
                      style={{background:'none',border:'none',outline:'none',height:48,width:48,display:'flex',alignItems:'center',justifyContent:'center',cursor: loading ? 'not-allowed' : 'pointer',padding:0}}
                      title={loading ? 'Analyzing...' : 'Analyze'}
                      disabled={loading || (!url && !imageFile)}
                    >
                      <img src={require('./analyze.svg').default} alt="Analyze" style={{width:22,height:22,opacity:0.8,transition:'opacity 0.2s',animation: loading ? 'spin 1.1s linear infinite' : 'none'}} />
                    </button>
                  )}
                </div>
              </>
            )}
            </div>
          </div>

        </div>

        {progressText && (
          <div style={{
            marginTop:6,
            marginBottom:2,
            fontSize:14,
            color:'#1a3a4d',
            opacity:0.82,
            letterSpacing:'0.01em',
            fontWeight:500,
            textAlign:'left',
            minHeight:18,
            paddingLeft:8
          }}>
            {progressText}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}
        {result && (
          <div className="result-section">
            <h2>Color Palette</h2>
            <div className="palette-row">
              {Object.entries(result.palette).map(([key, val]) =>
                 Array.isArray(val)
                   ? val.map((color, idx) => <ColorBlock key={key + idx} color={color} />)
                   : <ColorBlock key={key} color={val} />
               )}
            </div>
            {Array.isArray(result.fonts) && result.fonts.length > 0 && (
               <>
                 <h2>Fonts</h2>
                 <div className="font-preview-list">
                   {result.fonts.slice(0, 3).map((font, idx) => (
                     <div key={idx} className="font-preview-block" style={{ fontFamily: font }}>
                       <div className="font-label">{font}</div>
                       <div className="font-h1">Heading Example</div>
                       <div className="font-h2">Subheading Example</div>
                       <div className="font-body">Main text example: The quick brown fox jumps over the lazy dog.</div>
                       <div className="font-caption">Subtext example: 1234567890 !@#$%^&amp;*()</div>
                     </div>
                   ))}
                 </div>
               </>
             )}
          </div>
        )}
      </header>
      <footer>
        <div className="footer-glass-card">
          <div className="footer-links">
            <a href="https://easyio.tech" target="_blank" rel="noopener noreferrer" className="footer-link">Website</a>
            <a href="https://github.com/eddy7896" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="https://instagram.com/faheem0017" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
          </div>
          <div className="footer-dev">Developed by <span className="footer-author">Mohammad Faheem</span></div>
        </div>
      </footer>
    </div>
  );
}

export default App;
