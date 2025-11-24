import * as THREE from 'three';

class ChapterObject {
    constructor({ mesh, chapterStart = 0, chapterEnd = Infinity, chapterIndex = null, pathFn, onEnter, onLeave }) {
        this.mesh = mesh;
        this.chapterStart = chapterStart;
        this.chapterEnd = chapterEnd;
        this.chapterIndex = chapterIndex !== null ? chapterIndex : chapterStart;
        this.pathFn = pathFn;
        this.onEnter = onEnter;
        this.onLeave = onLeave;
        this._active = false;
    }
    _computeLocalProgress(chapterDomRefs) {
        if (!chapterDomRefs[this.chapterIndex]) return 0;
        const el = chapterDomRefs[this.chapterIndex];
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const rangeStart = vh + rect.height / 2;
        const rangeEnd = -rect.height / 2;
        let p = (rangeStart - center) / (rangeStart - rangeEnd);
        if (p < 0) p = 0; else if (p > 1) p = 1;
        return p;
    }
    update(globalScroll, activeChapter, chapterDomRefs) {
        const shouldBeActive = activeChapter >= this.chapterStart && activeChapter <= this.chapterEnd;
        if (shouldBeActive && !this._active) { this._active = true; if (this.onEnter) this.onEnter(this.mesh); }
        if (!shouldBeActive && this._active) { this._active = false; if (this.onLeave) this.onLeave(this.mesh); }
        if (!this._active) return;
        const localProgress = this._computeLocalProgress(chapterDomRefs);
        if (this.pathFn) {
            const p = this.pathFn(globalScroll, activeChapter, this.mesh, localProgress) || {};
            if (p.x !== undefined) this.mesh.position.x = p.x;
            if (p.y !== undefined) this.mesh.position.y = p.y;
            if (p.z !== undefined) this.mesh.position.z = p.z;
            if (p.rx !== undefined) this.mesh.rotation.x += p.rx;
            if (p.ry !== undefined) this.mesh.rotation.y += p.ry;
            if (p.opacity !== undefined && this.mesh.material) {
                this.mesh.material.transparent = true;
                this.mesh.material.opacity = p.opacity;
                this.mesh.visible = p.opacity > 0.01;
            }
        }
    }
}

export const objectManager = {
    objects: [],
    register(objCfg) { this.objects.push(new ChapterObject(objCfg)); },
    update(scrollFraction, activeChapter, chapterDomRefs) { this.objects.forEach(o => o.update(scrollFraction, activeChapter, chapterDomRefs)); }
};
