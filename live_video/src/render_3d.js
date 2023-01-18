import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
const modelPath = require("../models/YBot.fbx");

export class Render3D {
  constructor(targetElement) {
    this.targetElement = targetElement;
    this.scene = new THREE.Scene();
  }

  setup() {
    this.setupBackground();
    this.setupControls();
    this.load3D();
    // const stats = Stats();
    // document.body.appendChild(stats.dom);

    return this;
  }

  setupBackground() {
    this.scene.add(new THREE.AxesHelper(5));
    this.scene.background = new THREE.Color(0xffffff);

    this.setupLights();
    this.setupGround();
  }

  setupLights() {
    const light = new THREE.PointLight();
    light.position.set(0.8, 1.4, 1.0);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight();
    this.scene.add(ambientLight);
  }

  setupGround() {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    this.scene.add(mesh);
  }

  setupControls() {
    this.setupCamera();
    this.setupRenderer();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      100
    );
    this.camera.position.set(-2, 2, 3);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      this.targetElement.offsetWidth,
      this.targetElement.offsetHeight
    );
    this.targetElement.appendChild(this.renderer.domElement);
  }

  load3D() {
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      modelPath,
      (object) => {
        object.scale.set(0.011, 0.011, 0.011);
        object.position.set(0.5, 0, 0.5);
        this.scene.add(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
