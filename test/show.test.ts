import { expect, test, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import SimpleNotifier from "../src/index";
import "../src/style.css";

// TODO: Validate time to removal of notification from DOM.
test("Notification with show text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show text & variant success", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "success");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show text & variant warning", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "warning");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show text & variant error", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification text", "error");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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
test("Notification with show options only text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ text: "Test notification text" });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show options only text with HTML", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ text: ["<strong>Test notification text</strong>"] });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["<strong>Test notification text</strong>"]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(false);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.innerHTML.startsWith("<strong>")).toBe(true);
    expect(nTextEl?.innerHTML.endsWith("</strong>")).toBe(true);
    expect(nTextEl?.textContent).toBe("Test notification text");
});

test("Notification with show options only title", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ title: "Test notification title" });

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

test("Notification with show options only title in custom element", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ title: ["Test notification title", "h5"] });

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

test("Notification with show options title & text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: "Test notification text",
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show options title & multi-line text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: ["Test notification text line 1", "Test notification text line 2"],
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([
        "Test notification text line 1",
        "Test notification text line 2",
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

test("Notification with show options title & multi-line text with HTML", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        title: "Test notification title",
        text: ["Test notification text line 1", "<strong>Test notification text line 2</strong>"],
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual([
        "Test notification text line 1",
        "<strong>Test notification text line 2</strong>",
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
    expect(nTextEls?.[1].tagName).toBe("P");
    expect(nTextEls?.[1].innerHTML.startsWith("<strong>")).toBe(true);
    expect(nTextEls?.[1].innerHTML.endsWith("</strong>")).toBe(true);
    expect(nTextEls?.[1].textContent).toBe("Test notification text line 2");
});

test("Notification with show options no title or text", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({});

    expect(notifier.currentId).toBe(0);
    expect(notifier.notifications.size).toBe(0);
});

// TODO: Validate time to removal of notification from DOM.
test("Notification with show options text & auto hide enabled with custom value", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        hideAfterTime: 10000,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.ids.length).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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
test("Notification with show options text & auto hide disabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        hideAfterTime: 0,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.ids.length).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show options text & hide older enabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show("Test notification 1 text");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification 1 text"]);
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

    notifier.show({
        text: "Test notification 2 text",
        variant: "warning",
        hideOlder: true,
    });
    notifier.show("Test notification 3 text", "error");

    expect(notifier.notifications.size).toBe(1);
    expect(notifier.queue.length).toBe(2);

    await vi.waitFor(async () => {
        expect(notifier.currentId).toBe(3);
    });

    expect(notifier.notifications.size).toBe(2);
    expect(notifier.queue.length).toBe(0);

    const notification2 = notifier.notifications.get(1);
    expect(notification2?.text).toStrictEqual(["Test notification 2 text"]);
    expect(notification2?.title).toBe(null);
    expect(notification2?.variant).toBe("warning");
    expect(notification2?.hideAfterTime).toBe(4000);
    expect(notification2?.hideOlder).toBe(true);
    expect(notification2?.dismissible).toBe(false);

    const notification3 = notifier.notifications.get(2);
    expect(notification3?.text).toStrictEqual(["Test notification 3 text"]);
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

test("Notification with show options text & hide older disabled but enabled on instance", async () => {
    const notifier = new SimpleNotifier({ hideOlder: true });

    // 1
    notifier.show("Test notification 1 text");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification 1 text"]);
    expect(notification?.title).toBe(null);
    expect(notification?.variant).toBe("default");
    expect(notification?.hideAfterTime).toBe(4000);
    expect(notification?.hideOlder).toBe(true);
    expect(notification?.dismissible).toBe(false);

    await waitFor(() => expect(notification?.el).toBeInTheDocument());

    expect(notification?.el.querySelector(".simple-notification__title")).toBe(null);
    const nTextEl = notification?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(nTextEl?.textContent).toBe("Test notification 1 text");

    // 2
    notifier.show({
        text: "Test notification 2 text",
        variant: "warning",
        hideOlder: false,
    });

    expect(notifier.notifications.size).toBe(2);
    expect(notifier.currentId).toBe(2);

    const notification2 = notifier.notifications.get(1);
    expect(notification2?.text).toStrictEqual(["Test notification 2 text"]);
    expect(notification2?.title).toBe(null);
    expect(notification2?.variant).toBe("warning");
    expect(notification2?.hideAfterTime).toBe(4000);
    expect(notification2?.hideOlder).toBe(false);
    expect(notification2?.dismissible).toBe(false);

    await waitFor(() => expect(notification2?.el).toBeInTheDocument());

    expect(notification2?.el.querySelector(".simple-notification__title")).toBe(null);
    const n2TextEl = notification2?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(n2TextEl?.textContent).toBe("Test notification 2 text");

    // 3
    notifier.show("Test notification 3 text", "error");

    expect(notifier.queue.length).toBe(1);

    await vi.waitFor(async () => {
        expect(notifier.notifications.size).toBe(1);
        expect(notifier.queue.length).toBe(0);
    });

    expect(notifier.currentId).toBe(3);

    const notification3 = notifier.notifications.get(2);
    expect(notification3?.text).toStrictEqual(["Test notification 3 text"]);
    expect(notification3?.title).toBe(null);
    expect(notification3?.variant).toBe("error");
    expect(notification3?.hideAfterTime).toBe(4000);
    expect(notification3?.hideOlder).toBe(true);
    expect(notification3?.dismissible).toBe(false);

    await waitFor(() => expect(notification3?.el).toBeInTheDocument());

    expect(notification3?.el.querySelector(".simple-notification__title")).toBe(null);
    const n3TextEl = notification3?.el.querySelector(".simple-notification__text");
    expect(nTextEl?.tagName).toBe("P");
    expect(n3TextEl?.textContent).toBe("Test notification 3 text");
});

test("Notification with show options text & dismissible enabled", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({
        text: "Test notification text",
        dismissible: true,
    });

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show options & variant", async () => {
    const notifier = new SimpleNotifier();
    notifier.show({ text: "Test notification text" }, "warning");

    expect(notifier.currentId).toBe(1);
    expect(notifier.notifications.size).toBe(1);

    const notification = notifier.notifications.get(0);
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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

test("Notification with show options with variant & variant", async () => {
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
    expect(notification?.text).toStrictEqual(["Test notification text"]);
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
