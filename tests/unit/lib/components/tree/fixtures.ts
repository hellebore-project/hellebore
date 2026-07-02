import { test as baseTest } from "@tests/unit/fixtures";

import { TreeService, type TreeNodeInfo } from "@/lib/components/tree";

export interface TestTreeNodeData {
    kind: string;
}

export interface TreeTestFixtures {
    rootNodeId: string;
    branchNodes: TreeNodeInfo<TestTreeNodeData>[];
    leafNodes: TreeNodeInfo<TestTreeNodeData>[];
    service: TreeService<TestTreeNodeData>;
}

export const test = baseTest.extend<TreeTestFixtures>({
    rootNodeId: "root",
    branchNodes: [],
    leafNodes: [],
    service: async ({ rootNodeId, branchNodes, leafNodes }, use) => {
        const service = new TreeService<TestTreeNodeData>({
            id: "tree-test",
            rootNodeId,
        });
        service.onSelectLeafNode.subscribe(() => undefined);
        service.load(branchNodes, leafNodes);
        use(service);
    },
});

export function getRootNode(container: HTMLElement) {
    return container.querySelector("ul");
}

export function getRootChildNames(container: HTMLElement) {
    const rootList = getRootNode(container);
    if (!rootList) return [];

    return [...rootList.children]
        .map((child) =>
            child.querySelector("span.truncate")?.textContent?.trim(),
        )
        .filter((name): name is string => Boolean(name));
}

export function getNode(container: HTMLElement, label: string) {
    return [...container.querySelectorAll('[role="button"]')].find(
        (button) =>
            button.querySelector("span.truncate")?.textContent?.trim() ===
            label,
    ) as HTMLElement;
}

export function getChildNames(container: HTMLElement, nodeLabel: string) {
    const nodeElement = getNode(container, nodeLabel);
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
