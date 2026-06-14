import{F as e,S as t,et as n,it as r,u as i,y as a}from"./runtime-core.esm-bundler-BT67_LR7.js";import{$ as o,Kt as s,Ot as c,X as l,cn as u,dn as d,en as f,et as p,fn as m,jt as h,pn as g,q as _,rn as v,sn as y,un as b,vt as x,wt as S,yt as C}from"./index-CKr6UCSb.js";var w={closeIconSizeTiny:`12px`,closeIconSizeSmall:`12px`,closeIconSizeMedium:`14px`,closeIconSizeLarge:`14px`,closeSizeTiny:`16px`,closeSizeSmall:`16px`,closeSizeMedium:`18px`,closeSizeLarge:`18px`,padding:`0 7px`,closeMargin:`0 0 0 4px`};function T(e){let{textColor2:t,primaryColorHover:n,primaryColorPressed:r,primaryColor:i,infoColor:a,successColor:o,warningColor:s,errorColor:c,baseColor:l,borderColor:u,opacityDisabled:d,tagColor:p,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,borderRadiusSmall:_,fontSizeMini:v,fontSizeTiny:y,fontSizeSmall:b,fontSizeMedium:x,heightMini:S,heightTiny:C,heightSmall:T,heightMedium:E,closeColorHover:D,closeColorPressed:O,buttonColor2Hover:k,buttonColor2Pressed:A,fontWeightStrong:j}=e;return Object.assign(Object.assign({},w),{closeBorderRadius:_,heightTiny:S,heightSmall:C,heightMedium:T,heightLarge:E,borderRadius:_,opacityDisabled:d,fontSizeTiny:v,fontSizeSmall:y,fontSizeMedium:b,fontSizeLarge:x,fontWeightStrong:j,textColorCheckable:t,textColorHoverCheckable:t,textColorPressedCheckable:t,textColorChecked:l,colorCheckable:`#0000`,colorHoverCheckable:k,colorPressedCheckable:A,colorChecked:i,colorCheckedHover:n,colorCheckedPressed:r,border:`1px solid ${u}`,textColor:t,color:p,colorBordered:`rgb(250, 250, 252)`,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,closeColorHover:D,closeColorPressed:O,borderPrimary:`1px solid ${f(i,{alpha:.3})}`,textColorPrimary:i,colorPrimary:f(i,{alpha:.12}),colorBorderedPrimary:f(i,{alpha:.1}),closeIconColorPrimary:i,closeIconColorHoverPrimary:i,closeIconColorPressedPrimary:i,closeColorHoverPrimary:f(i,{alpha:.12}),closeColorPressedPrimary:f(i,{alpha:.18}),borderInfo:`1px solid ${f(a,{alpha:.3})}`,textColorInfo:a,colorInfo:f(a,{alpha:.12}),colorBorderedInfo:f(a,{alpha:.1}),closeIconColorInfo:a,closeIconColorHoverInfo:a,closeIconColorPressedInfo:a,closeColorHoverInfo:f(a,{alpha:.12}),closeColorPressedInfo:f(a,{alpha:.18}),borderSuccess:`1px solid ${f(o,{alpha:.3})}`,textColorSuccess:o,colorSuccess:f(o,{alpha:.12}),colorBorderedSuccess:f(o,{alpha:.1}),closeIconColorSuccess:o,closeIconColorHoverSuccess:o,closeIconColorPressedSuccess:o,closeColorHoverSuccess:f(o,{alpha:.12}),closeColorPressedSuccess:f(o,{alpha:.18}),borderWarning:`1px solid ${f(s,{alpha:.35})}`,textColorWarning:s,colorWarning:f(s,{alpha:.15}),colorBorderedWarning:f(s,{alpha:.12}),closeIconColorWarning:s,closeIconColorHoverWarning:s,closeIconColorPressedWarning:s,closeColorHoverWarning:f(s,{alpha:.12}),closeColorPressedWarning:f(s,{alpha:.18}),borderError:`1px solid ${f(c,{alpha:.23})}`,textColorError:c,colorError:f(c,{alpha:.1}),colorBorderedError:f(c,{alpha:.08}),closeIconColorError:c,closeIconColorHoverError:c,closeIconColorPressedError:c,closeColorHoverError:f(c,{alpha:.12}),closeColorPressedError:f(c,{alpha:.18})})}var E={name:`Tag`,common:_,self:T},D={color:Object,type:{type:String,default:`default`},round:Boolean,size:{type:String,default:`medium`},closable:Boolean,disabled:{type:Boolean,default:void 0}},O=u(`tag`,`
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
`,[d(`strong`,`
 font-weight: var(--n-font-weight-strong);
 `),b(`border`,`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),b(`icon`,`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),b(`avatar`,`
 display: flex;
 margin: 0 6px 0 0;
 `),b(`close`,`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),d(`round`,`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[b(`icon`,`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),b(`avatar`,`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),d(`closable`,`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),d(`icon, avatar`,[d(`round`,`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),d(`disabled`,`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),d(`checkable`,`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[m(`disabled`,[y(`&:hover`,`background-color: var(--n-color-hover-checkable);`,[m(`checked`,`color: var(--n-text-color-hover-checkable);`)]),y(`&:active`,`background-color: var(--n-color-pressed-checkable);`,[m(`checked`,`color: var(--n-text-color-pressed-checkable);`)])]),d(`checked`,`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[m(`disabled`,[y(`&:hover`,`background-color: var(--n-color-checked-hover);`),y(`&:active`,`background-color: var(--n-color-checked-pressed);`)])])])]),k=Object.assign(Object.assign(Object.assign({},o.props),D),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),A=s(`n-tag`),j=a({name:`Tag`,props:k,slots:Object,setup(t){let a=n(null),{mergedBorderedRef:s,mergedClsPrefixRef:l,inlineThemeDisabled:u,mergedRtlRef:d}=C(t),f=o(`Tag`,`-tag`,O,E,t,l);e(A,{roundRef:r(t,`round`)});function m(){if(!t.disabled&&t.checkable){let{checked:e,onCheckedChange:n,onUpdateChecked:r,"onUpdate:checked":i}=t;r&&r(!e),i&&i(!e),n&&n(!e)}}function _(e){if(t.triggerClickOnClose||e.stopPropagation(),!t.disabled){let{onClose:n}=t;n&&c(n,e)}}let y={setTextContent(e){let{value:t}=a;t&&(t.textContent=e)}},b=p(`Tag`,d,l),S=i(()=>{let{type:e,size:n,color:{color:r,textColor:i}={}}=t,{common:{cubicBezierEaseInOut:a},self:{padding:o,closeMargin:c,borderRadius:l,opacityDisabled:u,textColorCheckable:d,textColorHoverCheckable:p,textColorPressedCheckable:m,textColorChecked:h,colorCheckable:_,colorHoverCheckable:y,colorPressedCheckable:b,colorChecked:x,colorCheckedHover:S,colorCheckedPressed:C,closeBorderRadius:w,fontWeightStrong:T,[g(`colorBordered`,e)]:E,[g(`closeSize`,n)]:D,[g(`closeIconSize`,n)]:O,[g(`fontSize`,n)]:k,[g(`height`,n)]:A,[g(`color`,e)]:j,[g(`textColor`,e)]:M,[g(`border`,e)]:N,[g(`closeIconColor`,e)]:P,[g(`closeIconColorHover`,e)]:F,[g(`closeIconColorPressed`,e)]:I,[g(`closeColorHover`,e)]:L,[g(`closeColorPressed`,e)]:R}}=f.value,z=v(c);return{"--n-font-weight-strong":T,"--n-avatar-size-override":`calc(${A} - 8px)`,"--n-bezier":a,"--n-border-radius":l,"--n-border":N,"--n-close-icon-size":O,"--n-close-color-pressed":R,"--n-close-color-hover":L,"--n-close-border-radius":w,"--n-close-icon-color":P,"--n-close-icon-color-hover":F,"--n-close-icon-color-pressed":I,"--n-close-icon-color-disabled":P,"--n-close-margin-top":z.top,"--n-close-margin-right":z.right,"--n-close-margin-bottom":z.bottom,"--n-close-margin-left":z.left,"--n-close-size":D,"--n-color":r||(s.value?E:j),"--n-color-checkable":_,"--n-color-checked":x,"--n-color-checked-hover":S,"--n-color-checked-pressed":C,"--n-color-hover-checkable":y,"--n-color-pressed-checkable":b,"--n-font-size":k,"--n-height":A,"--n-opacity-disabled":u,"--n-padding":o,"--n-text-color":i||M,"--n-text-color-checkable":d,"--n-text-color-checked":h,"--n-text-color-hover-checkable":p,"--n-text-color-pressed-checkable":m}}),w=u?x(`tag`,i(()=>{let e=``,{type:n,size:r,color:{color:i,textColor:a}={}}=t;return e+=n[0],e+=r[0],i&&(e+=`a${h(i)}`),a&&(e+=`b${h(a)}`),s.value&&(e+=`c`),e}),S,t):void 0;return Object.assign(Object.assign({},y),{rtlEnabled:b,mergedClsPrefix:l,contentRef:a,mergedBordered:s,handleClick:m,handleCloseClick:_,cssVars:u?void 0:S,themeClass:w?.themeClass,onRender:w?.onRender})},render(){var e;let{mergedClsPrefix:n,rtlEnabled:r,closable:i,color:{borderColor:a}={},round:o,onRender:s,$slots:c}=this;s?.();let u=S(c.avatar,e=>e&&t(`div`,{class:`${n}-tag__avatar`},e)),d=S(c.icon,e=>e&&t(`div`,{class:`${n}-tag__icon`},e));return t(`div`,{class:[`${n}-tag`,this.themeClass,{[`${n}-tag--rtl`]:r,[`${n}-tag--strong`]:this.strong,[`${n}-tag--disabled`]:this.disabled,[`${n}-tag--checkable`]:this.checkable,[`${n}-tag--checked`]:this.checkable&&this.checked,[`${n}-tag--round`]:o,[`${n}-tag--avatar`]:u,[`${n}-tag--icon`]:d,[`${n}-tag--closable`]:i}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},d||u,t(`span`,{class:`${n}-tag__content`,ref:`contentRef`},(e=this.$slots).default?.call(e)),!this.checkable&&i?t(l,{clsPrefix:n,class:`${n}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:o,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?t(`div`,{class:`${n}-tag__border`,style:{borderColor:a}}):null)}});export{j as t};