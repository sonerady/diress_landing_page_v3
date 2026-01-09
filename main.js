import './style.css'
import * as THREE from 'three'

// State
let currentScene = 0;
let currentStep = 0;

// Random Virtual Model variants for Scene 0 (Desktop only)
// Each variant maps to a scene: 0=Original(no scene), 1=Scene1, 2=Scene2, 3=Scene3
const virtualModelVariants = [
    { video: '/assets/virtual_model_scene.mp4', front: '/assets/virtual_model_front.png', sceneIndex: null },      // Original (doesn't match any scene)
    { video: '/assets/virtual_model_scene_1.mp4', front: '/assets/virtual_model_front_1.png', sceneIndex: 1 },  // Scene 1 style
    { video: '/assets/virtual_model_scene_2.mp4', front: '/assets/virtual_model_front_2.png', sceneIndex: 2 },  // Scene 2 style
    { video: '/assets/virtual_model_scene_3.mp4', front: '/assets/virtual_model_front_3.png', sceneIndex: 3 }   // Scene 3 style
];

// Select random variant for Virtual Model (Desktop only)
// Uses localStorage to avoid showing same variant on consecutive visits
const isMobileDevice = window.innerWidth <= 768;
let randomVariantIndex = 0;

if (!isMobileDevice) {
    // Get last used variant from localStorage
    const lastVariantIndex = localStorage.getItem('diress_last_variant');

    // Get available indices (all except the last used one)
    let availableIndices = virtualModelVariants.map((_, i) => i);
    if (lastVariantIndex !== null) {
        availableIndices = availableIndices.filter(i => i !== parseInt(lastVariantIndex));
    }

    // Select random from available
    randomVariantIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // Save current selection for next visit
    localStorage.setItem('diress_last_variant', randomVariantIndex.toString());
}

const selectedVariant = virtualModelVariants[randomVariantIndex];
// Track which scene to skip in AI Background (because it's shown in Virtual Model)
const skipSceneInBackground = selectedVariant.sceneIndex;

const scenes = [
    '/assets/center_image_2.png',           // Scene 0 (index 0)
    '/assets/center_image_scene_1.png',     // Scene 1 (index 1)
    '/assets/center_image_scene_2.png',     // Scene 2 (index 2)
    '/assets/center_image_scene_3.png',     // Scene 3 (index 3)
    '/assets/center_image_scene_4.png'      // Scene 4 (index 4) - Greek Island
];

// Foreground layers for parallax (Scene 0=Virtual Model, Scene 1=1, Scene 2=2, Scene 3=3, Scene 4=4)
const foregroundImages = [
    selectedVariant.front,                                   // Scene 0 (Virtual Model - random)
    '/assets/center_image_scene_1_front_people.png',         // Scene 1
    '/assets/center_image_scene_2_front_people.png',         // Scene 2
    '/assets/center_image_scene_3_front_people.png',         // Scene 3
    '/assets/center_image_scene_4_front_people.png'          // Scene 4 (Greek Island)
];
const steps = [
    { label: 'AI Model', subtitle: 'Generate virtual fashion models' },
    { label: 'AI Background', subtitle: '5000+ professional scenes' },
    { label: 'AI Pose', subtitle: '1000+ dynamic poses' },
    { label: 'AI Customize', subtitle: 'Hair, skin, ethnicity & more' },
    { label: 'AI Retouch', subtitle: 'Pro-level photo editing' },
    { label: 'AI Colors', subtitle: 'Unlimited color variants' },
    { label: 'AI Export', subtitle: 'E-commerce ready visuals' },
    { label: 'AI Video', subtitle: 'Bring photos to life' }
];

// Customize Model Sub-steps
const subSteps = [
    { label: 'Hair Color', subtitle: 'Chrome & Pigment', description: 'Choose from natural tones to experimental pigments. Perfect color match for your brand aesthetic and target audience.' },
    { label: 'Hair Style', subtitle: 'Sculpt & Define', description: 'Select from thousands of premium hairstyles or let AI create the perfect look that complements your products.' },
    { label: 'Skin Tone', subtitle: 'Natural Radiance', description: 'Customize skin tones to represent diverse global audiences and maximize your market appeal worldwide.' },
    { label: 'Ethnicity', subtitle: 'Global Diversity', description: 'Tailor facial features and ethnic backgrounds with AI to match your target market demographics perfectly.' },
    { label: 'Mood', subtitle: 'Expressions & Vibes', description: 'Set the perfect expression - confident, friendly, serious, or playful - to match your campaign mood.' }
];
let currentSubStep = 0;

// Retouch Slider Data (Step 4) - Local Assets
// Before images: amateur-products-2 folder (.png)
// After images: results-products-2 folder (.JPG)
const retouchImages = [
    { before: '/assets/amateur-products-2/amateur-before-0.png', after: '/assets/results-products-2/amateur-after-0.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-1.png', after: '/assets/results-products-2/amateur-after-1.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-2.png', after: '/assets/results-products-2/amateur-after-2.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-3.png', after: '/assets/results-products-2/amateur-after-3.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-5.png', after: '/assets/results-products-2/amateur-after-5.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-6.png', after: '/assets/results-products-2/amateur-after-6.JPG' }
];

// Ecommerce Slider Data (Step 2)
const ecommerceSlides = [
    { label: 'Editorial Style', src: '/assets/editorial_1.png', alt: 'Editorial 1' },
    { label: 'Editorial Style', src: '/assets/editorial_2.png', alt: 'Editorial 2' },
    { label: 'Editorial Style', src: '/assets/editorial_3.png', alt: 'Editorial 3' },
    { label: 'Studio Style', src: '/assets/white_studio_2.png', alt: 'White Studio' },
    { label: 'Product Detail', src: '/assets/detail_product.png', alt: 'Detail Product' },
    { label: 'Ghost Mannequin', src: '/assets/ghost_mannequin.png', alt: 'Ghost Mannequin' }
];

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render slider with randomized images
function renderEcommerceSlider() {
    const slider = document.getElementById('results-slider');
    if (!slider) return;

    const shuffled = shuffleArray(ecommerceSlides);
    // Double for seamless loop
    const allSlides = [...shuffled, ...shuffled];

    slider.innerHTML = allSlides.map(slide => `
        <div class="result-slide">
            <span class="slide-label">${slide.label}</span>
            <img src="${slide.src}" alt="${slide.alt}">
        </div>
    `).join('');
}

// Render slider on page load for desktop
renderEcommerceSlider();

let isScrolling = false;

// Parallax State
let mouseX = 0;
let mouseY = 0;
// Smoothed mouse values for interpolation
let smoothedMouse = { x: 0, y: 0 };
// Flag to center parallax until user moves mouse after scene change
let isParallaxLocked = false;

const parallaxStrength = { background: 0.015, foreground: 0.04 };


// DOM Elements
const mainContainer = document.getElementById('main-container');
const scrollIndicator = document.getElementById('scroll-indicator');
const verticalSlider = document.getElementById('vertical-slider');
const magnifier = document.getElementById('magnifier');
const artWrapper = document.getElementById('art-wrapper');
const sceneSelector = document.getElementById('scene-selector');
const sceneThumbs = document.querySelectorAll('.scene-thumb');

// Three.js Setup
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Insert canvas
artWrapper.appendChild(renderer.domElement);
const canvas = renderer.domElement;
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '1'; // Behind gradients (50) and UI (100)

// Shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float progress;
uniform float opacity;
uniform float disableBlur;
uniform vec2 uvScale1;
uniform vec2 uvScale2;
uniform vec2 uvOffset; // Parallax Offset
varying vec2 vUv;

vec4 blur(sampler2D tex, vec2 uv, float amount) {
    vec4 color = vec4(0.0);
    float total = 0.0;
    float radius = amount * 0.02;
    for (float x = -2.0; x <= 2.0; x++) {
        for (float y = -2.0; y <= 2.0; y++) {
            vec2 offset = vec2(x, y) * radius;
            color += texture2D(tex, uv + offset);
            total += 1.0;
        }
    }
    return color / total;
}

void main() {
    // Apply parallax offset
    vec2 offsetUV = vUv - uvOffset;

    vec2 correctedUV1 = (offsetUV - 0.5) * uvScale1 + 0.5;
    vec2 correctedUV2 = (offsetUV - 0.5) * uvScale2 + 0.5;

    vec4 col1;
    vec4 col2;

    if (disableBlur > 0.5) {
        // Direct texture sampling - no blur
        col1 = texture2D(texture1, correctedUV1);
        col2 = texture2D(texture2, correctedUV2);
    } else {
        // Use blur effect
        float blurAmount = sin(progress * 3.14159);
        col1 = blur(texture1, correctedUV1, blurAmount);
        col2 = blur(texture2, correctedUV2, blurAmount);
    }

    vec4 finalColor = mix(col1, col2, progress);
    finalColor.a *= opacity;
    gl_FragColor = finalColor;
}
`;

// Texture Loader
const loader = new THREE.TextureLoader();

// Helper function to setup video looping
function setupVideoLoop(videoElement, sceneIndex) {
    // Force loop on ended
    videoElement.addEventListener('ended', () => {
        videoElement.currentTime = 0;
        videoElement.play().catch(() => {});
    });

    // Backup: check on timeupdate if near end, loop early
    videoElement.addEventListener('timeupdate', () => {
        if (videoElement.duration && videoElement.currentTime >= videoElement.duration - 0.1) {
            videoElement.currentTime = 0;
            videoElement.play().catch(() => {});
        }
    });

    // If video pauses unexpectedly while it should be playing, restart it
    videoElement.addEventListener('pause', () => {
        if (currentScene === sceneIndex && (currentStep === 0 || currentStep === 1)) {
            setTimeout(() => {
                if (videoElement.paused && currentScene === sceneIndex) {
                    videoElement.currentTime = 0;
                    videoElement.play().catch(() => {});
                }
            }, 100);
        }
    });
}

// Video element for Scene 0 (Virtual Model) - Uses random variant
const videoElement0 = document.createElement('video');
videoElement0.src = selectedVariant.video;
videoElement0.loop = true;
videoElement0.muted = true;
videoElement0.playsInline = true;
videoElement0.crossOrigin = 'anonymous';
videoElement0.preload = 'auto';
videoElement0.setAttribute('playsinline', '');
videoElement0.setAttribute('webkit-playsinline', '');
videoElement0.load();
setupVideoLoop(videoElement0, 0);

// Video element for Scene 1
const videoElement1 = document.createElement('video');
videoElement1.src = '/assets/center_image_scene_1.mp4';
videoElement1.loop = true;
videoElement1.muted = true;
videoElement1.playsInline = true;
videoElement1.crossOrigin = 'anonymous';
videoElement1.preload = 'auto';
videoElement1.setAttribute('playsinline', '');
videoElement1.setAttribute('webkit-playsinline', '');
videoElement1.load();
setupVideoLoop(videoElement1, 1);

// Video element for Scene 2
const videoElement2 = document.createElement('video');
videoElement2.src = '/assets/center_image_scene_2.mp4';
videoElement2.loop = true;
videoElement2.muted = true;
videoElement2.playsInline = true;
videoElement2.crossOrigin = 'anonymous';
videoElement2.preload = 'auto';
videoElement2.setAttribute('playsinline', '');
videoElement2.setAttribute('webkit-playsinline', '');
videoElement2.load();
setupVideoLoop(videoElement2, 2);

// Video element for Scene 3
const videoElement3 = document.createElement('video');
videoElement3.src = '/assets/center_image_scene_3.mp4';
videoElement3.loop = true;
videoElement3.muted = true;
videoElement3.playsInline = true;
videoElement3.crossOrigin = 'anonymous';
videoElement3.preload = 'auto';
videoElement3.setAttribute('playsinline', '');
videoElement3.setAttribute('webkit-playsinline', '');
videoElement3.load();
setupVideoLoop(videoElement3, 3);

// Video element for Scene 4 (Greek Island)
const videoElement4 = document.createElement('video');
videoElement4.src = '/assets/center_image_scene_4.mp4';
videoElement4.loop = true;
videoElement4.muted = true;
videoElement4.playsInline = true;
videoElement4.crossOrigin = 'anonymous';
videoElement4.preload = 'auto';
videoElement4.setAttribute('playsinline', '');
videoElement4.setAttribute('webkit-playsinline', '');
videoElement4.load();
setupVideoLoop(videoElement4, 4);

// Create VideoTextures
const videoTexture0 = new THREE.VideoTexture(videoElement0);
videoTexture0.minFilter = THREE.LinearFilter;
videoTexture0.magFilter = THREE.LinearFilter;
videoTexture0.format = THREE.RGBAFormat;
videoTexture0.generateMipmaps = false;

const videoTexture1 = new THREE.VideoTexture(videoElement1);
videoTexture1.minFilter = THREE.LinearFilter;
videoTexture1.magFilter = THREE.LinearFilter;
videoTexture1.format = THREE.RGBAFormat;
videoTexture1.generateMipmaps = false;

const videoTexture2 = new THREE.VideoTexture(videoElement2);
videoTexture2.minFilter = THREE.LinearFilter;
videoTexture2.magFilter = THREE.LinearFilter;
videoTexture2.format = THREE.RGBAFormat;
videoTexture2.generateMipmaps = false;

const videoTexture3 = new THREE.VideoTexture(videoElement3);
videoTexture3.minFilter = THREE.LinearFilter;
videoTexture3.magFilter = THREE.LinearFilter;
videoTexture3.format = THREE.RGBAFormat;
videoTexture3.generateMipmaps = false;

const videoTexture4 = new THREE.VideoTexture(videoElement4);
videoTexture4.minFilter = THREE.LinearFilter;
videoTexture4.magFilter = THREE.LinearFilter;
videoTexture4.format = THREE.RGBAFormat;
videoTexture4.generateMipmaps = false;

// Load textures - Scene 0, 1, 2, 3, 4 use video
const textures = scenes.map((url, index) => {
    if (index === 0) {
        return videoTexture0; // Scene 0 uses Virtual Model video
    } else if (index === 1) {
        return videoTexture1;
    } else if (index === 2) {
        return videoTexture2;
    } else if (index === 3) {
        return videoTexture3;
    } else if (index === 4) {
        return videoTexture4; // Scene 4 uses Greek Island video
    } else {
        return loader.load(url, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            updateAllUVScales();
        });
    }
});

// Geometry & Material
const geometry = new THREE.PlaneGeometry(2, 2);
const uniforms = {
    texture1: { value: textures[0] },
    texture2: { value: textures[0] },
    progress: { value: 0 },
    opacity: { value: 1.0 },
    disableBlur: { value: 0.0 },
    uvScale1: { value: new THREE.Vector2(1, 1) },
    uvScale2: { value: new THREE.Vector2(1, 1) },
    uvOffset: { value: new THREE.Vector2(0, 0) }
};
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Foreground Plane for Scene 1 and 2 Parallax
const foregroundMaterial = new THREE.MeshBasicMaterial({
    map: null,
    transparent: true,
    opacity: 0, // Start hidden (Scene 0 is default)
    side: THREE.DoubleSide,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false
});

// Load all foreground textures
const foregroundTextures = [];
foregroundImages.forEach((url, index) => {
    if (url) {
        foregroundTextures[index] = loader.load(url, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            tex.colorSpace = THREE.SRGBColorSpace;
            updateForegroundUVScale(); // Trigger resize when loaded
            console.log(`✅ Foreground texture ${index} loaded: ${url}`);
        });
    } else {
        foregroundTextures[index] = null;
    }
});

// Function to switch foreground texture based on scene
function updateForegroundTexture() {
    const fgTexture = foregroundTextures[currentScene];
    if (fgTexture) {
        foregroundMaterial.map = fgTexture;
        foregroundMaterial.needsUpdate = true;
        updateForegroundUVScale();
    }
}

console.log('🎭 Foreground system initialized for multiple scenes');

const foregroundPlane = new THREE.Mesh(geometry, foregroundMaterial);
foregroundPlane.position.z = 0.1;
foregroundPlane.renderOrder = 999;
scene.add(foregroundPlane);
console.log('🎭 Foreground plane added at z=0.1');

// Text Plane "DIRESS" (for scenes 1, 2, 3)
function createTextTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Text Style - Reduced size to prevent cut off if scaled down
    ctx.font = 'bold 300px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Fully Opaque White
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '120px';

    // Draw Text - centered
    ctx.fillText('DIRESS', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

// Virtual Model rotating text options
const virtualModelTexts = ['Select Model Age', 'Select Model Gender', 'Select Body Type'];
let currentVirtualModelTextIndex = 0;
let virtualModelTextInterval = null;
let typewriterInterval = null;
let currentTypewriterText = '';
let targetTypewriterText = '';

// Create texture for Virtual Model text with letter spacing
function createVirtualModelTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Text Style - elegant font with letter spacing
    ctx.font = 'bold 160px "Playfair Display", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text with letter spacing (manual character spacing)
    const letterSpacing = 18; // pixels between letters
    const chars = text.split('');

    // Calculate total width with spacing
    let totalWidth = 0;
    chars.forEach(char => {
        totalWidth += ctx.measureText(char).width + letterSpacing;
    });
    totalWidth -= letterSpacing; // Remove last spacing

    // Draw each character with spacing
    let currentX = (canvas.width - totalWidth) / 2;
    chars.forEach(char => {
        ctx.fillText(char, currentX + ctx.measureText(char).width / 2, canvas.height / 2);
        currentX += ctx.measureText(char).width + letterSpacing;
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

// Typewriter effect - animate text appearing character by character
function startTypewriterEffect(fullText) {
    // Clear any existing typewriter animation
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
    }

    currentTypewriterText = '';
    targetTypewriterText = fullText;
    let charIndex = 0;

    // Update texture immediately with empty/first char
    textMaterial.map = createVirtualModelTextTexture('');
    textMaterial.needsUpdate = true;

    typewriterInterval = setInterval(() => {
        if (charIndex <= targetTypewriterText.length) {
            currentTypewriterText = targetTypewriterText.substring(0, charIndex);
            textMaterial.map = createVirtualModelTextTexture(currentTypewriterText);
            textMaterial.needsUpdate = true;
            charIndex++;
        } else {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
    }, 80); // 80ms per character for smooth typing effect
}

// Function to rotate Virtual Model text with typewriter effect
function startVirtualModelTextRotation() {
    if (virtualModelTextInterval) return; // Already running

    // Start with first text typewriter effect
    startTypewriterEffect(virtualModelTexts[currentVirtualModelTextIndex]);

    virtualModelTextInterval = setInterval(() => {
        if (currentStep === 0 && currentScene === 0) {
            currentVirtualModelTextIndex = (currentVirtualModelTextIndex + 1) % virtualModelTexts.length;
            startTypewriterEffect(virtualModelTexts[currentVirtualModelTextIndex]);
        }
    }, 3500); // Change text every 3.5 seconds (more time for typewriter effect)
}

function stopVirtualModelTextRotation() {
    if (virtualModelTextInterval) {
        clearInterval(virtualModelTextInterval);
        virtualModelTextInterval = null;
    }
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }
}

const textGeometry = new THREE.PlaneGeometry(2, 1); // 2:1 aspect ratio
const textMaterial = new THREE.MeshBasicMaterial({
    map: createVirtualModelTextTexture(virtualModelTexts[0]), // Start with first text
    transparent: true,
    opacity: 1,
    toneMapped: false,
    alphaTest: 0.01,
    side: THREE.DoubleSide
});

// Text Plane "DIRESS"
// ... (existing text code) ...

// Right Gradient Plane (for contrast behind Scene Text, but behind DIRESS)
function createGradientTexture(isWhite = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    // Gradient: Transparent (Left) -> Black/White (Right)
    // To match CSS width: 50%, we can make the gradient start at 50%
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);

    if (isWhite) {
        // White gradient for Scene 0
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)'); // Start fading from middle
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)'); // White at right edge
    } else {
        // Dark gradient for other scenes
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)'); // Start fading from middle
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)'); // Dark at right edge
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

// Pre-create dark gradient texture (used for Scene 1, 2, 3)
const darkGradientTexture = createGradientTexture(false);

const gradientGeometry = new THREE.PlaneGeometry(2, 2); // Full screen
const gradientMaterial = new THREE.MeshBasicMaterial({
    map: createGradientTexture(),
    transparent: true,
    opacity: 1,
    toneMapped: false,
    depthWrite: false
});

const gradientPlane = new THREE.Mesh(gradientGeometry, gradientMaterial);
gradientPlane.position.z = 0.02; // BEHIND Text (0.05) and FG (0.1), but FRONT of BG (0)
scene.add(gradientPlane);

// Header gradient plane (top) - for Scene 0 only, behind foreground (now dark like other scenes)
function createHeaderGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    // Dark gradient to match other scenes
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 512);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

function createFooterGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    // Dark gradient to match other scenes
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 512);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

const headerGradientGeometry = new THREE.PlaneGeometry(2, 0.5);
const headerGradientMaterial = new THREE.MeshBasicMaterial({
    map: createHeaderGradientTexture(),
    transparent: true,
    opacity: 1,
    toneMapped: false,
    depthWrite: false,
    depthTest: false
});
const headerGradientPlane = new THREE.Mesh(headerGradientGeometry, headerGradientMaterial);
headerGradientPlane.position.z = 0.08; // Behind foreground (0.1) but in front of text (0.05)
headerGradientPlane.position.y = 0.75; // Top of screen
headerGradientPlane.visible = false; // Start hidden
scene.add(headerGradientPlane);

const footerGradientGeometry = new THREE.PlaneGeometry(2, 0.4);
const footerGradientMaterial = new THREE.MeshBasicMaterial({
    map: createFooterGradientTexture(),
    transparent: true,
    opacity: 1,
    toneMapped: false,
    depthWrite: false,
    depthTest: false
});
const footerGradientPlane = new THREE.Mesh(footerGradientGeometry, footerGradientMaterial);
footerGradientPlane.position.z = 0.08; // Behind foreground (0.1)
footerGradientPlane.position.y = -0.8; // Bottom of screen
footerGradientPlane.visible = false; // Start hidden
scene.add(footerGradientPlane);

const textPlane = new THREE.Mesh(textGeometry, textMaterial);
textPlane.position.z = 0.05; // FRONT of Gradient (0.02)
textPlane.position.y = 0.65; // Moved even further up
textPlane.position.x = 0.02; // Slightly to the right
textPlane.scale.set(0.8, 1.1, 1); // Stretched Y to fix squashed look
scene.add(textPlane);

function getScale(image, sceneIndex = null) {
    if (!image || !image.width) return new THREE.Vector2(1, 1);

    // Use window dimensions for mobile, artWrapper for desktop
    const isMobileView = window.innerWidth <= 768;
    const screenWidth = isMobileView ? window.innerWidth : artWrapper.clientWidth;
    const screenHeight = isMobileView ? window.innerHeight : artWrapper.clientHeight;

    const screenAspect = screenWidth / screenHeight;
    const imageAspect = image.width / image.height;

    // Zoom in slightly (0.98) to leave room for parallax movement
    const zoom = 0.98;

    if (isMobileView) {
        // Mobile: COVER behavior - fill screen, crop excess
        // We want video to fill the entire screen without black bars
        // This means we scale up until the smaller dimension fills

        // For a 16:9 video on 9:16 screen:
        // imageAspect = 1.78, screenAspect = 0.56
        // ratio = 0.56 / 1.78 = 0.31
        // We need to show only 31% of the video width to fill the screen height

        const ratio = screenAspect / imageAspect;

        if (ratio < 1) {
            // Screen is narrower than video - crop horizontally (show middle of video)
            return new THREE.Vector2(ratio * zoom, 1 * zoom);
        } else {
            // Screen is wider than video - crop vertically
            return new THREE.Vector2(1 * zoom, (1 / ratio) * zoom);
        }
    } else {
        // Desktop: CONTAIN behavior - fit entire image, may have letterboxing
        if (screenAspect > imageAspect) {
            return new THREE.Vector2(1 * zoom, (imageAspect / screenAspect) * zoom);
        } else {
            return new THREE.Vector2((screenAspect / imageAspect) * zoom, 1 * zoom);
        }
    }
}

function updateAllUVScales() {
    // Current scene is always represented by the visible texture
    // If progress is at 0, texture1 is visible.
    // If progress is at 1, texture2 is visible.
    uniforms.uvScale1.value.copy(getScale(uniforms.texture1.value.image));
    uniforms.uvScale2.value.copy(getScale(uniforms.texture2.value.image));
}

function updateForegroundUVScale() {
    // Use the currently active foreground texture
    const fgTexture = foregroundTextures[currentScene];

    // Safety check: ensure texture and image data exist
    if (!fgTexture || !fgTexture.image || fgTexture.image.width === 0) return;

    const screenAspect = artWrapper.clientWidth / artWrapper.clientHeight;
    const imageAspect = fgTexture.image.width / fgTexture.image.height;

    // Calculate Cover Scale (simulating object-fit: cover)
    let scaleX, scaleY;
    if (screenAspect > imageAspect) {
        // Screen is wider than image
        // To cover, we must stretch width to match screen, and crop height
        // But in UV space, a smaller scale means "zooming in" / cropping
        scaleX = 1;
        scaleY = imageAspect / screenAspect;
    } else {
        // Screen is taller than image
        // To cover, we force height to match screen, and crop width
        scaleX = screenAspect / imageAspect;
        scaleY = 1;
    }

    // Apply the UV transform
    // scaleX/Y here represent "how much of the texture to show"
    // So 1 means full texture, <1 means cropped (zoomed in)
    fgTexture.repeat.set(scaleX, scaleY);

    // Center the crop
    fgTexture.offset.set((1 - scaleX) / 2, (1 - scaleY) / 2);

    fgTexture.needsUpdate = true;
    foregroundPlane.scale.set(1, 1, 1);
}

// Layout Handling
const resizeObserver = new ResizeObserver(() => {
    const isMobileView = window.innerWidth <= 768;

    if (isMobileView) {
        // Mobile: Use full viewport for "cover" effect
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
    } else {
        // Desktop: Use artWrapper dimensions
        const width = artWrapper.clientWidth;
        const height = artWrapper.clientHeight;
        renderer.setSize(width, height);
    }

    updateAllUVScales();
    updateForegroundUVScale();
    updateTextScale();
});
resizeObserver.observe(artWrapper);

// Also listen to window resize for mobile
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateAllUVScales();
        updateForegroundUVScale();
        updateTextScale();
    }
});

// Handle Resize for Text Plane to prevent distortion
function updateTextScale() {
    if (!textPlane) return;
    const width = artWrapper.clientWidth;
    const height = artWrapper.clientHeight;
    // Prevent division by zero
    if (height === 0) return;

    // Calculate aspect based on artWrapper dimensions
    const aspect = width / height;

    // Mobile: scale down the text
    const isMobileView = window.innerWidth <= 768;
    const mobileScale = isMobileView ? 0.5 : 1.0;

    // Maintain 2:1 visual aspect ratio regardless of screen shape
    // ScaleY is base (1.0), ScaleX must be adjusted by aspect to cancel camera stretch
    textPlane.scale.y = 1.0 * mobileScale;
    textPlane.scale.x = (textPlane.scale.y / aspect) * mobileScale;

    // Move text up on mobile to not overlap with bottom nav
    if (isMobileView) {
        textPlane.position.y = 0.75;
    } else {
        textPlane.position.y = 0.65;
    }
}

// Initial call
updateTextScale();
updateUI(); // Ensure correct initial state (Step 0, Scene 0)

// Start Virtual Model text rotation on page load
startVirtualModelTextRotation();

// Start video playback for Scene 0 on page load
videoElement0.currentTime = 0;
videoElement0.play().catch(e => console.log('Initial video autoplay blocked:', e));

// Set initial foreground for Scene 0
updateForegroundTexture();
foregroundMaterial.opacity = 1;

// Retouch Carousel Setup
const retouchGroup = new THREE.Group();
scene.add(retouchGroup);
retouchGroup.visible = false;

const retouchVertexShader = `
varying vec2 vUv;
varying vec3 vWorldPosition;
void main() {
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const retouchFragmentShader = `
uniform sampler2D tBefore;
uniform sampler2D tAfter;
uniform vec3 borderColor;
uniform float borderWidth;
uniform float cornerRadius;
varying vec2 vUv;
varying vec3 vWorldPosition;

// Rounded rectangle SDF
float roundedRect(vec2 uv, vec2 size, float radius) {
    vec2 d = abs(uv - 0.5) * 2.0 - size + radius;
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - radius;
}

void main() {
    // Rounded corners - discard pixels outside rounded rect
    float dist = roundedRect(vUv, vec2(1.0), cornerRadius);
    if (dist > 0.0) {
        discard;
    }

    // Use UV directly - the geometry itself handles aspect ratio
    vec4 colorBefore = texture2D(tBefore, vUv);
    vec4 colorAfter = texture2D(tAfter, vUv);

    vec4 finalColor;
    // Left side = Before, Right side = After
    if (vWorldPosition.x < 0.0) {
        finalColor = colorBefore;
    } else {
        finalColor = colorAfter;
    }

    // Subtle border near the edge
    float borderDist = -dist;
    float borderMask = smoothstep(borderWidth, borderWidth * 0.5, borderDist);

    // Very subtle border blend
    finalColor = mix(finalColor, vec4(borderColor, 1.0), borderMask * 0.08);

    gl_FragColor = finalColor;
}
`;

const retouchPlanes = [];
const textureLoader = new THREE.TextureLoader();

// Card size will be calculated based on screen aspect ratio
let retouchCardSize = 1.9; // Slightly smaller card size
let retouchGap = 0.2;

function createRetouchCarousel() {
    // Clear existing planes
    retouchPlanes.forEach(p => retouchGroup.remove(p));
    retouchPlanes.length = 0;

    // Calculate aspect ratio to make cards fill the screen height
    const screenAspect = artWrapper.clientWidth / artWrapper.clientHeight;

    // Card dimensions - full height cards
    const cardHeight = retouchCardSize;
    const cardWidth = cardHeight / screenAspect; // Maintain proper aspect ratio
    retouchGap = 0; // No gap between cards

    retouchImages.forEach((data, i) => {
        const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);

        // Load textures with proper settings
        const beforeTexture = textureLoader.load(data.before);
        const afterTexture = textureLoader.load(data.after);

        beforeTexture.minFilter = THREE.LinearFilter;
        beforeTexture.magFilter = THREE.LinearFilter;
        afterTexture.minFilter = THREE.LinearFilter;
        afterTexture.magFilter = THREE.LinearFilter;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                tBefore: { value: beforeTexture },
                tAfter: { value: afterTexture },
                borderColor: { value: new THREE.Color(0x000000) },
                borderWidth: { value: 0.0 }, // No border
                cornerRadius: { value: 0.0 } // No rounded corners
            },
            vertexShader: retouchVertexShader,
            fragmentShader: retouchFragmentShader,
            transparent: true
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.position.x = (i - retouchImages.length / 2 + 0.5) * (cardWidth + retouchGap);
        plane.position.z = 0.5; // Closer to camera for full screen effect
        retouchPlanes.push(plane);
        retouchGroup.add(plane);
    });
}
createRetouchCarousel();

