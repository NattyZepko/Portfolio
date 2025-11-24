import * as THREE from 'three';
import spaceImg from '../space.jpg';
import donutTex from '../donut texture map.jpg';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('background'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    camera.position.setZ(30);

    const textureLoader = new THREE.TextureLoader();
    const donutTexture = textureLoader.load(donutTex);
    donutTexture.wrapS = THREE.RepeatWrapping; donutTexture.wrapT = THREE.RepeatWrapping; donutTexture.anisotropy = 8;
    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(10, 3, 16, 100),
        new THREE.MeshStandardMaterial({ map: donutTexture, roughness: 0.6, metalness: 0.2, emissive: new THREE.Color(0x111111), emissiveIntensity: 0.6 })
    );
    scene.add(torus);

    // Late-appearance tetrahedron (same texture as donut)
    const tetra = new THREE.Mesh(
        new THREE.TetrahedronGeometry(8, 0),
        new THREE.MeshStandardMaterial({ map: donutTexture, roughness: 0.6, metalness: 0.2, emissive: new THREE.Color(0x111111), emissiveIntensity: 0.6, transparent: true, opacity: 0 })
    );
    // Start far offscreen; animation loop will position later
    tetra.position.set(1000, 1000, 1000);
    tetra.visible = false;
    scene.add(tetra);

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.1, 0.75, 0.15);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass); composer.addPass(bloomPass);

    const pointLight = new THREE.PointLight(0xffffff); pointLight.position.set(10, 10, 10);
    const ambientLight = new THREE.AmbientLight(0xffffff); ambientLight.position.set(5, 5, 15);
    scene.add(pointLight, ambientLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; controls.enablePan = false;
    renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); }, { passive: false });

    const stars = [];
    function addStar() {
        const star = new THREE.Mesh(
            new THREE.SphereGeometry(0.23, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0xfff8d6, emissive: 0xffd97a, emissiveIntensity: 1.4, roughness: 0.25, metalness: 0 })
        );
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(120));
        star.position.set(x, y, z); scene.add(star); stars.push(star);
    }
    Array(240).fill().forEach(addStar);
    const bgTexture = textureLoader.load(
        spaceImg,
        undefined,
        undefined,
        (err) => console.warn('[Scene] Background texture failed to load', err)
    );
    scene.background = bgTexture;

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); bloomPass.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, composer, bloomPass, torus, tetra, textureLoader, controls, stars };
}
