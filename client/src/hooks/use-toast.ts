"use client"

import * as React from "react"
import { toast as reactToast } from "react-toastify"

export function toast(props: any) {
  const title = props.title;
  const description = props.description;
  
  const NodeContent = () => React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
    title ? React.createElement('div', { style: { fontWeight: 'bold' } }, title) : null,
    description ? React.createElement('div', { style: { fontSize: '0.875rem', opacity: 0.9 } }, description) : null
  );

  if (props.variant === "destructive") {
    reactToast.error(React.createElement(NodeContent));
  } else if (props.variant === "warning" || title?.toString().toLowerCase().includes("warn")) {
    reactToast.warn(React.createElement(NodeContent));
  } else if (title?.toString().toLowerCase().includes("error") || title?.toString().toLowerCase().includes("fail")) {
    reactToast.error(React.createElement(NodeContent));
  } else if (title?.toString().toLowerCase().includes("info")) {
    reactToast.info(React.createElement(NodeContent));
  } else {
    reactToast.success(React.createElement(NodeContent));
  }

  return {
    id: "toast",
    dismiss: () => reactToast.dismiss(),
    update: () => {},
  }
}

export function useToast() {
  return {
    toast,
    dismiss: (id?: string) => reactToast.dismiss(id),
    toasts: []
  }
}

