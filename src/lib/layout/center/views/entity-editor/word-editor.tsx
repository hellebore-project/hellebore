import { Container, Tabs } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { WordViewKey } from "@/interface";
import { getService } from "@/services";
import { SPACE } from "@/shared/common";
import { TitleField } from "./title-field";
import { WordTable } from "./word-table";
import { MutableRefObject, useLayoutEffect, useRef } from "react";
import { getSize } from "@/shared/get-size";

const TABS = {
    [WordViewKey.RootWords]: "Root Words",
    [WordViewKey.Articles]: "Articles",
    [WordViewKey.Prepositions]: "Prepositions",
    [WordViewKey.Conjunctions]: "Conjunctions",
    [WordViewKey.Pronouns]: "Pronouns",
    [WordViewKey.Nouns]: "Nouns",
    [WordViewKey.Adjectives]: "Adjectives",
    [WordViewKey.Adverbs]: "Adverbs",
    [WordViewKey.Verbs]: "Verbs",
};

interface WordEditorTabSettings {
    label: string;
    value: WordViewKey;
}

function renderWordEditorTab({ label, value }: WordEditorTabSettings) {
    const wordEditor = getService().view.entityEditor.lexicon;
    return (
        <Tabs.Tab value={value} onClick={() => wordEditor.changeView(value)}>
            {label}
        </Tabs.Tab>
    );
}

const WordEditorTab = observer(renderWordEditorTab);

function renderWordEditorTabs() {
    return Object.entries(TABS).map((entry) => (
        <WordEditorTab
            key={`word-editor-tab-${entry[0]}`}
            value={entry[0] as WordViewKey}
            label={entry[1]}
        />
    ));
}

const WordEditorTabs = observer(renderWordEditorTabs);

function renderWordEditor() {
    let wordEditor = getService().view.entityEditor.lexicon;
    const containerRef = useRef<HTMLDivElement>(null);

    const size = getSize(
        containerRef as MutableRefObject<HTMLDivElement>,
        () => wordEditor.size,
        (s) => (wordEditor.size = s),
    );

    return (
        <Container display="flex" h="100%" style={{ flexDirection: "column" }}>
            <TitleField />
            {SPACE}

            <Tabs h="100%" value={wordEditor.viewKey}>
                <Tabs.List>
                    <WordEditorTabs />
                </Tabs.List>

                <Tabs.Panel value={wordEditor.viewKey} style={{ flexGrow: 1 }}>
                    <Container
                        id="word-editor-panel"
                        h="100%"
                        pt="sm"
                        ref={containerRef as MutableRefObject<HTMLDivElement>}
                    >
                        <WordTable container={{ h: size.height }} />
                    </Container>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}

export const WordEditor = observer(renderWordEditor);
