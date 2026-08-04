import{$n as e,Gn as t,Gr as n,Hn as r,Nr as i,Pn as a,Q as o,Qn as s,Sr as c,Xn as l,Y as u,Yn as d,br as f,er as p,fn as m,fr as h,gn as g,nt as _,on as v,qr as y,sn as b,tr as x,tt as S,yn as C}from"./index-BSA7wBj8.js";var w={closeIconSizeTiny:`12px`,closeIconSizeSmall:`12px`,closeIconSizeMedium:`14px`,closeIconSizeLarge:`14px`,closeSizeTiny:`16px`,closeSizeSmall:`16px`,closeSizeMedium:`18px`,closeSizeLarge:`18px`,padding:`0 7px`,closeMargin:`0 0 0 4px`};function T(e){let{textColor2:t,primaryColorHover:n,primaryColorPressed:i,primaryColor:a,infoColor:o,successColor:s,warningColor:c,errorColor:l,baseColor:u,borderColor:d,opacityDisabled:f,tagColor:p,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,borderRadiusSmall:_,fontSizeMini:v,fontSizeTiny:y,fontSizeSmall:b,fontSizeMedium:x,heightMini:S,heightTiny:C,heightSmall:T,heightMedium:E,closeColorHover:D,closeColorPressed:O,buttonColor2Hover:k,buttonColor2Pressed:A,fontWeightStrong:j}=e;return Object.assign(Object.assign({},w),{closeBorderRadius:_,heightTiny:S,heightSmall:C,heightMedium:T,heightLarge:E,borderRadius:_,opacityDisabled:f,fontSizeTiny:v,fontSizeSmall:y,fontSizeMedium:b,fontSizeLarge:x,fontWeightStrong:j,textColorCheckable:t,textColorHoverCheckable:t,textColorPressedCheckable:t,textColorChecked:u,colorCheckable:`#0000`,colorHoverCheckable:k,colorPressedCheckable:A,colorChecked:a,colorCheckedHover:n,colorCheckedPressed:i,border:`1px solid ${d}`,textColor:t,color:p,colorBordered:`rgb(250, 250, 252)`,closeIconColor:m,closeIconColorHover:h,closeIconColorPressed:g,closeColorHover:D,closeColorPressed:O,borderPrimary:`1px solid ${r(a,{alpha:.3})}`,textColorPrimary:a,colorPrimary:r(a,{alpha:.12}),colorBorderedPrimary:r(a,{alpha:.1}),closeIconColorPrimary:a,closeIconColorHoverPrimary:a,closeIconColorPressedPrimary:a,closeColorHoverPrimary:r(a,{alpha:.12}),closeColorPressedPrimary:r(a,{alpha:.18}),borderInfo:`1px solid ${r(o,{alpha:.3})}`,textColorInfo:o,colorInfo:r(o,{alpha:.12}),colorBorderedInfo:r(o,{alpha:.1}),closeIconColorInfo:o,closeIconColorHoverInfo:o,closeIconColorPressedInfo:o,closeColorHoverInfo:r(o,{alpha:.12}),closeColorPressedInfo:r(o,{alpha:.18}),borderSuccess:`1px solid ${r(s,{alpha:.3})}`,textColorSuccess:s,colorSuccess:r(s,{alpha:.12}),colorBorderedSuccess:r(s,{alpha:.1}),closeIconColorSuccess:s,closeIconColorHoverSuccess:s,closeIconColorPressedSuccess:s,closeColorHoverSuccess:r(s,{alpha:.12}),closeColorPressedSuccess:r(s,{alpha:.18}),borderWarning:`1px solid ${r(c,{alpha:.35})}`,textColorWarning:c,colorWarning:r(c,{alpha:.15}),colorBorderedWarning:r(c,{alpha:.12}),closeIconColorWarning:c,closeIconColorHoverWarning:c,closeIconColorPressedWarning:c,closeColorHoverWarning:r(c,{alpha:.12}),closeColorPressedWarning:r(c,{alpha:.18}),borderError:`1px solid ${r(l,{alpha:.23})}`,textColorError:l,colorError:r(l,{alpha:.1}),colorBorderedError:r(l,{alpha:.08}),closeIconColorError:l,closeIconColorHoverError:l,closeIconColorPressedError:l,closeColorHoverError:r(l,{alpha:.12}),closeColorPressedError:r(l,{alpha:.18})})}var E={name:`Tag`,common:u,self:T},D={color:Object,type:{type:String,default:`default`},round:Boolean,size:{type:String,default:`medium`},closable:Boolean,disabled:{type:Boolean,default:void 0}},O=l(`tag`,`
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
`,[e(`strong`,`
 font-weight: var(--n-font-weight-strong);
 `),s(`border`,`
 pointer-events: none;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
 border: var(--n-border);
 transition: border-color .3s var(--n-bezier);
 `),s(`icon`,`
 display: flex;
 margin: 0 4px 0 0;
 color: var(--n-text-color);
 transition: color .3s var(--n-bezier);
 font-size: var(--n-avatar-size-override);
 `),s(`avatar`,`
 display: flex;
 margin: 0 6px 0 0;
 `),s(`close`,`
 margin: var(--n-close-margin);
 transition:
 background-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 `),e(`round`,`
 padding: 0 calc(var(--n-height) / 3);
 border-radius: calc(var(--n-height) / 2);
 `,[s(`icon`,`
 margin: 0 4px 0 calc((var(--n-height) - 8px) / -2);
 `),s(`avatar`,`
 margin: 0 6px 0 calc((var(--n-height) - 8px) / -2);
 `),e(`closable`,`
 padding: 0 calc(var(--n-height) / 4) 0 calc(var(--n-height) / 3);
 `)]),e(`icon, avatar`,[e(`round`,`
 padding: 0 calc(var(--n-height) / 3) 0 calc(var(--n-height) / 2);
 `)]),e(`disabled`,`
 cursor: not-allowed !important;
 opacity: var(--n-opacity-disabled);
 `),e(`checkable`,`
 cursor: pointer;
 box-shadow: none;
 color: var(--n-text-color-checkable);
 background-color: var(--n-color-checkable);
 `,[p(`disabled`,[d(`&:hover`,`background-color: var(--n-color-hover-checkable);`,[p(`checked`,`color: var(--n-text-color-hover-checkable);`)]),d(`&:active`,`background-color: var(--n-color-pressed-checkable);`,[p(`checked`,`color: var(--n-text-color-pressed-checkable);`)])]),e(`checked`,`
 color: var(--n-text-color-checked);
 background-color: var(--n-color-checked);
 `,[p(`disabled`,[d(`&:hover`,`background-color: var(--n-color-checked-hover);`),d(`&:active`,`background-color: var(--n-color-checked-pressed);`)])])])]),k=Object.assign(Object.assign(Object.assign({},S.props),D),{bordered:{type:Boolean,default:void 0},checked:Boolean,checkable:Boolean,strong:Boolean,triggerClickOnClose:Boolean,onClose:[Array,Function],onMouseenter:Function,onMouseleave:Function,"onUpdate:checked":Function,onUpdateChecked:Function,internalCloseFocusable:{type:Boolean,default:!0},internalCloseIsButtonTag:{type:Boolean,default:!0},onCheckedChange:Function}),A=a(`n-tag`),j=f({name:`Tag`,props:k,slots:Object,setup(e){let r=n(null),{mergedBorderedRef:a,mergedClsPrefixRef:o,inlineThemeDisabled:s,mergedRtlRef:c}=b(e),l=S(`Tag`,`-tag`,O,E,e,o);i(A,{roundRef:y(e,`round`)});function u(){if(!e.disabled&&e.checkable){let{checked:t,onCheckedChange:n,onUpdateChecked:r,"onUpdate:checked":i}=e;r&&r(!t),i&&i(!t),n&&n(!t)}}function d(t){if(e.triggerClickOnClose||t.stopPropagation(),!e.disabled){let{onClose:n}=e;n&&g(n,t)}}let f={setTextContent(e){let{value:t}=r;t&&(t.textContent=e)}},p=_(`Tag`,c,o),m=h(()=>{let{type:n,size:r,color:{color:i,textColor:o}={}}=e,{common:{cubicBezierEaseInOut:s},self:{padding:c,closeMargin:u,borderRadius:d,opacityDisabled:f,textColorCheckable:p,textColorHoverCheckable:m,textColorPressedCheckable:h,textColorChecked:g,colorCheckable:_,colorHoverCheckable:v,colorPressedCheckable:y,colorChecked:b,colorCheckedHover:S,colorCheckedPressed:C,closeBorderRadius:w,fontWeightStrong:T,[x(`colorBordered`,n)]:E,[x(`closeSize`,r)]:D,[x(`closeIconSize`,r)]:O,[x(`fontSize`,r)]:k,[x(`height`,r)]:A,[x(`color`,n)]:j,[x(`textColor`,n)]:M,[x(`border`,n)]:N,[x(`closeIconColor`,n)]:P,[x(`closeIconColorHover`,n)]:F,[x(`closeIconColorPressed`,n)]:I,[x(`closeColorHover`,n)]:L,[x(`closeColorPressed`,n)]:R}}=l.value,z=t(u);return{"--n-font-weight-strong":T,"--n-avatar-size-override":`calc(${A} - 8px)`,"--n-bezier":s,"--n-border-radius":d,"--n-border":N,"--n-close-icon-size":O,"--n-close-color-pressed":R,"--n-close-color-hover":L,"--n-close-border-radius":w,"--n-close-icon-color":P,"--n-close-icon-color-hover":F,"--n-close-icon-color-pressed":I,"--n-close-icon-color-disabled":P,"--n-close-margin-top":z.top,"--n-close-margin-right":z.right,"--n-close-margin-bottom":z.bottom,"--n-close-margin-left":z.left,"--n-close-size":D,"--n-color":i||(a.value?E:j),"--n-color-checkable":_,"--n-color-checked":b,"--n-color-checked-hover":S,"--n-color-checked-pressed":C,"--n-color-hover-checkable":v,"--n-color-pressed-checkable":y,"--n-font-size":k,"--n-height":A,"--n-opacity-disabled":f,"--n-padding":c,"--n-text-color":o||M,"--n-text-color-checkable":p,"--n-text-color-checked":g,"--n-text-color-hover-checkable":m,"--n-text-color-pressed-checkable":h}}),w=s?v(`tag`,h(()=>{let t=``,{type:n,size:r,color:{color:i,textColor:o}={}}=e;return t+=n[0],t+=r[0],i&&(t+=`a${C(i)}`),o&&(t+=`b${C(o)}`),a.value&&(t+=`c`),t}),m,e):void 0;return Object.assign(Object.assign({},f),{rtlEnabled:p,mergedClsPrefix:o,contentRef:r,mergedBordered:a,handleClick:u,handleCloseClick:d,cssVars:s?void 0:m,themeClass:w?.themeClass,onRender:w?.onRender})},render(){var e;let{mergedClsPrefix:t,rtlEnabled:n,closable:r,color:{borderColor:i}={},round:a,onRender:s,$slots:l}=this;s?.();let u=m(l.avatar,e=>e&&c(`div`,{class:`${t}-tag__avatar`},e)),d=m(l.icon,e=>e&&c(`div`,{class:`${t}-tag__icon`},e));return c(`div`,{class:[`${t}-tag`,this.themeClass,{[`${t}-tag--rtl`]:n,[`${t}-tag--strong`]:this.strong,[`${t}-tag--disabled`]:this.disabled,[`${t}-tag--checkable`]:this.checkable,[`${t}-tag--checked`]:this.checkable&&this.checked,[`${t}-tag--round`]:a,[`${t}-tag--avatar`]:u,[`${t}-tag--icon`]:d,[`${t}-tag--closable`]:r}],style:this.cssVars,onClick:this.handleClick,onMouseenter:this.onMouseenter,onMouseleave:this.onMouseleave},d||u,c(`span`,{class:`${t}-tag__content`,ref:`contentRef`},(e=this.$slots).default?.call(e)),!this.checkable&&r?c(o,{clsPrefix:t,class:`${t}-tag__close`,disabled:this.disabled,onClick:this.handleCloseClick,focusable:this.internalCloseFocusable,round:a,isButtonTag:this.internalCloseIsButtonTag,absolute:!0}):null,!this.checkable&&this.mergedBordered?c(`div`,{class:`${t}-tag__border`,style:{borderColor:i}}):null)}});export{j as t};