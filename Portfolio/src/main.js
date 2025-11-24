import './style.css';
import { setupScene } from './setupScene.js';
import { initProfileCube, updateProfileCube } from './profileCube.js';
import { state, initScroll, computeCameraScrollBounds } from './scroll.js';
import { loadMarkdown } from './markdown.js';
import { registerChapterObjects } from './chapterObjects.js';
import { registerMurderMystery } from './murderMysteryCube.js';
import { registerTcgCube } from './tcgCube.js';
import { registerVrTrainingCube } from './vrTrainingCube.js';
import { registerMastermindCube } from './mastermindCube.js';
import { registerFunCube } from './funCube.js';
import { registerMeCube } from './meCube.js';
import { buildTimelineCurve, attachTimelineListeners } from './timeline.js';
import { startAnimation } from './animation.js';
import { objectManager } from './objectManager.js';

const ctx = setupScene();
const profileCube = initProfileCube(ctx.scene, ctx.textureLoader);
initScroll(state, ctx.camera);
startAnimation({ ...ctx, profileCube, state, updateProfileCube, objectManager }); // ctx now includes tetra

loadMarkdown({ state, torus: ctx.torus, tetra: ctx.tetra }).then(chapters => {
  registerChapterObjects(chapters, ctx.scene);
  registerMurderMystery(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  registerTcgCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  registerVrTrainingCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  registerMastermindCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  registerFunCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  registerMeCube(chapters, ctx.scene, ctx.textureLoader, ctx.camera);
  state.chapterDomRefs = Array.from(document.querySelectorAll('.chapter'));
  computeCameraScrollBounds(state);
  buildTimelineCurve(state.chapterDomRefs);
  attachTimelineListeners(state, buildTimelineCurve);
});
