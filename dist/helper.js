"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genRandomPlayer = void 0;
const DEFAULT_PLAYER_RADIUS = 10;
const genRandomPlayer = () => {
    return {
        x: Math.floor(Math.random() * 1000) + DEFAULT_PLAYER_RADIUS,
        y: Math.floor(Math.random() * 500) + DEFAULT_PLAYER_RADIUS,
        radius: DEFAULT_PLAYER_RADIUS,
        color: '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
    };
};
exports.genRandomPlayer = genRandomPlayer;
