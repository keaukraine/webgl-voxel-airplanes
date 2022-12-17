import { DiffuseScrollingFilteredShader } from "./DiffuseScrollingFilteredShader";
export declare class DiffuseScrollingFilteredTransitionShader extends DiffuseScrollingFilteredShader {
    uTransition: WebGLUniformLocation | undefined;
    sTargetTexture: WebGLUniformLocation | undefined;
    sMaskTexture: WebGLUniformLocation | undefined;
    fillCode(): void;
    fillUniformsAttributes(): void;
}
