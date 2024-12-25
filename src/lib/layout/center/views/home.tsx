import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { TextField } from "@/shared/text-field";
import { Divider, Space } from "@mantine/core";

const SPACE = <Space h="lg" />;
const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

function renderHome() {
    const service = getService();
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
            <Divider my="sm" />
            {SPACE}
        </div>
    );
}

export const Home = observer(renderHome);
