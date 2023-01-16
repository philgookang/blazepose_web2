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
import * as posedetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';

import * as params from './params';

/**
 * Records each flag's default value under the runtime environment and is a
 * constant in runtime.
 */
let TUNABLE_FLAG_DEFAULT_VALUE_MAP;


const stringValueMap = {};
let backendFolder;

export async function Setup() {  

  params.STATE.camera.sizeOption = '640 X 480';  

  params.STATE.model = posedetection.SupportedModels.BlazePose;

  params.STATE.modelConfig = {...params.BLAZEPOSE_CONFIG};

  params.STATE.backend = params.MODEL_BACKEND 

  
}

