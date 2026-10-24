/* =====================================================
   ✏️  EDITA AQUÍ: nombre, carta y avatar
   ===================================================== */
const CONFIG = {
  goal: 10,                       // corazones para desbloquear la carta
  letterTitle: "Mi niño precioso,", // título de la carta
  letterBody:
`Esta sorpresita es para recordarte lo mucho que te quiero.
Gracias por ser mi lugar favorito, mi calma y mi alegría.

Ya falta poquito para tu día, y quiero que sepas que me haces muy feliz.
Te amo, mi amor hermoso.`,       // el texto de la carta (los saltos de línea se respetan)
  letterSign: "Con todo mi amor 💗",

  // Avatar: colores del dibujito (cámbialos para que se parezca a él)
  skin: "#f5c9a0",
  hair: "#3b2a20",
  shirt: "#6aa7ff",
  // Opcional: foto de su cara. Sube una imagen cuadrada a la carpeta y pon su nombre, ej: "el.png"
  avatarImage: ""
};
/* ===================================================== */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const $ = id => document.getElementById(id);

$('goal').textContent = CONFIG.goal;
$('letterTitle').textContent = CONFIG.letterTitle;
$('letterBody').textContent = CONFIG.letterBody;
$('letterSign').textContent = CONFIG.letterSign;

let face = null;
if (CONFIG.avatarImage){ face = new Image(); face.src = CONFIG.avatarImage; }

const player = { x: W/2, w: 52, h: 70, y: H - 80 };
let targetX = W/2;
let items = [], score = 0, running = false, last = 0, spawnT = 0, hurt = 0;
const keys = { left:false, right:false };
const FALL = ['💔','🌵','⛈️'];

function reset(){
  items = []; score = 0; spawnT = 0; hurt = 0;
  player.x = targetX = W/2;
  $('count').textContent = 0;
}

function spawn(){
  const heart = Math.random() < 0.62;
  items.push({
    heart,
    emoji: heart ? '❤️' : FALL[Math.floor(Math.random()*FALL.length)],
    x: 24 + Math.random()*(W-48),
    y: -30,
    vy: 90 + Math.random()*70 + score*5,   // un poquito más rápido al avanzar
    size: heart ? 32 : 34,
    wob: Math.random()*6
  });
}

function update(dt){
  if (keys.left)  targetX -= 330*dt;
  if (keys.right) targetX += 330*dt;
  targetX = Math.max(player.w/2, Math.min(W-player.w/2, targetX));
  player.x += (targetX - player.x) * Math.min(1, dt*14);

  spawnT -= dt;
  if (spawnT <= 0){ spawn(); spawnT = 0.7 + Math.random()*0.5; }
  hurt = Math.max(0, hurt - dt);

  for (const it of items){
    it.y += it.vy*dt;
    it.wob += dt*3;
    const dx = Math.abs(it.x - player.x);
    const dy = it.y - (player.y + player.h/2);
    if (!it.done && dx < 34 && Math.abs(dy) < 40){
      it.done = true;
      if (it.heart){ score++; $('count').textContent = score; }
      else { score = Math.max(0, score-1); $('count').textContent = score; hurt = .35; } // sin game over: solo pierdes un corazón
    }
  }
  items = items.filter(it => !it.done && it.y < H+40);
  if (score >= CONFIG.goal) win();
}

function drawPlayer(){
  const x = player.x, y = player.y;
  ctx.save();
  if (hurt > 0) ctx.translate(Math.sin(hurt*70)*3, 0);
  // cuerpo
  ctx.fillStyle = CONFIG.shirt;
  ctx.beginPath(); ctx.roundRect(x-20, y+34, 40, 36, 10); ctx.fill();
  // cabeza
  if (face && face.complete && face.naturalWidth){
    ctx.save(); ctx.beginPath(); ctx.arc(x, y+18, 22, 0, Math.PI*2); ctx.clip();
    ctx.drawImage(face, x-22, y-4, 44, 44); ctx.restore();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x, y+18, 22, 0, Math.PI*2); ctx.stroke();
  } else {
    ctx.fillStyle = CONFIG.skin;
    ctx.beginPath(); ctx.arc(x, y+18, 22, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = CONFIG.hair;
    ctx.beginPath(); ctx.arc(x, y+12, 23, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#3a2a2a';
    ctx.beginPath(); ctx.arc(x-8, y+20, 2.6, 0, 7); ctx.arc(x+8, y+20, 2.6, 0, 7); ctx.fill();
    ctx.strokeStyle = hurt>0 ? '#a3235f' : '#c0456f'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (hurt>0) ctx.arc(x, y+33, 5, Math.PI, 0); else ctx.arc(x, y+27, 7, 0.1*Math.PI, 0.9*Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,160,.45)';
    ctx.beginPath(); ctx.arc(x-14, y+26, 4, 0, 7); ctx.arc(x+14, y+26, 4, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const it of items){
    ctx.font = it.size+'px serif';
    ctx.fillText(it.emoji, it.x + Math.sin(it.wob)*4, it.y);
  }
  drawPlayer();
}

function loop(t){
  if (!running) return;
  const dt = Math.min(0.05, (t-last)/1000); last = t;
  update(dt); draw();
  if (running) requestAnimationFrame(loop);
}

function start(){
  reset();
  $('intro').classList.add('hidden');
  $('letter').classList.add('hidden');
  running = true; last = performance.now();
  requestAnimationFrame(loop);
}
function win(){
  running = false; draw();
  $('letter').classList.remove('hidden');
}

$('start').addEventListener('click', start);
$('again').addEventListener('click', start);

// Controles: dedo/mouse, flechas y botones
function setFromPointer(e){
  const r = canvas.getBoundingClientRect();
  targetX = (e.clientX - r.left) * (W / r.width);
}
canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); setFromPointer(e); });
canvas.addEventListener('pointermove', e => { if (e.pressure > 0 || e.pointerType === 'mouse') setFromPointer(e); });

addEventListener('keydown', e => {
  if (e.key==='ArrowLeft'||e.key==='a') keys.left = true;
  if (e.key==='ArrowRight'||e.key==='d') keys.right = true;
});
addEventListener('keyup', e => {
  if (e.key==='ArrowLeft'||e.key==='a') keys.left = false;
  if (e.key==='ArrowRight'||e.key==='d') keys.right = false;
});
function hold(id, k){
  const b = $(id);
  ['pointerdown'].forEach(ev => b.addEventListener(ev, e => { e.preventDefault(); keys[k] = true; }));
  ['pointerup','pointerleave','pointercancel'].forEach(ev => b.addEventListener(ev, () => keys[k] = false));
}
hold('left','left'); hold('right','right');

draw();
