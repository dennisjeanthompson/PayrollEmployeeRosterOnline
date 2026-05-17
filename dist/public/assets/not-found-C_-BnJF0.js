import{Q as e,d_ as a,e6 as s,e7 as r,e8 as n}from"./vendor-DQ2xi9GZ.js";import{B as t}from"./button-5JyX40rn.js";import{T as o}from"./main-QU7UgdCd.js";function d(){return e.jsxs("div",{className:"min-h-screen w-full flex items-center justify-center bg-background p-6",children:[e.jsxs("div",{className:"fixed inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"}),e.jsx("div",{className:"absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"})]}),e.jsxs("div",{className:"relative text-center max-w-lg",children:[e.jsxs("div",{className:"relative inline-block mb-8",children:[e.jsx("div",{className:"w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-float",children:e.jsx(a,{className:"w-16 h-16 text-primary"})}),e.jsxs("div",{className:"absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2",children:[e.jsx("div",{className:"w-2 h-8 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam",style:{animationDelay:"0s"}}),e.jsx("div",{className:"w-2 h-10 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam",style:{animationDelay:"0.3s"}}),e.jsx("div",{className:"w-2 h-6 bg-gradient-to-t from-muted-foreground/20 to-transparent rounded-full animate-steam",style:{animationDelay:"0.6s"}})]})]}),e.jsxs("div",{className:"relative mb-6",children:[e.jsx("span",{className:"text-[120px] font-bold leading-none bg-gradient-to-r from-primary/40 to-indigo-500/40 bg-clip-text text-transparent select-none",children:"404"}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsx(s,{className:"w-12 h-12 text-muted-foreground/30"})})]}),e.jsx("h1",{className:"text-3xl font-bold mb-3",children:"Oops! This page took a coffee break"}),e.jsx("p",{className:"text-muted-foreground mb-8 text-lg",children:"Looks like the page you're looking for doesn't exist or has been moved."}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4",children:[e.jsx(o,{href:"/",children:e.jsxs(t,{className:"btn-premium gap-2 text-primary-foreground px-6",children:[e.jsx(r,{className:"w-4 h-4"}),"Back to Home"]})}),e.jsxs(t,{variant:"outline",className:"rounded-xl border-border/50 gap-2 px-6",onClick:()=>window.history.back(),children:[e.jsx(n,{className:"w-4 h-4"}),"Go Back"]})]}),e.jsx("p",{className:"text-sm text-muted-foreground/60 mt-12",children:"Need help? Contact your system administrator."})]}),e.jsx("style",{children:`
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
      `})]})}export{d as default};
