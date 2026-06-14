import{S as e,i as t,u as n,y as r}from"./runtime-core.esm-bundler-BT67_LR7.js";import{$ as i,cn as a,dn as o,fn as s,q as c,un as l,vt as u,yt as d}from"./index-CKr6UCSb.js";function f(e){let{textColor1:t,dividerColor:n,fontWeightStrong:r}=e;return{textColor:t,color:n,fontWeight:r}}var p={name:`Divider`,common:c,self:f},m=a(`divider`,`
 position: relative;
 display: flex;
 width: 100%;
 box-sizing: border-box;
 font-size: 16px;
 color: var(--n-text-color);
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
`,[s(`vertical`,`
 margin-top: 24px;
 margin-bottom: 24px;
 `,[s(`no-title`,`
 display: flex;
 align-items: center;
 `)]),l(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),o(`title-position-left`,[l(`line`,[o(`left`,{width:`28px`})])]),o(`title-position-right`,[l(`line`,[o(`right`,{width:`28px`})])]),o(`dashed`,[l(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),o(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),l(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),s(`dashed`,[l(`line`,{backgroundColor:`var(--n-color)`})]),o(`dashed`,[l(`line`,{borderColor:`var(--n-color)`})]),o(`vertical`,{backgroundColor:`var(--n-color)`})]),h=r({name:`Divider`,props:Object.assign(Object.assign({},i.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:r}=d(e),a=i(`Divider`,`-divider`,m,p,e,t),o=n(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:r}}=a.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":r}}),s=r?u(`divider`,void 0,o,e):void 0;return{mergedClsPrefix:t,cssVars:r?void 0:o,themeClass:s?.themeClass,onRender:s?.onRender}},render(){var n;let{$slots:r,titlePlacement:i,vertical:a,dashed:o,cssVars:s,mergedClsPrefix:c}=this;return(n=this.onRender)==null||n.call(this),e(`div`,{role:`separator`,class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:a,[`${c}-divider--no-title`]:!r.default,[`${c}-divider--dashed`]:o,[`${c}-divider--title-position-${i}`]:r.default&&i}],style:s},a?null:e(`div`,{class:`${c}-divider__line ${c}-divider__line--left`}),!a&&r.default?e(t,null,e(`div`,{class:`${c}-divider__title`},this.$slots),e(`div`,{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});export{h as t};