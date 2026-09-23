(() => {
'use strict';
const canvas=document.getElementById('city-scene');
const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,visible=true,ready=false,frame=0,last=0,time=0,boost=0,lost=false;
const toggle=document.getElementById('motion-toggle');
function sync(){document.body.classList.toggle('motion-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume animation':'Pause animation');toggle.title=paused?'Resume animation':'Pause animation';toggle.innerHTML=paused?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m8 4 12 8-12 8Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';}
sync();
if(!gl){toggle.addEventListener('click',()=>{paused=!paused;sync();});document.getElementById('warp').hidden=true;return;}
const vertex='attribute vec2 a; varying vec2 uv; void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
const fragment=`precision mediump float;
varying vec2 uv;uniform sampler2D picture;uniform sampler2D sceneA;uniform sampler2D sceneB;uniform sampler2D sceneC;uniform vec2 resolution;uniform vec2 imageSize;uniform vec2 pointer;uniform float clock;uniform float pulse;uniform float billboardReady;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
vec2 fit=vec2(1.);float screenAspect=resolution.x/resolution.y;float imageAspect=imageSize.x/imageSize.y;
if(screenAspect>imageAspect)fit.y=imageAspect/screenAspect;else fit.x=screenAspect/imageAspect;
vec2 anchor=vec2(screenAspect<.9?.65:.52,.51);
vec2 st=(uv-.5)*fit+anchor;
float depth=.35+.65*pow(1.-uv.y,2.);
st+=pointer*vec2(.008,.005)*depth+vec2(sin(clock*.09)*.003,cos(clock*.11)*.002);
float wave=sin(length((uv-vec2(.72,.5))*vec2(screenAspect,1.))*32.-clock*5.);
st+=normalize(uv-vec2(.72,.5)+.001)*wave*pulse*.006;
st=clamp(st,vec2(.001),vec2(.999));
vec3 color=texture2D(picture,st).rgb;
vec2 panelMin=vec2(.226,.500);vec2 panelMax=vec2(.282,.715);
vec2 panel=(st-panelMin)/(panelMax-panelMin);
panel.x+=(panel.y-.5)*.065;
float desktopPanel=step(.9,screenAspect);
float inside=step(0.,panel.x)*step(panel.x,1.)*step(0.,panel.y)*step(panel.y,1.)*billboardReady*desktopPanel;
vec2 screenUv=vec2(.5+(panel.x-.5)*.34,panel.y);
float phase=mod(clock,12.);vec3 screenColor;
if(phase<4.)screenColor=texture2D(sceneA,screenUv).rgb;else if(phase<8.)screenColor=texture2D(sceneB,screenUv).rgb;else screenColor=texture2D(sceneC,screenUv).rgb;
float change=min(min(abs(phase-4.),abs(phase-8.)),min(phase,12.-phase));
float signal=smoothstep(0.,.32,change);
float scan=.92+.08*sin(panel.y*520.+clock*4.);
screenColor*=scan*signal;screenColor+=vec3(.12,.3,.5)*(1.-signal);
float edge=max(max(-panel.x,panel.x-1.),max(-panel.y,panel.y-1.));
float frameGlow=exp(-abs(edge)*120.)*billboardReady*desktopPanel;
color=mix(color,screenColor*1.38+vec3(.06,.16,.24),inside*.97);
color+=vec3(.18,.75,1.)*frameGlow*.62;
float light=.98+.025*sin(clock*.65+uv.y*4.);
color*=light;
float haze=sin(uv.x*8.+clock*.12)*sin(uv.y*5.-clock*.17)*.5+.5;
float fog=(1.-smoothstep(.2,.85,uv.y))*.022*haze;
color+=vec3(.4,.14,.8)*fog;
vec2 rainUv=uv;rainUv.x+=rainUv.y*.11;
vec2 cell=floor(rainUv*vec2(110.,24.));float rnd=hash(vec2(cell.x,0.));
float speed=1.2+rnd*1.8;
vec2 drop=fract(rainUv*vec2(110.,24.)+vec2(0.,clock*speed));
float streak=(1.-smoothstep(.015,.06,abs(drop.x-.5)))*smoothstep(.5,.95,drop.y)*step(.65,rnd);
color+=vec3(.45,.7,1.)*streak*.12;
vec2 sparkGrid=uv*vec2(35.,20.);vec2 sparkCell=floor(sparkGrid);float sparkle=hash(sparkCell);
vec2 sparklePosition=vec2(.5+.2*sin(clock*.15+sparkle*19.),fract(sparkle+clock*.012));
float star=1.-smoothstep(.005,.075,length(fract(sparkGrid)-sparklePosition));
color+=vec3(.45,.7,1.)*star*step(.968,sparkle)*(.15+.15*sin(clock+sparkle*99.));
float ring=exp(-abs(length((uv-vec2(.72,.5))*vec2(screenAspect,1.))-.36)*45.);
color+=vec3(.2,.7,1.)*ring*pulse*.55;color+=vec3(.12,.05,.2)*pulse;
color*=1.-.1*length(uv-.5);
gl_FragColor=vec4(color,1.);
}`;
function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.warn('Scene shader unavailable:',gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}return shader;}
const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs){document.getElementById('warp').hidden=true;return;}
const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){document.getElementById('warp').hidden=true;return;}gl.useProgram(program);
const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
const uniforms={};for(const name of ['resolution','imageSize','pointer','clock','pulse','picture','sceneA','sceneB','sceneC','billboardReady'])uniforms[name]=gl.getUniformLocation(program,name);
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(uniforms.picture,0);
gl.uniform1f(uniforms.billboardReady,0);
let billboardLoaded=0;
function loadBillboard(path,unit,uniform){const sceneTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(uniforms[uniform],unit);const sceneImage=new Image();sceneImage.onload=()=>{if(lost)return;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,sceneTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,sceneImage);billboardLoaded++;if(billboardLoaded===3){gl.uniform1f(uniforms.billboardReady,1);draw();}};sceneImage.src=path;}
loadBillboard('assets/billboard-ramen.png',1,'sceneA');loadBillboard('assets/billboard-laundry.png',2,'sceneB');loadBillboard('assets/billboard-groceries.png',3,'sceneC');
gl.activeTexture(gl.TEXTURE0);
const image=new Image();image.onload=()=>{if(lost)return;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);ready=true;resize();canvas.classList.add('ready');start();};image.src='assets/rabverse-rooftop.png';
const target={x:0,y:0},current={x:0,y:0};
function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(canvas.clientWidth*dpr);canvas.height=Math.round(canvas.clientHeight*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);draw();}
function draw(){if(!ready||lost)return;gl.uniform2f(uniforms.pointer,current.x,current.y);gl.uniform1f(uniforms.clock,time);gl.uniform1f(uniforms.pulse,boost);gl.drawArrays(gl.TRIANGLES,0,6);}
function tick(now){frame=0;if(paused||!visible||document.hidden||lost)return;const dt=Math.min((now-last)/1000,.05);last=now;time+=dt;boost=Math.max(0,boost-dt*.6);current.x+=(target.x-current.x)*.045;current.y+=(target.y-current.y)*.045;draw();frame=requestAnimationFrame(tick);}
function start(){if(frame||!ready||paused||!visible||document.hidden||lost)return;last=performance.now();frame=requestAnimationFrame(tick);}
function stop(){cancelAnimationFrame(frame);frame=0;}
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{threshold:0}).observe(canvas);
document.querySelector('.hero').addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const b=canvas.getBoundingClientRect();target.x=(event.clientX-b.left)/b.width*2-1;target.y=(event.clientY-b.top)/b.height*2-1;});
document.querySelector('.hero').addEventListener('pointerleave',()=>{target.x=0;target.y=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
toggle.addEventListener('click',()=>{paused=!paused;sync();if(paused){stop();boost=0;draw();}else start();});
reduced.addEventListener('change',event=>{paused=event.matches;sync();if(paused){stop();boost=0;draw();}else start();});
let warpTimer;document.getElementById('warp').addEventListener('click',()=>{const text=document.querySelector('#warp span');text.textContent='TOLD YOU.';if(!paused&&!reduced.matches)boost=1;clearTimeout(warpTimer);warpTimer=setTimeout(()=>{text.textContent='DO NOT PRESS';},2200);});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();canvas.classList.remove('ready');document.getElementById('warp').hidden=true;});
})();

