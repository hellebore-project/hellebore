import "./word-editor.css";

import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { MutableRefObject, useRef } from "react";

import { WordViewKey } from "@/interface";
import { getService } from "@/services";
import { SPACE } from "@/shared/common";
import { getSize } from "@/shared/get-size";
import { TitleField } from "../title-field";
import { WordTable } from "./word-table";
import { TabData, Tabs } from "@/shared/tabs";

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
    const containerRef = useRef<HTMLDivElement>(null);

    const size = getSize(
        containerRef as MutableRefObject<HTMLDivElement>,
        () => wordEditor.size,
        (s) => (wordEditor.size = s),
    );

    return (
        <Container className="word-editor">
            <Stack className="word-editor-stack" justify="flex-start">
                <TitleField />
                {SPACE}

                <Tabs
                    data={TAB_DATA}
                    selectedValue={wordEditor.viewKey}
                    tabSettings={{
                        onClick: (e) =>
                            wordEditor.changeView(
                                e.currentTarget.value as WordViewKey,
                            ),
                    }}
                />

                <div
                    className="word-table-container"
                    ref={containerRef as MutableRefObject<HTMLDivElement>}
                >
                    <WordTable style={{ h: size.height }} />
                </div>
            </Stack>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
