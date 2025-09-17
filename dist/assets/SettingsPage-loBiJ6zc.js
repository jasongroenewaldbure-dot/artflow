import{j as e,d as ma,i as ua,r as s,H as fa,s as h}from"./index-Tyz_JBt9.js";import{u as xa}from"./useQuery-_wka9r7T.js";import{u as Se}from"./useMutation-rXl8-n-0.js";import{C as Ce}from"./Container-D0TcWsx1.js";import{L as ha,Z as ga}from"./LivePreferenceControls-f8PDtSCu.js";import"./logger-CnymG8OQ.js";import{c as Le}from"./createLucideIcon-DhCu6Z8O.js";import{U as W}from"./user-B7duxeUb.js";import{T as Ae,C as Pe}from"./target-r5vmWYoG.js";import{S as ze}from"./sparkles-nUh7ue08.js";import{D as H}from"./download-DogKkANh.js";import{B as Ie}from"./bell-DU0zGtQB.js";import{P as Me}from"./palette-DNFJJ_b-.js";import{C as va}from"./camera-Ct-uCiTe.js";import{L as ba}from"./lock-BkYk8nJ6.js";import{T as De}from"./trash-2-D5A2OpTS.js";import{T as Ee}from"./trending-up-CBbI_h7w.js";import{E as ja}from"./eye-Ctq-Wxgo.js";import{C as ya}from"./chart-column-BKOPnvez.js";import{M as Na}from"./mail-D9DYH64a.js";import{F as Te}from"./file-text-DVS8IP3-.js";/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _a=[["path",{d:"M12 18V5",key:"adv99a"}],["path",{d:"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",key:"1e3is1"}],["path",{d:"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",key:"1gqd8o"}],["path",{d:"M17.997 5.125a4 4 0 0 1 2.526 5.77",key:"iwvgf7"}],["path",{d:"M18 18a4 4 0 0 0 2-7.464",key:"efp6ie"}],["path",{d:"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",key:"1gq6am"}],["path",{d:"M6 18a4 4 0 0 1-2-7.464",key:"k1g0md"}],["path",{d:"M6.003 5.125a4 4 0 0 0-2.526 5.77",key:"q97ue3"}]],T=Le("brain",_a);/**
 * @license lucide-react v0.543.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wa=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],L=Le("shield",wa),N=({checked:i,onChange:n,disabled:_=!1,size:S="md",className:g=""})=>{const d={sm:{width:36,height:20,thumbSize:16},md:{width:44,height:24,thumbSize:20},lg:{width:52,height:28,thumbSize:24}},{width:w,height:p,thumbSize:v}=d[S];return e.jsxs("label",{className:`toggle-container ${g}`,children:[e.jsx("input",{type:"checkbox",checked:i,onChange:C=>n(C.target.checked),disabled:_,className:"toggle-input"}),e.jsx("div",{className:`toggle-track ${i?"checked":""} ${_?"disabled":""}`,style:{width:w,height:p},children:e.jsx("div",{className:"toggle-thumb",style:{width:v-4,height:v-4,transform:i?`translateX(${w-v}px)`:"translateX(2px)"}})}),e.jsx("style",{jsx:!0,children:`
        .toggle-container {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          position: relative;
        }

        .toggle-input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-track {
          position: relative;
          border-radius: 9999px;
          background: var(--bg-alt);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .toggle-track.checked {
          background: var(--accent);
          border-color: var(--accent);
        }

        .toggle-track.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-thumb {
          position: absolute;
          top: 2px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .toggle-container:hover .toggle-track:not(.disabled) {
          border-color: var(--accent);
        }

        .toggle-container:hover .toggle-track.checked:not(.disabled) {
          background: var(--accent-hover);
        }

        .toggle-input:focus + .toggle-track {
          box-shadow: 0 0 0 3px var(--accent-bg);
        }
      `})]})},K=({isOpen:i,onClose:n,onConfirm:_,title:S,message:g,confirmText:d,cancelText:w="Cancel",isDestructive:p=!1})=>i?e.jsx("div",{className:"modal-backdrop",onClick:n,children:e.jsxs("div",{className:"modal-content",onClick:v=>v.stopPropagation(),style:{maxWidth:"500px"},children:[e.jsxs("h3",{style:{color:p?"#ef4444":"var(--fg)",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"8px"},children:[p&&e.jsx(L,{size:20}),S]}),e.jsx("p",{style:{marginBottom:"1.5rem",lineHeight:"1.5"},children:g}),e.jsxs("div",{style:{display:"flex",justifyContent:"flex-end",gap:"1rem"},children:[e.jsx("button",{className:"button button-secondary",onClick:n,children:w}),e.jsx("button",{className:`button ${p?"button-danger":"button-primary"}`,onClick:_,children:d})]})]})}):null,Qa=()=>{const{user:i,profile:n,signOut:_,updateProfile:S}=ma(),g=ua(),[d,w]=s.useState("account"),[p,v]=s.useState(n?.full_name||""),[C,Be]=s.useState(n?.display_name||""),[B,Re]=s.useState(n?.location||""),[R,Ue]=s.useState(n?.bio||""),[A,$e]=s.useState(""),[Q,Fe]=s.useState(""),[U,Oe]=s.useState(i?.email||""),[ka,Sa]=s.useState(null),M=s.useRef(null),[$,Z]=s.useState(!1),[G,V]=s.useState(),[X,J]=s.useState(""),[ee,ae]=s.useState(""),[P,se]=s.useState(!1),[F,te]=s.useState(""),[O,re]=s.useState(""),[qe,Ye]=s.useState(""),[We,He]=s.useState(""),[Ke,Qe]=s.useState(""),[ie,ne]=s.useState(""),[oe,le]=s.useState(""),[Ze,Ge]=s.useState(""),[ce,de]=s.useState({artwork:!0,artist:!0,catalogue:!0}),[Ve,Xe]=s.useState({artwork:!1,artist:!1,catalogue:!1}),[Je,ea]=s.useState({artwork:!1,artist:!1,catalogue:!1}),[pe,me]=s.useState(!0),[ue,fe]=s.useState(!0),[xe,he]=s.useState(!0),[ge,ve]=s.useState(!1),[be,je]=s.useState(!0),[ye,Ne]=s.useState("08:00"),[aa,_e]=s.useState(!1),[sa,q]=s.useState(!1),[ta,Y]=s.useState(!1),{data:t,isLoading:ra}=xa({queryKey:["userPreferences",i?.id],queryFn:async()=>{if(!i)return null;const{data:a,error:r}=await h.from("user_preferences").select("*").eq("user_id",i.id).single();if(r&&r.code==="PGRST116"){const{data:l,error:c}=await h.from("user_preferences").insert({user_id:i.id,preferred_mediums:[],preferred_styles:[],notification_real_time:{artwork:!0,artist:!0,catalogue:!0},notification_daily:{artwork:!1,artist:!1,catalogue:!1},notification_weekly:{artwork:!1,artist:!1,catalogue:!1},notify_by_email:!0,notify_price_drops:!0,notify_new_works:!0,notify_collection_insights:!0,preferred_digest_time:"08:00"}).select("*").single();if(c)throw c;return l}if(r)throw r;return a},enabled:!!i});s.useEffect(()=>{t&&(J((t.preferred_mediums||[]).join(", ")),ae((t.preferred_styles||[]).join(", ")),te(t.min_budget?.toString()||""),re(t.max_budget?.toString()||""),se(t.use_learned_budget??!1),V(t.live_preferences||void 0),de(t.notification_real_time||{artwork:!0,artist:!0,catalogue:!0}),Xe(t.notification_daily||{artwork:!1,artist:!1,catalogue:!1}),ea(t.notification_weekly||{artwork:!1,artist:!1,catalogue:!1}),me(t.notify_by_email??!0),fe(t.notify_price_drops??!0),he(t.notify_new_works??!0),ve(t.notify_auction_reminders??!1),je(t.notify_collection_insights??!0),Ne(t.preferred_digest_time||"08:00"),Ye((t.alert_specific_artists||[]).join(", ")),He((t.alert_specific_mediums||[]).join(", ")),Qe((t.alert_specific_styles||[]).join(", ")),ne((t.exclude_mediums||[]).join(", ")),le((t.exclude_styles||[]).join(", ")),Ge((t.exclude_artists||[]).join(", ")))},[t]);const u=Se({mutationFn:async a=>{if(!i)throw new Error("User not found");const{data:r,error:l}=await h.from("user_preferences").upsert({user_id:i.id,...a,updated_at:new Date().toISOString()},{onConflict:"user_id"}).select().single();if(l)throw l;return r},onSuccess:()=>{alert("Settings saved successfully!"),g.invalidateQueries({queryKey:["userPreferences",i?.id]})},onError:a=>{alert(`Error saving settings: ${a.message}`)}}),D=Se({mutationFn:async a=>{if(!i)throw new Error("User not found");const{full_name:r,display_name:l,location:c,bio:x,avatar_url:j,email:m,password:y}=a;if(m||y){const k={};if(m&&m!==i.email&&(k.email=m),y&&(k.password=y),Object.keys(k).length>0){const{error:I}=await h.auth.updateUser(k);if(I)throw I}}const o={updated_at:new Date().toISOString()};if(r!==void 0&&r!==n?.full_name&&(o.full_name=r),l!==void 0&&l!==n?.display_name&&(o.display_name=l),c!==void 0&&c!==n?.location&&(o.location=c),x!==void 0&&x!==n?.bio&&(o.bio=x),j!==void 0&&(o.avatar_url=j),Object.keys(o).length>1){const{data:k,error:I}=await h.from("profiles").update(o).eq("id",i.id).select().single();if(I)throw I;return await S(o),k}return null},onSuccess:()=>{alert("Profile updated successfully!"),g.invalidateQueries({queryKey:["user"]}),g.invalidateQueries({queryKey:["profile"]})},onError:a=>{alert(`Error updating profile: ${a.message}`)}}),ia=async()=>{if(A&&A!==Q){alert("New password and confirmation do not match.");return}const a={};p!==n?.full_name&&(a.full_name=p),C!==n?.display_name&&(a.display_name=C),B!==n?.location&&(a.location=B),R!==n?.bio&&(a.bio=R),U!==i?.email&&(a.email=U),A&&(a.password=A),Object.keys(a).length>0?D.mutate(a):alert("No changes to save.")},na=async a=>{if(!i||!a.target.files||a.target.files.length===0){alert("Please select an image to upload.");return}const r=a.target.files[0],l=r.name.split(".").pop(),x=`avatars/${`${i.id}-${Math.random()}.${l}`}`;Z(!0);try{const{data:j,error:m}=await h.storage.from("avatars").upload(x,r,{cacheControl:"3600",upsert:!0});if(m)throw m;const{data:y}=h.storage.from("avatars").getPublicUrl(x),o=y.publicUrl;D.mutate({avatar_url:o})}catch(j){alert(`Avatar upload error: ${j.message}`)}finally{Z(!1),M.current&&(M.current.value="")}},oa=()=>{const a=qe.split(",").map(o=>o.trim()).filter(Boolean),r=We.split(",").map(o=>o.trim()).filter(Boolean),l=Ke.split(",").map(o=>o.trim()).filter(Boolean),c=ie.split(",").map(o=>o.trim()).filter(Boolean),x=oe.split(",").map(o=>o.trim()).filter(Boolean),j=Ze.split(",").map(o=>o.trim()).filter(Boolean),m=X.split(",").map(o=>o.trim()).filter(Boolean),y=ee.split(",").map(o=>o.trim()).filter(Boolean);u.mutate({preferred_mediums:m,preferred_styles:y,min_budget:P?null:F?parseFloat(F):null,max_budget:P?null:O?parseFloat(O):null,use_learned_budget:P,alert_specific_artists:a,alert_specific_mediums:r,alert_specific_styles:l,exclude_mediums:c,exclude_styles:x,exclude_artists:j,live_preferences:G})},la=()=>{u.mutate({notification_real_time:ce,notification_daily:Ve,notification_weekly:Je,notify_by_email:pe,notify_price_drops:ue,notify_new_works:xe,notify_auction_reminders:ge,notify_collection_insights:be,preferred_digest_time:ye})},ca=async()=>{if(i)try{const{error:a}=await h.auth.admin.deleteUser(i.id);if(a)throw a;alert("Your account has been deleted successfully."),_()}catch(a){alert(`Error deleting account: ${a.message}`)}},da=async()=>{if(i)try{await u.mutateAsync({learned_preferences:{last_learned_update:new Date().toISOString(),reset_reason:"User requested reset"}}),alert("AI learned data cleared. The system will start learning fresh."),q(!1)}catch(a){alert(`Error clearing data: ${a.message}`)}},pa=async()=>{if(i)try{await u.mutateAsync({preferred_mediums:[],preferred_styles:[],min_budget:null,max_budget:null,use_learned_budget:!1,alert_specific_artists:[],alert_specific_mediums:[],alert_specific_styles:[],exclude_mediums:[],exclude_styles:[],exclude_artists:[],notification_real_time:{artwork:!0,artist:!0,catalogue:!0},notification_daily:{artwork:!1,artist:!1,catalogue:!1},notification_weekly:{artwork:!1,artist:!1,catalogue:!1},notify_by_email:!0,notify_price_drops:!0,notify_new_works:!0,notify_auction_reminders:!1,notify_collection_insights:!0,preferred_digest_time:"08:00"}),alert("All preferences reset to default."),Y(!1)}catch(a){alert(`Error resetting preferences: ${a.message}`)}},we=async()=>{try{const a={profile:n,preferences:t,learned_insights:t?.learned_preferences,export_metadata:{exported_at:new Date().toISOString(),version:"2.0",platform:"ArtFlow",user_id:i?.id}},r=new Blob([JSON.stringify(a,null,2)],{type:"application/json"}),l=URL.createObjectURL(r),c=document.createElement("a");c.href=l,c.download=`artflow-collector-data-${new Date().toISOString().split("T")[0]}.json`,c.click(),URL.revokeObjectURL(l),alert("Data exported successfully!")}catch{alert("Failed to export data")}},E=t?.learned_preferences?.preferred_price_range_from_behavior||null,f=t?.learned_preferences?.ai_performance,z=t?.learned_preferences?.behavioral_patterns,ke=t?.learned_preferences?.color_preferences||[],b=t?.learned_preferences?.market_intelligence;return ra?e.jsx(Ce,{children:e.jsxs("div",{className:"loading-state",children:[e.jsx(T,{size:48,className:"loading-icon"}),e.jsx("h2",{children:"Loading Your Collector Intelligence..."}),e.jsx("p",{children:"Gathering your AI learnings and preferences"})]})}):e.jsxs(Ce,{children:[e.jsxs(fa,{children:[e.jsx("title",{children:"Collector Settings & AI Intelligence - ArtFlow"}),e.jsx("meta",{name:"description",content:"Comprehensive collector settings with AI learnings, preferences, and intelligence insights"})]}),e.jsxs("div",{className:"enhanced-collector-settings",children:[e.jsxs("div",{className:"settings-header",children:[e.jsxs("div",{className:"profile-overview",children:[e.jsx("div",{className:"avatar-section",children:n?.avatar_url?e.jsx("img",{src:n.avatar_url,alt:"Profile",className:"profile-avatar"}):e.jsx("div",{className:"avatar-placeholder",children:e.jsx(W,{size:32})})}),e.jsxs("div",{className:"profile-summary",children:[e.jsx("h1",{children:n?.display_name||n?.full_name||"Collector"}),e.jsxs("p",{className:"profile-meta",children:[n?.location&&`📍 ${n.location}`,n?.created_at&&` • Member since ${new Date(n.created_at).getFullYear()}`]}),f&&e.jsxs("div",{className:"ai-summary-badges",children:[e.jsxs("div",{className:"ai-badge",children:[e.jsx(T,{size:14}),e.jsxs("span",{children:[f.total_interactions||0," AI interactions"]})]}),e.jsxs("div",{className:"ai-badge",children:[e.jsx(Ae,{size:14}),e.jsxs("span",{children:[Math.round((f.recommendation_accuracy||0)*100),"% accuracy"]})]}),e.jsxs("div",{className:"ai-badge",children:[e.jsx(ze,{size:14}),e.jsxs("span",{children:[Math.round((f.discovery_success_rate||0)*100),"% discovery success"]})]})]})]})]}),e.jsx("div",{className:"header-actions",children:e.jsxs("button",{onClick:we,className:"export-btn",children:[e.jsx(H,{size:16}),"Export All Data"]})})]}),e.jsx("div",{className:"settings-tabs",children:[{key:"account",label:"Account",icon:W,description:"Profile and basic settings"},{key:"ai-intelligence",label:"AI Intelligence",icon:T,description:"Your AI learnings and insights"},{key:"notifications",label:"Notifications",icon:Ie,description:"Email and alert preferences"},{key:"preferences",label:"Preferences",icon:Me,description:"Taste and filtering preferences"},{key:"security",label:"Security",icon:L,description:"Privacy and data controls"}].map(({key:a,label:r,icon:l,description:c})=>e.jsxs("button",{className:`tab-button ${d===a?"active":""}`,onClick:()=>w(a),children:[e.jsx(l,{size:18}),e.jsxs("div",{className:"tab-content",children:[e.jsx("span",{className:"tab-label",children:r}),e.jsx("span",{className:"tab-description",children:c})]})]},a))}),e.jsxs("div",{className:"tab-content-area",children:[d==="account"&&e.jsxs("div",{className:"account-section",children:[e.jsxs("div",{className:"section-card",children:[e.jsxs("h3",{children:[e.jsx(W,{size:20}),"Profile Information"]}),e.jsxs("div",{className:"avatar-upload-section",children:[e.jsx("img",{src:n?.avatar_url||"https://via.placeholder.com/80x80?text=Avatar",alt:"Avatar",className:"current-avatar"}),e.jsxs("div",{className:"avatar-controls",children:[e.jsx("input",{type:"file",id:"avatar-upload",accept:"image/*",ref:M,onChange:na,style:{display:"none"},disabled:$}),e.jsxs("button",{className:"avatar-upload-btn",onClick:()=>M.current?.click(),disabled:$,children:[e.jsx(va,{size:16}),$?"Uploading...":"Change Avatar"]})]})]}),e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Full Name"}),e.jsx("input",{type:"text",className:"form-input",value:p,onChange:a=>v(a.target.value)})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Display Name"}),e.jsx("input",{type:"text",className:"form-input",value:C,onChange:a=>Be(a.target.value)})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Location"}),e.jsx("input",{type:"text",className:"form-input",value:B,onChange:a=>Re(a.target.value),placeholder:"City, Country"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Email"}),e.jsx("input",{type:"email",className:"form-input",value:U,onChange:a=>Oe(a.target.value)})]})]}),e.jsxs("div",{className:"form-field full-width",children:[e.jsx("label",{children:"Bio"}),e.jsx("textarea",{className:"form-textarea",value:R,onChange:a=>Ue(a.target.value),rows:4,placeholder:"Tell us about your collecting journey and interests..."})]}),e.jsxs("div",{className:"password-section",children:[e.jsxs("h4",{children:[e.jsx(ba,{size:18}),"Change Password"]}),e.jsxs("div",{className:"password-grid",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"New Password"}),e.jsx("input",{type:"password",className:"form-input",value:A,onChange:a=>$e(a.target.value),placeholder:"Leave blank to keep current password"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Confirm New Password"}),e.jsx("input",{type:"password",className:"form-input",value:Q,onChange:a=>Fe(a.target.value)})]})]})]}),e.jsx("div",{className:"form-actions",children:e.jsx("button",{onClick:ia,disabled:D.isPending,className:"save-btn",children:D.isPending?"Saving...":"Save Account Settings"})})]}),e.jsxs("div",{className:"section-card danger-zone",children:[e.jsxs("h3",{children:[e.jsx(De,{size:20}),"Danger Zone"]}),e.jsx("p",{children:"Permanent actions that cannot be undone"}),e.jsxs("button",{className:"delete-account-btn",onClick:()=>_e(!0),children:[e.jsx(De,{size:16}),"Delete My Account"]})]})]}),d==="ai-intelligence"&&e.jsx("div",{className:"ai-intelligence-section",children:e.jsxs("div",{className:"section-card",children:[e.jsxs("h3",{children:[e.jsx(T,{size:20}),"Your AI Intelligence Profile"]}),e.jsx("p",{children:"Comprehensive insights about your collecting behavior learned by our AI"}),e.jsxs("div",{className:"live-preferences-section",children:[e.jsx("h4",{children:"Live AI Preference Controls"}),e.jsx("p",{children:"These controls adjust your recommendations in real-time"}),e.jsx(ha,{onPreferencesChange:V,initialPreferences:G})]}),f&&e.jsxs("div",{className:"ai-performance-section",children:[e.jsx("h4",{children:"AI Performance"}),e.jsxs("div",{className:"performance-grid",children:[e.jsxs("div",{className:"performance-card",children:[e.jsx(Ee,{size:24,color:"var(--accent)"}),e.jsxs("div",{className:"performance-content",children:[e.jsxs("span",{className:"performance-value",children:[Math.round(f.recommendation_accuracy*100),"%"]}),e.jsx("span",{className:"performance-label",children:"Recommendation Accuracy"}),e.jsx("span",{className:"performance-description",children:"How often our AI suggestions match your interests"})]})]}),e.jsxs("div",{className:"performance-card",children:[e.jsx(ze,{size:24,color:"#f59e0b"}),e.jsxs("div",{className:"performance-content",children:[e.jsxs("span",{className:"performance-value",children:[Math.round(f.discovery_success_rate*100),"%"]}),e.jsx("span",{className:"performance-label",children:"Discovery Success"}),e.jsx("span",{className:"performance-description",children:"Success rate when AI suggests new artists or styles"})]})]}),e.jsxs("div",{className:"performance-card",children:[e.jsx(ga,{size:24,color:"#10b981"}),e.jsxs("div",{className:"performance-content",children:[e.jsxs("span",{className:"performance-value",children:[Math.round(f.learning_velocity*100),"%"]}),e.jsx("span",{className:"performance-label",children:"Learning Velocity"}),e.jsx("span",{className:"performance-description",children:"How quickly AI adapts to your evolving preferences"})]})]})]})]}),t?.learned_preferences&&e.jsxs("div",{className:"learned-taste-section",children:[e.jsx("h4",{children:"AI-Learned Taste Profile"}),t.learned_preferences.top_liked_mediums&&e.jsxs("div",{className:"taste-category",children:[e.jsx("h5",{children:"Medium Preferences"}),e.jsx("div",{className:"preference-list",children:t.learned_preferences.top_liked_mediums.map((a,r)=>e.jsxs("div",{className:"preference-item",children:[e.jsxs("div",{className:"preference-header",children:[e.jsx("span",{className:"preference-name",children:a.name}),e.jsxs("span",{className:"confidence-score",children:[Math.round((a.confidence||0)*100),"% confident"]})]}),e.jsx("div",{className:"preference-bar",children:e.jsx("div",{className:"preference-fill",style:{width:`${(a.confidence||0)*100}%`}})}),e.jsxs("span",{className:"interaction-count",children:[a.count," interactions"]})]},r))})]}),ke.length>0&&e.jsxs("div",{className:"taste-category",children:[e.jsx("h5",{children:"Color Intelligence"}),e.jsx("div",{className:"color-grid",children:ke.map((a,r)=>e.jsxs("div",{className:"color-item",children:[e.jsx("div",{className:"color-swatch",style:{backgroundColor:a.hex}}),e.jsxs("div",{className:"color-details",children:[e.jsx("span",{className:"color-name",children:a.color}),e.jsxs("span",{className:"color-frequency",children:[a.frequency,"x"]}),e.jsxs("span",{className:"color-confidence",children:[Math.round((a.confidence||0)*100),"%"]})]})]},r))})]}),z&&e.jsxs("div",{className:"taste-category",children:[e.jsx("h5",{children:"Behavioral Intelligence"}),e.jsxs("div",{className:"behavior-insights",children:[e.jsxs("div",{className:"insight-item",children:[e.jsx(Pe,{size:18}),e.jsxs("div",{className:"insight-content",children:[e.jsx("span",{className:"insight-label",children:"Peak Browsing Hours"}),e.jsx("span",{className:"insight-value",children:z.peak_browsing_hours?.join(", ")||"Learning..."})]})]}),e.jsxs("div",{className:"insight-item",children:[e.jsx(ja,{size:18}),e.jsxs("div",{className:"insight-content",children:[e.jsx("span",{className:"insight-label",children:"Avg Session Duration"}),e.jsxs("span",{className:"insight-value",children:[z.session_duration_avg||0," minutes"]})]})]}),e.jsxs("div",{className:"insight-item",children:[e.jsx(Ee,{size:18}),e.jsxs("div",{className:"insight-content",children:[e.jsx("span",{className:"insight-label",children:"Decision Speed"}),e.jsx("span",{className:"insight-value",children:z.decision_speed||"Learning..."})]})]}),e.jsxs("div",{className:"insight-item",children:[e.jsx(ya,{size:18}),e.jsxs("div",{className:"insight-content",children:[e.jsx("span",{className:"insight-label",children:"Price Sensitivity"}),e.jsxs("span",{className:"insight-value",children:[Math.round((z.price_sensitivity||0)*100),"%"]})]})]})]})]}),b&&e.jsxs("div",{className:"taste-category",children:[e.jsx("h5",{children:"Market Intelligence"}),b.collection_gaps&&b.collection_gaps.length>0&&e.jsxs("div",{className:"intelligence-subsection",children:[e.jsx("h6",{children:"Collection Gaps AI Identified"}),e.jsx("div",{className:"gaps-list",children:b.collection_gaps.map((a,r)=>e.jsxs("div",{className:"gap-item",children:[e.jsx(Ae,{size:14}),e.jsx("span",{children:a})]},r))})]}),b.investment_opportunities&&b.investment_opportunities.length>0&&e.jsxs("div",{className:"intelligence-subsection",children:[e.jsx("h6",{children:"Investment Opportunities"}),e.jsx("div",{className:"opportunities-list",children:b.investment_opportunities.map((a,r)=>e.jsxs("div",{className:"opportunity-item",children:[e.jsxs("div",{className:"opportunity-header",children:[e.jsx("span",{className:"artist-name",children:a.artist}),e.jsxs("span",{className:"confidence-badge",children:[Math.round(a.confidence*100),"% confidence"]})]}),e.jsx("p",{className:"opportunity-reasoning",children:a.reasoning}),a.potential_return&&e.jsxs("span",{className:"potential-return",children:["Potential: +",Math.round(a.potential_return*100),"%"]})]},r))})]})]})]}),e.jsxs("div",{className:"ai-controls-section",children:[e.jsx("h4",{children:"AI Learning Controls"}),e.jsxs("div",{className:"ai-control-buttons",children:[e.jsx("button",{className:"control-btn secondary",onClick:()=>q(!0),children:"Clear AI Learning Data"}),e.jsx("button",{className:"control-btn secondary",onClick:()=>Y(!0),children:"Reset All Preferences"})]}),e.jsx("p",{className:"control-warning",children:"⚠️ These actions will affect your personalized recommendations"})]})]})}),d==="notifications"&&e.jsx("div",{className:"notifications-section",children:e.jsxs("div",{className:"section-card",children:[e.jsxs("h3",{children:[e.jsx(Ie,{size:20}),"Intelligent Notifications"]}),e.jsx("p",{children:"Choose how and when you want to receive AI-powered updates"}),e.jsxs("div",{className:"notification-category",children:[e.jsx("h4",{children:"Smart Alerts"}),e.jsxs("div",{className:"notification-options",children:[e.jsxs("div",{className:"notification-option",children:[e.jsxs("div",{className:"option-content",children:[e.jsx("span",{className:"option-label",children:"Price Drop Alerts"}),e.jsx("span",{className:"option-description",children:"When saved artworks drop in price"})]}),e.jsx(N,{checked:ue,onChange:fe})]}),e.jsxs("div",{className:"notification-option",children:[e.jsxs("div",{className:"option-content",children:[e.jsx("span",{className:"option-label",children:"New Works from Followed Artists"}),e.jsx("span",{className:"option-description",children:"Fresh artworks from artists you follow"})]}),e.jsx(N,{checked:xe,onChange:he})]}),e.jsxs("div",{className:"notification-option",children:[e.jsxs("div",{className:"option-content",children:[e.jsx("span",{className:"option-label",children:"Collection Insights"}),e.jsx("span",{className:"option-description",children:"Weekly AI insights about your collection and market"})]}),e.jsx(N,{checked:be,onChange:je})]}),e.jsxs("div",{className:"notification-option",children:[e.jsxs("div",{className:"option-content",children:[e.jsx("span",{className:"option-label",children:"Auction Reminders"}),e.jsx("span",{className:"option-description",children:"Upcoming auctions for works matching your taste"})]}),e.jsx(N,{checked:ge,onChange:ve})]})]})]}),e.jsxs("div",{className:"notification-category",children:[e.jsx("h4",{children:"Real-Time Alerts"}),e.jsx("p",{className:"category-description",children:"Instant notifications for new items matching your preferences"}),["artwork","artist","catalogue"].map(a=>e.jsxs("div",{className:"notification-option",children:[e.jsxs("span",{className:"option-label",children:["New ",a.charAt(0).toUpperCase()+a.slice(1)]}),e.jsx(N,{checked:ce[a],onChange:r=>de(l=>({...l,[a]:r}))})]},a))]}),e.jsxs("div",{className:"notification-category",children:[e.jsxs("h4",{children:[e.jsx(Na,{size:18}),"Email Preferences"]}),e.jsxs("div",{className:"email-settings",children:[e.jsxs("div",{className:"notification-option",children:[e.jsxs("div",{className:"option-content",children:[e.jsx("span",{className:"option-label",children:"Receive notifications by email"}),e.jsxs("span",{className:"option-description",children:["Primary email: ",i?.email]})]}),e.jsx(N,{checked:pe,onChange:me})]}),e.jsxs("div",{className:"digest-time-setting",children:[e.jsxs("label",{children:[e.jsx(Pe,{size:16}),"Preferred Digest Time"]}),e.jsx("input",{type:"time",className:"time-input",value:ye,onChange:a=>Ne(a.target.value)}),e.jsx("small",{children:"Digests will be sent around this time in your timezone"})]})]})]}),e.jsx("div",{className:"form-actions",children:e.jsx("button",{onClick:la,disabled:u.isPending,className:"save-btn",children:u.isPending?"Saving...":"Save Notification Settings"})})]})}),d==="preferences"&&e.jsx("div",{className:"preferences-section",children:e.jsxs("div",{className:"section-card",children:[e.jsxs("h3",{children:[e.jsx(Me,{size:20}),"Your Collecting Preferences"]}),e.jsxs("div",{className:"manual-preferences",children:[e.jsx("h4",{children:"Manual Preferences"}),e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Preferred Mediums (comma-separated)"}),e.jsx("input",{type:"text",value:X,onChange:a=>J(a.target.value),className:"form-input",placeholder:"Oil, Acrylic, Photography"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Preferred Styles (comma-separated)"}),e.jsx("input",{type:"text",value:ee,onChange:a=>ae(a.target.value),className:"form-input",placeholder:"Abstract, Contemporary, Landscape"})]})]})]}),e.jsxs("div",{className:"budget-preferences",children:[e.jsx("h4",{children:"Budget Preferences"}),e.jsxs("div",{className:"budget-toggle",children:[e.jsx(N,{checked:P,onChange:se}),e.jsx("span",{children:"Use AI-Learned Budget Range"})]}),P?E?e.jsxs("div",{className:"learned-budget-display",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"AI-Estimated Range:"})," R",E.min.toLocaleString()," – R",E.max.toLocaleString()]}),e.jsxs("p",{className:"confidence-note",children:["Confidence: ",E.confidence||"Learning..."]})]}):e.jsx("p",{className:"learning-note",children:"AI is still learning your budget preferences. Keep interacting with artworks!"}):e.jsx("div",{className:"manual-budget",children:e.jsxs("div",{className:"budget-inputs",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Min Budget (ZAR)"}),e.jsx("input",{type:"number",value:F,onChange:a=>te(a.target.value),className:"form-input",placeholder:"1000"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Max Budget (ZAR)"}),e.jsx("input",{type:"number",value:O,onChange:a=>re(a.target.value),className:"form-input",placeholder:"50000"})]})]})})]}),e.jsxs("div",{className:"exclusion-filters",children:[e.jsx("h4",{children:"Exclusion Filters"}),e.jsx("p",{className:"section-description",children:"Tell us what you absolutely DO NOT want to see in recommendations"}),e.jsxs("div",{className:"form-grid",children:[e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Exclude Mediums"}),e.jsx("input",{type:"text",className:"form-input",value:ie,onChange:a=>ne(a.target.value),placeholder:"Photography, Digital Art"})]}),e.jsxs("div",{className:"form-field",children:[e.jsx("label",{children:"Exclude Styles"}),e.jsx("input",{type:"text",className:"form-input",value:oe,onChange:a=>le(a.target.value),placeholder:"Pop Art, Graffiti"})]})]})]}),e.jsx("div",{className:"form-actions",children:e.jsx("button",{onClick:oa,disabled:u.isPending,className:"save-btn",children:u.isPending?"Saving...":"Save Preferences"})})]})}),d==="security"&&e.jsx("div",{className:"security-section",children:e.jsxs("div",{className:"section-card",children:[e.jsxs("h3",{children:[e.jsx(L,{size:20}),"Security & Privacy Controls"]}),e.jsxs("div",{className:"security-options",children:[e.jsxs("div",{className:"security-category",children:[e.jsx("h4",{children:"Data Export & Portability"}),e.jsx("p",{children:"Download all your data in a portable format"}),e.jsxs("button",{onClick:we,className:"export-full-btn",children:[e.jsx(H,{size:16}),"Export Complete Profile & AI Data"]})]}),e.jsxs("div",{className:"security-category",children:[e.jsx("h4",{children:"Privacy Policy & Terms"}),e.jsx("p",{children:"Review our data handling practices"}),e.jsxs("div",{className:"policy-links",children:[e.jsxs("a",{href:"/privacy-policy",target:"_blank",rel:"noopener noreferrer",className:"policy-link",children:[e.jsx(Te,{size:16}),"Privacy Policy"]}),e.jsxs("a",{href:"/terms-of-service",target:"_blank",rel:"noopener noreferrer",className:"policy-link",children:[e.jsx(Te,{size:16}),"Terms of Service"]})]})]}),e.jsxs("div",{className:"security-category",children:[e.jsx("h4",{children:"Data Management"}),e.jsx("p",{children:"Control how your data is used for personalization"}),e.jsxs("div",{className:"data-controls",children:[e.jsxs("button",{className:"control-btn secondary",children:[e.jsx(L,{size:16}),"Manage Cookie Preferences"]}),e.jsxs("button",{className:"control-btn secondary",children:[e.jsx(H,{size:16}),"Request Data Copy"]})]})]})]})]})})]}),e.jsx(K,{isOpen:aa,onClose:()=>_e(!1),onConfirm:ca,title:"Confirm Account Deletion",message:"Are you absolutely sure you want to delete your account? All your data, AI learnings, preferences, and activity will be permanently lost. This action cannot be undone.",confirmText:"Delete Account",isDestructive:!0}),e.jsx(K,{isOpen:sa,onClose:()=>q(!1),onConfirm:da,title:"Clear AI Learning Data",message:"This will erase all data the AI has learned about your preferences. Your recommendations will start fresh, but you'll lose all personalization. Are you sure?",confirmText:"Clear AI Data",isDestructive:!0}),e.jsx(K,{isOpen:ta,onClose:()=>Y(!1),onConfirm:pa,title:"Reset All Preferences",message:"This will reset all your preferences (mediums, styles, budget, alerts, exclusions) to their default values. Your AI learning data will be preserved. Are you sure?",confirmText:"Reset Preferences",isDestructive:!0}),e.jsx("style",{jsx:!0,children:`
          .enhanced-collector-settings {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }

          .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid var(--border);
          }

          .profile-overview {
            display: flex;
            gap: 20px;
            align-items: flex-start;
          }

          .avatar-section {
            flex-shrink: 0;
          }

          .profile-avatar, .current-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid var(--border);
          }

          .avatar-placeholder {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--bg-alt);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid var(--border);
          }

          .profile-summary h1 {
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 700;
          }

          .profile-meta {
            margin: 0 0 16px 0;
            color: var(--muted);
            font-size: 14px;
          }

          .ai-summary-badges {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .ai-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--accent-bg);
            color: var(--accent);
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
          }

          .export-btn, .export-full-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }

          .export-btn:hover, .export-full-btn:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .settings-tabs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
            margin-bottom: 32px;
          }

          .tab-button {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--card);
            border: 2px solid var(--border);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .tab-button.active {
            border-color: var(--accent);
            background: var(--accent-bg);
          }

          .tab-button:hover:not(.active) {
            border-color: var(--border-hover);
            transform: translateY(-1px);
          }

          .tab-content {
            display: flex;
            flex-direction: column;
          }

          .tab-label {
            font-weight: 600;
            margin-bottom: 2px;
          }

          .tab-description {
            font-size: 13px;
            color: var(--muted);
          }

          .section-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }

          .section-card.danger-zone {
            border-color: #fecaca;
            background: #fef2f2;
          }

          .section-card h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          }

          .section-card h4 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 24px 0 12px 0;
            font-size: 16px;
            font-weight: 600;
          }

          .section-card h5 {
            margin: 20px 0 12px 0;
            font-size: 15px;
            font-weight: 600;
            color: var(--accent);
          }

          .section-card h6 {
            margin: 16px 0 8px 0;
            font-size: 14px;
            font-weight: 500;
            color: var(--muted);
          }

          .avatar-upload-section {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
          }

          .avatar-controls {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .avatar-upload-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--bg-alt);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }

          .avatar-upload-btn:hover:not(:disabled) {
            background: var(--accent-bg);
            border-color: var(--accent);
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .form-field {
            display: flex;
            flex-direction: column;
          }

          .form-field.full-width {
            grid-column: 1 / -1;
          }

          .form-field label {
            font-weight: 500;
            margin-bottom: 8px;
            color: var(--fg);
            font-size: 14px;
          }

          .form-input, .form-textarea, .time-input {
            padding: 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg);
            color: var(--fg);
            transition: border-color 0.2s;
            font-size: 14px;
          }

          .form-input:focus, .form-textarea:focus, .time-input:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-bg);
          }

          .time-input {
            max-width: 150px;
          }

          .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 16px;
          }

          .performance-card {
            display: flex;
            gap: 16px;
            padding: 20px;
            background: var(--bg-alt);
            border-radius: 12px;
            border: 1px solid var(--border);
          }

          .performance-content {
            display: flex;
            flex-direction: column;
          }

          .performance-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 4px;
          }

          .performance-label {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .performance-description {
            font-size: 13px;
            color: var(--muted);
            line-height: 1.4;
          }

          .preference-list {
            margin-top: 12px;
          }

          .preference-item {
            margin-bottom: 16px;
          }

          .preference-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .preference-name {
            font-weight: 500;
            text-transform: capitalize;
          }

          .confidence-score, .confidence-badge {
            background: var(--accent-bg);
            color: var(--accent);
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .preference-bar {
            height: 6px;
            background: var(--bg-alt);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
          }

          .preference-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--accent-hover));
            transition: width 0.3s ease;
          }

          .interaction-count {
            font-size: 12px;
            color: var(--muted);
          }

          .color-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 12px;
            margin-top: 12px;
          }

          .color-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: var(--bg-alt);
            border-radius: 8px;
            border: 1px solid var(--border);
          }

          .color-swatch {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            border: 1px solid var(--border);
            flex-shrink: 0;
          }

          .color-details {
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .color-name {
            font-weight: 500;
            font-size: 14px;
            text-transform: capitalize;
          }

          .color-frequency, .color-confidence {
            font-size: 11px;
            color: var(--muted);
          }

          .behavior-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 12px;
          }

          .insight-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
          }

          .insight-content {
            display: flex;
            flex-direction: column;
          }

          .insight-label {
            font-size: 13px;
            color: var(--muted);
            margin-bottom: 2px;
          }

          .insight-value {
            font-weight: 600;
            color: var(--fg);
          }

          .notification-category {
            margin-bottom: 32px;
          }

          .category-description {
            font-size: 14px;
            color: var(--muted);
            margin-bottom: 16px;
          }

          .notification-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .notification-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: var(--bg-alt);
            border-radius: 8px;
            border: 1px solid var(--border);
          }

          .option-content {
            display: flex;
            flex-direction: column;
          }

          .option-label {
            font-weight: 500;
            margin-bottom: 2px;
          }

          .option-description {
            font-size: 13px;
            color: var(--muted);
          }

          .save-btn {
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
          }

          .save-btn:hover:not(:disabled) {
            background: var(--accent-hover);
            transform: translateY(-1px);
          }

          .save-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .delete-account-btn {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .delete-account-btn:hover {
            background: #dc2626;
          }

          .control-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            border: 1px solid var(--border);
          }

          .control-btn.secondary {
            background: var(--bg-alt);
            color: var(--fg);
          }

          .control-btn.secondary:hover {
            background: var(--bg);
            border-color: var(--accent);
          }

          .ai-control-buttons {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
          }

          .control-warning {
            font-size: 13px;
            color: #f59e0b;
            margin: 0;
          }

          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: var(--card);
            border-radius: 12px;
            padding: 24px;
            border: 1px solid var(--border);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }

          .button {
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            border: 1px solid var(--border);
          }

          .button-primary {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
          }

          .button-secondary {
            background: var(--bg-alt);
            color: var(--fg);
          }

          .button-danger {
            background: #ef4444;
            color: white;
            border-color: #ef4444;
          }

          .loading-state {
            text-align: center;
            padding: 80px 24px;
          }

          .loading-icon {
            animation: pulse 2s infinite;
            margin-bottom: 16px;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          @media (max-width: 768px) {
            .settings-header {
              flex-direction: column;
              gap: 16px;
            }

            .profile-overview {
              flex-direction: column;
              text-align: center;
            }

            .settings-tabs {
              grid-template-columns: 1fr;
            }

            .performance-grid {
              grid-template-columns: 1fr;
            }
          }
        `})]})]})};export{Qa as default};
