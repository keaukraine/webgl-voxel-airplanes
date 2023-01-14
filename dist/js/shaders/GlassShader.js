"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassShader = void 0;
const webgl_framework_1 = require("webgl-framework");
class GlassShader extends webgl_framework_1.BaseShader {
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
            uniform float uTime;

            out vec2 vTexCoord;
            out vec4 vDiffuseColor;

            in vec4 rm_Vertex;
            in uint rm_Normal;

            const vec3 NORMALS[6] = vec3[6](
                vec3(1.0f, 0.0f, 0.0f),
                vec3(-1.0f, 0.0f, 0.0f),
                vec3(0.0f,  1.0f, 0.0f),
                vec3(0.0f,  -1.0f, 0.0f),
                vec3(0.0f,  0.0f, 1.0f),
                vec3(0.0f,  0.0f, -1.0f)
            );

            void main(void)
            {
               gl_Position = view_proj_matrix * rm_Vertex;

               vec3 vLightVec = (view_matrix * lightDir).xyz;
               vec4 normal = model_matrix * vec4(NORMALS[rm_Normal], 0.0);
               vec3 vNormal = normalize(view_matrix * normal).xyz; // w component of rm_Normal might be ignored, and implicitly converted to vec4 in uniform declaration
               float d = pow(max(0.0, dot(vNormal, normalize(vLightVec))), diffuseExponent); // redundant normalize() ??
               vDiffuseColor = mix(ambient, diffuse, d * diffuseCoef);

               vTexCoord = rm_Vertex.xy * 0.02;
               vTexCoord.y += uTime;
            }`;
        this.fragmentShaderCode = `#version 300 es
            precision mediump float;
            uniform sampler2D sTexture;
            uniform vec4 vColor;

            in vec2 vTexCoord;
            in vec4 vDiffuseColor;
            out vec4 fragColor;

            void main(void)
            {
               fragColor = vDiffuseColor * vColor; texture(sTexture, vTexCoord);
               fragColor += texture(sTexture, vTexCoord);
            }`;
    }
    fillUniformsAttributes() {
        this.view_matrix = this.getUniform("view_matrix");
        this.view_proj_matrix = this.getUniform("view_proj_matrix");
        this.model_matrix = this.getUniform("model_matrix");
        this.rm_Vertex = this.getAttrib("rm_Vertex");
        this.rm_Normal = this.getAttrib("rm_Normal");
        this.ambient = this.getUniform("ambient");
        this.diffuse = this.getUniform("diffuse");
        this.lightDir = this.getUniform("lightDir");
        this.diffuseCoef = this.getUniform("diffuseCoef");
        this.diffuseExponent = this.getUniform("diffuseExponent");
        this.vColor = this.getUniform("vColor");
        this.uTime = this.getUniform("uTime");
        this.sTexture = this.getUniform("sTexture");
    }
    /** @inheritdoc */
    drawModel(renderer, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
        if (this.rm_Vertex === undefined
            || this.rm_Normal === undefined
            || this.view_proj_matrix === undefined
            || this.view_matrix === undefined
            || this.model_matrix === undefined) {
            return;
        }
        const gl = renderer.gl;
        model.bindBuffers(gl);
        gl.enableVertexAttribArray(this.rm_Vertex);
        gl.enableVertexAttribArray(this.rm_Normal);
        gl.vertexAttribPointer(this.rm_Vertex, 3, gl.BYTE, false, 4, 0);
        gl.vertexAttribIPointer(this.rm_Normal, 1, gl.UNSIGNED_BYTE, 4, 3);
        renderer.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);
        gl.uniformMatrix4fv(this.view_proj_matrix, false, renderer.getMVPMatrix());
        gl.uniformMatrix4fv(this.view_matrix, false, renderer.getViewMatrix());
        gl.uniformMatrix4fv(this.model_matrix, false, renderer.getModelMatrix());
        gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3 * 2, gl.UNSIGNED_BYTE, 0);
        renderer.checkGlError("VertexLitShader glDrawElements");
    }
}
exports.GlassShader = GlassShader;
//# sourceMappingURL=GlassShader.js.map