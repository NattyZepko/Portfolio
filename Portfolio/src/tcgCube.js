import * as THREE from 'three';
import { objectManager } from './objectManager.js';

// Displays the Genshin TCG image as a cube only during chapter #4.
// Behavior mirrors the murder mystery cube: mid-range visibility band + fades.
export function registerTcgCube(chapters, scene, textureLoader, camera, targetChapterNumber = 4) {
    const chapterIndex = targetChapterNumber - 1; // 1-based to 0-based
    if (!chapters || chapterIndex < 0 || chapterIndex >= chapters.length) {
        console.warn('[TCG Cube] target chapter out of range, skipping');
        return;
    }
    const tex = textureLoader.load('TCG.png', () => {
        console.log('[TCG Cube] texture loaded');
    }, undefined, (err) => {
        console.error('[TCG Cube] texture failed', err);
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
    const size = 14;
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
            // Force left positioning regardless of chapter side
            const x = -30;
            // Lower vertical placement
            const y = -4 + (localProgress - visibleStart) * 15;
            const z = 12; // closer to camera
            meshRef.lookAt(camera.position);
            return { x, y, z, opacity };
        },
        onEnter: m => { m.visible = true; },
        onLeave: m => { m.visible = false; }
    });
}
