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
    window.updateLoading && window.updateLoading('Registering chapter objects…', 0.7);
    registerChapterObjects(chapters, ctx.scene);
    window.updateLoading && window.updateLoading('Loading feature modules…', 0.75);
    const [murderMod, tcgMod, vrMod, mastermindMod, funMod, meMod] = await Promise.all([
        import('./murderMysteryCube.js'),
        import('./tcgCube.js'),
        import('./vrTrainingCube.js'),
        import('./mastermindCube.js'),
        import('./funCube.js'),
        import('./meCube.js')
    ]);
    window.updateLoading && window.updateLoading('Initializing cubes…', 0.82);
    murderMod.registerMurderMystery(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    tcgMod.registerTcgCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    vrMod.registerVrTrainingCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    mastermindMod.registerMastermindCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    funMod.registerFunCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    meMod.registerMeCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
    window.updateLoading && window.updateLoading('Finalizing layout…', 0.9);
    state.chapterDomRefs = Array.from(document.querySelectorAll('.chapter'));
    computeCameraScrollBounds(state);
    buildTimelineCurve(state.chapterDomRefs);
    attachTimelineListeners(state, buildTimelineCurve);
    window.updateLoading && window.updateLoading('Ready', 1);
});
