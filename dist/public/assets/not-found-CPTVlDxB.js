import { Q as jsxRuntimeExports, dX as Coffee, e3 as Search, e4 as House, e5 as ArrowLeft } from './vendor-5dgU3tca.js';
import { B as Button } from './button-BjtCgUzM.js';
import { T as TransitionLink } from './main-2BvCZ7pP.js';

function NotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex items-center justify-center bg-background p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative text-center max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-float", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "w-16 h-16 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-8 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam", style: { animationDelay: "0s" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-10 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam", style: { animationDelay: "0.3s" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-6 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam", style: { animationDelay: "0.6s" } })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[120px] font-bold leading-none bg-gradient-to-r from-primary/40 to-indigo-500/40 bg-clip-text text-transparent select-none", children: "404" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-12 h-12 text-muted-foreground/30" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-3", children: "Oops! This page took a coffee break" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-8 text-lg", children: "Looks like the page you're looking for doesn't exist or has been moved." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TransitionLink, { href: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "btn-premium gap-2 text-primary-foreground px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "w-4 h-4" }),
          "Back to Home"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "rounded-xl border-border/50 gap-2 px-6",
            onClick: () => window.history.back(),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Go Back"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground/60 mt-12", children: "Need help? Contact your system administrator." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes steam {
          0%, 100% { opacity: 0; transform: translateY(0) scaleY(1); }
          50% { opacity: 0.5; transform: translateY(-20px) scaleY(1.5); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-steam {
          animation: steam 2s ease-in-out infinite;
        }
      ` })
  ] });
}

export { NotFound as default };
