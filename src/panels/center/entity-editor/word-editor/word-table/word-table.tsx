import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { Spreadsheet } from "@/shared/spreadsheet";

function renderWordTable() {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;

    return (
        <Spreadsheet
            rowData={wordEditor.rowData}
            columnData={wordEditor.columnData}
            onEditCell={(i, k, v) => wordEditor.editCell(i, k, v)}
            onHighlightRow={(k) => wordEditor.highlightWord(k)}
            onUnhighlightRow={(k) => wordEditor.unhighlightWord(k)}
            onDeleteRow={(k) => wordEditor.deleteWord(k)}
        />
    );
}

export const WordTable = observer(renderWordTable);
