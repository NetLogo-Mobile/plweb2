import{$n as e,J as t,Jn as n,Kr as r,Mr as i,Nn as a,Qn as o,Vn as s,Wn as c,Wr as l,Yn as u,Z as d,Zn as f,an as p,dn as m,dr as h,er as g,et as _,hn as v,on as y,tt as b,vn as x,xr as S,yr as C}from"./index-CM1FbWNZ.js";var w={closeIconSizeTiny:`12px`,closeIconSizeSmall:`12px`,closeIconSizeMedium:`14px`,closeIconSizeLarge:`14px`,closeSizeTiny:`16px`,closeSizeSmall:`16px`,closeSizeMedium:`18px`,closeSizeLarge:`18px`,padding:`0 7px`,closeMargin:`0 0 0 4px`};function T(e){let{textColor2:t,primaryColorHover:n,primaryColorPressed:r,primaryColor:i,infoColor:a,successColor:o,warningColor:c,errorColor:l,baseColor:u,borderColor:d,opacityDisabled:f,tagColor:p,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,borderRadiusSmall:_,fontSizeMini:v,fontSizeTiny:y,fontSizeSmall:b,fontSizeMedium:x,heightMini:S,heightTiny:C,heightSmall:T,heightMedium:E,closeColorHover:D,closeColorPressed:O,buttonColor2Hover:k,buttonColor2Pressed:A,fontWeightStrong:j}=e;return Object.assign(Object.assign({},w),{closeBorderRadius:_,heightTiny:S,heightSmall:C,heightMedium:T,heightLarge:E,borderRadius:_,opacityDisabled:f,fontSizeTiny:v,fontSizeSmall:y,fontSizeMedium:b,fontSizeLarge:x,fontWeightStrong:j,textColorCheckable:t,textColorHoverCheckable:t,textColorPressedCheckable:t,textColorChecked:u,colorCheckable:`#0000`,colorHoverCheckable:k,colorPressedCheckable:A,colorChecked:i,colorCheckedHover:n,colorCheckedPressed:r,border:`1px solid ${d}`,textColor:t,color:p,colorBordered:`rgb(250, 250, 252)`,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,closeColorHover:D,closeColorPressed:O,borderPrimary:`1px solid ${s(i,{alpha:.3})}`,textColorPrimary:i,colorPrimary:s(i,{alpha:.12}),colorBorderedPrimary:s(i,{alpha:.1}),closeIconColorPrimary:i,closeIconColorHoverPrimary:i,closeIconColorPressedPrimary:i,closeColorHoverPrimary:s(i,{alpha:.12}),closeColorPressedPrimary:s(i,{alpha:.18}),borderInfo:`1px solid ${s(a,{alpha:.3})}`,textColorInfo:a,colorInfo:s(a,{alpha:.12}),colorBorderedInfo:s(a,{alpha:.1}),closeIconColorInfo:a,closeIconColorHoverInfo:a,closeIconColorPressedInfo:a,closeColorHoverInfo:s(a,{alpha:.12}),closeColorPressedInfo:s(a,{alpha:.18}),borderSuccess:`1px solid ${s(o,{alpha:.3})}`,textColorSuccess:o,colorSuccess:s(o,{alpha:.12}),colorBorderedSuccess:s(o,{alpha:.1}),closeIconColorSuccess:o,closeIconColorHoverSuccess:o,closeIconColorPressedSuccess:o,closeColorHoverSuccess:s(o,{alpha:.12}),closeColorPressedSuccess:s(o,{alpha:.18}),borderWarning:`1px solid ${s(c,{alpha:.35})}`,textColorWarning:c,colorWarning:s(c,{alpha:.15}),colorBorderedWarning:s(c,{alpha:.12}),closeIconColorWarning:c,closeIconColorHoverWarning:c,closeIconColorPressedWarning:c,closeColorHoverWarning:s(c,{alpha:.12}),closeColorPressedWarning:s(c,{alpha:.18}),borderError:`1px solid ${s(l,{alpha:.23})}`,textColorError:l,colorError:s(l,{alpha:.1}),colorBorderedError:s(l,{alpha:.08}),closeIconColorError:l,closeIconColorHoverError:l,closeIconColorPressedError:l,closeColorHoverError:s(l,{alpha:.12}),closeColorPressedError:s(l,{alpha:.18})})}var E={name:`Tag`,common:t,self:T},D={color:Object,type:{type:String,default:`default`},round:Boolean,size:{type:String,default:`medium`},closable:Boolean,disabled:{type:Boolean,default:void 0}},O=u(`tag`,`
 --n-close-margin: var(--n-close-margin-top) var(--n-close-margin-right) var(--n-close-margin-bottom) var(--n-close-margin-left);
 white-space: nowrap;
 position: relative;
 box-sizing: border-box;
 cursor: default;
 display: inline-flex;
 align-items: center;
 flex-wrap: nowrap;
 padding: var(--n-padding);
 border-radius: var(--n-border-radius);
 color: var(--n-text-color);
 background-color: var(--n-color);
 transition: 
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 line-height: 1;
 height: var(--n-height);
 font-size: var(--n-font-size);
`,[o(`strong`,`
 font-weight: var(--n-font-weight-strong);
 `),f(`border`,`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),f(`icon`,`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),f(`avatar`,`
 display: flex;
 margin: 0 6px 0 0;
 `),f(`close`,`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),o(`round`,`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[f(`icon`,`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),f(`avatar`,`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),o(`closable`,`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),o(`icon, avatar`,[o(`round`,`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),o(`disabled`,`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),o(`checkable`,`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[e(`disabled`,[n(`&:hover`,`background-color: var(--n-color-hover-checkable);`,[e(`checked`,`color: var(--n-text-color-hover-checkable);`)]),n(`&:active`,`background-color: var(--n-color-pressed-checkable);`,[e(`checked`,`color: var(--n-text-color-pressed-checkable);`)])]),o(`checked`,`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[e(`disabled`,[n(`&:hover`,`background-color: var(--n-color-checked-hover);`),n(`&:active`,`background-color: var(--n-color-checked-pressed);`)])])])]),k=Object.assign(Object.assign(Object.assign({},_.props),D),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),A=a(`n-tag`),j=C({name:`Tag`,props:k,slots:Object,setup(e){let t=l(null),{mergedBorderedRef:n,mergedClsPrefixRef:a,inlineThemeDisabled:o,mergedRtlRef:s}=y(e),u=_(`Tag`,`-tag`,O,E,e,a);i(A,{roundRef:r(e,`round`)});function d(){if(!e.disabled&&e.checkable){let{checked:t,onCheckedChange:n,onUpdateChecked:r,"onUpdate:checked":i}=e;r&&r(!t),i&&i(!t),n&&n(!t)}}function f(t){if(e.triggerClickOnClose||t.stopPropagation(),!e.disabled){let{onClose:n}=e;n&&v(n,t)}}let m={setTextContent(e){let{value:n}=t;n&&(n.textContent=e)}},S=b(`Tag`,s,a),C=h(()=>{let{type:t,size:r,color:{color:i,textColor:a}={}}=e,{common:{cubicBezierEaseInOut:o},self:{padding:s,closeMargin:l,borderRadius:d,opacityDisabled:f,textColorCheckable:p,textColorHoverCheckable:m,textColorPressedCheckable:h,textColorChecked:_,colorCheckable:v,colorHoverCheckable:y,colorPressedCheckable:b,colorChecked:x,colorCheckedHover:S,colorCheckedPressed:C,closeBorderRadius:w,fontWeightStrong:T,[g(`colorBordered`,t)]:E,[g(`closeSize`,r)]:D,[g(`closeIconSize`,r)]:O,[g(`fontSize`,r)]:k,[g(`height`,r)]:A,[g(`color`,t)]:j,[g(`textColor`,t)]:M,[g(`border`,t)]:N,[g(`closeIconColor`,t)]:P,[g(`closeIconColorHover`,t)]:F,[g(`closeIconColorPressed`,t)]:I,[g(`closeColorHover`,t)]:L,[g(`closeColorPressed`,t)]:R}}=u.value,z=c(l);return{"--n-font-weight-strong":T,"--n-avatar-size-override":`calc(${A} - 8px)`,"--n-bezier":o,"--n-border-radius":d,"--n-border":N,"--n-close-icon-size":O,"--n-close-color-pressed":R,"--n-close-color-hover":L,"--n-close-border-radius":w,"--n-close-icon-color":P,"--n-close-icon-color-hover":F,"--n-close-icon-color-pressed":I,"--n-close-icon-color-disabled":P,"--n-close-margin-top":z.top,"--n-close-margin-right":z.right,"--n-close-margin-bottom":z.bottom,"--n-close-margin-left":z.left,"--n-close-size":D,"--n-color":i||(n.value?E:j),"--n-color-checkable":v,"--n-color-checked":x,"--n-color-checked-hover":S,"--n-color-checked-pressed":C,"--n-color-hover-checkable":y,"--n-color-pressed-checkable":b,"--n-font-size":k,"--n-height":A,"--n-opacity-disabled":f,"--n-padding":s,"--n-text-color":a||M,"--n-text-color-checkable":p,"--n-text-color-checked":_,"--n-text-color-hover-checkable":m,"--n-text-color-pressed-checkable":h}}),w=o?p(`tag`,h(()=>{let t=``,{type:r,size:i,color:{color:a,textColor:o}={}}=e;return t+=r[0],t+=i[0],a&&(t+=`a${x(a)}`),o&&(t+=`b${x(o)}`),n.value&&(t+=`c`),t}),C,e):void 0;return Object.assign(Object.assign({},m),{rtlEnabled:S,mergedClsPrefix:a,contentRef:t,mergedBordered:n,handleClick:d,handleCloseClick:f,cssVars:o?void 0:C,themeClass:w?.themeClass,onRender:w?.onRender})},render(){var e;let{mergedClsPrefix:t,rtlEnabled:n,closable:r,color:{borderColor:i}={},round:a,onRender:o,$slots:s}=this;o?.();let c=m(s.avatar,e=>e&&S(`div`,{class:`${t}-tag__avatar`},e)),l=m(s.icon,e=>e&&S(`div`,{class:`${t}-tag__icon`},e));return S(`div`,{class:[`${t}-tag`,this.themeClass,{[`${t}-tag--rtl`]:n,[`${t}-tag--strong`]:this.strong,[`${t}-tag--disabled`]:this.disabled,[`${t}-tag--checkable`]:this.checkable,[`${t}-tag--checked`]:this.checkable&&this.checked,[`${t}-tag--round`]:a,[`${t}-tag--avatar`]:c,[`${t}-tag--icon`]:l,[`${t}-tag--closable`]:r}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},l||c,S(`span`,{class:`${t}-tag__content`,ref:`contentRef`},(e=this.$slots).default?.call(e)),!this.checkable&&r?S(d,{clsPrefix:t,class:`${t}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:a,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?S(`div`,{class:`${t}-tag__border`,style:{borderColor:i}}):null)}});export{j as t};