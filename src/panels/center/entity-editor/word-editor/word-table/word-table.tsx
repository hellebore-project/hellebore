import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { Spreadsheet } from "@/shared/spreadsheet";

function renderWordTable() {
    const service = getService();
    const spreadsheetManager = service.view.entityEditor.lexicon.spreadsheet;
    return <Spreadsheet service={spreadsheetManager} />;
}

export const WordTable = observer(renderWordTable);
