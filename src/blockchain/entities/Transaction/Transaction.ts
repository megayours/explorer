

export abstract class Transaction {
  protected readonly rawData: any;

  constructor(rawData: any) {
    this.rawData = rawData;
  }

  abstract get hash(): string;  

  abstract get id(): string;
}