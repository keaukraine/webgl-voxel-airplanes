import { BaseShader } from "webgl-framework";
import { RendererWithExposedMethods } from "webgl-framework/dist/types/RendererWithExposedMethods";

export class WindStripeShader extends BaseShader {
    view_proj_matrix: WebGLUniformLocation | undefined;
    uColor: WebGLUniformLocation | undefined;

    fillCode() {
        this.vertexShaderCode = `#version 300 es
            precision highp float;
            uniform mat4 view_proj_matrix;

            void main() {
                const vec3 vertices[4] = vec3[4](vec3(-50.0f, -50.0f, 0.0f),
                                                  vec3( 50.0f, -50.0f, 0.0f),
                                                  vec3(-50.0f,  50.0f, 0.0f),
                                                  vec3( 50.0f,  50.0f, 0.0f));
                gl_Position = view_proj_matrix * vec4(vertices[gl_VertexID], 1.0f);
            }`;

        this.fragmentShaderCode = `#version 300 es
            precision mediump float;
            uniform vec4 uColor;
            out vec4 color;

            void main() {
                color = uColor;
            }`;
    }

    fillUniformsAttributes() {
        this.view_proj_matrix = this.getUniform("view_proj_matrix");
        this.uColor = this.getUniform("uColor");
    }

    draw(
        renderer: RendererWithExposedMethods,
        tx: number, ty: number, tz: number,
        rx: number, ry: number, rz: number,
        sx: number, sy: number, sz: number
    ): void {
        const gl = renderer.gl;
        renderer.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);
        gl.uniformMatrix4fv(this.view_proj_matrix!, false, renderer.getMVPMatrix());
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        renderer.checkGlError("WindStripeShader drawArrays");
    }
}
