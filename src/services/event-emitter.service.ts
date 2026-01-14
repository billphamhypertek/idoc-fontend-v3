import { Subject } from "rxjs";

const decryptResultSubject = new Subject<Blob>();
export const decryptResult$ = decryptResultSubject.asObservable();
export function emitDecryptedFile(file: Blob) {
  decryptResultSubject.next(file);
}

const changeMessageSubject = new Subject<string>();
export const currentMessage$ = changeMessageSubject.asObservable();
export function changeMessage(text: string) {
  changeMessageSubject.next(text);
}
