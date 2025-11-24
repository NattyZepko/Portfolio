import * as THREE from 'three';
import { objectManager } from './objectManager.js';

// Shows a textured cube during a specific chapter (default: human chapter #3 -> index 2)
// Fades in/out based on how far the chapter has scrolled through the viewport.
export function registerMurderMystery(chapters, scene, textureLoader, camera, targetChapterNumber = 3) {
    const chapterIndex = targetChapterNumber - 1; // convert 1-based to 0-based
    if (!chapters || chapterIndex < 0 || chapterIndex >= chapters.length) {
        console.warn('[MurderMystery] target chapter out of range, skipping');
        return;
    }
    const panelIsLeft = (chapterIndex % 2 === 0);
    const mmTex = textureLoader.load('MurderMystery.jpg', () => {
        console.log('[MurderMystery] texture loaded');
    }, undefined, (err) => {
        console.error('[MurderMystery] texture failed', err);
    });
    mmTex.anisotropy = 8;
    const mmMat = new THREE.MeshStandardMaterial({
        map: mmTex,
        roughness: 0.55,
        metalness: 0.05,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        transparent: true,
        opacity: 0
    });
    const size = 14;
    const mmCube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mmMat);
    mmCube.position.set(0, 0, 0);
    scene.add(mmCube);

    objectManager.register({
        mesh: mmCube,
        chapterStart: chapterIndex,
        chapterEnd: chapterIndex,
        chapterIndex: chapterIndex,
        pathFn: (globalScroll, activeCh, meshRef, localProgress) => {
            if (activeCh !== chapterIndex) return { opacity: 0 };
            // Narrower visibility band: only mid portion of chapter while partially on screen
            const visibleStart = 0.30;
            const visibleEnd = 0.65;
            if (localProgress < visibleStart || localProgress > visibleEnd) return { opacity: 0 };
            const fadeSpan = 0.08;
            let opacity = 1;
            if (localProgress < visibleStart + fadeSpan) opacity = (localProgress - visibleStart) / fadeSpan;
            else if (localProgress > visibleEnd - fadeSpan) opacity = (visibleEnd - localProgress) / fadeSpan;
            if (opacity < 0) opacity = 0; if (opacity > 1) opacity = 1;

            // Bring cube closer and more centered so not cut off
            const x = panelIsLeft ? -30 : 30;
            // Lower vertical placement
            const y = -4 + (localProgress - visibleStart) * 15;
            const z = 12; // closer to camera
            // Face the camera for correct orientation
            meshRef.lookAt(camera.position);
            return { x, y, z, opacity };
        },
        onEnter: m => { m.visible = true; },
        onLeave: m => { m.visible = false; }
    });
}
