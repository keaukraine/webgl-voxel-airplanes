"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindShader = void 0;
const webgl_framework_1 = require("webgl-framework");
class WindShader extends webgl_framework_1.BaseShader {
    fillCode() {
        this.vertexShaderCode = `precision highp float;
            uniform mat4 view_proj_matrix;
            attribute vec4 rm_Vertex;

            void main() {
                gl_Position = view_proj_matrix * rm_Vertex;
            }`;
        this.fragmentShaderCode = `precision mediump float;
            uniform vec4 uColor;

            void main() {
                gl_FragColor = uColor;
            }`;
    }
    fillUniformsAttributes() {
        this.view_proj_matrix = this.getUniform('view_proj_matrix');
        this.rm_Vertex = this.getAttrib('rm_Vertex');
        this.uColor = this.getUniform("uColor");
    }
    /** @inheritdoc */
    drawModel(renderer, model, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
        if (this.rm_Vertex === undefined || this.view_proj_matrix === undefined) {
            return;
        }
        const gl = renderer.gl;
        model.bindBuffers(gl);
        gl.enableVertexAttribArray(this.rm_Vertex);
        gl.vertexAttribPointer(this.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2), 0);
        renderer.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);
        gl.uniformMatrix4fv(this.view_proj_matrix, false, renderer.getMVPMatrix());
        gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3, gl.UNSIGNED_SHORT, 0);
        renderer.checkGlError("DiffuseShader glDrawElements");
    }
}
exports.WindShader = WindShader;
//# sourceMappingURL=WindShader.js.map