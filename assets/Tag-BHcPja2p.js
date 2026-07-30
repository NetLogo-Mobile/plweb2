import{$ as e,$n as t,Bn as n,Gr as r,Jn as i,Mn as a,Qn as o,Un as s,Ur as c,X as l,Xn as u,Zn as d,_n as f,an as p,br as m,et as h,in as g,jr as _,mn as v,q as y,qn as b,un as x,ur as S,vr as C}from"./index-Cj2KKi7_.js";var w={closeIconSizeTiny:`12px`,closeIconSizeSmall:`12px`,closeIconSizeMedium:`14px`,closeIconSizeLarge:`14px`,closeSizeTiny:`16px`,closeSizeSmall:`16px`,closeSizeMedium:`18px`,closeSizeLarge:`18px`,padding:`0 7px`,closeMargin:`0 0 0 4px`};function T(e){let{textColor2:t,primaryColorHover:r,primaryColorPressed:i,primaryColor:a,infoColor:o,successColor:s,warningColor:c,errorColor:l,baseColor:u,borderColor:d,opacityDisabled:f,tagColor:p,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,borderRadiusSmall:_,fontSizeMini:v,fontSizeTiny:y,fontSizeSmall:b,fontSizeMedium:x,heightMini:S,heightTiny:C,heightSmall:T,heightMedium:E,closeColorHover:D,closeColorPressed:O,buttonColor2Hover:k,buttonColor2Pressed:A,fontWeightStrong:j}=e;return Object.assign(Object.assign({},w),{closeBorderRadius:_,heightTiny:S,heightSmall:C,heightMedium:T,heightLarge:E,borderRadius:_,opacityDisabled:f,fontSizeTiny:v,fontSizeSmall:y,fontSizeMedium:b,fontSizeLarge:x,fontWeightStrong:j,textColorCheckable:t,textColorHoverCheckable:t,textColorPressedCheckable:t,textColorChecked:u,colorCheckable:`#0000`,colorHoverCheckable:k,colorPressedCheckable:A,colorChecked:a,colorCheckedHover:r,colorCheckedPressed:i,border:`1px solid ${d}`,textColor:t,color:p,colorBordered:`rgb(250, 250, 252)`,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,closeColorHover:D,closeColorPressed:O,borderPrimary:`1px solid ${n(a,{alpha:.3})}`,textColorPrimary:a,colorPrimary:n(a,{alpha:.12}),colorBorderedPrimary:n(a,{alpha:.1}),closeIconColorPrimary:a,closeIconColorHoverPrimary:a,closeIconColorPressedPrimary:a,closeColorHoverPrimary:n(a,{alpha:.12}),closeColorPressedPrimary:n(a,{alpha:.18}),borderInfo:`1px solid ${n(o,{alpha:.3})}`,textColorInfo:o,colorInfo:n(o,{alpha:.12}),colorBorderedInfo:n(o,{alpha:.1}),closeIconColorInfo:o,closeIconColorHoverInfo:o,closeIconColorPressedInfo:o,closeColorHoverInfo:n(o,{alpha:.12}),closeColorPressedInfo:n(o,{alpha:.18}),borderSuccess:`1px solid ${n(s,{alpha:.3})}`,textColorSuccess:s,colorSuccess:n(s,{alpha:.12}),colorBorderedSuccess:n(s,{alpha:.1}),closeIconColorSuccess:s,closeIconColorHoverSuccess:s,closeIconColorPressedSuccess:s,closeColorHoverSuccess:n(s,{alpha:.12}),closeColorPressedSuccess:n(s,{alpha:.18}),borderWarning:`1px solid ${n(c,{alpha:.35})}`,textColorWarning:c,colorWarning:n(c,{alpha:.15}),colorBorderedWarning:n(c,{alpha:.12}),closeIconColorWarning:c,closeIconColorHoverWarning:c,closeIconColorPressedWarning:c,closeColorHoverWarning:n(c,{alpha:.12}),closeColorPressedWarning:n(c,{alpha:.18}),borderError:`1px solid ${n(l,{alpha:.23})}`,textColorError:l,colorError:n(l,{alpha:.1}),colorBorderedError:n(l,{alpha:.08}),closeIconColorError:l,closeIconColorHoverError:l,closeIconColorPressedError:l,closeColorHoverError:n(l,{alpha:.12}),closeColorPressedError:n(l,{alpha:.18})})}var E={name:`Tag`,common:y,self:T},D={color:Object,type:{type:String,default:`default`},round:Boolean,size:{type:String,default:`medium`},closable:Boolean,disabled:{type:Boolean,default:void 0}},O=i(`tag`,`
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
 `),u(`border`,`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),u(`icon`,`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),u(`avatar`,`
 display: flex;
 margin: 0 6px 0 0;
 `),u(`close`,`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),d(`round`,`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[u(`icon`,`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),u(`avatar`,`
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
 `,[o(`disabled`,[b(`&:hover`,`background-color: var(--n-color-hover-checkable);`,[o(`checked`,`color: var(--n-text-color-hover-checkable);`)]),b(`&:active`,`background-color: var(--n-color-pressed-checkable);`,[o(`checked`,`color: var(--n-text-color-pressed-checkable);`)])]),d(`checked`,`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[o(`disabled`,[b(`&:hover`,`background-color: var(--n-color-checked-hover);`),b(`&:active`,`background-color: var(--n-color-checked-pressed);`)])])])]),k=Object.assign(Object.assign(Object.assign({},e.props),D),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),A=a(`n-tag`),j=C({name:`Tag`,props:k,slots:Object,setup(n){let i=c(null),{mergedBorderedRef:a,mergedClsPrefixRef:o,inlineThemeDisabled:l,mergedRtlRef:u}=p(n),d=e(`Tag`,`-tag`,O,E,n,o);_(A,{roundRef:r(n,`round`)});function m(){if(!n.disabled&&n.checkable){let{checked:e,onCheckedChange:t,onUpdateChecked:r,"onUpdate:checked":i}=n;r&&r(!e),i&&i(!e),t&&t(!e)}}function y(e){if(n.triggerClickOnClose||e.stopPropagation(),!n.disabled){let{onClose:t}=n;t&&v(t,e)}}let b={setTextContent(e){let{value:t}=i;t&&(t.textContent=e)}},x=h(`Tag`,u,o),C=S(()=>{let{type:e,size:r,color:{color:i,textColor:o}={}}=n,{common:{cubicBezierEaseInOut:c},self:{padding:l,closeMargin:u,borderRadius:f,opacityDisabled:p,textColorCheckable:m,textColorHoverCheckable:h,textColorPressedCheckable:g,textColorChecked:_,colorCheckable:v,colorHoverCheckable:y,colorPressedCheckable:b,colorChecked:x,colorCheckedHover:S,colorCheckedPressed:C,closeBorderRadius:w,fontWeightStrong:T,[t(`colorBordered`,e)]:E,[t(`closeSize`,r)]:D,[t(`closeIconSize`,r)]:O,[t(`fontSize`,r)]:k,[t(`height`,r)]:A,[t(`color`,e)]:j,[t(`textColor`,e)]:M,[t(`border`,e)]:N,[t(`closeIconColor`,e)]:P,[t(`closeIconColorHover`,e)]:F,[t(`closeIconColorPressed`,e)]:I,[t(`closeColorHover`,e)]:L,[t(`closeColorPressed`,e)]:R}}=d.value,z=s(u);return{"--n-font-weight-strong":T,"--n-avatar-size-override":`calc(${A} - 8px)`,"--n-bezier":c,"--n-border-radius":f,"--n-border":N,"--n-close-icon-size":O,"--n-close-color-pressed":R,"--n-close-color-hover":L,"--n-close-border-radius":w,"--n-close-icon-color":P,"--n-close-icon-color-hover":F,"--n-close-icon-color-pressed":I,"--n-close-icon-color-disabled":P,"--n-close-margin-top":z.top,"--n-close-margin-right":z.right,"--n-close-margin-bottom":z.bottom,"--n-close-margin-left":z.left,"--n-close-size":D,"--n-color":i||(a.value?E:j),"--n-color-checkable":v,"--n-color-checked":x,"--n-color-checked-hover":S,"--n-color-checked-pressed":C,"--n-color-hover-checkable":y,"--n-color-pressed-checkable":b,"--n-font-size":k,"--n-height":A,"--n-opacity-disabled":p,"--n-padding":l,"--n-text-color":o||M,"--n-text-color-checkable":m,"--n-text-color-checked":_,"--n-text-color-hover-checkable":h,"--n-text-color-pressed-checkable":g}}),w=l?g(`tag`,S(()=>{let e=``,{type:t,size:r,color:{color:i,textColor:o}={}}=n;return e+=t[0],e+=r[0],i&&(e+=`a${f(i)}`),o&&(e+=`b${f(o)}`),a.value&&(e+=`c`),e}),C,n):void 0;return Object.assign(Object.assign({},b),{rtlEnabled:x,mergedClsPrefix:o,contentRef:i,mergedBordered:a,handleClick:m,handleCloseClick:y,cssVars:l?void 0:C,themeClass:w?.themeClass,onRender:w?.onRender})},render(){var e;let{mergedClsPrefix:t,rtlEnabled:n,closable:r,color:{borderColor:i}={},round:a,onRender:o,$slots:s}=this;o?.();let c=x(s.avatar,e=>e&&m(`div`,{class:`${t}-tag__avatar`},e)),u=x(s.icon,e=>e&&m(`div`,{class:`${t}-tag__icon`},e));return m(`div`,{class:[`${t}-tag`,this.themeClass,{[`${t}-tag--rtl`]:n,[`${t}-tag--strong`]:this.strong,[`${t}-tag--disabled`]:this.disabled,[`${t}-tag--checkable`]:this.checkable,[`${t}-tag--checked`]:this.checkable&&this.checked,[`${t}-tag--round`]:a,[`${t}-tag--avatar`]:c,[`${t}-tag--icon`]:u,[`${t}-tag--closable`]:r}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},u||c,m(`span`,{class:`${t}-tag__content`,ref:`contentRef`},(e=this.$slots).default?.call(e)),!this.checkable&&r?m(l,{clsPrefix:t,class:`${t}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:a,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?m(`div`,{class:`${t}-tag__border`,style:{borderColor:i}}):null)}});export{j as t};