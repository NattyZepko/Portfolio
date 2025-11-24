import * as THREE from 'three';
import { objectManager } from './objectManager.js';

// Me chapter cube (chapter #8 -> index 7), forced RIGHT side.
export function registerMeCube(chapters, scene, textureLoader, camera, targetChapterNumber = 8) {
    const chapterIndex = targetChapterNumber - 1;
    if (!chapters || chapterIndex < 0 || chapterIndex >= chapters.length) {
        console.warn('[Me Cube] target chapter out of range, skipping');
        return;
    }
    const tex = textureLoader.load('me.jpg', () => {
        console.log('[Me Cube] texture loaded');
    }, undefined, (err) => {
        console.error('[Me Cube] texture failed', err);
    });
    tex.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.55,
        metalness: 0.05,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        transparent: true,
        opacity: 0
    });
    const size = 10; // reduced size
    const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    objectManager.register({
        mesh: cube,
        chapterStart: chapterIndex,
        chapterEnd: chapterIndex,
        chapterIndex: chapterIndex,
        pathFn: (globalScroll, activeCh, meshRef, localProgress) => {
            if (activeCh !== chapterIndex) return { opacity: 0 };
            const visibleStart = 0.30;
            const visibleEnd = 0.65;
            if (localProgress < visibleStart || localProgress > visibleEnd) return { opacity: 0 };
            const fadeSpan = 0.08;
            let opacity = 1;
            if (localProgress < visibleStart + fadeSpan) opacity = (localProgress - visibleStart) / fadeSpan;
            else if (localProgress > visibleEnd - fadeSpan) opacity = (visibleEnd - localProgress) / fadeSpan;
            if (opacity < 0) opacity = 0; if (opacity > 1) opacity = 1;
            const x = 20; // slightly closer to center
            const y = -4 + (localProgress - visibleStart) * 15; // lowered baseline movement
            const z = 12;
            meshRef.lookAt(camera.position);
            return { x, y, z, opacity };
        },
        onEnter: m => { m.visible = true; },
        onLeave: m => { m.visible = false; }
    });
}
