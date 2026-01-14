import { Attachment } from "@/definitions/interfaces/vehicle.interface";
import { convertStringDateToObj } from "./time.util";
import { toDateOnly } from "./common.utils";

interface DocumentDto {
  id: number;

  bookId: number;

  numberOrSign: string;

  dateIssued: string;

  dateArrival: string;

  numberArrival: number;

  numberSupport: string;

  docTypeId: number;

  docFieldsId: number;

  urgentId: number;

  securityId: number;

  methodReceiptId: number;

  statusReceiptId: number;

  docStatusId: number;

  legalDoc: boolean;

  rqRely: boolean;

  feedback: boolean;

  sendEnvelope: boolean;

  orgIssuedId: number;

  orgIssuedName: string;

  personSign: string;

  personEnter: string;

  placeSend: string;

  deadline: string;

  dayLeft: number;

  preview: string;

  attachments: Attachment[];

  active: boolean;

  node: number;

  files: File;

  receivedDate: string;

  placeReceive: string;

  documentDetail: string;

  orgReceiveDocument: string;

  isComplete: boolean;
}

export const convertDocumentToDocumentDTO = (document: DocumentDto) => {
  const documentDto: DocumentDto = {} as DocumentDto;
  Object.assign(documentDto, document);

  // Normalize dates robustly to YYYY-MM-DD (handles Date, ISO, dd/MM/yyyy, timestamps)
  const toDateOnlyAny = (v: any): string => {
    if (v instanceof Date) {
      const t = v.getTime();
      return Number.isNaN(t) ? "" : v.toISOString().slice(0, 10);
    }
    if (typeof v === "string" || typeof v === "number") {
      return toDateOnly(v) ?? "";
    }
    return "";
  };

  documentDto.dateIssued = toDateOnlyAny((document as any)?.dateIssued);
  documentDto.dateArrival = toDateOnlyAny((document as any)?.dateArrival);
  documentDto.deadline = toDateOnlyAny((document as any)?.deadline);
  documentDto.receivedDate = toDateOnlyAny((document as any)?.receivedDate);

  if (Array.isArray(document.attachments)) {
    const flatList: Attachment[] = [];

    for (const item of document.attachments) {
      if (Array.isArray(item)) {
        flatList.push(...item);
      } else if (item) {
        flatList.push(item);
      }
    }

    documentDto.attachments = flatList;
  } else {
    documentDto.attachments = [];
  }

  return documentDto;
};

export const convertDocumentDtoToDocument = (documentDto: DocumentDto) => {
  const document: DocumentDto = {} as DocumentDto;

  Object.assign(document, documentDto);

  document.dateIssued = convertStringDateToObj(documentDto.dateIssued, true);
  document.dateArrival = convertStringDateToObj(documentDto.dateArrival, true);
  document.deadline = convertStringDateToObj(documentDto.deadline, true);
  document.receivedDate = convertStringDateToObj(
    documentDto.receivedDate,
    true
  );

  return document;
};
