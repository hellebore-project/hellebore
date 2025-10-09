import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { Spreadsheet } from "@/shared/spreadsheet";

function renderWordTable() {
    const service = getService();
    const spreadsheetManager = service.entryEditor.lexicon.spreadsheet;
    return <Spreadsheet service={spreadsheetManager} />;
}

export const WordTable = observer(renderWordTable);
