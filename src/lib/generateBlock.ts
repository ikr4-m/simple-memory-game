import { CardList, InitialDimension, MaximumDimension } from "./config";

type TBlockDirection = "vertical" | "horizontal";

export default class GenerateBlock {
  private dimension: number = 0;
  private blockDirection: TBlockDirection = "vertical";
  private cardList: typeof CardList = [...CardList];

  public arena: typeof CardList[] = [];
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

  public generateArena(xTotal: number = this.dimension, yTotal: number = this.dimension) {
    if (this.reachingLimitLevel) return;
    if (Math.pow(MaximumDimension, 2) < (xTotal * yTotal)) {
      this.reachingLimitLevel = true;
      return;
    }
    const arena: typeof CardList[] = [];
    const randomCard = this.pullRandomCard(Math.floor((xTotal * yTotal) / 2));
    const shuffled = this.multiplyShuffleCard(randomCard);

    for (let y = 0; y < yTotal; y++) {
      arena.push([]);
      for (let x = 0; x < xTotal; x++) {
        arena[y].push(shuffled.pop()!);
      }
    }
    this.arena = arena;
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
}