// Recreate carousel on resize to maintain square aspect
window.addEventListener('resize', () => {
    if (currentStep === 4) {
        createRetouchCarousel();
    }
});

// Animation
let targetProgress = 0;
function animate() {
    requestAnimationFrame(animate);

    // Update transition progress
    if (Math.abs(uniforms.progress.value - targetProgress) > 0.001) {
        uniforms.progress.value += (targetProgress - uniforms.progress.value) * 0.1;
    } else {
        uniforms.progress.value = targetProgress;
    }

    // Apply parallax offsets for scenes with foreground (Scene 0, 1, 2, 3)
    const hasForeground = foregroundImages[currentScene] !== null;
    // Parallax logic for Step 0 and Step 1
    if (hasForeground && (currentStep === 0 || currentStep === 1)) {
        // Parallax update
        if (!isParallaxLocked) {
            smoothedMouse.x += (mouseX - smoothedMouse.x) * 0.05;
            smoothedMouse.y += (mouseY - smoothedMouse.y) * 0.05;

            // Full parallax for all scenes including background
            uniforms.uvOffset.value.x = smoothedMouse.x * parallaxStrength.background;
            uniforms.uvOffset.value.y = smoothedMouse.y * parallaxStrength.background;

            foregroundPlane.position.x = smoothedMouse.x * parallaxStrength.foreground;
            foregroundPlane.position.y = smoothedMouse.y * parallaxStrength.foreground;

            if (textPlane) {
                const textParallaxFactor = 0.08;
                textPlane.position.x = 0.02 + (smoothedMouse.x * textParallaxFactor);
                textPlane.position.y = 0.65 + (smoothedMouse.y * textParallaxFactor);
            }
        } else {
            // Reset positions when locked
            uniforms.uvOffset.value.x = 0;
            uniforms.uvOffset.value.y = 0;
            foregroundPlane.position.x = 0;
            foregroundPlane.position.y = 0;

            if (textPlane) {
                textPlane.position.x = 0.02;
                textPlane.position.y = 0.65;
            }
        }
    }

    // Retouch Carousel Animation
    if (currentStep === 4) {
        retouchGroup.visible = true;
        plane.visible = false; // Hide ONLY in Retouch step
        if (textPlane) textPlane.visible = false;

        // Calculate current card width based on screen aspect
        const screenAspect = artWrapper.clientWidth / artWrapper.clientHeight;
        const cardWidth = retouchCardSize / screenAspect;
        const stepSize = cardWidth + retouchGap;
        const totalWidth = retouchImages.length * stepSize;
        const speed = 0.002; // Smooth slow speed

        retouchPlanes.forEach(p => {
            p.position.x += speed;
            // Loop back seamlessly from right to left
            if (p.position.x > totalWidth / 2) {
                p.position.x -= totalWidth;
            }
        });
    } else {
        retouchGroup.visible = false;
        plane.visible = true; // Ensure it's visible in ALL other steps
    }

    // Only render Three.js when needed (not in Step 5 - Change Color uses DOM)
    if (currentStep !== 5) {
        renderer.render(scene, camera);
    }
}
animate();

// Transition
function transitionToScene(index) {
    if (index === currentScene) return;
    const nextTexture = textures[index];

    if (uniforms.progress.value > 0.5) {
        // Texture2 is currently dominant. Set Texture1 to current view and animate back to 0? 
        // No, let's just cycle.
        uniforms.texture1.value = uniforms.texture2.value;
        uniforms.uvScale1.value.copy(getScale(uniforms.texture1.value.image, currentScene));
        uniforms.progress.value = 0;
    }

    uniforms.texture2.value = nextTexture;
    uniforms.uvScale2.value.copy(getScale(nextTexture.image, index));
    targetProgress = 1;

    currentScene = index;

    // Reset parallax to center until mouse moves
    isParallaxLocked = true;

    // Update foreground texture and show/hide for Scene 1 and 2
    updateForegroundTexture();
    const hasForeground = foregroundImages[currentScene] !== null;
    // On mobile Step 1 (AI Background), hide foreground to show only video
    if (hasForeground && currentStep === 0) {
        foregroundMaterial.opacity = 1;
    } else if (hasForeground && currentStep === 1 && !isMobile()) {
        foregroundMaterial.opacity = 1; // Show on desktop Step 1
    } else {
        foregroundMaterial.opacity = 0; // Hide on mobile Step 1 and other cases
    }

    // Video playback control for Scene 0, 1, 2, and 3
    // Reset and play the active video, pause others
    if (index === 0) {
        videoElement0.currentTime = 0;
        videoElement0.play().catch(e => console.log('Video 0 autoplay blocked:', e));
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
        videoElement4.pause();
    } else if (index === 1) {
        videoElement1.currentTime = 0;
        videoElement1.play().catch(e => console.log('Video 1 autoplay blocked:', e));
        videoElement0.pause();
        videoElement2.pause();
        videoElement3.pause();
        videoElement4.pause();
    } else if (index === 2) {
        videoElement2.currentTime = 0;
        videoElement2.play().catch(e => console.log('Video 2 autoplay blocked:', e));
        videoElement0.pause();
        videoElement1.pause();
        videoElement3.pause();
        videoElement4.pause();
    } else if (index === 3) {
        videoElement3.currentTime = 0;
        videoElement3.play().catch(e => console.log('Video 3 autoplay blocked:', e));
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
        videoElement4.pause();
    } else if (index === 4) {
        videoElement4.currentTime = 0;
        videoElement4.play().catch(e => console.log('Video 4 autoplay blocked:', e));
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
    } else {
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
        videoElement4.pause();
    }

    updateUI();
}

// UI
function updateUI() {
    mainContainer.className = `main-container step-${currentStep} scene-${currentScene} substep-${currentSubStep}`;

    // Control foreground layer visibility for scenes with foreground
    const hasForeground = foregroundImages[currentScene] !== null;
    // On mobile Step 1 (AI Background), hide foreground to show only video
    if (hasForeground && currentStep === 0 && !isMobile()) {
        foregroundMaterial.opacity = 1;
    } else if (hasForeground && currentStep === 0 && isMobile()) {
        foregroundMaterial.opacity = 1; // Show on mobile Step 0
    } else if (hasForeground && currentStep === 1 && !isMobile()) {
        foregroundMaterial.opacity = 1; // Show on desktop Step 1
    } else {
        foregroundMaterial.opacity = 0; // Hide on mobile Step 1 and other cases
    }

    // Toggle Text Plane and Gradient Plane
    if ((currentStep === 0 || currentStep === 1) && currentScene >= 0 && currentScene <= 4) {
        // Show in Scenes 0, 1, 2, 3, 4
        textPlane.visible = true;
        textPlane.material.color.setHex(0xffffff);
        textPlane.position.z = 0.05;
        textPlane.renderOrder = 1;

        // Scene 0: Virtual Model - rotating text (Choose Age, Choose Gender, etc.)
        // Scenes 1, 2, 3: DIRESS text
        if (currentScene === 0) {
            gradientPlane.visible = false;
            // Show header and footer gradients for Scene 0 (dark mode like other scenes)
            headerGradientPlane.visible = true;
            footerGradientPlane.visible = true;
            // Start rotating text for Virtual Model
            startVirtualModelTextRotation();
        } else {
            // Switch to DIRESS text for other scenes
            stopVirtualModelTextRotation();
            textMaterial.map = createTextTexture();
            textMaterial.needsUpdate = true;

            gradientPlane.visible = true;
            gradientMaterial.map = darkGradientTexture;
            gradientMaterial.needsUpdate = true;
            // Hide Three.js header/footer gradients for other scenes (use CSS instead)
            headerGradientPlane.visible = false;
            footerGradientPlane.visible = false;
        }
    } else {
        textPlane.visible = false;
        gradientPlane.visible = false;
        headerGradientPlane.visible = false;
        footerGradientPlane.visible = false;
        stopVirtualModelTextRotation();
    }


    if (currentStep > 0 || currentScene > 0) {
        scrollIndicator.classList.add('hidden');
    } else {
        scrollIndicator.classList.remove('hidden');
    }

    // Stop mobile e-commerce gallery when leaving step 6
    if (currentStep !== 6 && typeof window.stopMobileEcommerceAutoPlay === 'function') {
        window.stopMobileEcommerceAutoPlay();
    }

    renderSteps();
    updateSceneSelector();


}

// Scene Selector - Update active thumbnail
function updateSceneSelector() {
    sceneThumbs.forEach(thumb => {
        const sceneNum = parseInt(thumb.dataset.scene);
        if (sceneNum === currentScene) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Scene Selector - Click handlers
sceneThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
        const targetScene = parseInt(thumb.dataset.scene);
        // Allow scene transitions when in Step 0 or Step 1 (Select Scene)
        // Step 0 = Virtual Model (scene 0), Step 1 = Select Scene (scenes 1-4)
        if (targetScene !== currentScene && (currentStep === 0 || currentStep === 1)) {
            if (currentStep === 0) currentStep = 1; // Move to Step 1 if clicking from Step 0
            transitionToScene(targetScene);
        }
    });
});

function renderSteps() {
    verticalSlider.innerHTML = '';
    steps.forEach((step, index) => {
        // Determine visual active state (separate from actual currentStep)
        // Scene 0 = highlight Virtual Model (index 0)
        // Scene 1-4 = highlight Select Scene (index 1)
        let isVisuallyActive = false;
        if (currentStep === 0) {
            if (currentScene === 0 && index === 0) isVisuallyActive = true;
            else if (currentScene > 0 && currentScene <= 4 && index === 1) isVisuallyActive = true;
        } else if (currentStep === 1) {
            // Scene 1-4 all highlight Select Scene step
            isVisuallyActive = (index === 1);
        } else {
            isVisuallyActive = (currentStep === index);
        }

        const item = document.createElement('div');
        item.className = `step-item ${isVisuallyActive ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`;
        item.innerHTML = `
            <span class="step-dot"></span>
            <div class="step-text">
                <span class="step-label">${step.label}</span>
                <span class="step-subtitle">${step.subtitle}</span>
            </div>
        `;
        item.onclick = () => {
            currentStep = index;
            if (currentStep === 0) transitionToScene(0);
            else if (currentStep === 1) transitionToScene(1);
            else if (currentStep === 2) {
                // Change Pose
                poseScrollLocked = true;
                currentPoseIndex = 0;
                accumulatedPoseScroll = 0;
                poseScrollProgress = 0;
                transitionToScene(0);
                if (posePlanes.length > 0) {
                    updatePoseStackThreeJS(0);
                }
                // Keep resetting until lock is released to prevent momentum buildup
                const resetInterval = setInterval(() => {
                    accumulatedPoseScroll = 0;
                    poseScrollProgress = 0;
                    if (posePlanes.length > 0) {
                        updatePoseStackThreeJS(0);
                    }
                }, 50);
                // Release lock after momentum should be gone
                setTimeout(() => {
                    clearInterval(resetInterval);
                    accumulatedPoseScroll = 0;
                    poseScrollProgress = 0;
                    if (posePlanes.length > 0) {
                        updatePoseStackThreeJS(0);
                    }
                    poseScrollLocked = false;
                }, 800);
            }
            else if (currentStep === 3) transitionToScene(4); // Customize Model
            else if (currentStep === 4) transitionToScene(0); // Retouch
            else if (currentStep === 5) transitionToScene(4); // Change Color
            else if (currentStep === 6) transitionToScene(0); // Ecommerce Kits (now Step 6)
            updateUI();
        };
        verticalSlider.appendChild(item);
        if (index < steps.length - 1) {
            const line = document.createElement('div');
            line.className = `step-line ${index < currentStep ? 'completed' : ''}`;
            verticalSlider.appendChild(line);
        }
    });

    renderSubSteps();
}

function renderSubSteps() {
    const subMenu = document.getElementById('customize-submenu');
    if (!subMenu) return;

    // We keep the arrow from HTML, but refresh the card content
    const card = subMenu.querySelector('.submenu-card');
    if (!card) return;

    card.innerHTML = '';
    subSteps.forEach((sub, index) => {
        const isActive = currentSubStep === index;
        const item = document.createElement('div');
        item.className = `submenu-dot-item ${isActive ? 'active' : ''} ${index < currentSubStep ? 'completed' : ''}`;
        item.innerHTML = `
            <span class="sub-dot"></span>
            <div class="sub-text-wrapper">
                <span class="sub-label">${isActive ? 'Change ' : ''}${sub.label}</span>
                <span class="sub-subtitle">${sub.subtitle}</span>
                ${isActive ? `<p class="sub-inline-description animate-text-in">${sub.description}</p>` : ''}
            </div>
        `;
        item.onclick = (e) => {
            e.stopPropagation();
            currentSubStep = index;
            updateUI();
        };
        card.appendChild(item);

        if (index < subSteps.length - 1) {
            const line = document.createElement('div');
            line.className = `sub-line ${index < currentSubStep ? 'completed' : ''}`;
            card.appendChild(line);
        }
    });

    updateSubStepContent();
}

function updateSubStepContent() {
    const rightContent = document.getElementById('customize-content-right');
    if (rightContent) {
        rightContent.classList.remove('active');
        rightContent.style.display = 'none'; // Ensure it's hidden
    }
}
renderSteps();

// Mouse/Wheel
window.addEventListener('mousemove', (e) => {
    // Unlock parallax when user intentionally moves mouse
    isParallaxLocked = false;

    // Normalize mouse position to -1 to 1 range
    const rect = artWrapper.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
});

