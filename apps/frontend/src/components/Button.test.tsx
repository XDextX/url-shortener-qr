import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders the provided children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("shows loading text and disables while loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button loading loadingText="Processing..." onClick={handleClick}>
        Submit
      </Button>
    );

    const button = screen.getByRole("button", { name: /processing/i });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
