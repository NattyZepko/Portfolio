export function buildTimelineCurve(chapterDomRefs) {
    if (!chapterDomRefs || !chapterDomRefs.length) return;
    const svg = ensureTimelineSvg();
    let path = svg.querySelector('path');
    if (!path) { path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); svg.appendChild(path); }
    const points = chapterDomRefs.map(el => {
        const rect = el.getBoundingClientRect();
        const absTop = window.scrollY + rect.top;
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = absTop + rect.height / 2;
        const isLeft = el.classList.contains('chapter-left');
        return { x: cx, y: cy, left: isLeft };
    });
    if (!points.length) return;
    const curveMagBase = Math.min(140, window.innerWidth * 0.12);
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1]; const p1 = points[i]; const dy = p1.y - p0.y; const segMag = curveMagBase * 0.75 + Math.min(180, Math.abs(dy) * 0.18); const dir = p1.left ? -1 : 1;
        const c1x = p0.x + dir * segMag * 0.55; const c2x = p1.x + dir * segMag * 0.55; const c1y = p0.y + dy * 0.38; const c2y = p0.y + dy * 0.62;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    path.setAttribute('d', d);
    const totalLen = path.getTotalLength();
    path.style.strokeDasharray = `${totalLen}`; path.style.strokeDashoffset = `${totalLen}`;
    if (!path.__animatedOnce) {
        path.__animatedOnce = true;
        path.animate([{ strokeDashoffset: totalLen }, { strokeDashoffset: 0 }], { duration: 1600, easing: 'ease-out', fill: 'forwards' });
    } else { path.style.strokeDashoffset = '0'; }
}

function ensureTimelineSvg() {
    let svg = document.getElementById('timeline-svg');
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('id', 'timeline-svg'); document.body.appendChild(svg); }
    const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    svg.setAttribute('width', String(window.innerWidth));
    svg.setAttribute('height', String(docH));
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${docH}`);
    svg.style.position = 'absolute'; svg.style.left = '0'; svg.style.top = '0'; svg.style.pointerEvents = 'none';
    svg.style.zIndex = '0';
    const style = svg.querySelector('style') || document.createElement('style');
    style.textContent = 'path{stroke:rgba(255,255,255,0.35);stroke-width:2.4;fill:none;filter:drop-shadow(0 0 6px rgba(255,255,255,0.25))}';
    if (!style.parentNode) svg.appendChild(style);
    return svg;
}

export function attachTimelineListeners(state, buildFn) {
    window.addEventListener('resize', () => buildFn(state.chapterDomRefs));
    window.addEventListener('scroll', () => {
        if (!window.__timelineRAF) {
            window.__timelineRAF = requestAnimationFrame(() => {
                buildFn(state.chapterDomRefs);
                window.__timelineRAF = null;
            });
        }
    }, { passive: true });
}
