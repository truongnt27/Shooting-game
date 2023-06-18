import { User } from './types';

const DEFAULT_PLAYER_RADIUS = 10;
export const genRandomPlayer = () => {
  return {
    x: Math.floor(Math.random() * 1000) + DEFAULT_PLAYER_RADIUS,
    y: Math.floor(Math.random() * 500) + DEFAULT_PLAYER_RADIUS,
    radius: DEFAULT_PLAYER_RADIUS,
    color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`,
  };
};

export const checkUniqueName = (
  users: { [key: string]: User },
  name: string,
) => {
  return !Object.values(users).some((user) => user.name === name.trim());
};
