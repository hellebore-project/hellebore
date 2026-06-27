import { test as baseTest } from "@tests/unit/fixtures";

import { TreeService, type TreeNodeInfo } from "@/lib/components/tree";

export interface TestData {
    kind: string;
}

export interface TreeServiceTestFixtures {
    rootNodeId: string;
    branchNodes: TreeNodeInfo<TestData>[];
    leafNodes: TreeNodeInfo<TestData>[];
    service: TreeService<TestData>;
}

export const test = baseTest.extend<TreeServiceTestFixtures>({
    rootNodeId: "root",
    branchNodes: [],
    leafNodes: [],
    service: async ({ rootNodeId, branchNodes, leafNodes }, use) => {
        const service = new TreeService<TestData>({
            id: "tree-test",
            rootNodeId,
        });
        service.onSelectLeafNode.subscribe(() => undefined);
        service.load(branchNodes, leafNodes);
        use(service);
    },
});

export function getNodeElement(container: HTMLElement, label: string) {
    return [...container.querySelectorAll('[role="button"]')].find(
        (button) =>
            button.querySelector("span.truncate")?.textContent?.trim() ===
            label,
    ) as HTMLElement;
}

export function getChildNodeNames(container: HTMLElement, nodeLabel: string) {
    const nodeElement = getNodeElement(container, nodeLabel);
    if (!nodeElement) return [];

    const childList = nodeElement
        .closest("li")
        ?.querySelector(":scope > div + div ul");
    if (!childList) return [];

    return [...childList.children]
        .map((child) =>
            child.querySelector("span.truncate")?.textContent?.trim(),
        )
        .filter((name): name is string => Boolean(name));
}

export function getRootNodeNames(container: HTMLElement) {
    const rootList = container.querySelector("ul");
    if (!rootList) return [];

    return [...rootList.children]
        .map((child) =>
            child.querySelector("span.truncate")?.textContent?.trim(),
        )
        .filter((name): name is string => Boolean(name));
}
