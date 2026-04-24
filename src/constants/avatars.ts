import { images } from './images';

export function threadAvatarForName(name: string) {
  switch (name) {
    case 'Anton Zhouk':
      return images.agentAnton;
    case 'Sarah Jenkins':
      return images.reviewer1;
    case 'Camberwell Agent':
      return images.reviewer4;
    default:
      return images.agentAnton;
  }
}
