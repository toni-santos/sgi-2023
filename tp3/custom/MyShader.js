import * as THREE from 'three';

/** Represents a plane with nrDivs divisions along both axis, with center at (0,0) */
class MyShader {
	constructor(app, name, description = "no description provided", vert_url, frag_url, uniformValues = null) {
		
        this.app = app;
        this.name = name
        this.description = description
        this.vert_url = vert_url;
        this.frag_url = frag_url;
        this.uniformValues = uniformValues
        this.material = null
        this.ready = false
        this.read(vert_url, true)
        this.read(frag_url, false)
    }

    updateUniformsValue(key, value) {
        if (this.uniformValues[key]=== null || this.uniformValues[key] === undefined) {
            console.error("shader does not have uniform " + key)
            return;
        }
        this.uniformValues[key].value = value
        if (this.material !== null) {
            this.material.uniforms[key].value = value
        }
    }

    read(theUrl, isVertex) {
        let xmlhttp = null
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp=new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        let obj = this
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status==200) {
                
                if (isVertex) { 
                    console.log("loaded vs " + theUrl)  
                    obj.vertexShader = xmlhttp.responseText 
                }
                else { 
                    console.log("loaded fs " + theUrl)  
                    obj.fragmentShader = xmlhttp.responseText
                }
                obj.buildShader.bind(obj)()
            }
        }
        xmlhttp.open("GET", theUrl, true)
        xmlhttp.send()
    }

    buildShader() {
        // are both resources loaded? 
        if (this.vertexShader !== undefined && this.fragmentShader !== undefined) {
            // build the shader material
            this.material = new THREE.ShaderMaterial({
                // load uniforms, if any
                uniforms: (this.uniformValues !== null ? this.uniformValues : {}),
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
            }) 
            // report built!
            console.log("built shader from " + this.vert_url + ", " + this.frag_url)  
            this.ready = true
        }
    }

    hasUniform(key) {
        return this.uniformValues[key] !== undefined
    }
}
export {MyShader}

