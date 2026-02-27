import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const ui = {
  loading: document.getElementById('loading-screen'),
  bar: document.getElementById('bar-fill'),
  menu: document.getElementById('main-menu'),
  hud: document.getElementById('hud'),
  hp: document.getElementById('hp'),
  ammo: document.getElementById('ammo'),
  credits: document.getElementById('credits'),
  xp: document.getElementById('xp'),
  play: document.getElementById('play-btn'),
  friends: document.getElementById('friends-btn'),
  servers: document.getElementById('servers-btn'),
  store: document.getElementById('store-btn'),
  friendsModal: document.getElementById('friends-modal'),
  serversModal: document.getElementById('servers-modal'),
  storeModal: document.getElementById('store-modal'),
  friendsList: document.getElementById('friends-list'),
  serversList: document.getElementById('servers-list'),
  addFriend: document.getElementById('add-friend'),
  friendInput: document.getElementById('friend-input'),
  buyPass: document.getElementById('buy-pass'),
  storeMsg: document.getElementById('store-msg')
};

const state = {
  hp: 100,
  ammo: 30,
  credits: 2500,
  xp: 0,
  firing: false,
  passOwned: false,
  friends: ['Mason', 'Reznov'],
  servers: ['Berlin Frontline #1 (32/40)', 'Siberia Facility #2 (18/40)', 'Havana Docks Hardcore (40/40)'],
  bloodSplats: []
};

function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModals() {
  [ui.friendsModal, ui.serversModal, ui.storeModal].forEach((x) => x.classList.add('hidden'));
}

function renderSocial() {
  ui.friendsList.innerHTML = state.friends.map((f) => `<li>${f}</li>`).join('');
  ui.serversList.innerHTML = state.servers.map((s) => `<li>${s}</li>`).join('');
}

function updateHud() {
  ui.hp.textContent = state.hp;
  ui.ammo.textContent = state.ammo;
  ui.credits.textContent = state.credits;
  ui.xp.textContent = state.xp;
}

for (let i = 0; i <= 100; i += 4) {
  setTimeout(() => {
    ui.bar.style.width = `${i}%`;
    if (i === 100) {
      ui.loading.classList.add('hidden');
      ui.menu.classList.remove('hidden');
      renderSocial();
      updateHud();
    }
  }, i * 12);
}

ui.friends.onclick = () => showModal(ui.friendsModal);
ui.servers.onclick = () => showModal(ui.serversModal);
ui.store.onclick = () => showModal(ui.storeModal);
document.querySelectorAll('.close-modal').forEach((btn) => (btn.onclick = hideModals));

ui.addFriend.onclick = () => {
  const name = ui.friendInput.value.trim();
  if (!name) return;
  state.friends.push(name);
  ui.friendInput.value = '';
  renderSocial();
};

ui.buyPass.onclick = () => {
  if (state.passOwned) return;
  state.passOwned = true;
  state.credits += 1000;
  state.xp += 500;
  ui.storeMsg.textContent = 'Purchase simulated. Season pass unlocked + starter bonus granted.';
  updateHud();
};

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x172336, 8, 80);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.7, 8);

const hemi = new THREE.HemisphereLight(0x99b8ff, 0x1f2633, 0.6);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xdde8ff, 1.1);
sun.position.set(8, 20, 3);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x23303f, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x4f5d6e, roughness: 0.7 });
for (let i = 0; i < 25; i++) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(4, 4 + Math.random() * 2, 4), wallMat);
  box.position.set((Math.random() - 0.5) * 60, 2, (Math.random() - 0.5) * 60);
  box.castShadow = true;
  scene.add(box);
}

const targetMat = new THREE.MeshStandardMaterial({ color: 0x7d8c9f, metalness: 0.25, roughness: 0.5 });
const targets = [];
for (let i = 0; i < 15; i++) {
  const t = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.5, 4, 8), targetMat);
  t.position.set((Math.random() - 0.5) * 45, 1.4, (Math.random() - 0.5) * 45);
  t.castShadow = true;
  scene.add(t);
  targets.push(t);
}

const bloodMat = new THREE.MeshBasicMaterial({ color: 0x8d101f, transparent: true, opacity: 0.9 });
function spawnBlood(point) {
  const splat = new THREE.Mesh(new THREE.CircleGeometry(0.35 + Math.random() * 0.2, 12), bloodMat.clone());
  splat.position.copy(point);
  splat.position.y += 0.02;
  splat.rotation.x = -Math.PI / 2;
  scene.add(splat);
  state.bloodSplats.push({ mesh: splat, born: performance.now() });
}

const key = {};
window.addEventListener('keydown', (e) => {
  key[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') {
    document.exitPointerLock();
    ui.menu.classList.remove('hidden');
    ui.hud.classList.add('hidden');
  }
});
window.addEventListener('keyup', (e) => (key[e.key.toLowerCase()] = false));
window.addEventListener('mousedown', () => (state.firing = true));
window.addEventListener('mouseup', () => (state.firing = false));

let pitch = 0;
let yaw = 0;
window.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
  camera.rotation.set(pitch, yaw, 0);
});

ui.play.onclick = () => {
  ui.menu.classList.add('hidden');
  hideModals();
  ui.hud.classList.remove('hidden');
  canvas.requestPointerLock();
};

const raycaster = new THREE.Raycaster();
let lastShot = 0;

function shoot(now) {
  if (!state.firing || now - lastShot < 90 || state.ammo <= 0) return;
  lastShot = now;
  state.ammo -= 1;
  const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
  raycaster.set(camera.position, dir.normalize());
  const hits = raycaster.intersectObjects(targets);
  if (hits[0]) {
    spawnBlood(hits[0].point);
    const t = hits[0].object;
    t.position.set((Math.random() - 0.5) * 45, 1.4, (Math.random() - 0.5) * 45);
    state.xp += 25;
    state.credits += 10;
  }
  updateHud();
}

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r' && state.ammo < 30) {
    state.ammo = 30;
    updateHud();
  }
});

const velocity = new THREE.Vector3();
function animate(now) {
  requestAnimationFrame(animate);

  const speed = 0.15;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));

  velocity.set(0, 0, 0);
  if (key['w']) velocity.add(forward);
  if (key['s']) velocity.sub(forward);
  if (key['a']) velocity.sub(right);
  if (key['d']) velocity.add(right);

  if (velocity.lengthSq() > 0) {
    velocity.normalize().multiplyScalar(speed);
    camera.position.add(velocity);
  }

  shoot(now);

  state.bloodSplats = state.bloodSplats.filter((s) => {
    const age = now - s.born;
    s.mesh.material.opacity = Math.max(0, 0.9 - age / 9000);
    if (age > 9000) {
      scene.remove(s.mesh);
      return false;
    }
    return true;
  });

  renderer.render(scene, camera);
}
animate(0);

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