window.addEventListener('wheel', (e) => {
    // Special handling for Change Pose step (Step 2) - progressive scroll
    if (currentStep === 2) {
        e.preventDefault();
        const result = handlePoseScroll(e.deltaY);

        // result: 'handled' = still scrolling within poses
        //         'next' = go to next step
        //         'prev' = go to previous step
        if (result === 'next') {
            currentStep = 3;
            currentSubStep = 0;
            isScrolling = true; // Lock scrolling to prevent momentum
            transitionToScene(4);
            updateUI();
            // Keep scroll locked longer to prevent substep skipping
            setTimeout(() => {
                isScrolling = false;
            }, 800);
        } else if (result === 'prev') {
            currentStep = 1;
            transitionToScene(4); // Back to Scene 4 (last scene)
            updateUI();
        }
        // 'handled' means stay in step 2
        return;
    }

    if (isScrolling) return;
    if (Math.abs(e.deltaY) > 15) {
        isScrolling = true;
        if (e.deltaY > 0) {
            // Scroll down
            if (currentStep === 0 && currentScene === 0) {
                // From Virtual Model to Select Scene (Step 1)
                currentStep = 1;
                // Skip to scene that's not shown in Virtual Model
                let firstScene = 1;
                if (skipSceneInBackground === 1) firstScene = 2;
                transitionToScene(firstScene);
            } else if (currentStep === 1 && currentScene < 4) {
                // Through scenes within Step 1, skip the one shown in Virtual Model
                let nextScene = currentScene + 1;
                if (nextScene === skipSceneInBackground) nextScene++;
                if (nextScene > 4) nextScene = 4; // Don't exceed max
                transitionToScene(nextScene);
            } else if (currentStep === 1 && currentScene >= 4) {
                // From Scene 4 to Change Pose (Step 2)
                currentStep = 2;
                poseScrollLocked = true;
                currentPoseIndex = 0;
                accumulatedPoseScroll = 0;
                poseScrollProgress = 0;
                transitionToScene(0); // Reset scene for Change Pose
                if (posePlanes.length > 0) {
                    updatePoseStackThreeJS(0);
                }
                updateUI();
                // Keep resetting until lock is released to prevent momentum buildup
                const resetInterval = setInterval(() => {
                    accumulatedPoseScroll = 0;
                    poseScrollProgress = 0;
                    if (posePlanes.length > 0) {
                        updatePoseStackThreeJS(0);
                    }
                }, 50);
                // Release lock after momentum should be gone
                setTimeout(() => {
                    clearInterval(resetInterval);
                    accumulatedPoseScroll = 0;
                    poseScrollProgress = 0;
                    if (posePlanes.length > 0) {
                        updatePoseStackThreeJS(0);
                    }
                    poseScrollLocked = false;
                }, 800);
            } else if (currentStep === 3) {
                // Customize Model sub-steps
                if (currentSubStep < subSteps.length - 1) {
                    currentSubStep++;
                    updateUI();
                } else {
                    currentStep = 4;
                    currentSubStep = 0;
                    updateUI();
                }
            } else if (currentStep === 4) {
                // From Retouch to Change Color (Step 5)
                currentStep = 5;
                transitionToScene(4);
                updateUI();
            } else if (currentStep === 5) {
                // From Change Color to Ecommerce Kits (Step 6)
                currentStep = 6;
                transitionToScene(0); // Reset scene for Ecommerce Kits
                updateUI();
            } else if (currentStep === 6) {
                // From Ecommerce Kits to Image to Video (Step 7)
                currentStep = 7;
                updateUI();
            } else {
                currentStep = Math.min(currentStep + 1, steps.length - 1);
                updateUI();
            }
        } else {
            // Scroll up
            // Determine the first visible scene (skip the one shown in Virtual Model)
            let firstVisibleScene = 1;
            if (skipSceneInBackground === 1) firstVisibleScene = 2;

            if (currentStep === 1 && currentScene === firstVisibleScene) {
                // From first visible scene back to Virtual Model
                currentStep = 0;
                transitionToScene(0);
            } else if (currentStep === 1 && currentScene > firstVisibleScene) {
                // Go back through scenes, skip the one shown in Virtual Model
                let prevScene = currentScene - 1;
                if (prevScene === skipSceneInBackground) prevScene--;
                if (prevScene < 1) prevScene = 1;
                transitionToScene(prevScene);
            } else if (currentStep === 3) {
                // From Customize Model back
                if (currentSubStep > 0) {
                    currentSubStep--;
                    updateUI();
                } else {
                    // Back to Change Pose (Step 2)
                    currentStep = 2;
                    currentPoseIndex = totalPoses - 1;
                    accumulatedPoseScroll = 0;
                    poseScrollProgress = 0;
                    poseScrollLocked = true;
                    updatePoseStackThreeJS(0);
                    updateUI();
                    setTimeout(() => {
                        poseScrollLocked = false;
                        accumulatedPoseScroll = 0;
                        poseScrollProgress = 0;
                    }, 300);
                }
            } else if (currentStep === 5) {
                // From Change Color back to Retouch (Step 4)
                currentStep = 4;
                updateUI();
            } else if (currentStep === 6) {
                // From Ecommerce Kits back to Change Color (Step 5)
                currentStep = 5;
                updateUI();
            } else if (currentStep === 7) {
                // From Image to Video back to Ecommerce Kits (Step 6)
                currentStep = 6;
                updateUI();
            } else {
                currentStep = Math.max(currentStep - 1, 0);
                if (currentStep === 0) transitionToScene(0);
                updateUI();
            }
        }
        setTimeout(() => isScrolling = false, 800);
    }
}, { passive: false });

// Auto-hover animation for model cards on page load
function startAutoHoverAnimation() {
    const gridCards = document.querySelectorAll('.grid-card');
    if (gridCards.length === 0) return;

    let currentIndex = 0;
    const animationDuration = 300; // ms per card

    function animateNext() {
        // Remove from all
        gridCards.forEach(card => card.classList.remove('auto-hovered'));

        // Add to current
        gridCards[currentIndex].classList.add('auto-hovered');

        currentIndex++;

        // Stop after one full cycle
        if (currentIndex < gridCards.length) {
            setTimeout(animateNext, animationDuration);
        } else {
            // Remove class from last card after animation
            setTimeout(() => {
                gridCards.forEach(card => card.classList.remove('auto-hovered'));
            }, animationDuration);
        }
    }

    // Start after a short delay
    setTimeout(animateNext, 500);
}

// Start animation when page loads
startAutoHoverAnimation();

// Ecommerce Loading Animation
let isEcommerceAnimating = false;

function playEcommerceLoadingAnimation() {
    if (isEcommerceAnimating) return;
    isEcommerceAnimating = true;

    const loadingOverlay = document.getElementById('ecommerce-loading');
    const wordsContainer = document.getElementById('prompt-words-container');
    const generateBtn = document.getElementById('generate-btn');
    const spinner = document.getElementById('loading-spinner');
    const content = document.getElementById('ecommerce-content');

    // Words to display one by one
    const words = [
        'Professional',
        'E-commerce',
        'Product',
        'Photos',
        'With AI'
    ];

    let wordIndex = 0;

    // Reset state for every playback
    wordsContainer.innerHTML = '';
    generateBtn.style.display = 'inline-flex';
    generateBtn.classList.remove('visible', 'clicked');
    spinner.classList.remove('visible');
    content.classList.remove('visible');
    loadingOverlay.classList.remove('hidden');

    // Add words one by one - smooth from top to bottom
    function addWord() {
        if (wordIndex < words.length) {
            // Fade out previous words
            const existingWords = wordsContainer.querySelectorAll('.prompt-word');
            existingWords.forEach(w => w.classList.add('faded'));

            const wordEl = document.createElement('div');
            wordEl.className = 'prompt-word';
            wordEl.textContent = words[wordIndex];
            wordsContainer.appendChild(wordEl);

            // Trigger animation with slight delay for smoothness
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    wordEl.classList.add('visible');
                });
            });

            wordIndex++;
            setTimeout(addWord, 500);
        } else {
            // All words added, show generate button
            setTimeout(() => {
                generateBtn.classList.add('visible');

                // Auto-click button after 1 second
                setTimeout(() => {
                    generateBtn.classList.add('clicked');

                    // Show spinner after button click
                    setTimeout(() => {
                        generateBtn.style.display = 'none';
                        spinner.classList.add('visible');

                        // After 1.5 seconds, hide loading and show content
                        setTimeout(() => {
                            renderEcommerceSlider();
                            loadingOverlay.classList.add('hidden');
                            content.classList.add('visible');
                            isEcommerceAnimating = false;
                            // Start mobile gallery auto-play
                            if (typeof window.startMobileEcommerceAutoPlay === 'function') {
                                window.startMobileEcommerceAutoPlay();
                            }
                        }, 1500);
                    }, 300);
                }, 1000);
            }, 500);
        }
    }

    // Start animation after a short delay
    setTimeout(addWord, 400);
}

// Watch for step changes to trigger animation
const originalUpdateUI = updateUI;
const customizeVideo = document.querySelector('.customize-video-bg');
const colorPaletteGrid = document.getElementById('color-palette-grid');
const skinTonePaletteGrid = document.getElementById('skin-tone-palette-grid');
const ethnicityBg = document.getElementById('ethnicity-bg');
const hairColorSlideshow = document.getElementById('hair-color-slideshow');
const hairStyleSlideshow = document.getElementById('hair-style-slideshow');
const skinToneGridOverlay = document.getElementById('skin-tone-grid-overlay');
const skinToneGridCells = document.getElementById('skin-tone-grid-cells');

// Hair Color Slideshow Animation
let hairColorInterval = null;
let currentHairColorIndex = 0;
const hairColorSlides = document.querySelectorAll('.hair-color-slide');

function startHairColorSlideshow() {
    if (hairColorInterval || hairColorSlides.length === 0) return;

    currentHairColorIndex = 0;
    // Reset all slides
    hairColorSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    hairColorInterval = setInterval(() => {
        const currentSlide = hairColorSlides[currentHairColorIndex];
        const nextIndex = (currentHairColorIndex + 1) % hairColorSlides.length;
        const nextSlide = hairColorSlides[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        currentHairColorIndex = nextIndex;
    }, 2000); // Change every 2 seconds
}

function stopHairColorSlideshow() {
    if (hairColorInterval) {
        clearInterval(hairColorInterval);
        hairColorInterval = null;
    }
}

// Hair Style Slideshow Animation
let hairStyleInterval = null;
let currentHairStyleIndex = 0;
const hairStyleSlides = document.querySelectorAll('.hair-style-slide');

function startHairStyleSlideshow() {
    if (hairStyleInterval || hairStyleSlides.length === 0) return;

    currentHairStyleIndex = 0;
    // Reset all slides
    hairStyleSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    hairStyleInterval = setInterval(() => {
        const currentSlide = hairStyleSlides[currentHairStyleIndex];
        const nextIndex = (currentHairStyleIndex + 1) % hairStyleSlides.length;
        const nextSlide = hairStyleSlides[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        currentHairStyleIndex = nextIndex;
    }, 2000); // Change every 2 seconds
}

function stopHairStyleSlideshow() {
    if (hairStyleInterval) {
        clearInterval(hairStyleInterval);
        hairStyleInterval = null;
    }
}

// Mobile Hair Color Slideshow Animation
let mobileHairColorInterval = null;
let currentMobileHairColorIndex = 0;

function startMobileHairColorSlideshow() {
    const mobileHairColorSlides = document.querySelectorAll('.mobile-hair-color-slide');
    if (mobileHairColorInterval || mobileHairColorSlides.length === 0) return;

    currentMobileHairColorIndex = 0;
    // Reset all slides
    mobileHairColorSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    mobileHairColorInterval = setInterval(() => {
        const mobileHairColorSlides = document.querySelectorAll('.mobile-hair-color-slide');
        const currentSlide = mobileHairColorSlides[currentMobileHairColorIndex];
        const nextIndex = (currentMobileHairColorIndex + 1) % mobileHairColorSlides.length;
        const nextSlide = mobileHairColorSlides[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        currentMobileHairColorIndex = nextIndex;
    }, 2000); // Change every 2 seconds
}

function stopMobileHairColorSlideshow() {
    if (mobileHairColorInterval) {
        clearInterval(mobileHairColorInterval);
        mobileHairColorInterval = null;
    }
}

// Desktop Mood Slideshow Animation
const moodSlideshow = document.getElementById('mood-slideshow');
const moodPaletteDesktop = document.getElementById('mood-palette-desktop');
const moodEmojiRainDesktop = document.getElementById('mood-emoji-rain-desktop');

let moodSlideshowInterval = null;
let currentMoodSlideIndex = 0;
const moodSlides = document.querySelectorAll('.mood-slide');

function startMoodSlideshow() {
    if (moodSlideshowInterval || moodSlides.length === 0) return;

    currentMoodSlideIndex = 0;
    // Reset all slides
    moodSlides.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    moodSlideshowInterval = setInterval(() => {
        const currentSlide = moodSlides[currentMoodSlideIndex];
        const nextIndex = (currentMoodSlideIndex + 1) % moodSlides.length;
        const nextSlide = moodSlides[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        currentMoodSlideIndex = nextIndex;
    }, 2500);
}

function stopMoodSlideshow() {
    if (moodSlideshowInterval) {
        clearInterval(moodSlideshowInterval);
        moodSlideshowInterval = null;
    }
}

// Desktop Ethnicity Slideshow Animation
const ethnicitySlideshowEl = document.getElementById('ethnicity-slideshow');
const ethnicityPaletteDesktop = document.getElementById('ethnicity-palette-desktop');

let ethnicitySlideshowInterval = null;
let currentEthnicitySlideIndex = 0;
const ethnicitySlides = document.querySelectorAll('.ethnicity-slide');

const ethnicitySlideshowNames = ['Asian', 'African', 'Latin', 'Arabian', 'Indian'];

function startEthnicitySlideshow() {
    if (ethnicitySlideshowInterval || ethnicitySlides.length === 0) return;

    currentEthnicitySlideIndex = 0;
    // Reset all slides
    ethnicitySlides.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    // Update text
    const slideshowText = document.getElementById('ethnicity-slideshow-text');
    if (slideshowText) slideshowText.textContent = ethnicitySlideshowNames[0];

    ethnicitySlideshowInterval = setInterval(() => {
        const currentSlide = ethnicitySlides[currentEthnicitySlideIndex];
        const nextIndex = (currentEthnicitySlideIndex + 1) % ethnicitySlides.length;
        const nextSlide = ethnicitySlides[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        // Update text
        const slideshowText = document.getElementById('ethnicity-slideshow-text');
        if (slideshowText) {
            slideshowText.style.opacity = '0';
            setTimeout(() => {
                slideshowText.textContent = ethnicitySlideshowNames[nextIndex];
                slideshowText.style.opacity = '1';
            }, 300);
        }

        currentEthnicitySlideIndex = nextIndex;
    }, 2500);
}

function stopEthnicitySlideshow() {
    if (ethnicitySlideshowInterval) {
        clearInterval(ethnicitySlideshowInterval);
        ethnicitySlideshowInterval = null;
    }
}

// Desktop Ethnicity White Palette Animation
let ethnicityPaletteAnimationId = null;

function generateEthnicityPaletteDesktop() {
    if (!ethnicityPaletteDesktop || ethnicityPaletteDesktop.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'ethnicity-cell';
        cell.dataset.index = i;
        ethnicityPaletteDesktop.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors
    let time = 0;
    function animateEthnicityPalette() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        ethnicityPaletteAnimationId = requestAnimationFrame(animateEthnicityPalette);
    }
    animateEthnicityPalette();
}

function stopEthnicityPaletteDesktop() {
    if (ethnicityPaletteAnimationId) {
        cancelAnimationFrame(ethnicityPaletteAnimationId);
        ethnicityPaletteAnimationId = null;
    }
}

// Ethnicity Flag Rain (Desktop) - flags fall like emoji rain in Mood
const ethnicityFlagRainDesktop = document.getElementById('ethnicity-flag-rain-desktop');
let ethnicityFlagRainInterval = null;

// Flags for each ethnicity - indexed by currentEthnicitySlideIndex
const ethnicityFlags = [
    ['🇯🇵', '🇨🇳', '🇰🇷', '🇹🇭', '🇻🇳', '🇮🇩', '🇲🇾', '🇵🇭'],  // Asian
    ['🇳🇬', '🇿🇦', '🇰🇪', '🇬🇭', '🇪🇹', '🇪🇬', '🇲🇦', '🇹🇿'],  // African
    ['🇧🇷', '🇲🇽', '🇦🇷', '🇨🇴', '🇨🇱', '🇵🇪', '🇻🇪', '🇨🇺'],  // Latin
    ['🇸🇦', '🇦🇪', '🇪🇬', '🇯🇴', '🇱🇧', '🇲🇦', '🇶🇦', '🇰🇼'],  // Arabian
    ['🇮🇳', '🇵🇰', '🇧🇩', '🇱🇰', '🇳🇵', '🇧🇹', '🇲🇻', '🇲🇲']   // Indian
];

function createEthnicityFlag() {
    if (!ethnicityFlagRainDesktop) return;

    const flag = document.createElement('span');
    flag.className = 'flag';

    // Get flags based on current ethnicity slide
    const currentFlags = ethnicityFlags[currentEthnicitySlideIndex] || ethnicityFlags[0];
    flag.textContent = currentFlags[Math.floor(Math.random() * currentFlags.length)];

    // Match mood emoji rain style
    const left = Math.random() * 100;
    const size = 20 + Math.random() * 20;
    const duration = 3 + Math.random() * 2;
    const delay = Math.random() * 0.5;

    flag.style.left = `${left}%`;
    flag.style.fontSize = `${size}px`;
    flag.style.animationDuration = `${duration}s`;
    flag.style.animationDelay = `${delay}s`;
    flag.style.opacity = 0.6 + Math.random() * 0.4;

    ethnicityFlagRainDesktop.appendChild(flag);

    // Remove flag after animation
    setTimeout(() => {
        if (flag.parentNode) flag.remove();
    }, (duration + delay) * 1000 + 500);
}

function startEthnicityFlagRain() {
    if (ethnicityFlagRainInterval || !ethnicityFlagRainDesktop) return;

    // Create initial flags - match mood emoji rain style
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createEthnicityFlag(), i * 200);
    }

    // Continue creating flags - match mood emoji rain interval
    ethnicityFlagRainInterval = setInterval(() => {
        createEthnicityFlag();
    }, 300);
}

function stopEthnicityFlagRain() {
    if (ethnicityFlagRainInterval) {
        clearInterval(ethnicityFlagRainInterval);
        ethnicityFlagRainInterval = null;
    }

    // Clear existing flags
    if (ethnicityFlagRainDesktop) {
        ethnicityFlagRainDesktop.innerHTML = '';
    }
}

// ========================================
// HAIR STYLE INSIDE CONTAINER SYSTEM
// (Like Mood/Ethnicity - inside main container)
// ========================================

const hairstylePaletteInside = document.getElementById('hairstyle-palette-inside');
const hairstyleSlideshowInside = document.getElementById('hairstyle-slideshow-inside');
const hairstyleSlidesInside = document.querySelectorAll('.hairstyle-slide-inside');

let hairstylePaletteInsideAnimationId = null;
let hairstyleSlideshowInsideInterval = null;
let currentHairstyleSlideshowIndex = 0;

const hairstyleSlideshowNamesInside = ['Elegant', 'Casual', 'Bold', 'Classic', 'Modern'];

// Generate white palette cells (inside container)
function generateHairstylePaletteInside() {
    if (!hairstylePaletteInside || hairstylePaletteInside.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'hairstyle-cell-inside';
        cell.dataset.index = i;
        hairstylePaletteInside.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors
    let time = 0;
    function animateHairstylePaletteInside() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        hairstylePaletteInsideAnimationId = requestAnimationFrame(animateHairstylePaletteInside);
    }
    animateHairstylePaletteInside();
}

function stopHairstylePaletteInside() {
    if (hairstylePaletteInsideAnimationId) {
        cancelAnimationFrame(hairstylePaletteInsideAnimationId);
        hairstylePaletteInsideAnimationId = null;
    }
}

// Hair Style Slideshow (inside container)
function startHairstyleSlideshowInside() {
    if (hairstyleSlideshowInsideInterval || hairstyleSlidesInside.length === 0) return;

    currentHairstyleSlideshowIndex = 0;
    // Reset all slides
    hairstyleSlidesInside.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    // Update text
    const hairstyleTextEl = document.getElementById('hairstyle-text');
    if (hairstyleTextEl) hairstyleTextEl.textContent = hairstyleSlideshowNamesInside[0];

    hairstyleSlideshowInsideInterval = setInterval(() => {
        const currentSlide = hairstyleSlidesInside[currentHairstyleSlideshowIndex];
        const nextIndex = (currentHairstyleSlideshowIndex + 1) % hairstyleSlidesInside.length;
        const nextSlide = hairstyleSlidesInside[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        // Update text with fade
        const hairstyleTextEl = document.getElementById('hairstyle-text');
        if (hairstyleTextEl) {
            hairstyleTextEl.style.opacity = '0';
            setTimeout(() => {
                hairstyleTextEl.textContent = hairstyleSlideshowNamesInside[nextIndex];
                hairstyleTextEl.style.opacity = '1';
            }, 300);
        }

        currentHairstyleSlideshowIndex = nextIndex;
    }, 2500);
}

function stopHairstyleSlideshowInside() {
    if (hairstyleSlideshowInsideInterval) {
        clearInterval(hairstyleSlideshowInsideInterval);
        hairstyleSlideshowInsideInterval = null;
    }
}

// ========================================
// SKIN TONE INSIDE CONTAINER SYSTEM
// (Like Mood/Ethnicity - inside main container)
// ========================================

const skintonePaletteInside = document.getElementById('skintone-palette-inside');
const skintoneSlideshowInside = document.getElementById('skintone-slideshow-inside');
const skintoneSlidesInside = document.querySelectorAll('.skintone-slide-inside');

let skintonePaletteInsideAnimationId = null;
let skintoneSlideshowInsideInterval = null;
let currentSkintoneSlideshowIndex = 0;

const skintoneSlideshowNamesInside = ['Fair', 'Light', 'Medium', 'Tan', 'Deep'];

// Generate white palette cells (inside container)
function generateSkintonePaletteInside() {
    if (!skintonePaletteInside || skintonePaletteInside.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'skintone-cell-inside';
        cell.dataset.index = i;
        skintonePaletteInside.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors
    let time = 0;
    function animateSkintonePaletteInside() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        skintonePaletteInsideAnimationId = requestAnimationFrame(animateSkintonePaletteInside);
    }
    animateSkintonePaletteInside();
}

function stopSkintonePaletteInside() {
    if (skintonePaletteInsideAnimationId) {
        cancelAnimationFrame(skintonePaletteInsideAnimationId);
        skintonePaletteInsideAnimationId = null;
    }
}

// Skin Tone Slideshow (inside container)
function startSkintoneSlideshowInside() {
    if (skintoneSlideshowInsideInterval || skintoneSlidesInside.length === 0) return;

    currentSkintoneSlideshowIndex = 0;
    // Reset all slides
    skintoneSlidesInside.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    // Update text
    const skintoneTextEl = document.getElementById('skintone-text');
    if (skintoneTextEl) skintoneTextEl.textContent = skintoneSlideshowNamesInside[0];

    skintoneSlideshowInsideInterval = setInterval(() => {
        const currentSlide = skintoneSlidesInside[currentSkintoneSlideshowIndex];
        const nextIndex = (currentSkintoneSlideshowIndex + 1) % skintoneSlidesInside.length;
        const nextSlide = skintoneSlidesInside[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        // Update text with fade
        const skintoneTextEl = document.getElementById('skintone-text');
        if (skintoneTextEl) {
            skintoneTextEl.style.opacity = '0';
            setTimeout(() => {
                skintoneTextEl.textContent = skintoneSlideshowNamesInside[nextIndex];
                skintoneTextEl.style.opacity = '1';
            }, 300);
        }

        currentSkintoneSlideshowIndex = nextIndex;
    }, 2500);
}

function stopSkintoneSlideshowInside() {
    if (skintoneSlideshowInsideInterval) {
        clearInterval(skintoneSlideshowInsideInterval);
        skintoneSlideshowInsideInterval = null;
    }
}

// ========================================
// ETHNICITY INSIDE CONTAINER SYSTEM
// (Like Mood - inside main container)
// ========================================

const ethnicityPaletteInside = document.getElementById('ethnicity-palette-inside');
const ethnicityFlagRainInside = document.getElementById('ethnicity-flag-rain-inside');
const ethnicitySlideshowInside = document.getElementById('ethnicity-slideshow-inside');
const ethnicitySlidesInside = document.querySelectorAll('.ethnicity-slide-inside');

let ethnicityPaletteInsideAnimationId = null;
let ethnicityFlagRainInsideInterval = null;
let ethnicitySlideshowInsideInterval = null;
let currentEthnicitySlideshowIndex = 0;

const ethnicitySlideshowNamesInside = ['Asian', 'African', 'Latin', 'Arabian', 'Indian'];

// Generate white palette cells (inside container)
function generateEthnicityPaletteInside() {
    if (!ethnicityPaletteInside || ethnicityPaletteInside.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'ethnicity-cell-inside';
        cell.dataset.index = i;
        ethnicityPaletteInside.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors
    let time = 0;
    function animateEthnicityPaletteInside() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        ethnicityPaletteInsideAnimationId = requestAnimationFrame(animateEthnicityPaletteInside);
    }
    animateEthnicityPaletteInside();
}

function stopEthnicityPaletteInside() {
    if (ethnicityPaletteInsideAnimationId) {
        cancelAnimationFrame(ethnicityPaletteInsideAnimationId);
        ethnicityPaletteInsideAnimationId = null;
    }
}

// Ethnicity Slideshow (inside container)
function startEthnicitySlideshowInside() {
    if (ethnicitySlideshowInsideInterval || ethnicitySlidesInside.length === 0) return;

    currentEthnicitySlideshowIndex = 0;
    // Reset all slides
    ethnicitySlidesInside.forEach((slide, i) => {
        slide.classList.remove('active', 'fading-out');
        if (i === 0) slide.classList.add('active');
    });

    // Update text
    const ethnicityTextEl = document.getElementById('ethnicity-text');
    if (ethnicityTextEl) ethnicityTextEl.textContent = ethnicitySlideshowNamesInside[0];

    ethnicitySlideshowInsideInterval = setInterval(() => {
        const currentSlide = ethnicitySlidesInside[currentEthnicitySlideshowIndex];
        const nextIndex = (currentEthnicitySlideshowIndex + 1) % ethnicitySlidesInside.length;
        const nextSlide = ethnicitySlidesInside[nextIndex];

        // Fade out current
        currentSlide.classList.add('fading-out');
        currentSlide.classList.remove('active');

        // Fade in next
        nextSlide.classList.add('active');
        nextSlide.classList.remove('fading-out');

        // Update text with fade
        const ethnicityTextEl = document.getElementById('ethnicity-text');
        if (ethnicityTextEl) {
            ethnicityTextEl.style.opacity = '0';
            setTimeout(() => {
                ethnicityTextEl.textContent = ethnicitySlideshowNamesInside[nextIndex];
                ethnicityTextEl.style.opacity = '1';
            }, 300);
        }

        currentEthnicitySlideshowIndex = nextIndex;
    }, 2500);
}

function stopEthnicitySlideshowInside() {
    if (ethnicitySlideshowInsideInterval) {
        clearInterval(ethnicitySlideshowInsideInterval);
        ethnicitySlideshowInsideInterval = null;
    }
}

// Ethnicity Flag Rain (inside container) - match mood emoji rain style
function createEthnicityFlagInside() {
    if (!ethnicityFlagRainInside) return;

    const flag = document.createElement('span');
    flag.className = 'flag';

    // Get flags based on current slideshow index
    const currentFlags = ethnicityFlags[currentEthnicitySlideshowIndex] || ethnicityFlags[0];
    flag.textContent = currentFlags[Math.floor(Math.random() * currentFlags.length)];

    // Match mood emoji rain style
    const left = Math.random() * 100;
    const size = 20 + Math.random() * 20;
    const duration = 3 + Math.random() * 2;
    const delay = Math.random() * 0.5;

    flag.style.left = `${left}%`;
    flag.style.fontSize = `${size}px`;
    flag.style.animationDuration = `${duration}s`;
    flag.style.animationDelay = `${delay}s`;
    flag.style.opacity = 0.6 + Math.random() * 0.4;

    ethnicityFlagRainInside.appendChild(flag);

    // Remove flag after animation
    setTimeout(() => {
        if (flag.parentNode) flag.remove();
    }, (duration + delay) * 1000 + 500);
}

function startEthnicityFlagRainInside() {
    if (ethnicityFlagRainInsideInterval || !ethnicityFlagRainInside) return;

    // Create initial flags - match mood emoji rain style
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createEthnicityFlagInside(), i * 200);
    }

    // Continue creating flags - match mood emoji rain interval
    ethnicityFlagRainInsideInterval = setInterval(() => {
        createEthnicityFlagInside();
    }, 300);
}

function stopEthnicityFlagRainInside() {
    if (ethnicityFlagRainInsideInterval) {
        clearInterval(ethnicityFlagRainInsideInterval);
        ethnicityFlagRainInsideInterval = null;
    }

    // Clear existing flags
    if (ethnicityFlagRainInside) {
        ethnicityFlagRainInside.innerHTML = '';
    }
}

// Desktop Hair Style White Palette Animation
const hairStylePaletteDesktop = document.getElementById('hair-style-palette-desktop');
let hairStylePaletteAnimationId = null;

function generateHairStylePaletteDesktop() {
    if (!hairStylePaletteDesktop || hairStylePaletteDesktop.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'hair-style-cell';
        cell.dataset.index = i;
        hairStylePaletteDesktop.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors (same as ethnicity)
    let time = 0;
    function animateHairStylePalette() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        hairStylePaletteAnimationId = requestAnimationFrame(animateHairStylePalette);
    }
    animateHairStylePalette();
}

function stopHairStylePaletteDesktop() {
    if (hairStylePaletteAnimationId) {
        cancelAnimationFrame(hairStylePaletteAnimationId);
        hairStylePaletteAnimationId = null;
    }
}

// Desktop Mood White Palette Animation
let moodPaletteAnimationId = null;

function generateMoodPaletteDesktop() {
    if (!moodPaletteDesktop || moodPaletteDesktop.children.length > 0) return;

    const cells = [];
    // 20 columns x 15 rows = 300 cells
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'mood-cell';
        cell.dataset.index = i;
        moodPaletteDesktop.appendChild(cell);
        cells.push(cell);
    }

    // Animate with white/light colors
    let time = 0;
    function animateMoodPalette() {
        time += 0.015;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create flowing white/light gray pattern
            const wave = Math.sin(time + row * 0.3 + col * 0.2) * 0.5 + 0.5;
            const lightness = 85 + wave * 15; // 85-100% lightness (very light)
            const saturation = 5 + wave * 10; // Very low saturation
            const hue = (time * 20 + index) % 360;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        moodPaletteAnimationId = requestAnimationFrame(animateMoodPalette);
    }
    animateMoodPalette();
}

function stopMoodPaletteDesktop() {
    if (moodPaletteAnimationId) {
        cancelAnimationFrame(moodPaletteAnimationId);
        moodPaletteAnimationId = null;
    }
}

// Desktop Mood Emoji Rain
let moodEmojiDesktopInterval = null;
const moodEmojisDesktop = ['😊', '😄', '🥰', '😎', '🤩', '💫', '✨', '💖', '🌟', '😇'];

function startMoodEmojiRainDesktop() {
    if (moodEmojiDesktopInterval || !moodEmojiRainDesktop) return;

    // Create initial emojis
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createMoodEmojiDesktop(), i * 200);
    }

    moodEmojiDesktopInterval = setInterval(() => {
        createMoodEmojiDesktop();
    }, 300);
}

