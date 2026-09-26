import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Transparent 3D layer that floats whole spices (star anise, cardamom,
 * cinnamon, bay leaf, cloves), soft rising steam and golden dust around the
 * real biryani photo in the hero. Follows the pointer / phone tilt, pauses
 * when offscreen and respects prefers-reduced-motion.
 */

// ── small helpers ──────────────────────────────────────────────
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function softSprite(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── spice builders ─────────────────────────────────────────────
function starAnise(mat: THREE.Material) {
  const g = new THREE.Group();
  const pod = new THREE.ConeGeometry(0.06, 0.26, 6);
  pod.rotateZ(-Math.PI / 2);
  pod.translate(0.13, 0, 0);
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(pod, mat);
    m.scale.set(1, 0.7, 1.25);
    m.rotation.y = (i / 8) * Math.PI * 2;
    g.add(m);
  }
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), mat);
  core.scale.y = 0.7;
  g.add(core);
  return g;
}

function cardamom(mat: THREE.Material) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), mat);
  m.scale.set(0.75, 0.75, 1.6);
  return m;
}

function cinnamon(mat: THREE.Material) {
  const geo = new THREE.CylinderGeometry(0.045, 0.045, 0.62, 14, 1, true, 0, Math.PI * 1.7);
  const g = new THREE.Group();
  const outer = new THREE.Mesh(geo, mat);
  const inner = new THREE.Mesh(geo, mat);
  inner.scale.set(0.7, 1, 0.7);
  inner.rotation.y = 1.2;
  g.add(outer, inner);
  return g;
}

function bayLeaf(mat: THREE.Material) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.28);
  s.quadraticCurveTo(0.13, -0.05, 0, 0.28);
  s.quadraticCurveTo(-0.13, -0.05, 0, -0.28);
  const geo = new THREE.ShapeGeometry(s, 10);
  // gentle fold along the spine
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.abs(p.getX(i)) * 0.35);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

function clove(mat: THREE.Material) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.2, 6), mat);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat);
  head.position.y = 0.11;
  g.add(stem, head);
  return g;
}

