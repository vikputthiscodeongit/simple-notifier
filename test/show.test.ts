import { expect, test, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import SimpleNotifier from "../src/index";

// TODO: Validate time to removal of notification from DOM.
test("Single parameter - text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Two parameters - text & variant success", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "success");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("success");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.classList).toContain("simple-notification--success");
    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Two parameters - text & variant warning", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "warning");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("warning");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.classList).toContain("simple-notification--warning");
    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Two parameters - text & variant error", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "error");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("error");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.classList).toContain("simple-notification--error");
    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

// TODO: Validate time to removal of notification from DOM.
test("Single parameter - options only text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Single parameter - options only text in custom element", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: {
            content: "Test notification text",
            el: "span",
        },
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "span"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("SPAN");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Single parameter - options only title", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toBe(null);
    expect(notification?.title).toStrictEqual(["Test notification title", "h6"]);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    const nTitleEl = notification?.el.querySelector(".simple-notification__title");
    expect(nTitleEl?.tagName).toBe("H6");
    expect(nTitleEl?.textContent).toBe("Test notification title");
    expect(notification?.el.querySelector(".simple-notification__text")).toBe(null);
});

test("Single parameter - options only title in custom element", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: {
            content: "Test notification title",
            el: "h5",
        },
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toBe(null);
    expect(notification?.title).toStrictEqual(["Test notification title", "h5"]);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    const nTitleEl = notification?.el.querySelector(".simple-notification__title");
    expect(nTitleEl?.tagName).toBe("H5");
    expect(nTitleEl?.textContent).toBe("Test notification title");
    expect(notification?.el.querySelector(".simple-notification__text")).toBe(null);
});

test("Single parameter - options title & text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: "Test notification text",
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toStrictEqual(["Test notification title", "h6"]);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    const nTitleEl = notification?.el.querySelector(".simple-notification__title");
    expect(nTitleEl?.tagName).toBe("H6");
    expect(nTitleEl?.textContent).toBe("Test notification title");
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Single parameter - options title & multi-line text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: ["Test notification text line 1", "Test notification text line 2"],
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([
        ["Test notification text line 1", "p"],
        ["Test notification text line 2", "p"],
    ]);
    expect(notification?.title).toStrictEqual(["Test notification title", "h6"]);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    const nTitleEl = notification?.el.querySelector(".simple-notification__title");
    expect(nTitleEl?.tagName).toBe("H6");
    expect(nTitleEl?.textContent).toBe("Test notification title");
    const nTextEls = notification?.el.querySelectorAll(".simple-notification__text");
    expect(nTextEls).not.toBe(null);
    expect(nTextEls?.[0].tagName).toBe("P");
    expect(nTextEls?.[0].textContent).toBe("Test notification text line 1");
    expect(nTextEls?.[1].tagName).toBe("P");
    expect(nTextEls?.[1].textContent).toBe("Test notification text line 2");
});

test("Single parameter - options title & multi-line text with custom element", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: [
            "Test notification text line 1",
            { content: "Test notification text line 2", el: "span" },
        ],
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([
        ["Test notification text line 1", "p"],
        ["Test notification text line 2", "span"],
    ]);
    expect(notification?.title).toStrictEqual(["Test notification title", "h6"]);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    const nTitleEl = notification?.el.querySelector(".simple-notification__title");
    expect(nTitleEl?.tagName).toBe("H6");
    expect(nTitleEl?.textContent).toBe("Test notification title");
    const nTextEls = notification?.el.querySelectorAll(".simple-notification__text");
    expect(nTextEls?.[0].tagName).toBe("P");
    expect(nTextEls?.[0].textContent).toBe("Test notification text line 1");
    expect(nTextEls?.[1].tagName).toBe("SPAN");
    expect(nTextEls?.[1].textContent).toBe("Test notification text line 2");
});

test("Single parameter - options no title or text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({});

    expect(notifier.currentId).toBe(0);
    expect(notifier.notifications.size).toBe(0);
});

// TODO: Validate time to removal of notification from DOM.
test("Single parameter - options text & auto hide enabled with custom value", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        hideAfterTime: 10000,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.ids.length).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(10000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

// TODO: Validate notification isn't automatically removed from DOM.
test("Single parameter - options text & auto hide disabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        hideAfterTime: 0,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.ids.length).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(0);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Single parameter - options text & hide older enabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification 1 text");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification 1 text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification 1 text");

    notifier.show({ text: "Test notification 2 text", variant: "warning", hideOlder: true });
    notifier.show({ text: "Test notification 3 text" }, "error");

    expect(notifier.notifications.size).toBe(1);
    expect(notifier.queue.length).toBe(2);

    await vi.waitFor(async () => {
        expect(notifier.notifications.size).toBe(2);
        expect(notifier.queue.length).toBe(0);
    });

    expect(notifier.currentId).toBe(3);

    const notification2 = notifier.notifications.get(1);
    expect(notification2?.text).toStrictEqual([["Test notification 2 text", "p"]]);
    expect(notification2?.title).toBe(null);
    expect(notification2?.variant).toBe("warning");
    expect(notification2?.hideAfterTime).toBe(4000);
    expect(notification2?.hideOlder).toBe(true);
    expect(notification2?.dismissible).toBe(false);

    const notification3 = notifier.notifications.get(2);
    expect(notification3?.text).toStrictEqual([["Test notification 3 text", "p"]]);
    expect(notification3?.title).toBe(null);
    expect(notification3?.variant).toBe("error");
    expect(notification3?.hideAfterTime).toBe(4000);
    expect(notification3?.hideOlder).toBe(false);
    expect(notification3?.dismissible).toBe(false);

    await waitFor(() => expect(notification3?.el).toBeInTheDocument());

    expect(notification2?.el).toBeInTheDocument();
    expect(notification2?.el.querySelector(".simple-notification__title")).toBe(null);
    const n2TextEl = notification2?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(n2TextEl?.textContent).toBe("Test notification 2 text");

    expect(notification3?.el.querySelector(".simple-notification__title")).toBe(null);
    const n3TextEl = notification3?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(n3TextEl?.textContent).toBe("Test notification 3 text");
});

test("Single parameter - options text & dismissible enabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        dismissible: true,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(true);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
    expect(notification?.el.querySelector(".simple-notification__hide-button")).not.toBe(null);
});

test("Two parameters - options & variant", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ text: "Test notification text" }, "warning");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("warning");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.classList).toContain("simple-notification--warning");
    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Two parameters - options with variant & variant", async () => {
    const notifier = new SimpleNotifier();
    notifier.show(
        {
            text: "Test notification text",
            variant: "warning",
        },
        "error",
    );

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([["Test notification text", "p"]]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("error");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.classList).toContain("simple-notification--error");
    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification text");
});
