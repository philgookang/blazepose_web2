/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-webgpu";
import * as mpPose from "@mediapipe/pose";

import * as posedetection from "@tensorflow-models/pose-detection";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";

const modelPath = require("../models/y_bot.glb");
// >>>>>>> 14ca3310bf8fef784248706e88b6a8851878007b

import { Camera } from "./camera";
import { Setup } from "./option_panel";
import { STATE } from "./params";

let detector, camera, rafId;

async function createDetector() {
  const runtime = "mediapipe";

  return posedetection.createDetector(STATE.model, {
    runtime,
    modelType: STATE.modelConfig.type,
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`,
  });
}

async function renderResult() {
  if (camera.video.readyState < 2) {
    await new Promise((resolve) => {
      camera.video.onloadeddata = () => {
        resolve(video);
      };
    });
  }

  let poses = null;

  // Detector can be null if initialization failed (for example when loading
  // from a URL that does not exist).
  if (detector != null) {
    // Detectors can throw errors, for example when using custom URLs that
    // contain a model that doesn't provide the expected output.
    try {
      poses = await detector.estimatePoses(camera.video, {
        maxPoses: STATE.modelConfig.maxPoses,
        flipHorizontal: false,
      });
    } catch (error) {
      detector.dispose();
      detector = null;
      alert(error);
    }
  }

  camera.drawCtx();

  // The null check makes sure the UI is not in the middle of changing to a
  // different model. If during model change, the result is from an old model,
  // which shouldn't be rendered.
  if (poses && poses.length > 0 && !STATE.isModelChanged) {
    camera.drawResults(poses);
  }
}

async function renderPrediction() {
  await renderResult();

  rafId = requestAnimationFrame(renderPrediction);
}

let bones = {};
let scene, renderer, controls, threeCamera, model;
function renderThree() {
  scene = new THREE.Scene();
  scene.add(new THREE.AxesHelper(5));
  scene.background = new THREE.Color(0xffffff);

  const light = new THREE.PointLight();
  light.position.set(0.8, 1.4, 1.0);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight();
  scene.add(ambientLight);

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);

  threeCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  threeCamera.position.set(2, 2, -2);

  const threeEl = document.getElementById("threejs-mixamo");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(threeEl.offsetWidth, threeEl.offsetHeight);
  threeEl.appendChild(renderer.domElement);

  controls = new OrbitControls(threeCamera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.update();

// <<<<<<< HEAD
//   const loader = new GLTFLoader();
//   loader.load("models/gltf/Xbot.glb", (gltf) => {
//     // TODO remove unnecessary joints
//     gltf.scene.traverse(function (object) {
//       if (object.isMesh) object.castShadow = true;
//     });

//     // model = gltf.scene;
//     model = SkeletonUtils.clone(gltf.scene);
//     model.position.x = -1;
//     model2 = SkeletonUtils.clone(gltf.scene);
//     model2.position.x = 2;

//     model.traverse(function (object) {
//       if (object.isBone) {
//         bones[object.name] = object;
//       }
//     });

//     scene.add(model);
//     scene.add(model2);

//     let skeleton;
//     skeleton = new THREE.SkeletonHelper(model);
//     skeleton.visible = true; // show skeleton
//     scene.add(skeleton);

//     skeleton = new THREE.SkeletonHelper(model2);
//     skeleton.visible = true; // show skeleton
//     scene.add(skeleton);

//     console.log("skeleton", skeleton)
//   });


  // const fbxLoader = new FBXLoader();
  // fbxLoader.load(
  //   modelPath,
  //   (fbx) => {
  //     fbx.scale.set(0.011, 0.011, 0.011);
  //     fbx.position.set(0.5, 0, 0.5);
  //     scene.add(fbx);

  //     const model = fbx.children
  //       .find((child) => child.name === "Alpha_Joints")
  //       .clone();
  //     model.position.x = -1;

  //     const modelBones = model.skeleton.bones;
  //     for (let index = 0; index < modelBones.length; index++) {
  //       const bone = modelBones[index];
  //       bones[bone.name] = bone;
  //     }
  //     scene.add(model);
  //     console.log("bones", bones);

  //     const skeleton = new THREE.SkeletonHelper(fbx);
  //     skeleton.visible = true; // show skeleton
  //     scene.add(skeleton);

  //     console.log("skeleton", skeleton);
  //   },
  //   (xhr) => {
  //     console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  //   },
  //   (error) => {
  //     console.log(error);
  //   }
  // );
// =======
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "https://threejs.org/examples/models/gltf/Xbot.glb",
    (gltf) => {
      gltf.scene.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
      });

      model = SkeletonUtils.clone(gltf.scene);
      model.traverse(function (object) {
        if (object.isBone) {
          bones[object.name] = object;
        }
      });
      console.log("bones", bones);
      scene.add(model);
    }
  );
// >>>>>>> 14ca3310bf8fef784248706e88b6a8851878007b

  window.addEventListener(
    "resize",
    function () {
      threeCamera.aspect = threeEl.offsetWidth / threeEl.offsetHeight;
      threeCamera.updateProjectionMatrix();
      renderer.setSize(threeEl.offsetWidth, threeEl.offsetHeight);
      renderer.render(scene, threeCamera);
    },
    false
  );
}

const originalBones = {};
function setRotation(boneName, quaternion) {
  if (!bones[boneName]) return;
  if (!originalBones[boneName]) {
    originalBones[boneName] = bones[boneName].quaternion.clone();
  }
  const newQuaternion = originalBones[boneName]
    .clone()
    .multiply(quaternion)
    .normalize();
  bones[boneName].quaternion.slerp(newQuaternion, 1);
}

const BlazePose = {
  nose: 0,
  left_eye_inner: 1,
  left_eye: 2,
  left_eye_outer: 3,
  right_eye_inner: 4,
  right_eye: 5,
  right_eye_outer: 6,
  left_ear: 7,
  right_ear: 8,
  mouth_left: 9,
  mouth_right: 10,
  left_shoulder: 11,
  right_shoulder: 12,
  left_elbow: 13,
  right_elbow: 14,
  left_wrist: 15,
  right_wrist: 16,
  left_pinky: 17,
  right_pinky: 18,
  left_index: 19,
  right_index: 20,
  left_thumb: 21,
  right_thumb: 22,
  left_hip: 23,
  right_hip: 24,
  left_knee: 25,
  right_knee: 26,
  left_ankle: 27,
  right_ankle: 28,
  left_heel: 29,
  right_heel: 30,
  left_foot_index: 31,
  right_foot_index: 32,
};

// let TposeAxis = {}

// async function initTposeAxis()
// {
//   console.log("bones", bones)
//   console.log("bones[mixamorigSpine1].position", bones["mixamorigSpine1"])
//     // spine + spine1
//   TposeAxis.Spine = bones["mixamorigSpine"].position.normalize(),
//   TposeAxis.Spine1 = bones["mixamorigSpine1"].position.normalize(),
//   TposeAxis.Spine2 = bones["mixamorigSpine2"].position.normalize(),
//   TposeAxis.Neck = bones["mixamorigNeck"].position.normalize(),
//   // Neck: new THREE.Vector3(0, 9.617904663085938, 1.6850080490112305).normalize(),

//   // Head: bones["mixamorigHead"].position.sub(bones["mixamorigNeck"]).normalize(),




//   TposeAxis.RightArm = new THREE.Vector3(-1, 0, 0),
//   TposeAxis.RightForeArm = new THREE.Vector3(-1, 0, 0),
//   TposeAxis.RightHand = new THREE.Vector3(-1, 0, 0),
//   TposeAxis.LeftArm = new THREE.Vector3(1, 0, 0),
//   TposeAxis.LeftForeArm = new THREE.Vector3(1, 0, 0),
//   TposeAxis.LeftHand = new THREE.Vector3(1, 0, 0),
//   TposeAxis.RightUpLeg = new THREE.Vector3(0, -1, 0),
//   TposeAxis.RightLeg = new THREE.Vector3(0, -1, 0),
//   TposeAxis.RightFoot = new THREE.Vector3(0, -0.6, 0.8),
//   TposeAxis.LeftUpLeg = new THREE.Vector3(0, -1, 0),
//   TposeAxis.LeftLeg = new THREE.Vector3(0, -1, 0),
//   TposeAxis.LeftFoot = new THREE.Vector3(0, -0.6, 0.8)
//   console.log("TposeAxis", TposeAxis)
// }


const TposeAxis = {
  // spine + spine1
  Hips: new THREE.Vector3(0, 10.181594848632812 + 10.083457946777344,
                             0.1315212994813919-1.0008047819137573).normalize(),
  // spine2 + neck
  Spine: new THREE.Vector3(0, 9.100021362304688+16.671676635742188,
                              -1.373416781425476-2.5161681175231934).normalize(),
  Neck: new THREE.Vector3(0, 9.617904663085938, 1.6850080490112305).normalize(),

  Head: new THREE.Vector3(0, 17.815170288085938, 2.5849854946136475).normalize(),

  RightArm: new THREE.Vector3(-1, 0, 0),
  RightForeArm: new THREE.Vector3(-1, 0, 0),
  RightHand: new THREE.Vector3(-1, 0, 0),
  LeftArm: new THREE.Vector3(1, 0, 0),
  LeftForeArm: new THREE.Vector3(1, 0, 0),
  LeftHand: new THREE.Vector3(1, 0, 0),
  RightUpLeg: new THREE.Vector3(0, -1, 0),
  RightLeg: new THREE.Vector3(0, -1, 0),
  RightFoot: new THREE.Vector3(0, -0.6, 0.8),
  LeftUpLeg: new THREE.Vector3(0, -1, 0),
  LeftLeg: new THREE.Vector3(0, -1, 0),
  LeftFoot: new THREE.Vector3(0, -0.6, 0.8)
}

function toVector(array, index) {
  return new THREE.Vector3(
    array[index].x,
    array[index].y,
    array[index].z
  );
}
function getCenter(p1, p2)
  {
    const center = (p1.clone().add(p2)).multiplyScalar(0.5);
    return center
  }

function applyRotOffset(q)
{
  const yTemp = new THREE.Quaternion()
  yTemp.setFromAxisAngle(new THREE.Vector3(0.0,1.0,0.0), Math.PI)

  const xTemp = new THREE.Quaternion()
  xTemp.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI)

  const offsetQuaternion = yTemp.multiply(xTemp)

  return offsetQuaternion.clone().multiply(q.clone()).multiply(offsetQuaternion.clone().invert())
}

function getJointQuaternionAndInversedTransform(v1, v2, parentInverseTransform)
{
  const quaternion = new THREE.Quaternion();
  const local_v2 = v2.clone().applyMatrix4(parentInverseTransform)
  quaternion.setFromUnitVectors(v1, local_v2);
  const curT = new THREE.Matrix4()
  curT.makeRotationFromQuaternion(quaternion)
  const inverse_curT = curT.clone().invert().multiply(parentInverseTransform)


  return [(quaternion), inverse_curT]
};

let poseIndex = 0;
let lastApplied = 0;


function getAvatarJointPosition(name)
{
  const jointMatrix = bones[name].matrixWorld.elements
  const vec = new THREE.Vector3(jointMatrix[12], jointMatrix[13], jointMatrix[14])
  return vec
}


async function setModelPoseQuaterion()
{
  const now = new Date().getTime();
  if (now - lastApplied < 33) return;
  // console.log("bones", bones);
  lastApplied = now;

  const motionDir = '/json/litness-data/'
  const motionTag = '1.squat'
  // const motionTag = '2.lunge'
  // const motionTag = '3.pushup'
  // const motionTag = '4.bird_dog'
  // const motionTag = '5.plank'
  // const motionTag = '6.bridge'
  // const motionTag = '7.shoulder_press'
  // const motionTag = '8.lateral_raise'
  // const motionTag = '9.side_knee_up'
  // const motionTag = '10.mountain_climber'


  // 122
  // 138
  // 195
  // 133
  // 139
  // 110
  // 107
  // 156
  // 153
  // 37


  poseIndex++;
  if (poseIndex > 110 - 1) {
    poseIndex = 0;
  }
  // poseIndex = 0;
  // poseIndex = 70;
  console.log("poseIndex", poseIndex);

  // const res = await (await fetch('/json/litness-data/1.squat/1.squat_'+String(poseIndex)+'.json')).json();
  const res = await (await fetch(motionDir+motionTag+'/'+motionTag+'_'+String(poseIndex)+'.json')).json();
  // const res = await (await fetch('/json/litness-data/6.bridge/6.bridge_'+String(poseIndex)+'.json')).json();
  // const res = await (await fetch('/json/litness-data/7.shoulder_press/7.shoulder_press_'+String(poseIndex)+'.json')).json();

  const pos = res.pose
  // console.log("pos", pos);



  // const TestQuaternion = new THREE.Quaternion()
  // TestQuaternion.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI/2.0)
  // // TestQuaternion.setFromAxisAngle(new THREE.Vector3(0.0,1.0,0.0).applyQuaternion(offsetQuaternion), 3.14/2.0)

  // // console.log(TestQuaternion)
  // // console.log(offsetQuaternion.multiply(TestQuaternion).multiply(offsetQuaternion.invert()))
  // setRotation("mixamorigRightArm", (TestQuaternion));

  const nose = toVector(pos, BlazePose.nose)
  const left_eye_inner = toVector(pos, BlazePose.left_eye_inner)
  const left_eye = toVector(pos, BlazePose.left_eye)
  const left_eye_outer = toVector(pos, BlazePose.left_eye_outer)
  const right_eye_inner = toVector(pos, BlazePose.right_eye_inner)
  const right_eye = toVector(pos, BlazePose.right_eye)
  const right_eye_outer = toVector(pos, BlazePose.right_eye_outer)
  const left_ear = toVector(pos, BlazePose.left_ear)
  const right_ear = toVector(pos, BlazePose.right_ear)
  const mouth_left = toVector(pos, BlazePose.mouth_left)
  const mouth_right = toVector(pos, BlazePose.mouth_right)
  const left_shoulder = toVector(pos, BlazePose.left_shoulder)
  const right_shoulder = toVector(pos, BlazePose.right_shoulder)
  const left_elbow = toVector(pos, BlazePose.left_elbow)
  const right_elbow = toVector(pos, BlazePose.right_elbow)
  const left_wrist = toVector(pos, BlazePose.left_wrist)
  const right_wrist = toVector(pos, BlazePose.right_wrist)
  const left_pinky = toVector(pos, BlazePose.left_pinky)
  const right_pinky = toVector(pos, BlazePose.right_pinky)
  const left_index = toVector(pos, BlazePose.left_index)
  const right_index = toVector(pos, BlazePose.right_index)
  const left_thumb = toVector(pos, BlazePose.left_thumb)
  const right_thumb = toVector(pos, BlazePose.right_thumb)
  const left_hip = toVector(pos, BlazePose.left_hip)
  const right_hip = toVector(pos, BlazePose.right_hip)
  const left_knee = toVector(pos, BlazePose.left_knee)
  const right_knee = toVector(pos, BlazePose.right_knee)
  const left_ankle = toVector(pos, BlazePose.left_ankle)
  const right_ankle = toVector(pos, BlazePose.right_ankle)
  const left_heel = toVector(pos, BlazePose.left_heel)
  const right_heel = toVector(pos, BlazePose.right_heel)
  const left_foot_index = toVector(pos, BlazePose.left_foot_index)
  const right_foot_index = toVector(pos, BlazePose.right_foot_index)

  nose.y *= -1
  left_eye_inner.y *= -1
  left_eye.y *= -1
  left_eye_outer.y *= -1
  right_eye_inner.y *= -1
  right_eye.y *= -1
  right_eye_outer.y *= -1
  left_ear.y *= -1
  right_ear.y *= -1
  mouth_left.y *= -1
  mouth_right.y *= -1
  left_shoulder.y *= -1
  right_shoulder.y *= -1
  left_elbow.y *= -1
  right_elbow.y *= -1
  left_wrist.y *= -1
  right_wrist.y *= -1
  left_pinky.y *= -1
  right_pinky.y *= -1
  left_index.y *= -1
  right_index.y *= -1
  left_thumb.y *= -1
  right_thumb.y *= -1
  left_hip.y *= -1
  right_hip.y *= -1
  left_knee.y *= -1
  right_knee.y *= -1
  left_ankle.y *= -1
  right_ankle.y *= -1
  left_heel.y *= -1
  right_heel.y *= -1
  left_foot_index.y *= -1
  right_foot_index.y *= -1

  nose.z *= -1
  left_eye_inner.z *= -1
  left_eye.z *= -1
  left_eye_outer.z *= -1
  right_eye_inner.z *= -1
  right_eye.z *= -1
  right_eye_outer.z *= -1
  left_ear.z *= -1
  right_ear.z *= -1
  mouth_left.z *= -1
  mouth_right.z *= -1
  left_shoulder.z *= -1
  right_shoulder.z *= -1
  left_elbow.z *= -1
  right_elbow.z *= -1
  left_wrist.z *= -1
  right_wrist.z *= -1
  left_pinky.z *= -1
  right_pinky.z *= -1
  left_index.z *= -1
  right_index.z *= -1
  left_thumb.z *= -1
  right_thumb.z *= -1
  left_hip.z *= -1
  right_hip.z *= -1
  left_knee.z *= -1
  right_knee.z *= -1
  left_ankle.z *= -1
  right_ankle.z *= -1
  left_heel.z *= -1
  right_heel.z *= -1
  left_foot_index.z *= -1
  right_foot_index.z *= -1


  const pelvis = getCenter(left_hip, right_hip)

  const neck = getCenter(left_shoulder, right_shoulder)
  const head = getCenter(left_ear, right_ear)

  const left_hand = getCenter(left_pinky, left_index)
  const right_hand = getCenter(right_pinky, right_index)

  // console.log("pelvis", pelvis)
  // console.log("neck", neck)

  // standing Position(lateral_raise pose, at frame 21 (T pose))
  // pelvis :  x: -0.0001741275191307068, y: 0.00012016855180263519, z: -0.00032228603959083557
  // neck:     x: 0.01930684596300125, y: 0.5306624174118042, z: 0.056955426931381226

  const skelSpineLength = 0.53


  // console.log("mixamorigHips", bones["mixamorigHips"])
  // //x: 0, y: 103.99, z: 2.08
  // console.log("mixamorigSpine", bones["mixamorigSpine"])
  // //x: 0 y: 10.18, z: 0.13
  // console.log("mixamorigSpine1", bones["mixamorigSpine1"])
  // //x: 0, y: 10.08, z: -1.00
  // console.log("mixamorigSpine2", bones["mixamorigSpine2"])
  // //x: 0, y: 9.10, z: -1.37
  // console.log("mixamorigNeck", bones["mixamorigNeck"])
  // //x: 0, y: 16.67, z: -2.52

  var spineLength = 10.18
  var spine1Length = 10.08
  var spine2Length = 9.10
  var neckLength = 16.67


  const totalSpineLength = spineLength+spine1Length+spine2Length+neckLength

  spineLength *= skelSpineLength / totalSpineLength
  spine1Length *= skelSpineLength / totalSpineLength
  spine2Length *= skelSpineLength / totalSpineLength
  neckLength *= skelSpineLength / totalSpineLength


  //compute inout of spine. when the legs are front of spine, the abdomen goes back.
  const spineVec = neck.clone().sub(pelvis)

  // view fron front
  const rightVec = left_hip.clone().sub(right_hip).normalize()

  const frontVec = rightVec.clone().cross(spineVec)

  const legVec = getCenter(left_knee, right_knee)

  const inout = frontVec.clone().dot(legVec)
  
  console.log("inout", inout)
  // if inout >0 the abdomen goes back, otherwise, goes front

  const curSpineLength = Math.min(skelSpineLength, spineVec.length())

  // curSpineLength
  // console.log("skelSpineLength", skelSpineLength)
  // console.log("spineVec.length()", spineVec.length())


  // original plane angle
  rightVec.normalize()
  spineVec.normalize()

  const targetPlaneAngle = Math.atan2(rightVec.clone().cross(spineVec).length(), rightVec.clone().dot(spineVec))
  // console.log("rightVec",rightVec)
  // console.log("rightVec.clone().dot(spineVec)",rightVec.clone().dot(spineVec))
  // console.log("targetPlaneAngle", targetPlaneAngle)

  // calculate inout angle
  const cos = Math.cos;
  const sin = Math.sin;

  var angle = Math.PI/3
  var upper = angle
  var lower = 0.0

  angle = (upper+lower)/2.0


  var count = 0;
  while( true ){
    const neck_z =                (sin(angle)*spine1Length + sin(2*angle)*spine2Length + sin(3*angle)*neckLength)
    const neck_y = spineLength + cos(angle)*spine1Length + cos(2*angle)*spine2Length + cos(3*angle)*neckLength

    if(Math.abs(neck_z*neck_z + neck_y*neck_y - curSpineLength*curSpineLength) < 1e-5){
      break;
    }

    if(neck_z*neck_z + neck_y*neck_y - curSpineLength*curSpineLength < 0){
      upper = (upper + lower) / 2.0;
    }
    else
    {
      lower = (upper + lower) / 2.0;
    }
    angle = (upper+lower)/2.0
    count++;
    if(count >= 15)
    {
      // console.log("maximum!")
      break;
    }
  }

  const neck_z =              -(sin(angle)*spine1Length + sin(2*angle)*spine2Length + sin(3*angle)*neckLength)
  const neck_y = spineLength + cos(angle)*spine1Length + cos(2*angle)*spine2Length + cos(3*angle)*neckLength

  var rotatedRootAngle = -(Math.atan2(neck_y, neck_z) - Math.PI /2.0)

  console.log("rotatedRootAngle", rotatedRootAngle)

  const planeSpine = cos(rotatedRootAngle)*spineLength
  const planeSpine1 = cos(rotatedRootAngle+angle)*spine1Length;
  const planeSpine2 = cos(rotatedRootAngle+2*angle)*spine2Length;
  const planeNeck = cos(rotatedRootAngle+3*angle)*neckLength;


  var planeAngle = Math.PI/6
  var upper = planeAngle
  var lower = -planeAngle
  planeAngle = (upper+lower)/2.0

  var planeCount = 0
  while( true ){
    const neck_x =                -(sin(planeAngle)*planeSpine1 + sin(2*planeAngle)*planeSpine2 + sin(3*planeAngle)*planeNeck)
    const neck_y = planeSpine + cos(planeAngle)*planeSpine1 + cos(2*planeAngle)*planeSpine2 + cos(3*planeAngle)*planeNeck
    // console.log("neck_x", neck_x)

    const curPlaneAngle = Math.atan2(neck_y, neck_x)

    if(Math.abs(targetPlaneAngle - curPlaneAngle) < 1e-4){
      break;
    }

    if(targetPlaneAngle - curPlaneAngle < 0){
      upper = (upper + lower) / 2.0;
    }
    else
    {
      lower = (upper + lower) / 2.0;
    }
    planeAngle = (upper+lower)/2.0
    planeCount++;
    if(planeCount >= 15)
    {
      // console.log("maximum!")
      break;
    }

    // console.log("curPlaneAngle", curPlaneAngle)
    // console.log("planeAngle", planeAngle)
  }

  console.log("angle", angle)
  console.log("planeAngle", planeAngle)
  console.log("inout", inout)

  // if(inout < 0)
  // {
  //   angle *= -1
  //   planeAngle *= -1
  //   rotatedRootAngle *= -1
  // }



  // Compute the root's orientation of pelvis-neck spine structure 
  // It will be replaced to the orientation of pelvis-spine structure
  const _HipsT = new THREE.Matrix4()
  const _Hips_x = left_hip.clone().sub(right_hip).normalize()
  const _Hips_y = neck.clone().sub(pelvis).normalize()
  const _Hips_z = _Hips_x.clone().cross(_Hips_y).normalize()
  const _new_Hips_x = _Hips_y.clone().cross(_Hips_z).normalize()

  _HipsT.makeBasis(_new_Hips_x, _Hips_y, _Hips_z)

  var QT;
  //TODO : compute the position of spine, spine1, spine2
  var spine_gen = new THREE.Vector3(0.0, planeSpine, spineLength*sin(rotatedRootAngle))

  var spine1_gen = spine_gen.clone().add(new THREE.Vector3(-sin(planeAngle)*planeSpine1 , cos(planeAngle)*planeSpine1, sin(angle+rotatedRootAngle)*spine1Length))
  var spine2_gen = spine1_gen.clone().add(new THREE.Vector3(-sin(2*planeAngle)*planeSpine2 , cos(2*planeAngle)*planeSpine2, sin(2*angle+rotatedRootAngle)*spine2Length))

  var neck_gen = spine2_gen.clone().add(new THREE.Vector3(-sin(3*planeAngle)*planeNeck , cos(3*planeAngle)*planeNeck, sin(3*angle+rotatedRootAngle)*neckLength))

  neck_gen.applyMatrix4(_HipsT)
  spine_gen.applyMatrix4(_HipsT)
  spine1_gen.applyMatrix4(_HipsT)
  spine2_gen.applyMatrix4(_HipsT)


  // console.log("get diff")
  // console.log("neck", neck)
  // console.log("neck_gen", neck_gen)


  // compute Hips orientation with spine. Not the neck.
  const HipsT = new THREE.Matrix4()
  const Hips_x = left_hip.clone().sub(right_hip).normalize()
  const Hips_y = spine_gen.clone().sub(pelvis).normalize()
  const Hips_z = Hips_x.clone().cross(Hips_y).normalize()
  const new_Hips_x = Hips_y.clone().cross(Hips_z).normalize()

  HipsT.makeBasis(new_Hips_x, Hips_y, Hips_z)
  const HipsQuaternion = new THREE.Quaternion()

  HipsQuaternion.setFromRotationMatrix(HipsT)
  
  setRotation("mixamorigHips", HipsQuaternion);

  const inverse_HipsT = HipsT.clone().invert()





  // const spineRotation = new THREE.Quaternion()
  // spineRotation.setFromAxisAngle(new THREE.Vector3(1.0, 0.0, 0.0), rotatedRootAngle)


  // mixamorigSpine
  QT = getJointQuaternionAndInversedTransform(TposeAxis.Spine, 
                                              (spine1_gen.clone().sub(spine_gen).normalize()), 
                                              inverse_HipsT)
  setRotation("mixamorigSpine", QT[0]);
  const inverse_SpineT = QT[1];


  // mixamorigSpine1
  QT = getJointQuaternionAndInversedTransform(TposeAxis.Spine, 
                                              (spine2_gen.clone().sub(spine1_gen).normalize()), 
                                              inverse_SpineT)
  setRotation("mixamorigSpine1", QT[0]);
  const inverse_Spine1T = QT[1];




  // mixamorigSpine2
  var Spine2T = new THREE.Matrix4()
  const Spine_x = left_shoulder.clone().sub(right_shoulder).normalize()
  const Spine_y = neck_gen.clone().sub(spine2_gen).normalize()
  const Spine_z = Spine_x.clone().cross(Spine_y).normalize()
  const new_Spine_x = Spine_y.clone().cross(Spine_z).normalize()

  Spine2T.makeBasis(new_Spine_x, Spine_y, Spine_z)

  const localSpine2T = inverse_Spine1T.clone().multiply(Spine2T)

  const Spine2Quaternion = new THREE.Quaternion()

  Spine2Quaternion.setFromRotationMatrix(localSpine2T)
  const inverse_Spine2T = Spine2T.invert()

  const identityT = new THREE.Matrix4()
  // identityT.indentity()

  // mixamorigSpine
  // QT = getJointQuaternionAndInversedTransform(TposeAxis.Spine, 
  //                                             (neckLower.clone().sub(spine).normalize()), 
  //                                             inverse_HipsT)
  setRotation("mixamorigSpine2", Spine2Quaternion);
  // const inverse_SpineT = QT[1];


  // mixamorigNeck
  QT = getJointQuaternionAndInversedTransform(TposeAxis.Neck, 
                                              (head.clone().sub(neck_gen).normalize()), 
                                              inverse_Spine2T)
  setRotation("mixamorigNeck", QT[0]);
  const inverse_NeckT = QT[1];

  // // mixamorigHead
  // QT = getJointQuaternionAndInversedTransform(TposeAxis.Head, 
  //                                             (headTop.clone().sub(neckUpper).normalize()), 
  //                                             inverse_NeckT)
  // setRotation("mixamorigHead", QT[0]);

  const inverse_RightShoulderT = inverse_Spine2T;
  const inverse_LeftShoulderT = inverse_Spine2T;

  // mixamorigRightArm
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightArm, 
                                              (right_elbow.clone().sub(right_shoulder).normalize()), 
                                              inverse_RightShoulderT)
  setRotation("mixamorigRightArm", QT[0]);
  const inverse_RightArmT = QT[1];


  // mixamorigRightForeArm
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightForeArm, 
                                              (right_wrist.clone().sub(right_elbow).normalize()), 
                                              inverse_RightArmT)
  setRotation("mixamorigRightForeArm", QT[0]);
  const inverse_RightForeArmT = QT[1];

  // mixamorigRightHand
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightHand, 
                                              (right_hand.clone().sub(right_wrist).normalize()), 
                                              inverse_RightForeArmT)
  setRotation("mixamorigRightHand", QT[0]);


  // mixamorigLeftArm
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftArm, 
                                              (left_elbow.clone().sub(left_shoulder).normalize()), 
                                              inverse_LeftShoulderT)
  setRotation("mixamorigLeftArm", QT[0]);
  const inverse_LeftArmT = QT[1];
  // console.log("leftArm", left_elbow.clone().sub(left_shoulder).normalize())


  // mixamorigLeftForeArm
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftForeArm, 
                                              (left_wrist.clone().sub(left_elbow).normalize()), 
                                              inverse_LeftArmT)
  setRotation("mixamorigLeftForeArm", QT[0]);
  const inverse_LeftForeArmT = QT[1];


  // mixamorigLeftHand
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftHand, 
                                              (left_hand.clone().sub(left_wrist).normalize()), 
                                              inverse_LeftForeArmT)
  setRotation("mixamorigLeftHand", QT[0]);

  // mixamorigRightUpLeg
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightUpLeg, 
                                              (right_knee.clone().sub(right_hip).normalize()), 
                                              // (new THREE.Vector3(0.0,0.0,-1.0)), 
                                              inverse_HipsT)
  setRotation("mixamorigRightUpLeg", QT[0]);
  const inverse_RightUpLegT = QT[1];


  // mixamorigRightLeg
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightLeg, 
                                              (right_ankle.clone().sub(right_knee).normalize()), 
                                              inverse_RightUpLegT)
  setRotation("mixamorigRightLeg", QT[0]);
  const inverse_RightLegT = QT[1];

  // mixamorigRightFoot
  QT = getJointQuaternionAndInversedTransform(TposeAxis.RightFoot, 
                                              (right_foot_index.clone().sub(right_ankle).normalize()), 
                                              inverse_RightLegT)
  setRotation("mixamorigRightFoot", QT[0]);


  // mixamorigLeftUpLeg
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftUpLeg, 
                                              (left_knee.clone().sub(left_hip).normalize()), 
                                              inverse_HipsT)
  setRotation("mixamorigLeftUpLeg", QT[0]);
  const inverse_LeftUpLegT = QT[1];


  // mixamorigLeftLeg
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftLeg, 
                                              (left_ankle.clone().sub(left_knee).normalize()), 
                                              inverse_LeftUpLegT)
  setRotation("mixamorigLeftLeg", QT[0]);
  const inverse_LeftLegT = QT[1];

  // mixamorigLeftFoot
  QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftFoot, 
                                              (left_foot_index.clone().sub(left_ankle).normalize()), 
                                              inverse_LeftLegT)
  setRotation("mixamorigLeftFoot", QT[0]);

  // console.log("left foot index", left_foot_index)
  // console.log("left ankle", left_ankle)


  // Evaluation of retargeting

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

  // left arm
  // const mixamorigLeftShoulder = getAvatarJointPosition("mixamorigLeftShoulder")
  const mixamorigLeftArm = getAvatarJointPosition("mixamorigLeftArm")
  const mixamorigLeftForeArm = getAvatarJointPosition("mixamorigLeftForeArm")
  const mixamorigLeftHand = getAvatarJointPosition("mixamorigLeftHand")
  // right arm
  // const mixamorigRightShoulder = getAvatarJointPosition("mixamorigRightShoulder")
  const mixamorigRightArm = getAvatarJointPosition("mixamorigRightArm")
  const mixamorigRightForeArm = getAvatarJointPosition("mixamorigRightForeArm")
  const mixamorigRightHand = getAvatarJointPosition("mixamorigRightHand")
  // left leg
  const mixamorigLeftUpLeg = getAvatarJointPosition("mixamorigLeftUpLeg")
  const mixamorigLeftLeg = getAvatarJointPosition("mixamorigLeftLeg")
  const mixamorigLeftToeBase = getAvatarJointPosition("mixamorigLeftToeBase")
  // right leg
  const mixamorigRightUpLeg = getAvatarJointPosition("mixamorigRightUpLeg")
  const mixamorigRightLeg = getAvatarJointPosition("mixamorigRightLeg")
  const mixamorigRightToeBase = getAvatarJointPosition("mixamorigRightToeBase")


  // Torso
  const skel_shoulder = left_shoulder.clone().sub(right_shoulder).normalize()
  // const skel_right_flank = right_shoulder.clone().sub(right_hip).normalize()
  // const skel_left_flank = left_shoulder.clone().sub(left_hip).normalize()
  const skel_hip = left_hip.clone().sub(right_hip).normalize()

  const avatar_shoulder = mixamorigLeftArm.clone().sub(mixamorigRightArm).normalize()
  // const avatar_right_flank = mixamorigRightArm.clone().sub(mixamorigRightUpLeg).normalize()
  // const avatar_left_flank = mixamorigLeftArm.clone().sub(mixamorigLeftUpLeg).normalize()
  const avatar_hip = mixamorigLeftUpLeg.clone().sub(mixamorigRightUpLeg).normalize()

  // console.log("shoulder", skel_shoulder.clone().sub(avatar_shoulder))
  // // console.log("right_flank", skel_right_flank.clone().sub(avatar_right_flank))
  // // console.log("left_flank", skel_left_flank.clone().sub(avatar_left_flank))
  // console.log("hip", skel_hip.clone().sub(avatar_hip))

  const sum_torso = skel_shoulder.clone().sub(avatar_shoulder).length() + skel_hip.clone().sub(avatar_hip).length()



  // rightArm
  const skel_right_arm = right_elbow.clone().sub(right_shoulder).normalize()
  const skel_right_foreArm = right_index.clone().sub(right_elbow).normalize()

  const avatar_right_arm = mixamorigRightForeArm.clone().sub(mixamorigRightArm).normalize()
  const avatar_right_foreArm = mixamorigRightHand.clone().sub(mixamorigRightForeArm).normalize()

  // console.log("right_arm", skel_right_arm.clone().dot(avatar_right_arm))
  // console.log("right_foreArm", skel_right_foreArm.clone().dot(avatar_right_foreArm))


  // leftArm
  const skel_left_arm = left_elbow.clone().sub(left_shoulder).normalize()
  const skel_left_foreArm = left_index.clone().sub(left_elbow).normalize()

  const avatar_left_arm = mixamorigLeftForeArm.clone().sub(mixamorigLeftArm).normalize()
  const avatar_left_foreArm = mixamorigLeftHand.clone().sub(mixamorigLeftForeArm).normalize()

  // console.log("left_arm", skel_left_arm.clone().dot(avatar_left_arm))
  // console.log("left_foreArm", skel_left_foreArm.clone().dot(avatar_left_foreArm))



  const sum_arms = skel_right_arm.clone().sub(avatar_right_arm).length() + skel_right_foreArm.clone().sub(avatar_right_foreArm).length()
                  + skel_left_arm.clone().sub(avatar_left_arm).length() + skel_left_foreArm.clone().sub(avatar_left_foreArm).length()


  // rightLeg
  const skel_right_upLeg = right_knee.clone().sub(right_hip).normalize()
  const skel_right_leg = right_foot_index.clone().sub(right_knee).normalize()

  const avatar_right_upLeg = mixamorigRightLeg.clone().sub(mixamorigRightUpLeg).normalize()
  const avatar_right_leg = mixamorigRightToeBase.clone().sub(mixamorigRightLeg).normalize()


  // console.log("RightLeg", bones["mixamorigRightLeg"].position.clone().sub(bones["mixamorigRightUpLeg"].position))

  // console.log("right_upLeg", skel_right_upLeg)
  // console.log("right_upLeg", avatar_right_upLeg)
  // console.log("right_upLeg", skel_right_upLeg.clone().sub(avatar_right_upLeg))
  // console.log("right_leg", skel_right_leg.clone().sub(avatar_right_leg))


  // leftLeg
  const skel_left_upLeg = left_knee.clone().sub(left_hip).normalize()
  const skel_left_leg = left_foot_index.clone().sub(left_knee).normalize()

  const avatar_left_upLeg = mixamorigLeftLeg.clone().sub(mixamorigLeftUpLeg).normalize()
  const avatar_left_leg = mixamorigLeftToeBase.clone().sub(mixamorigLeftLeg).normalize()

  // console.log("left_upLeg", skel_left_upLeg.clone().dot(avatar_left_upLeg))
  // console.log("left_leg", skel_left_leg.clone().dot(avatar_left_leg))

  const sum_legs = skel_right_upLeg.clone().sub(avatar_right_upLeg).length() + skel_right_leg.clone().sub(avatar_right_leg).length()
                  + skel_left_upLeg.clone().sub(avatar_left_upLeg).length() + skel_left_leg.clone().sub(avatar_left_leg).length()


  console.log("sum_torso", sum_torso)
  console.log("sum_arms", sum_arms)
  console.log("sum_legs", sum_legs)
  console.log("sum_total", sum_torso+sum_arms+sum_legs)


  var lowestHeight = 1000.0
  for (var key in bones) {
    if(lowestHeight > bones[key].matrixWorld.elements[13])
    {
      lowestHeight = bones[key].matrixWorld.elements[13]
    }
  }
  const offset = new THREE.Vector3(0, -lowestHeight*100.0, 0)
  bones["mixamorigHips"].position.add(offset)

}


function animate() {
  requestAnimationFrame(animate);
  const quaternion = new THREE.Quaternion();
  // setRotation(
  //   "mixamorigLeftArm",
  //   quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
  // );

  setModelPoseQuaterion()
  renderer.render(scene, threeCamera);
}

async function app() {
  // Gui content will change depending on which model is in the query string.
  // await Setup();

  // camera = await Camera.setupCamera(STATE.camera);

  // detector = await createDetector();
  renderThree();
  animate();
}
app();
