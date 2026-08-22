import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import type { Quote, Customer } from "@/shared/types";

// ── Mock @react-pdf/renderer ──────────────────────────────────
// jsdom 30 is stricter about Proxy traps than jsdom 26.
// @react-pdf/renderer's StyleSheet.create() produces Proxy-wrapped
// objects that jsdom 30 rejects when react-dom tries to set styles.
// We mock the entire module so tests render plain DOM elements instead.
vi.mock("@react-pdf/renderer", () => {
  const el =
    (tag: string) =>
    ({
      children,
      style, // eslint-disable-line @typescript-eslint/no-unused-vars
      ...rest
    }: {
      children?: React.ReactNode;
      style?: unknown;
      [key: string]: unknown;
    }) =>
      React.createElement(tag, rest, children);

  return {
    Document: el("div"),
    Page: el("div"),
    View: el("div"),
    Text: el("span"),
    Image: el("img"),
    StyleSheet: { create: <T extends Record<string, unknown>>(s: T): T => s },
  };
});

import { QuoteDoc } from "../QuoteDoc";

const mockQuote: Quote = {
  id: "quote_1",
  number: 1,
  title: "Orçamento Teste",
  items: [
    {
      historyEntryId: "hist_1",
      name: "Suporte para Fone",
      quantity: 10,
      unitPrice: 8.5,
      totalPrice: 85,
      discountPercent: 0,
    },
    {
      historyEntryId: "hist_2",
      name: "Tampa HDMI",
      quantity: 5,
      unitPrice: 3.2,
      totalPrice: 16,
      discountPercent: 0,
    },
  ],
  globalDiscountPercent: 5,
  subtotal: 101,
  discountAmount: 5.05,
  total: 95.95,
  status: "draft",
  validUntil: "2026-07-28",
  paymentTerms: "À vista",
  deliveryEstimate: "5 dias úteis",
  footerNote: "Obrigado pela preferência!",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const mockCustomer: Customer = {
  id: "cust_1",
  name: "João Silva",
  company: "Tech 3D",
  email: "joao@email.com",
  phone: "(11) 99999-9999",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  quoteCount: 1,
};

describe("QuoteDoc", () => {
  it("renders without crashing with full data", () => {
    const { container } = render(
      <QuoteDoc
        quote={mockQuote}
        customer={mockCustomer}
        currencySymbol="R$"
      />,
    );
    expect(container).toBeTruthy();
  });

  it("renders without crashing without customer", () => {
    const { container } = render(
      <QuoteDoc quote={mockQuote} currencySymbol="R$" />,
    );
    expect(container).toBeTruthy();
  });

  it("renders without crashing with empty items", () => {
    const emptyQuote: Quote = {
      ...mockQuote,
      items: [],
      subtotal: 0,
      discountAmount: 0,
      total: 0,
    };
    const { container } = render(
      <QuoteDoc
        quote={emptyQuote}
        customer={mockCustomer}
        currencySymbol="R$"
      />,
    );
    expect(container).toBeTruthy();
  });

  it("renders without crashing with zero discount", () => {
    const noDiscountQuote: Quote = {
      ...mockQuote,
      globalDiscountPercent: 0,
      discountAmount: 0,
      total: 101,
    };
    const { container } = render(
      <QuoteDoc quote={noDiscountQuote} currencySymbol="$" />,
    );
    expect(container).toBeTruthy();
  });

  it("renders without crashing with logo base64", () => {
    const { container } = render(
      <QuoteDoc
        quote={mockQuote}
        customer={mockCustomer}
        currencySymbol="R$"
        logoBase64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      />,
    );
    expect(container).toBeTruthy();
  });
});