function createMoodEmojiDesktop() {
    if (!moodEmojiRainDesktop) return;

    const emoji = document.createElement('span');
    emoji.className = 'mood-emoji';
    emoji.textContent = moodEmojisDesktop[Math.floor(Math.random() * moodEmojisDesktop.length)];

    const left = Math.random() * 100;
    const size = 20 + Math.random() * 20;
    const duration = 3 + Math.random() * 2;
    const delay = Math.random() * 0.5;

    emoji.style.left = `${left}%`;
    emoji.style.fontSize = `${size}px`;
    emoji.style.animationDuration = `${duration}s`;
    emoji.style.animationDelay = `${delay}s`;
    emoji.style.opacity = 0.6 + Math.random() * 0.4;

    moodEmojiRainDesktop.appendChild(emoji);

    // Remove emoji after animation
    setTimeout(() => {
        if (emoji.parentNode) emoji.remove();
    }, (duration + delay) * 1000 + 500);
}

function stopMoodEmojiRainDesktop() {
    if (moodEmojiDesktopInterval) {
        clearInterval(moodEmojiDesktopInterval);
        moodEmojiDesktopInterval = null;
    }
    if (moodEmojiRainDesktop) {
        moodEmojiRainDesktop.innerHTML = '';
    }
}

// Generate 300 color cells for the palette with animated colors
function generateColorPalette() {
    if (!colorPaletteGrid || colorPaletteGrid.children.length > 0) return;

    const cells = [];
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'color-cell';
        cell.dataset.index = i;
        colorPaletteGrid.appendChild(cell);
        cells.push(cell);
    }

    // Animate colors continuously - matched with mobile animation style
    let time = 0;
    function animateColors() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create wave effect with time - same as mobile
            const hue = (index * 2.4 + time * 60 + Math.sin(row * 0.4 + time * 2.5) * 40 + Math.cos(col * 0.4 + time * 2) * 40) % 360;
            const saturation = 55 + Math.sin(time * 1.8 + index * 0.03) * 15;
            const lightness = 70 + Math.cos(time * 2.2 + index * 0.04) * 12;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        requestAnimationFrame(animateColors);
    }
    animateColors();
}

generateColorPalette();

// Generate 300 skin tone cells for the palette with animated skin tones
function generateSkinTonePalette() {
    if (!skinTonePaletteGrid || skinTonePaletteGrid.children.length > 0) return;

    const cells = [];
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'skin-cell';
        cell.dataset.index = i;
        skinTonePaletteGrid.appendChild(cell);
        cells.push(cell);
    }

    // Skin tone base colors (from light to dark, with warm undertones)
    const skinToneRanges = [
        { hMin: 15, hMax: 35, sMin: 20, sMax: 50, lMin: 85, lMax: 95 },  // Very light/fair
        { hMin: 20, hMax: 40, sMin: 30, sMax: 55, lMin: 75, lMax: 85 },  // Light
        { hMin: 18, hMax: 38, sMin: 35, sMax: 60, lMin: 65, lMax: 75 },  // Light-medium
        { hMin: 15, hMax: 35, sMin: 40, sMax: 65, lMin: 55, lMax: 65 },  // Medium
        { hMin: 12, hMax: 32, sMin: 45, sMax: 70, lMin: 45, lMax: 55 },  // Medium-tan
        { hMin: 10, hMax: 30, sMin: 50, sMax: 75, lMin: 35, lMax: 45 },  // Tan
        { hMin: 8, hMax: 28, sMin: 55, sMax: 80, lMin: 25, lMax: 35 },   // Dark
        { hMin: 5, hMax: 25, sMin: 40, sMax: 70, lMin: 15, lMax: 25 }    // Very dark
    ];

    // Animate skin tones continuously - matched with hair color animation speed
    let time = 0;
    function animateSkinTones() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Select skin tone range based on row position
            const rangeIndex = Math.floor((row / 15) * skinToneRanges.length);
            const range = skinToneRanges[Math.min(rangeIndex, skinToneRanges.length - 1)];

            // Create wave effect with time - more visible like hair color
            const hueOffset = Math.sin(col * 0.4 + time * 2.5) * 8 + Math.cos(row * 0.4 + time * 2) * 6;
            const satOffset = Math.sin(time * 1.8 + index * 0.03) * 12;
            const lightOffset = Math.cos(time * 2.2 + col * 0.3) * 8;

            const hue = range.hMin + ((range.hMax - range.hMin) * (col / 20)) + hueOffset;
            const saturation = range.sMin + ((range.sMax - range.sMin) * 0.5) + satOffset;
            const lightness = range.lMin + ((range.lMax - range.lMin) * 0.5) + lightOffset;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        requestAnimationFrame(animateSkinTones);
    }
    animateSkinTones();
}

generateSkinTonePalette();

// Generate skin tone cells for the new overlay grid (outside main-container)
function generateSkinToneGridOverlay() {
    if (!skinToneGridCells || skinToneGridCells.children.length > 0) return;

    const cells = [];
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'skin-cell';
        cell.dataset.index = i;
        skinToneGridCells.appendChild(cell);
        cells.push(cell);
    }

    // Skin tone base colors (from light to dark, with warm undertones)
    const skinToneRanges = [
        { hMin: 15, hMax: 35, sMin: 20, sMax: 50, lMin: 85, lMax: 95 },
        { hMin: 20, hMax: 40, sMin: 30, sMax: 55, lMin: 75, lMax: 85 },
        { hMin: 18, hMax: 38, sMin: 35, sMax: 60, lMin: 65, lMax: 75 },
        { hMin: 15, hMax: 35, sMin: 40, sMax: 65, lMin: 55, lMax: 65 },
        { hMin: 12, hMax: 32, sMin: 45, sMax: 70, lMin: 45, lMax: 55 },
        { hMin: 10, hMax: 30, sMin: 50, sMax: 75, lMin: 35, lMax: 45 },
        { hMin: 8, hMax: 28, sMin: 55, sMax: 80, lMin: 25, lMax: 35 },
        { hMin: 5, hMax: 25, sMin: 40, sMax: 70, lMin: 15, lMax: 25 }
    ];

    let time = 0;
    function animateSkinTones() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            const rangeIndex = Math.floor((row / 15) * skinToneRanges.length);
            const range = skinToneRanges[Math.min(rangeIndex, skinToneRanges.length - 1)];

            const hueOffset = Math.sin(col * 0.4 + time * 2.5) * 8 + Math.cos(row * 0.4 + time * 2) * 6;
            const satOffset = Math.sin(time * 1.8 + index * 0.03) * 12;
            const lightOffset = Math.cos(time * 2.2 + col * 0.3) * 8;

            const hue = range.hMin + ((range.hMax - range.hMin) * (col / 20)) + hueOffset;
            const saturation = range.sMin + ((range.sMax - range.sMin) * 0.5) + satOffset;
            const lightness = range.lMin + ((range.lMax - range.lMin) * 0.5) + lightOffset;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        requestAnimationFrame(animateSkinTones);
    }
    animateSkinTones();
}

generateSkinToneGridOverlay();

// Ethnicity Animations
let ethnicityAnimationPlayed = false;
function playEthnicityAnimations() {
    if (ethnicityAnimationPlayed) return;
    ethnicityAnimationPlayed = true;

    // Animate stat numbers
    const statItems = document.querySelectorAll('.ethnicity-stats .stat-item');
    statItems.forEach((item, index) => {
        const targetValue = item.dataset.count;
        const numberEl = item.querySelector('.stat-number');
        if (!numberEl) return;

        setTimeout(() => {
            animateNumber(numberEl, targetValue);
        }, index * 150);
    });

    // Start ethnicity text rotation
    setTimeout(() => {
        startEthnicityRotation();
    }, 600);

    // Desktop: Use inside container elements (like Mood)
    if (!isMobile()) {
        const ethnicityBgElement = document.getElementById('ethnicity-bg');

        // Hide the default ethnicity-bg image
        if (ethnicityBgElement) ethnicityBgElement.classList.remove('active');

        // Start inside container animations (CSS handles visibility via step-3.substep-3)
        generateEthnicityPaletteInside();
        startEthnicitySlideshowInside();
        startEthnicityFlagRainInside();
    }
}

function animateNumber(element, targetValue) {
    const isK = targetValue.includes('K');
    const isM = targetValue.includes('M');
    let numValue = parseFloat(targetValue.replace('K', '').replace('M', ''));
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        current = numValue * easeOut;

        if (isM) {
            element.textContent = current.toFixed(1) + 'M';
        } else if (isK) {
            element.textContent = Math.round(current) + 'K';
        } else {
            element.textContent = Math.round(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// Skin Tone image rotation (substep 2)
const skinToneImagePaths = [
    '/assets/skin_tone_1.png',
    '/assets/skin_tone_2.png',
    '/assets/skin_tone_3.png',
    '/assets/skin_tone_4.png',
    '/assets/skin_tone_5.png'
];
let skinToneIndex = 0;
let skinToneInterval = null;
let isSkinToneTransitioning = false;

// Load skin tone textures
const skinToneTextures = skinToneImagePaths.map(path => {
    const tex = loader.load(path, (t) => {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
    });
    return tex;
});

// Smooth opacity fade for skin tone - no blur, just soft fade
function transitionToSkinToneImage(newIndex) {
    if (isSkinToneTransitioning) return;
    isSkinToneTransitioning = true;

    uniforms.disableBlur.value = 1.0;
    const duration = 600; // ms - smooth fade duration
    const startTime = performance.now();

    function fadeOut(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration / 2), 1);
        // Smooth ease out
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        uniforms.opacity.value = 1 - easeProgress;

        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            // Switch texture at midpoint
            uniforms.texture1.value = skinToneTextures[newIndex];
            uniforms.texture2.value = skinToneTextures[newIndex];
            uniforms.progress.value = 0;
            skinToneIndex = newIndex;

            // Start fade in
            fadeIn(performance.now());
        }
    }

    function fadeIn(startTimeIn) {
        function animate(currentTime) {
            const elapsed = currentTime - startTimeIn;
            const progress = Math.min(elapsed / (duration / 2), 1);
            // Smooth ease in
            const easeProgress = Math.pow(progress, 2);
            uniforms.opacity.value = easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                uniforms.opacity.value = 1;
                isSkinToneTransitioning = false;
            }
        }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(fadeOut);
}

function startSkinToneRotation() {
    // Prevent double start
    if (skinToneInterval) return;

    skinToneIndex = 0;

    // Set initial skin tone image - disable blur for skin tone
    if (currentStep === 3 && currentSubStep === 2) {
        uniforms.disableBlur.value = 1.0;
        uniforms.texture1.value = skinToneTextures[0];
        uniforms.texture2.value = skinToneTextures[0];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }

    // Change image every 2.5 seconds - smooth fade transition
    skinToneInterval = setInterval(() => {
        if (currentStep === 3 && currentSubStep === 2 && !isSkinToneTransitioning) {
            const nextIndex = (skinToneIndex + 1) % skinToneTextures.length;
            transitionToSkinToneImage(nextIndex);
        }
    }, 2500);
}

function stopSkinToneRotation() {
    if (skinToneInterval) {
        clearInterval(skinToneInterval);
        skinToneInterval = null;
    }
    skinToneIndex = 0;
    isSkinToneTransitioning = false;
    // Re-enable blur for other transitions
    uniforms.disableBlur.value = 0.0;
}

// Ethnicity text rotation with image transition
const ethnicityNames = ['Asian', 'African', 'Latin', 'Arabian', 'Indian'];
const ethnicityImagePaths = [
    '/assets/center_image_2_asian.png',
    '/assets/center_image_2_african.png',
    '/assets/center_image_2_latine.png',
    '/assets/center_image_2_arabian.png',
    '/assets/center_image_2_indian.png'
];
let ethnicityIndex = 0;
let ethnicityInterval = null;

// Load ethnicity textures
const ethnicityTextures = ethnicityImagePaths.map(path => {
    const tex = loader.load(path, (t) => {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
    });
    return tex;
});

// Ethnicity transition state - using shader opacity for smooth fade
let isEthnicityTransitioning = false;
let pendingEthnicityIndex = -1;

function transitionToEthnicityImage(newIndex) {
    if (isEthnicityTransitioning || newIndex === ethnicityIndex) return;

    isEthnicityTransitioning = true;
    pendingEthnicityIndex = newIndex;

    // Fade out -> switch texture -> fade in (no blur)
    const duration = 500; // ms total
    const startTime = performance.now();

    function fadeOut(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration / 2), 1);
        // Smooth ease out
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        uniforms.opacity.value = 1 - easeProgress;

        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            // Switch texture at midpoint (no blur transition)
            uniforms.texture1.value = ethnicityTextures[pendingEthnicityIndex];
            uniforms.texture2.value = ethnicityTextures[pendingEthnicityIndex];
            uniforms.progress.value = 0; // Keep at 0 to avoid blur

            // Start fade in
            fadeIn(performance.now());
        }
    }

    function fadeIn(startTimeIn) {
        function animate(currentTime) {
            const elapsed = currentTime - startTimeIn;
            const progress = Math.min(elapsed / (duration / 2), 1);
            // Smooth ease in
            const easeProgress = Math.pow(progress, 3);

            uniforms.opacity.value = easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                uniforms.opacity.value = 1;
                isEthnicityTransitioning = false;
                pendingEthnicityIndex = -1;
            }
        }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(fadeOut);
}

function startEthnicityRotation() {
    // Prevent double start
    if (ethnicityInterval) return;

    const ethnicityText = document.getElementById('ethnicity-text');
    if (!ethnicityText) return;

    ethnicityText.textContent = ethnicityNames[0];
    ethnicityIndex = 0;

    // Set initial ethnicity image
    if (currentStep === 3 && currentSubStep === 3) {
        uniforms.texture1.value = ethnicityTextures[0];
        uniforms.texture2.value = ethnicityTextures[0];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }

    ethnicityInterval = setInterval(() => {
        ethnicityText.style.opacity = '0';

        const nextIndex = (ethnicityIndex + 1) % ethnicityNames.length;

        // Start image transition (only if not already transitioning)
        if (currentStep === 3 && currentSubStep === 3 && !isEthnicityTransitioning) {
            transitionToEthnicityImage(nextIndex);
        }

        setTimeout(() => {
            ethnicityIndex = nextIndex;
            ethnicityText.textContent = ethnicityNames[ethnicityIndex];
            ethnicityText.style.opacity = '1';
        }, 300);
    }, 2000);
}

function stopEthnicityRotation() {
    if (ethnicityInterval) {
        clearInterval(ethnicityInterval);
        ethnicityInterval = null;
    }
    isEthnicityTransitioning = false;
}

// Reset ethnicity animation when leaving substep 3
function resetEthnicityAnimations() {
    ethnicityAnimationPlayed = false;
    stopEthnicityRotation();
    ethnicityIndex = 0;
    pendingEthnicityIndex = -1;
    const statNumbers = document.querySelectorAll('.ethnicity-stats .stat-number');
    statNumbers.forEach(el => el.textContent = '0');
    const ethnicityText = document.getElementById('ethnicity-text');
    if (ethnicityText) ethnicityText.textContent = 'Asian';

    // Reset to default scene texture when leaving ethnicity substep
    if (textures[currentScene]) {
        uniforms.texture1.value = textures[currentScene];
        uniforms.texture2.value = textures[currentScene];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }

    // Desktop: Stop inside container animations (CSS handles visibility)
    stopEthnicitySlideshowInside();
    stopEthnicityPaletteInside();
    stopEthnicityFlagRainInside();
}

