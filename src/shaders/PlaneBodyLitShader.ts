import { DiffuseShader, FullModel } from "webgl-framework";
import { RendererWithExposedMethods } from "webgl-framework/dist/types/RendererWithExposedMethods";

export class PlaneBodyLitShader extends DiffuseShader {
    // Uniforms are of type `WebGLUniformLocation`
    view_matrix: WebGLUniformLocation | undefined;
    model_matrix: WebGLUniformLocation | undefined;
    ambient: WebGLUniformLocation | undefined;
    diffuse: WebGLUniformLocation | undefined;
    lightDir: WebGLUniformLocation | undefined;
    diffuseCoef: WebGLUniformLocation | undefined;
    diffuseExponent: WebGLUniformLocation | undefined;

    // Attributes are numbers.
    rm_NormalColor: number | undefined;

    fillCode() {
        this.vertexShaderCode = `#version 300 es
            uniform vec4 lightDir;
            uniform mat4 view_matrix;
            uniform mat4 model_matrix;
            uniform mat4 view_proj_matrix;
            uniform vec4 diffuse;
            uniform vec4 ambient;
            uniform float diffuseCoef;
            uniform float diffuseExponent;

            out vec2 vTexCoord;
            out vec4 vDiffuseColor;

            in vec4 rm_Vertex;
            in uint rm_NormalColor; // Packed normal + color indices: CCCCCNNN

            const vec3 NORMALS[6] = vec3[6](
                vec3(1.0f, 0.0f, 0.0f),
                vec3(-1.0f, 0.0f, 0.0f),
                vec3(0.0f,  1.0f, 0.0f),
                vec3(0.0f,  -1.0f, 0.0f),
                vec3(0.0f,  0.0f, 1.0f),
                vec3(0.0f,  0.0f, -1.0f)
            );

            const float TEXEL_X = 1. / 32.;
            const float TEXEL_HALF_X = 1. / 64.;
            const float TEXEL_HALF_Y = 0.5;

            void main(void)
            {
               gl_Position = view_proj_matrix * rm_Vertex;

               uint normalIndex = rm_NormalColor & 7u;
               uint colorIndex = rm_NormalColor >> 3u;
               vec3 normalValue = NORMALS[normalIndex];

               vec3 vLightVec = (view_matrix * lightDir).xyz;
               vec4 normal = model_matrix * vec4(normalValue, 0.0);
               vec3 vNormal = normalize(view_matrix * normal).xyz;
               float d = pow(max(0.0, dot(vNormal, normalize(vLightVec))), diffuseExponent);
               vDiffuseColor = mix(ambient, diffuse, d * diffuseCoef);

               vTexCoord = vec2(float(colorIndex) * TEXEL_X + TEXEL_HALF_X, TEXEL_HALF_Y);
            }`;

        this.fragmentShaderCode = `#version 300 es
            precision mediump float;
            uniform sampler2D sTexture;

            in vec2 vTexCoord;
            in vec4 vDiffuseColor;
            out vec4 fragColor;

            void main(void)
            {
               fragColor = vDiffuseColor * textureLod(sTexture, vTexCoord, 0.0);
            }`;
    }

    fillUniformsAttributes() {
        super.fillUniformsAttributes();

        this.view_matrix = this.getUniform("view_matrix");
        this.model_matrix = this.getUniform("model_matrix");
        this.rm_NormalColor = this.getAttrib("rm_NormalColor");
        this.ambient = this.getUniform("ambient");
        this.diffuse = this.getUniform("diffuse");
        this.lightDir = this.getUniform("lightDir");
        this.diffuseCoef = this.getUniform("diffuseCoef");
        this.diffuseExponent = this.getUniform("diffuseExponent");
    }

    /** @inheritdoc */
    drawModel(
        renderer: RendererWithExposedMethods,
        model: FullModel,
        tx: number, ty: number, tz: number,
        rx: number, ry: number, rz: number,
        sx: number, sy: number, sz: number
    ): void {
        if (this.rm_Vertex === undefined
            || this.rm_TexCoord0 === undefined
            || this.rm_NormalColor === undefined
            || this.view_proj_matrix === undefined
            || this.view_matrix === undefined
            || this.model_matrix === undefined
        ) {
            return;
        }

        const gl = renderer.gl as WebGL2RenderingContext;

        model.bindBuffers(gl);

        gl.enableVertexAttribArray(this.rm_Vertex);
        gl.enableVertexAttribArray(this.rm_NormalColor);
        gl.vertexAttribPointer(this.rm_Vertex, 3, gl.BYTE, false, 4, 0);
        gl.vertexAttribIPointer(this.rm_NormalColor, 1, gl.UNSIGNED_BYTE, 4, 3);

        renderer.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

        gl.uniformMatrix4fv(this.view_proj_matrix, false, renderer.getMVPMatrix());
        gl.uniformMatrix4fv(this.view_matrix, false, renderer.getViewMatrix());
        gl.uniformMatrix4fv(this.model_matrix, false, renderer.getModelMatrix());
        gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);

        renderer.checkGlError("VertexLitShader glDrawElements");
    }
}
