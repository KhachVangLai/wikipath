import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import * as apiClient from "../api/client";
import { ApiClientError, type PathSearchResponse } from "../types/api";
import { HomePage } from "./HomePage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>(
    "../api/client"
  );

  return {
    ...actual,
    health: vi.fn(),
    suggestTitles: vi.fn(),
    searchPath: vi.fn()
  };
});

const healthMock = vi.mocked(apiClient.health);
const suggestTitlesMock = vi.mocked(apiClient.suggestTitles);
const searchPathMock = vi.mocked(apiClient.searchPath);

const successResult: PathSearchResponse = {
  from: "Elon Musk",
  to: "OpenAI",
  found: true,
  depth: 2,
  path: ["Elon Musk", "Sam Altman", "OpenAI"],
  metrics: {
    expandedNodes: 123,
    durationMs: 456,
    cacheHits: 10,
    cacheMisses: 5
  }
};

const notFoundResult: PathSearchResponse = {
  from: "Elon Musk",
  to: "Unknown Topic",
  found: false,
  depth: -1,
  path: [],
  metrics: {
    expandedNodes: 1,
    durationMs: 0,
    cacheHits: 0,
    cacheMisses: 0
  }
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

async function fillValidSearchForm(
  user: ReturnType<typeof userEvent.setup>,
  fromValue = "Elon Musk",
  toValue = "OpenAI"
) {
  await user.clear(screen.getByLabelText("From"));
  await user.type(screen.getByLabelText("From"), fromValue);
  await user.clear(screen.getByLabelText("To"));
  await user.type(screen.getByLabelText("To"), toValue);
}

beforeEach(() => {
  healthMock.mockResolvedValue({ status: "ok" });
  suggestTitlesMock.mockResolvedValue({ items: [] });
  searchPathMock.mockResolvedValue(successResult);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

test("disables search for blank values and submits trimmed inputs on Enter", async () => {
  const user = userEvent.setup();
  render(<HomePage />);

  const searchButton = screen.getByRole("button", { name: /explore path/i });

  expect(searchButton).toBeDisabled();

  await user.type(screen.getByLabelText("From"), "   ");
  await user.type(screen.getByLabelText("To"), "   ");
  expect(searchButton).toBeDisabled();

  await user.clear(screen.getByLabelText("From"));
  await user.type(screen.getByLabelText("From"), "  Elon Musk  ");
  await user.clear(screen.getByLabelText("To"));
  await user.type(screen.getByLabelText("To"), "  OpenAI  ");

  expect(searchButton).toBeEnabled();

  await user.keyboard("{Enter}");

  await waitFor(() =>
    expect(searchPathMock).toHaveBeenCalledWith(
      {
        from: "Elon Musk",
        to: "OpenAI",
        maxDepth: 4
      },
      expect.any(AbortSignal)
    )
  );
});

test(
  "debounces suggestions and lets keyboard selection fill the input",
  async () => {
    const user = userEvent.setup();
  suggestTitlesMock.mockResolvedValueOnce({
    items: ["Elon Musk", "Elon University"]
  });

  render(<HomePage />);

  const fromInput = screen.getByLabelText("From");
  await user.type(fromInput, "El");

  expect(suggestTitlesMock).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(suggestTitlesMock).toHaveBeenCalledWith(
          "El",
          expect.any(AbortSignal)
        ),
      { timeout: 1200 }
    );

    expect(
      await screen.findByRole("option", { name: "Elon University" })
    ).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");

    expect(fromInput).toHaveValue("Elon University");
  },
  10000
);

test("keeps the last successful path visible while a new search is loading, then shows not found", async () => {
  const deferredSearch = createDeferred<PathSearchResponse>();
  const user = userEvent.setup();

  searchPathMock
    .mockResolvedValueOnce(successResult)
    .mockImplementationOnce(() => deferredSearch.promise);

  render(<HomePage />);

  await fillValidSearchForm(user);
  await user.click(screen.getByRole("button", { name: /explore path/i }));

  expect(
    await screen.findByText(/relationship path discovered/i)
  ).toBeInTheDocument();
  expect(screen.getAllByText("Sam Altman").length).toBeGreaterThan(0);

  await fillValidSearchForm(user, "Elon Musk", "Unknown Topic");
  await user.click(screen.getByRole("button", { name: /explore path/i }));

  expect(screen.getAllByText("Sam Altman").length).toBeGreaterThan(0);
  expect(
    screen.getByText(/expanding article links and checking the closest path/i)
  ).toBeInTheDocument();

  await act(async () => {
    deferredSearch.resolve(notFoundResult);
  });

  expect(
    await screen.findByText(/No relationship path was found between Elon Musk and Unknown Topic/i)
  ).toBeInTheDocument();
  expect(screen.getByText("0 ms")).toBeInTheDocument();
});

test("shows a friendly network error and marks the API badge unavailable", async () => {
  const user = userEvent.setup();
  searchPathMock.mockRejectedValueOnce(
    new ApiClientError({
      message: "The WikiPath API is unreachable.",
      code: "NETWORK_ERROR",
      isNetworkError: true
    })
  );

  render(<HomePage />);

  expect(await screen.findByText(/API ready/i)).toBeInTheDocument();

  await fillValidSearchForm(user);
  await user.click(screen.getByRole("button", { name: /explore path/i }));

  await waitFor(() => expect(searchPathMock).toHaveBeenCalled(), {
    timeout: 2000
  });

  await waitFor(
    () =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Unable to connect to the WikiPath API/i
      ),
    { timeout: 2500 }
  );
  expect(await screen.findByText(/API unavailable/i)).toBeInTheDocument();
});
