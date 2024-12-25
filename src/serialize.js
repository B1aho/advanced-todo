/**
 * Serialization of an object while preserving its getters and setters
 * @param {Object} obj - An object to be serialized 
 * @returns {string} - String in json format that represent obj
 */
export function serialize(obj) {
    const serializeInfo = {
        obj: {},
        meta: {
            getters: [],
            setters: [],
        },
    }

    // Save all props without accessors 
    Object.assign(serializeInfo.obj, obj)

    const descriptors = Object.getOwnPropertyDescriptors(obj)

    // Save all accessors's keys
    for (const [key, descriptor] of Object.entries(descriptors)) {
        if (typeof descriptor.get === "function") {
            serializeInfo.meta.getters.push(key);
        }
        if (typeof descriptor.set === "function") {
            serializeInfo.meta.setters.push(key);
        }
    }

    return JSON.stringify(serializeInfo);
}

/**
 * Deserialization of preveiously serialized object with serialize() function
 * @param {string} json - Serialized (with serialize()) object in json format
 * @param {Object} proto - Object that we want to set as [[Prototype]] of an object to be deserialized
 * @returns {Object} - Deserialized object
 */
export function deserialize(json, proto) {
    const serializeInfo = JSON.parse(json)
    const obj = Object.create(proto)
    Object.assign(obj, serializeInfo.obj)
    
    // Since the prototype property of the class stores accessors, we retrieve them from there
    serializeInfo.meta.getters.forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key)
        if (descriptor.get)
            Object.defineProperty(obj, key, descriptor)
    })

    serializeInfo.meta.setters.forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, key)
        if (descriptor.set)
            Object.defineProperty(obj, key, descriptor)
    })

    return obj
}