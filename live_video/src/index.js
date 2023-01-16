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

import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';
import * as mpPose from '@mediapipe/pose';

import * as posedetection from '@tensorflow-models/pose-detection';

import {Camera} from './camera';
import {Setup} from './option_panel';
import {STATE} from './params';

let detector, camera, stats;
let rafId;

async function createDetector() {
  const runtime = 'mediapipe'    
    
  return posedetection.createDetector(STATE.model, {
    runtime,
    modelType: STATE.modelConfig.type,
    solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
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
      poses = await detector.estimatePoses(
          camera.video,
          {maxPoses: STATE.modelConfig.maxPoses, flipHorizontal: false});
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
};

async function app() {
  // Gui content will change depending on which model is in the query string.
  await Setup();
  
  camera = await Camera.setupCamera(STATE.camera);

  detector = await createDetector();

  renderPrediction();
};

app();