// ===== MOOD SYSTEM (Substep 4) =====
const moodNames = ['Happy', 'Confident', 'Serious'];
const moodImagePaths = [
    '/assets/mood-1-Photoroom.png',
    '/assets/mood-2-Photoroom.png',
    '/assets/mood-3-Photoroom.png'
];
let moodIndex = 0;
let moodInterval = null;
let moodAnimationPlayed = false;

// Load mood textures (same as ethnicity for now)
const moodTextures = moodImagePaths.map(path => {
    const tex = loader.load(path, (t) => {
        t.minFilter = THREE.LinearFilter;
        t.generateMipmaps = false;
    });
    return tex;
});

// Mood transition state
let isMoodTransitioning = false;
let pendingMoodIndex = -1;

function transitionToMoodImage(newIndex) {
    if (isMoodTransitioning || newIndex === moodIndex) return;

    isMoodTransitioning = true;
    pendingMoodIndex = newIndex;

    // Fade out -> switch texture -> fade in (no blur)
    uniforms.disableBlur.value = 1.0;
    const duration = 500;
    const startTime = performance.now();

    function fadeOut(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration / 2), 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        uniforms.opacity.value = 1 - easeProgress;

        if (progress < 1) {
            requestAnimationFrame(fadeOut);
        } else {
            uniforms.texture1.value = moodTextures[pendingMoodIndex];
            uniforms.texture2.value = moodTextures[pendingMoodIndex];
            uniforms.progress.value = 0;
            fadeIn(performance.now());
        }
    }

    function fadeIn(startTimeIn) {
        function animate(currentTime) {
            const elapsed = currentTime - startTimeIn;
            const progress = Math.min(elapsed / (duration / 2), 1);
            const easeProgress = Math.pow(progress, 3);
            uniforms.opacity.value = easeProgress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                uniforms.opacity.value = 1;
                isMoodTransitioning = false;
                pendingMoodIndex = -1;
            }
        }
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(fadeOut);
}

function startMoodRotation() {
    if (moodInterval) return;

    const moodText = document.getElementById('mood-text');
    if (!moodText) return;

    moodText.textContent = moodNames[0];
    moodIndex = 0;

    // Set initial mood image
    if (currentStep === 3 && currentSubStep === 4) {
        uniforms.disableBlur.value = 1.0;
        uniforms.texture1.value = moodTextures[0];
        uniforms.texture2.value = moodTextures[0];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }

    moodInterval = setInterval(() => {
        moodText.style.opacity = '0';

        const nextIndex = (moodIndex + 1) % moodNames.length;

        if (currentStep === 3 && currentSubStep === 4 && !isMoodTransitioning) {
            transitionToMoodImage(nextIndex);
        }

        setTimeout(() => {
            moodIndex = nextIndex;
            moodText.textContent = moodNames[moodIndex];
            moodText.style.opacity = '1';
        }, 300);
    }, 2000);
}

function stopMoodRotation() {
    if (moodInterval) {
        clearInterval(moodInterval);
        moodInterval = null;
    }
    isMoodTransitioning = false;
    uniforms.disableBlur.value = 0.0;
}

// Mood Animations (stats counter)
function playMoodAnimations() {
    if (moodAnimationPlayed) return;
    moodAnimationPlayed = true;

    // Animate stat numbers
    const statItems = document.querySelectorAll('.mood-stats .stat-item');
    statItems.forEach((item, index) => {
        const targetValue = item.dataset.count;
        const numberEl = item.querySelector('.stat-number');
        if (!numberEl) return;

        setTimeout(() => {
            animateMoodNumber(numberEl, targetValue);
        }, index * 150);
    });

    // Start mood text rotation
    setTimeout(() => {
        startMoodRotation();
    }, 600);

    // Desktop: Show mood slideshow, white palette and emoji rain
    if (!isMobile()) {
        const moodSlideshowEl = document.getElementById('mood-slideshow');
        const moodPaletteEl = document.getElementById('mood-palette-desktop');
        const moodEmojiEl = document.getElementById('mood-emoji-rain-desktop');
        const moodBgEl = document.getElementById('mood-bg');

        // Hide the default mood-bg image
        if (moodBgEl) moodBgEl.classList.remove('active');

        if (moodPaletteEl) {
            moodPaletteEl.classList.add('active');
            generateMoodPaletteDesktop();
        }
        if (moodSlideshowEl) moodSlideshowEl.classList.add('active');
        if (moodEmojiEl) moodEmojiEl.classList.add('active');

        startMoodSlideshow();
        startMoodEmojiRainDesktop();
    }
}

function animateMoodNumber(element, targetValue) {
    const isK = targetValue.includes('K');
    const isM = targetValue.includes('M');
    let numValue = parseFloat(targetValue.replace('K', '').replace('M', ''));
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        current = numValue * easeOut;

        if (isM) {
            element.textContent = current.toFixed(1) + 'M';
        } else if (isK) {
            element.textContent = Math.round(current) + 'K';
        } else {
            element.textContent = Math.round(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function resetMoodAnimations() {
    moodAnimationPlayed = false;
    stopMoodRotation();
    moodIndex = 0;
    pendingMoodIndex = -1;
    const statNumbers = document.querySelectorAll('.mood-stats .stat-number');
    statNumbers.forEach(el => el.textContent = '0');
    const moodText = document.getElementById('mood-text');
    if (moodText) moodText.textContent = 'Happy';

    // Reset to default scene texture
    if (textures[currentScene]) {
        uniforms.texture1.value = textures[currentScene];
        uniforms.texture2.value = textures[currentScene];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }

    // Desktop: Hide mood slideshow, palette and emoji rain
    const moodSlideshowEl = document.getElementById('mood-slideshow');
    const moodPaletteEl = document.getElementById('mood-palette-desktop');
    const moodEmojiEl = document.getElementById('mood-emoji-rain-desktop');

    if (moodSlideshowEl) moodSlideshowEl.classList.remove('active');
    if (moodPaletteEl) moodPaletteEl.classList.remove('active');
    if (moodEmojiEl) moodEmojiEl.classList.remove('active');

    stopMoodSlideshow();
    stopMoodPaletteDesktop();
    stopMoodEmojiRainDesktop();
}

updateUI = function () {
    originalUpdateUI();

    // Update mobile navigation
    if (typeof updateMobileNav === 'function') {
        updateMobileNav();
    }

    // Ecommerce animation for Step 6
    if (currentStep === 6) {
        playEcommerceLoadingAnimation();
    }

    // Pause all videos when not in Scene selection steps
    if (currentStep !== 0 && currentStep !== 1) {
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
    }

    // Update substep class on main-container for CSS targeting
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        // Remove all substep classes
        for (let i = 0; i < 5; i++) {
            mainContainer.classList.remove(`substep-${i}`);
        }
        // Add current substep class when in Step 3
        if (currentStep === 3) {
            mainContainer.classList.add(`substep-${currentSubStep}`);
        }
    }

    // Control Customize Model backgrounds based on substep
    if (currentStep === 3) {
        if (currentSubStep === 0) {
            // Hair Color - show slideshow and color palette (hide canvas)
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.add('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.add('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide Hair Style overlays for Hair Color (it has its own via slideshow)
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            stopHairStyleSlideshow();
            stopHairStylePaletteDesktop();
            // Stop Hair Style inside animations
            stopHairstyleSlideshowInside();
            stopHairstylePaletteInside();
            // Stop Skin Tone inside animations
            stopSkintoneSlideshowInside();
            stopSkintonePaletteInside();
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Hide Three.js canvas for Hair Color
            if (artWrapper) artWrapper.style.opacity = '0';
            stopSkinToneRotation();
            resetEthnicityAnimations();
            resetMoodAnimations();
            startHairColorSlideshow();
        } else if (currentSubStep === 1) {
            // Hair Style - use inside container system (like Ethnicity/Mood)
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide old desktop overlays
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Hide Three.js canvas for Hair Style
            if (artWrapper) artWrapper.style.opacity = '0';
            stopSkinToneRotation();
            stopHairColorSlideshow();
            // Stop Skin Tone inside animations
            stopSkintoneSlideshowInside();
            stopSkintonePaletteInside();
            resetEthnicityAnimations();
            resetMoodAnimations();
            // Start inside container animations (CSS handles visibility via step-3.substep-1)
            generateHairstylePaletteInside();
            startHairstyleSlideshowInside();
        } else if (currentSubStep === 2) {
            // Skin Tone - use inside container system (like Ethnicity/Mood)
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide Hair Style overlays
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            stopHairStyleSlideshow();
            stopHairStylePaletteDesktop();
            // Stop Hair Style inside animations
            stopHairstyleSlideshowInside();
            stopHairstylePaletteInside();
            // Hide old skin tone overlays
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Hide Three.js canvas for Skin Tone
            if (artWrapper) artWrapper.style.opacity = '0';
            stopHairColorSlideshow();
            resetEthnicityAnimations();
            resetMoodAnimations();
            // Start inside container animations (CSS handles visibility via step-3.substep-2)
            generateSkintonePaletteInside();
            startSkintoneSlideshowInside();
        } else if (currentSubStep === 3) {
            // Ethnicity - show ethnicity slideshow (hide Three.js canvas)
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide Hair Style overlays for Ethnicity
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            stopHairStyleSlideshow();
            stopHairStylePaletteDesktop();
            // Stop Hair Style inside animations
            stopHairstyleSlideshowInside();
            stopHairstylePaletteInside();
            // Stop Skin Tone inside animations
            stopSkintoneSlideshowInside();
            stopSkintonePaletteInside();
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Hide Three.js canvas for Ethnicity (we use slideshow instead)
            if (artWrapper) artWrapper.style.opacity = '0';
            stopSkinToneRotation();
            stopHairColorSlideshow();
            resetMoodAnimations();

            // Start ethnicity animations
            playEthnicityAnimations();
        } else if (currentSubStep === 4) {
            // Mood - show mood slideshow (hide Three.js canvas)
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide Hair Style overlays for Mood
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            stopHairStyleSlideshow();
            stopHairStylePaletteDesktop();
            // Stop Hair Style inside animations
            stopHairstyleSlideshowInside();
            stopHairstylePaletteInside();
            // Stop Skin Tone inside animations
            stopSkintoneSlideshowInside();
            stopSkintonePaletteInside();
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Hide Three.js canvas for Mood (we use slideshow instead)
            if (artWrapper) artWrapper.style.opacity = '0';
            stopSkinToneRotation();
            stopHairColorSlideshow();
            resetEthnicityAnimations();

            // Start mood animations
            playMoodAnimations();
        } else {
            // Other substeps (Body Shape) - show video
            if (customizeVideo) {
                customizeVideo.classList.remove('hidden');
                customizeVideo.play().catch(() => {});
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            // Hide Hair Style overlays for Body Shape
            if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
            if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
            stopHairStyleSlideshow();
            stopHairStylePaletteDesktop();
            // Stop Hair Style inside animations
            stopHairstyleSlideshowInside();
            stopHairstylePaletteInside();
            // Stop Skin Tone inside animations
            stopSkintoneSlideshowInside();
            stopSkintonePaletteInside();
            if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
            // Show Three.js canvas for Body Shape
            if (artWrapper) artWrapper.style.opacity = '1';
            stopSkinToneRotation();
            stopHairColorSlideshow();
            resetEthnicityAnimations();
            resetMoodAnimations();
        }
    } else {
        // Not in Step 3 - show canvas, hide all backgrounds, pause video
        if (customizeVideo) {
            customizeVideo.classList.remove('hidden');
            customizeVideo.pause();
        }
        if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
        if (hairColorSlideshow) hairColorSlideshow.classList.remove('active');
        if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
        if (ethnicityBg) ethnicityBg.classList.remove('active');
        // Hide Hair Style overlays when not in Step 3
        if (hairStyleSlideshow) hairStyleSlideshow.classList.remove('active');
        if (hairStylePaletteDesktop) hairStylePaletteDesktop.classList.remove('active');
        stopHairStyleSlideshow();
        stopHairStylePaletteDesktop();
        if (skinToneGridOverlay) skinToneGridOverlay.classList.remove('active');
        // Show Three.js canvas when not in Step 3
        if (artWrapper) artWrapper.style.opacity = '1';
        stopSkinToneRotation();
        stopHairColorSlideshow();
        resetEthnicityAnimations();
        resetMoodAnimations();
    }

    // Reset logo color when leaving Step 5
    if (currentStep !== 5) {
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.style.color = ''; // Reset to CSS default
        }
    }
};

// Change Color Parallax Effect (Step 5)
function initChangeColorParallax() {
    const changeColorSection = document.querySelector('.change-color-section');
    if (!changeColorSection) return;

    const leftImg = changeColorSection.querySelector('.box-left img');
    const centerImg = changeColorSection.querySelector('.box-center img');
    const rightImg = changeColorSection.querySelector('.box-right img');
    const frontImg = changeColorSection.querySelector('.change-color-center > img');

    window.addEventListener('mousemove', (e) => {
        if (currentStep !== 5) return;

        const rect = changeColorSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        // Parallax strength for each element - different directions
        const strength = 12;
        const frontStrength = 20;

        // Left image moves opposite direction
        if (leftImg) {
            leftImg.style.transform = `translateX(calc(-50% + ${-x * strength}px)) scaleX(-1) translateY(${-y * strength * 0.5}px)`;
        }
        // Center image moves slightly
        if (centerImg) {
            centerImg.style.transform = `translateX(calc(-50% + ${x * strength * 0.5}px)) translateY(${y * strength * 0.3}px)`;
        }
        // Right image moves same as mouse
        if (rightImg) {
            rightImg.style.transform = `translateX(calc(-50% + ${x * strength}px)) translateY(${y * strength * 0.5}px)`;
        }
        // Front image has strongest parallax
        if (frontImg) {
            frontImg.style.transform = `translateX(${x * frontStrength}px) translateY(${y * frontStrength * 0.4}px)`;
        }
    });
}

// Initialize Change Color Parallax
initChangeColorParallax();

// Change Color Badge Click Handler (Step 5)
function initChangeColorBadges() {
    const badges = document.querySelectorAll('.change-color-badges .color-badge');
    const changeColorSection = document.querySelector('.change-color-section');
    if (!badges.length || !changeColorSection) return;

    // Color scheme definitions
    const colorSchemes = {
        olive: {
            bg: '#b6b870',
            hex: '#B6B870',
            name: 'Olive Green',
            taglineColor: '#3a3b25',
            logoColor: '#6b6c47',
            gradientColors: {
                dark: 'rgba(80, 81, 45, 0.85)',
                medium: 'rgba(100, 101, 60, 0.5)',
                light: 'rgba(130, 131, 80, 0.2)',
                transparent: 'rgba(182, 184, 112, 0)'
            },
            images: {
                front: '/assets/change_color_front.png',
                left: '/assets/change_color_left.png',
                back: '/assets/change_color_back.png',
                zoom: '/assets/change_color_zoom.png'
            }
        },
        burgundy: {
            bg: '#722f37',
            hex: '#722F37',
            name: 'Burgundy',
            taglineColor: '#4a2328',
            logoColor: '#3d1a1e',
            gradientColors: {
                dark: 'rgba(60, 25, 29, 0.85)',
                medium: 'rgba(85, 35, 41, 0.5)',
                light: 'rgba(100, 42, 49, 0.2)',
                transparent: 'rgba(114, 47, 55, 0)'
            },
            images: {
                front: '/assets/change_color_front_2.png',
                left: '/assets/change_color_left_2.png',
                back: '/assets/change_color_back_2.png',
                zoom: '/assets/change_color_zoom_2.png'
            }
        },
        navy: {
            bg: '#2c3e50',
            hex: '#2C3E50',
            name: 'Navy Blue',
            taglineColor: '#1f3040',
            logoColor: '#151d25',
            gradientColors: {
                dark: 'rgba(25, 35, 45, 0.85)',
                medium: 'rgba(35, 50, 65, 0.5)',
                light: 'rgba(50, 70, 90, 0.2)',
                transparent: 'rgba(44, 62, 80, 0)'
            },
            images: {
                front: '/assets/change_color_front_3.png',
                left: '/assets/change_color_left_3.png',
                back: '/assets/change_color_back_3.png',
                zoom: '/assets/change_color_zoom_3.png'
            }
        }
    };

    let currentColorScheme = 'olive';

    function applyColorScheme(schemeName) {
        if (currentColorScheme === schemeName) return;
        currentColorScheme = schemeName;
        const scheme = colorSchemes[schemeName];

        // Update background
        const bg = changeColorSection.querySelector('.change-color-bg');
        if (bg) bg.style.background = scheme.bg;

        // Update hex code and color name
        const hexCode = changeColorSection.querySelector('.hex-code');
        const colorName = changeColorSection.querySelector('.color-name');
        if (hexCode) hexCode.textContent = scheme.hex;
        if (colorName) colorName.textContent = scheme.name;

        // Update tagline color (always white)
        const tagline = changeColorSection.querySelector('.change-color-tagline');
        if (tagline) tagline.style.color = '#ffffff';

        // Update logo text color
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.style.color = scheme.logoColor;
        }

        // Update images
        const frontImg = changeColorSection.querySelector('.change-color-center > img');
        const leftImg = changeColorSection.querySelector('.box-left img');
        const centerImg = changeColorSection.querySelector('.box-center img');
        const rightImg = changeColorSection.querySelector('.box-right img');

        if (frontImg) frontImg.src = scheme.images.front;
        if (leftImg) leftImg.src = scheme.images.left;
        if (centerImg) centerImg.src = scheme.images.back;
        if (rightImg) rightImg.src = scheme.images.zoom;

        // Update box gradients via CSS custom properties
        const boxes = changeColorSection.querySelectorAll('.change-color-boxes .box');
        boxes.forEach(box => {
            box.style.setProperty('--gradient-dark', scheme.gradientColors.dark);
            box.style.setProperty('--gradient-medium', scheme.gradientColors.medium);
            box.style.setProperty('--gradient-light', scheme.gradientColors.light);
            box.style.setProperty('--gradient-transparent', scheme.gradientColors.transparent);
        });

        // Update active badge state
        badges.forEach(badge => {
            badge.classList.remove('active');
            if (badge.classList.contains(schemeName)) {
                badge.classList.add('active');
            }
        });

        // === MOBILE: Update mobile color layout ===
        const mobileLayout = document.getElementById('color-mobile-layout');
        if (mobileLayout) {
            // Update mobile background
            const mobileBg = mobileLayout.querySelector('.color-mobile-bg');
            if (mobileBg) mobileBg.style.background = scheme.bg;

            // Update mobile front image
            const mobileFront = mobileLayout.querySelector('.color-mobile-front img');
            if (mobileFront) mobileFront.src = scheme.images.front;

            // Update mobile box images
            const mobileLeftImg = mobileLayout.querySelector('.color-box-item.left img');
            const mobileCenterImg = mobileLayout.querySelector('.color-box-item.center img');
            const mobileRightImg = mobileLayout.querySelector('.color-box-item.right img');

            if (mobileLeftImg) mobileLeftImg.src = scheme.images.left;
            if (mobileCenterImg) mobileCenterImg.src = scheme.images.back;
            if (mobileRightImg) mobileRightImg.src = scheme.images.zoom;

            // Update mobile box gradients
            const mobileBoxes = mobileLayout.querySelectorAll('.color-box-item');
            mobileBoxes.forEach(box => {
                box.style.setProperty('--gradient-dark', scheme.gradientColors.dark);
                box.style.setProperty('--gradient-medium', scheme.gradientColors.medium);
                box.style.setProperty('--gradient-light', scheme.gradientColors.light);
                box.style.setProperty('--gradient-transparent', scheme.gradientColors.transparent);
            });

            // Update mobile top/bottom gradients
            const mobileGradientTop = mobileLayout.querySelector('.color-mobile-gradient-top');
            const mobileGradientBottom = mobileLayout.querySelector('.color-mobile-gradient-bottom');

            if (mobileGradientTop) {
                mobileGradientTop.style.background = `linear-gradient(to bottom,
                    ${scheme.gradientColors.dark} 0%,
                    ${scheme.gradientColors.medium} 40%,
                    ${scheme.gradientColors.transparent} 100%)`;
            }
            if (mobileGradientBottom) {
                mobileGradientBottom.style.background = `linear-gradient(to top,
                    ${scheme.gradientColors.dark} 0%,
                    ${scheme.gradientColors.medium} 30%,
                    ${scheme.gradientColors.light} 60%,
                    ${scheme.gradientColors.transparent} 100%)`;
            }

            // Update mobile swatches active state
            const mobileSwatches = mobileLayout.querySelectorAll('.color-swatch-item');
            mobileSwatches.forEach(swatch => {
                swatch.classList.remove('active');
                if (swatch.dataset.color === schemeName) {
                    swatch.classList.add('active');
                }
            });

            // Update mobile color code display
            const mobileHexCode = mobileLayout.querySelector('.mobile-hex-code');
            const mobileColorName = mobileLayout.querySelector('.mobile-color-name');
            if (mobileHexCode) mobileHexCode.textContent = scheme.hex;
            if (mobileColorName) mobileColorName.textContent = scheme.name;
        }
    }

    // Add click handlers to badges
    badges.forEach(badge => {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', () => {
            if (badge.classList.contains('olive')) {
                applyColorScheme('olive');
            } else if (badge.classList.contains('burgundy')) {
                applyColorScheme('burgundy');
            } else if (badge.classList.contains('navy')) {
                applyColorScheme('navy');
            }
        });
    });

    // Set initial active badge
    const oliveBadge = document.querySelector('.color-badge.olive');
    if (oliveBadge) oliveBadge.classList.add('active');

    // Auto color rotation
    const colorOrder = ['olive', 'navy', 'burgundy'];
    let colorIndex = 0;
    let autoRotateInterval = null;

    function startAutoRotate() {
        if (autoRotateInterval) return;
        autoRotateInterval = setInterval(() => {
            if (currentStep !== 5) return; // Only rotate when in Step 5
            colorIndex = (colorIndex + 1) % colorOrder.length;
            const nextColor = colorOrder[colorIndex];
            currentColorScheme = ''; // Reset to allow transition
            applyColorScheme(nextColor);
        }, 4000); // Change every 4 seconds
    }

    function stopAutoRotate() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
            autoRotateInterval = null;
        }
    }

    // Start auto-rotation when entering Step 5
    setInterval(() => {
        if (currentStep === 5 && !autoRotateInterval) {
            startAutoRotate();
        } else if (currentStep !== 5 && autoRotateInterval) {
            stopAutoRotate();
            // Reset to olive when leaving Step 5
            colorIndex = 0;
            currentColorScheme = '';
            applyColorScheme('olive');
        }
    }, 500);

    // Pause auto-rotation on badge click, resume after delay
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            stopAutoRotate();
            // Update colorIndex to match clicked color
            if (badge.classList.contains('olive')) colorIndex = 0;
            else if (badge.classList.contains('navy')) colorIndex = 1;
            else if (badge.classList.contains('burgundy')) colorIndex = 2;
            // Resume auto-rotation after 6 seconds
            setTimeout(() => {
                if (currentStep === 5) startAutoRotate();
            }, 6000);
        });
    });

    // === MOBILE: Add click handlers to mobile swatches ===
    const mobileSwatches = document.querySelectorAll('.color-swatches-inline .color-swatch-item');
    mobileSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            stopAutoRotate();
            const color = swatch.dataset.color;
            if (color === 'olive') colorIndex = 0;
            else if (color === 'navy') colorIndex = 1;
            else if (color === 'burgundy') colorIndex = 2;
            currentColorScheme = ''; // Reset to allow transition
            applyColorScheme(color);
            // Resume auto-rotation after 6 seconds
            setTimeout(() => {
                if (currentStep === 5) startAutoRotate();
            }, 6000);
        });
    });
}

