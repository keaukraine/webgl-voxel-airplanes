import { DiffuseScrollingShader } from "./DiffuseScrollingShader";

export class DiffuseScrollingFilteredShader extends DiffuseScrollingShader {
    fillCode() {
        this.vertexShaderCode = `#version 300 es
            precision highp float;
            uniform mat4 view_proj_matrix;
            uniform vec3 uUvOffset; // xy - offset, z - scale
            in vec4 rm_Vertex;
            in vec2 rm_TexCoord0;
            out vec2 vTextureCoord;

            void main() {
                gl_Position = view_proj_matrix * rm_Vertex;
                vTextureCoord = rm_TexCoord0 * uUvOffset.z + uUvOffset.xy;
            }`;

        this.fragmentShaderCode = `#version 300 es
            precision highp float;
            in vec2 vTextureCoord;
            uniform lowp sampler2D sTexture;
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
                fragColor = textureBlocky(sTexture, vTextureCoord, TEXTURE_SIZE);
            }`;
    }
}
