import { rafLoop } from './lib/loop.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { positionNormalToThreeGeometry } from './geometry.js'
import * as THREE from 'three'
import './style/style.css'

const resize = (width, height) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

{
    const geometry = new THREE.PlaneGeometry(30, 30).rotateX(-Math.PI / 2)
    const material = new THREE.MeshPhysicalMaterial({
        //wireframe:true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
}


document.body.appendChild(renderer.domElement);

scene.add(new THREE.AxesHelper(10, 10, 10))

const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.15
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight()
directionalLight.position.set(-2,15,-4)
directionalLight.intensity = 0.85
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 512*4; // default
directionalLight.shadow.mapSize.height = 512*4; // default
directionalLight.shadow.camera.near = 0.5; // default
directionalLight.shadow.camera.far = 500; // default

scene.add(directionalLight);
//scene.add(new THREE.DirectionalLightHelper(directionalLight))
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(13.2,9.8,8.3)

rafLoop((delta, time) => {
    resize(window.innerWidth, window.innerHeight)
    controls.update();
    renderer.render(scene, camera);
})

const surfaceWorker = new Worker(new URL("./surface.worker.js", import.meta.url))
surfaceWorker.onmessage = event => {
    const geometry = positionNormalToThreeGeometry(event.data)
    const material = new THREE.MeshPhysicalMaterial({
        //wireframe:true
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
};
surfaceWorker.postMessage(0);
