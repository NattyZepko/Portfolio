import { marked } from 'marked';
import { state } from './scroll.js';

export async function loadMarkdown({ state, torus, tetra }) {
    window.updateLoading && window.updateLoading('Fetching markdown…', 0.45);
    let md = '';
    try {
        const res = await fetch('./aboutme.md');
        if (!res.ok) throw new Error(`aboutme.md fetch failed: ${res.status}`);
        md = await res.text();
    } catch (err) {
        console.error('[Markdown] Failed to load aboutme.md', err);
        const content = document.getElementById('content');
        content.innerHTML = `<section class="chapter chapter-first" data-chapter="0"><h2><span class="chapter-number">01</span> Welcome</h2><p>Content failed to load. Please retry or check your connection.</p></section>`;
        state.chapterDomRefs = Array.from(document.querySelectorAll('.chapter'));
        if (typeof state.activeChapter !== 'number') state.activeChapter = 0;
        const loader = document.getElementById('loading'); if (loader) loader.classList.add('fade-out');
        return [];
    }
    window.updateLoading && window.updateLoading('Parsing markdown…', 0.55);
    const content = document.getElementById('content');
    const headerRegex = /^#\s.+$/;
    const lines = md.split(/\r?\n/);
    const chapters = []; let current = null;
    for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (headerRegex.test(line)) { if (current && current.body.length) chapters.push(current); current = { title: line.replace(/^#\s*/, '').trim(), body: [] }; }
        else if (current) {
            if (line.trim() === '') { const prev = current.body[current.body.length - 1]; if (prev && prev.trim() === '') continue; }
            current.body.push(line);
        }
    }
    if (current && current.body.length) chapters.push(current);
    const chapterHtml = chapters.map((ch, i) => {
        const sectionInner = marked.parse(ch.body.join('\n').trim());
        const safeTitle = ch.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const sideClass = i % 2 === 0 ? 'chapter-left' : 'chapter-right';
        const firstClass = i === 0 ? 'chapter-first' : '';
        const numberSpan = `<span class="chapter-number">${(i + 1).toString().padStart(2, '0')}</span>`;
        return `<section class="chapter ${sideClass} ${firstClass}" data-chapter="${i}"><h2>${numberSpan} ${safeTitle}</h2>${sectionInner}</section>`;
    }).join('\n');
    content.innerHTML = chapterHtml;
    requestAnimationFrame(() => { content.classList.add('visible'); const first = content.querySelector('.chapter'); if (first) first.classList.add('visible'); });
    const chaptersEls = Array.from(document.querySelectorAll('.chapter'));
    state.chapterDomRefs = chaptersEls;
    let activeChapter = -1;
    const chapterColors = [0xff6347, 0x4caf50, 0x2196f3, 0xffc107, 0x9c27b0, 0xffffff, 0x00bcd4];
    function setActiveChapter(index) {
        if (index === activeChapter) return;
        if (activeChapter >= 0 && chaptersEls[activeChapter]) chaptersEls[activeChapter].classList.remove('active');
        activeChapter = index; state.activeChapter = index;
        if (activeChapter >= 0 && chaptersEls[activeChapter]) chaptersEls[activeChapter].classList.add('active');
        const colorHex = chapterColors[index % chapterColors.length];
        if (torus && torus.material && torus.material.emissive) torus.material.emissive.setHex(colorHex);
        if (tetra && tetra.material && tetra.material.emissive) tetra.material.emissive.setHex(colorHex);
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); const idx = parseInt(entry.target.getAttribute('data-chapter'), 10); setActiveChapter(idx); } });
    }, { threshold: 0.35 });
    chaptersEls.forEach(el => observer.observe(el));
    if (chaptersEls.length) setActiveChapter(0);
    window.updateLoading && window.updateLoading('Markdown ready', 0.65);
    return chapters;
}
