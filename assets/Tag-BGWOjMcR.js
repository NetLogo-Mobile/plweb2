import{$ as e,$n as t,Cr as n,Fn as r,Jr as i,Kn as a,Kr as o,Pr as s,Un as c,X as l,Xn as u,Zn as d,_n as f,bn as p,cn as m,er as h,nr as g,nt as _,pn as v,pr as y,rt as b,sn as x,tr as S,xr as C}from"./index-DwvZJlvY.js";var w={closeIconSizeTiny:`12px`,closeIconSizeSmall:`12px`,closeIconSizeMedium:`14px`,closeIconSizeLarge:`14px`,closeSizeTiny:`16px`,closeSizeSmall:`16px`,closeSizeMedium:`18px`,closeSizeLarge:`18px`,padding:`0 7px`,closeMargin:`0 0 0 4px`};function T(e){let{textColor2:t,primaryColorHover:n,primaryColorPressed:r,primaryColor:i,infoColor:a,successColor:o,warningColor:s,errorColor:l,baseColor:u,borderColor:d,opacityDisabled:f,tagColor:p,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,borderRadiusSmall:_,fontSizeMini:v,fontSizeTiny:y,fontSizeSmall:b,fontSizeMedium:x,heightMini:S,heightTiny:C,heightSmall:T,heightMedium:E,closeColorHover:D,closeColorPressed:O,buttonColor2Hover:k,buttonColor2Pressed:A,fontWeightStrong:j}=e;return Object.assign(Object.assign({},w),{closeBorderRadius:_,heightTiny:S,heightSmall:C,heightMedium:T,heightLarge:E,borderRadius:_,opacityDisabled:f,fontSizeTiny:v,fontSizeSmall:y,fontSizeMedium:b,fontSizeLarge:x,fontWeightStrong:j,textColorCheckable:t,textColorHoverCheckable:t,textColorPressedCheckable:t,textColorChecked:u,colorCheckable:`#0000`,colorHoverCheckable:k,colorPressedCheckable:A,colorChecked:i,colorCheckedHover:n,colorCheckedPressed:r,border:`1px solid ${d}`,textColor:t,color:p,colorBordered:`rgb(250, 250, 252)`,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,closeColorHover:D,closeColorPressed:O,borderPrimary:`1px solid ${c(i,{alpha:.3})}`,textColorPrimary:i,colorPrimary:c(i,{alpha:.12}),colorBorderedPrimary:c(i,{alpha:.1}),closeIconColorPrimary:i,closeIconColorHoverPrimary:i,closeIconColorPressedPrimary:i,closeColorHoverPrimary:c(i,{alpha:.12}),closeColorPressedPrimary:c(i,{alpha:.18}),borderInfo:`1px solid ${c(a,{alpha:.3})}`,textColorInfo:a,colorInfo:c(a,{alpha:.12}),colorBorderedInfo:c(a,{alpha:.1}),closeIconColorInfo:a,closeIconColorHoverInfo:a,closeIconColorPressedInfo:a,closeColorHoverInfo:c(a,{alpha:.12}),closeColorPressedInfo:c(a,{alpha:.18}),borderSuccess:`1px solid ${c(o,{alpha:.3})}`,textColorSuccess:o,colorSuccess:c(o,{alpha:.12}),colorBorderedSuccess:c(o,{alpha:.1}),closeIconColorSuccess:o,closeIconColorHoverSuccess:o,closeIconColorPressedSuccess:o,closeColorHoverSuccess:c(o,{alpha:.12}),closeColorPressedSuccess:c(o,{alpha:.18}),borderWarning:`1px solid ${c(s,{alpha:.35})}`,textColorWarning:s,colorWarning:c(s,{alpha:.15}),colorBorderedWarning:c(s,{alpha:.12}),closeIconColorWarning:s,closeIconColorHoverWarning:s,closeIconColorPressedWarning:s,closeColorHoverWarning:c(s,{alpha:.12}),closeColorPressedWarning:c(s,{alpha:.18}),borderError:`1px solid ${c(l,{alpha:.23})}`,textColorError:l,colorError:c(l,{alpha:.1}),colorBorderedError:c(l,{alpha:.08}),closeIconColorError:l,closeIconColorHoverError:l,closeIconColorPressedError:l,closeColorHoverError:c(l,{alpha:.12}),closeColorPressedError:c(l,{alpha:.18})})}var E={name:`Tag`,common:l,self:T},D={color:Object,type:{type:String,default:`default`},round:Boolean,size:{type:String,default:`medium`},closable:Boolean,disabled:{type:Boolean,default:void 0}},O=d(`tag`,`
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
`,[h(`strong`,`
 font-weight: var(--n-font-weight-strong);
 `),t(`border`,`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),t(`icon`,`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),t(`avatar`,`
 display: flex;
 margin: 0 6px 0 0;
 `),t(`close`,`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),h(`round`,`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[t(`icon`,`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),t(`avatar`,`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),h(`closable`,`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),h(`icon, avatar`,[h(`round`,`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),h(`disabled`,`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),h(`checkable`,`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[S(`disabled`,[u(`&:hover`,`background-color: var(--n-color-hover-checkable);`,[S(`checked`,`color: var(--n-text-color-hover-checkable);`)]),u(`&:active`,`background-color: var(--n-color-pressed-checkable);`,[S(`checked`,`color: var(--n-text-color-pressed-checkable);`)])]),h(`checked`,`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[S(`disabled`,[u(`&:hover`,`background-color: var(--n-color-checked-hover);`),u(`&:active`,`background-color: var(--n-color-checked-pressed);`)])])])]),k=Object.assign(Object.assign(Object.assign({},_.props),D),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),A=r(`n-tag`),j=C({name:`Tag`,props:k,slots:Object,setup(e){let t=o(null),{mergedBorderedRef:n,mergedClsPrefixRef:r,inlineThemeDisabled:c,mergedRtlRef:l}=m(e),u=_(`Tag`,`-tag`,O,E,e,r);s(A,{roundRef:i(e,`round`)});function d(){if(!e.disabled&&e.checkable){let{checked:t,onCheckedChange:n,onUpdateChecked:r,"onUpdate:checked":i}=e;r&&r(!t),i&&i(!t),n&&n(!t)}}function h(t){if(e.triggerClickOnClose||t.stopPropagation(),!e.disabled){let{onClose:n}=e;n&&f(n,t)}}let v={setTextContent(e){let{value:n}=t;n&&(n.textContent=e)}},S=b(`Tag`,l,r),C=y(()=>{let{type:t,size:r,color:{color:i,textColor:o}={}}=e,{common:{cubicBezierEaseInOut:s},self:{padding:c,closeMargin:l,borderRadius:d,opacityDisabled:f,textColorCheckable:p,textColorHoverCheckable:m,textColorPressedCheckable:h,textColorChecked:_,colorCheckable:v,colorHoverCheckable:y,colorPressedCheckable:b,colorChecked:x,colorCheckedHover:S,colorCheckedPressed:C,closeBorderRadius:w,fontWeightStrong:T,[g(`colorBordered`,t)]:E,[g(`closeSize`,r)]:D,[g(`closeIconSize`,r)]:O,[g(`fontSize`,r)]:k,[g(`height`,r)]:A,[g(`color`,t)]:j,[g(`textColor`,t)]:M,[g(`border`,t)]:N,[g(`closeIconColor`,t)]:P,[g(`closeIconColorHover`,t)]:F,[g(`closeIconColorPressed`,t)]:I,[g(`closeColorHover`,t)]:L,[g(`closeColorPressed`,t)]:R}}=u.value,z=a(l);return{"--n-font-weight-strong":T,"--n-avatar-size-override":`calc(${A} - 8px)`,"--n-bezier":s,"--n-border-radius":d,"--n-border":N,"--n-close-icon-size":O,"--n-close-color-pressed":R,"--n-close-color-hover":L,"--n-close-border-radius":w,"--n-close-icon-color":P,"--n-close-icon-color-hover":F,"--n-close-icon-color-pressed":I,"--n-close-icon-color-disabled":P,"--n-close-margin-top":z.top,"--n-close-margin-right":z.right,"--n-close-margin-bottom":z.bottom,"--n-close-margin-left":z.left,"--n-close-size":D,"--n-color":i||(n.value?E:j),"--n-color-checkable":v,"--n-color-checked":x,"--n-color-checked-hover":S,"--n-color-checked-pressed":C,"--n-color-hover-checkable":y,"--n-color-pressed-checkable":b,"--n-font-size":k,"--n-height":A,"--n-opacity-disabled":f,"--n-padding":c,"--n-text-color":o||M,"--n-text-color-checkable":p,"--n-text-color-checked":_,"--n-text-color-hover-checkable":m,"--n-text-color-pressed-checkable":h}}),w=c?x(`tag`,y(()=>{let t=``,{type:r,size:i,color:{color:a,textColor:o}={}}=e;return t+=r[0],t+=i[0],a&&(t+=`a${p(a)}`),o&&(t+=`b${p(o)}`),n.value&&(t+=`c`),t}),C,e):void 0;return Object.assign(Object.assign({},v),{rtlEnabled:S,mergedClsPrefix:r,contentRef:t,mergedBordered:n,handleClick:d,handleCloseClick:h,cssVars:c?void 0:C,themeClass:w?.themeClass,onRender:w?.onRender})},render(){var t;let{mergedClsPrefix:r,rtlEnabled:i,closable:a,color:{borderColor:o}={},round:s,onRender:c,$slots:l}=this;c?.();let u=v(l.avatar,e=>e&&n(`div`,{class:`${r}-tag__avatar`},e)),d=v(l.icon,e=>e&&n(`div`,{class:`${r}-tag__icon`},e));return n(`div`,{class:[`${r}-tag`,this.themeClass,{[`${r}-tag--rtl`]:i,[`${r}-tag--strong`]:this.strong,[`${r}-tag--disabled`]:this.disabled,[`${r}-tag--checkable`]:this.checkable,[`${r}-tag--checked`]:this.checkable&&this.checked,[`${r}-tag--round`]:s,[`${r}-tag--avatar`]:u,[`${r}-tag--icon`]:d,[`${r}-tag--closable`]:a}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},d||u,n(`span`,{class:`${r}-tag__content`,ref:`contentRef`},(t=this.$slots).default?.call(t)),!this.checkable&&a?n(e,{clsPrefix:r,class:`${r}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:s,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?n(`div`,{class:`${r}-tag__border`,style:{borderColor:o}}):null)}});export{j as t};