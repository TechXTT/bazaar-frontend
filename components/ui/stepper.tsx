import clsx from "clsx";
import { FiAlertTriangle, FiCheck, FiSlash } from "react-icons/fi";
import { toOrderStatus, type OrderStatus } from "@/utils/orders";

/**
 * Escrow lifecycle stepper. The happy path is
 *   Pending → Shipped → Released → Completed
 * with two terminal branches:
 *   • Disputed  — replaces the remaining steps with a danger "Disputed" node.
 *   • Cancelled — replaces them with a muted "Cancelled" node.
 *
 * Derived purely from the typed {@link OrderStatus}, so it stays in sync with the
 * status pill shown elsewhere.
 */
const HAPPY_PATH: OrderStatus[] = ["pending", "shipped", "released", "completed"];

const STEP_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  shipped: "Shipped",
  released: "Released",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

export default function Stepper({ status }: { status: OrderStatus | string }) {
  const current = toOrderStatus(status);

  if (current === "disputed" || current === "cancelled") {
    const isDispute = current === "disputed";
    return (
      <ol className="flex items-center gap-3">
        {HAPPY_PATH.slice(0, 1).map((s) => (
          <Node key={s} label={STEP_LABEL[s]} state="done" />
        ))}
        <Connector state="muted" />
        <Node
          label={STEP_LABEL[current]}
          state={isDispute ? "danger" : "muted"}
          icon={isDispute ? <FiAlertTriangle size={12} /> : <FiSlash size={12} />}
        />
      </ol>
    );
  }

  const currentIdx = HAPPY_PATH.indexOf(current);
  return (
    <ol className="flex items-center">
      {HAPPY_PATH.map((s, i) => {
        const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "todo";
        return (
          <li key={s} className="flex items-center">
            {i > 0 && <Connector state={i <= currentIdx ? "done" : "todo"} />}
            <Node
              label={STEP_LABEL[s]}
              state={state}
              icon={state === "done" ? <FiCheck size={12} /> : undefined}
            />
          </li>
        );
      })}
    </ol>
  );
}

type NodeState = "done" | "active" | "todo" | "danger" | "muted";

function Node({
  label,
  state,
  icon,
}: {
  label: string;
  state: NodeState;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={clsx(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
          state === "done" && "border-vault-success bg-vault-success-soft text-vault-success",
          state === "active" && "border-vault-border-accent bg-vault-accent text-vault-on-accent shadow-vault-glow",
          state === "todo" && "border-vault-border-strong bg-vault-surface-2 text-vault-text-tertiary",
          state === "danger" && "border-vault-danger bg-vault-danger-soft text-vault-danger",
          state === "muted" && "border-vault-border-strong bg-vault-surface-2 text-vault-text-tertiary"
        )}
      >
        {icon ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <span
        className={clsx(
          "text-label",
          state === "todo" || state === "muted" ? "text-vault-text-tertiary" : "text-vault-text"
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Connector({ state }: { state: "done" | "todo" | "muted" }) {
  return (
    <span
      className={clsx(
        "mx-2 h-px w-6 shrink-0 sm:w-10",
        state === "done" ? "bg-vault-success/60" : "bg-vault-border-strong"
      )}
    />
  );
}
