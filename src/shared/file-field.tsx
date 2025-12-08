import { open, save } from "@tauri-apps/plugin-dialog";
import { observer } from "mobx-react-lite";
import { CSSProperties } from "react";

import { TextField, TextFieldProps } from "./text-field";

export interface FileFieldProps extends TextFieldProps {
    mode: "save" | "open";
    onChangeFile?: (path: string) => void;
}

function renderFileField({
    mode,
    onChangeFile,
    styles,
    ...rest
}: FileFieldProps) {
    let getFilePath: () => Promise<string | null>;
    switch (mode) {
        case "open":
            getFilePath = open;
            break;
        case "save":
            getFilePath = save;
            break;
    }

    if (!styles) styles = {};
    if (typeof styles === "object") {
        styles["input"] = { cursor: "pointer", ...(styles?.input ?? {}) };

        let input: CSSProperties;
        if (Object.hasOwn(styles, "input")) input = styles["input"];
        else {
            input = {};
            styles["input"] = input;
        }

        input["cursor"] = "pointer";
    }

    return (
        <TextField
            onClick={async () => {
                const path = await getFilePath();
                onChangeFile?.(path ?? "");
            }}
            styles={styles}
            {...rest}
        />
    );
}

export const FileField = observer(renderFileField);
