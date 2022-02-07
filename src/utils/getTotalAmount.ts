import { IServiceIncome } from "../types";

export default function getTotalAmount(services: IServiceIncome[]): number{
  return Number(services.reduce((accum, item) => accum + Number(item.amount) * item.quantity, 0).toFixed(2));
}