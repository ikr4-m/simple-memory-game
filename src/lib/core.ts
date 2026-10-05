import {
  CardList,
  InitialDimension,
  MaximumDimension,
  InitialTimer,
  DelayPunishment,
  type ICardList
} from "./config";
import { writable, type Readable, type Writable } from "svelte/store";

export type BlockDirection = "vertical" | "horizontal";
export type TBlockDirection = BlockDirection;

export type CardValidationStatus = "opened" | "rejected" | "levelUp" | "paired";
export type TCardValidation = CardValidationStatus;

export type GameStatus = "idle" | "playing" | "evaluating" | "levelUp" | "won" | "lost";

export interface CardPosition {
  alt: number;
  position: {
    x: number;
    y: number;
  };
}
export type ICardPosition = CardPosition;

export interface GameState {
  arena: string[][];
  gameStarted: boolean;
  status: GameStatus;
  score: number;
  attempts: number;
  maxScore: number;
  timerPercentage: number;
  timerDiff: number;
  targetTimer: number;
  reachingLimitLevel: boolean;
}

export interface MemoryGameOptions {
  initialDimension?: number;
  maximumDimension?: number;
  initialTimer?: number;
  delayPunishment?: number;
  cardList?: ICardList[];
  onGameOver?: (score: number) => void;
  onVictory?: (score: number) => void;
}

export class MemoryGame implements Readable<GameState> {
  private dimension: number;
  private maximumDimension: number;
  private initialTimer: number;
  private delayPunishment: number;
  private cardListConfig: ICardList[];
  private blockDirection: BlockDirection = "vertical";

  private cardPool: ICardList[] = [];
  private arenaKey: ICardList[][] = [];
  private arena: string[][] = [];

  private openedCards: CardPosition[] = [];
  private revealedPairsCount: number = 0;

  public reachingLimitLevel: boolean = false;

  private state: GameState;
  private store: Writable<GameState>;
  public subscribe: Readable<GameState>["subscribe"];

  private timerIntervalId: ReturnType<typeof setInterval> | null = null;
  private evaluationTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private levelTotalMs: number = 0;
  private levelEndTime: number = 0;
  private options: MemoryGameOptions;

  constructor(options: MemoryGameOptions = {}) {
    this.options = options;
    this.dimension = options.initialDimension ?? InitialDimension;
    this.maximumDimension = options.maximumDimension ?? MaximumDimension;
    this.initialTimer = options.initialTimer ?? InitialTimer;
    this.delayPunishment = options.delayPunishment ?? DelayPunishment;
    this.cardListConfig = options.cardList ?? [...CardList];
    this.cardPool = [...this.cardListConfig];

    const initialTargetTimer = this.initialTimer;
    this.generateArena(this.dimension, this.dimension);

    this.state = {
      arena: this.cloneArena(),
      gameStarted: false,
      status: "idle",
      score: 0,
      attempts: 0,
      maxScore: 0,
      timerPercentage: 100,
      timerDiff: initialTargetTimer * 1000,
      targetTimer: initialTargetTimer,
      reachingLimitLevel: false
    };

    this.store = writable(this.state);
    this.subscribe = this.store.subscribe;
  }

  private cloneArena(): string[][] {
    return this.arena.map(row => [...row]);
  }

  private updateState(partial: Partial<GameState>): void {
    this.state = { ...this.state, ...partial };
    this.store.set(this.state);
  }

