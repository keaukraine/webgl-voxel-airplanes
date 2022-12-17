import { BaseShader, FullModel } from "webgl-framework";
import { DrawableShader } from "webgl-framework/dist/types/DrawableShader";
import { RendererWithExposedMethods } from "webgl-framework/dist/types/RendererWithExposedMethods";

export class GlassShader extends BaseShader implements DrawableShader {
    // Uniforms are of type `WebGLUniformLocation`
    view_proj_matrix: WebGLUniformLocation | undefined;
    view_matrix: WebGLUniformLocation | undefined;
    model_matrix: WebGLUniformLocation | undefined;
    ambient: WebGLUniformLocation | undefined;
    diffuse: WebGLUniformLocation | undefined;
    lightDir: WebGLUniformLocation | undefined;
    diffuseCoef: WebGLUniformLocation | undefined;
    diffuseExponent: WebGLUniformLocation | undefined;
    vColor: WebGLUniformLocation | undefined;
    uTime: WebGLUniformLocation | undefined;
    sTexture: WebGLUniformLocation | undefined;

    // Attributes are numbers.
    rm_Vertex: number | undefined;
    rm_Normal: number | undefined;

    fillCode() {
        this.vertexShaderCode =
            "\n" +
            "uniform vec4 lightDir;\n" +
            "uniform mat4 view_matrix;\n" +
            "uniform mat4 model_matrix;\n" +
            "uniform mat4 view_proj_matrix;\n" +
            "uniform vec4 diffuse;\n" +
            "uniform vec4 ambient;\n" +
            "uniform float diffuseCoef;\n" +
            "uniform float diffuseExponent;\n" +
            "uniform float uTime;\n" +
            "\n" +
            "varying vec2 vTexCoord;\n" +
            "varying vec4 vDiffuseColor;\n" +
            "\n" +
            "attribute vec4 rm_Vertex;\n" +
            "attribute vec3 rm_Normal;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "   gl_Position = view_proj_matrix * rm_Vertex;\n" +
            "\n" +
            "   vec3 vLightVec = (view_matrix * lightDir).xyz;\n" +
            "   vec4 normal = model_matrix * vec4(rm_Normal, 0.0);\n" +
            "   vec3 vNormal = normalize(view_matrix * normal).xyz;\n" + // w component of rm_Normal might be ignored, and implicitly converted to vec4 in uniform declaration
            "   float d = pow(max(0.0, dot(vNormal, normalize(vLightVec))), diffuseExponent);\n" + // redundant normalize() ??
            "   vDiffuseColor = mix(ambient, diffuse, d * diffuseCoef);\n" +
            "\n" +
            "   vTexCoord = rm_Vertex.xy * 0.02;\n" +
            "   vTexCoord.y += uTime;\n" +
            "}\n";

        this.fragmentShaderCode =
            "precision mediump float;\n" +
            "uniform sampler2D sTexture;\n" +
            "uniform vec4 vColor;\n" +
            "\n" +
            "varying vec2 vTexCoord;\n" +
            "varying vec4 vDiffuseColor;\n" +
            "\n" +
            "void main(void)\n" +
            "{\n" +
            "   gl_FragColor = vDiffuseColor * vColor; texture2D(sTexture, vTexCoord);\n" +
            "   gl_FragColor += texture2D(sTexture, vTexCoord);\n" +
            "}\n";
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
    drawModel(
        renderer: RendererWithExposedMethods,
        model: FullModel,
        tx: number, ty: number, tz: number,
        rx: number, ry: number, rz: number,
        sx: number, sy: number, sz: number
    ): void {
        if (this.rm_Vertex === undefined
            || this.rm_Normal === undefined
            || this.view_proj_matrix === undefined
            || this.view_matrix === undefined
            || this.model_matrix === undefined
        ) {
            return;
        }

        const gl = renderer.gl;

        model.bindBuffers(gl);

        gl.enableVertexAttribArray(this.rm_Vertex);
        gl.enableVertexAttribArray(this.rm_Normal);
        gl.vertexAttribPointer(this.rm_Vertex, 3, gl.BYTE, false, 8, 0);
        gl.vertexAttribPointer(this.rm_Normal, 3, gl.BYTE, true, 8, 3);

        renderer.calculateMVPMatrix(tx, ty, tz, rx, ry, rz, sx, sy, sz);

        gl.uniformMatrix4fv(this.view_proj_matrix, false, renderer.getMVPMatrix());
        gl.uniformMatrix4fv(this.view_matrix, false, renderer.getViewMatrix());
        gl.uniformMatrix4fv(this.model_matrix, false, renderer.getModelMatrix());
        gl.drawElements(gl.TRIANGLES, model.getNumIndices() * 3 * 2, gl.UNSIGNED_BYTE, 0);

        renderer.checkGlError("VertexLitShader glDrawElements");
    }
}
