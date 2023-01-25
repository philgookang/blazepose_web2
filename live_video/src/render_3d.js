import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
const modelPath = require("../models/YBot.fbx");

/*
mixamo bones
// head
mixamorigHead
mixamorigNeck
// spine
mixamorigSpine
mixamorigSpine1
mixamorigSpine2
// left arm
mixamorigLeftShoulder
mixamorigLeftArm
mixamorigLeftForeArm
mixamorigLeftHand
// right arm
mixamorigRightShoulder
mixamorigRightArm
mixamorigRightHand
mixamorigRightForeArm
// left leg
mixamorigLeftUpLeg
mixamorigLeftLeg
mixamorigLeftToeBase
// right leg
mixamorigRightUpLeg
mixamorigRightLeg
mixamorigRightToeBase
*/

export class Render3D {
  constructor(targetElement) {
    this.targetElement = targetElement;
    this.scene = new THREE.Scene();
    this.bones = {};
    this.originalBones = {};
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
      (fbx) => {
        fbx.scale.set(0.011, 0.011, 0.011);
        fbx.position.set(0.5, 0, 0.5);
        this.scene.add(fbx);

        const model = fbx.children
          .find((child) => child.name === "Alpha_Joints")
          .clone();
        model.position.x = -1;

        const bones = model.skeleton.bones;
        for (let index = 0; index < bones.length; index++) {
          const bone = bones[index];
          this.bones[bone.name] = bone;
        }
        this.scene.add(model);
        console.log("bones", this.bones);

        const skeleton = new THREE.SkeletonHelper(fbx);
        skeleton.visible = true; // show skeleton
        this.scene.add(skeleton);

        console.log("skeleton", skeleton);

        const rotLeftArm = new THREE.Quaternion().set(0, 1, 0, 0);
        this.setRotation("mixamorigLeftArm", rotLeftArm);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error);
      }
    );
  }

  setRotation(boneName, quaternion) {
    if (!this.originalBones[boneName]) {
      this.originalBones[boneName] = this.bones[boneName].quaternion.clone();
    }
    const newQuaternion = this.originalBones[boneName]
      .clone()
      .multiply(quaternion);
    this.bones[boneName].quaternion.slerp(newQuaternion, 1);
  }
}
