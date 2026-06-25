export function isCellSelected(cell: HTMLElement) {
    return cell.getAttribute("data-selected") === "true";
}
