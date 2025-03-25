import { Transaction } from '../Transaction/Transaction';

export class MegachainTransaction extends Transaction {
  public hash: string;
  public id: string;

  constructor(rawData: any) {
    super(rawData);

    this.hash = rawData.hash;
    this.id = rawData.id;
  }

}

