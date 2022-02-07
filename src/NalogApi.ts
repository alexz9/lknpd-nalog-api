import NalogClient from "./NalogClient";
import { INalogAddIncomeResponse, INalogApiInitParams, INalogCancelIncomeResponse, INalogProfile, INalogReceiptIncome, IServiceIncome } from "./types";
import getTotalAmount from "./utils/getTotalAmount";
import fetch from "cross-fetch";

class NalogApi extends NalogClient {
  constructor({ inn, password, phone }: INalogApiInitParams) {
    super({ inn, password, phone });
  }

  async getUserInfo(): Promise<INalogProfile> {
    return await this.callMethod("user");
  }

  async addIncome(services: IServiceIncome[] | IServiceIncome, date = new Date()): Promise<string> {
    services = Array.isArray(services) ? services : [services];
    const totalAmount = getTotalAmount(services);
    const { approvedReceiptUuid, message }: INalogAddIncomeResponse = await this.callMethod("income", {
      paymentType: "CASH",
      ignoreMaxTotalIncomeRestriction: false,
      client: { contactPhone: null, displayName: null, incomeType: "FROM_INDIVIDUAL", inn: null },
      requestTime: new Date(),
      operationTime: new Date(date),
      services,
      totalAmount
    });
    if (!approvedReceiptUuid) {
      throw new Error(message || "Failed to add income");
    }
    return approvedReceiptUuid;
  }

  async cancelIncome(receiptUuid: string, comment: string): Promise<INalogCancelIncomeResponse["incomeInfo"]> {
    const { incomeInfo, message }: INalogCancelIncomeResponse = await this.callMethod("cancel", {
      receiptUuid,
      comment,
      partnerCode: null,
      requestTime: new Date()
    });
    if (!incomeInfo) {
      throw new Error(message || "Failed to cancel income");
    }
    return incomeInfo;
  }

  async getApprovedIncome(receiptUuid: string, format: "json" | "print" = "json"): Promise<INalogReceiptIncome | Blob> {
    const inn = await this.getInn();
    const r = await fetch(`${this.apiUrl}/receipt/${inn}/${receiptUuid}/${format}`);
    return format === "json" ? await r.json() : await r.blob();
  }
}

export default NalogApi;