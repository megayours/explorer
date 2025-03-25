

export class Witness {
  protected readonly rawData: any;
  public publicKey: string;

  constructor(rawData: any) {
    this.rawData = rawData;
    this.publicKey = rawData;
  }
}