import fetch from "cross-fetch";
import { INalogApiInitParams, INalogAuthResponse } from "./types";
import createDeviceId from "./utils/createDeviceId";
import getPhoneConfirmationCode from "./utils/getPhoneConfirmationCode";
import isExpiredToken from "./utils/isExpiredToken";
import isValidPhone from "./utils/isValidPhone";

abstract class NalogClient {
  static #instance: NalogClient;
  #apiUrl = "https://lknpd.nalog.ru/api/v1";
  #fetchParams: RequestInit = {
    method: "POST",
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
      "content-type": "application/json",
    },
    referrer: "https://lknpd.nalog.ru/",
    referrerPolicy: "strict-origin-when-cross-origin"
  };
  #deviceInfo = {
    appVersion: "1.0.0",
    sourceType: "WEB",
    sourceDeviceId: "",
    metaDetails: { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36" }
  };
  #inn = "";
  #token = "";
  #tokenExpireIn = "";
  #refreshToken = "";
  #authPromise;

  constructor({ inn, password, phone }: INalogApiInitParams) {    
    if(NalogClient.#instance){     
      return NalogClient.#instance;
    }
    if (phone && !isValidPhone(phone)) {
      throw new Error("Phone number entered incorrectly. Enter by pattern 79101112222");
    }
    if (!phone && (!inn || !password)) {
      throw new Error("Login and password or phone are required for authorization");
    }
    this.#deviceInfo.sourceDeviceId = createDeviceId();
    this.#authPromise = phone ? this.#authPhone(phone) : this.#authPassword(inn, password);   
    NalogClient.#instance = this;
  }

  async #authPassword(username?: string | number, password?: string) {
    const body = JSON.stringify({ username, password, deviceInfo: this.#deviceInfo });
    const r = await fetch(`${this.#apiUrl}/auth/lkfl`, { ...this.#fetchParams, body });
    const response = await r.json();
    this.#auth(response);
  }

  async #authPhone(phone: string | number) {
    const body = JSON.stringify({ phone, requireTpToBeActive: true });
    const r = await fetch(`${this.#apiUrl}/auth/challenge/sms/start`, { ...this.#fetchParams, body });
    const { challengeToken } = await r.json();
    const code = await getPhoneConfirmationCode();
    const bodyVerify = JSON.stringify({ deviceInfo: this.#deviceInfo, challengeToken, phone, code });
    const res = await fetch(`${this.#apiUrl}/auth/challenge/sms/verify`, { ...this.#fetchParams, body: bodyVerify });
    const response = await res.json();
    this.#auth(response);
  }

  #auth(response: INalogAuthResponse) {    
    if (!response.refreshToken) {
      throw new Error(response.message || "Authorization failed");
    }
    console.log("Authorization in lknpd.nalog.ru was successful");
    this.#inn = response.profile.inn;
    this.#token = response.token;
    this.#tokenExpireIn = response.tokenExpireIn;
    this.#refreshToken = response.refreshToken;    
    return response;
  }

  async #getToken() {
    await this.#authPromise;
    if (this.#token && !isExpiredToken(this.#tokenExpireIn)) {
      return this.#token;
    }
    const body = JSON.stringify({ deviceInfo: this.#deviceInfo, refreshToken: this.#refreshToken });
    const r = await fetch(`${this.#apiUrl}/auth/token`, { ...this.#fetchParams, body });
    const response = await r.json();   
    if (!response.token) {
      throw new Error(response.message || "Failed to refresh token");
    }
    this.#refreshToken = response.refreshToken || this.#refreshToken;
    this.#token = response.token;
    this.#tokenExpireIn = response.tokenExpireIn;
    return this.#token;
  }

  async callMethod(methodPath: string, data?: any) {
    const token = await this.#getToken();
    const body = data ? JSON.stringify(data) : undefined;
    const params = {
      ...this.#fetchParams,
      headers: {
        ...this.#fetchParams.headers,
        authorization: `Bearer ${token}`
      },     
      method: body ? "POST" : "GET",
      body
    };
    const r = await fetch(`${this.#apiUrl}/${methodPath}`, params);
    return await r.json();
  }

  protected async getInn(){
    await this.#authPromise;
    return this.#inn;
  }

  protected get apiUrl(){
    return this.#apiUrl;
  }
}

export default NalogClient;