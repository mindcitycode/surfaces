import { rafLoop } from './lib/loop.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { positionNormalToThreeGeometry } from './geometry.js'
import * as THREE from 'three'
import './style/style.css'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { HalftonePass } from 'three/addons/postprocessing/HalftonePass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import { DirectionalLightHelper, PointLightHelper } from 'three'

const resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const POST_PROCESSING = false
const SHOW_NORMALS = false

const composer = new EffectComposer(renderer);
{

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass)
    if (POST_PROCESSING) {

        const ssaoPass = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 1;
        composer.addPass(ssaoPass);

        const strength = 0.25
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), strength, 0.4, 0.85);
        composer.addPass(bloomPass);
        const params = {
            shape: 1,
            radius: 4,
            rotateR: Math.PI / 12,
            rotateB: Math.PI / 12 * 2,
            rotateG: Math.PI / 12 * 3,
            scatter: 0,
            blending: 1,
            blendingMode: 1,
            greyscale: false,
            disable: false
        };

        const halftonePass = new HalftonePass(window.innerWidth, window.innerHeight, params);
        composer.addPass(halftonePass)
    }
}
{
    const geometry = new THREE.PlaneGeometry(100, 100).rotateX(-Math.PI / 2).translate(0, -11, 0)
    const material = new THREE.MeshPhysicalMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
}
{
    scene.add(new THREE.AxesHelper(10, 10, 10))
}
{
    const ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = 0.2
    scene.add(ambientLight);
}
{
    const pointLight = new THREE.PointLight()
    pointLight.position.set(8, 8, 9)
    pointLight.intensity = 0.8
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 512 * 4; // default
    pointLight.shadow.mapSize.height = 512 * 4; // default
    pointLight.shadow.camera.near = 0.5; // default
    pointLight.shadow.camera.far = 500; // default
    scene.add(pointLight);
    //scene.add(new PointLightHelper(pointLight))
}

camera.position.set(13.2, 9.8, 8.3)

FrafLoop((delta, time) => {
    resize(window.innerWidth, window.innerHeight)
    controls.update();
    composer.render()
})

let density = 1
const surfaceWorker = new Worker(new URL("./surface.worker.js", import.meta.url))
surfaceWorker.onmessage = event => {
    const geometry = positionNormalToThreeGeometry(event.data)
    const material = new THREE.MeshPhysicalMaterial({metalness:0,roughness:0.9})
    const mesh = new THREE.Mesh(geometry, material);

    if (SHOW_NORMALS) {
        const helper = new VertexNormalsHelper(mesh, 1, 0xff0000);
        mesh.add(helper)
    }
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData = { density }
    scene.add(mesh)
 
    scene.traverse(o => {
        if (o.type === 'Mesh') {
            if (o.userData.density && o.userData.density !== density) {
                o.position.x -= 15
            }
        }
    })
    if (density < 10) {
        density++
        surfaceWorker.postMessage({ density });
    }
};
surfaceWorker.postMessage({ density });
