import{c as b}from"./createLucideIcon-DhCu6Z8O.js";import{d as g,r as c,s as d,j as e}from"./index-Tyz_JBt9.js";/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],y=b("zap",h),w=({onPreferencesChange:p,initialPreferences:x})=>{const{user:s}=g(),[a,l]=c.useState(x||{paletteBias:"neutral",priceSensitivity:.5,abstractionLevel:.5,discoveryMode:.3,sizeBias:"any",mediumFocus:[],colorPreferences:[]}),[u,o]=c.useState(!1);c.useEffect(()=>{s&&v()},[s]);const v=async()=>{try{const{data:r}=await d.from("user_preferences").select("live_preferences").eq("user_id",s?.id).single();r?.live_preferences&&l(r.live_preferences)}catch(r){console.error("Error loading preferences:",r)}},f=async r=>{if(s)try{o(!0),await d.from("user_preferences").upsert({user_id:s.id,live_preferences:r,updated_at:new Date().toISOString()})}catch(t){console.error("Error saving preferences:",t)}finally{o(!1)}},n=(r,t)=>{const i={...a,[r]:t};l(i),p(i),setTimeout(()=>f(i),1e3)};return e.jsxs("div",{className:"live-preference-controls",children:[e.jsxs("div",{className:"preference-section",children:[e.jsx("h3",{children:"🎨 Live Preferences"}),e.jsx("p",{className:"preference-subtitle",children:"Adjust to see results update in real-time"})]}),e.jsxs("div",{className:"preference-control",children:[e.jsx("label",{children:"Color Mood"}),e.jsx("div",{className:"palette-buttons",children:["warm","cool","neutral","vibrant","muted"].map(r=>e.jsxs("button",{className:`palette-btn ${a.paletteBias===r?"active":""}`,onClick:()=>n("paletteBias",r),children:[e.jsx("div",{className:`palette-preview palette-${r}`}),r]},r))})]}),e.jsxs("div",{className:"preference-control",children:[e.jsxs("label",{children:["Price Focus",e.jsx("span",{className:"preference-value",children:a.priceSensitivity<.3?"Budget-conscious":a.priceSensitivity>.7?"Investment-focused":"Balanced"})]}),e.jsx("input",{type:"range",min:"0",max:"1",step:"0.1",value:a.priceSensitivity,onChange:r=>n("priceSensitivity",parseFloat(r.target.value)),className:"preference-slider"}),e.jsxs("div",{className:"slider-labels",children:[e.jsx("span",{children:"Budget"}),e.jsx("span",{children:"Investment"})]})]}),e.jsxs("div",{className:"preference-control",children:[e.jsxs("label",{children:["Style Preference",e.jsx("span",{className:"preference-value",children:a.abstractionLevel<.3?"Figurative":a.abstractionLevel>.7?"Abstract":"Mixed"})]}),e.jsx("input",{type:"range",min:"0",max:"1",step:"0.1",value:a.abstractionLevel,onChange:r=>n("abstractionLevel",parseFloat(r.target.value)),className:"preference-slider"}),e.jsxs("div",{className:"slider-labels",children:[e.jsx("span",{children:"Figurative"}),e.jsx("span",{children:"Abstract"})]})]}),e.jsxs("div",{className:"preference-control",children:[e.jsxs("label",{children:["Discovery Mode",e.jsx("span",{className:"preference-value",children:a.discoveryMode<.3?"Familiar":a.discoveryMode>.7?"Adventurous":"Balanced"})]}),e.jsx("input",{type:"range",min:"0",max:"1",step:"0.1",value:a.discoveryMode,onChange:r=>n("discoveryMode",parseFloat(r.target.value)),className:"preference-slider"}),e.jsxs("div",{className:"slider-labels",children:[e.jsx("span",{children:"Safe"}),e.jsx("span",{children:"Explore"})]})]}),e.jsxs("div",{className:"preference-control",children:[e.jsx("label",{children:"Size Preference"}),e.jsx("div",{className:"size-buttons",children:["small","medium","large","any"].map(r=>e.jsxs("button",{className:`size-btn ${a.sizeBias===r?"active":""}`,onClick:()=>n("sizeBias",r),children:[e.jsx("div",{className:`size-preview size-${r}`}),r]},r))})]}),u&&e.jsx("div",{className:"preference-saving",children:e.jsx("span",{children:"💾 Saving preferences..."})}),e.jsx("style",{jsx:!0,children:`
        .live-preference-controls {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .preference-section h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .preference-subtitle {
          margin: 0 0 24px 0;
          color: var(--muted);
          font-size: 14px;
        }

        .preference-control {
          margin-bottom: 24px;
        }

        .preference-control label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .preference-value {
          font-size: 14px;
          color: var(--accent);
          font-weight: 600;
        }

        .preference-slider {
          width: 100%;
          height: 6px;
          background: var(--bg-alt);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }

        .preference-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--accent);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 12px;
          color: var(--muted);
        }

        .palette-buttons, .size-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .palette-btn, .size-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border: 2px solid var(--border);
          border-radius: 8px;
          background: var(--bg);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }

        .palette-btn.active, .size-btn.active {
          border-color: var(--accent);
          background: var(--accent-bg);
        }

        .palette-preview {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .palette-warm { background: linear-gradient(45deg, #ff6b6b, #ffa726); }
        .palette-cool { background: linear-gradient(45deg, #42a5f5, #66bb6a); }
        .palette-neutral { background: linear-gradient(45deg, #90a4ae, #a1887f); }
        .palette-vibrant { background: linear-gradient(45deg, #ff5722, #e91e63, #9c27b0); }
        .palette-muted { background: linear-gradient(45deg, #b0bec5, #90a4ae); }

        .size-preview {
          border: 2px solid var(--border);
          background: var(--bg-alt);
        }

        .size-small { width: 12px; height: 12px; }
        .size-medium { width: 16px; height: 16px; }
        .size-large { width: 20px; height: 20px; }
        .size-any { width: 16px; height: 12px; border-radius: 2px; }

        .preference-saving {
          text-align: center;
          padding: 12px;
          background: var(--accent-bg);
          border-radius: 8px;
          font-size: 14px;
          color: var(--accent);
        }
      `})]})};export{w as L,y as Z};
