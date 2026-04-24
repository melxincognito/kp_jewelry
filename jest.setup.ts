import "@testing-library/jest-dom";

// jsdom doesn't implement HTMLDialogElement methods — guard for node test environment.
// The showModal mock sets the `open` attribute so the dialog is visible in the a11y tree.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = jest.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
}

// Suppress Next.js router warnings in tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next/image globally — render as a plain img element to avoid canvas/loader issues
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react").createElement("img", props);
  },
}));
