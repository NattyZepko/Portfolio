import './style.css';
import { setupScene } from './setupScene.js';
import { initProfileCube, updateProfileCube } from './profileCube.js';
import { state, initScroll, computeCameraScrollBounds } from './scroll.js';
import { loadMarkdown } from './markdown.js';
import { registerChapterObjects } from './chapterObjects.js';
import { buildTimelineCurve, attachTimelineListeners } from './timeline.js';
import { startAnimation } from './animation.js';
import { objectManager } from './objectManager.js';

const ctx = setupScene();
const profileCube = initProfileCube(ctx.scene, ctx.textureLoader);
initScroll(state, ctx.camera);
startAnimation({ ...ctx, profileCube, state, updateProfileCube, objectManager });

loadMarkdown({ state, torus: ctx.torus, tetra: ctx.tetra }).then(async chapters => {
    registerChapterObjects(chapters, ctx.scene);
    // Dynamic imports to shrink initial bundle
    const [murderMod, tcgMod, vrMod, mastermindMod, funMod, meMod] = await Promise.all([
        import('./murderMysteryCube.js'),
        import('./tcgCube.js'),
        import('./vrTrainingCube.js'),
        import('./mastermindCube.js'),
        import('./funCube.js'),
        import('./meCube.js')
    ]);
    murderMod.registerMurderMystery(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    tcgMod.registerTcgCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    vrMod.registerVrTrainingCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    mastermindMod.registerMastermindCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    funMod.registerFunCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    meMod.registerMeCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    state.chapterDomRefs = Array.from(document.querySelectorAll('.chapter'));
    computeCameraScrollBounds(state);
    buildTimelineCurve(state.chapterDomRefs);
    attachTimelineListeners(state, buildTimelineCurve);
    const loader = document.getElementById('loading'); if (loader) loader.classList.add('fade-out');
});
