import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import Measure from './Measure';

export default class fw {
    constructor() {
        this.a = 1
        this.camera = null
        this.controls = null
        this.scene = null
        this.renderer = null
        this._measure = null
        this.container = null
        this.meshGroup = new THREE.Group()
        this.width = window.innerWidth;
        this.height = window.innerHeight
        this.init()
    }
    init() {
        const container = document.createElement('div');
        container.id = 'container'
        document.body.appendChild(container);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20);
        this.camera.position.set(- 0.75, 0.7, 1.25);
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        const environment = new RoomEnvironment();
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        this.scene.background = new THREE.Color(0xbbbbbb);
        this.scene.environment = pmremGenerator.fromScene(environment).texture;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.target.set(0, 0.35, 0);
        this.controls.update();

        window.addEventListener('resize', this.onWindowResize.bind(this));
        this.initGLFTLoader()

        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // const cube = new THREE.Mesh(geometry, material);
        // this.scene.add(cube);

        this.container = container
        this.animate()
    }
    initGLFTLoader() {
        const self = this
        new GLTFLoader()
            .setPath('/assets/models/')
            .load('SheenChair.glb', function (gltf) {
                const object = gltf.scene.getObjectByName('SheenChair_fabric');
                console.log('----', gltf)
                self.meshGroup.add(gltf.scene.clone())
                self.scene.add(self.meshGroup);
            });
    }
    onWindowResize() {
        console.log('------onresize');
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.width = window.innerHeight
        this.heihgt = window.innerHeight

    }
    animate() {
        const self = this
        function render() {
            requestAnimationFrame(render);

            self.controls.update();
            self.renderer.render(self.scene, self.camera);
        }
        render()
    }
    addMeasure() {
        if (this._measure) return
        this._measure = new Measure(this)
    }

}
