"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const webgl_framework_1 = require("webgl-framework");
const gl_matrix_1 = require("gl-matrix");
const CameraMode_1 = require("./CameraMode");
const PlaneBodyLitShader_1 = require("./shaders/PlaneBodyLitShader");
const GlassShader_1 = require("./shaders/GlassShader");
const DiffuseScrollingFilteredShader_1 = require("./shaders/DiffuseScrollingFilteredShader");
const DiffuseScrollingFilteredTransitionShader_1 = require("./shaders/DiffuseScrollingFilteredTransitionShader");
const WindStripeShader_1 = require("./shaders/WindStripeShader");
const FOV_LANDSCAPE = 25.0;
const FOV_PORTRAIT = 35.0;
var PlaneState;
(function (PlaneState) {
    PlaneState[PlaneState["NORMAL"] = 0] = "NORMAL";
    PlaneState[PlaneState["FLY_AWAY"] = 1] = "FLY_AWAY";
    PlaneState[PlaneState["FLY_IN"] = 2] = "FLY_IN";
})(PlaneState || (PlaneState = {}));
var TerrainState;
(function (TerrainState) {
    TerrainState[TerrainState["NORMAL"] = 0] = "NORMAL";
    TerrainState[TerrainState["TRANSITION"] = 1] = "TRANSITION";
})(TerrainState || (TerrainState = {}));
var Formation;
(function (Formation) {
    Formation[Formation["Single"] = 0] = "Single";
    Formation[Formation["Triangle"] = 1] = "Triangle";
    Formation[Formation["LargeTriangle"] = 2] = "LargeTriangle";
    Formation[Formation["Diamond"] = 3] = "Diamond";
    Formation[Formation["Cross"] = 4] = "Cross";
    Formation[Formation["Line"] = 5] = "Line";
})(Formation || (Formation = {}));
class Renderer extends webgl_framework_1.BaseRenderer {
    constructor() {
        super();
        this.lastTime = 0;
        this.loaded = false;
        this.fmQuad = new webgl_framework_1.FullModel();
        this.fmCloud = new webgl_framework_1.FullModel();
        this.fmPlaneBody = new webgl_framework_1.FullModel();
        this.fmPlaneGlass = new webgl_framework_1.FullModel();
        this.fmProp = new webgl_framework_1.FullModel();
        this.Z_NEAR = 100.0;
        this.Z_FAR = 2000.0;
        this.timerCamera = 0;
        this.CAMERA_PERIOD = 87000;
        this.timerGroundMovement = 0;
        this.GROUND_MOVEMENT_PERIOD = 15000 * 0.8;
        this.timerGroundMovement2 = 0;
        this.GROUND2_MOVEMENT_PERIOD = 74800 * 0.8;
        this.timerPlaneWonder1 = 0;
        this.PLANE_WONDER_PERIOD1 = 25000 * 0.993;
        this.timerPlaneWonder2 = 0;
        this.PLANE_WONDER_PERIOD2 = 6000 * 0.993;
        this.timerPlaneProp = 0;
        this.PLANE_PROP_PERIOD = 300 * 0.993;
        this.timerGlass = 0;
        this.GLASS_PERIOD = 1300;
        this.timerGlass2 = 0;
        this.GLASS2_PERIOD = 9000;
        this.timerWind = 0;
        this.WIND_PERIOD = 2500;
        this.timerWind2 = 0;
        this.WIND_PERIOD2 = 16000;
        this.timerClouds = 0;
        this.CLOUDS_PERIOD = 13000;
        this.timerPlaneTransition = 0;
        this.PLANE_TRANSITION_PERIOD = 1800;
        this.timerTerrainTransition = 0;
        this.TERRAIN_TRANSITION_PERIOD = 1500;
        this.cameraMode = CameraMode_1.CameraMode.Rotating;
        this.matViewInverted = gl_matrix_1.mat4.create();
        this.matViewInvertedTransposed = gl_matrix_1.mat4.create();
        this.matTemp = gl_matrix_1.mat4.create();
        this.cameraPosition = gl_matrix_1.vec3.create();
        this.cameraRotation = gl_matrix_1.vec3.create();
        this.tmpPosition1 = [0, 0, 0];
        this.tmpPosition2 = [0, 0, 0];
        this.tmpPosition3 = [0, 0, 0];
        this.config = {
            planeHeight: 100,
            planeBanking: 0.25,
            planeWonderXY: 4,
            planeWonderZ: 6,
            propOffsetX: 33,
            propOffsetY: 12,
            propOffsetZ: 4,
            currentPlane: 0,
            currentPalette: 2,
            currentTerrain: 0,
            formation: Formation.Triangle
        };
        this.lightDir = gl_matrix_1.vec3.create();
        this.WIND_COUNT = 10;
        this.WIND_SPREAD_X = 300;
        this.WIND_SPREAD_Y = 1000;
        this.WIND_WONDER = 180;
        this.planePresets = [
            {
                name: "01",
                banking: 0.7,
                props: [
                    [19, 19, 7.5],
                    [-19, 19, 7.5]
                ]
            },
            {
                name: "02",
                banking: 1.0,
                props: [
                    [0, 31.5, 12.5]
                ]
            },
            {
                name: "03",
                banking: 0.2,
                props: [
                    [21, 29, 8],
                    [-21, 29, 8]
                ]
            },
            {
                name: "05",
                banking: 0.2,
                props: [
                    [18, 15.5, 24],
                    [-18, 15.5, 24]
                ]
            },
            {
                name: "06",
                banking: 1.0,
                props: [
                    [0, 35.5, 6]
                ]
            },
            {
                name: "07",
                banking: 0.2,
                props: [
                    [0, 35.5, -3]
                ]
            },
            {
                name: "08",
                banking: 0.2,
                props: [
                    [19, 11.5, 1],
                    [-19, 11.5, 1]
                ]
            },
            {
                name: "09",
                banking: 0.1,
                props: [
                    [24, 18.5, -1],
                    [-24, 18.5, -1]
                ]
            },
            {
                name: "10",
                banking: 0.8,
                props: [
                    [21, 12.5, 0],
                    [-21, 12.5, 0]
                ]
            },
        ];
        this.cloudsRotation = 0;
        this.statePlane = PlaneState.FLY_IN;
        this.flyAwaySideDirection = -1;
        this.flyAwayForwardSpeed = 0;
        this.stateTerrain = TerrainState.NORMAL;
        this.nextTerrain = 0;
        this.TERRAIN_COUNT = 13;
        this.getGroundSideMovementCoefficient = () => Math.sin(this.timerGroundMovement2 * Math.PI * 2);
        gl_matrix_1.vec3.normalize(this.lightDir, [-1, -1, 1]);
    }
    setCustomCamera(camera, position, rotation) {
        this.customCamera = camera;
        if (position !== undefined) {
            this.cameraPosition = position;
        }
        if (rotation !== undefined) {
            this.cameraRotation = rotation;
        }
    }
    resetCustomCamera() {
        this.customCamera = undefined;
    }
    onBeforeInit() {
    }
    onAfterInit() {
    }
    onInitError() {
        var _a, _b;
        (_a = document.getElementById("canvasGL")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("alertError")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    }
    initShaders() {
        this.shaderDiffuse = new webgl_framework_1.DiffuseShader(this.gl);
        this.shaderDiffuseScrollingFiltered = new DiffuseScrollingFilteredShader_1.DiffuseScrollingFilteredShader(this.gl);
        this.shaderDiffuseScrollingFilteredTransition = new DiffuseScrollingFilteredTransitionShader_1.DiffuseScrollingFilteredTransitionShader(this.gl);
        this.shaderPlaneBody = new PlaneBodyLitShader_1.PlaneBodyLitShader(this.gl);
        this.shaderGlass = new GlassShader_1.GlassShader(this.gl);
        this.shaderWindStripe = new WindStripeShader_1.WindStripeShader(this.gl);
    }
    async loadData() {
        var _a;
        const plane = this.planePresets[this.config.currentPlane];
        await Promise.all([
            this.fmQuad.load("data/models/quad", this.gl),
            this.fmCloud.load("data/models/cloud", this.gl),
            this.fmPlaneBody.load(`data/models/${plane.name}-plane`, this.gl),
            this.fmPlaneGlass.load(`data/models/${plane.name}-glass`, this.gl),
            this.fmProp.load("data/models/prop", this.gl),
        ]);
        [
            this.textureTerrain,
            this.texturePlane,
            this.textureGlass,
            this.textureCloud,
            this.textureNoise,
        ] = await Promise.all([
            webgl_framework_1.UncompressedTextureLoader.load(`data/textures/ground${this.config.currentTerrain}.webp`, this.gl, this.gl.LINEAR, this.gl.LINEAR, false),
            webgl_framework_1.UncompressedTextureLoader.load(`data/textures/palette${this.config.currentPalette}.png`, this.gl, this.gl.NEAREST, this.gl.NEAREST, true),
            webgl_framework_1.UncompressedTextureLoader.load("data/textures/glass.png", this.gl, this.gl.NEAREST, this.gl.NEAREST, false),
            webgl_framework_1.UncompressedTextureLoader.load("data/textures/clouds.png", this.gl, this.gl.NEAREST, this.gl.NEAREST, false),
            webgl_framework_1.UncompressedTextureLoader.load("data/textures/blue-noise.png", this.gl, this.gl.NEAREST, this.gl.NEAREST, false)
        ]);
        this.loaded = true;
        console.log("Loaded all assets");
        (_a = this.readyCallback) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    resizeCanvas() {
        if (this.canvas === undefined) {
            return;
        }
        super.resizeCanvas();
    }
    async changePlane(preset) {
        var _a, _b;
        if (this.statePlane !== PlaneState.NORMAL) {
            return;
        }
        const newPreset = preset !== null && preset !== void 0 ? preset : (this.config.currentPlane + 1) % this.planePresets.length;
        const plane = this.planePresets[newPreset];
        this.setPlaneState(PlaneState.FLY_AWAY);
        const fmNewBody = (_a = plane.modelBody) !== null && _a !== void 0 ? _a : new webgl_framework_1.FullModel();
        const fmNewGlass = (_b = plane.modelGlass) !== null && _b !== void 0 ? _b : new webgl_framework_1.FullModel();
        const promises = [new Promise((resolve) => setTimeout(resolve, this.PLANE_TRANSITION_PERIOD))];
        if (plane.modelBody === undefined && plane.modelGlass === undefined) {
            promises.push(fmNewBody.load(`data/models/${plane.name}-plane`, this.gl), fmNewGlass.load(`data/models/${plane.name}-glass`, this.gl));
        }
        await Promise.all(promises);
        plane.modelBody = fmNewBody;
        plane.modelGlass = fmNewGlass;
        this.fmPlaneBody = fmNewBody;
        this.fmPlaneGlass = fmNewGlass;
        this.config.currentPlane = newPreset;
        this.setPlaneState(PlaneState.FLY_IN);
    }
    async changePlanePalette(preset) {
        const newPalette = preset !== null && preset !== void 0 ? preset : (this.config.currentPalette + 1) % 3;
        const palette = await webgl_framework_1.UncompressedTextureLoader.load(`data/textures/palette${newPalette}.png`, this.gl, this.gl.NEAREST, this.gl.NEAREST, true);
        this.gl.deleteTexture(this.texturePlane);
        this.texturePlane = palette;
        this.config.currentPalette = newPalette;
    }
    async changeTerrain(preset) {
        if (this.stateTerrain !== TerrainState.NORMAL) {
            return;
        }
        this.nextTerrain = preset !== null && preset !== void 0 ? preset : (this.config.currentTerrain + 1) % this.TERRAIN_COUNT;
        this.textureTargetTerrain = await webgl_framework_1.UncompressedTextureLoader.load(`data/textures/ground${this.nextTerrain}.webp`, this.gl, this.gl.LINEAR, this.gl.LINEAR, false);
        this.setTerrainState(TerrainState.TRANSITION);
    }
    animate() {
        const timeNow = new Date().getTime();
        if (this.lastTime != 0) {
            this.timerCamera = this.cameraMode === CameraMode_1.CameraMode.Rotating
                ? (timeNow % this.CAMERA_PERIOD) / this.CAMERA_PERIOD
                : 0.13;
            this.timerGroundMovement = (timeNow % this.GROUND_MOVEMENT_PERIOD) / this.GROUND_MOVEMENT_PERIOD;
            this.timerGroundMovement2 = (timeNow % this.GROUND2_MOVEMENT_PERIOD) / this.GROUND2_MOVEMENT_PERIOD;
            this.timerPlaneWonder1 = (timeNow % this.PLANE_WONDER_PERIOD1) / this.PLANE_WONDER_PERIOD1;
            this.timerPlaneWonder2 = (timeNow % this.PLANE_WONDER_PERIOD2) / this.PLANE_WONDER_PERIOD2;
            this.timerPlaneProp = (timeNow % this.PLANE_PROP_PERIOD) / this.PLANE_PROP_PERIOD;
            this.timerGlass = (timeNow % this.GLASS_PERIOD) / this.GLASS_PERIOD;
            this.timerGlass2 = (timeNow % this.GLASS2_PERIOD) / this.GLASS2_PERIOD;
            this.timerWind = (timeNow % this.WIND_PERIOD) / this.WIND_PERIOD;
            this.timerWind2 = (timeNow % this.WIND_PERIOD2) / this.WIND_PERIOD2;
            this.timerClouds = (timeNow % this.CLOUDS_PERIOD) / this.CLOUDS_PERIOD;
            this.timerPlaneTransition += (timeNow - this.lastTime) / this.PLANE_TRANSITION_PERIOD;
            if (this.timerPlaneTransition > 1.0) {
                this.timerPlaneTransition = 1.0;
                if (this.statePlane === PlaneState.FLY_IN) {
                    this.setPlaneState(PlaneState.NORMAL);
                }
            }
            this.timerTerrainTransition += (timeNow - this.lastTime) / this.TERRAIN_TRANSITION_PERIOD;
            if (this.timerTerrainTransition > 1.0) {
                this.timerTerrainTransition = 1.0;
                if (this.stateTerrain === TerrainState.TRANSITION) {
                    this.swapTerrainTextures();
                    this.setTerrainState(TerrainState.NORMAL);
                }
            }
        }
        this.lastTime = timeNow;
    }
    /** Calculates projection matrix */
    setCameraFOV(multiplier) {
        var ratio;
        if (this.gl.canvas.height > 0) {
            ratio = this.gl.canvas.width / this.gl.canvas.height;
        }
        else {
            ratio = 1.0;
        }
        let fov = 0;
        if (this.gl.canvas.width >= this.gl.canvas.height) {
            fov = FOV_LANDSCAPE * multiplier;
        }
        else {
            fov = FOV_PORTRAIT * multiplier;
        }
        this.setFOV(this.mProjMatrix, fov, ratio, this.Z_NEAR, this.Z_FAR);
    }
    setPlaneState(newState) {
        if (newState === PlaneState.FLY_AWAY || newState === PlaneState.FLY_IN) {
            this.timerPlaneTransition = 0;
        }
        if (newState === PlaneState.FLY_AWAY) {
            this.flyAwaySideDirection = Math.random() > 0.5 ? 1 : -1;
            this.flyAwayForwardSpeed = (Math.random() - 0.5) * 2.0;
        }
        this.statePlane = newState;
    }
    setTerrainState(newState) {
        if (newState === TerrainState.TRANSITION) {
            this.timerTerrainTransition = 0;
        }
        this.stateTerrain = newState;
    }
    /**
     * Calculates camera matrix.
     *
     * @param a Position in [0...1] range
     */
    positionCamera(a) {
        if (this.customCamera !== undefined) {
            this.mVMatrix = this.customCamera;
            return;
        }
        const sina = Math.sin(a * 6.2831852);
        const cosa = Math.cos(a * 6.2831852);
        const x = sina * 200.0 * 1.5;
        const y = cosa * 200.0 * 1.5;
        const z = 250 + (Math.sin(a * 6.2831852) * 50.0) + this.config.planeHeight;
        gl_matrix_1.mat4.lookAt(this.mVMatrix, [x, y, z], // eye
        [0, 0, this.config.planeHeight], // center
        [0, 0, 1] // up vector
        );
    }
    /** Issues actual draw calls */
    drawScene() {
        if (!this.loaded) {
            return;
        }
        this.positionCamera(this.timerCamera);
        this.setCameraFOV(1.0);
        this.gl.clearColor(0, 0.56, 0.89, 0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.positionCamera(this.timerCamera);
        this.setCameraFOV(1.0);
        this.gl.colorMask(true, true, true, true);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // This differs from OpenGL ES
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.drawSceneObjects();
    }
    drawVignette(shader) {
        this.unbindBuffers();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.mTriangleVerticesVignette);
        this.gl.enableVertexAttribArray(shader.rm_Vertex);
        this.gl.vertexAttribPointer(shader.rm_Vertex, 3, this.gl.FLOAT, false, 20, 0);
        this.gl.enableVertexAttribArray(shader.rm_TexCoord0);
        this.gl.vertexAttribPointer(shader.rm_TexCoord0, 2, this.gl.FLOAT, false, 20, 4 * 3);
        this.gl.uniformMatrix4fv(shader.view_proj_matrix, false, this.getOrthoMatrix());
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    drawSceneObjects() {
        if (this.shaderDiffuse === undefined) {
            console.log("undefined shaders");
            return;
        }
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.disable(this.gl.BLEND);
        this.drawPlanes(this.config.formation);
        this.drawTerrain();
        this.gl.depthMask(false);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_COLOR);
        this.gl.disable(this.gl.CULL_FACE);
        this.drawWind();
        this.drawClouds();
        this.gl.disable(this.gl.BLEND);
        this.gl.depthMask(true);
    }
    drawPlanes(formation) {
        this.drawPlane([0, 0, 0], 0, 0);
        switch (formation) {
            case Formation.Single:
                break;
            case Formation.LargeTriangle:
                this.drawPlane([180, -180, 0], 0.1, 0.1);
                this.drawPlane([-180, -180, 0], 0.2, 0.3);
            case Formation.Triangle:
                this.drawPlane([90, -90, 0], 0.1, 0.1);
                this.drawPlane([-90, -90, 0], 0.2, 0.3);
                break;
            case Formation.Cross:
                this.drawPlane([110, -110, 0], 0.1, 0.1);
                this.drawPlane([-110, -110, 0], 0.2, 0.3);
                this.drawPlane([-110, 110, 0], 0.1, 0);
                this.drawPlane([110, 110, 0], 0.2, 0.2);
                break;
            case Formation.Line:
                this.drawPlane([140, 0, 0], 0.1, 0.1);
                this.drawPlane([-140, 0, 0], 0.2, 0.3);
                break;
            case Formation.Diamond:
                this.drawPlane([90, -90, 0], 0.1, 0.1);
                this.drawPlane([-90, -90, 0], 0.2, 0.3);
                this.drawPlane([0, -190, 0], 0.2, 0.2);
                break;
        }
    }
    drawPlane(offset, timersOffset, timerPropOffset) {
        if (this.shaderPlaneBody === undefined || this.shaderGlass === undefined) {
            return;
        }
        const plane = this.planePresets[this.config.currentPlane];
        const time1 = (this.timerPlaneWonder1 + timersOffset) % 1.0;
        const time2 = (this.timerPlaneWonder2 + timersOffset) % 1.0;
        const timeGlass = (this.timerGlass + timersOffset) % 1.0;
        const timeGlass2 = (this.timerGlass2 + timersOffset) % 1.0;
        let x = offset[0] + Math.sin(time1 * 3 * Math.PI * 2) * this.config.planeWonderXY;
        let y = offset[1] + Math.cos(time1 * 5 * Math.PI * 2) * this.config.planeWonderXY;
        let z = offset[2] + Math.cos(time2 * Math.PI * 2) * this.config.planeWonderZ;
        let banking = this.getGroundSideMovementCoefficient() * this.config.planeBanking * plane.banking;
        if (this.statePlane === PlaneState.FLY_AWAY) {
            const c1 = Math.pow(this.timerPlaneTransition, 1.5);
            const c2 = Math.pow(this.timerPlaneTransition, 2.5);
            banking += c1 * 0.8 * this.flyAwaySideDirection;
            z += c2 * -50;
            x += c2 * 600 * this.flyAwaySideDirection;
            y += c2 * 400 * this.flyAwayForwardSpeed;
        }
        else if (this.statePlane === PlaneState.FLY_IN) {
            const c = Math.pow(1.0 - this.timerPlaneTransition, 2.5);
            z += c * 200;
            y += c * -200;
        }
        const drawProp = (propOffsetX, propOffsetY, propOffsetZ, time) => {
            let propX = Math.sin(banking + Math.PI / 2) * propOffsetX;
            let propZ = Math.cos(banking + Math.PI / 2) * propOffsetX;
            propX += Math.sin(banking) * propOffsetZ;
            propZ += Math.cos(banking) * propOffsetZ;
            this.shaderPlaneBody.drawModel(this, this.fmProp, propX + x, y + propOffsetY, propZ + z + this.config.planeHeight, 0, time * Math.PI * 2, 0, 1, 1, 1);
        };
        this.shaderGlass.use();
        this.setTexture2D(0, this.textureGlass, this.shaderGlass.sTexture);
        this.gl.uniform4f(this.shaderGlass.lightDir, this.lightDir[0], this.lightDir[1], this.lightDir[2], 0);
        this.gl.uniform4f(this.shaderGlass.ambient, 0.5, 0.5, 0.5, 0);
        this.gl.uniform4f(this.shaderGlass.diffuse, 1, 1, 1, 0);
        this.gl.uniform1f(this.shaderGlass.diffuseCoef, 1.0);
        this.gl.uniform1f(this.shaderGlass.diffuseExponent, 1.0);
        this.gl.uniform4f(this.shaderGlass.vColor, 0.6, 0.6, 1.0, 0);
        this.gl.uniform1f(this.shaderGlass.uTime, Math.sin(timeGlass2 * Math.PI * 2) > 0 ? timeGlass : 0.2);
        this.shaderGlass.drawModel(this, this.fmPlaneGlass, x, y, z + this.config.planeHeight, 0, banking, 0, 1, 1, 1);
        this.shaderPlaneBody.use();
        this.setTexture2D(0, this.texturePlane, this.shaderPlaneBody.sTexture);
        this.gl.uniform4f(this.shaderPlaneBody.lightDir, this.lightDir[0], this.lightDir[1], this.lightDir[2], 0);
        this.gl.uniform4f(this.shaderPlaneBody.ambient, 0.5, 0.5, 0.5, 0);
        this.gl.uniform4f(this.shaderPlaneBody.diffuse, 1, 1, 1, 0);
        this.gl.uniform1f(this.shaderPlaneBody.diffuseCoef, 1.0);
        this.gl.uniform1f(this.shaderPlaneBody.diffuseExponent, 1.0);
        for (let i = 0; i < plane.props.length; i++) {
            const prop = plane.props[i];
            const time = (this.timerPlaneProp + timerPropOffset + i * 0.23) % 1.0;
            drawProp(prop[0], prop[1], prop[2], time);
        }
        this.shaderPlaneBody.drawModel(this, this.fmPlaneBody, x, y, z + this.config.planeHeight, 0, banking, 0, 1, 1, 1);
    }
    drawWind() {
        if (this.shaderWindStripe === undefined) {
            return;
        }
        this.shaderWindStripe.use();
        this.gl.uniform4f(this.shaderWindStripe.uColor, 0.18, 0.18, 0.18, 1.0);
        for (let i = 0; i < this.WIND_COUNT; i++) {
            const o = (Math.sin(i / this.WIND_COUNT * Math.PI * 22) + 1) * 0.5;
            const time = (this.timerWind + i / this.WIND_COUNT) % 1.0;
            let x = -this.WIND_SPREAD_X + o * this.WIND_SPREAD_X * 2;
            x += Math.cos(this.timerWind2 * Math.PI * 2) * this.WIND_WONDER;
            const y = this.WIND_SPREAD_Y - this.WIND_SPREAD_Y * 2 * time;
            const z = this.config.planeHeight * (i % 2 ? 0.75 : 1.25);
            this.shaderWindStripe.draw(this, x, y, z, 0, 0, 0, 0.03, 0.6, 1);
        }
    }
    drawTerrain() {
        if (this.shaderDiffuseScrollingFiltered === undefined || this.shaderDiffuseScrollingFilteredTransition === undefined) {
            return;
        }
        let shader;
        if (this.stateTerrain === TerrainState.NORMAL) {
            shader = this.shaderDiffuseScrollingFiltered;
            shader.use();
        }
        else {
            shader = this.shaderDiffuseScrollingFilteredTransition;
            shader.use();
            this.setTexture2D(1, this.textureTargetTerrain, this.shaderDiffuseScrollingFilteredTransition.sTargetTexture);
            this.setTexture2D(2, this.textureNoise, this.shaderDiffuseScrollingFilteredTransition.sMaskTexture);
            this.gl.uniform1f(this.shaderDiffuseScrollingFilteredTransition.uTransition, this.timerTerrainTransition);
        }
        this.setTexture2D(0, this.textureTerrain, shader.sTexture);
        this.gl.uniform3f(shader.uUvOffset, this.getGroundSideMovementCoefficient() * 0.2, -this.timerGroundMovement, 3.8);
        shader.drawModel(this, this.fmQuad, 0, 0, 0, 0, 0, 0, 30, 30, 30);
    }
    swapTerrainTextures() {
        const texture = this.textureTerrain;
        this.gl.deleteTexture(texture);
        this.textureTerrain = this.textureTargetTerrain;
        this.textureTargetTerrain = undefined;
        this.config.currentTerrain = this.nextTerrain;
    }
    drawClouds() {
        var _a;
        if (this.shaderDiffuse === undefined) {
            return;
        }
        (_a = this.shaderDiffuse) === null || _a === void 0 ? void 0 : _a.use();
        this.setTexture2D(0, this.textureCloud, this.shaderDiffuse.sTexture);
        const time = this.timerClouds;
        if (time < 0.01) {
            this.cloudsRotation = 2.0 * Math.PI * (Math.floor(Math.random() * 4.0) / 4.0);
        }
        const x = 0;
        const y = this.WIND_SPREAD_Y - this.WIND_SPREAD_Y * 2 * time;
        const z = this.config.planeHeight * 1.7;
        this.shaderDiffuse.drawModel(this, this.fmCloud, x, y, z, 0, 0, this.cloudsRotation, 9, 9, 9);
    }
    changeCameraMode() {
        if (this.cameraMode === CameraMode_1.CameraMode.Fixed) {
            this.cameraMode = CameraMode_1.CameraMode.Rotating;
        }
        else {
            this.cameraMode = CameraMode_1.CameraMode.Fixed;
        }
    }
    checkGlError(operation) {
        // Do nothing in production build.
    }
    set ready(callback) {
        this.readyCallback = callback;
    }
}
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map