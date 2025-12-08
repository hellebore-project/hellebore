import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

interface NavItemIndentProps {
    itemKey: string;
    rank: number;
}

function renderNavItemIndents({ itemKey, rank }: NavItemIndentProps) {
    if (rank <= 0) return null;

    const indents: ReactNode[] = [
        <div
            key={`${itemKey}-indent-${0}`}
            className="nav-item-indent nav-sub-item compact"
        />,
    ];
    if (rank > 1) {
        for (let i = 1; i < rank; i++)
            indents.push(
                <div
                    key={`${itemKey}-indent-${i}`}
                    className="nav-item-indent nav-sub-item compact scaffold"
                />,
            );
    }

    return indents;
}

export const NavItemIndents = observer(renderNavItemIndents);
