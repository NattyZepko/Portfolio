import * as THREE from 'three';
import { objectManager } from './objectManager.js';

export function registerChapterObjects(chapters, scene) {
    const chapterObjectConfigs = [
        { geom: () => new THREE.TorusKnotGeometry(4, 1, 120, 16), color: 0x7eb6ff },
        { geom: () => new THREE.IcosahedronGeometry(5, 0), color: 0xff8aa0 },
        { geom: () => new THREE.OctahedronGeometry(5, 0), color: 0xc7ff8a },
        { geom: () => new THREE.DodecahedronGeometry(5, 0), color: 0xffc15a },
        { geom: () => new THREE.TorusGeometry(6, 1.2, 24, 100), color: 0xad9bff }
    ];
    const maxChapterIndex = chapters.length - 1;
    for (let idx = 1; idx <= maxChapterIndex; idx++) {
        const cfg = chapterObjectConfigs[(idx - 1) % chapterObjectConfigs.length];
        const mesh = new THREE.Mesh(
            cfg.geom(),
            new THREE.MeshStandardMaterial({
                color: cfg.color,
                emissive: new THREE.Color(cfg.color).multiplyScalar(0.25),
                emissiveIntensity: 0.7,
                roughness: 0.4,
                metalness: 0.1
            })
        );
        mesh.position.set(1000, 1000, 1000);
        scene.add(mesh);
        const panelIsLeft = (idx % 2 === 0);
        objectManager.register({
            mesh,
            chapterStart: idx,
            chapterEnd: idx,
            chapterIndex: idx,
            pathFn: (globalScroll, activeCh, meshRef, localProgress) => {
                if (activeCh !== idx) return;
                const baseX = panelIsLeft ? 70 : -70;
                const driftX = panelIsLeft ? baseX + localProgress * 40 : baseX - localProgress * 40;
                const baseY = 14 + localProgress * 28 + Math.sin(Date.now() * 0.0014 + idx) * 2.5;
                const baseZ = 34 + localProgress * 30 + Math.sin(Date.now() * 0.0009 + idx) * 4;
                return { x: driftX, y: baseY, z: baseZ, rx: 0.004, ry: 0.005 };
            },
            onEnter: m => { m.visible = true; },
            onLeave: m => { m.visible = false; }
        });
    }
}
