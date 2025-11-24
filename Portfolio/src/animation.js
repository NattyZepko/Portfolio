import * as THREE from 'three';

export function startAnimation({ scene, camera, composer, torus, tetra, stars, controls, profileCube, state, updateProfileCube, objectManager }) {
    const flyInStart = 0.2, flyByPoint = 0.55, flyOutEnd = 0.85;
    const flyStartZ = -400, flyNearZ = 10, flyExitZ = 60;
    const flyStartX = 0, flyNearX = 5, flyExitX = 140;
    const flyStartY = 0, flyNearY = 6, flyExitY = 25;
    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.01; torus.rotation.y += 0.005; torus.rotation.z += 0.01;
        const sf = state.scrollFraction;
        let tx, ty, tz;
        if (sf < flyInStart) { const a = sf / flyInStart; const e = a * a * (3 - 2 * a); tz = THREE.MathUtils.lerp(flyStartZ, flyStartZ, e); tx = flyStartX; ty = flyStartY; }
        else if (sf < flyByPoint) { const a = (sf - flyInStart) / (flyByPoint - flyInStart); const e = a * a * (3 - 2 * a); tz = THREE.MathUtils.lerp(flyStartZ, flyNearZ, e); tx = THREE.MathUtils.lerp(flyStartX, flyNearX, e); ty = THREE.MathUtils.lerp(flyStartY, flyNearY, e); }
        else if (sf < flyOutEnd) { const a = (sf - flyByPoint) / (flyOutEnd - flyByPoint); const e = a * a * (3 - 2 * a); tz = THREE.MathUtils.lerp(flyNearZ, flyExitZ, e); tx = THREE.MathUtils.lerp(flyNearX, flyExitX, e); ty = THREE.MathUtils.lerp(flyNearY, flyExitY, e); }
        else { tz = flyExitZ; tx = flyExitX; ty = flyExitY; }
        const wobble = Math.sin(Date.now() * 0.001) * 1.5; const par = state._getParallax ? state._getParallax() : { x: 0, y: 0 };
        torus.position.x = tx + par.x * 0.3; torus.position.y = ty + wobble + par.y * 0.3; torus.position.z = tz;

        // Tetrahedron: ensure visibility near end of scroll and while last chapter active.
        if (state.chapterDomRefs && state.chapterDomRefs.length && tetra) {
            const lastIdx = state.chapterDomRefs.length - 1;
            const lastActive = state.activeChapter === lastIdx;
            let chapterProgress = 0;
            if (lastActive) {
                const el = state.chapterDomRefs[lastIdx];
                const rect = el.getBoundingClientRect();
                const vh = window.innerHeight;
                const center = rect.top + rect.height / 2;
                const rangeStart = vh + rect.height / 2;
                const rangeEnd = -rect.height / 2;
                chapterProgress = (rangeStart - center) / (rangeStart - rangeEnd);
                if (chapterProgress < 0) chapterProgress = 0; else if (chapterProgress > 1) chapterProgress = 1;
            }
            // Combine global end scroll with chapter progress for robustness.
            const sfEndStart = 0.80; // start showing if overall scroll near end even if chapter not intersecting yet
            const globalProgress = sf > sfEndStart ? (sf - sfEndStart) / (1 - sfEndStart) : 0;
            // Choose driver: if chapter is active use its progress, else use global end progress.
            const driver = lastActive ? chapterProgress : globalProgress;
            if (driver <= 0) { tetra.visible = false; tetra.material.opacity = 0; }
            else {
                // Flight window inside driver 0..1
                const flightStart = 0.15, flightEnd = 0.92;
                if (driver < flightStart || driver > flightEnd) { tetra.visible = false; tetra.material.opacity = 0; }
                else {
                    const local = (driver - flightStart) / (flightEnd - flightStart); // 0..1
                    // Path entirely in front of camera (negative z values) so it's visible.
                    const inOutSplit = 0.55;
                    let ttx, tty, ttz;
                    if (local < inOutSplit) {
                        const a = local / inOutSplit; const e = a * a * (3 - 2 * a);
                        // Entry from +X, far negative Z (behind torus) sliding inward
                        ttx = THREE.MathUtils.lerp(160, 35, e);
                        ttz = THREE.MathUtils.lerp(-120, -14, e);
                        tty = THREE.MathUtils.lerp(52, 26, e);
                    } else {
                        const a = (local - inOutSplit) / (1 - inOutSplit); const e = a * a * (3 - 2 * a);
                        // Exit sweeping past -X and slightly deeper
                        ttx = THREE.MathUtils.lerp(35, -130, e);
                        ttz = THREE.MathUtils.lerp(-14, -48, e);
                        tty = THREE.MathUtils.lerp(26, 54, e);
                    }
                    const wobbleTet = Math.sin(Date.now() * 0.0013 + local * 5.4) * 1.3;
                    tetra.position.set(ttx + par.x * 0.25, tty + wobbleTet + par.y * 0.25, ttz);
                    tetra.rotation.x += 0.007; tetra.rotation.y += 0.009; tetra.rotation.z += 0.006;
                    // Fade near start/end
                    const fadeInSpan = 0.12, fadeOutSpan = 0.18; let op = 1;
                    if (local < fadeInSpan) op = local / fadeInSpan; else if (local > 1 - fadeOutSpan) op = (1 - local) / fadeOutSpan;
                    if (op < 0) op = 0; if (op > 1) op = 1;
                    tetra.material.opacity = op; tetra.visible = op > 0.02;
                }
            }
        }
        objectManager.update(state.scrollFraction, state.activeChapter, state.chapterDomRefs);
        updateProfileCube(profileCube, state.chapterDomRefs);
        const t = Date.now() * 0.00045;
        for (let i = 0; i < stars.length; i++) { const star = stars[i]; const phase = (star.position.x * 0.013 + star.position.y * 0.017 + star.position.z * 0.019); const flicker = 1.15 + 0.35 * Math.sin(t + phase); star.material.emissiveIntensity = flicker; }
        controls.update(); composer.render();
    }
    animate();
}
