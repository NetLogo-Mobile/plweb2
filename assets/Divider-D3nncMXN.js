import{$n as e,Qn as t,Sr as n,Xn as r,Y as i,br as a,cr as o,er as s,fr as c,on as l,sn as u,tt as d}from"./index-BLbeSdDS.js";function f(e){let{textColor1:t,dividerColor:n,fontWeightStrong:r}=e;return{textColor:t,color:n,fontWeight:r}}var p={name:`Divider`,common:i,self:f},m=r(`divider`,`
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
 `)]),t(`title`,`
 display: flex;
 align-items: center;
 margin-left: 12px;
 margin-right: 12px;
 white-space: nowrap;
 font-weight: var(--n-font-weight);
 `),e(`title-position-left`,[t(`line`,[e(`left`,{width:`28px`})])]),e(`title-position-right`,[t(`line`,[e(`right`,{width:`28px`})])]),e(`dashed`,[t(`line`,`
 background-color: #0000;
 height: 0px;
 width: 100%;
 border-style: dashed;
 border-width: 1px 0 0;
 `)]),e(`vertical`,`
 display: inline-block;
 height: 1em;
 margin: 0 8px;
 vertical-align: middle;
 width: 1px;
 `),t(`line`,`
 border: none;
 transition: background-color .3s var(--n-bezier), border-color .3s var(--n-bezier);
 height: 1px;
 width: 100%;
 margin: 0;
 `),s(`dashed`,[t(`line`,{backgroundColor:`var(--n-color)`})]),e(`dashed`,[t(`line`,{borderColor:`var(--n-color)`})]),e(`vertical`,{backgroundColor:`var(--n-color)`})]),h=a({name:`Divider`,props:Object.assign(Object.assign({},d.props),{titlePlacement:{type:String,default:`center`},dashed:Boolean,vertical:Boolean}),setup(e){let{mergedClsPrefixRef:t,inlineThemeDisabled:n}=u(e),r=d(`Divider`,`-divider`,m,p,e,t),i=c(()=>{let{common:{cubicBezierEaseInOut:e},self:{color:t,textColor:n,fontWeight:i}}=r.value;return{"--n-bezier":e,"--n-color":t,"--n-text-color":n,"--n-font-weight":i}}),a=n?l(`divider`,void 0,i,e):void 0;return{mergedClsPrefix:t,cssVars:n?void 0:i,themeClass:a?.themeClass,onRender:a?.onRender}},render(){var e;let{$slots:t,titlePlacement:r,vertical:i,dashed:a,cssVars:s,mergedClsPrefix:c}=this;return(e=this.onRender)==null||e.call(this),n(`div`,{role:`separator`,class:[`${c}-divider`,this.themeClass,{[`${c}-divider--vertical`]:i,[`${c}-divider--no-title`]:!t.default,[`${c}-divider--dashed`]:a,[`${c}-divider--title-position-${r}`]:t.default&&r}],style:s},i?null:n(`div`,{class:`${c}-divider__line ${c}-divider__line--left`}),!i&&t.default?n(o,null,n(`div`,{class:`${c}-divider__title`},this.$slots),n(`div`,{class:`${c}-divider__line ${c}-divider__line--right`})):null)}});export{h as t};