function posMod(x, y) {
    return ((x % y) + y) % y;
}

export {posMod}