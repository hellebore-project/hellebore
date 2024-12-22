import { Title } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";

function renderHome() {
    const service = getService();
    console.log(service.view.projectName);
    return (
        <div className="container">
            <Title order={1}>{service.view.projectName}</Title>
        </div>
    );
}

export const Home = observer(renderHome);
