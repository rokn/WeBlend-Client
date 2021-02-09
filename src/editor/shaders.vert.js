// language=GLSL
export const vShader =`
	uniform mat4 uProjectionMatrix;
	uniform mat4 uViewMatrix;
	uniform mat4 uModelMatrix;
    
    uniform bool uNoLighting;
    
	uniform vec3 uAmbientColor;
	uniform vec3 uDiffuseColor;
	
	uniform vec3 uLightDir;
	
	attribute vec3 aXYZ;
	attribute vec3 aColor;
	attribute vec3 aNormal;
	
	varying vec3 vColor;
	
	void main ()
	{
        gl_PointSize = 8.0;
		mat4 mvMatrix = uViewMatrix * uModelMatrix;
		gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);
        
        vColor = aColor;
	
        if(!uNoLighting) {
            vColor = uAmbientColor*aColor;
            vec3 light = normalize(-uLightDir);
            vec3 normal = vec3(normalize(mvMatrix*vec4(aNormal,0)));
            vColor += aColor*uDiffuseColor*max(dot(normal,light),0.0);
        }
	}
`

// language=GLSL
export const outlineVShader =`
    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    uniform mat4 outlineScale;

    attribute vec3 aXYZ;

    void main ()
    {
        mat4 mvMatrix = uViewMatrix * uModelMatrix;
        gl_Position = uProjectionMatrix * mvMatrix * outlineScale * vec4(aXYZ,1);
    }
`

// language=GLSL
export const simpVShader = `
    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uModelMatrix;
    
    attribute vec3 aXYZ;
    void main ()
    {
        gl_PointSize = 3.0;
        mat4 mvMatrix = uViewMatrix * uModelMatrix;
        gl_Position = uProjectionMatrix * mvMatrix * vec4(aXYZ,1);
    }
`
