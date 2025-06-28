import "./word-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { WordViewKey } from "@/interface";
import { getService } from "src/services";
import { SPACE } from "src/shared/common";
import { TitleField } from "../title-field";
import { WordTable } from "./word-table";
import { TabData, Tabs } from "src/shared/tabs";

const TAB_DATA: TabData[] = [
    { label: "Root Words", value: WordViewKey.RootWords },
    { label: "Articles", value: WordViewKey.Articles },
    { label: "Prepositions", value: WordViewKey.Prepositions },
    { label: "Conjunctions", value: WordViewKey.Conjunctions },
    { label: "Pronouns", value: WordViewKey.Pronouns },
    { label: "Nouns", value: WordViewKey.Nouns },
    { label: "Adjectives", value: WordViewKey.Adjectives },
    { label: "Adverbs", value: WordViewKey.Adverbs },
    { label: "Verbs", value: WordViewKey.Verbs },
];

function renderWordEditor() {
    let wordEditor = getService().view.entityEditor.lexicon;
    return (
        <Container className="word-editor">
            <Stack className="word-editor-stack" justify="flex-start" gap={0}>
                <TitleField />
                {SPACE}

                <Tabs
                    data={TAB_DATA}
                    selectedValue={wordEditor.viewKey}
                    className="word-editor-tabs"
                    tabSettings={{
                        onClick: (e) =>
                            wordEditor.changeView(
                                e.currentTarget.value as WordViewKey,
                            ),
                    }}
                />

                <WordTable />
            </Stack>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
