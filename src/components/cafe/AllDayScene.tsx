"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { dayChapters } from "@/lib/cafe";

gsap.registerPlugin(ScrollTrigger);

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#6e4026";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 48; i++) {
    ctx.strokeStyle = `rgba(28, 14, 8, ${0.07 + (i % 5) * 0.03})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    const y = i * 11;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(140, y + 10, 360, y - 12, 512, y + 4);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

function makeCup() {
  const group = new THREE.Group();
  const bodyPts = [
    new THREE.Vector2(0.1, 0),
    new THREE.Vector2(0.16, 0.02),
    new THREE.Vector2(0.18, 0.06),
    new THREE.Vector2(0.2, 0.26),
    new THREE.Vector2(0.22, 0.3),
    new THREE.Vector2(0.19, 0.3),
  ];
  const body = new THREE.Mesh(
    new THREE.LatheGeometry(bodyPts, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xf3ebe1,
      roughness: 0.28,
      metalness: 0.02,
      clearcoat: 0.4,
    }),
  );
  body.castShadow = true;
  group.add(body);

  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.155, 0.04, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0x3b2214,
      roughness: 0.15,
      metalness: 0.05,
    }),
  );
  liquid.position.y = 0.25;
  group.add(liquid);

  const foam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.15, 0.025, 32),
    new THREE.MeshStandardMaterial({ color: 0xf4e6d0, roughness: 0.7 }),
  );
  foam.position.y = 0.275;
  group.add(foam);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.016, 10, 24, Math.PI),
    new THREE.MeshPhysicalMaterial({
      color: 0xf3ebe1,
      roughness: 0.28,
      clearcoat: 0.4,
    }),
  );
  handle.rotation.y = Math.PI / 2;
  handle.position.set(0.22, 0.16, 0);
  handle.castShadow = true;
  group.add(handle);

  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.3, 0.025, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xf7f1ea,
      roughness: 0.35,
    }),
  );
  saucer.position.y = -0.02;
  saucer.receiveShadow = true;
  group.add(saucer);
  return group;
}

function makePlate() {
  const group = new THREE.Group();
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.42, 0.04, 48),
    new THREE.MeshPhysicalMaterial({
      color: 0xf4eee6,
      roughness: 0.32,
      clearcoat: 0.25,
    }),
  );
  plate.receiveShadow = true;
  plate.castShadow = true;
  group.add(plate);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.018, 8, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xeee4d8, roughness: 0.4 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  group.add(rim);
  return group;
}

function makePasta() {
  const group = makePlate();
  const cream = new THREE.MeshStandardMaterial({
    color: 0xe8d5a3,
    roughness: 0.55,
  });
  for (let i = 0; i < 14; i++) {
    const pts: THREE.Vector3[] = [];
    const seed = i * 1.7;
    for (let k = 0; k < 7; k++) {
      pts.push(
        new THREE.Vector3(
          Math.sin(k * 0.9 + seed) * (0.12 + (k % 3) * 0.05),
          0.04 + k * 0.012,
          Math.cos(k * 0.7 + seed * 0.6) * (0.12 + (k % 2) * 0.06),
        ),
      );
    }
    const noodle = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.016, 6, false),
      cream,
    );
    noodle.castShadow = true;
    group.add(noodle);
  }
  const pepper = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.8 }),
  );
  pepper.position.set(0.12, 0.08, 0.08);
  pepper.scale.set(1.4, 0.35, 1.4);
  group.add(pepper);
  return group;
}

function makeSteak() {
  const group = makePlate();
  const steak = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 28, 18),
    new THREE.MeshStandardMaterial({ color: 0x6a2e22, roughness: 0.62 }),
  );
  steak.scale.set(1.45, 0.32, 1.05);
  steak.position.y = 0.07;
  steak.castShadow = true;
  group.add(steak);
  const grill = new THREE.MeshStandardMaterial({ color: 0x2a1510, roughness: 0.9 });
  for (let i = -2; i <= 2; i++) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.01, 0.03), grill);
    mark.position.set(0, 0.145, i * 0.08);
    mark.rotation.y = 0.18;
    group.add(mark);
  }
  const veg = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x6b7a3a, roughness: 0.7 }),
  );
  veg.position.set(0.28, 0.08, -0.12);
  veg.scale.set(1, 0.6, 1.2);
  group.add(veg);
  return group;
}

function makeCake() {
  const group = new THREE.Group();
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 0.06, 32),
    new THREE.MeshStandardMaterial({ color: 0xd9c4a0, roughness: 0.4, metalness: 0.3 }),
  );
  stand.position.y = 0.03;
  group.add(stand);
  const cake = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.34, 0.26, 28, 1, false, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ color: 0xc9a56a, roughness: 0.7 }),
  );
  cake.position.y = 0.2;
  cake.castShadow = true;
  group.add(cake);
  const frosting = new THREE.Mesh(
    new THREE.CylinderGeometry(0.345, 0.345, 0.05, 28, 1, false, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.55 }),
  );
  frosting.position.y = 0.335;
  group.add(frosting);
  const pistachio = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x8aa35a, roughness: 0.6 }),
  );
  pistachio.position.set(0.08, 0.38, 0.1);
  group.add(pistachio);
  return group;
}

function makeTable(wood: THREE.Texture | null) {
  const group = new THREE.Group();
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(2.55, 2.55, 0.1, 64),
    new THREE.MeshStandardMaterial({
      map: wood ?? undefined,
      color: 0x8a5533,
      roughness: 0.72,
    }),
  );
  top.receiveShadow = true;
  top.castShadow = true;
  top.position.y = 0;
  group.add(top);
  const apron = new THREE.Mesh(
    new THREE.CylinderGeometry(2.48, 2.4, 0.12, 64),
    new THREE.MeshStandardMaterial({ color: 0x5c351f, roughness: 0.8 }),
  );
  apron.position.y = -0.1;
  group.add(apron);
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.34, 1.35, 24),
    new THREE.MeshStandardMaterial({ color: 0x4a2c18, roughness: 0.75 }),
  );
  pedestal.position.y = -0.78;
  pedestal.castShadow = true;
  group.add(pedestal);
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.78, 0.08, 32),
    new THREE.MeshStandardMaterial({ color: 0x3d2416, roughness: 0.8 }),
  );
  base.position.y = -1.44;
  group.add(base);
  return group;
}

function formatClock(progress: number) {
  const totalMinutes = 7 * 60 + progress * 17 * 60;
  const clamped = Math.min(24 * 60 - 1, Math.max(0, totalMinutes));
  const h = Math.floor(clamped / 60) % 24;
  const m = Math.floor(clamped % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AllDayScene() {
  const pinRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<HTMLParagraphElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pin = pinRef.current;
    if (!canvas || !pin) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ead9c6");
    scene.fog = new THREE.Fog("#ead9c6", 7, 16);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, 2.35, 5.4);

    const wood = woodTexture();
    const table = makeTable(wood);
    table.position.y = 0.2;
    scene.add(table);

    const dishes = [
      { mesh: makeCup(), angle: 0 },
      { mesh: makePasta(), angle: Math.PI * 0.5 },
      { mesh: makeSteak(), angle: Math.PI },
      { mesh: makeCake(), angle: Math.PI * 1.5 },
    ];
    const radius = 1.35;
    dishes.forEach(({ mesh, angle }) => {
      mesh.position.set(Math.sin(angle) * radius, 0.28, Math.cos(angle) * radius);
      mesh.rotation.y = -angle;
      table.add(mesh);
    });

    const hemi = new THREE.HemisphereLight(0xfff1dd, 0x6b4a32, 0.85);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffe6c2, 1.35);
    key.position.set(3.2, 5.4, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 16;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    scene.add(key);
    const fill = new THREE.PointLight(0xc45c3a, 6, 10, 2);
    fill.position.set(-2.2, 2.4, -1.4);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffd9a0, 4, 8, 2);
    rim.position.set(1.6, 1.8, -2.6);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(8, 48),
      new THREE.ShadowMaterial({ opacity: 0.22 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.28;
    floor.receiveShadow = true;
    scene.add(floor);

    const state = { progress: 0 };

    const apply = (p: number) => {
      const orbit = p * Math.PI * 2;
      const dist = 5.15 - p * 0.35;
      const height = 2.45 - Math.sin(p * Math.PI) * 0.35;
      camera.position.set(Math.sin(orbit) * dist, height, Math.cos(orbit) * dist);
      camera.lookAt(0, 0.55, 0);
      table.rotation.y = p * 0.15;
      key.color.setHSL(0.08 - p * 0.02, 0.55, 0.78 - p * 0.12);
      key.intensity = 1.35 - p * 0.25;
      fill.intensity = 4 + p * 8;
      scene.background = new THREE.Color().setHSL(0.08, 0.28 - p * 0.08, 0.82 - p * 0.18);
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.copy(scene.background as THREE.Color);
      }
      dishes.forEach(({ mesh }, i) => {
        const center = i / 4;
        const closeness = 1 - Math.min(1, Math.abs(p - (center + 0.12)) * 3.2);
        mesh.position.y = 0.28 + closeness * 0.12;
        mesh.scale.setScalar(0.92 + closeness * 0.14);
      });
      if (clockRef.current) clockRef.current.textContent = formatClock(p);
      chapterRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = 1 - Math.min(1, Math.abs(p - (i + 0.5) / 4) * 4.2);
        el.style.opacity = String(0.12 + local * 0.88);
        el.style.transform = `translateY(${(1 - local) * 18}px)`;
      });
    };

    const resize = () => {
      const { clientWidth, clientHeight } = pin;
      const w = Math.max(1, clientWidth);
      const h = Math.max(1, clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();

    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };
    loop();

    apply(0);

    let trigger: ScrollTrigger | undefined;
    if (!reduced) {
      trigger = ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "+=420%",
        pin: true,
        scrub: 1.1,
        anticipatePin: 1,
        onUpdate: (self) => {
          state.progress = self.progress;
          apply(self.progress);
        },
      });
    } else {
      apply(0.18);
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      trigger?.kill();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m instanceof THREE.Material) m.dispose();
          });
        }
      });
      wood?.dispose();
    };
  }, []);

  return (
    <section
      ref={pinRef}
      id="day"
      className="relative h-[100svh] overflow-hidden bg-[#ead9c6]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(42,28,20,0.18)_100%)]" />

      <div className="absolute left-5 top-8 z-10 md:left-10">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-clay">
          Scroll the table
        </p>
        <p
          ref={clockRef}
          className="mt-2 font-[family-name:var(--font-cafe-display)] text-5xl text-espresso md:text-7xl"
        >
          07:00
        </p>
        <p className="mt-1 text-sm text-olive">Aguirre Ave · all day</p>
      </div>

      <div className="absolute bottom-8 left-5 right-5 z-10 md:bottom-12 md:left-auto md:right-10 md:w-[22rem]">
        <div className="relative min-h-[8.5rem]">
          {dayChapters.map((chapter, i) => (
            <div
              key={chapter.clock}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
              className="absolute inset-x-0 top-0 border-l-2 border-terracotta/70 pl-4"
              style={{ opacity: i === 0 ? 1 : 0.12 }}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-terracotta">
                {chapter.clock}
              </p>
              <p className="mt-1 font-[family-name:var(--font-cafe-display)] text-2xl text-espresso">
                {chapter.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-olive">{chapter.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
