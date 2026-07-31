import{$ as e,Jn as t,Qn as n,Xn as r,Zn as i,an as a,br as o,in as s,or as c,q as l,ur as u,vr as d}from"./index-CwUuHXzR.js";function f(e){let{textColor1:t,dividerColor:n,fontWeightStrong:r}=e;return{textColor:t,color:n,fontWeight:r}}var p={name:`Divider`,common:l,self:f},m=t(`divider`,`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[n(`vertical`,`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[n(`no-title`,`
 display: flex;
 align-items: center;
 `)]),r(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),i(`title-position-left`,[r(`line`,[i(`left`,{width:`28px`})])]),i(`title-position-right`,[r(`line`,[i(`right`,{width:`28px`})])]),i(`dashed`,[r(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),i(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),r(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),n(`dashed`,[r(`line`,{backgroundColor:`var(--n-color)`})]),i(`dashed`,[r(`line`,{borderColor:`var(--n-color)`})]),i(`vertical`,{backgroundColor:`var(--n-color)`})]),h=d({name:`Divider`,props:Object.assign(Object.assign({},e.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(t){let{mergedClsPrefixRef:n,inlineThemeDisabled:r}=a(t),i=e(`Divider`,`-divider`,m,p,t,n),o=u(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:r}}=i.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":r}}),c=r?s(`divider`,void 0,o,t):void 0;return{mergedClsPrefix:n,cssVars:r?void 0:o,themeClass:c?.themeClass,onRender:c?.onRender}},render(){var e;let{$slots:t,titlePlacement:n,vertical:r,dashed:i,cssVars:a,mergedClsPrefix:s}=this;return(e=this.onRender)==null||e.call(this),o(`div`,{role:`separator`,class:[`${s}-divider`,this.themeClass,{[`${s}-divider--vertical`]:r,[`${s}-divider--no-title`]:!t.default,[`${s}-divider--dashed`]:i,[`${s}-divider--title-position-${n}`]:t.default&&n}],style:a},r?null:o(`div`,{class:`${s}-divider__line ${s}-divider__line--left`}),!r&&t.default?o(c,null,o(`div`,{class:`${s}-divider__title`},this.$slots),o(`div`,{class:`${s}-divider__line ${s}-divider__line--right`})):null)}});export{h as t};