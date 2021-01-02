// language=GLSL
export const fShader = `
    precision mediump float;
    varying vec3 vColor;
    void main( )
    {
        gl_FragColor = vec4(vColor,1);
    }
`

// language=GLSL
export const simpFShader = `
    precision mediump float;
    void main( )
    {
        gl_FragColor = vec4(1,1,1,1);
    }
`

