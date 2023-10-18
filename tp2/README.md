# sgi-tp2-base
The starting point of the second assignment of SGI.


# Getting started

Considering a code block (for instance class A.js), to load an xml file (in the defined structure) call:

    let reader = new MyFileReader(app, this, *this.onSceneLoaded*);
    reader.open("<path to xml file>");	

The last argument in the MyFileReader object call is the name of the method that is to be called when the xml file is loaded and parsed.

Hence, In the same code block (for instance class A.js) add a function method with the following signature: 

    onSceneLoaded(data) {
        // do something with the data object
    }

This method is called once the xml file is loaded and parsed successfully. This method single input argument, *data*, is an object containing the entire scene data object. This document can be traversed according to the rules defined in the section on MySceneData class



# MyFileServer
File MyFileServer.js contains the class responsible for the XML parser general functionality. Most of the parsing process is derived from descriptors defined in MySceneData.js. A small part is hardcoded.

> <span style="color: red;">**DO NOT CHANGE MyFileServer.js FILE. IT WILL BE MODIFIED OR REPLACED DURING EVALUATION**</span>

# MySceneData
File MySceneData.js contains a class with metadata description and, in the end of parsing, contains the full set of objects loaded from the xml scene file. This class has several important object attributes:
- options: contains the scene options, from the globals section
- fog: contains the scene fog options, from the fog section
- materials: associative array/list with the scene described materials
- textures: associative array/list with the scene described textures
- cameras: associative array/list with all the cameras in the scene
- activeCameraId: the id of the active camera
- nodes: associative array/list with all the scene nodes.
- rootId: the id of the root node

NOTES: 
1. for each entity type, there are no repeated ids. For instance, if there are two nodes with the same id, the parser will complain and the scene will not be loaded.
2. For each loaded entity, the parser will check if all the required attributes are present. If not, the parser will complain and the scene will not be loaded.
3. For each entity, a descriptor defined in the constructor defines the attribute's name, type, requiredness, default value.
4. **DO NOT CHANGE MySceneData.js IT WILL BE MODIFIED OR REPLACED DURING EVALUATION**

## Custom attributes
Use  the custom attribute in the data objects to add further attributes:


    let obj = {
        id: "some id",
        type: "some type",
        custom: {
            attr1: "value1",
            attr2: "value2"
        } 
    }

in the previous object, attr1 and attr2 are custom attributes that were added to the object by the programmer (student), in light its program specific needs.

