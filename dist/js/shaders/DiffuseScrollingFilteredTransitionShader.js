"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffuseScrollingFilteredTransitionShader = void 0;
const DiffuseScrollingFilteredShader_1 = require("./DiffuseScrollingFilteredShader");
class DiffuseScrollingFilteredTransitionShader extends DiffuseScrollingFilteredShader_1.DiffuseScrollingFilteredShader {
    fillCode() {
        super.fillCode();
        this.fragmentShaderCode = `#version 300 es
            precision highp float;
            in vec2 vTextureCoord;
            uniform float uTransition;
            uniform lowp sampler2D sTexture;
            uniform lowp sampler2D sTargetTexture;
            uniform lowp sampler2D sMaskTexture;
            out lowp vec4 fragColor;

            // Filtering is based on code from https://www.shadertoy.com/view/ltfXWS

            // basically calculates the lengths of (a.x, b.x) and (a.y, b.y) at the same time
            vec2 v2len(in vec2 a, in vec2 b) {
                return sqrt(a*a+b*b);
            }

            // samples from a linearly-interpolated texture to produce an appearance similar to
            // nearest-neighbor interpolation, but with resolution-dependent antialiasing
            //
            // this function's interface is exactly the same as texture's, aside from the 'res'
            // parameter, which represents the resolution of the texture 'tex'.
            vec4 textureBlocky(in lowp sampler2D tex, in vec2 uv, in vec2 res) {
                uv *= res; // enter texel coordinate space.

                vec2 seam = floor(uv+.5); // find the nearest seam between texels.

                // here's where the magic happens. scale up the distance to the seam so that all
                // interpolation happens in a one-pixel-wide space.
                uv = (uv-seam)/v2len(dFdx(uv),dFdy(uv))+seam;

                uv = clamp(uv, seam-.5, seam+.5); // clamp to the center of a texel.

                return texture(tex, uv/res, -1000.); // convert back to 0..1 coordinate space.
            }

            const vec2 TEXTURE_SIZE = vec2(256., 256.);

            void main() {
                vec4 color1 = textureBlocky(sTexture, vTextureCoord, TEXTURE_SIZE);
                vec4 color2 = textureBlocky(sTargetTexture, vTextureCoord, TEXTURE_SIZE);
                float mask = texture(sMaskTexture, vTextureCoord, 0.).r;
                // float transition = 1.0 - step(uTransition + uTransition * mask, 0.75);
                float transition = smoothstep(0.4, 0.6, uTransition + uTransition * mask);
                fragColor = mix(color1, color2, transition);
            }`;
    }
    fillUniformsAttributes() {
        super.fillUniformsAttributes();
        this.uTransition = this.getUniform("uTransition");
        this.sTargetTexture = this.getUniform("sTargetTexture");
        this.sMaskTexture = this.getUniform("sMaskTexture");
    }
}
exports.DiffuseScrollingFilteredTransitionShader = DiffuseScrollingFilteredTransitionShader;
//# sourceMappingURL=DiffuseScrollingFilteredTransitionShader.js.map