export default function SpiceScene({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 720;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    scene.add(new THREE.HemisphereLight(0xfff1d6, 0x0d2a22, 1.1));
    const key = new THREE.DirectionalLight(0xffd29a, 2.4);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf5b64a, 1.6);
    rim.position.set(-5, 2, -3);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);

    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(o: T) => {
      disposables.push(o);
      return o;
    };

    // ── steam rising off the plate ──
    const steamTex = track(softSprite('rgba(255,248,235,0.9)', 'rgba(255,248,235,0)'));
    const steamCount = isSmall ? 12 : 18;
    const steam: { s: THREE.Sprite; life: number; speed: number; x: number; drift: number }[] = [];
    for (let i = 0; i < steamCount; i++) {
      const mat = track(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }));
      const s = new THREE.Sprite(mat);
      world.add(s);
      steam.push({ s, life: Math.random(), speed: 0.1 + Math.random() * 0.08, x: (Math.random() - 0.5) * 1.1, drift: (Math.random() - 0.5) * 0.6 });
    }

    // ── floating spices, arranged around the plate ──
    const spiceBrown = track(new THREE.MeshStandardMaterial({ color: 0x6d3417, roughness: 0.6 }));
    const spiceGreen = track(new THREE.MeshStandardMaterial({ color: 0x8fae55, roughness: 0.55 }));
    const spiceCinn = track(new THREE.MeshStandardMaterial({ color: 0x9a5227, roughness: 0.75, side: THREE.DoubleSide }));
    const spiceLeaf = track(new THREE.MeshStandardMaterial({ color: 0x7f8a3a, roughness: 0.6, side: THREE.DoubleSide }));
    const spiceClove = track(new THREE.MeshStandardMaterial({ color: 0x3e2014, roughness: 0.7 }));

    const floaters: { o: THREE.Object3D; base: THREE.Vector3; phase: number; spin: THREE.Vector3 }[] = [];
    const spots: [() => THREE.Object3D, number, number, number][] = [
      [() => starAnise(spiceBrown), -1.95, 1.45, 0.6],
      [() => starAnise(spiceBrown), 1.9, -1.35, 0.8],
      [() => cardamom(spiceGreen), 1.75, 1.7, 0.3],
      [() => cardamom(spiceGreen), -2.05, -0.55, 0.9],
      [() => cardamom(spiceGreen), 0.35, -2.05, 0.7],
      [() => cinnamon(spiceCinn), -1.25, 2.0, -0.2],
      [() => cinnamon(spiceCinn), 2.15, 0.35, -0.3],
      [() => bayLeaf(spiceLeaf), -1.55, -1.75, 0.4],
      [() => bayLeaf(spiceLeaf), 1.0, 2.1, 0.2],
      [() => clove(spiceClove), -2.2, 0.55, 0.5],
      [() => clove(spiceClove), 2.05, -0.5, 0.6],
      [() => clove(spiceClove), -0.6, -2.1, 0.5],
    ];
    spots.forEach(([make, x, y, z], i) => {
      const o = make();
      o.position.set(x, y, z);
      o.rotation.set(i, i * 0.7, i * 0.3);
      o.scale.setScalar(isSmall ? 1.2 : 1.1);
      world.add(o);
      floaters.push({
        o,
        base: new THREE.Vector3(x, y, z),
        phase: i * 0.9,
        spin: new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.3 + Math.random() * 0.5, (Math.random() - 0.5) * 0.4),
      });
    });

    // golden dust
    const dustCount = 110;
    const dustGeo = track(new THREE.BufferGeometry());
    {
      const arr = new Float32Array(dustCount * 3);
      const rnd = seeded(5);
      for (let i = 0; i < dustCount; i++) {
        arr[i * 3] = (rnd() - 0.5) * 6;
        arr[i * 3 + 1] = (rnd() - 0.5) * 5;
        arr[i * 3 + 2] = (rnd() - 0.5) * 3;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    }
    const dustTex = track(softSprite('rgba(255,214,128,1)', 'rgba(255,214,128,0)'));
    const dust = new THREE.Points(
      dustGeo,
      track(new THREE.PointsMaterial({ size: 0.06, map: dustTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })),
    );
    world.add(dust);

    // ── interaction ──
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.x = Math.max(-1, Math.min(1, e.gamma / 30));
      target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.9 ? 9.2 : 8;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    let last = performance.now();
    let elapsed = 0;
    let raf = 0;
    let intro = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) {
        last = performance.now();
        return;
      }
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;
      const motion = reduceMotion ? 0.15 : 1;

      intro = Math.min(1, intro + dt * 0.8);
      const e = 1 - Math.pow(1 - intro, 3);
      world.scale.setScalar(0.8 + 0.2 * e);

      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      world.rotation.y = current.x * 0.3;
      world.rotation.x = current.y * 0.18;

      steam.forEach((p) => {
        p.life += dt * p.speed * motion;
        if (p.life > 1) {
          p.life = 0;
          p.x = (Math.random() - 0.5) * 1.1;
        }
        const l = p.life;
        p.s.position.set(p.x + Math.sin(t + p.drift * 10) * 0.18 + p.drift * l, -0.2 + l * 2.3, 1.2);
        p.s.scale.setScalar(0.4 + l * 1.1);
        (p.s.material as THREE.SpriteMaterial).opacity = Math.sin(l * Math.PI) * 0.12 * e;
      });

      floaters.forEach((f) => {
        f.o.position.y = f.base.y + Math.sin(t * 0.9 + f.phase) * 0.12 * motion;
        f.o.position.x = f.base.x + Math.cos(t * 0.6 + f.phase) * 0.05 * motion;
        f.o.rotation.x += f.spin.x * dt * motion;
        f.o.rotation.y += f.spin.y * dt * motion;
        f.o.rotation.z += f.spin.z * dt * motion;
      });

      dust.rotation.z = t * 0.02 * motion;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