  // Using Schwartzian Transform algorithm to shuffle multiply card
  private multiplyShuffleCard(randomCard: ICardList[]): ICardList[] {
    const multiplied = randomCard.concat(randomCard);
    return multiplied
      .map(v => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(v => v.v);
  }

  private pullRandomCards(pairCount: number): ICardList[] {
    const pulledCards: ICardList[] = [];
    for (let i = 0; i < pairCount; i++) {
      if (this.cardPool.length === 0) {
        this.cardPool = [...this.cardListConfig];
      }
      const index = Math.floor(Math.random() * this.cardPool.length);
      pulledCards.push(this.cardPool[index]);
      this.cardPool.splice(index, 1);
    }
    return pulledCards;
  }

  public getEstimateCard(
    x: number = this.arenaKey[0]?.length || this.dimension,
    y: number = this.arenaKey.length || this.dimension
  ): number {
    return Math.floor((x * y) / 2);
  }

  public generateArena(
    xTotal: number = this.dimension,
    yTotal: number = this.dimension
  ): void {
    if (this.reachingLimitLevel) return;

    if (Math.pow(this.maximumDimension, 2) < xTotal * yTotal) {
      this.reachingLimitLevel = true;
      return;
    }

    const pairCount = this.getEstimateCard(xTotal, yTotal);
    const randomCards = this.pullRandomCards(pairCount);
    const shuffled = this.multiplyShuffleCard(randomCards);

    this.arena = [];
    this.arenaKey = [];

    for (let y = 0; y < yTotal; y++) {
      const rowArena: string[] = [];
      const rowKey: ICardList[] = [];
      for (let x = 0; x < xTotal; x++) {
        rowArena.push("");
        rowKey.push(shuffled.pop() ?? { alt: 0, img: "" });
      }
      this.arena.push(rowArena);
      this.arenaKey.push(rowKey);
    }
  }

  public expandArena(): void {
    let yRange = this.arenaKey.length;
    let xRange = this.arenaKey[0]?.length || this.dimension;

    if (this.blockDirection === "vertical") {
      yRange += this.dimension;
      this.blockDirection = "horizontal";
    } else {
      xRange += this.dimension;
      this.blockDirection = "vertical";
    }

    this.generateArena(xRange, yRange);
  }

  public getArena(): [string[][], ICardList[][]] {
    return [this.cloneArena(), this.arenaKey];
  }

  public getState(): GameState {
    return this.state;
  }

  public validateCard(x: number, y: number): CardValidationStatus {
    if (this.arena[y]?.[x]) return "opened";
    if (this.openedCards.length >= 2) return "opened";

    const card = this.arenaKey[y][x];
    this.arena[y][x] = card.img || "";

    const position = { x, y };
    this.openedCards.push({
      alt: card.alt,
      position
    });

    let status: CardValidationStatus = "opened";

    if (this.openedCards.length === 2) {
      const [card1, card2] = this.openedCards;

      if (card1.alt !== card2.alt) {
        status = "rejected";
      } else {
        this.revealedPairsCount++;
        this.openedCards = [];
        if (this.revealedPairsCount === this.getEstimateCard()) {
          status = "levelUp";
          this.revealedPairsCount = 0;
        } else {
          status = "paired";
        }
      }
    }

    return status;
  }

  public closeRejectedCard(): void {
    for (const card of this.openedCards) {
      if (this.arena[card.position.y]?.[card.position.x] !== undefined) {
        this.arena[card.position.y][card.position.x] = "";
      }
    }
    this.openedCards = [];
  }

  public start(): void {
    if (this.state.gameStarted) return;

    const initialTargetTimer = this.initialTimer;
    this.levelTotalMs = initialTargetTimer * 1000;
    this.levelEndTime = Date.now() + this.levelTotalMs;

    this.updateState({
      gameStarted: true,
      status: "playing",
      score: 0,
      targetTimer: initialTargetTimer,
      timerDiff: this.levelTotalMs,
      timerPercentage: 100
    });

    this.startTimerTicker();
  }

  private startTimerTicker(): void {
    this.stopTimerTicker();

    this.timerIntervalId = setInterval(() => {
      if (this.state.status !== "playing" && this.state.status !== "evaluating") {
        return;
      }

      const now = Date.now();
      const diff = Math.max(0, this.levelEndTime - now);
      const percentage = Math.max(0, (diff / this.levelTotalMs) * 100);

      this.updateState({
        timerDiff: diff,
        timerPercentage: percentage
      });

      if (diff <= 0) {
        this.handleTimeUp();
      }
    }, 50);
  }

  private stopTimerTicker(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  private handleTimeUp(): void {
    this.stopTimerTicker();
    const newAttempts = this.state.attempts + 1;
    const newMaxScore = Math.max(this.state.maxScore, this.state.score);

    this.updateState({
      status: "lost",
      timerDiff: 0,
      timerPercentage: 0,
      attempts: newAttempts,
      maxScore: newMaxScore
    });

    if (this.options.onGameOver) {
      this.options.onGameOver(this.state.score);
    } else if (typeof window !== "undefined") {
      alert("Finish!");
    }
  }

  public async handleCardClick(x: number, y: number): Promise<void> {
    if (this.state.status === "lost" || this.state.status === "won") {
      this.restart(true);
      return;
    }

    if (!this.state.gameStarted) {
      this.start();
    }

    if (this.state.status !== "playing") {
      return;
    }

    if (this.arena[y]?.[x] !== "") {
      return;
    }

    const validation = this.validateCard(x, y);

    if (validation === "paired" || validation === "levelUp") {
      const points = Math.floor(this.state.timerDiff / 150);
      this.updateState({
        score: this.state.score + points,
        arena: this.cloneArena()
      });
    } else {
      this.updateState({
        arena: this.cloneArena()
      });
    }

    if (validation === "rejected") {
      this.updateState({ status: "evaluating" });

      this.evaluationTimeoutId = setTimeout(() => {
        this.closeRejectedCard();
        this.evaluationTimeoutId = null;

        if (this.state.status === "evaluating") {
          this.updateState({
            status: "playing",
            arena: this.cloneArena()
          });
        } else {
          this.updateState({
            arena: this.cloneArena()
          });
        }
      }, this.delayPunishment * 1000);
    } else if (validation === "levelUp") {
      await this.handleLevelUp();
    }
  }

  private async handleLevelUp(): Promise<void> {
    this.stopTimerTicker();
    this.updateState({ status: "levelUp" });

    await new Promise((resolve) => {
      this.transitionTimeoutId = setTimeout(resolve, 1000);
    });
    this.transitionTimeoutId = null;

    if (this.state.status !== "levelUp") {
      return;
    }

    let nextY = this.arenaKey.length;
    let nextX = this.arenaKey[0]?.length || this.dimension;

    if (this.blockDirection === "vertical") {
      nextY += this.dimension;
    } else {
      nextX += this.dimension;
    }

    if (nextX * nextY > Math.pow(this.maximumDimension, 2)) {
      this.reachingLimitLevel = true;
      const newAttempts = this.state.attempts + 1;
      const newMaxScore = Math.max(this.state.maxScore, this.state.score);

      this.updateState({
        status: "won",
        reachingLimitLevel: true,
        attempts: newAttempts,
        maxScore: newMaxScore
      });

      if (this.options.onVictory) {
        this.options.onVictory(this.state.score);
      } else if (typeof window !== "undefined") {
        alert("You're done!");
      }
      return;
    }

    this.expandArena();
    this.revealedPairsCount = 0;
    this.openedCards = [];

    const nextTargetTimer = this.state.targetTimer + this.initialTimer;
    this.levelTotalMs = nextTargetTimer * 1000;
    this.levelEndTime = Date.now() + this.levelTotalMs;

    this.updateState({
      status: "playing",
      targetTimer: nextTargetTimer,
      timerDiff: this.levelTotalMs,
      timerPercentage: 100,
      arena: this.cloneArena()
    });

    this.startTimerTicker();
  }

  public restart(confirmPrompt: boolean = false): boolean {
    if (confirmPrompt && typeof window !== "undefined") {
      if (!confirm("Do you want to restart the game?")) {
        return false;
      }
    }

    this.clearAllTimers();
    this.dimension = this.options.initialDimension ?? InitialDimension;
    this.blockDirection = "vertical";
    this.reachingLimitLevel = false;
    this.openedCards = [];
    this.revealedPairsCount = 0;
    this.cardPool = [...this.cardListConfig];

    const initialTargetTimer = this.initialTimer;
    this.generateArena(this.dimension, this.dimension);

    this.updateState({
      gameStarted: false,
      status: "idle",
      score: 0,
      targetTimer: initialTargetTimer,
      timerDiff: initialTargetTimer * 1000,
      timerPercentage: 100,
      arena: this.cloneArena(),
      reachingLimitLevel: false
    });

    return true;
  }

  private clearAllTimers(): void {
    this.stopTimerTicker();
    if (this.evaluationTimeoutId !== null) {
      clearTimeout(this.evaluationTimeoutId);
      this.evaluationTimeoutId = null;
    }
    if (this.transitionTimeoutId !== null) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }
  }

  public destroy(): void {
    this.clearAllTimers();
  }
}

export function createGame(options?: MemoryGameOptions): MemoryGame {
  return new MemoryGame(options);
}

export const GenerateBlock = MemoryGame;
export default MemoryGame;
