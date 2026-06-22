import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("renders the title and message when open", () => {
    render(
      <ConfirmDialog
        open
        title="Retirer Basilic ?"
        message="Cette plante sera retirée."
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Retirer Basilic ?")).toBeInTheDocument();
    expect(screen.getByText("Cette plante sera retirée.")).toBeInTheDocument();
  });

  it("wires the confirm and cancel buttons", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Retirer ?"
        confirmLabel="Retirer"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    screen.getByRole("button", { name: "Retirer" }).click();
    screen.getByRole("button", { name: "Annuler" }).click();

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
