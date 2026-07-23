import { DocumentType } from "@/generated/prisma/client";

const EXT_TYPE_MAP: Record<string, DocumentType> = {
  dwg: DocumentType.CAD_DRAWING,
  dxf: DocumentType.CAD_DRAWING,
  docx: DocumentType.OFFICE_FILE,
  xlsx: DocumentType.OFFICE_FILE,
  pptx: DocumentType.OFFICE_FILE,
  jpg: DocumentType.IMAGE,
  jpeg: DocumentType.IMAGE,
  png: DocumentType.IMAGE,
  tiff: DocumentType.IMAGE,
  mp4: DocumentType.VIDEO,
  zip: DocumentType.OTHER,
  pdf: DocumentType.OFFICE_FILE,
};

export function inferDocumentType(fileName: string): DocumentType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TYPE_MAP[ext] ?? DocumentType.OTHER;
}
