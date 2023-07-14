export interface Attachments {
  total: number;
  attachments: Attachment[];
}
interface Attachment {
  name: string;
  url: string;
}

export interface Messages {
  id: number;
  isRead: boolean;
  tenantId: number;
  type: string;
  incoming: boolean;
  timestamp: number;
  msgStatus: string;
  failures: number;
  identifier: string;
  senderIdentifier: string;
  receiverIdentifier: string;
  attachmentPaths: string[];
  failureReason: string;
  attachmentInfo: AttachmentInfo[];
  as2MessageId: string;
  mic: string;
  signed: boolean;
  subject: string;
  mdnStatus: string;
  compressed: boolean;
  encrypted: boolean;
  micMatches: boolean;
  userAgent: string;
  executionName: string;
  autoRetryCount: number;
  transportHeaders: TransportHeaders;
  failureStackTrace: string;
  mdnFailureReason: string;
  msgExecutionStatus: number;
  transportStatusReceived: number;
  deletedAttachmentsOnSuccessMdn: boolean;
  mdnMessage: MdnMessage;
  senderAS2Id: string;
  receiverAS2Id: string;
  mdnStatusCode: number;
  msgStatusCode: number;
}
interface AttachmentInfo {
  size: string;
  name: string;
}
interface MdnMessage {
  mdnId: string;
  messageId: number;
  as2MessageId: string;
  disposition: string;
  humanMessage: string;
  rawMdnS3Key: string;
  mic: string;
  signed: boolean;
  incoming: boolean;
  status: number;
  timestamp: number;
}
interface TransportHeaders {
  "CloudFront-Viewer-Country": string;
  "CloudFront-Forwarded-Proto": string;
  "CloudFront-Is-Tablet-Viewer": string;
  "AS2-From": string;
  "User-Agent": string;
  "Accept-Encoding": string;
  "Message-ID": string;
  "Disposition-Notification-Options": string;
  "EDIINT-Features": string;
  "X-Amz-Cf-Id": string;
  "AS2-To": string;
  "CloudFront-Viewer-ASN": string;
  "CloudFront-Is-Desktop-Viewer": string;
  "Recipient-Address": string;
  "CloudFront-Is-Mobile-Viewer": string;
  "X-Forwarded-Proto": string;
  "CloudFront-Is-SmartTV-Viewer": string;
  "Disposition-Notification-To": string;
  "AS2-Version": string;
  Host: string;
  From: string;
  "X-Forwarded-Port": string;
  Date: string;
  Subject: string;
  "X-Amzn-Trace-Id": string;
  Via: string;
  "Content-type": string;
  "Content-Disposition": string;
  "X-Forwarded-For": string;
  "Mime-Version": string;
}
