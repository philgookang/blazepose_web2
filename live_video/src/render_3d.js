// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
// import Stats from "three/examples/jsm/libs/stats.module";
// import fetch from 'node-fetch'
// // globalThis.fetch = fetch

// const modelPath = require("../models/YBot.fbx");

// const BlazePose = {
//   nose: 0,
//   left_eye_inner: 1,
//   left_eye: 2,
//   left_eye_outer: 3,
//   right_eye_inner: 4,
//   right_eye: 5,
//   right_eye_outer: 6,
//   left_ear: 7,
//   right_ear: 8,
//   mouth_left: 9,
//   mouth_right: 10,
//   left_shoulder: 11,
//   right_shoulder: 12,
//   left_elbow: 13,
//   right_elbow: 14,
//   left_wrist: 15,
//   right_wrist: 16,
//   left_pinky: 17,
//   right_pinky: 18,
//   left_index: 19,
//   right_index: 20,
//   left_thumb: 21,
//   right_thumb: 22,
//   left_hip: 23,
//   right_hip: 24,
//   left_knee: 25,
//   right_knee: 26,
//   left_ankle: 27,
//   right_ankle: 28,
//   left_heel: 29,
//   right_heel: 30,
//   left_foot_index: 31,
//   right_foot_index: 32,
// };

// /*
// 0: nose
// 1: left_eye_inner
// 2: left_eye
// 3: left_eye_outer
// 4: right_eye_inner
// 5: right_eye
// 6: right_eye_outer
// 7: left_ear
// 8: right_ear
// 9: mouth_left
// 10: mouth_right
// 11: left_shoulder
// 12: right_shoulder
// 13: left_elbow
// 14: right_elbow
// 15: left_wrist
// 16: right_wrist
// 17: left_pinky
// 18: right_pinky
// 19: left_index
// 20: right_index
// 21: left_thumb
// 22: right_thumb
// 23: left_hip
// 24: right_hip
// 25: left_knee
// 26: right_knee
// 27: left_ankle
// 28: right_ankle
// 29: left_heel
// 30: right_heel
// 31: left_foot_index
// 32: right_foot_index
// 33: bodyCenter
// 34: forehead
// 35: leftThumb
// 36: leftHand
// 37: rightThumb
// 38: rightHand
// */



// let poseIndex = 0;
// /*
// mixamo bones
// // head
// mixamorigHead
// mixamorigNeck
// // spine
// mixamorigSpine
// mixamorigSpine1
// mixamorigSpine2
// // left arm
// mixamorigLeftShoulder
// mixamorigLeftArm
// mixamorigLeftForeArm
// mixamorigLeftHand
// // right arm
// mixamorigRightShoulder
// mixamorigRightArm
// mixamorigRightHand
// mixamorigRightForeArm
// // left leg
// mixamorigLeftUpLeg
// mixamorigLeftLeg
// mixamorigLeftToeBase
// // right leg
// mixamorigRightUpLeg
// mixamorigRightLeg
// mixamorigRightToeBase
// */
// const TposeAxis = {
//   // spine + spine1
//   Hips: new THREE.Vector3(0, 10.181594848632812 + 10.083457946777344,
//                              0.1315212994813919-1.0008047819137573).normalize(),
//   // spine2 + neck
//   Spine: new THREE.Vector3(0, 9.100021362304688+16.671676635742188,
//                               -1.373416781425476-2.5161681175231934).normalize(),
//   Neck: new THREE.Vector3(0, 9.617904663085938, 1.6850080490112305).normalize(),

//   Head: new THREE.Vector3(0, 17.815170288085938, 2.5849854946136475).normalize(),

//   RightArm: new THREE.Vector3(-1, 0, 0),
//   RightForeArm: new THREE.Vector3(-1, 0, 0),
//   RightHand: new THREE.Vector3(-1, 0, 0),
//   LeftArm: new THREE.Vector3(1, 0, 0),
//   LeftForeArm: new THREE.Vector3(1, 0, 0),
//   LeftHand: new THREE.Vector3(1, 0, 0),
//   RightUpLeg: new THREE.Vector3(0, -1, 0),
//   RightLeg: new THREE.Vector3(0, -1, 0),
//   RightFoot: new THREE.Vector3(0, -0.6, 0.8),
//   LeftUpLeg: new THREE.Vector3(0, -1, 0),
//   LeftLeg: new THREE.Vector3(0, -1, 0),
//   LeftFoot: new THREE.Vector3(0, -0.6, 0.8)
// }

