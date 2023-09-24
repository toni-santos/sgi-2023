function arrayMult(arr1, arr2) {
    if (arr1.length !== arr2.length)
        throw new Error(
            `Cannot multiply arrays of size ${arr1.length} and ${arr2.length}`
        );
    return arr1.map((val, i) => val * arr2[i]);
}

/**
 * Generates a random integer between two numbers. Both bounds are inclusive.
 * @param {number} min the lower bound
 * @param {number} max the upper bound
 * @returns A random integer between [min, max]
 */
function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}


export { arrayMult, randomInteger };
