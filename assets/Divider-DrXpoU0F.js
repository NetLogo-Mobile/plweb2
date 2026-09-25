import{$n as e,Cr as t,X as n,Zn as r,cn as i,er as a,lr as o,nt as s,pr as c,sn as l,tr as u,xr as d}from"./index-DwvZJlvY.js";function f(e){let{textColor1:t,dividerColor:n,fontWeightStrong:r}=e;return{textColor:t,color:n,fontWeight:r}}var p={name:`Divider`,common:n,self:f},m=r(`divider`,`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[u(`vertical`,`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[u(`no-title`,`
 display: flex;
 align-items: center;
 `)]),e(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),a(`title-position-left`,[e(`line`,[a(`left`,{width:`28px`})])]),a(`title-position-right`,[e(`line`,[a(`right`,{width:`28px`})])]),a(`dashed`,[e(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),a(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),e(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),u(`dashed`,[e(`line`,{backgroundColor:`var(--n-color)`})]),a(`dashed`,[e(`line`,{borderColor:`var(--n-color)`})]),a(`vertical`,{backgroundColor:`var(--n-color)`})]),h=d({name:`Divider`,props:Object.assign(Object.assign({},s.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:n}=i(e),r=s(`Divider`,`-divider`,m,p,e,t),a=c(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:i}}=r.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":i}}),o=n?l(`divider`,void 0,a,e):void 0;return{mergedClsPrefix:t,cssVars:n?void 0:a,themeClass:o?.themeClass,onRender:o?.onRender}},render(){var e;let{$slots:n,titlePlacement:r,vertical:i,dashed:a,cssVars:s,mergedClsPrefix:c}=this;return(e=this.onRender)==null||e.call(this),t(`div`,{role:`separator`,class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:i,[`${c}-divider--no-title`]:!n.default,[`${c}-divider--dashed`]:a,[`${c}-divider--title-position-${r}`]:n.default&&r}],style:s},i?null:t(`div`,{class:`${c}-divider__line ${c}-divider__line--left`}),!i&&n.default?t(o,null,t(`div`,{class:`${c}-divider__title`},this.$slots),t(`div`,{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});export{h as t};