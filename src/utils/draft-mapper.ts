import { getDateCalendar, convertStringDateToObj } from "@/utils/time.util";

// Using loose typing to minimize coupling. Draft data in UI often includes Date objects and nested arrays.

export type AnyDraft = Record<string, unknown>;

export const convertDraftToDraftDTO = (draft: AnyDraft): AnyDraft => {
  const dto: AnyDraft = {};
  Object.assign(dto, draft);

  // Convert Date object to yyyy-MM-dd string format for BE
  if (draft?.dateIssued !== undefined) {
    if (draft.dateIssued instanceof Date) {
      // JavaScript Date object - format to yyyy-MM-dd
      const year = draft.dateIssued.getFullYear();
      const month = String(draft.dateIssued.getMonth() + 1).padStart(2, "0");
      const day = String(draft.dateIssued.getDate()).padStart(2, "0");
      dto.dateIssued = `${year}-${month}-${day}`;
    } else if (
      draft.dateIssued &&
      typeof draft.dateIssued === "object" &&
      "year" in draft.dateIssued
    ) {
      // NgbDate-like object {year, month, day}
      dto.dateIssued = getDateCalendar(draft.dateIssued);
    } else if (typeof draft.dateIssued === "string") {
      // Already a string, keep as-is
      dto.dateIssued = draft.dateIssued;
    } else {
      dto.dateIssued = "";
    }
  }

  // Convert number fields to ensure they're numbers, not strings
  if (dto.numberInBook !== undefined && dto.numberInBook !== null) {
    dto.numberInBook =
      typeof dto.numberInBook === "string"
        ? parseInt(dto.numberInBook, 10)
        : dto.numberInBook;
  }
  if (dto.docTypeId !== undefined && dto.docTypeId !== null) {
    dto.docTypeId =
      typeof dto.docTypeId === "string"
        ? parseInt(dto.docTypeId, 10)
        : dto.docTypeId;
  }
  if (dto.bookId !== undefined && dto.bookId !== null) {
    dto.bookId =
      typeof dto.bookId === "string" ? parseInt(dto.bookId, 10) : dto.bookId;
  }
  if (dto.securityId !== undefined && dto.securityId !== null) {
    dto.securityId =
      typeof dto.securityId === "string"
        ? parseInt(dto.securityId, 10)
        : dto.securityId;
  }
  if (dto.docFieldId !== undefined && dto.docFieldId !== null) {
    dto.docFieldId =
      typeof dto.docFieldId === "string"
        ? parseInt(dto.docFieldId, 10)
        : dto.docFieldId;
  }
  if (dto.urgentId !== undefined && dto.urgentId !== null) {
    dto.urgentId =
      typeof dto.urgentId === "string"
        ? parseInt(dto.urgentId, 10)
        : dto.urgentId;
  }
  if (dto.orgIssuedId !== undefined && dto.orgIssuedId !== null) {
    dto.orgIssuedId =
      typeof dto.orgIssuedId === "string"
        ? parseInt(dto.orgIssuedId, 10)
        : dto.orgIssuedId;
  }
  if (dto.orgCreateId !== undefined && dto.orgCreateId !== null) {
    dto.orgCreateId =
      typeof dto.orgCreateId === "string"
        ? parseInt(dto.orgCreateId, 10)
        : dto.orgCreateId;
  }

  // Map listReceive to receiveToKnowDtos for BE
  if (Array.isArray(draft?.listReceive)) {
    dto.receiveToKnowDtos = draft.listReceive;
  } else {
    dto.receiveToKnowDtos = [];
  }

  // Convert empty listSignersName to null
  if (dto.listSignersName === "" || dto.listSignersName === undefined) {
    dto.listSignersName = null;
  }

  // Remove attachments array - files are uploaded separately
  //delete dto.attachments;

  // Remove id field - BE will generate it
  delete dto.id;

  // Remove UI-only fields that shouldn't be sent to BE
  delete dto.listAttachVersion;
  delete dto.nodeId;
  delete dto.docSecurityName;
  delete dto.docTypeName;
  delete dto.docUrgentName;
  delete dto.bookName;
  delete dto.listRelateTask;
  delete dto.docFieldsName;
  delete dto.listSignerIds;
  delete dto.relateTaskIds;
  delete dto.personEnterName;
  delete dto.docId;
  delete dto.replyTask;

  // Remove note if empty
  if (dto.note === "" || dto.note === undefined) {
    delete dto.note;
  }

  return dto;
};

export const convertDraftDtoToDraft = (dto: AnyDraft): AnyDraft => {
  const draft: AnyDraft = {};
  Object.assign(draft, dto);

  if (dto?.dateIssued !== undefined) {
    if (dto.dateIssued === null) {
      draft.dateIssued = null;
    } else if (typeof dto.dateIssued === "string") {
      draft.dateIssued = convertStringDateToObj(dto.dateIssued, true);
    } else {
      // If it's not a string or null (e.g. already an object), keep as-is
      draft.dateIssued = dto.dateIssued;
    }
  }

  return draft;
};
