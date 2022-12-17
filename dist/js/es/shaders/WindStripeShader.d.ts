import { BaseShader } from "webgl-framework";
import { RendererWithExposedMethods } from "webgl-framework/dist/types/RendererWithExposedMethods";
export declare class WindStripeShader extends BaseShader {
    view_proj_matrix: WebGLUniformLocation | undefined;
    uColor: WebGLUniformLocation | undefined;
    fillCode(): void;
    fillUniformsAttributes(): void;
    draw(renderer: RendererWithExposedMethods, tx: number, ty: number, tz: number, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number): void;
}
