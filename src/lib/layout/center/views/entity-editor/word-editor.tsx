import { Container, Tabs } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SPACE } from "@/shared/common";
import { TitleField } from "./title-field";
import { WordTable } from "./word-table";
import { WordViewKey } from "@/interface";

function renderWordEditor() {
    const activeTab = WordViewKey.ROOT_WORDS;

    return (
        <Container>
            <TitleField />
            {SPACE}

            <Tabs defaultValue={WordViewKey.ROOT_WORDS}>
                <Tabs.List>
                    <Tabs.Tab value={WordViewKey.ROOT_WORDS}>
                        Root Words
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value={activeTab}>
                    <Container pt="sm">
                        <WordTable />
                    </Container>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
