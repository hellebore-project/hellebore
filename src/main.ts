import { attachConsole } from "@tauri-apps/plugin-log";
import { mount } from "svelte";

import "./global.css";

import Client from "@/ui/client.svelte";

attachConsole();

const app = mount(Client, {
    target: document.getElementById("app")!,
});

export default app;
