import{n as e}from"./mermaid-parser.core-BWZEVApv.js";import{o as t}from"./advancedParser-BD3JdebN.js";import{n}from"./chunk-Y2CYZVJY-DsF7k-Jl.js";import{m as r}from"./src-B_Vs7tax.js";import{H as i,K as a,U as o,a as s,c,f as l,v as u,w as d,x as f,y as p}from"./chunk-I66GZJ75-rsqMsohk.js";import{t as m}from"./ordinal-hYBb2elL.js";import{n as h}from"./path-BWPyau1x.js";import{m as g}from"./dist-D9sYb5Oa.js";import{t as _}from"./arc-BjSQqbzd.js";import{t as v}from"./array-BifhSqXX.js";import{i as y,p as b}from"./chunk-NSK5VX7P-B43gO-hW.js";import{t as x}from"./chunk-JWPE2WC7-DVXcaiue.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=h(0),i=h(g),a=h(0);function o(o){var s,c=(o=v(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(g,Math.max(-g,i.apply(this,arguments)-m)),_,y=Math.min(Math.abs(h)/c,a.apply(this,arguments)),b=y*(h<0?-1:1),x;for(s=0;s<c;++s)(x=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*b)/d:0;s<c;++s,m=_)l=f[s],x=p[l],_=m+(x>0?x*u:0)+b,p[l]={data:o[l],index:s,value:x,startAngle:m,endAngle:_,padAngle:y};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:h(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:h(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:h(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:h(+e),o):a},o}var T=l.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:n(()=>structuredClone(k),`getConfig`),clear:n(()=>{D=new Map,O=E.showData,s()},`clear`),setDiagramTitle:a,getDiagramTitle:d,setAccTitle:o,getAccTitle:p,setAccDescription:i,getAccDescription:u,addSection:n(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),r.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:n(()=>D,`getSections`),setShowData:n(e=>{O=e},`setShowData`),getShowData:n(()=>O,`getShowData`)},j=n((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:n(async t=>{let n=await e(`pie`,t);r.debug(n),j(n,A)},`parse`)},N=n(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
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
`,`getStyles`),P=n(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:n((e,n,i,a)=>{r.debug(`rendering pie chart
`+e);let o=a.db,s=f(),l=y(o.getConfig(),s.pie),u=t(n),d=u.append(`g`);d.attr(`transform`,`translate(225,225)`);let{themeVariables:p}=s,[h]=b(p.pieOuterStrokeWidth);h??=2;let g=l.legendPosition,v=l.textPosition,x=l.donutHole>0&&l.donutHole<=.9?l.donutHole:0,S=_().innerRadius(x*185).outerRadius(185),C=_().innerRadius(185*v).outerRadius(185*v),w=d.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+h/2).attr(`class`,`pieOuterCircle`);let T=o.getSections(),E=P(T),D=[p.pie1,p.pie2,p.pie3,p.pie4,p.pie5,p.pie6,p.pie7,p.pie8,p.pie9,p.pie10,p.pie11,p.pie12],O=0;T.forEach(e=>{O+=e});let k=E.filter(e=>(e.data.value/O*100).toFixed(0)!==`0`),A=m(D).domain([...T.keys()]);w.selectAll(`mySlices`).data(k).enter().append(`path`).attr(`d`,S).attr(`fill`,e=>A(e.data.label)).attr(`class`,e=>{let t=`pieCircle`;return l.highlightSlice===`hover`?t+=` highlightedOnHover`:l.highlightSlice===e.data.label&&(t+=` highlighted`),t}),w.selectAll(`mySlices`).data(k).enter().append(`text`).text(e=>(e.data.value/O*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+C.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let j=d.append(`text`).text(o.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),M=[...T.entries()].map(([e,t])=>({label:e,value:t})),N=d.selectAll(`.legend`).data(M).enter().append(`g`).attr(`class`,`legend`);N.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>A(e.label)).style(`stroke`,e=>A(e.label)),N.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let F=Math.max(...N.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),I=450,L=490,R=M.length*22;switch(g){case`center`:N.attr(`transform`,(e,t)=>{let n=22*M.length/2,r=-F/2-22,i=t*22-n;return`translate(`+r+`,`+i+`)`});break;case`top`:I+=R,N.attr(`transform`,(e,t)=>`translate(${-F/2-22}, ${t*22-185})`),w.attr(`transform`,()=>`translate(0, ${R+22})`);break;case`bottom`:I+=R,N.attr(`transform`,(e,t)=>{let n=-F/2-22,r=t*22- -207;return`translate(`+n+`,`+r+`)`});break;case`left`:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(-207,`+(t*22-n)+`)`}),w.attr(`transform`,()=>`translate(${F+18+4}, 0)`);break;default:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(216,`+(t*22-n)+`)`});break}let z=j.node()?.getBoundingClientRect().width??0,B=450/2-z/2,V=450/2+z/2,H=Math.min(0,B),U=Math.max(L,V)-H;u.attr(`viewBox`,`${H} 0 ${U} ${I}`),c(u,I,U,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};