// Initialize Change Color Badges
initChangeColorBadges();

// ========================================
// Change Pose Section (Step 6) - THREE.JS VERSION
// ========================================
let currentPoseIndex = 0;
const totalPoses = 9; // 9 poses only
let poseScrollProgress = 0;
const POSE_SCROLL_THRESHOLD = 300;
let accumulatedPoseScroll = 0;
let poseScrollLocked = false; // Prevents scroll processing immediately after entering step 6

// Three.js Pose Scene
let poseScene, poseCamera, poseRenderer;
let posePlanes = [];
let poseTextures = [];
let poseAnimationId = null;

// Pose images from assets/poses folder
const poseImages = [
    '/assets/poses/pose-1-Photoroom.png',
    '/assets/poses/pose-2-Photoroom.png',
    '/assets/poses/pose-3-Photoroom.png',
    '/assets/poses/pose-4-Photoroom.png',
    '/assets/poses/pose-5-Photoroom.png',
    '/assets/poses/pose-6-Photoroom.png',
    '/assets/poses/pose-7-Photoroom.png',
    '/assets/poses/pose-8-Photoroom.png',
    '/assets/poses/pose-9-Photoroom.png'
];

// Pose data for labels (small title and big title)
const poseData = [
    { small: 'Confident Stance', big: 'Hand on Hip Power Pose' },
    { small: 'Thoughtful Look', big: 'Playful Thinking Pose' },
    { small: 'Elegant Touch', big: 'Graceful Neck Pose' },
    { small: 'Dynamic Dance', big: 'Arms Up Active Pose' },
    { small: 'Mystery Look', big: 'Hand Covering Face Pose' },
    { small: 'Relaxed Vibe', big: 'Hands Behind Head Pose' },
    { small: 'Casual Cross', big: 'Crossed Leg Fashion Pose' },
    { small: 'Friendly Smile', big: 'Approachable Happy Pose' },
    { small: 'Hair Flip', big: 'Dynamic Motion Pose' }
];

// DOM elements for pose labels
let poseLabels = [];

// Blur shader for pose cards
const poseVertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const poseFragmentShader = `
    uniform sampler2D uTexture;
    uniform float uBlur;
    uniform float uOpacity;
    uniform float uWhiteOverlay;
    varying vec2 vUv;

    // High quality 9-tap Gaussian blur
    vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(1.3846153846) * direction;
        vec2 off2 = vec2(3.2307692308) * direction;
        color += texture2D(image, uv) * 0.2270270270;
        color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
        color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
        color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
        return color;
    }

    void main() {
        vec2 resolution = vec2(1024.0, 1024.0);
        vec4 color;

        if (uBlur > 0.01) {
            // Multi-pass blur for smoother effect
            float blurAmount = uBlur * 1.5;
            vec4 blurH = blur9(uTexture, vUv, resolution, vec2(blurAmount, 0.0));
            vec4 blurV = blur9(uTexture, vUv, resolution, vec2(0.0, blurAmount));
            // Additional diagonal passes for smoother blur
            vec4 blurD1 = blur9(uTexture, vUv, resolution, vec2(blurAmount * 0.707, blurAmount * 0.707));
            vec4 blurD2 = blur9(uTexture, vUv, resolution, vec2(blurAmount * 0.707, -blurAmount * 0.707));
            color = (blurH + blurV + blurD1 + blurD2) * 0.25;
        } else {
            color = texture2D(uTexture, vUv);
        }

        // Apply white overlay only to non-transparent pixels (preserve PNG transparency)
        // Only apply white overlay where there is actual content (alpha > 0)
        if (color.a > 0.01) {
            vec3 white = vec3(1.0, 1.0, 1.0);
            color.rgb = mix(color.rgb, white, uWhiteOverlay);
        }

        color.a *= uOpacity;
        gl_FragColor = color;
    }
`;

// Check if all pose planes are loaded
function checkAllPosePlanesLoaded() {
    const loadedCount = posePlanes.filter(p => p !== undefined).length;
    if (loadedCount === totalPoses) {
        updatePoseStackThreeJS(0);
    }
}

function initPoseThreeJS() {
    const container = document.getElementById('pose-canvas-container');
    if (!container) return;

    // Create scene - null background for PNG transparency
    poseScene = new THREE.Scene();
    poseScene.background = null;

    // Create camera (perspective for 3D effect)
    const aspect = container.clientWidth / container.clientHeight;
    poseCamera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    poseCamera.position.set(0, 0, 5);

    // Create renderer with transparency support
    poseRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    poseRenderer.setClearColor(0x000000, 0); // Transparent background
    poseRenderer.setSize(container.clientWidth, container.clientHeight);
    poseRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(poseRenderer.domElement);

    // Load textures and create planes
    const textureLoader = new THREE.TextureLoader();

    // Load pose images (first 9 poses)
    poseImages.forEach((imgSrc, index) => {
        textureLoader.load(imgSrc, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;

            poseTextures[index] = texture;

            // Calculate aspect ratio for the plane
            const imgAspect = texture.image.width / texture.image.height;
            const planeHeight = 4.5; // Base height in 3D units
            const planeWidth = planeHeight * imgAspect;

            // Create material with custom shader
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: texture },
                    uBlur: { value: 0.0 },
                    uOpacity: { value: 1.0 },
                    uWhiteOverlay: { value: 0.0 }
                },
                vertexShader: poseVertexShader,
                fragmentShader: poseFragmentShader,
                transparent: true,
                side: THREE.DoubleSide
            });

            // Create plane geometry
            const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
            const plane = new THREE.Mesh(geometry, material);

            // Store reference
            plane.userData.index = index;
            posePlanes[index] = plane;
            poseScene.add(plane);

            // Check if all planes are loaded
            checkAllPosePlanesLoaded();
        });
    });

    // Create pose labels for all 9 poses
    const labelsContainer = document.getElementById('pose-labels-container');
    if (labelsContainer) {
        labelsContainer.innerHTML = '';
        poseLabels = [];

        for (let i = 0; i < 9; i++) { // Only 9 poses get labels
            const label = document.createElement('div');
            label.className = 'pose-label';
            label.style.opacity = '0'; // Start hidden
            label.innerHTML = `
                <span class="pose-small-title">${poseData[i].small}</span>
                <span class="pose-big-title">${poseData[i].big}</span>
                <span class="pose-counter">${String(i + 1).padStart(2, '0')} / 09</span>
            `;
            labelsContainer.appendChild(label);
            poseLabels.push(label);
        }
    }

    // Initial label positioning after a short delay (wait for textures to load)
    setTimeout(() => {
        if (posePlanes.length > 0) {
            updatePoseStackThreeJS(0);
        }
    }, 100);

    // Handle resize
    window.addEventListener('resize', () => {
        if (!container || !poseRenderer || !poseCamera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        poseCamera.aspect = width / height;
        poseCamera.updateProjectionMatrix();
        poseRenderer.setSize(width, height);
    });

    // Start render loop
    animatePoseScene();
}

function animatePoseScene() {
    poseAnimationId = requestAnimationFrame(animatePoseScene);

    if (poseRenderer && poseScene && poseCamera && currentStep === 2) {
        poseRenderer.render(poseScene, poseCamera);
    }
}

// Interpolate between two values
function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Get 3D properties for each card position
function getPoseProperties3D(position) {
    const props = [
        { x: 0, z: 0.5, rotY: 0, blur: 0, opacity: 1, scale: 1, whiteOverlay: 0 },           // Front (active)
        { x: 1.4, z: -1.5, rotY: -0.12, blur: 2, opacity: 0.85, scale: 0.95, whiteOverlay: 0.15 },   // 1st back
        { x: 2.8, z: -3.0, rotY: -0.2, blur: 4, opacity: 0.7, scale: 0.9, whiteOverlay: 0.3 },    // 2nd back
        { x: 4.2, z: -4.5, rotY: -0.28, blur: 6, opacity: 0.55, scale: 0.85, whiteOverlay: 0.45 },  // 3rd back
        { x: 5.6, z: -6.0, rotY: -0.35, blur: 8, opacity: 0.4, scale: 0.8, whiteOverlay: 0.6 }    // 4th back
    ];
    return props[Math.min(position, 4)];
}

// Update Three.js pose stack with scroll progress
function updatePoseStackThreeJS(progress) {
    posePlanes.forEach((plane, index) => {
        if (!plane) return;

        const currentRelPos = (index - currentPoseIndex + totalPoses) % totalPoses;
        const nextRelPos = (index - ((currentPoseIndex + 1) % totalPoses) + totalPoses) % totalPoses;

        const currentProps = getPoseProperties3D(currentRelPos);
        const nextProps = getPoseProperties3D(nextRelPos);

        let x, z, rotY, blur, opacity, scale, whiteOverlay;

        if (currentRelPos === 0 && progress > 0) {
            // Front card exiting - moves toward camera, scales up, fades out
            x = lerp(0, -1.5, progress);
            z = lerp(0.5, 3, progress);
            rotY = lerp(0, 0.4, progress);
            scale = lerp(1, 1.3, progress);
            blur = lerp(0, 10, progress);
            opacity = lerp(1, 0, progress);
            whiteOverlay = 0;
        } else if (currentRelPos === 0) {
            // Front card at rest
            x = 0;
            z = 0.5;
            rotY = 0;
            scale = 1;
            blur = 0;
            opacity = 1;
            whiteOverlay = 0;
        } else {
            // Back cards - interpolate toward front
            x = lerp(currentProps.x, nextProps.x, progress);
            z = lerp(currentProps.z, nextProps.z, progress);
            rotY = lerp(currentProps.rotY, nextProps.rotY, progress);
            scale = lerp(currentProps.scale, nextProps.scale, progress);
            blur = lerp(currentProps.blur, nextProps.blur, progress);
            opacity = lerp(currentProps.opacity, nextProps.opacity, progress);
            whiteOverlay = lerp(currentProps.whiteOverlay, nextProps.whiteOverlay, progress);
        }

        // Apply 3D transforms - centered vertically (y = 0)
        plane.position.x = x;
        plane.position.z = z;
        plane.position.y = 0; // Centered vertically
        plane.rotation.y = rotY;
        plane.scale.set(scale, scale, 1);

        // Update shader uniforms
        if (plane.material.uniforms) {
            plane.material.uniforms.uBlur.value = blur;
            plane.material.uniforms.uOpacity.value = opacity;
            plane.material.uniforms.uWhiteOverlay.value = whiteOverlay;
        }

        // Set render order based on z position (closer = higher)
        plane.renderOrder = 100 - currentRelPos;

        // Update corresponding label position with progress for smooth fade
        updatePoseLabelPosition(index, plane, opacity, currentRelPos, progress);
    });
}

// Update label position to match 3D plane position
function updatePoseLabelPosition(index, plane, opacity, relPos, progress = 0) {
    if (!poseLabels[index] || !poseCamera || !poseRenderer) return;

    const label = poseLabels[index];
    const container = poseRenderer.domElement;
    const rect = container.getBoundingClientRect();

    // Get the left edge of the plane in 3D space
    const planeWidth = plane.geometry.parameters.width;
    const leftEdge = new THREE.Vector3(
        plane.position.x - (planeWidth / 2) * plane.scale.x,
        plane.position.y,
        plane.position.z
    );

    // Project to 2D screen coordinates
    leftEdge.project(poseCamera);

    // Convert to pixel coordinates
    const screenX = (leftEdge.x * 0.5 + 0.5) * rect.width;
    const screenY = (-leftEdge.y * 0.5 + 0.5) * rect.height;

    // Position label close to the image (right-aligned, touching image edge)
    label.style.left = `${screenX - 12}px`;
    label.style.top = `${screenY}px`;
    label.style.transform = 'translateX(-100%) translateY(-50%)';

    // Set z-index based on relative position (front = higher z-index)
    // relPos 0 = front (highest), relPos 1 = behind front, etc.
    label.style.zIndex = 100 - relPos;

    // Calculate label opacity and blur based on position and progress
    let labelOpacity = 0;
    let labelBlur = 0;

    if (relPos === -1) {
        // Image returning from camera (reverse scroll) - fade in as it comes back
        labelOpacity = progress; // Fade in with progress
        labelBlur = 0;
        label.style.zIndex = 200; // Highest z-index for returning label
    } else if (relPos === 0 && progress > 0) {
        // Front card exiting - fade out quickly as it leaves
        labelOpacity = Math.max(0, 1 - (progress * 2)); // Fade out faster
        labelBlur = 0;
    } else if (relPos === 0) {
        // Front card at rest - full visibility
        labelOpacity = 1;
        labelBlur = 0;
    } else if (relPos === 1 && progress > 0.35) {
        // Next card (1st behind) - only show after 35% scroll progress
        // Map progress from 0.35-1.0 to 0-1 for smooth fade in
        const adjustedProgress = (progress - 0.35) / 0.65;
        labelOpacity = adjustedProgress * 0.85; // Max 0.85 opacity for back label
        labelBlur = 4 - (adjustedProgress * 4); // Start at 4px blur, go to 0
    } else {
        // All other cards (relPos >= 2) or relPos 1 with low progress - hide completely
        labelOpacity = 0;
        labelBlur = 0;
    }

    label.style.opacity = labelOpacity;
    label.style.filter = labelBlur > 0 ? `blur(${labelBlur}px)` : 'none';

    // Hide label completely when opacity is very low (prevents ghost visibility)
    label.style.visibility = labelOpacity < 0.05 ? 'hidden' : 'visible';
}

// Update for reverse scrolling - previous image comes back from camera
function updatePoseStackThreeJSReverse(progress) {
    posePlanes.forEach((plane, index) => {
        if (!plane) return;

        const currentRelPos = (index - currentPoseIndex + totalPoses) % totalPoses;

        // Get properties for current and previous positions
        const currentProps = getPoseProperties3D(currentRelPos);

        let x, z, rotY, scale, blur, opacity, whiteOverlay;

        // The previous image (index = currentPoseIndex - 1) should come back from camera
        const prevImageIndex = (currentPoseIndex - 1 + totalPoses) % totalPoses;

        if (index === prevImageIndex) {
            // This is the image that exited toward camera - bring it back
            // Start from camera position (z=3, x=-1.5, scale=1.3, opacity=0) and go to front position
            x = lerp(-1.5, 0, progress);
            z = lerp(3, 0.5, progress);
            rotY = lerp(0.4, 0, progress);
            scale = lerp(1.3, 1, progress);
            blur = lerp(10, 0, progress);
            opacity = lerp(0, 1, progress);
            whiteOverlay = 0;

            // This should be in front when coming back
            plane.renderOrder = 200;
        } else if (currentRelPos === 0) {
            // Current front card moves back to position 1
            const nextProps = getPoseProperties3D(1);
            x = lerp(currentProps.x, nextProps.x, progress);
            z = lerp(currentProps.z, nextProps.z, progress);
            rotY = lerp(currentProps.rotY, nextProps.rotY, progress);
            scale = lerp(currentProps.scale, nextProps.scale, progress);
            blur = lerp(currentProps.blur, nextProps.blur, progress);
            opacity = lerp(currentProps.opacity, nextProps.opacity, progress);
            whiteOverlay = lerp(currentProps.whiteOverlay, nextProps.whiteOverlay, progress);

            plane.renderOrder = 100 - currentRelPos;
        } else {
            // Other cards move back one position
            const nextRelPos = Math.min(currentRelPos + 1, 4);
            const nextProps = getPoseProperties3D(nextRelPos);
            x = lerp(currentProps.x, nextProps.x, progress);
            z = lerp(currentProps.z, nextProps.z, progress);
            rotY = lerp(currentProps.rotY, nextProps.rotY, progress);
            scale = lerp(currentProps.scale, nextProps.scale, progress);
            blur = lerp(currentProps.blur, nextProps.blur, progress);
            opacity = lerp(currentProps.opacity, nextProps.opacity, progress);
            whiteOverlay = lerp(currentProps.whiteOverlay, nextProps.whiteOverlay, progress);

            plane.renderOrder = 100 - currentRelPos;
        }

        plane.position.x = x;
        plane.position.z = z;
        plane.position.y = 0;
        plane.rotation.y = rotY;
        plane.scale.set(scale, scale, 1);

        if (plane.material.uniforms) {
            plane.material.uniforms.uBlur.value = blur;
            plane.material.uniforms.uOpacity.value = opacity;
            plane.material.uniforms.uWhiteOverlay.value = whiteOverlay;
        }

        // Update label
        const labelRelPos = (index === prevImageIndex) ? -1 : currentRelPos; // -1 for returning image
        updatePoseLabelPosition(index, plane, opacity, labelRelPos, progress);
    });
}

// Handle pose scroll - called from wheel event
function handlePoseScroll(deltaY) {
    if (currentStep !== 2) return 'handled';

    // If scroll is locked (just entered step 6), ignore scroll events
    if (poseScrollLocked) return 'handled';

    // At first pose, prevent backward scroll (negative deltaY)
    if (currentPoseIndex === 0 && deltaY < 0 && accumulatedPoseScroll <= 0) {
        accumulatedPoseScroll = 0;
        poseScrollProgress = 0;
        return 'handled';
    }

    // Accumulate scroll
    accumulatedPoseScroll += deltaY * 0.5;

    // At first pose, don't allow negative accumulation
    if (currentPoseIndex === 0 && accumulatedPoseScroll < 0) {
        accumulatedPoseScroll = 0;
    }

    // Calculate progress
    poseScrollProgress = accumulatedPoseScroll / POSE_SCROLL_THRESHOLD;
    poseScrollProgress = Math.max(-1, Math.min(1, poseScrollProgress));

    // Update Three.js visuals
    if (poseScrollProgress >= 0) {
        updatePoseStackThreeJS(poseScrollProgress);
    } else {
        updatePoseStackThreeJSReverse(Math.abs(poseScrollProgress));
    }

    // Check if transition is complete (forward)
    if (poseScrollProgress >= 1) {
        if (currentPoseIndex < totalPoses - 1) {
            // Move to next pose
            currentPoseIndex++;
            accumulatedPoseScroll = 0;
            poseScrollProgress = 0;
            updatePoseStackThreeJS(0);
            return 'handled';
        } else {
            // At last pose (9th) - go to next step
            accumulatedPoseScroll = 0;
            poseScrollProgress = 0;
            updatePoseStackThreeJS(0);
            return 'next';
        }
    }

    // Check if transition is complete (backward)
    if (poseScrollProgress <= -1) {
        if (currentPoseIndex > 0) {
            currentPoseIndex--;
            accumulatedPoseScroll = 0;
            poseScrollProgress = 0;
            updatePoseStackThreeJS(0);
            return 'handled';
        } else {
            // At first pose - don't go back to previous step, just reset
            accumulatedPoseScroll = 0;
            poseScrollProgress = 0;
            updatePoseStackThreeJS(0);
            return 'handled'; // Stay in Change Pose, don't go to prev step
        }
    }

    return 'handled';
}

// Initialize Three.js Pose Scene
initPoseThreeJS();

// --- Mobile Hamburger Menu ---
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburgerMenu && mobileMenu) {
    hamburgerMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
            hamburgerMenu.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });

    // Close menu when clicking a link
    const mobileNavLinks = mobileMenu.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburgerMenu.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}

// --- Mobile Bottom Navigation ---
const mobileBottomNav = document.getElementById('mobile-bottom-nav');
const mobilePrevBtn = document.getElementById('mobile-prev-btn');
const mobileNextBtn = document.getElementById('mobile-next-btn');
const mobileStepIndicator = document.getElementById('mobile-step-indicator');
const mobileStepLabel = document.getElementById('mobile-step-label');

// Check if mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Render mobile step dots
function renderMobileStepDots() {
    if (!mobileStepIndicator) return;

    mobileStepIndicator.innerHTML = steps.map((step, index) => `
        <div class="mobile-step-dot ${index === currentStep ? 'active' : ''}" data-step="${index}"></div>
    `).join('');
}

// Update mobile navigation state
function updateMobileNav() {
    if (!mobileBottomNav) return;

    // Update step label
    if (mobileStepLabel) {
        mobileStepLabel.textContent = steps[currentStep].label;
    }

    // Update dots
    const dots = mobileStepIndicator.querySelectorAll('.mobile-step-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentStep);
    });

    // Update button states
    if (mobilePrevBtn) {
        mobilePrevBtn.disabled = currentStep === 0;
    }
    if (mobileNextBtn) {
        mobileNextBtn.disabled = currentStep === steps.length - 1;
    }
}

// Mobile step transition - instant, no animation
function mobileSlideTransition(direction, callback) {
    // Just execute the callback immediately - no animation
    callback();
}

// Mobile navigation button handlers
if (mobilePrevBtn) {
    mobilePrevBtn.addEventListener('click', () => {
        // On Step 2, DON'T cycle through poses - go directly to previous step
        // Poses auto-rotate, so prev button should go back to Select Scene step

        // On Step 3 (Customize Model), cycle through substeps backwards before going to previous step
        if (currentStep === 3 && isMobile()) {
            if (currentSubStep > 0) {
                currentSubStep--;
                updateMobileCustomizeInfo();
                updateUI();
                return; // Substep changed, don't go back step yet
            }
        }

        if (currentStep > 0) {
            mobileSlideTransition('prev', () => {
                currentStep--;

                // Handle scene transitions for specific steps
                if (currentStep === 0) {
                    transitionToScene(0);
                } else if (currentStep === 1) {
                    transitionToScene(1);
                } else if (currentStep === 2) {
                    transitionToScene(0);
                } else if (currentStep === 3) {
                    transitionToScene(4);
                    // Reset substep to last when going back to Step 3
                    currentSubStep = subSteps.length - 1;
                } else if (currentStep === 4) {
                    transitionToScene(0);
                } else if (currentStep === 5) {
                    transitionToScene(4);
                } else if (currentStep === 6) {
                    transitionToScene(0);
                }

                updateUI();
                updateMobileNav();
                updateMobileStepContent();
            });
        }
    });
}

