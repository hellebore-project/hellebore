import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { DIVIDER, SPACE } from "@/shared/common";
import { TextField } from "@/shared/text-field";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

function renderHome() {
    const service = getService();
    if (!service.domain.hasProject) return null;
    return (
        <div className="container">
            <TextField
                variant="unstyled"
                mx="12"
                placeholder="Wiki"
                getValue={() => service.view.home.projectName}
                getError={() => {
                    if (service.view.home.projectName == "")
                        return "Empty title";
                    return null;
                }}
                onChange={(event) =>
                    (service.view.home.projectName = event.currentTarget.value)
                }
                styles={TITLE_FIELD_STYLES}
            />
            {DIVIDER}
            {SPACE}
        </div>
    );
}

export const Home = observer(renderHome);
