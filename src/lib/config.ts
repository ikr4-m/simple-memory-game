import Gambar1 from "../resources/gambar-1.png";
import Gambar2 from "../resources/gambar-2.png";
import Gambar3 from "../resources/gambar-3.png";
import Gambar4 from "../resources/gambar-4.png";
import Gambar5 from "../resources/gambar-5.png";
import Gambar6 from "../resources/gambar-6.png";
import Gambar7 from "../resources/gambar-7.png";
import Gambar8 from "../resources/gambar-8.png";
import Gambar9 from "../resources/gambar-9.png";
import Gambar10 from "../resources/gambar-10.png";

export const InitialTimer: number = 10;
export const InitialDimension: number = 2;
export const MaximumDimension: number = 10;
export const DelayPunishment: number = 2;

export interface ICardList {
  alt: number;
  img?: string;
}
export const CardList: ICardList[] = [
  { alt: 1, img: Gambar1 },
  { alt: 2, img: Gambar2 },
  { alt: 3, img: Gambar3 },
  { alt: 4, img: Gambar4 },
  { alt: 5, img: Gambar5 },
  { alt: 6, img: Gambar6 },
  { alt: 7, img: Gambar7 },
  { alt: 8, img: Gambar8 },
  { alt: 9, img: Gambar9 },
  { alt: 10, img: Gambar10 },
];
