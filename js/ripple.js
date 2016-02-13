/*
https://github.com/samthor/rippleJS

The MIT License (MIT)

Copyright (c) 2014-2015 Sam Thorogood

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
window.addEventListener("load",function(){function n(){var a=document.createElement("style");a.type="text/css";a.styleSheet?a.styleSheet.cssText='/*rippleJS*/.rippleJS,.rippleJS.fill::after{position:absolute;top:0;left:0;right:0;bottom:0}.rippleJS{display:block;overflow:hidden;border-radius:inherit;-webkit-mask-image:-webkit-radial-gradient(circle,#fff,#000)}.rippleJS.fill::after{content:""}.rippleJS.fill{border-radius:1000000px}.rippleJS .ripple{position:absolute;border-radius:100%;background:currentColor;opacity:.2;width:0;height:0;-webkit-transition:-webkit-transform .4s ease-out,opacity .4s ease-out;transition:transform .4s ease-out,opacity .4s ease-out;-webkit-transform:scale(0);transform:scale(0);pointer-events:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.rippleJS .ripple.held{opacity:.4;-webkit-transform:scale(1);transform:scale(1)}.rippleJS .ripple.done{opacity:0}':
a.appendChild(document.createTextNode('/*rippleJS*/.rippleJS,.rippleJS.fill::after{position:absolute;top:0;left:0;right:0;bottom:0}.rippleJS{display:block;overflow:hidden;border-radius:inherit;-webkit-mask-image:-webkit-radial-gradient(circle,#fff,#000)}.rippleJS.fill::after{content:""}.rippleJS.fill{border-radius:1000000px}.rippleJS .ripple{position:absolute;border-radius:100%;background:currentColor;opacity:.2;width:0;height:0;-webkit-transition:-webkit-transform .4s ease-out,opacity .4s ease-out;transition:transform .4s ease-out,opacity .4s ease-out;-webkit-transform:scale(0);transform:scale(0);pointer-events:none;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.rippleJS .ripple.held{opacity:.4;-webkit-transform:scale(1);transform:scale(1)}.rippleJS .ripple.done{opacity:0}'));
document.body.appendChild(a)}function g(a,c){var e=c.target,g=e.classList;if(g.contains("rippleJS")){var f=e.getAttribute("data-event");if(!f||f==a){e.setAttribute("data-event",a);var b=e.getBoundingClientRect(),f=c.offsetX,h;void 0!==f?h=c.offsetY:(f=c.clientX-b.left,h=c.clientY-b.top);var d=document.createElement("div"),b=b.width==b.height?1.412*b.width:Math.sqrt(b.width*b.width+b.height*b.height),k=2*b+"px";d.style.width=k;d.style.height=k;d.style.marginLeft=-b+f+"px";d.style.marginTop=-b+h+"px";
d.className="ripple";e.appendChild(d);window.setTimeout(function(){d.classList.add("held")},0);var l="mousedown"==a?"mouseup":"touchend",m=function(){document.removeEventListener(l,m);d.classList.add("done");window.setTimeout(function(){e.removeChild(d);e.children.length||(g.remove("active"),e.removeAttribute("data-event"))},650)};document.addEventListener(l,m)}}}(function(){var a=document.createElement("div");a.className="rippleJS";document.body.appendChild(a);var c="absolute"==window.getComputedStyle(a).position;
document.body.removeChild(a);return c})()||n();document.addEventListener("mousedown",function(a){0==a.button&&g(a.type,a)});document.addEventListener("touchstart",function(a){for(var c=0;c<a.changedTouches.length;++c)g(a.type,a.changedTouches[c])})});