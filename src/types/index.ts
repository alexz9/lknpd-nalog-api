export interface INalogApiInitParams {
  inn?: string | number
  password?: string
  phone?: string | number
}

interface INalogApiError{
  message: string
  code: string
}

export interface IServiceIncome {
  name: string,
  amount: number | string // 00.00 | 00 | "00.00" | "00"
  quantity: number // в чеке не отображается
}

export interface INalogAuthResponse extends INalogApiError{
  refreshToken: string
  refreshTokenExpiresIn: string | null
  token: string
  tokenExpireIn: string
  profile: INalogProfile
}

export interface INalogAddIncomeResponse extends INalogApiError{
  approvedReceiptUuid: string,
}

export interface INalogCancelIncomeResponse extends INalogApiError{
  incomeInfo: {
    approvedReceiptUuid: string,
    name: string,
    operationTime: Date,
    requestTime: Date,
    paymentType: "CASH",
    partnerCode: null,
    totalAmount: number,
    cancellationInfo: {
      operationTime: Date,
      registerTime: Date,
      taxPeriodId: number,
      comment: string
    },
    sourceDeviceId: string
  }  
}

export interface INalogReceiptIncome {
  cancellationInfo: null
  clientDisplayName: null
  clientInn: null
  description: []
  email: null
  incomeType: "FROM_INDIVIDUAL"
  inn: string
  invoiceId: null
  operationTime: Date
  partnerDisplayName: null
  partnerInn: null
  paymentType: "CASH"
  phone: null
  profession: string
  receiptId: string
  registerTime: Date
  requestTime: Date
  services: IServiceIncome[]
  sourceDeviceId: string
  taxPeriodId: number
  totalAmount: number
}

export interface INalogProfile {
  lastName: string | null
  id: number
  displayName: string
  middleName: string | null
  email: string | null
  phone: string
  inn: string
  snils: string | null
  avatarExists: boolean
  initialRegistrationDate: Date
  registrationDate: Date
  firstReceiptRegisterTime: null
  firstReceiptCancelTime: null
  hideCancelledReceipt: boolean
  registerAvailable: null
  status: "ACTIVE" | string
  restrictedMode: boolean
  pfrUrl: string | null
  login: string | null
}