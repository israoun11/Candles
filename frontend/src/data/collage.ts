import type { Bp } from '../hooks/useBreakpoint';

// Authored composition. x/y/w are % of the stage; ratio is width/height. Replace `image` with real photos later.
export interface Place { x: number; y: number; w: number; ratio: number; rot: number; z: number }
export interface CollageLayer { id: string; caption: string; tone: string; image?: string; at: Record<Bp, Place | null> }

export const collage: CollageLayer[] = [
  { id: 'the-twist', caption: 'The Twist', tone: 'var(--pink)', at: {
    d: { x: 5, y: 16, w: 19, ratio: 0.8, rot: -3, z: 2 }, t: { x: 4, y: 14, w: 30, ratio: 0.8, rot: -3, z: 2 }, m: { x: 4, y: 12, w: 46, ratio: 0.8, rot: -3, z: 2 } } },
  { id: 'bubble-pop', caption: 'Bubble Pop', tone: 'var(--butter)', at: {
    d: { x: 26, y: 56, w: 16, ratio: 1, rot: 2, z: 3 }, t: { x: 34, y: 62, w: 28, ratio: 1, rot: 2, z: 3 }, m: { x: 8, y: 62, w: 40, ratio: 1, rot: 2, z: 3 } } },
  { id: 'sunday-mood', caption: 'Sunday Mood', tone: 'var(--lavender)', at: {
    d: { x: 41, y: 8, w: 17, ratio: 0.75, rot: 1, z: 2 }, t: { x: 40, y: 8, w: 28, ratio: 0.75, rot: 1, z: 2 }, m: { x: 50, y: 20, w: 44, ratio: 0.75, rot: 1, z: 2 } } },
  { id: 'wavy-baby', caption: 'Wavy Baby', tone: 'var(--coral)', at: {
    d: { x: 62, y: 20, w: 16, ratio: 0.7, rot: -2, z: 3 }, t: { x: 68, y: 30, w: 26, ratio: 0.7, rot: -2, z: 3 }, m: { x: 60, y: 56, w: 34, ratio: 0.7, rot: -2, z: 3 } } },
  { id: 'peachy', caption: 'Peachy', tone: 'var(--peach)', at: {
    d: { x: 72, y: 58, w: 14, ratio: 1, rot: 3, z: 4 }, t: { x: 70, y: 66, w: 22, ratio: 1, rot: 3, z: 4 }, m: { x: 56, y: 80, w: 34, ratio: 1, rot: 3, z: 4 } } },
  { id: 'the-daisy', caption: 'The Daisy', tone: 'var(--cream)', at: {
    d: { x: 86, y: 12, w: 10, ratio: 1, rot: 0, z: 1 }, t: { x: 76, y: 8, w: 18, ratio: 1, rot: 0, z: 1 }, m: null } },
  { id: 'slow-morning', caption: 'Slow Morning', tone: 'var(--green)', at: {
    d: { x: 12, y: 64, w: 11, ratio: 0.9, rot: -2, z: 1 }, t: null, m: { x: 4, y: 84, w: 30, ratio: 0.9, rot: -2, z: 1 } } },
];
