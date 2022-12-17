"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffuseScrollingShader = void 0;
const webgl_framework_1 = require("webgl-framework");
class DiffuseScrollingShader extends webgl_framework_1.DiffuseShader {
    fillCode() {
        this.vertexShaderCode = `precision highp float;
            uniform mat4 view_proj_matrix;
            attribute vec4 rm_Vertex;
            attribute vec2 rm_TexCoord0;
            varying vec2 vTextureCoord;

            void main() {
              gl_Position = view_proj_matrix * rm_Vertex;
              vTextureCoord = rm_TexCoord0;
            }`;
        this.fragmentShaderCode = `precision highp float;
            varying vec2 vTextureCoord;
            uniform lowp sampler2D sTexture;
            uniform vec3 uUvOffset; // xy - offset, z - scale

            void main() {
                gl_FragColor = texture2D(sTexture, vTextureCoord * uUvOffset.z + uUvOffset.xy);
            }`;
    }
    fillUniformsAttributes() {
        super.fillUniformsAttributes();
        this.uUvOffset = this.getUniform("uUvOffset");
    }
}
exports.DiffuseScrollingShader = DiffuseScrollingShader;
//# sourceMappingURL=DiffuseScrollingShader.js.map