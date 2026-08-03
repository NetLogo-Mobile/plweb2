import{$n as e,J as t,Qn as n,Yn as r,Zn as i,an as a,dr as o,et as s,on as c,sr as l,xr as u,yr as d}from"./index-CG2xCV1w.js";function f(e){let{textColor1:t,dividerColor:n,fontWeightStrong:r}=e;return{textColor:t,color:n,fontWeight:r}}var p={name:`Divider`,common:t,self:f},m=r(`divider`,`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[e(`vertical`,`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[e(`no-title`,`
 display: flex;
 align-items: center;
 `)]),i(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),n(`title-position-left`,[i(`line`,[n(`left`,{width:`28px`})])]),n(`title-position-right`,[i(`line`,[n(`right`,{width:`28px`})])]),n(`dashed`,[i(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),n(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),i(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),e(`dashed`,[i(`line`,{backgroundColor:`var(--n-color)`})]),n(`dashed`,[i(`line`,{borderColor:`var(--n-color)`})]),n(`vertical`,{backgroundColor:`var(--n-color)`})]),h=d({name:`Divider`,props:Object.assign(Object.assign({},s.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:n}=c(e),r=s(`Divider`,`-divider`,m,p,e,t),i=o(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:i}}=r.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":i}}),l=n?a(`divider`,void 0,i,e):void 0;return{mergedClsPrefix:t,cssVars:n?void 0:i,themeClass:l?.themeClass,onRender:l?.onRender}},render(){var e;let{$slots:t,titlePlacement:n,vertical:r,dashed:i,cssVars:a,mergedClsPrefix:o}=this;return(e=this.onRender)==null||e.call(this),u(`div`,{role:`separator`,class:[`${o}-divider`,this.themeClass,{[`${o}-divider--vertical`]:r,[`${o}-divider--no-title`]:!t.default,[`${o}-divider--dashed`]:i,[`${o}-divider--title-position-${n}`]:t.default&&n}],style:a},r?null:u(`div`,{class:`${o}-divider__line ${o}-divider__line--left`}),!r&&t.default?u(l,null,u(`div`,{class:`${o}-divider__title`},this.$slots),u(`div`,{class:`${o}-divider__line ${o}-divider__line--right`})):null)}});export{h as t};