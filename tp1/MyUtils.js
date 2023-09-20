function arrayMult(arr1, arr2) {
    if (arr1.length !== arr2.length)
        throw new Error(
            `Cannot multiply arrays of size ${arr1.length} and ${arr2.length}`
        );
    return arr1.map((val, i) => val * arr2[i]);
}

export { arrayMult };
