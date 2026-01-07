import './style.css'
import * as THREE from 'three'

// State
let currentScene = 0;
let currentStep = 0;
const scenes = [
    '/assets/center_image_2.png',           // Scene 0 (index 0)
    '/assets/center_image_scene_1.png',     // Scene 1 (index 1)
    '/assets/center_image_scene_2.png',     // Scene 2 (index 2)
    '/assets/center_image_scene_3.png',     // Scene 3 (index 3)
    '/assets/center_image_2.png'            // Scene 4 (index 4) - same as Scene 0
];

// Foreground layers for parallax (Scene 0=Virtual Model, Scene 1=1, Scene 2=2, Scene 3=3)
const foregroundImages = [
    '/assets/virtual_model_front.png',                       // Scene 0 (Virtual Model)
    '/assets/center_image_scene_1_front_people.png',         // Scene 1
    '/assets/center_image_scene_2_front_people.png',         // Scene 2
    '/assets/center_image_scene_3_front_people.png',         // Scene 3
    null                                                     // Scene 4
];
const steps = [
    'Virtual Model', 'Select Scene', 'Change Pose', 'Customize Model', 'Retouch', 'Change Color', 'Ecommerce Kits', 'Image to Video'
];

// Customize Model Sub-steps
const subSteps = [
    { label: 'Hair Color', subtitle: 'Chrome & Pigment', description: 'Doğal tonlardan deneysel pigmentlere kadar uzanan geniş renk yelpazesi ile modelinizin saç rengini kusursuz bir hassasiyetle belirleyin.' },
    { label: 'Hair Style', subtitle: 'Sculpt & Define', description: 'Binlerce premium saç stili arasından markanızın estetiğine en uygun olanı seçin veya yapay zeka ile hayalinizdeki formu oluşturun.' },
    { label: 'Skin Tone', subtitle: 'Natural Radiance', description: 'Küresel kitlelere hitap etmek için modelinizin cilt tonunu en gerçekçi ve kapsayıcı şekilde kişiselleştirin.' },
    { label: 'Ethnicity', subtitle: 'Global Diversity', description: 'Hedef pazarınıza tam uyum sağlamak için modelinizin yüz hatlarını ve etnik kökenini yapay zeka yardımıyla detaylandırın.' },
    { label: 'Mood', subtitle: 'Expressions & Vibes', description: 'Kampanya ruhunuzu yansıtacak en doğru ifadeyi; enerjik, sofistike veya dingin modlar arasından belirleyin.' },
    { label: 'Body Shape', subtitle: 'Silhouette & Form', description: 'Kıyafetlerin formunu en iyi şekilde sergilemek için modelinizin vücut hatlarını ve duruşunu ideal oranlara getirin.' }
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

// Video element for Scene 0 (Virtual Model)
const videoElement0 = document.createElement('video');
videoElement0.src = '/assets/virtual_model_scene.mp4';
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

// Load textures - Scene 0, 1, 2, 3 use video, Scene 4 uses image
const textures = scenes.map((url, index) => {
    if (index === 0) {
        return videoTexture0; // Scene 0 uses Virtual Model video
    } else if (index === 1) {
        return videoTexture1;
    } else if (index === 2) {
        return videoTexture2;
    } else if (index === 3) {
        return videoTexture3;
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
const virtualModelTexts = ['Choose Age', 'Choose Gender', 'Choose Body Shape'];
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

// Header gradient plane (top) - for Scene 0 only, behind foreground
function createHeaderGradientTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
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
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
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
    const screenAspect = artWrapper.clientWidth / artWrapper.clientHeight;
    const imageAspect = image.width / image.height;

    // Zoom in slightly (0.98) to leave room for parallax movement
    const zoom = 0.98;

    if (screenAspect > imageAspect) {
        return new THREE.Vector2(1 * zoom, (imageAspect / screenAspect) * zoom);
    } else {
        return new THREE.Vector2((screenAspect / imageAspect) * zoom, 1 * zoom);
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
    const width = artWrapper.clientWidth;
    const height = artWrapper.clientHeight;
    renderer.setSize(width, height);
    updateAllUVScales();
    updateForegroundUVScale();
    updateTextScale();
});
resizeObserver.observe(artWrapper);

// Handle Resize for Text Plane to prevent distortion
function updateTextScale() {
    if (!textPlane) return;
    const width = artWrapper.clientWidth;
    const height = artWrapper.clientHeight;
    // Prevent division by zero
    if (height === 0) return;

    // Calculate aspect based on artWrapper dimensions
    const aspect = width / height;

    // Maintain 2:1 visual aspect ratio regardless of screen shape
    // ScaleY is base (1.0), ScaleX must be adjusted by aspect to cancel camera stretch
    textPlane.scale.y = 1.0;
    textPlane.scale.x = textPlane.scale.y / aspect;
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
    if (hasForeground && currentStep === 0) {
        foregroundMaterial.opacity = 1;
    } else {
        foregroundMaterial.opacity = 0;
    }

    // Video playback control for Scene 0, 1, 2, and 3
    // Reset and play the active video, pause others
    if (index === 0) {
        videoElement0.currentTime = 0;
        videoElement0.play().catch(e => console.log('Video 0 autoplay blocked:', e));
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
    } else if (index === 1) {
        videoElement1.currentTime = 0;
        videoElement1.play().catch(e => console.log('Video 1 autoplay blocked:', e));
        videoElement0.pause();
        videoElement2.pause();
        videoElement3.pause();
    } else if (index === 2) {
        videoElement2.currentTime = 0;
        videoElement2.play().catch(e => console.log('Video 2 autoplay blocked:', e));
        videoElement0.pause();
        videoElement1.pause();
        videoElement3.pause();
    } else if (index === 3) {
        videoElement3.currentTime = 0;
        videoElement3.play().catch(e => console.log('Video 3 autoplay blocked:', e));
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
    } else {
        videoElement0.pause();
        videoElement1.pause();
        videoElement2.pause();
        videoElement3.pause();
    }

    updateUI();
}

// UI
function updateUI() {
    mainContainer.className = `main-container step-${currentStep} scene-${currentScene} substep-${currentSubStep}`;

    // Control foreground layer visibility for scenes with foreground
    const hasForeground = foregroundImages[currentScene] !== null;
    if (hasForeground && (currentStep === 0 || currentStep === 1)) {
        foregroundMaterial.opacity = 1;
    } else {
        foregroundMaterial.opacity = 0;
    }

    // Toggle Text Plane and Gradient Plane
    if ((currentStep === 0 || currentStep === 1) && currentScene >= 0 && currentScene < 4) {
        // Show in Scenes 0, 1, 2, 3 (not Scene 4)
        textPlane.visible = true;
        textPlane.material.color.setHex(0xffffff);
        textPlane.position.z = 0.05;
        textPlane.renderOrder = 1;

        // Scene 0: Virtual Model - rotating text (Choose Age, Choose Gender, etc.)
        // Scenes 1, 2, 3: DIRESS text
        if (currentScene === 0) {
            gradientPlane.visible = false;
            // Show only header gradient for Scene 0 (behind foreground), hide footer gradient
            headerGradientPlane.visible = true;
            footerGradientPlane.visible = false;
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
    steps.forEach((label, index) => {
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
        item.innerHTML = `<span class="step-dot"></span><span class="step-label">${label}</span>`;
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
            transitionToScene(3);
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
                transitionToScene(1);
            } else if (currentStep === 1 && currentScene < 3) {
                // Through scenes 1->2->3 within Step 1
                transitionToScene(currentScene + 1);
            } else if (currentStep === 1 && currentScene >= 3) {
                // From Scene 3 to Change Pose (Step 2)
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
            if (currentStep === 1 && currentScene === 1) {
                currentStep = 0;
                transitionToScene(0);
            } else if (currentStep === 1 && currentScene > 1) {
                transitionToScene(currentScene - 1);
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
    const promptText = document.getElementById('prompt-text');
    const generateBtn = document.getElementById('generate-btn');
    const spinner = document.getElementById('loading-spinner');
    const content = document.getElementById('ecommerce-content');

    const text = "Generate all essential visuals for your e-commerce";
    let index = 0;

    // Reset state for every playback
    promptText.textContent = '';
    generateBtn.style.display = 'inline-flex'; // Reset display from none
    generateBtn.classList.remove('visible', 'clicked');
    spinner.classList.remove('visible');
    content.classList.remove('visible');
    loadingOverlay.classList.remove('hidden');

    // Typing animation
    function typeText() {
        if (index < text.length) {
            promptText.textContent += text[index];
            index++;
            setTimeout(typeText, 50);
        } else {
            // Show generate button after typing
            setTimeout(() => {
                generateBtn.classList.add('visible');

                // Auto-click button after 500ms
                setTimeout(() => {
                    generateBtn.classList.add('clicked');

                    // Show spinner after button click
                    setTimeout(() => {
                        generateBtn.style.display = 'none';
                        spinner.classList.add('visible');

                        // After 3 seconds, hide loading and show content
                        setTimeout(() => {
                            renderEcommerceSlider(); // Randomize slider images
                            loadingOverlay.classList.add('hidden');
                            content.classList.add('visible');
                            isEcommerceAnimating = false; // Allow next animation
                        }, 3000);
                    }, 300);
                }, 500);
            }, 300);
        }
    }

    // Start typing after a short delay
    setTimeout(typeText, 500);
}

// Watch for step changes to trigger animation
const originalUpdateUI = updateUI;
const customizeVideo = document.querySelector('.customize-video-bg');
const colorPaletteGrid = document.getElementById('color-palette-grid');
const skinTonePaletteGrid = document.getElementById('skin-tone-palette-grid');
const ethnicityBg = document.getElementById('ethnicity-bg');

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

    // Animate colors continuously
    let time = 0;
    function animateColors() {
        time += 0.005;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Create wave effect with time
            const hue = (index * 1.2 + time * 50 + Math.sin(row * 0.3 + time * 2) * 30 + Math.cos(col * 0.3 + time * 1.5) * 30) % 360;
            const saturation = 50 + Math.sin(time * 1.5 + index * 0.02) * 15;
            const lightness = 75 + Math.cos(time * 2 + index * 0.03) * 10;

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

    // Animate skin tones continuously
    let time = 0;
    function animateSkinTones() {
        time += 0.003;
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;

            // Select skin tone range based on row position
            const rangeIndex = Math.floor((row / 15) * skinToneRanges.length);
            const range = skinToneRanges[Math.min(rangeIndex, skinToneRanges.length - 1)];

            // Create subtle wave effect with time
            const hueOffset = Math.sin(col * 0.2 + time * 1.5) * 5 + Math.cos(row * 0.3 + time) * 3;
            const satOffset = Math.sin(time * 1.2 + index * 0.01) * 8;
            const lightOffset = Math.cos(time * 0.8 + col * 0.15) * 5;

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
}

// ===== MOOD SYSTEM (Substep 4) =====
const moodNames = ['Confident', 'Playful', 'Serious', 'Friendly', 'Mysterious'];
const moodImagePaths = [
    '/assets/center_image_2_asian.png',
    '/assets/center_image_2_african.png',
    '/assets/center_image_2_latine.png',
    '/assets/center_image_2_arabian.png',
    '/assets/center_image_2_indian.png'
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
    if (moodText) moodText.textContent = 'Confident';

    // Reset to default scene texture
    if (textures[currentScene]) {
        uniforms.texture1.value = textures[currentScene];
        uniforms.texture2.value = textures[currentScene];
        uniforms.progress.value = 0;
        uniforms.opacity.value = 1;
    }
}

updateUI = function () {
    originalUpdateUI();

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

    // Control Customize Model backgrounds based on substep
    if (currentStep === 3) {
        if (currentSubStep === 0) {
            // Hair Color - show color palette
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.add('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            stopSkinToneRotation();
        } else if (currentSubStep === 1) {
            // Hair Style - show video
            if (customizeVideo) {
                customizeVideo.classList.remove('hidden');
                customizeVideo.play().catch(() => {});
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            stopSkinToneRotation();
        } else if (currentSubStep === 2) {
            // Skin Tone - show skin tone palette AND images with rotation
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.add('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');

            // Start skin tone image rotation
            startSkinToneRotation();
        } else if (currentSubStep === 3) {
            // Ethnicity - show ethnicity model with Three.js transition
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.add('active');
            stopSkinToneRotation();
            resetMoodAnimations();

            // Start ethnicity animations (texture is set inside startEthnicityRotation)
            playEthnicityAnimations();
        } else if (currentSubStep === 4) {
            // Mood - show mood model with Three.js transition
            if (customizeVideo) {
                customizeVideo.classList.add('hidden');
                customizeVideo.pause();
            }
            if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            stopSkinToneRotation();
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
            if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
            if (ethnicityBg) ethnicityBg.classList.remove('active');
            stopSkinToneRotation();
            resetEthnicityAnimations();
            resetMoodAnimations();
        }
    } else {
        // Not in Step 3 - hide all backgrounds, pause video
        if (customizeVideo) {
            customizeVideo.classList.remove('hidden');
            customizeVideo.pause();
        }
        if (colorPaletteGrid) colorPaletteGrid.classList.remove('active');
        if (skinTonePaletteGrid) skinTonePaletteGrid.classList.remove('active');
        if (ethnicityBg) ethnicityBg.classList.remove('active');
        stopSkinToneRotation();
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
}

// Initialize Change Color Badges
initChangeColorBadges();

// ========================================
// Change Pose Section (Step 6) - THREE.JS VERSION
// ========================================
let currentPoseIndex = 0;
const totalPoses = 9;
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
    { small: 'Classic Elegance', big: 'Sophisticated Full Body Pose' },
    { small: 'Side Profile', big: 'Sleek Silhouette Look' },
    { small: 'Minimalist Focus', big: 'Subtle Neck & Shoulder Detail' },
    { small: 'Dynamic Motion', big: 'Free-Spirited Active Pose' },
    { small: 'Artistic Mystery', big: 'Modern Moody Expression' },
    { small: 'Symmetrical Balance', big: 'Hand-to-Face Aesthetic Style' },
    { small: 'Urban Movement', big: 'Confident Walking Stance' },
    { small: 'Casual Charm', big: 'Relaxed Daily Lifestyle Pose' },
    { small: 'Wind-Swept Detail', big: 'Flowing Motion & Natural Look' }
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

            // Initial positioning
            if (posePlanes.length === totalPoses) {
                updatePoseStackThreeJS(0);
            }
        });
    });

    // Create pose labels
    const labelsContainer = document.getElementById('pose-labels-container');
    if (labelsContainer) {
        labelsContainer.innerHTML = '';
        poseLabels = [];

        for (let i = 0; i < totalPoses; i++) {
            const label = document.createElement('div');
            label.className = 'pose-label';
            label.style.opacity = '0'; // Start hidden
            label.innerHTML = `
                <span class="pose-small-title">${poseData[i].small}</span>
                <span class="pose-big-title">${poseData[i].big}</span>
                <span class="pose-counter">${String(i + 1).padStart(2, '0')} / ${String(totalPoses).padStart(2, '0')}</span>
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
            currentPoseIndex++;
            accumulatedPoseScroll = 0;
            poseScrollProgress = 0;
            updatePoseStackThreeJS(0);
            return 'handled';
        } else {
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