if (mobileNextBtn) {
    mobileNextBtn.addEventListener('click', () => {
        // On Step 1, cycle through videos before advancing to next step
        if (currentStep === 1 && isMobile()) {
            if (typeof mobileStep1NextVideo === 'function' && mobileStep1NextVideo()) {
                return; // Video changed, don't advance step yet
            }
        }

        // On Step 2, DON'T cycle through poses - go directly to next step
        // Poses auto-rotate, so next button should advance to Customize Model step
        // (Removed pose cycling logic)

        // On Step 3 (Customize Model), cycle through substeps before advancing to next step
        if (currentStep === 3 && isMobile()) {
            if (currentSubStep < subSteps.length - 1) {
                currentSubStep++;
                updateMobileCustomizeInfo();
                updateUI();
                return; // Substep changed, don't advance step yet
            }
        }

        if (currentStep < steps.length - 1) {
            mobileSlideTransition('next', () => {
                currentStep++;

                // Handle scene transitions for specific steps
                if (currentStep === 1) {
                    // Going to Select Scene - show scene 1
                    transitionToScene(1);
                } else if (currentStep === 2) {
                    // Going to Change Pose
                    transitionToScene(0);
                } else if (currentStep === 3) {
                    // Going to Customize Model
                    transitionToScene(4);
                    // Reset substep to 0 when entering Step 3
                    currentSubStep = 0;
                } else if (currentStep === 4) {
                    // Going to Retouch
                    transitionToScene(0);
                } else if (currentStep === 5) {
                    // Going to Change Color
                    transitionToScene(4);
                } else if (currentStep === 6) {
                    // Going to Ecommerce
                    transitionToScene(0);
                } else if (currentStep === 7) {
                    // Going to Image to Video
                    transitionToScene(0);
                }

                updateUI();
                updateMobileNav();
                updateMobileStepContent();
            });
        }
    });
}

// Initialize mobile navigation
renderMobileStepDots();
updateMobileNav();

// Add mobile nav update to the existing updateUI override chain
// The originalUpdateUI is already defined earlier in the code
// We just need to call updateMobileNav after UI updates

// Watch for resize to toggle mobile behavior
window.addEventListener('resize', () => {
    updateMobileNav();
    renderMobilePoseGrid();
    updateMobileCustomizeTabs();
    updateTextScale(); // Update text size on resize
    updateMobileStepContent(); // Update mobile step visibility
});

// --- Mobile Step 0: AI Model Animated Text ---
const mobileAnimatedText = document.getElementById('mobile-animated-text');
const mobileStep0 = document.getElementById('mobile-step-0');

// Text rotation for mobile Step 0 - SEO optimized value propositions
const mobileTexts = [
    'No Photographer Needed',
    'Skip the Studio Costs',
    'No Model Expenses',
    'Dress AI Models Instantly',
    'Professional Photos in Seconds'
];
let mobileTextIndex = 0;

function rotateMobileText() {
    if (!mobileAnimatedText || !isMobile()) return;

    const textLine = mobileAnimatedText.querySelector('.mobile-text-line');
    if (textLine) {
        textLine.style.opacity = '0';
        textLine.style.transform = 'translateY(10px)';

        setTimeout(() => {
            mobileTextIndex = (mobileTextIndex + 1) % mobileTexts.length;
            textLine.textContent = mobileTexts[mobileTextIndex];
            textLine.style.opacity = '1';
            textLine.style.transform = 'translateY(0)';
        }, 300);
    }
}

// Rotate text every 3 seconds
setInterval(rotateMobileText, 3000);

// Update mobile step content visibility based on current step
let mobileStep1VideoIndex = 0;
const mobileStep1Videos = [
    '/assets/mobile-videos/scene-1.mp4',
    '/assets/mobile-videos/scene-2.mp4',
    '/assets/mobile-videos/scene-3.mp4'
];

function updateMobileStepContent() {
    if (!isMobile()) return;

    const mobileStep1 = document.getElementById('mobile-step-1');
    const mobileBgVideo = document.getElementById('mobile-bg-video');

    // Hide/show mobile step 0 content based on current step
    if (mobileStep0) {
        if (currentStep === 0) {
            mobileStep0.style.display = 'flex';
        } else {
            mobileStep0.style.display = 'none';
        }
    }

    // Hide/show mobile step 1 content based on current step
    if (mobileStep1) {
        if (currentStep === 1) {
            mobileStep1.style.display = 'flex';
            // Start playing the video
            if (mobileBgVideo) {
                mobileBgVideo.play().catch(e => console.log('Mobile bg video play blocked:', e));
            }
        } else {
            mobileStep1.style.display = 'none';
            if (mobileBgVideo) {
                mobileBgVideo.pause();
            }
            // Reset video index when leaving Step 1
            mobileStep1VideoIndex = 0;
            if (mobileBgVideo) {
                mobileBgVideo.src = mobileStep1Videos[0];
            }
        }
    }

    // Step 2: Pose carousel init and auto-slide
    if (currentStep === 2 && isMobile()) {
        // Initialize carousel if not already done
        if (typeof initMobilePoseCarousel === 'function') {
            initMobilePoseCarousel();
        }
        // Reset to first pose
        if (typeof resetMobilePoseCarousel === 'function') {
            resetMobilePoseCarousel();
        }
        // Start auto-slide
        if (typeof startPoseAutoSlide === 'function') {
            startPoseAutoSlide();
        }
    } else {
        if (typeof stopPoseAutoSlide === 'function') {
            stopPoseAutoSlide();
        }
    }

    // Step 3: Customize Model - Update info based on currentSubStep
    if (currentStep === 3 && isMobile()) {
        updateMobileCustomizeInfo();
    }
}

