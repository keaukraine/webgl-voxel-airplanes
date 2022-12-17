"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaneBodyLitShader = void 0;
const webgl_framework_1 = require("webgl-framework");
class PlaneBodyLitShader extends webgl_framework_1.DiffuseShader {
    fillCode() {
        this.vertexShaderCode = "#version 300 es\n" +
            "uniform vec4 lightDir;\n" +
            "uniform mat4 view_matrix;\n" +
            "uniform mat4 model_matrix;\n" +
            "uniform mat4 view_proj_matrix;\n" +
            "uniform vec4 diffuse;\n" +
            "uniform vec4 ambient;\n" +
            "uniform float diffuseCoef;\n" +
            "uniform float diffuseExponent;\n" +
            "\n" +
            "out vec2 vTexCoord;\n" +
            "out vec4 vDiffuseColor;\n" +
            "\n" +
            "in float rm_TexCoord0;\n" +
            "in vec4 rm_Vertex;\n" +
            "in vec3 rm_Normal;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "   gl_Position = view_proj_matrix * rm_Vertex;\n" +
            "\n" +
            "   vec3 vLightVec = (view_matrix * lightDir).xyz;\n" +
            "   vec4 normal = model_matrix * vec4(rm_Normal, 0.0);\n" +
            "   vec3 vNormal = normalize(view_matrix * normal).xyz;\n" +
            "   float d = pow(max(0.0, dot(vNormal, normalize(vLightVec))), diffuseExponent);\n" +
            "   vDiffuseColor = mix(ambient, diffuse, d * diffuseCoef);\n" +
            "\n" +
            "   vTexCoord = vec2(rm_TexCoord0, 0.5);\n" +
            "}\n";
        this.fragmentShaderCode = "#version 300 es\n" +
            "precision mediump float;\n" +
            "uniform sampler2D sTexture;\n" +
            "\n" +
            "in vec2 vTexCoord;\n" +
            "in vec4 vDiffuseColor;\n" +
            "out vec4 fragColor;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "   fragColor = vDiffuseColor * textureLod(sTexture, vTexCoord, 0.0);\n" +
            "}\n";
    }
    fillUniformsAttributes() {
        super.fillUniformsAttributes();
        this.view_matrix = this.getUniform("view_matrix");
        this.model_matrix = this.getUniform("model_matrix");
        this.rm_Normal = this.getAttrib("rm_Normal");
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
            || this.rm_Normal === undefined
            || this.view_proj_matrix === undefined
            || this.view_matrix === undefined
            || this.model_matrix === undefined) {
            return;
        }
        const gl = renderer.gl;
        model.bindBuffers(gl);
        gl.enableVertexAttribArray(this.rm_Vertex);
        gl.enableVertexAttribArray(this.rm_TexCoord0);
        gl.enableVertexAttribArray(this.rm_Normal);
        // gl.vertexAttribPointer(this.rm_Vertex, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 0);
        // gl.vertexAttribPointer(this.rm_TexCoord0, 2, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * 3);
        // gl.vertexAttribPointer(this.rm_Normal, 3, gl.FLOAT, false, 4 * (3 + 2 + 3), 4 * 5);
        gl.vertexAttribPointer(this.rm_Vertex, 3, gl.BYTE, false, 8, 0);
        gl.vertexAttribPointer(this.rm_TexCoord0, 1, gl.UNSIGNED_BYTE, true, 8, 3);
        gl.vertexAttribPointer(this.rm_Normal, 3, gl.BYTE, true, 8, 4);
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