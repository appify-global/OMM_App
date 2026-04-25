import type { ImageSourcePropType } from 'react-native';
import { images } from '../constants/images';

export type ActivityPerspective = 'buyer' | 'seller';
export type ActivityCategory = 'offer' | 'inspection' | 'message';

export type ActivityRow = {
  id: string;
  perspective: ActivityPerspective;
  category: ActivityCategory;
  title: string;
  subtitle: string;
  timeLabel: string;
  avatar: ImageSourcePropType;
  /** Agent message preview / thread */
  agentName?: string;
  agentRole?: string;
  agentMessage?: string;
  messageTimeDetail?: string;
  /** Inspection / offer context */
  address?: string;
  inspectionDetailLine?: string;
  rescheduleSubtitle?: string;
};

export const ACTIVITIES: ActivityRow[] = [
  {
    id: 'buyer-patel-offer',
    perspective: 'buyer',
    category: 'offer',
    title: 'M. Patel',
    subtitle: 'Offer $2.35m — vendor wants $2.42m walk-away.',
    timeLabel: '2m',
    avatar: images.reviewer2,
    agentName: 'M. Patel',
    agentRole: 'Listing agent • Hawthorn City Center',
    agentMessage:
      'Thanks for your offer. It is below what the seller will accept for this property. They are open to a counter closer to the list price.',
    messageTimeDetail: '2 minutes ago',
    address: '12 Denham St, Hawthorn VIC',
  },
  {
    id: 'buyer-inspection-1',
    perspective: 'buyer',
    category: 'inspection',
    title: 'Inspection Scheduled',
    subtitle: "You've booked 137, Art Colony, Colling……",
    timeLabel: '8h',
    avatar: images.propertyHouse1,
    agentName: 'M. Patel',
    agentRole: 'Listing agent • Hawthorn City Center',
    address: '12 Denham St, Hawthorn VIC',
    inspectionDetailLine: 'Sat 26 Apr • 10:30—11:15 • Buyer tour • Arrive 10:20 for check-in.',
    rescheduleSubtitle: '12 Denham St, Hawthorn VIC • Buyer tour',
  },
  {
    id: 'buyer-msg-lin',
    perspective: 'buyer',
    category: 'message',
    title: 'Sarah Lin',
    subtitle: 'Floorplan v2 is in the data room — want a walk-through?',
    timeLabel: '1d',
    avatar: images.reviewer1,
    agentName: 'Sarah Lin',
    agentRole: 'Jellis Craig • Camberwell',
    agentMessage:
      'Floorplan v2 is in the data room — want a walk-through? I can do a 15-min video tonight.',
    messageTimeDetail: 'Yesterday',
  },
  {
    id: 'seller-enquiry-1',
    perspective: 'seller',
    category: 'message',
    title: 'Alex Moore',
    subtitle: 'RE: Hawthorn City Center — finance clause question.',
    timeLabel: '3h',
    avatar: images.reviewer3,
    agentName: 'Alex Moore',
    agentRole: 'Buyer enquiry',
    agentMessage:
      'Can we confirm whether the vendor will accept a 14-day finance clause on the offer draft?',
    messageTimeDetail: '3 hours ago',
  },
  {
    id: 'seller-offer-1',
    perspective: 'seller',
    category: 'offer',
    title: 'M. Patel',
    subtitle: 'Counter received — buyer lifted to $2.05m subject to finance 10 days.',
    timeLabel: '5h',
    avatar: images.reviewer2,
    agentName: 'M. Patel',
    agentRole: 'Your listing agent',
    agentMessage:
      'Counter received — buyer lifted to $2.05m subject to finance 10 days. Awaiting your instruction.',
    messageTimeDetail: '5 hours ago',
  },
  {
    id: 'seller-open-1',
    perspective: 'seller',
    category: 'inspection',
    title: 'Open home feedback',
    subtitle: '12 groups through — 4 serious follow-ups logged.',
    timeLabel: '2d',
    avatar: images.propertyHouse2,
    address: 'Auburn Residence, 88 Auburn Rd',
    inspectionDetailLine: 'Sat 19 Apr • 11:00—11:45 • Open home wrap-up.',
    rescheduleSubtitle: '88 Auburn Rd, Hawthorn VIC • Open home',
  },
];