// Mobile Customize Info Update
function updateMobileCustomizeInfo() {
    const smallText = document.getElementById('mobile-customize-small');
    const titleText = document.getElementById('mobile-customize-title');
    const substepTitle = document.getElementById('mobile-customize-substep-title');
    const indicators = document.querySelectorAll('.customize-indicator');
    const mobileColorPaletteGrid = document.getElementById('mobile-color-palette-grid');
    const mobileCustomizeColors = document.querySelector('.mobile-customize-colors');

    if (!smallText || !titleText) return;

    const step = subSteps[currentSubStep];
    if (step) {
        smallText.textContent = step.label;
        titleText.textContent = step.description;

        // Update top right title
        if (substepTitle) {
            substepTitle.textContent = step.label;
        }

        // Update indicators
        indicators.forEach((indicator, index) => {
            if (index === currentSubStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });

        // Toggle backgrounds and images for different substeps on mobile
        if (isMobile()) {
            const mobileSkinToneGrid = document.getElementById('mobile-skin-tone-grid');
            const mobileEthnicityGrid = document.getElementById('mobile-ethnicity-grid');
            const mobileCustomizeModel = document.getElementById('mobile-customize-model');
            const mobileSkinToneImage = document.getElementById('mobile-skin-tone-image');
            const mobileEthnicityImage = document.getElementById('mobile-ethnicity-image');
            const mobileHairstyleVideoContainer = document.getElementById('mobile-hairstyle-video-container');
            const mobileHairstyleVideo = document.getElementById('mobile-hairstyle-video');

            const mobileMoodGrid = document.getElementById('mobile-mood-grid');
            const mobileMoodImage = document.getElementById('mobile-mood-image');
            const mobileHairColorSlideshow = document.getElementById('mobile-hair-color-slideshow');

            if (currentSubStep === 0) {
                // Hair Color - show animated color palette and slideshow (hide center image)
                if (mobileColorPaletteGrid) {
                    mobileColorPaletteGrid.classList.add('active');
                    generateMobileColorPalette();
                }
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.add('active');
                startMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.remove('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.pause();
                if (mobileSkinToneGrid) mobileSkinToneGrid.classList.remove('active');
                if (mobileEthnicityGrid) mobileEthnicityGrid.classList.remove('active');
                if (mobileMoodGrid) mobileMoodGrid.classList.remove('active');
                if (mobileCustomizeColors) mobileCustomizeColors.classList.add('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'none';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.remove('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.remove('active');
                if (mobileMoodImage) mobileMoodImage.classList.remove('active');
                stopMobileSkinToneRotation();
                stopMobileEthnicityRotation();
                stopMobileEthnicityFlagRain();
                stopMobileMoodRotation();
                stopMoodEmojiRain();
            } else if (currentSubStep === 1) {
                // Hair Style - show video background with blur overlay
                if (mobileColorPaletteGrid) mobileColorPaletteGrid.classList.remove('active');
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.remove('active');
                stopMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.add('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.play().catch(() => {});
                if (mobileSkinToneGrid) mobileSkinToneGrid.classList.remove('active');
                if (mobileEthnicityGrid) mobileEthnicityGrid.classList.remove('active');
                if (mobileMoodGrid) mobileMoodGrid.classList.remove('active');
                if (mobileCustomizeColors) mobileCustomizeColors.classList.add('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'block';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.remove('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.remove('active');
                if (mobileMoodImage) mobileMoodImage.classList.remove('active');
                stopMobileSkinToneRotation();
                stopMobileEthnicityRotation();
                stopMobileEthnicityFlagRain();
                stopMobileMoodRotation();
                stopMoodEmojiRain();
            } else if (currentSubStep === 2) {
                // Skin Tone - show skin tone palette and rotating images
                if (mobileColorPaletteGrid) mobileColorPaletteGrid.classList.remove('active');
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.remove('active');
                stopMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.remove('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.pause();
                if (mobileSkinToneGrid) {
                    mobileSkinToneGrid.classList.add('active');
                    generateMobileSkinTonePalette();
                }
                if (mobileEthnicityGrid) mobileEthnicityGrid.classList.remove('active');
                if (mobileMoodGrid) mobileMoodGrid.classList.remove('active');
                if (mobileCustomizeColors) mobileCustomizeColors.classList.add('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'none';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.add('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.remove('active');
                if (mobileMoodImage) mobileMoodImage.classList.remove('active');
                startMobileSkinToneRotation();
                stopMobileEthnicityRotation();
                stopMobileEthnicityFlagRain();
                stopMobileMoodRotation();
                stopMoodEmojiRain();
            } else if (currentSubStep === 3) {
                // Ethnicity - show ethnicity palette and rotating images
                if (mobileColorPaletteGrid) mobileColorPaletteGrid.classList.remove('active');
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.remove('active');
                stopMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.remove('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.pause();
                if (mobileSkinToneGrid) mobileSkinToneGrid.classList.remove('active');
                if (mobileEthnicityGrid) {
                    mobileEthnicityGrid.classList.add('active');
                    generateMobileEthnicityPalette();
                }
                if (mobileMoodGrid) mobileMoodGrid.classList.remove('active');
                if (mobileCustomizeColors) mobileCustomizeColors.classList.add('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'none';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.remove('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.add('active');
                if (mobileMoodImage) mobileMoodImage.classList.remove('active');
                stopMobileSkinToneRotation();
                startMobileEthnicityRotation();
                startMobileEthnicityFlagRain();
                stopMobileMoodRotation();
                stopMoodEmojiRain();
            } else if (currentSubStep === 4) {
                // Mood - show white palette, emoji rain and rotating mood images
                if (mobileColorPaletteGrid) mobileColorPaletteGrid.classList.remove('active');
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.remove('active');
                stopMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.remove('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.pause();
                if (mobileSkinToneGrid) mobileSkinToneGrid.classList.remove('active');
                if (mobileEthnicityGrid) mobileEthnicityGrid.classList.remove('active');
                if (mobileMoodGrid) {
                    mobileMoodGrid.classList.add('active');
                    generateMobileMoodPalette();
                }
                if (mobileCustomizeColors) mobileCustomizeColors.classList.add('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'none';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.remove('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.remove('active');
                if (mobileMoodImage) mobileMoodImage.classList.add('active');
                stopMobileSkinToneRotation();
                stopMobileEthnicityRotation();
                stopMobileEthnicityFlagRain();
                startMobileMoodRotation();
                startMoodEmojiRain();
            } else {
                // Other substeps (Body Shape) - show static color boxes and default model
                if (mobileColorPaletteGrid) mobileColorPaletteGrid.classList.remove('active');
                if (mobileHairColorSlideshow) mobileHairColorSlideshow.classList.remove('active');
                stopMobileHairColorSlideshow();
                if (mobileHairstyleVideoContainer) mobileHairstyleVideoContainer.classList.remove('active');
                if (mobileHairstyleVideo) mobileHairstyleVideo.pause();
                if (mobileSkinToneGrid) mobileSkinToneGrid.classList.remove('active');
                if (mobileEthnicityGrid) mobileEthnicityGrid.classList.remove('active');
                if (mobileMoodGrid) mobileMoodGrid.classList.remove('active');
                if (mobileCustomizeColors) mobileCustomizeColors.classList.remove('hidden');
                if (mobileCustomizeModel) mobileCustomizeModel.style.display = 'block';
                if (mobileSkinToneImage) mobileSkinToneImage.classList.remove('active');
                if (mobileEthnicityImage) mobileEthnicityImage.classList.remove('active');
                if (mobileMoodImage) mobileMoodImage.classList.remove('active');
                stopMobileSkinToneRotation();
                stopMobileEthnicityRotation();
                stopMobileEthnicityFlagRain();
                stopMobileMoodRotation();
                stopMoodEmojiRain();
            }
        }
    }
}

// Generate Mobile Color Palette with animation
let mobileColorAnimationId = null;
function generateMobileColorPalette() {
    const grid = document.getElementById('mobile-color-palette-grid');
    if (!grid || grid.children.length > 0) return;

    const cells = [];
    // 10 columns x 15 rows = 150 cells
    for (let i = 0; i < 150; i++) {
        const cell = document.createElement('div');
        cell.className = 'mobile-color-cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
        cells.push(cell);
    }

    // Animate colors continuously
    let time = 0;
    function animateMobileColors() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;

            // Create wave effect with time
            const hue = (index * 2.4 + time * 60 + Math.sin(row * 0.4 + time * 2.5) * 40 + Math.cos(col * 0.4 + time * 2) * 40) % 360;
            const saturation = 55 + Math.sin(time * 1.8 + index * 0.03) * 15;
            const lightness = 70 + Math.cos(time * 2.2 + index * 0.04) * 12;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        mobileColorAnimationId = requestAnimationFrame(animateMobileColors);
    }
    animateMobileColors();
}

// Generate Mobile Skin Tone Palette with animation
let mobileSkinToneAnimationId = null;
function generateMobileSkinTonePalette() {
    const grid = document.getElementById('mobile-skin-tone-grid');
    if (!grid || grid.children.length > 0) return;

    const cells = [];
    // 10 columns x 15 rows = 150 cells
    for (let i = 0; i < 150; i++) {
        const cell = document.createElement('div');
        cell.className = 'mobile-skin-cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
        cells.push(cell);
    }

    // Animate skin tones continuously - same dynamic wave style as Hair Color
    let time = 0;
    function animateMobileSkinTones() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;

            // Create wave effect with time - same style as Hair Color but with skin tone hues (5-40)
            // Skin tone hues range from ~5 (reddish brown) to ~40 (yellowish beige)
            const baseHue = 22; // Center of skin tone range
            const hue = baseHue + (Math.sin(row * 0.4 + time * 2.5) * 15 + Math.cos(col * 0.4 + time * 2) * 10);

            // Saturation varies based on row (darker = more saturated)
            const baseSat = 35 + (row / 15) * 35; // 35-70%
            const saturation = baseSat + Math.sin(time * 1.8 + index * 0.03) * 15;

            // Lightness creates the gradient from light to dark skin tones
            const baseLight = 85 - (row / 15) * 60; // 85% (light) to 25% (dark)
            const lightness = baseLight + Math.cos(time * 2.2 + index * 0.04) * 8;

            cell.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        });
        mobileSkinToneAnimationId = requestAnimationFrame(animateMobileSkinTones);
    }
    animateMobileSkinTones();
}

// Mobile Skin Tone Image Rotation
const mobileSkinToneImagePaths = [
    '/assets/skin_tone_1_mobile.png',
    '/assets/skin_tone_2_mobile.png',
    '/assets/skin_tone_3_mobile.png',
    '/assets/skin_tone_4_mobile.png',
    '/assets/skin_tone_5_mobile.png'
];
let mobileSkinToneIndex = 0;
let mobileSkinToneInterval = null;

function startMobileSkinToneRotation() {
    if (mobileSkinToneInterval) return;

    const skinToneImage = document.getElementById('mobile-skin-tone-image');
    if (!skinToneImage) return;

    mobileSkinToneIndex = 0;
    skinToneImage.src = mobileSkinToneImagePaths[0];

    // Change image every 2.5 seconds with fade
    mobileSkinToneInterval = setInterval(() => {
        mobileSkinToneIndex = (mobileSkinToneIndex + 1) % mobileSkinToneImagePaths.length;

        // Fade out
        skinToneImage.style.opacity = '0';

        setTimeout(() => {
            skinToneImage.src = mobileSkinToneImagePaths[mobileSkinToneIndex];
            // Fade in
            skinToneImage.style.opacity = '1';
        }, 300);
    }, 2500);
}

function stopMobileSkinToneRotation() {
    if (mobileSkinToneInterval) {
        clearInterval(mobileSkinToneInterval);
        mobileSkinToneInterval = null;
    }
}

// Generate Mobile Ethnicity Palette with animation
let mobileEthnicityAnimationId = null;
function generateMobileEthnicityPalette() {
    const grid = document.getElementById('mobile-ethnicity-grid');
    if (!grid || grid.children.length > 0) return;

    const cells = [];
    // 10 columns x 15 rows = 150 cells
    for (let i = 0; i < 150; i++) {
        const cell = document.createElement('div');
        cell.className = 'mobile-ethnicity-cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
        cells.push(cell);
    }

    // Ethnicity color palette - white and cream tones (off-white, ivory, beige)
    // Neutral background to highlight the model images
    let time = 0;
    function animateMobileEthnicity() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;

            // White and cream tones - very low saturation, high lightness
            // Hue range: 30-50 (warm whites/creams) to 0-20 (cool whites)
            const baseHue = 40 + (Math.sin(row * 0.4 + time * 2.5) * 15 + Math.cos(col * 0.4 + time * 2) * 10);

            // Very low saturation for white tones (2-12%)
            const baseSat = 5;
            const saturation = baseSat + Math.sin(time * 1.8 + index * 0.03) * 5;

            // High lightness for white/cream effect (88-98%)
            const baseLight = 93 + (Math.sin(row * 0.3 + time) * 3);
            const lightness = baseLight + Math.cos(time * 2.2 + index * 0.04) * 3;

            cell.style.backgroundColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        });
        mobileEthnicityAnimationId = requestAnimationFrame(animateMobileEthnicity);
    }
    animateMobileEthnicity();
}

// Mobile Ethnicity Image Rotation
const mobileEthnicityImagePaths = [
    '/assets/center_image_2_asian_mobile.png',
    '/assets/center_image_2_african_mobile.png',
    '/assets/center_image_2_latine_mobile.png',
    '/assets/center_image_2_arabian_mobile.png',
    '/assets/center_image_2_indian_mobile.png'
];

const mobileEthnicityNames = ['Asian', 'African', 'Latin', 'Arabian', 'Indian'];

let mobileEthnicityIndex = 0;
let mobileEthnicityInterval = null;

function startMobileEthnicityRotation() {
    if (mobileEthnicityInterval) return;

    const ethnicityImage = document.getElementById('mobile-ethnicity-image');
    const ethnicityTitle = document.getElementById('mobile-ethnicity-title');
    if (!ethnicityImage) return;

    mobileEthnicityIndex = 0;
    ethnicityImage.src = mobileEthnicityImagePaths[0];
    if (ethnicityTitle) {
        ethnicityTitle.textContent = mobileEthnicityNames[0];
        ethnicityTitle.classList.add('active');
    }

    mobileEthnicityInterval = setInterval(() => {
        ethnicityImage.style.opacity = '0';
        if (ethnicityTitle) ethnicityTitle.style.opacity = '0';

        setTimeout(() => {
            mobileEthnicityIndex = (mobileEthnicityIndex + 1) % mobileEthnicityImagePaths.length;
            ethnicityImage.src = mobileEthnicityImagePaths[mobileEthnicityIndex];
            ethnicityImage.style.opacity = '1';
            if (ethnicityTitle) {
                ethnicityTitle.textContent = mobileEthnicityNames[mobileEthnicityIndex];
                ethnicityTitle.style.opacity = '1';
            }
        }, 300);
    }, 2500);
}

function stopMobileEthnicityRotation() {
    if (mobileEthnicityInterval) {
        clearInterval(mobileEthnicityInterval);
        mobileEthnicityInterval = null;
    }
    if (mobileEthnicityAnimationId) {
        cancelAnimationFrame(mobileEthnicityAnimationId);
        mobileEthnicityAnimationId = null;
    }
    // Hide ethnicity title when stopping
    const ethnicityTitle = document.getElementById('mobile-ethnicity-title');
    if (ethnicityTitle) {
        ethnicityTitle.classList.remove('active');
    }
}

// Mobile Mood Image Rotation
const mobileMoodImagePaths = [
    '/assets/mood-1-Photoroom.png',
    '/assets/mood-2-Photoroom.png',
    '/assets/mood-3-Photoroom.png'
];

const mobileMoodNames = ['Happy', 'Confident', 'Serious'];

let mobileMoodIndex = 0;
let mobileMoodImageInterval = null;

function startMobileMoodRotation() {
    if (mobileMoodImageInterval) return;

    const moodImage = document.getElementById('mobile-mood-image');
    const moodTitle = document.getElementById('mobile-mood-title');
    if (!moodImage) return;

    mobileMoodIndex = 0;
    moodImage.src = mobileMoodImagePaths[0];
    moodImage.classList.add('active');
    if (moodTitle) {
        moodTitle.textContent = mobileMoodNames[0];
        moodTitle.classList.add('active');
    }

    mobileMoodImageInterval = setInterval(() => {
        moodImage.style.opacity = '0';
        if (moodTitle) moodTitle.style.opacity = '0';

        setTimeout(() => {
            mobileMoodIndex = (mobileMoodIndex + 1) % mobileMoodImagePaths.length;
            moodImage.src = mobileMoodImagePaths[mobileMoodIndex];
            moodImage.style.opacity = '1';
            if (moodTitle) {
                moodTitle.textContent = mobileMoodNames[mobileMoodIndex];
                moodTitle.style.opacity = '1';
            }
        }, 300);
    }, 2500);
}

function stopMobileMoodRotation() {
    if (mobileMoodImageInterval) {
        clearInterval(mobileMoodImageInterval);
        mobileMoodImageInterval = null;
    }
    // Hide mood title and image when stopping
    const moodTitle = document.getElementById('mobile-mood-title');
    const moodImage = document.getElementById('mobile-mood-image');
    if (moodTitle) {
        moodTitle.classList.remove('active');
    }
    if (moodImage) {
        moodImage.classList.remove('active');
    }
}

// Generate Mobile Mood Palette with white animation (like ethnicity)
let mobileMoodAnimationId = null;
let mobileMoodEmojiInterval = null;

function generateMobileMoodPalette() {
    const grid = document.getElementById('mobile-mood-grid');
    if (!grid || grid.children.length > 0) return;

    const cells = [];
    // 10 columns x 15 rows = 150 cells
    for (let i = 0; i < 150; i++) {
        const cell = document.createElement('div');
        cell.className = 'mobile-mood-cell';
        cell.dataset.index = i;
        grid.appendChild(cell);
        cells.push(cell);
    }

    // White and cream tones - same as ethnicity
    let time = 0;
    function animateMobileMood() {
        time += 0.008;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 10);
            const col = index % 10;

            // White and cream tones - very low saturation, high lightness
            const baseHue = 40 + (Math.sin(row * 0.4 + time * 2.5) * 15 + Math.cos(col * 0.4 + time * 2) * 10);
            const baseSat = 5;
            const saturation = baseSat + Math.sin(time * 1.8 + index * 0.03) * 5;
            const baseLight = 93 + (Math.sin(row * 0.3 + time) * 3);
            const lightness = baseLight + Math.cos(time * 2.2 + index * 0.04) * 3;

            cell.style.backgroundColor = `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
        });
        mobileMoodAnimationId = requestAnimationFrame(animateMobileMood);
    }
    animateMobileMood();
}

// Mood Emojis for falling effect
const moodEmojis = ['😊', '😄', '😎', '🥰', '😍', '🤗', '😌', '🙂', '😇', '🤩', '😁', '😋', '🥳', '😏', '🤔', '😴', '😢', '😤', '😠', '🥺'];

function startMoodEmojiRain() {
    const container = document.getElementById('mobile-mood-emoji-rain');
    if (!container) return;

    container.classList.add('active');

    // Create initial batch of emojis
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createMoodEmoji(container), i * 200);
    }

    // Continue creating emojis
    mobileMoodEmojiInterval = setInterval(() => {
        createMoodEmoji(container);
    }, 400);
}

function createMoodEmoji(container) {
    const emoji = document.createElement('div');
    emoji.className = 'mood-emoji';
    emoji.textContent = moodEmojis[Math.floor(Math.random() * moodEmojis.length)];

    // Random position and size
    const left = Math.random() * 100;
    const size = 16 + Math.random() * 32; // 16px to 48px
    const duration = 4 + Math.random() * 4; // 4-8 seconds
    const delay = Math.random() * 0.5;

    emoji.style.left = `${left}%`;
    emoji.style.fontSize = `${size}px`;
    emoji.style.animationDuration = `${duration}s`;
    emoji.style.animationDelay = `${delay}s`;
    emoji.style.opacity = 0.4 + Math.random() * 0.4; // 0.4-0.8

    container.appendChild(emoji);

    // Remove after animation completes
    setTimeout(() => {
        if (emoji.parentNode) {
            emoji.parentNode.removeChild(emoji);
        }
    }, (duration + delay) * 1000 + 500);
}

function stopMoodEmojiRain() {
    const container = document.getElementById('mobile-mood-emoji-rain');
    if (container) {
        container.classList.remove('active');
        container.innerHTML = '';
    }

    if (mobileMoodEmojiInterval) {
        clearInterval(mobileMoodEmojiInterval);
        mobileMoodEmojiInterval = null;
    }

    if (mobileMoodAnimationId) {
        cancelAnimationFrame(mobileMoodAnimationId);
        mobileMoodAnimationId = null;
    }
}

// Mobile Ethnicity Flag Rain
let mobileEthnicityFlagInterval = null;

// Flags for each ethnicity - indexed by mobileEthnicityIndex
const mobileEthnicityFlags = [
    ['🇯🇵', '🇨🇳', '🇰🇷', '🇹🇭', '🇻🇳', '🇮🇩', '🇲🇾', '🇵🇭'],  // Asian
    ['🇳🇬', '🇰🇪', '🇪🇹', '🇬🇭', '🇿🇦', '🇹🇿', '🇺🇬', '🇸🇳'],  // African
    ['🇧🇷', '🇲🇽', '🇦🇷', '🇨🇴', '🇨🇱', '🇵🇪', '🇻🇪', '🇨🇺'],  // Latin
    ['🇸🇦', '🇦🇪', '🇪🇬', '🇯🇴', '🇱🇧', '🇲🇦', '🇶🇦', '🇰🇼'],  // Arabian
    ['🇮🇳', '🇵🇰', '🇧🇩', '🇱🇰', '🇳🇵', '🇧🇹', '🇲🇻', '🇲🇲']   // Indian
];

function startMobileEthnicityFlagRain() {
    const container = document.getElementById('mobile-ethnicity-flag-rain');
    if (!container) return;

    container.classList.add('active');

    // Create initial batch of flags
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createMobileEthnicityFlag(container), i * 200);
    }

    // Continue creating flags
    mobileEthnicityFlagInterval = setInterval(() => {
        createMobileEthnicityFlag(container);
    }, 400);
}

function createMobileEthnicityFlag(container) {
    const flag = document.createElement('div');
    flag.className = 'ethnicity-flag';

    // Get flags based on current ethnicity index
    const currentFlags = mobileEthnicityFlags[mobileEthnicityIndex] || mobileEthnicityFlags[0];
    flag.textContent = currentFlags[Math.floor(Math.random() * currentFlags.length)];

    // Random position and size
    const left = Math.random() * 100;
    const size = 16 + Math.random() * 32; // 16px to 48px
    const duration = 4 + Math.random() * 4; // 4-8 seconds
    const delay = Math.random() * 0.5;

    flag.style.left = `${left}%`;
    flag.style.fontSize = `${size}px`;
    flag.style.animationDuration = `${duration}s`;
    flag.style.animationDelay = `${delay}s`;
    flag.style.opacity = 0.4 + Math.random() * 0.4; // 0.4-0.8

    container.appendChild(flag);

    // Remove after animation completes
    setTimeout(() => {
        if (flag.parentNode) {
            flag.parentNode.removeChild(flag);
        }
    }, (duration + delay) * 1000 + 500);
}

function stopMobileEthnicityFlagRain() {
    const container = document.getElementById('mobile-ethnicity-flag-rain');
    if (container) {
        container.classList.remove('active');
        container.innerHTML = '';
    }

    if (mobileEthnicityFlagInterval) {
        clearInterval(mobileEthnicityFlagInterval);
        mobileEthnicityFlagInterval = null;
    }
}

// Initialize Customize Indicators click handlers
function initCustomizeIndicators() {
    const indicators = document.querySelectorAll('.customize-indicator');
    indicators.forEach((indicator) => {
        indicator.addEventListener('click', () => {
            const substep = parseInt(indicator.dataset.substep);
            if (!isNaN(substep) && substep >= 0 && substep < subSteps.length) {
                currentSubStep = substep;
                updateMobileCustomizeInfo();
            }
        });
    });
}

// Change to next video on mobile Step 1 when next button is pressed
// Mobile Step 1 scene data
const mobileSceneData = [
    {
        title: 'Rustic Wooden Barn',
        desc: 'Showcase your clothing in authentic rustic settings. Perfect for casual wear and vintage styles.'
    },
    {
        title: 'Cozy Mountain Lodge',
        desc: 'Display your products in a warm mountain cabin atmosphere. Ideal for winter collections and knitwear.'
    },
    {
        title: 'Bali Rice Terraces',
        desc: 'Present your fashion against stunning tropical backgrounds. Perfect for summer and resort wear.'
    }
];

// Update mobile scene overlay UI
function updateMobileSceneOverlay() {
    const thumbs = document.querySelectorAll('.mobile-scene-thumb');
    const title = document.getElementById('mobile-scene-title');
    const desc = document.getElementById('mobile-scene-desc');

    if (!thumbs.length || !title || !desc) return;

    // Update active thumb
    thumbs.forEach((thumb, index) => {
        if (index === mobileStep1VideoIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });

    // Update text with animation
    title.style.opacity = '0';
    desc.style.opacity = '0';

    setTimeout(() => {
        title.textContent = mobileSceneData[mobileStep1VideoIndex].title;
        desc.textContent = mobileSceneData[mobileStep1VideoIndex].desc;
        title.style.opacity = '1';
        desc.style.opacity = '1';
    }, 150);
}

// Mobile scene thumb click handlers
function initMobileSceneThumbs() {
    const thumbs = document.querySelectorAll('.mobile-scene-thumb');
    const mobileBgVideo = document.getElementById('mobile-bg-video');

    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            if (mobileStep1VideoIndex === index) return;

            mobileStep1VideoIndex = index;
            if (mobileBgVideo) {
                mobileBgVideo.src = mobileStep1Videos[mobileStep1VideoIndex];
                mobileBgVideo.load();
                mobileBgVideo.play().catch(e => console.log('Mobile bg video play blocked:', e));
            }
            updateMobileSceneOverlay();
        });
    });
}

// Initialize mobile scene thumbs
initMobileSceneThumbs();

// --- Mobile Retouch Slider ---
function initMobileRetouchSlider() {
    const handle = document.getElementById('retouch-slider-handle');
    const beforeClip = document.getElementById('retouch-before-clip');
    const container = document.querySelector('.retouch-comparison-wrapper');

    if (!handle || !beforeClip || !container) return;

    let isDragging = false;

    function updateSliderPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        let percent = (x / rect.width) * 100;

        // Clamp between 5% and 95%
        percent = Math.max(5, Math.min(95, percent));

        // Update handle position
        handle.style.left = percent + '%';

        // Update before clip using clip-path (prevents image scaling)
        const rightClip = 100 - percent;
        beforeClip.style.clipPath = `inset(0 ${rightClip}% 0 0)`;
    }

    // Mouse events
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSliderPosition(e.clientX);
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch events
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateSliderPosition(e.touches[0].clientX);
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Click on container to move slider
    container.addEventListener('click', (e) => {
        updateSliderPosition(e.clientX);
    });
}

// Initialize retouch slider when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileRetouchSlider);
} else {
    initMobileRetouchSlider();
}

// --- Mobile Retouch Thumbnail Selector ---
const retouchProductData = [
    { before: '/assets/amateur-products-2/amateur-before-0.png', after: '/assets/results-products-2/amateur-after-0.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-1.png', after: '/assets/results-products-2/amateur-after-1.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-2.png', after: '/assets/results-products-2/amateur-after-2.JPG' },
    { before: '/assets/amateur-products-2/amateur-before-3.png', after: '/assets/results-products-2/amateur-after-3.JPG' }
];

function initRetouchThumbnails() {
    const thumbnails = document.querySelectorAll('.retouch-thumb');
    const beforeImg = document.getElementById('retouch-before-mobile');
    const afterImg = document.getElementById('retouch-after-mobile');
    const beforeClip = document.getElementById('retouch-before-clip');
    const handle = document.getElementById('retouch-slider-handle');

    if (!thumbnails.length || !beforeImg || !afterImg) return;

    thumbnails.forEach((thumb) => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index);
            if (isNaN(index) || index < 0 || index >= retouchProductData.length) return;

            // Update active state
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            // Update images with fade effect
            beforeImg.style.opacity = '0';
            afterImg.style.opacity = '0';

            setTimeout(() => {
                beforeImg.src = retouchProductData[index].before;
                afterImg.src = retouchProductData[index].after;

                // Reset slider position to 50%
                if (beforeClip) beforeClip.style.clipPath = 'inset(0 50% 0 0)';
                if (handle) handle.style.left = '50%';

                beforeImg.style.opacity = '1';
                afterImg.style.opacity = '1';
            }, 200);
        });
    });
}

// Initialize thumbnail selector
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRetouchThumbnails);
} else {
    initRetouchThumbnails();
}

function mobileStep1NextVideo() {
    if (!isMobile() || currentStep !== 1) return false;

    const mobileBgVideo = document.getElementById('mobile-bg-video');
    if (!mobileBgVideo) return false;

    // If we haven't shown all 3 videos yet, show next video
    if (mobileStep1VideoIndex < 2) {
        mobileStep1VideoIndex++;
        mobileBgVideo.src = mobileStep1Videos[mobileStep1VideoIndex];
        mobileBgVideo.load();
        mobileBgVideo.play().catch(e => console.log('Mobile bg video play blocked:', e));
        updateMobileSceneOverlay();
        return true; // Video changed, don't advance step
    }

    return false; // All videos shown, allow step advance
}

// --- Mobile Pose Carousel ---
let currentMobilePose = 0;
let poseAutoSlideInterval = null;

// Use the same pose images as canvas (from assets/poses folder)
const mobilePoseImages = [
    '/assets/poses/pose-1-Photoroom.png',
    '/assets/poses/pose-2-Photoroom.png',
    '/assets/poses/pose-3-Photoroom.png',
    '/assets/poses/pose-4-Photoroom.png',
    '/assets/poses/pose-5-Photoroom.png',
    '/assets/poses/pose-6-Photoroom.png',
    '/assets/poses/pose-7-Photoroom.png',
    '/assets/poses/pose-8-Photoroom.png',
    '/assets/poses/pose-9-Photoroom.png'
];

function initMobilePoseCarousel() {
    // Re-query elements to ensure they exist
    const track = document.getElementById('pose-carousel-track');
    const indicators = document.getElementById('pose-indicators');

    // Always create slides (CSS controls visibility)
    if (!track) {
        console.log('Pose carousel track not found');
        return;
    }

    // Only create slides if not already created
    if (track.children.length === 0) {
        // Create slides
        track.innerHTML = poseData.map((pose, i) => `
            <div class="pose-carousel-slide" data-pose="${i}">
                <img src="${mobilePoseImages[i]}" alt="${pose.big}">
            </div>
        `).join('');
        console.log('Pose carousel slides created:', track.children.length);
    }

    // Create indicators
    if (indicators) {
        indicators.innerHTML = poseData.map((_, i) => `
            <div class="pose-indicator ${i === 0 ? 'active' : ''}" data-pose="${i}"></div>
        `).join('');

        // Indicator click handlers
        indicators.querySelectorAll('.pose-indicator').forEach(indicator => {
            indicator.addEventListener('click', () => {
                const poseIndex = parseInt(indicator.dataset.pose);
                goToMobilePose(poseIndex);
            });
        });
    }

    // Update initial pose info
    updateMobilePoseInfo();
}

function goToMobilePose(index) {
    if (index < 0 || index >= poseData.length) return;

    currentMobilePose = index;

    // Re-query track element
    const track = document.getElementById('pose-carousel-track');
    // Animate carousel track
    if (track) {
        track.style.transform = `translateX(-${index * 100}vw)`;
    }

    // Update indicators
    updateMobilePoseIndicators();

    // Update pose info with animation
    updateMobilePoseInfo();
}

function updateMobilePoseIndicators() {
    const indicatorsContainer = document.getElementById('pose-indicators');
    if (!indicatorsContainer) return;

    const indicators = indicatorsContainer.querySelectorAll('.pose-indicator');
    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentMobilePose);
    });
}

function updateMobilePoseInfo() {
    const infoSmall = document.getElementById('pose-info-small');
    const infoBig = document.getElementById('pose-info-big');

    if (!infoSmall || !infoBig) return;

    // Fade out
    infoSmall.style.opacity = '0';
    infoBig.style.opacity = '0';

    setTimeout(() => {
        infoSmall.textContent = poseData[currentMobilePose].small;
        infoBig.textContent = poseData[currentMobilePose].big;

        // Fade in
        infoSmall.style.opacity = '1';
        infoBig.style.opacity = '1';
    }, 150);
}

// Next pose function for navigation button
function mobileNextPose() {
    if (!isMobile() || currentStep !== 2) return false;

    if (currentMobilePose < poseData.length - 1) {
        goToMobilePose(currentMobilePose + 1);
        return true; // Pose changed, don't advance step
    }

    return false; // All poses shown, allow step advance
}

// Reset pose carousel when entering Step 2
function resetMobilePoseCarousel() {
    currentMobilePose = 0;
    const track = document.getElementById('pose-carousel-track');
    if (track) {
        track.style.transform = 'translateX(0)';
    }
    updateMobilePoseIndicators();
    updateMobilePoseInfo();
}

// Auto-slide pose carousel
function startPoseAutoSlide() {
    if (poseAutoSlideInterval) return;

    poseAutoSlideInterval = setInterval(() => {
        if (!isMobile() || currentStep !== 2) {
            stopPoseAutoSlide();
            return;
        }

        // Go to next pose, loop back to first
        const nextPose = (currentMobilePose + 1) % poseData.length;
        goToMobilePose(nextPose);
    }, 2000); // Change every 2 seconds
}

function stopPoseAutoSlide() {
    if (poseAutoSlideInterval) {
        clearInterval(poseAutoSlideInterval);
        poseAutoSlideInterval = null;
    }
}

// Initialize carousel after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMobilePoseCarousel();
        initCustomizeIndicators();
    });
} else {
    initMobilePoseCarousel();
    initCustomizeIndicators();
}

// Legacy function name for compatibility
function renderMobilePoseGrid() {
    initMobilePoseCarousel();
    resetMobilePoseCarousel();
    // Start auto-slide when entering Step 2
    if (currentStep === 2 && isMobile()) {
        startPoseAutoSlide();
    }
}

// --- Mobile Customize Tabs ---
const customizeTabsMobile = document.getElementById('customize-tabs-mobile');
const customizeContentMobile = document.getElementById('customize-content-mobile');

function updateMobileCustomizeTabs() {
    if (!customizeTabsMobile || !isMobile()) return;

    // Update active tab
    const tabs = customizeTabsMobile.querySelectorAll('.customize-tab');
    tabs.forEach((tab, index) => {
        tab.classList.toggle('active', index === currentSubStep);
    });

    // Update content
    if (customizeContentMobile && subSteps[currentSubStep]) {
        const step = subSteps[currentSubStep];
        customizeContentMobile.innerHTML = `
            <h3>${step.label}</h3>
            <p>${step.description}</p>
        `;
    }
}

// Tab click handlers
if (customizeTabsMobile) {
    customizeTabsMobile.querySelectorAll('.customize-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentSubStep = parseInt(tab.dataset.substep);
            updateMobileCustomizeTabs();
            updateUI();
        });
    });
}

// --- Mobile Color Picker ---
const colorPickerMobile = document.getElementById('color-picker-mobile');
if (colorPickerMobile) {
    colorPickerMobile.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            colorPickerMobile.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
    });
}

// Initialize mobile elements
if (isMobile()) {
    renderMobilePoseGrid();
    updateMobileCustomizeTabs();
}

// Call updateMobileStepContent on init (after all variables are defined)
updateMobileStepContent();

// ========================================
// Mobile E-commerce Gallery Animation
// ========================================
let mobileEcommerceInterval = null;
let currentEcommerceIndex = 0;

const mobileEcommerceData = [
    { src: '/assets/editorial_1.png', label: 'Editorial Style' },
    { src: '/assets/editorial_2.png', label: 'Editorial Style' },
    { src: '/assets/editorial_3.png', label: 'Editorial Style' },
    { src: '/assets/white_studio_2.png', label: 'Studio Style' },
    { src: '/assets/detail_product.png', label: 'Product Detail' },
    { src: '/assets/ghost_mannequin.png', label: 'Ghost Mannequin' }
];

function initMobileEcommerceGallery() {
    const gallery = document.getElementById('ecommerce-mobile-gallery');
    const thumbsColumn = document.getElementById('ecommerce-thumbs-column');
    const mainImage = document.getElementById('ecommerce-main-img');
    const mainLabel = document.getElementById('ecommerce-main-label');

    if (!gallery || !thumbsColumn || !mainImage || !mainLabel) return;

    const thumbs = thumbsColumn.querySelectorAll('.ecommerce-thumb');

    // Function to switch to specific index
    function switchToIndex(index) {
        currentEcommerceIndex = index;
        const data = mobileEcommerceData[index];

        // Update thumbnails
        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });

        // Animate main image
        mainImage.classList.add('fade-out');

        setTimeout(() => {
            mainImage.src = data.src;
            mainLabel.textContent = data.label;
            mainImage.classList.remove('fade-out');
        }, 300);
    }

    // Add click handlers to thumbnails
    thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            stopMobileEcommerceAutoPlay();
            switchToIndex(index);
            // Resume auto-play after 5 seconds
            setTimeout(() => {
                if (currentStep === 6) startMobileEcommerceAutoPlay();
            }, 5000);
        });
    });

    // Touch/swipe support for main image
    let touchStartX = 0;
    const mainImageContainer = document.getElementById('ecommerce-main-image');
    if (mainImageContainer) {
        mainImageContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        mainImageContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                stopMobileEcommerceAutoPlay();
                if (diff > 0) {
                    // Swipe left - next
                    const nextIndex = (currentEcommerceIndex + 1) % mobileEcommerceData.length;
                    switchToIndex(nextIndex);
                } else {
                    // Swipe right - previous
                    const prevIndex = (currentEcommerceIndex - 1 + mobileEcommerceData.length) % mobileEcommerceData.length;
                    switchToIndex(prevIndex);
                }
                // Resume auto-play after 5 seconds
                setTimeout(() => {
                    if (currentStep === 6) startMobileEcommerceAutoPlay();
                }, 5000);
            }
        }, { passive: true });
    }
}

function startMobileEcommerceAutoPlay() {
    if (mobileEcommerceInterval) return;

    const thumbsColumn = document.getElementById('ecommerce-thumbs-column');
    const mainImage = document.getElementById('ecommerce-main-img');
    const mainLabel = document.getElementById('ecommerce-main-label');

    if (!thumbsColumn || !mainImage || !mainLabel) return;

    const thumbs = thumbsColumn.querySelectorAll('.ecommerce-thumb');

    mobileEcommerceInterval = setInterval(() => {
        currentEcommerceIndex = (currentEcommerceIndex + 1) % mobileEcommerceData.length;
        const data = mobileEcommerceData[currentEcommerceIndex];

        // Update thumbnails
        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === currentEcommerceIndex);
        });

        // Animate main image
        mainImage.classList.add('fade-out');

        setTimeout(() => {
            mainImage.src = data.src;
            mainLabel.textContent = data.label;
            mainImage.classList.remove('fade-out');
        }, 300);
    }, 3000); // Change every 3 seconds
}

function stopMobileEcommerceAutoPlay() {
    if (mobileEcommerceInterval) {
        clearInterval(mobileEcommerceInterval);
        mobileEcommerceInterval = null;
    }
}

// Expose to window for early access
window.stopMobileEcommerceAutoPlay = stopMobileEcommerceAutoPlay;
window.startMobileEcommerceAutoPlay = startMobileEcommerceAutoPlay;

// Initialize on load
if (isMobile()) {
    initMobileEcommerceGallery();
}

