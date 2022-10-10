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

document.body.appendChild(renderer.domElement);

scene.add(new THREE.AxesHelper(10, 10, 10))

const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.5
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight()
directionalLight.intensity = 0.5
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = -20

rafLoop((delta, time) => {
    resize(window.innerWidth, window.innerHeight)
    controls.update();
    renderer.render(scene, camera);
})

const surfaceWorker = new Worker(new URL("./surface.worker.js", import.meta.url))
surfaceWorker.onmessage = event => {
    const geometry = positionNormalToThreeGeometry(event.data)
    const material = new THREE.MeshStandardMaterial({
        //wireframe:true
    })
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh)
};
surfaceWorker.postMessage(0);
