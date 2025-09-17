import{d as _,r as i,j as e,b as Y,H as W}from"./index-Tyz_JBt9.js";import{S as A}from"./search-DqHloScL.js";import{X as q}from"./x-jv565ngo.js";import{c as T}from"./createLucideIcon-DhCu6Z8O.js";import{C as K}from"./camera-Ct-uCiTe.js";import{S as v}from"./sparkles-nUh7ue08.js";import{C as E,T as R}from"./target-r5vmWYoG.js";import{Z as V,L as J}from"./LivePreferenceControls-f8PDtSCu.js";import{C as G}from"./circle-alert-Csbyw32W.js";import{E as D}from"./eye-Ctq-Wxgo.js";import{H as I}from"./heart-BZ8u-Y3T.js";import{T as P}from"./trending-up-CBbI_h7w.js";import{C as Q}from"./Container-D0TcWsx1.js";import{S as X}from"./settings-ZIwiCntr.js";import{P as ee}from"./palette-DNFJJ_b-.js";/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re=[["path",{d:"M12 19v3",key:"npa21l"}],["path",{d:"M19 10v2a7 7 0 0 1-14 0v-2",key:"1vc78b"}],["rect",{x:"9",y:"2",width:"6",height:"13",rx:"3",key:"s6n7sd"}]],ae=T("mic",re);/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],se=T("refresh-cw",te),ie=({onSearch:c,onVoiceSearch:k,onVisualSearch:N,placeholder:m="Search with natural language: 'Show me calming blue abstracts under R5k'",className:z=""})=>{const{user:x}=_(),[g,d]=i.useState(""),[h,l]=i.useState(!1),[y,n]=i.useState([]),[S,C]=i.useState([]),[u,r]=i.useState([]),[f,w]=i.useState(!1),t=i.useRef(null),o=i.useRef(null);i.useEffect(()=>{if(typeof window<"u"&&"webkitSpeechRecognition"in window){const a=window.webkitSpeechRecognition;o.current=new a,o.current.continuous=!1,o.current.interimResults=!1,o.current.lang="en-ZA",o.current.onresult=s=>{const b=s.results[0][0].transcript;d(b),k?.(b),l(!1)},o.current.onerror=()=>{l(!1)},o.current.onend=()=>{l(!1)}}},[k]),i.useEffect(()=>{const a=localStorage.getItem("artflow-recent-searches");a&&r(JSON.parse(a))},[]);const L=a=>{const s=[],b=a.toLowerCase();["blue","red","green","yellow","purple","orange","pink","black","white","gray","brown"].forEach(p=>{b.includes(p)&&s.push({type:"color",value:p,confidence:.9})}),["oil","acrylic","watercolor","photography","sculpture","digital","mixed media","charcoal","pastel"].forEach(p=>{b.includes(p)&&s.push({type:"medium",value:p,confidence:.85})}),["abstract","figurative","landscape","portrait","still life","contemporary","modern","impressionist"].forEach(p=>{b.includes(p)&&s.push({type:"style",value:p,confidence:.8})});const $=a.match(/R(\d+(?:,\d{3})*(?:\.\d{2})?)/g);$&&$.forEach(p=>{const j=p.replace("R","").replace(/,/g,"");s.push({type:"price",value:j,confidence:.95})});const U=a.match(/(?:under|below|less than)\s*R?(\d+(?:,\d{3})*(?:k)?)/gi);return U&&U.forEach(p=>{let j=p.replace(/(?:under|below|less than)\s*R?/gi,"");j.includes("k")&&(j=(parseInt(j.replace("k",""))*1e3).toString()),s.push({type:"price",value:`<${j}`,confidence:.9})}),s},M=()=>{if(!g.trim())return;const a=L(g);n(a),c(g,a);const s=[g,...u.filter(b=>b!==g)].slice(0,10);r(s),localStorage.setItem("artflow-recent-searches",JSON.stringify(s))},Z=()=>{o.current&&(h?(o.current.stop(),l(!1)):(o.current.start(),l(!0)))},F=a=>{const s=a.target.files?.[0];s&&N&&N(s)},O=a=>{a.key==="Enter"&&M()},B=()=>{d(""),n([])},H=a=>{d(a),w(!1);const s=L(a);n(s),c(a,s)};return e.jsxs("div",{className:`advanced-search-interface ${z}`,children:[e.jsxs("div",{className:`search-container ${f?"expanded":""}`,children:[e.jsxs("div",{className:"search-input-wrapper",children:[e.jsx(A,{size:20,className:"search-icon"}),e.jsx("input",{type:"text",value:g,onChange:a=>d(a.target.value),onKeyPress:O,onFocus:()=>w(!0),placeholder:m,className:"search-input"}),g&&e.jsx("button",{onClick:B,className:"clear-button",children:e.jsx(q,{size:16})}),e.jsxs("div",{className:"search-actions",children:[o.current&&e.jsx("button",{onClick:Z,className:`action-button ${h?"listening":""}`,title:"Voice search",children:e.jsx(ae,{size:16})}),e.jsx("input",{type:"file",accept:"image/*",onChange:F,ref:t,style:{display:"none"}}),e.jsx("button",{onClick:()=>t.current?.click(),className:"action-button",title:"Visual search",children:e.jsx(K,{size:16})}),e.jsx("button",{onClick:M,className:"search-button",children:e.jsx(v,{size:16})})]})]}),y.length>0&&e.jsxs("div",{className:"extracted-entities",children:[e.jsx("span",{className:"entities-label",children:"Detected:"}),y.map((a,s)=>e.jsxs("span",{className:`entity-tag ${a.type}`,children:[a.type,": ",a.value,e.jsxs("span",{className:"confidence",children:[Math.round(a.confidence*100),"%"]})]},s))]}),f&&u.length>0&&e.jsxs("div",{className:"recent-searches",children:[e.jsxs("div",{className:"recent-header",children:[e.jsx(E,{size:14}),e.jsx("span",{children:"Recent searches"})]}),e.jsx("div",{className:"recent-list",children:u.map((a,s)=>e.jsx("button",{onClick:()=>H(a),className:"recent-item",children:a},s))})]})]}),f&&e.jsxs("div",{className:"search-tips",children:[e.jsx("h4",{children:"Natural Language Examples:"}),e.jsxs("div",{className:"tips-list",children:[e.jsx("span",{children:'"Show me calming blue abstracts under R5k"'}),e.jsx("span",{children:'"Large oil paintings by contemporary artists"'}),e.jsx("span",{children:'"Landscape photography in warm tones"'}),e.jsx("span",{children:'"Small sculptures for my living room"'})]})]}),e.jsx("style",{jsx:!0,children:`
        .advanced-search-interface {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .search-container {
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .search-container.expanded {
          border-color: var(--accent);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          gap: 12px;
        }

        .search-icon {
          color: var(--muted);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 16px;
          color: var(--fg);
          placeholder-color: var(--muted);
        }

        .clear-button {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .clear-button:hover {
          background: var(--bg-alt);
          color: var(--fg);
        }

        .search-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-button {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background: var(--accent-bg);
          color: var(--accent);
          border-color: var(--accent);
        }

        .action-button.listening {
          background: var(--accent);
          color: white;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .search-button {
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .search-button:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .extracted-entities {
          padding: 0 20px 16px 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .entities-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }

        .entity-tag {
          background: var(--accent-bg);
          color: var(--accent);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .entity-tag.color {
          background: #fef3c7;
          color: #d97706;
        }

        .entity-tag.medium {
          background: #ddd6fe;
          color: #7c3aed;
        }

        .entity-tag.style {
          background: #fce7f3;
          color: #be185d;
        }

        .entity-tag.price {
          background: #dcfce7;
          color: #16a34a;
        }

        .confidence {
          font-size: 10px;
          opacity: 0.8;
        }

        .recent-searches {
          border-top: 1px solid var(--border);
          padding: 16px 20px;
        }

        .recent-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .recent-item {
          background: none;
          border: none;
          text-align: left;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: var(--fg);
          transition: all 0.2s;
          font-size: 14px;
        }

        .recent-item:hover {
          background: var(--bg-alt);
        }

        .search-tips {
          margin-top: 16px;
          padding: 16px;
          background: var(--bg-alt);
          border-radius: 12px;
        }

        .search-tips h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--fg);
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tips-list span {
          font-size: 13px;
          color: var(--muted);
          padding: 4px 8px;
          background: var(--card);
          border-radius: 6px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .search-input-wrapper {
            padding: 12px 16px;
          }

          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .search-actions {
            gap: 4px;
          }

          .action-button {
            padding: 6px;
          }
        }
      `})]})},ne=({onArtworkClick:c,onLike:k,onSave:N,className:m=""})=>{const{user:z}=_(),[x,g]=i.useState([]),[d,h]=i.useState(!0),[l,y]=i.useState("all");i.useEffect(()=>{g([{id:"1",type:"price_drop",artwork:{id:"art-1",title:"Ocean Waves",artist:{id:"artist-1",name:"Sarah Johnson",slug:"sarah-johnson"},primaryImageUrl:"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",price:3500,currency:"ZAR",dimensions:{width:60,height:80},medium:"Oil on Canvas",year:2023},urgency:"high",reason:"Price dropped 25% from your saved artwork",metadata:{originalPrice:4700,discountPercentage:25}},{id:"2",type:"new_discovery",artwork:{id:"art-2",title:"Urban Reflections",artist:{id:"artist-2",name:"Michael Chen",slug:"michael-chen"},primaryImageUrl:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",price:2800,currency:"ZAR",dimensions:{width:50,height:70},medium:"Acrylic",year:2024},urgency:"medium",reason:"New work from an artist you follow",metadata:{viewCount:45,likeCount:12}},{id:"3",type:"rare_find",artwork:{id:"art-3",title:"Desert Bloom Limited Edition",artist:{id:"artist-3",name:"Elena Rodriguez",slug:"elena-rodriguez"},primaryImageUrl:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",price:5200,currency:"ZAR",dimensions:{width:40,height:60},medium:"Photography",year:2023},urgency:"high",reason:"Only 3 of 10 limited editions remaining",metadata:{rarityScore:95}},{id:"4",type:"trending",artwork:{id:"art-4",title:"Cosmic Dance",artist:{id:"artist-4",name:"David Park",slug:"david-park"},primaryImageUrl:"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",price:4100,currency:"ZAR",dimensions:{width:70,height:90},medium:"Mixed Media",year:2024},urgency:"medium",reason:"Gaining attention - 200% increase in views",metadata:{viewCount:320,likeCount:67}},{id:"5",type:"expiring",artwork:{id:"art-5",title:"Sunset Valley",artist:{id:"artist-5",name:"Anna Thompson",slug:"anna-thompson"},primaryImageUrl:"https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",price:3200,currency:"ZAR",dimensions:{width:55,height:75},medium:"Watercolor",year:2023},urgency:"high",reason:"Consignment ends in 2 days",metadata:{timeLeft:"2 days"}},{id:"6",type:"color_harmony",artwork:{id:"art-6",title:"Harmony in Blue",artist:{id:"artist-6",name:"Lisa Wang",slug:"lisa-wang"},primaryImageUrl:"https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400",price:2900,currency:"ZAR",dimensions:{width:45,height:65},medium:"Oil",year:2024},urgency:"low",reason:"Perfect color match for your recent saves",metadata:{viewCount:89,likeCount:23}}]),h(!1)},[]);const n=r=>{switch(r){case"price_drop":return e.jsx(P,{size:16});case"new_discovery":return e.jsx(v,{size:16});case"rare_find":return e.jsx(R,{size:16});case"trending":return e.jsx(D,{size:16});case"expiring":return e.jsx(E,{size:16});case"color_harmony":return e.jsx(I,{size:16});default:return e.jsx(V,{size:16})}},S=r=>{switch(r){case"price_drop":return"Price Drop";case"new_discovery":return"New Discovery";case"rare_find":return"Rare Find";case"trending":return"Trending";case"expiring":return"Expiring Soon";case"color_harmony":return"Color Match";default:return"Discovery"}},C=r=>{switch(r){case"high":return"#ef4444";case"medium":return"#f59e0b";case"low":return"#10b981";default:return"#6b7280"}},u=l==="all"?x:x.filter(r=>r.type===l);return u.map(r=>({id:r.artwork.id,title:r.artwork.title,artist:r.artwork.artist,primaryImageUrl:r.artwork.primaryImageUrl,price:r.artwork.price,currency:r.artwork.currency,dimensions:r.artwork.dimensions,medium:r.artwork.medium,year:r.artwork.year,viewCount:r.metadata?.viewCount,likeCount:r.metadata?.likeCount})),d?e.jsxs("div",{className:"serendipity-loading",children:[e.jsx(v,{size:32,className:"loading-icon"}),e.jsx("p",{children:"Discovering serendipitous finds..."})]}):e.jsxs("div",{className:`serendipity-engine ${m}`,children:[e.jsxs("div",{className:"serendipity-header",children:[e.jsxs("div",{className:"header-title",children:[e.jsx(v,{size:24}),e.jsx("h2",{children:"Serendipitous Discoveries"})]}),e.jsx("p",{className:"header-subtitle",children:"AI-curated opportunities and time-sensitive finds just for you"})]}),e.jsxs("div",{className:"filter-tabs",children:[e.jsxs("button",{className:`filter-tab ${l==="all"?"active":""}`,onClick:()=>y("all"),children:["All Discoveries (",x.length,")"]}),["price_drop","new_discovery","rare_find","trending","expiring","color_harmony"].map(r=>{const f=x.filter(w=>w.type===r).length;return f===0?null:e.jsxs("button",{className:`filter-tab ${l===r?"active":""}`,onClick:()=>y(r),children:[n(r),S(r)," (",f,")"]},r)})]}),e.jsx("div",{className:"serendipity-cards",children:u.map(r=>e.jsxs("div",{className:"serendipity-card",children:[e.jsx("div",{className:"urgency-indicator",style:{backgroundColor:C(r.urgency)}}),e.jsxs("div",{className:`type-badge ${r.type}`,children:[n(r.type),e.jsx("span",{children:S(r.type)})]}),e.jsxs("div",{className:"artwork-preview",onClick:()=>c?.(r.artwork),children:[e.jsx("img",{src:r.artwork.primaryImageUrl,alt:r.artwork.title,className:"artwork-image"}),e.jsxs("div",{className:"price-badge",children:[new Intl.NumberFormat("en-ZA",{style:"currency",currency:r.artwork.currency}).format(r.artwork.price),r.metadata?.originalPrice&&e.jsx("span",{className:"original-price",children:new Intl.NumberFormat("en-ZA",{style:"currency",currency:r.artwork.currency}).format(r.metadata.originalPrice)})]}),r.metadata?.discountPercentage&&e.jsxs("div",{className:"discount-badge",children:["-",r.metadata.discountPercentage,"%"]})]}),e.jsxs("div",{className:"artwork-info",children:[e.jsx("h3",{className:"artwork-title",children:r.artwork.title}),e.jsx("p",{className:"artwork-artist",children:r.artwork.artist.name}),e.jsxs("p",{className:"artwork-details",children:[r.artwork.medium," • ",r.artwork.year," • ",r.artwork.dimensions.width," × ",r.artwork.dimensions.height," cm"]})]}),e.jsxs("div",{className:"serendipity-reason",children:[e.jsx(G,{size:14}),e.jsx("span",{children:r.reason})]}),r.metadata&&e.jsxs("div",{className:"item-metadata",children:[r.metadata.timeLeft&&e.jsxs("span",{className:"metadata-item urgent",children:[e.jsx(E,{size:12}),r.metadata.timeLeft," left"]}),r.metadata.viewCount&&e.jsxs("span",{className:"metadata-item",children:[e.jsx(D,{size:12}),r.metadata.viewCount," views"]}),r.metadata.likeCount&&e.jsxs("span",{className:"metadata-item",children:[e.jsx(I,{size:12}),r.metadata.likeCount," likes"]}),r.metadata.rarityScore&&e.jsxs("span",{className:"metadata-item",children:[e.jsx(R,{size:12}),r.metadata.rarityScore,"% rare"]})]}),e.jsxs("div",{className:"card-actions",children:[e.jsxs("button",{onClick:()=>k?.(r.artwork.id),className:"action-btn like-btn",children:[e.jsx(I,{size:16}),"Like"]}),e.jsxs("button",{onClick:()=>N?.(r.artwork.id),className:"action-btn save-btn",children:[e.jsx(R,{size:16}),"Save"]})]})]},r.id))}),u.length===0&&e.jsxs("div",{className:"no-discoveries",children:[e.jsx(v,{size:48}),e.jsx("h3",{children:"No discoveries yet"}),e.jsx("p",{children:"Keep browsing and saving artworks to help our AI find serendipitous matches for you!"})]}),e.jsx("style",{jsx:!0,children:`
        .serendipity-engine {
          width: 100%;
        }

        .serendipity-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-icon {
          animation: spin 2s linear infinite;
          color: var(--accent);
          margin-bottom: 16px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .serendipity-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent), #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          color: var(--muted);
          margin: 0;
          font-size: 16px;
        }

        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .filter-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: var(--card);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
        }

        .filter-tab:hover {
          border-color: var(--accent);
          background: var(--accent-bg);
        }

        .filter-tab.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .serendipity-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .serendipity-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .serendipity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: var(--accent);
        }

        .urgency-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          z-index: 2;
        }

        .type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          z-index: 2;
          backdrop-filter: blur(8px);
        }

        .type-badge.price_drop {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .type-badge.new_discovery {
          background: rgba(168, 85, 247, 0.9);
          color: white;
        }

        .type-badge.rare_find {
          background: rgba(245, 158, 11, 0.9);
          color: white;
        }

        .type-badge.trending {
          background: rgba(59, 130, 246, 0.9);
          color: white;
        }

        .type-badge.expiring {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .type-badge.color_harmony {
          background: rgba(236, 72, 153, 0.9);
          color: white;
        }

        .artwork-preview {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          cursor: pointer;
        }

        .artwork-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .serendipity-card:hover .artwork-image {
          transform: scale(1.05);
        }

        .price-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .original-price {
          font-size: 10px;
          text-decoration: line-through;
          opacity: 0.7;
          margin-top: 2px;
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .artwork-info {
          padding: 16px;
        }

        .artwork-title {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.3;
        }

        .artwork-artist {
          margin: 0 0 8px 0;
          color: var(--muted);
          font-size: 14px;
        }

        .artwork-details {
          margin: 0;
          font-size: 12px;
          color: var(--muted);
        }

        .serendipity-reason {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--accent-bg);
          color: var(--accent);
          font-size: 13px;
          font-weight: 500;
        }

        .item-metadata {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--muted);
        }

        .metadata-item.urgent {
          color: #ef4444;
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid var(--border);
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid var(--border);
          background: var(--bg-alt);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 500;
        }

        .action-btn:hover {
          border-color: var(--accent);
          background: var(--accent-bg);
          color: var(--accent);
        }

        .no-discoveries {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .no-discoveries h3 {
          margin: 16px 0 8px 0;
          color: var(--fg);
        }

        @media (max-width: 768px) {
          .serendipity-cards {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }
        }
      `})]})},ze=()=>{const{user:c,profile:k}=_();Y().pathname.includes("/discover");const[m,z]=i.useState([]),[x,g]=i.useState(),[d,h]=i.useState("discover"),[l,y]=i.useState(!1),[n,S]=i.useState(null);i.useEffect(()=>{c&&C()},[c]);const C=async()=>{try{const o=await(await fetch(`/api/bandit/analytics?userId=${c?.id}`)).json();S(o)}catch(t){console.error("Error loading bandit analytics:",t)}},u=t=>{z(t),h("discover")},r=t=>{g(t),m.length>0&&f()},f=async()=>{if(!(!x||!c))try{const o=await(await fetch("/api/collections/dynamic?"+new URLSearchParams({paletteBias:x.paletteBias,style:x.abstractionLevel>.7?"abstract":"figurative",maxPrice:(x.priceSensitivity*5e4).toString(),userId:c.id}))).json();z(o.collections||[])}catch(t){console.error("Error refreshing recommendations:",t)}},w=t=>{console.log("Serendipity item clicked:",t)};return e.jsxs(Q,{children:[e.jsxs(W,{children:[e.jsx("title",{children:"Intelligent Explore - ArtFlow"}),e.jsx("meta",{name:"description",content:"Discover artworks with AI-powered search, personalized recommendations, and serendipitous discoveries"})]}),e.jsxs("div",{className:"intelligent-explore-page",children:[e.jsxs("div",{className:"page-header",children:[e.jsxs("div",{className:"header-content",children:[e.jsxs("h1",{children:[e.jsx(v,{size:28}),"Intelligent Explore"]}),e.jsx("p",{children:"AI-powered discovery with personalized recommendations and serendipitous finds"})]}),c&&n&&e.jsxs("div",{className:"intelligence-stats",children:[e.jsxs("div",{className:"stat",children:[e.jsx("span",{className:"stat-label",children:"Discovery Rate"}),e.jsxs("span",{className:"stat-value",children:[Math.round(n.explorationRate*100),"%"]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("span",{className:"stat-label",children:"Accuracy"}),e.jsxs("span",{className:"stat-value",children:[Math.round(n.recommendationAccuracy*100),"%"]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("span",{className:"stat-label",children:"Total Interactions"}),e.jsx("span",{className:"stat-value",children:n.totalInteractions})]})]})]}),e.jsx("div",{className:"search-section",children:e.jsx(ie,{onResults:u,placeholder:"Try: 'Show me calming blue abstracts under $5k for my living room'",showPreferences:!0,showVisualSearch:!0})}),e.jsxs("div",{className:"explore-tabs",children:[e.jsxs("button",{className:`tab ${d==="discover"?"active":""}`,onClick:()=>h("discover"),children:[e.jsx(A,{size:16}),"Discover",m.length>0&&e.jsx("span",{className:"result-count",children:m.length})]}),e.jsxs("button",{className:`tab ${d==="serendipity"?"active":""}`,onClick:()=>h("serendipity"),children:[e.jsx(v,{size:16}),"Serendipity"]}),e.jsxs("button",{className:`tab ${d==="personalized"?"active":""}`,onClick:()=>h("personalized"),children:[e.jsx(P,{size:16}),"For You"]}),e.jsxs("button",{className:`settings-tab ${l?"active":""}`,onClick:()=>y(!l),children:[e.jsx(X,{size:16}),"AI Controls"]})]}),l&&e.jsxs("div",{className:"advanced-controls",children:[e.jsx(J,{onPreferencesChange:r,initialPreferences:x}),c&&e.jsxs("div",{className:"bandit-controls",children:[e.jsx("h4",{children:"🎯 Exploration vs Exploitation"}),e.jsx("p",{children:"Control how much the AI explores new options vs sticks to your known preferences"}),e.jsx("div",{className:"bandit-stats",children:e.jsxs("div",{className:"stat-card",children:[e.jsx("h5",{children:"Current Strategy"}),e.jsxs("div",{className:"strategy-visual",children:[e.jsx("div",{className:"exploit-bar",style:{width:`${(1-(n?.explorationRate||.2))*100}%`}}),e.jsx("div",{className:"explore-bar",style:{width:`${(n?.explorationRate||.2)*100}%`}})]}),e.jsxs("div",{className:"strategy-labels",children:[e.jsxs("span",{children:["Exploit (",Math.round((1-(n?.explorationRate||.2))*100),"%)"]}),e.jsxs("span",{children:["Explore (",Math.round((n?.explorationRate||.2)*100),"%)"]})]})]})})]})]}),e.jsxs("div",{className:"explore-content",children:[d==="discover"&&e.jsx("div",{className:"discover-section",children:m.length>0?e.jsxs("div",{className:"search-results",children:[e.jsxs("div",{className:"results-header",children:[e.jsx("h3",{children:"Search Results"}),e.jsxs("button",{onClick:f,className:"refresh-btn",children:[e.jsx(se,{size:16}),"Refresh with AI"]})]}),e.jsx("div",{className:"results-grid",children:m.map((t,o)=>e.jsxs("div",{className:"result-card",children:[e.jsxs("div",{className:"result-image",children:[e.jsx("img",{src:t.imageUrl||t.primary_image_url,alt:t.title}),t.explorationReason==="explore"&&e.jsxs("div",{className:"exploration-badge",children:[e.jsx(v,{size:12}),"Discovery"]})]}),e.jsxs("div",{className:"result-content",children:[e.jsx("h4",{children:t.title}),e.jsx("p",{className:"result-artist",children:t.artist?.full_name||t.subtitle}),e.jsx("p",{className:"result-reason",children:t.enhancedReason||t.reason}),t.metadata?.price&&e.jsx("div",{className:"result-price",children:new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(t.metadata.price)})]})]},t.id))})]}):e.jsxs("div",{className:"discover-empty",children:[e.jsx(A,{size:48,color:"var(--muted)"}),e.jsx("h3",{children:"Intelligent Search Ready"}),e.jsx("p",{children:"Use natural language to find exactly what you're looking for"}),e.jsxs("div",{className:"example-searches",children:[e.jsx("h4",{children:"Try these examples:"}),e.jsxs("ul",{children:[e.jsx("li",{children:'"Calming blue abstracts under $5k"'}),e.jsx("li",{children:'"Warm minimal works for modern living room"'}),e.jsx("li",{children:'"Something like Rothko but affordable"'}),e.jsx("li",{children:'"Vibrant photography under $2k"'})]})]})]})}),d==="serendipity"&&e.jsx("div",{className:"serendipity-section",children:e.jsx(ne,{userId:c?.id,limit:12,onItemClick:w,showReasons:!0})}),d==="personalized"&&e.jsxs("div",{className:"personalized-section",children:[e.jsxs("div",{className:"personalized-header",children:[e.jsxs("h3",{children:[e.jsx(P,{size:20}),"Personalized For You"]}),e.jsx("p",{children:"AI-curated recommendations based on your unique taste profile"})]}),c?e.jsxs("div",{className:"coming-soon",children:[e.jsx(ee,{size:48,color:"var(--muted)"}),e.jsx("h4",{children:"Advanced Personalization Coming Soon"}),e.jsx("p",{children:"We're building your taste profile. Keep interacting with artworks to improve recommendations!"}),n&&e.jsxs("div",{className:"taste-building",children:[e.jsx("h5",{children:"Your AI Learning Progress:"}),e.jsxs("div",{className:"progress-stats",children:[e.jsxs("div",{className:"progress-item",children:[e.jsx("span",{children:"Interactions Recorded"}),e.jsx("strong",{children:n.totalInteractions})]}),e.jsxs("div",{className:"progress-item",children:[e.jsx("span",{children:"Recommendation Accuracy"}),e.jsxs("strong",{children:[Math.round(n.recommendationAccuracy*100),"%"]})]}),e.jsxs("div",{className:"progress-item",children:[e.jsx("span",{children:"Discovery Rate"}),e.jsxs("strong",{children:[Math.round(n.explorationRate*100),"%"]})]})]})]})]}):e.jsxs("div",{className:"login-prompt",children:[e.jsx("h4",{children:"Sign in for Personalized Recommendations"}),e.jsx("p",{children:"Get AI-powered suggestions tailored to your unique taste"})]})]})]}),e.jsx("style",{jsx:!0,children:`
          .intelligent-explore-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
          }

          .header-content h1 {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
          }

          .header-content p {
            margin: 0;
            color: var(--muted);
            font-size: 16px;
          }

          .intelligence-stats {
            display: flex;
            gap: 24px;
          }

          .stat {
            text-align: center;
          }

          .stat-label {
            display: block;
            font-size: 12px;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: var(--accent);
          }

          .search-section {
            margin-bottom: 32px;
          }

          .explore-tabs {
            display: flex;
            gap: 4px;
            background: var(--bg-alt);
            border-radius: 12px;
            padding: 4px;
            margin-bottom: 24px;
          }

          .tab, .settings-tab {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background: none;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            color: var(--muted);
            position: relative;
          }

          .tab.active, .settings-tab.active {
            background: var(--card);
            color: var(--fg);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .result-count {
            background: var(--accent);
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 600;
          }

          .settings-tab {
            margin-left: auto;
          }

          .advanced-controls {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .bandit-controls h4 {
            margin: 24px 0 8px 0;
            font-size: 16px;
          }

          .bandit-controls p {
            margin: 0 0 16px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .bandit-stats {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .stat-card {
            background: var(--bg-alt);
            border-radius: 8px;
            padding: 16px;
          }

          .stat-card h5 {
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
          }

          .strategy-visual {
            display: flex;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .exploit-bar {
            background: var(--accent);
          }

          .explore-bar {
            background: #f59e0b;
          }

          .strategy-labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--muted);
          }

          .explore-content {
            min-height: 400px;
          }

          .discover-empty, .coming-soon, .login-prompt {
            text-align: center;
            padding: 48px 24px;
            background: var(--card);
            border-radius: 12px;
            border: 1px solid var(--border);
          }

          .discover-empty h3, .coming-soon h4, .login-prompt h4 {
            margin: 16px 0 8px 0;
            color: var(--fg);
          }

          .discover-empty p, .coming-soon p, .login-prompt p {
            margin: 0 0 24px 0;
            color: var(--muted);
          }

          .example-searches {
            text-align: left;
            max-width: 400px;
            margin: 0 auto;
          }

          .example-searches h4 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: var(--fg);
          }

          .example-searches ul {
            margin: 0;
            padding-left: 20px;
          }

          .example-searches li {
            margin-bottom: 8px;
            color: var(--muted);
            font-style: italic;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .results-header h3 {
            margin: 0;
            font-size: 20px;
          }

          .refresh-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }

          .refresh-btn:hover {
            background: var(--accent-hover);
          }

          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 24px;
          }

          .result-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
            cursor: pointer;
          }

          .result-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            border-color: var(--accent);
          }

          .result-image {
            position: relative;
            aspect-ratio: 4/3;
            overflow: hidden;
          }

          .result-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .exploration-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #f59e0b;
            color: white;
            border-radius: 16px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .result-content {
            padding: 16px;
          }

          .result-content h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .result-artist {
            margin: 0 0 8px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .result-reason {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: var(--accent);
            background: var(--accent-bg);
            padding: 6px 10px;
            border-radius: 6px;
          }

          .result-price {
            font-weight: 600;
            color: var(--fg);
          }

          .taste-building {
            background: var(--bg-alt);
            border-radius: 8px;
            padding: 20px;
            margin-top: 24px;
          }

          .taste-building h5 {
            margin: 0 0 16px 0;
            font-size: 16px;
          }

          .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }

          .progress-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .progress-item span {
            font-size: 12px;
            color: var(--muted);
            margin-bottom: 4px;
          }

          .progress-item strong {
            font-size: 18px;
            color: var(--accent);
          }

          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              gap: 16px;
            }

            .intelligence-stats {
              align-self: stretch;
            }

            .results-grid {
              grid-template-columns: 1fr;
            }
          }
        `})]})]})};export{ze as default};
