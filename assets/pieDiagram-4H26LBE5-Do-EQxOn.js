import{t as e}from"./mermaid-parser.core-BXOTihGr.js";import{o as t}from"./advancedParser-jDT5FjXS.js";import{g as n,h as r}from"./src-DfjLQgu_.js";import{H as i,K as a,U as o,a as s,c,f as l,v as u,w as d,x as f,y as p}from"./chunk-CSCIHK7Q-BE6cKm5h.js";import{t as m}from"./ordinal-hYBb2elL.js";import{n as h}from"./path-BWPyau1x.js";import{m as g}from"./dist-D9sYb5Oa.js";import{t as _}from"./arc-BjSQqbzd.js";import{t as v}from"./array-BifhSqXX.js";import{i as y,p as b}from"./chunk-5ZQYHXKU-CFAwaGzA.js";import{t as x}from"./chunk-4BX2VUAB-Dc2PyXGY.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=h(0),i=h(g),a=h(0);function o(o){var s,c=(o=v(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(g,Math.max(-g,i.apply(this,arguments)-m)),_,y=Math.min(Math.abs(h)/c,a.apply(this,arguments)),b=y*(h<0?-1:1),x;for(s=0;s<c;++s)(x=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*b)/d:0;s<c;++s,m=_)l=f[s],x=p[l],_=m+(x>0?x*u:0)+b,p[l]={data:o[l],index:s,value:x,startAngle:m,endAngle:_,padAngle:y};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:h(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:h(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:h(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:h(+e),o):a},o}var T=l.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:r(()=>structuredClone(k),`getConfig`),clear:r(()=>{D=new Map,O=E.showData,s()},`clear`),setDiagramTitle:a,getDiagramTitle:d,setAccTitle:o,getAccTitle:p,setAccDescription:i,getAccDescription:u,addSection:r(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),n.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:r(()=>D,`getSections`),setShowData:r(e=>{O=e},`setShowData`),getShowData:r(()=>O,`getShowData`)},j=r((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:r(async t=>{let r=await e(`pie`,t);n.debug(r),j(r,A)},`parse`)},N=r(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=r(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:r((e,r,i,a)=>{n.debug(`rendering pie chart
`+e);let o=a.db,s=f(),l=y(o.getConfig(),s.pie),u=t(r),d=u.append(`g`);d.attr(`transform`,`translate(225,225)`);let{themeVariables:p}=s,[h]=b(p.pieOuterStrokeWidth);h??=2;let g=l.textPosition,v=_().innerRadius(0).outerRadius(185),x=_().innerRadius(185*g).outerRadius(185*g);d.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+h/2).attr(`class`,`pieOuterCircle`);let S=o.getSections(),C=P(S),w=[p.pie1,p.pie2,p.pie3,p.pie4,p.pie5,p.pie6,p.pie7,p.pie8,p.pie9,p.pie10,p.pie11,p.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=m(w).domain([...S.keys()]);d.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,v).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),d.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let O=d.append(`text`).text(o.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),k=[...S.entries()].map(([e,t])=>({label:e,value:t})),A=d.selectAll(`.legend`).data(k).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*k.length/2;return`translate(216,`+(t*22-n)+`)`});A.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),A.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let j=512+Math.max(...A.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),M=O.node()?.getBoundingClientRect().width??0,N=450/2-M/2,F=450/2+M/2,I=Math.min(0,N),L=Math.max(j,F)-I;u.attr(`viewBox`,`${I} 0 ${L} 450`),c(u,450,L,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};