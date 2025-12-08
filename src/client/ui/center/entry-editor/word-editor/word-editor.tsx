import "./word-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import {
    WordColumnKeys,
    WordEditorService,
    WordMetaData,
    WordViewType,
} from "@/client";
import { SPACE } from "@/shared/common";
import { Spreadsheet, SpreadsheetService } from "@/shared/spreadsheet";
import { TabData, Tabs } from "@/shared/tabs";

import { TitleField } from "../title-field";

const TAB_DATA: TabData[] = [
    { label: "Root Words", value: WordViewType.RootWords },
    { label: "Determiners", value: WordViewType.Determiners },
    { label: "Prepositions", value: WordViewType.Prepositions },
    { label: "Conjunctions", value: WordViewType.Conjunctions },
    { label: "Pronouns", value: WordViewType.Pronouns },
    { label: "Nouns", value: WordViewType.Nouns },
    { label: "Adjectives", value: WordViewType.Adjectives },
    { label: "Adverbs", value: WordViewType.Adverbs },
    { label: "Verbs", value: WordViewType.Verbs },
];

interface WordTableProps {
    service: SpreadsheetService<WordColumnKeys, WordMetaData>;
}

interface WordEditorProps {
    service: WordEditorService;
}

function renderWordTable({ service }: WordTableProps) {
    return <Spreadsheet service={service} />;
}

export const WordTable = observer(renderWordTable);

function renderWordEditor({ service }: WordEditorProps) {
    return (
        <Container className="word-editor">
            <Stack className="word-editor-stack" justify="flex-start" gap={0}>
                <TitleField service={service.info} />
                {SPACE}

                <Tabs
                    data={TAB_DATA}
                    selectedValue={service.viewKey}
                    className="word-editor-tabs"
                    tabProps={{
                        onClick: (e) =>
                            service.changeView(
                                e.currentTarget.value as WordViewType,
                            ),
                    }}
                />

                <Spreadsheet service={service.spreadsheet} />
            </Stack>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
