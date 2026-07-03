export const INSCRICAO_MODAL_EVENT = "open-inscricao-modal"

export function openInscricaoModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INSCRICAO_MODAL_EVENT))
  }
}
