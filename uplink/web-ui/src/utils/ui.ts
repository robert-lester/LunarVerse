import { MATERIAL_COLORS } from '../constants';

/** Gets a color based of a user phone number */
export const getUserColor = (userColor: string) => {
  if (userColor) {
    return MATERIAL_COLORS[userColor];
  }
  return MATERIAL_COLORS.grey;
};
