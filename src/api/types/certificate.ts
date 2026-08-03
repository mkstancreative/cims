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
    /** itPeriod lives directly on student in the certificate response */
    itPeriod?: {
      name: string;
      startDate: string;
      endDate: string;
      duration: number;
    };
  };
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  internship?: string;
  graduationYear: number;
  graduationMonth: string;
  graduationDate?: string;
  placeOfIT?: string;
  certificateNumber?: string;
  finalGrade?: string;
  finalScore?: number;
  issuedAt?: string;
  approvalStatus: "pending" | "approved" | "rejected";
  qrCodeData?: {
    certificateId: string;
    certificateNumber: string;
    studentName: string;
    registrationNumber: string;
    department: string;
    program: string;
    graduationYear: number;
    PlaceOfIT: string;
    grade: string;
  };
  createdAt: string;
  updatedAt: string;
}
