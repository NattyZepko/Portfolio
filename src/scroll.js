export const state = {
    scrollFraction: 0,
    activeChapter: -1,
    chapterDomRefs: [],
    cameraScrollStart: 0,
    cameraScrollEnd: 0
};

const baseCameraZ = 60;
const cameraTravel = -30;
let torusParallaxX = 0;
let torusParallaxY = 0;

export function initScroll(st, camera) {
    camera.position.z = baseCameraZ;
    function update() {
        const y = window.scrollY;
        const deadZone = 40;
        if (st.cameraScrollEnd <= st.cameraScrollStart) {
            st.scrollFraction = 0;
        } else if (y <= st.cameraScrollStart + deadZone) {
            st.scrollFraction = 0;
        } else if (y >= st.cameraScrollEnd) {
            st.scrollFraction = 1;
        } else {
            st.scrollFraction = (y - (st.cameraScrollStart + deadZone)) / (st.cameraScrollEnd - (st.cameraScrollStart + deadZone));
            if (st.scrollFraction < 0) st.scrollFraction = 0;
            if (st.scrollFraction > 1) st.scrollFraction = 1;
        }
        camera.position.z = baseCameraZ + st.scrollFraction * cameraTravel;
        torusParallaxX = Math.sin(st.scrollFraction * Math.PI * 2) * 5;
        torusParallaxY = Math.cos(st.scrollFraction * Math.PI) * 3;
    }
    update();
    window.addEventListener('scroll', update);
    st._updateCamera = update;
    st._getParallax = () => ({ x: torusParallaxX, y: torusParallaxY });
}

export function computeCameraScrollBounds(st) {
    if (!st.chapterDomRefs.length) return;
    const first = st.chapterDomRefs[0];
    const last = st.chapterDomRefs[st.chapterDomRefs.length - 1];
    const firstTop = first.offsetTop;
    const lastBottom = last.offsetTop + last.offsetHeight;
    const bufferStart = 120;
    const bufferEnd = 120;
    st.cameraScrollStart = Math.max(0, firstTop - bufferStart);
    st.cameraScrollEnd = Math.max(st.cameraScrollStart + 1, lastBottom - window.innerHeight + bufferEnd);
    if (st._updateCamera) st._updateCamera();
}
