export interface RRRData {
  certificateId?: string;
  orderId: string;
  rrr: string;
  amount: number;
  merchantId?: string;
}

export interface CertificateStatus {
  paymentStatus: "pending" | "successful" | "failed";
  approvalStatus: "pending" | "approved" | "rejected";
  canDownload: boolean;
  rrr?: string;
  amount?: number;
  orderId: string;
  merchantId?: string;
  certificateId?: string;
  certificateNumber?: string;
  graduationYear?: number;
  graduationMonth?: string;
  graduationDate?: string;
  placeOfIT?: string;
  requestId?: string;
  rejectionReason?: string;
  issuedAt?: string;
}

export interface AdminCertificateRequest {
  _id: string;
  student: {
    department: {
      name: string;
      code: string;
    };
    program: {
      type: string;
      level: string;
    };
    _id: string;
    registrationNumber: string;
    batch?: {
      itPeriod: {
        name: string;
        startDate: string;
        endDate: string;
        duration: number;
      };
      _id: string;
    };
  };
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  graduationYear: number;
  graduationMonth: string;
  graduationDate: string;
  placeOfIT: string;
  paymentStatus: "pending" | "successful" | "failed";
  paymentAmount?: number;
  rrr?: string;
  certificateNumber?: string;
  issuedAt?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  documents: {
    ndStatementOfResult?: { url: string };
    hndStatementOfResult?: { url: string };
    itDischargeLetter?: { url: string };
  };
  createdAt: string;
  updatedAt: string;
}
