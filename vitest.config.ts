import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            instances: [{ browser: "chromium" }, { browser: "firefox" }],
            headless: true,
            provider: playwright(),
            screenshotFailures: false,
        },
    },
});
