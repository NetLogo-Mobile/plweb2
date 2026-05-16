import{z as S,aW as R,f as H,S as J,aM as Q,T as tt,aN as et,Y as at,aP as rt,b as p,ar as W,X as nt,n as it,aL as ot,ax as st,y as lt,o as ct,K as ut}from"./getUserCurentAvatarByID-C1ZZuxAX.js";import{p as pt}from"./chunk-4BX2VUAB-BxmdMevq.js";import{p as dt}from"./wardley-RL74JXVD-AZpYYp4t.js";import{d as I}from"./arc-BfE-jeGO.js";import{o as gt}from"./ordinal-Cboi1Yqb.js";import"./index-CFX8u9Vn.js";import"./highlightjs-GgnfWQFu.js";import"./_getTag-CUT9fVRs.js";import"./map-m94zS7-j.js";import"./_baseEach-DKii5BlW.js";import"./_baseUniq-Cspmci5b.js";import"./min-BLo9WSMg.js";import"./init-Gi6I4Gst.js";function ft(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ht(t){return t}function mt(){var t=ht,a=ft,f=null,y=S(0),o=S(R),d=S(0);function s(e){var n,l=(e=H(e)).length,g,h,v=0,c=new Array(l),i=new Array(l),x=+y.apply(this,arguments),w=Math.min(R,Math.max(-R,o.apply(this,arguments)-x)),m,D=Math.min(Math.abs(w)/l,d.apply(this,arguments)),$=D*(w<0?-1:1),u;for(n=0;n<l;++n)(u=i[c[n]=n]=+t(e[n],n,e))>0&&(v+=u);for(a!=null?c.sort(function(A,C){return a(i[A],i[C])}):f!=null&&c.sort(function(A,C){return f(e[A],e[C])}),n=0,h=v?(w-l*$)/v:0;n<l;++n,x=m)g=c[n],u=i[g],m=x+(u>0?u*h:0)+$,i[g]={data:e[g],index:n,value:u,startAngle:x,endAngle:m,padAngle:D};return i}return s.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),s):t},s.sortValues=function(e){return arguments.length?(a=e,f=null,s):a},s.sort=function(e){return arguments.length?(f=e,a=null,s):f},s.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),s):y},s.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),s):o},s.padAngle=function(e){return arguments.length?(d=typeof e=="function"?e:S(+e),s):d},s}var vt=ut.pie,z={sections:new Map,showData:!1},T=z.sections,F=z.showData,xt=structuredClone(vt),St=p(()=>structuredClone(xt),"getConfig"),yt=p(()=>{T=new Map,F=z.showData,ct()},"clear"),wt=p(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),W.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),At=p(()=>T,"getSections"),Ct=p(t=>{F=t},"setShowData"),Dt=p(()=>F,"getShowData"),_={getConfig:St,clear:yt,setDiagramTitle:rt,getDiagramTitle:at,setAccTitle:et,getAccTitle:tt,setAccDescription:Q,getAccDescription:J,addSection:wt,getSections:At,setShowData:Ct,getShowData:Dt},$t=p((t,a)=>{pt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),Tt={parse:p(async t=>{const a=await dt("pie",t);W.debug(a),$t(a,_)},"parse")},Mt=p(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),bt=Mt,kt=p(t=>{const a=[...t.values()].reduce((o,d)=>o+d,0),f=[...t.entries()].map(([o,d])=>({label:o,value:d})).filter(o=>o.value/a*100>=1);return mt().value(o=>o.value).sort(null)(f)},"createPieArcs"),Et=p((t,a,f,y)=>{W.debug(`rendering pie chart
`+t);const o=y.db,d=nt(),s=it(o.getConfig(),d.pie),e=40,n=18,l=4,g=450,h=g,v=ot(a),c=v.append("g");c.attr("transform","translate("+h/2+","+g/2+")");const{themeVariables:i}=d;let[x]=st(i.pieOuterStrokeWidth);x??=2;const w=s.textPosition,m=Math.min(h,g)/2-e,D=I().innerRadius(0).outerRadius(m),$=I().innerRadius(m*w).outerRadius(m*w);c.append("circle").attr("cx",0).attr("cy",0).attr("r",m+x/2).attr("class","pieOuterCircle");const u=o.getSections(),A=kt(u),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let M=0;u.forEach(r=>{M+=r});const L=A.filter(r=>(r.data.value/M*100).toFixed(0)!=="0"),b=gt(C).domain([...u.keys()]);c.selectAll("mySlices").data(L).enter().append("path").attr("d",D).attr("fill",r=>b(r.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(L).enter().append("text").text(r=>(r.data.value/M*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const V=c.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),N=[...u.entries()].map(([r,E])=>({label:r,value:E})),k=c.selectAll(".legend").data(N).enter().append("g").attr("class","legend").attr("transform",(r,E)=>{const O=n+l,Y=O*N.length/2,Z=12*n,q=E*O-Y;return"translate("+Z+","+q+")"});k.append("rect").attr("width",n).attr("height",n).style("fill",r=>b(r.label)).style("stroke",r=>b(r.label)),k.append("text").attr("x",n+l).attr("y",n-l).text(r=>o.getShowData()?`${r.label} [${r.value}]`:r.label);const U=Math.max(...k.selectAll("text").nodes().map(r=>r?.getBoundingClientRect().width??0)),X=h+e+n+l+U,G=V.node()?.getBoundingClientRect().width??0,j=h/2-G/2,K=h/2+G/2,P=Math.min(0,j),B=Math.max(X,K)-P;v.attr("viewBox",`${P} 0 ${B} ${g}`),lt(v,g,B,s.useMaxWidth)},"draw"),Rt={draw:Et},jt={parser:Tt,db:_,renderer:Rt,styles:bt};export{jt as diagram};
