import "./title-field.css";

import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { DIVIDER } from "@/shared/common";
import { TextField } from "@/shared/text-field";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

function renderTitleField() {
    const service = getService();
    return (
        <>
            <TextField
                className="title-field"
                variant="unstyled"
                styles={TITLE_FIELD_STYLES}
                placeholder="Title"
                getValue={() => service.view.entityEditor.title}
                getError={() => {
                    if (service.view.entityEditor.title == "")
                        return "Empty title";
                    if (!service.view.entityEditor.info.isTitleUnique)
                        return "Duplicate title";
                    return null;
                }}
                onChange={(event) =>
                    (service.view.entityEditor.title =
                        event.currentTarget.value)
                }
            />
            {DIVIDER}
        </>
    );
}

export const TitleField = observer(renderTitleField);
