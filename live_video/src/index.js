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

function animate() {
  requestAnimationFrame(animate);
  const quaternion = new THREE.Quaternion();
  setRotation(
    "mixamorigLeftArm",
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
  );
  renderer.render(scene, threeCamera);
}

async function app() {
  // Gui content will change depending on which model is in the query string.
  await Setup();

  camera = await Camera.setupCamera(STATE.camera);

  detector = await createDetector();

  await renderPrediction();

  renderThree();
  animate();
}

app();
