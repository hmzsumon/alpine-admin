/* ── Component: AdminModal ────────────────────────────────────────────── */
"use client";
import { useCallback } from "react";

/* ────────── imports ────────── */
import { useAdminContext } from "@/context/AdminContext";
import { X } from "lucide-react";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import MenuItemForm from "@/components/menu/MenuItemForm";
import CategoryForm from "@/components/menu/CategoryForm";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import OrderForm from "@/components/orders/OrderForm";
import CancelOrderForm from "@/components/orders/CancelOrderForm";

export default function AdminModal() {
  /* ────────── workspace state ────────── */
  const { modal, setModal, editing } = useAdminContext();
  const closeModal = useCallback(() => setModal(null), [setModal]);
  useDialogFocus(modal, closeModal);
  return (
    modal && (
      <div
        className="modal-backdrop"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`modal ${modal === "order" ? "wide" : ""}`}
        >
          <div className="panel-title">
            <div>
              <h3 id="modal-title">
                {modal === "menu"
                  ? editing
                    ? "Edit menu item"
                    : "Add menu item"
                  : modal === "category" ? "Add category"
                  : modal === "cancel-order" ? "Cancel order & reconcile stock"
                  : modal === "order"
                  ? "Create an order"
                  : "Record expense"}
              </h3>
              <p>
                {modal === "order"
                  ? "Only available items with confirmed prices can be ordered."
                  : "Fields marked * are required."}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
          </div>
          {modal === "menu" && <MenuItemForm />}
          {modal === "category" && <CategoryForm />}
          {modal === "expense" && <ExpenseForm />}
          {modal === "order" && <OrderForm />}
          {modal === "cancel-order" && <CancelOrderForm />}
        </section>
      </div>
    )
  );
}
