import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import Stats from "three/examples/jsm/libs/stats.module";
import fetch from 'node-fetch'
// globalThis.fetch = fetch

const modelPath = require("../models/YBot.fbx");

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

/*
0: nose
1: left_eye_inner
2: left_eye
3: left_eye_outer
4: right_eye_inner
5: right_eye
6: right_eye_outer
7: left_ear
8: right_ear
9: mouth_left
10: mouth_right
11: left_shoulder
12: right_shoulder
13: left_elbow
14: right_elbow
15: left_wrist
16: right_wrist
17: left_pinky
18: right_pinky
19: left_index
20: right_index
21: left_thumb
22: right_thumb
23: left_hip
24: right_hip
25: left_knee
26: right_knee
27: left_ankle
28: right_ankle
29: left_heel
30: right_heel
31: left_foot_index
32: right_foot_index
33: bodyCenter
34: forehead
35: leftThumb
36: leftHand
37: rightThumb
38: rightHand
*/



let poseIndex = 0;
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
    const center = (p1.add(p2)).multiplyScalar(0.5);
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
    const local_v2 = v2.applyMatrix4(parentInverseTransform)
    quaternion.setFromUnitVectors(v1, local_v2);
    const curT = new THREE.Matrix4()
    curT.makeRotationFromQuaternion(quaternion)
    const inverse_curT = curT.clone().invert().multiply(parentInverseTransform)


    return [applyRotOffset(quaternion), inverse_curT]
  };





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






  async setModelPoseQuaterion()
  {
    console.log("bones", this.bones);
  
    poseIndex++;
    if (poseIndex > 119 - 1) {
      poseIndex = 0;
    }
    poseIndex = 70;
    console.log("poseIndex", poseIndex);

    const res = await (await fetch('/json/litness-data/1.squat/1.squat_'+String(poseIndex)+'.json')).json();

    const pos = res.pose
    console.log("pos", pos);






    const TestQuaternion = new THREE.Quaternion()
    TestQuaternion.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI/2.0)
    // TestQuaternion.setFromAxisAngle(new THREE.Vector3(0.0,1.0,0.0).applyQuaternion(offsetQuaternion), 3.14/2.0)

    // console.log(TestQuaternion)
    // console.log(offsetQuaternion.multiply(TestQuaternion).multiply(offsetQuaternion.invert()))
    this.setRotation("mixamorigRightArm", (TestQuaternion));

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


    const pelivs = getCenter(left_hip, right_hip)

    const neck = getCenter(left_shoulder, right_shoulder)
    const head = getCenter(left_ear, right_ear)

    const left_hand = getCenter(left_pinky, left_index)
    const right_hand = getCenter(right_pinky, right_index)


    const HipsT = new THREE.Matrix4()
    const Hips_x = left_hip.clone().sub(right_hip).normalize()
    const Hips_y = neck.clone().sub(pelivs).normalize()
    const Hips_z = Hips_x.clone().cross(Hips_y).normalize()
    const new_Hips_x = Hips_y.clone().cross(Hips_z).normalize()

    HipsT.makeBasis(new_Hips_x, Hips_y, Hips_z)
    const HipsQuaternion = new THREE.Quaternion()

    HipsQuaternion.setFromRotationMatrix(HipsT)
    this.setRotation("mixamorigHips", HipsQuaternion);

    const inverse_HipsT = HipsT.clone().invert()

    var QT;


    var SpineT = new THREE.Matrix4()
    const Spine_x = left_shoulder.clone().sub(right_shoulder).normalize()
    const Spine_y = neck.clone().sub(pelivs).normalize()
    const Spine_z = Spine_x.clone().cross(Spine_y).normalize()
    const new_Spine_x = Spine_y.clone().cross(Spine_z).normalize()

    SpineT.makeBasis(new_Spine_x, Spine_y, Spine_z)

    const localSpineT = inverse_HipsT.clone().multiply(SpineT)

    const SpineQuaternion = new THREE.Quaternion()

    SpineQuaternion.setFromRotationMatrix(localSpineT)
    const inverse_SpineT = SpineT.invert()

    const identityT = new THREE.Matrix4()
    // identityT.indentity()

    // mixamorigSpine
    // QT = getJointQuaternionAndInversedTransform(TposeAxis.Spine, 
    //                                             (neckLower.clone().sub(spine).normalize()), 
    //                                             inverse_HipsT)
    this.setRotation("mixamorigSpine2", applyRotOffset(SpineQuaternion));
    // const inverse_SpineT = QT[1];


    // mixamorigNeck
    QT = getJointQuaternionAndInversedTransform(TposeAxis.Neck, 
                                                (head.clone().sub(neck).normalize()), 
                                                inverse_SpineT)
    this.setRotation("mixamorigNeck", QT[0]);
    const inverse_NeckT = QT[1];

    // // mixamorigHead
    // QT = getJointQuaternionAndInversedTransform(TposeAxis.Head, 
    //                                             (headTop.clone().sub(neckUpper).normalize()), 
    //                                             inverse_NeckT)
    // setRotation("mixamorigHead", QT[0]);

    const inverse_RightShoulderT = inverse_NeckT;
    const inverse_LeftShoulderT = inverse_NeckT;

    // mixamorigRightArm
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightArm, 
                                                (right_elbow.clone().sub(right_shoulder).normalize()), 
                                                inverse_RightShoulderT)
    this.setRotation("mixamorigRightArm", QT[0]);
    const inverse_RightArmT = QT[1];


    // mixamorigRightForeArm
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightForeArm, 
                                                (right_wrist.clone().sub(right_elbow).normalize()), 
                                                inverse_RightArmT)
    this.setRotation("mixamorigRightForeArm", QT[0]);
    const inverse_RightForeArmT = QT[1];

    // mixamorigRightHand
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightHand, 
                                                (right_hand.clone().sub(right_wrist).normalize()), 
                                                inverse_RightForeArmT)
    this.setRotation("mixamorigRightHand", QT[0]);


    // mixamorigLeftArm
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftArm, 
                                                (left_elbow.clone().sub(left_shoulder).normalize()), 
                                                inverse_LeftShoulderT)
    this.setRotation("mixamorigLeftArm", QT[0]);
    const inverse_LeftArmT = QT[1];
    console.log("leftArm", left_elbow.clone().sub(left_shoulder).normalize())


    // mixamorigLeftForeArm
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftForeArm, 
                                                (left_wrist.clone().sub(left_elbow).normalize()), 
                                                inverse_LeftArmT)
    this.setRotation("mixamorigLeftForeArm", QT[0]);
    const inverse_LeftForeArmT = QT[1];


    // mixamorigLeftHand
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftHand, 
                                                (left_hand.clone().sub(left_wrist).normalize()), 
                                                inverse_LeftForeArmT)
    this.setRotation("mixamorigLeftHand", QT[0]);

    // mixamorigRightUpLeg
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightUpLeg, 
                                                (right_knee.clone().sub(right_hip).normalize()), 
                                                // (new THREE.Vector3(0.0,0.0,-1.0)), 
                                                inverse_HipsT)
    this.setRotation("mixamorigRightUpLeg", QT[0]);
    const inverse_RightUpLegT = QT[1];


    // mixamorigRightLeg
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightLeg, 
                                                (right_ankle.clone().sub(right_knee).normalize()), 
                                                inverse_RightUpLegT)
    this.setRotation("mixamorigRightLeg", QT[0]);
    const inverse_RightLegT = QT[1];

    // mixamorigRightFoot
    QT = getJointQuaternionAndInversedTransform(TposeAxis.RightFoot, 
                                                (right_foot_index.clone().sub(right_ankle).normalize()), 
                                                inverse_RightLegT)
    this.setRotation("mixamorigRightFoot", QT[0]);


    // mixamorigLeftUpLeg
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftUpLeg, 
                                                (left_knee.clone().sub(left_hip).normalize()), 
                                                inverse_HipsT)
    this.setRotation("mixamorigLeftUpLeg", QT[0]);
    const inverse_LeftUpLegT = QT[1];


    // mixamorigLeftLeg
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftLeg, 
                                                (left_ankle.clone().sub(left_knee).normalize()), 
                                                inverse_LeftUpLegT)
    this.setRotation("mixamorigLeftLeg", QT[0]);
    const inverse_LeftLegT = QT[1];

    // mixamorigLeftFoot
    QT = getJointQuaternionAndInversedTransform(TposeAxis.LeftFoot, 
                                                (left_foot_index.clone().sub(left_ankle).normalize()), 
                                                inverse_LeftLegT)
    this.setRotation("mixamorigLeftFoot", QT[0]);

    // console.log("left foot index", left_foot_index)
    // console.log("left ankle", left_ankle)

    var lowestHeight = 1000.0
    for (var key in this.bones) {
      if(lowestHeight > this.bones[key].matrixWorld.elements[13])
      {
        lowestHeight = this.bones[key].matrixWorld.elements[13]
      }
    }

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

        const skeleton = new THREE.SkeletonHelper(fbx);
        skeleton.visible = true; // show skeleton
        this.scene.add(skeleton);

        this.setModelPoseQuaterion();

        // const TestQuaternion = new THREE.Quaternion()
        // TestQuaternion.setFromAxisAngle(new THREE.Vector3(1.0,0.0,0.0), Math.PI/2.0)
        // this.setRotation("mixamorigRightUpLeg", (TestQuaternion));


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
