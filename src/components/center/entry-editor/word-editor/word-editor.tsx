import "./word-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { WordViewType } from "@/constants";
import { WordMetaData } from "@/interface";
import { SPACE } from "@/components/lib/common";
import { Spreadsheet, SpreadsheetService } from "@/components/lib/spreadsheet";
import { TabData, Tabs } from "@/components/lib/tabs";

import { TitleField } from "../title-field";
import { WordEditorService, WordColumnKeys } from "./word-editor.service";

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
    const portalProps = {
        target: service.reference.fetchPortalSelector.produce(),
    };

    return (
        <Spreadsheet
            service={service}
            cellProps={{
                selectProps: {
                    dropdownProps: { portalProps },
                },
            }}
            tooltipProps={{ portalProps }}
        />
    );
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

                <WordTable service={service.spreadsheet} />
            </Stack>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
