import * as THREE from 'three';

export function initProfileCube(scene, textureLoader) {
    const tex = textureLoader.load('/myPicture.jpg', undefined, undefined, () => console.warn('Profile cube texture failed'));
    const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: 0.6, metalness: 0.0, emissive: 0x000000, emissiveIntensity: 0.0 });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), mat);
    cube.position.set(26, 5, 14);
    scene.add(cube);
    return cube;
}

export function updateProfileCube(cube, chapterDomRefs) {
    if (!cube || !chapterDomRefs[0]) return;
    const rect = chapterDomRefs[0].getBoundingClientRect();
    const vh = window.innerHeight;
    const center = rect.top + rect.height / 2;
    const rangeStart = vh + rect.height / 2;
    const rangeEnd = -rect.height / 2;
    let p = (rangeStart - center) / (rangeStart - rangeEnd);
    if (p < 0) p = 0; else if (p > 1) p = 1;
    const e = p * p * (3 - 2 * p);
    const startX = 0, endX = 110;
    const startZ = 5, endZ = 150;
    const startY = -15, endY = 40;
    cube.position.x = THREE.MathUtils.lerp(startX, endX, e * 0.55);
    cube.position.z = THREE.MathUtils.lerp(startZ, endZ, e * 0.48);
    cube.position.y = THREE.MathUtils.lerp(startY, endY, e * 0.45) + Math.sin(Date.now() * 0.001) * 1.6;
    cube.rotation.x += 0.01; cube.rotation.y += 0.013;
}
