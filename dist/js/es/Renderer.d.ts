import { BaseRenderer, DiffuseShader } from "webgl-framework";
import { mat4, vec3 } from "gl-matrix";
declare enum Formation {
    Single = 0,
    Triangle = 1,
    LargeTriangle = 2,
    Diamond = 3,
    Cross = 4,
    Line = 5
}
export declare class Renderer extends BaseRenderer {
    private lastTime;
    private loaded;
    private fmQuad;
    private fmCloud;
    private fmPlaneBody;
    private fmPlaneGlass;
    private fmProp;
    private textureTerrain;
    private textureTargetTerrain;
    private texturePlane;
    private textureGlass;
    private textureCloud;
    private textureNoise;
    private mTriangleVerticesVignette;
    private shaderDiffuse;
    private shaderDiffuseScrollingFiltered;
    private shaderDiffuseScrollingFilteredTransition;
    private shaderPlaneBody;
    private shaderGlass;
    private shaderWindStripe;
    private customCamera;
    private Z_NEAR;
    private Z_FAR;
    private timerCamera;
    private CAMERA_PERIOD;
    private timerGroundMovement;
    private GROUND_MOVEMENT_PERIOD;
    private timerGroundMovement2;
    private GROUND2_MOVEMENT_PERIOD;
    private timerPlaneWonder1;
    private PLANE_WONDER_PERIOD1;
    private timerPlaneWonder2;
    private PLANE_WONDER_PERIOD2;
    private timerPlaneProp;
    private PLANE_PROP_PERIOD;
    private timerGlass;
    private GLASS_PERIOD;
    private timerGlass2;
    private GLASS2_PERIOD;
    private timerWind;
    private WIND_PERIOD;
    private timerWind2;
    private WIND_PERIOD2;
    private timerClouds;
    private CLOUDS_PERIOD;
    private timerPlaneTransition;
    private PLANE_TRANSITION_PERIOD;
    private timerTerrainTransition;
    private TERRAIN_TRANSITION_PERIOD;
    private cameraMode;
    protected matViewInverted: mat4;
    protected matViewInvertedTransposed: mat4;
    protected matTemp: mat4;
    protected cameraPosition: vec3;
    protected cameraRotation: vec3;
    protected tmpPosition1: [number, number, number];
    protected tmpPosition2: [number, number, number];
    protected tmpPosition3: [number, number, number];
    config: {
        planeHeight: number;
        planeBanking: number;
        planeWonderXY: number;
        planeWonderZ: number;
        propOffsetX: number;
        propOffsetY: number;
        propOffsetZ: number;
        currentPlane: number;
        currentPalette: number;
        currentTerrain: number;
        formation: Formation;
    };
    private readyCallback;
    private lightDir;
    private readonly WIND_COUNT;
    private readonly WIND_SPREAD_X;
    private readonly WIND_SPREAD_Y;
    private readonly WIND_WONDER;
    private planePresets;
    private cloudsRotation;
    private statePlane;
    private flyAwaySideDirection;
    private flyAwayForwardSpeed;
    private stateTerrain;
    private nextTerrain;
    private readonly TERRAIN_COUNT;
    constructor();
    setCustomCamera(camera: mat4 | undefined, position?: vec3, rotation?: vec3): void;
    resetCustomCamera(): void;
    onBeforeInit(): void;
    onAfterInit(): void;
    onInitError(): void;
    initShaders(): void;
    loadData(): Promise<void>;
    resizeCanvas(): void;
    changePlane(preset?: number): Promise<void>;
    changePlanePalette(preset?: number): Promise<void>;
    changeTerrain(preset?: number): Promise<void>;
    animate(): void;
    /** Calculates projection matrix */
    setCameraFOV(multiplier: number): void;
    private setPlaneState;
    private setTerrainState;
    /**
     * Calculates camera matrix.
     *
     * @param a Position in [0...1] range
     */
    private positionCamera;
    /** Issues actual draw calls */
    drawScene(): void;
    protected drawVignette(shader: DiffuseShader): void;
    private drawSceneObjects;
    private getGroundSideMovementCoefficient;
    private drawPlanes;
    private drawPlane;
    private drawWind;
    private drawTerrain;
    private swapTerrainTextures;
    private drawClouds;
    changeCameraMode(): void;
    checkGlError(operation: string): void;
    set ready(callback: () => void);
}
export {};
