/**
    * @license
    * Copyright 2023 Google LLC. All Rights Reserved.
    * Licensed under the Apache License, Version 2.0 (the "License");
    * you may not use this file except in compliance with the License.
    * You may obtain a copy of the License at
    *
    * http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    * =============================================================================
    */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@mediapipe/pose'), require('@tensorflow/tfjs-core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@mediapipe/pose', '@tensorflow/tfjs-core'], factory) :
    (global = global || self, factory(global.poseDetection = {}, global.globalThis, global.tf));
}(this, (function (exports, pose, tf) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

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
    // Don't change the order. The order needs to be consistent with the model
    // keypoint result list.
    var BLAZEPOSE_KEYPOINTS = [
        'nose',
        'left_eye_inner',
        'left_eye',
        'left_eye_outer',
        'right_eye_inner',
        'right_eye',
        'right_eye_outer',
        'left_ear',
        'right_ear',
        'mouth_left',
        'mouth_right',
        'left_shoulder',
        'right_shoulder',
        'left_elbow',
        'right_elbow',
        'left_wrist',
        'right_wrist',
        'left_pinky',
        'right_pinky',
        'left_index',
        'right_index',
        'left_thumb',
        'right_thumb',
        'left_hip',
        'right_hip',
        'left_knee',
        'right_knee',
        'left_ankle',
        'right_ankle',
        'left_heel',
        'right_heel',
        'left_foot_index',
        'right_foot_index'
    ];
    var BLAZEPOSE_KEYPOINTS_BY_SIDE = {
        left: [1, 2, 3, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
        right: [4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32],
        middle: [0]
    };
    var BLAZEPOSE_CONNECTED_KEYPOINTS_PAIRS = [
        [0, 1], [0, 4], [1, 2], [2, 3], [3, 7], [4, 5],
        [5, 6], [6, 8], [9, 10], [11, 12], [11, 13], [11, 23],
        [12, 14], [14, 16], [12, 24], [13, 15], [15, 17], [16, 18],
        [16, 20], [15, 17], [15, 19], [15, 21], [16, 22], [17, 19],
        [18, 20], [23, 25], [23, 24], [24, 26], [25, 27], [26, 28],
        [27, 29], [28, 30], [27, 31], [28, 32], [29, 31], [30, 32]
    ];

    function toNumber(value) {
        return value instanceof SVGAnimatedLength ? value.baseVal.value : value;
    }
    /**
     * Converts input image to an HTMLCanvasElement. Note that converting
     * back from the output of this function to imageData or a Tensor will be lossy
     * due to premultiplied alpha color values. For more details please reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData#data_loss_due_to_browser_optimization
     * @param image Input image.
     *
     * @returns Converted HTMLCanvasElement.
     */
    function toHTMLCanvasElementLossy(image) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canvas = document.createElement('canvas');
                        if (!(image instanceof tf.Tensor)) return [3 /*break*/, 2];
                        return [4 /*yield*/, tf.browser.toPixels(image, canvas)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        canvas.width = toNumber(image.width);
                        canvas.height = toNumber(image.height);
                        ctx = canvas.getContext('2d');
                        if (image instanceof ImageData) {
                            ctx.putImageData(image, 0, 0);
                        }
                        else {
                            ctx.drawImage(image, 0, 0);
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, canvas];
                }
            });
        });
    }
    /**
     * Converts input image to ImageData. Note that converting
     * from a CanvasImageSource will be lossy due to premultiplied alpha color
     * values. For more details please reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData#data_loss_due_to_browser_optimization
     * @param image Input image.
     *
     * @returns Converted ImageData.
     */
    function toImageDataLossy(image) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, height, width, _b, canvas, ctx;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(image instanceof tf.Tensor)) return [3 /*break*/, 2];
                        _a = image.shape.slice(0, 2), height = _a[0], width = _a[1];
                        _b = ImageData.bind;
                        return [4 /*yield*/, tf.browser.toPixels(image)];
                    case 1: return [2 /*return*/, new (_b.apply(ImageData, [void 0, _c.sent(), width, height]))()];
                    case 2:
                        canvas = document.createElement('canvas');
                        ctx = canvas.getContext('2d');
                        canvas.width = toNumber(image.width);
                        canvas.height = toNumber(image.height);
                        ctx.drawImage(image, 0, 0);
                        return [2 /*return*/, ctx.getImageData(0, 0, canvas.width, canvas.height)];
                }
            });
        });
    }
    /**
     * Converts input image to Tensor. Note that converting
     * from a CanvasImageSource will be lossy due to premultiplied alpha color
     * values. For more details please reference:
     * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData#data_loss_due_to_browser_optimization
     * @param image Input image.
     *
     * @returns Converted Tensor.
     */
    function toTensorLossy(image) {
        return __awaiter(this, void 0, void 0, function () {
            var pixelsInput, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(image instanceof SVGImageElement || image instanceof OffscreenCanvas)) return [3 /*break*/, 2];
                        return [4 /*yield*/, toHTMLCanvasElementLossy(image)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = image;
                        _b.label = 3;
                    case 3:
                        pixelsInput = _a;
                        return [2 /*return*/, tf.browser.fromPixels(pixelsInput, 4)];
                }
            });
        });
    }
    function assertMaskValue(maskValue) {
        if (maskValue < 0 || maskValue >= 256) {
            throw new Error("Mask value must be in range [0, 255] but got ".concat(maskValue));
        }
        if (!Number.isInteger(maskValue)) {
            throw new Error("Mask value must be an integer but got ".concat(maskValue));
        }
    }

    var DEFAULT_BLAZEPOSE_MODEL_CONFIG = {
        runtime: 'mediapipe',
        enableSmoothing: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        modelType: 'full'
    };

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
    function validateModelConfig(modelConfig) {
        if (modelConfig == null) {
            return __assign({}, DEFAULT_BLAZEPOSE_MODEL_CONFIG);
        }
        var config = __assign({}, modelConfig);
        config.runtime = 'mediapipe';
        if (config.enableSegmentation == null) {
            config.enableSegmentation =
                DEFAULT_BLAZEPOSE_MODEL_CONFIG.enableSegmentation;
        }
        if (config.enableSmoothing == null) {
            config.enableSmoothing = DEFAULT_BLAZEPOSE_MODEL_CONFIG.enableSmoothing;
        }
        if (config.smoothSegmentation == null) {
            config.smoothSegmentation =
                DEFAULT_BLAZEPOSE_MODEL_CONFIG.smoothSegmentation;
        }
        if (config.modelType == null) {
            config.modelType = DEFAULT_BLAZEPOSE_MODEL_CONFIG.modelType;
        }
        return config;
    }

    var BlazePoseMediaPipeMask = /** @class */ (function () {
        function BlazePoseMediaPipeMask(mask) {
            this.mask = mask;
        }
        BlazePoseMediaPipeMask.prototype.toCanvasImageSource = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.mask];
                });
            });
        };
        BlazePoseMediaPipeMask.prototype.toImageData = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, toImageDataLossy(this.mask)];
                });
            });
        };
        BlazePoseMediaPipeMask.prototype.toTensor = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, toTensorLossy(this.mask)];
                });
            });
        };
        BlazePoseMediaPipeMask.prototype.getUnderlyingType = function () {
            return 'canvasimagesource';
        };
        return BlazePoseMediaPipeMask;
    }());
    function maskValueToLabel(maskValue) {
        assertMaskValue(maskValue);
        return 'person';
    }
    /**
     * MediaPipe detector class.
     */
    var BlazePoseMediaPipeDetector = /** @class */ (function () {
        // Should not be called outside.
        function BlazePoseMediaPipeDetector(config) {
            var _this = this;
            // This will be filled out by asynchronous calls to onResults. They will be
            // stable after `await send` is called on the pose solution.
            this.width = 0;
            this.height = 0;
            this.selfieMode = false;
            this.poseSolution = new pose.Pose({
                locateFile: function (path, base) {
                    if (config.solutionPath) {
                        var solutionPath = config.solutionPath.replace(/\/+$/, '');
                        return "".concat(solutionPath, "/").concat(path);
                    }
                    return "".concat(base, "/").concat(path);
                }
            });
            var modelComplexity;
            switch (config.modelType) {
                case 'lite':
                    modelComplexity = 0;
                    break;
                case 'heavy':
                    modelComplexity = 2;
                    break;
                case 'full':
                default:
                    modelComplexity = 1;
                    break;
            }
            this.poseSolution.setOptions({
                modelComplexity: modelComplexity,
                smoothLandmarks: config.enableSmoothing,
                enableSegmentation: config.enableSegmentation,
                smoothSegmentation: config.smoothSegmentation,
                selfieMode: this.selfieMode,
            });
            this.poseSolution.onResults(function (results) {
                _this.height = results.image.height;
                _this.width = results.image.width;
                if (results.poseLandmarks == null) {
                    _this.poses = [];
                }
                else {
                    var pose_1 = _this.translateOutput(results.poseLandmarks, results.poseWorldLandmarks);
                    if (results.segmentationMask) {
                        pose_1.segmentation = {
                            maskValueToLabel: maskValueToLabel,
                            mask: new BlazePoseMediaPipeMask(results.segmentationMask)
                        };
                    }
                    _this.poses = [pose_1];
                }
            });
        }
        BlazePoseMediaPipeDetector.prototype.translateOutput = function (pose, pose3D) {
            var _this = this;
            var output = {
                keypoints: pose.map(function (landmark, i) { return ({
                    x: landmark.x * _this.width,
                    y: landmark.y * _this.height,
                    z: landmark.z,
                    score: landmark.visibility,
                    name: BLAZEPOSE_KEYPOINTS[i]
                }); })
            };
            if (pose3D != null) {
                output.keypoints3D = pose3D.map(function (landmark, i) { return ({
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z,
                    score: landmark.visibility,
                    name: BLAZEPOSE_KEYPOINTS[i]
                }); });
            }
            return output;
        };
        /**
         * Estimates poses for an image or video frame.
         *
         * It returns a single pose or multiple poses based on the maxPose parameter
         * from the `config`.
         *
         * @param image
         * ImageData|HTMLImageElement|HTMLCanvasElement|HTMLVideoElement The input
         * image to feed through the network.
         *
         * @param config Optional.
         *       maxPoses: Optional. Max number of poses to estimate.
         *       When maxPoses = 1, a single pose is detected, it is usually much
         *       more efficient than maxPoses > 1. When maxPoses > 1, multiple poses
         *       are detected.
         *
         *       flipHorizontal: Optional. Default to false. When image data comes
         *       from camera, the result has to flip horizontally.
         *
         *       enableSmoothing: Optional. Default to true. Smooth pose landmarks
         *       coordinates and visibility scores to reduce jitter.
         *
         * @param timestamp Optional. In milliseconds. This is useful when image is
         *     a tensor, which doesn't have timestamp info. Or to override timestamp
         *     in a video.
         *
         * @return An array of `Pose`s.
         */
        BlazePoseMediaPipeDetector.prototype.estimatePoses = function (image, estimationConfig, timestamp) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (estimationConfig && estimationConfig.flipHorizontal &&
                                (estimationConfig.flipHorizontal !== this.selfieMode)) {
                                this.selfieMode = estimationConfig.flipHorizontal;
                                this.poseSolution.setOptions({
                                    selfieMode: this.selfieMode,
                                });
                            }
                            if (!(image instanceof tf.Tensor)) return [3 /*break*/, 2];
                            _b = ImageData.bind;
                            return [4 /*yield*/, tf.browser.toPixels(image)];
                        case 1:
                            _a = new (_b.apply(ImageData, [void 0, _c.sent(), image.shape[1], image.shape[0]]))();
                            return [3 /*break*/, 3];
                        case 2:
                            _a = image;
                            _c.label = 3;
                        case 3:
                            // Cast to GL TexImageSource types.
                            image = _a;
                            return [4 /*yield*/, this.poseSolution.send({ image: image }, timestamp)];
                        case 4:
                            _c.sent();
                            return [2 /*return*/, this.poses];
                    }
                });
            });
        };
        BlazePoseMediaPipeDetector.prototype.dispose = function () {
            this.poseSolution.close();
        };
        BlazePoseMediaPipeDetector.prototype.reset = function () {
            this.poseSolution.reset();
        };
        BlazePoseMediaPipeDetector.prototype.initialize = function () {
            return this.poseSolution.initialize();
        };
        return BlazePoseMediaPipeDetector;
    }());
    /**
     * Loads the MediaPipe solution.
     *
     * @param modelConfig ModelConfig object that contains parameters for
     * the BlazePose loading process. Please find more details of each parameters
     * in the documentation of the `BlazePoseMediaPipeModelConfig` interface.
     */
    function load(modelConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var config, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = validateModelConfig(modelConfig);
                        result = new BlazePoseMediaPipeDetector(config);
                        return [4 /*yield*/, result.initialize()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    }

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
    /**
     * Create a pose detector instance.
     *
     * @param model The name of the pipeline to load.
     */
    function createDetector(model, modelConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var config, runtime;
            return __generator(this, function (_a) {
                config = modelConfig;
                if (config != null) {
                    if (config.runtime === 'mediapipe') {
                        return [2 /*return*/, load(modelConfig)];
                    }
                    runtime = config.runtime;
                }
                throw new Error("Expect modelConfig.runtime to be either 'tfjs' " +
                    "or 'mediapipe', but got ".concat(runtime));
            });
        });
    }

    (function (SupportedModels) {
        SupportedModels["MoveNet"] = "MoveNet";
        SupportedModels["BlazePose"] = "BlazePose";
        SupportedModels["PoseNet"] = "PoseNet";
    })(exports.SupportedModels || (exports.SupportedModels = {}));

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
    (function (TrackerType) {
        TrackerType["Keypoint"] = "keypoint";
        TrackerType["BoundingBox"] = "boundingBox";
    })(exports.TrackerType || (exports.TrackerType = {}));

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
    function getKeypointIndexBySide(model) {
        return BLAZEPOSE_KEYPOINTS_BY_SIDE;
    }
    function getAdjacentPairs(model) {
        return BLAZEPOSE_CONNECTED_KEYPOINTS_PAIRS;
    }
    function getKeypointIndexByName(model) {
        return BLAZEPOSE_KEYPOINTS.reduce(function (map, name, i) {
            map[name] = i;
            return map;
        }, {});
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        getKeypointIndexBySide: getKeypointIndexBySide,
        getAdjacentPairs: getAdjacentPairs,
        getKeypointIndexByName: getKeypointIndexByName
    });

    function keypointsToNormalizedKeypoints(keypoints, imageSize) {
        return keypoints.map(function (keypoint) {
            var normalizedKeypoint = __assign(__assign({}, keypoint), { x: keypoint.x / imageSize.width, y: keypoint.y / imageSize.height });
            if (keypoint.z != null) {
                // Scale z the same way as x (using image width).
                keypoint.z = keypoint.z / imageSize.width;
            }
            return normalizedKeypoint;
        });
    }

    var calculators = { keypointsToNormalizedKeypoints: keypointsToNormalizedKeypoints };
    // MoveNet model types.

    exports.calculators = calculators;
    exports.createDetector = createDetector;
    exports.util = util;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
