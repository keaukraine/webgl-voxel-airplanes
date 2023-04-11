"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneBodyLitShader = void 0;
const webgl_framework_1 = require("webgl-framework");
class PlaneBodyLitShader extends webgl_framework_1.DiffuseShader {
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
            uniform sampler2D sTexture;

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

            void main(void) {
               gl_Position = view_proj_matrix * rm_Vertex;

               uint normalIndex = rm_NormalColor & 7u;
               uint colorIndex = rm_NormalColor >> 3u;
               vec3 normalValue = NORMALS[normalIndex];

               vec3 vLightVec = (view_matrix * lightDir).xyz;
               vec4 normal = model_matrix * vec4(normalValue, 0.0);
               vec3 vNormal = normalize(view_matrix * normal).xyz;
               float d = pow(max(0.0, dot(vNormal, normalize(vLightVec))), diffuseExponent);
               vDiffuseColor = mix(ambient, diffuse, d * diffuseCoef);
               vDiffuseColor *= texelFetch(sTexture, ivec2(colorIndex, 0), 0);
            }`;
        this.fragmentShaderCode = `#version 300 es
            precision mediump float;
            in vec4 vDiffuseColor;
            out vec4 fragColor;

            void main(void) {
               fragColor = vDiffuseColor;
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
    drawModel(renderer, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
        if (this.rm_Vertex === undefined
            || this.rm_TexCoord0 === undefined
            || this.rm_NormalColor === undefined
            || this.view_proj_matrix === undefined
            || this.view_matrix === undefined
            || this.model_matrix === undefined) {
            return;
        }
        const gl = renderer.gl;
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
exports.PlaneBodyLitShader = PlaneBodyLitShader;
//# sourceMappingURL=PlaneBodyLitShader.js.map