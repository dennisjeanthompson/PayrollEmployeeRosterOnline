import { bQ as y, r as reactExports } from './vendor-v-EuVKxF.js';

function toast(props) {
  const title = props.title;
  const description = props.description;
  const NodeContent = () => reactExports.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "4px" } },
    title ? reactExports.createElement("div", { style: { fontWeight: "bold" } }, title) : null,
    description ? reactExports.createElement("div", { style: { fontSize: "0.875rem", opacity: 0.9 } }, description) : null
  );
  if (props.variant === "destructive") {
    y.error(reactExports.createElement(NodeContent));
  } else if (props.variant === "warning" || title?.toString().toLowerCase().includes("warn")) {
    y.warn(reactExports.createElement(NodeContent));
  } else if (title?.toString().toLowerCase().includes("error") || title?.toString().toLowerCase().includes("fail")) {
    y.error(reactExports.createElement(NodeContent));
  } else if (title?.toString().toLowerCase().includes("info")) {
    y.info(reactExports.createElement(NodeContent));
  } else {
    y.success(reactExports.createElement(NodeContent));
  }
  return {
    id: "toast",
    dismiss: () => y.dismiss(),
    update: () => {
    }
  };
}
function useToast() {
  return {
    toast,
    dismiss: (id) => y.dismiss(id),
    toasts: []
  };
}

export { useToast as u };
