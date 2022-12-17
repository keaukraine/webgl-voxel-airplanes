import { DiffuseShader } from "webgl-framework";
import { DrawableShader } from "webgl-framework/dist/types/DrawableShader";
export declare class DiffuseScrollingShader extends DiffuseShader implements DrawableShader {
    uUvOffset: WebGLUniformLocation | undefined;
    fillCode(): void;
    fillUniformsAttributes(): void;
}