// function toVector(array, index) {
//   return new THREE.Vector3(
//     array[index].x,
//     array[index].y,
//     array[index].z
//   );
// }
// function getCenter(p1, p2)
//   {
//     const center = (p1.add(p2)).multiplyScalar(0.5);
//     return center
//   }

// function applyRotOffset(q)
// {
//   const yTemp = new THREE.Quaternion()
//   yTemp.setFromAxisAngle(new THREE.Vector3(0.0,1.0,0.0), Math.PI)

//   const xTemp = new THREE.Quaternion()
//   xTemp.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI)

//   const offsetQuaternion = yTemp.multiply(xTemp)

//   return offsetQuaternion.clone().multiply(q.clone()).multiply(offsetQuaternion.clone().invert())
// }

// function getJointQuaternionAndInversedTransform(v1, v2, parentInverseTransform)
//   {
//     const quaternion = new THREE.Quaternion();
//     const local_v2 = v2.applyMatrix4(parentInverseTransform)
//     quaternion.setFromUnitVectors(v1, local_v2);
//     const curT = new THREE.Matrix4()
//     curT.makeRotationFromQuaternion(quaternion)
//     const inverse_curT = curT.clone().invert().multiply(parentInverseTransform)


//     return [applyRotOffset(quaternion), inverse_curT]
//   };





// export class Render3D {
//   constructor(targetElement) {
//     this.targetElement = targetElement;
//     this.scene = new THREE.Scene();
//     this.bones = {};
//     this.originalBones = {};
//   }

//   setup() {
//     this.setupBackground();
//     this.setupControls();
//     this.load3D();
//     // const stats = Stats();
//     // document.body.appendChild(stats.dom);

//     return this;
//   }

//   setupBackground() {
//     this.scene.add(new THREE.AxesHelper(5));
//     this.scene.background = new THREE.Color(0xffffff);

//     this.setupLights();
//     this.setupGround();
//   }

//   setupLights() {
//     const light = new THREE.PointLight();
//     light.position.set(0.8, 1.4, 1.0);
//     this.scene.add(light);

//     const ambientLight = new THREE.AmbientLight();
//     this.scene.add(ambientLight);
//   }

//   setupGround() {
//     const mesh = new THREE.Mesh(
//       new THREE.PlaneGeometry(100, 100),
//       new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
//     );
//     mesh.rotation.x = -Math.PI / 2;
//     mesh.receiveShadow = true;

//     this.scene.add(mesh);
//   }

//   setupControls() {
//     this.setupCamera();
//     this.setupRenderer();

//     this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//     this.controls.enableDamping = true;
//     this.controls.target.set(0, 1, 0);
//   }

//   setupCamera() {
//     this.camera = new THREE.PerspectiveCamera(
//       45,
//       window.innerWidth / window.innerHeight,
//       1,
//       100
//     );
//     this.camera.position.set(-2, 2, 3);
//   }

//   setupRenderer() {
//     this.renderer = new THREE.WebGLRenderer();
//     this.renderer.setSize(
//       this.targetElement.offsetWidth,
//       this.targetElement.offsetHeight
//     );
//     this.targetElement.appendChild(this.renderer.domElement);
//   }









//   load3D() {
//     const fbxLoader = new FBXLoader();
//     fbxLoader.load(
//       modelPath,
//       (fbx) => {
//         fbx.scale.set(0.011, 0.011, 0.011);
//         fbx.position.set(0.5, 0, 0.5);
//         this.scene.add(fbx);

//         const model = fbx.children
//           .find((child) => child.name === "Alpha_Joints")
//           .clone();
//         model.position.x = -1;

//         const bones = model.skeleton.bones;
//         for (let index = 0; index < bones.length; index++) {
//           const bone = bones[index];
//           this.bones[bone.name] = bone;
//         }
//         this.scene.add(model);

//         const skeleton = new THREE.SkeletonHelper(fbx);
//         skeleton.visible = true; // show skeleton
//         this.scene.add(skeleton);

//         this.setModelPoseQuaterion();

//         // const TestQuaternion = new THREE.Quaternion()
//         // TestQuaternion.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI/2.0)
//         // this.setRotation("mixamorigRightUpLeg", (TestQuaternion));


//       },
//       (xhr) => {
//         console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
//       },
//       (error) => {
//         console.log(error);
//       }
//     );
//   }

//   setRotation(boneName, quaternion) {
//     if (!this.originalBones[boneName]) {
//       this.originalBones[boneName] = this.bones[boneName].quaternion.clone();
//     }
//     const newQuaternion = this.originalBones[boneName]
//       .clone()
//       .multiply(quaternion);
//     this.bones[boneName].quaternion.slerp(newQuaternion, 1);
//   }
// }
