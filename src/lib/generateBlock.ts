import { CardList, InitialDimension, MaximumDimension } from "./config";

type TBlockDirection = "vertical" | "horizontal";
type TCardValidation = "opened" | "rejected" | "levelUp";
interface ICardPosition {
  alt: number,
  position: {
    x: number;
    y: number;
  }
}

export default class GenerateBlock {
  private dimension: number = 0;
  private blockDirection: TBlockDirection = "vertical";

  private cardList: typeof CardList = [...CardList];
  private arenaKey: typeof CardList[] = [];
  private arena: any[][] = [];

  private openedCard: ICardPosition[] = [];
  private revealedCard: ICardPosition[] = [];

  public reachingLimitLevel: boolean = false;

  constructor() {
    this.dimension = InitialDimension;
    this.generateArena();
  }

  // Using Schwartzian Transform algorithm to shuffle multiply card
  private multiplyShuffleCard(randomCard: typeof CardList): typeof CardList {
    randomCard = randomCard.concat(randomCard);
    return randomCard
      .map(v => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(v => v.v);
  }

  // Using Fisher Yates algorithm to dick-pick shuffle card
  private pullRandomCard(cardTotal: number): typeof CardList {
    const pulledCard: typeof CardList = [];
    for (let i = 0; i < cardTotal; i++) {
      if (this.cardList.length <= 0) this.cardList = [...CardList];
      const indexCard = Math.floor(Math.random() * this.cardList.length);
      const randCard = this.cardList[indexCard];

      pulledCard.push(randCard);
      this.cardList.splice(indexCard, 1);
    }
    return pulledCard;
  }

  public getEstimateCard(x: number = this.arena[0].length, y: number = this.arena.length): number {
    return Math.floor((x * y) / 2);
  }

  public generateArena(xTotal: number = this.dimension, yTotal: number = this.dimension) {
    if (this.reachingLimitLevel) return;
    if (Math.pow(MaximumDimension, 2) < (xTotal * yTotal)) {
      this.reachingLimitLevel = true;
      return;
    }
    const randomCard = this.pullRandomCard(this.getEstimateCard(xTotal, yTotal));
    const shuffled = this.multiplyShuffleCard(randomCard);

    for (let y = 0; y < yTotal; y++) {
      this.arena.push([]);
      this.arenaKey.push([]);
      for (let x = 0; x < xTotal; x++) {
        this.arena[y].push("");
        this.arenaKey[y].push(shuffled.pop()!);
      }
    }
  }

  public expandArena(): void {
    let yRange = this.arena.length;
    let xRange = this.arena[0].length;

    if (this.blockDirection === "vertical") {
      yRange += this.dimension;
      this.blockDirection = "horizontal";
    } else {
      xRange += this.dimension;
      this.blockDirection = "vertical";
    }

    this.generateArena(xRange, yRange);
  }

  public validateCard(x: number, y:number): TCardValidation {
    const card = this.arenaKey[y][x];
    let status: TCardValidation = "opened";
    this.arena[y][x] = card.alt;

    this.openedCard.push({
      alt: card.alt,
      position: { x: x, y: y }
    });

    if (this.openedCard.length === 2) {
      const [card1, card2] = this.openedCard;

      if (card1.alt !== card2.alt) status = "rejected";
      else {
        this.revealedCard.push(card1);
        this.openedCard = [];
      }
    }

    return status;
  }

  public closeRejectedCard(): void {
    this.openedCard.forEach(v => {
      this.arena[v.position.y][v.position.x] = "";
    });
    this.openedCard = [];
  }

  public getArena(): [typeof this.arena, typeof CardList[]] {
    return [this.arena, this.arenaKey];
  }
}
