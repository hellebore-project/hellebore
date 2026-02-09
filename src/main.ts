import { mount } from "svelte";

import "./global.css";

import Client from "@/ui/client.svelte";

const app = mount(Client, {
    target: document.getElementById("app")!,
});

export default app;
