import{r as k,Q as t,dm as $,dn as he,dp as me,dq as W,dr as xe,aC as ue,bi as g,ds as ge,dt as be,du as ye}from"./vendor-CjYT3bAM.js";import{D as I,a as A,c as L,d as R}from"./dialog-DdBQc2FL.js";import{B as z}from"./button-CVk9SpYn.js";import{a as G}from"./utils-BqZ7KHb-.js";import{a as fe}from"./main-CniY9vIq.js";import{u as we}from"./use-toast-DnUYXFUR.js";function O(c){const n=new Date(c);return isNaN(n.getTime())?new Date:n.getUTCDate()<=15?new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),25)):new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+1,10))}const B=k.forwardRef(({className:c,children:n,...y},w)=>t.jsxs($,{ref:w,className:G("relative overflow-hidden",c),...y,children:[t.jsx(he,{className:"h-full w-full rounded-[inherit]",children:n}),t.jsx(U,{}),t.jsx(me,{})]}));B.displayName=$.displayName;const U=k.forwardRef(({className:c,orientation:n="vertical",...y},w)=>t.jsx(W,{ref:w,orientation:n,className:G("flex touch-none select-none transition-colors",n==="vertical"&&"h-full w-2.5 border-l border-l-transparent p-[1px]",n==="horizontal"&&"h-2.5 flex-col border-t border-t-transparent p-[1px]",c),...y,children:t.jsx(xe,{className:"relative flex-1 rounded-full bg-border"})}));U.displayName=W.displayName;const Ne=`
  .payslip-preview-container {
    font-family: 'Arial', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 24px;
    color: #000;
  }

  /* Header Section - 3 column grid */
  .payslip-header {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #000;
  }

  .payslip-logo-box {
    width: 80px;
    height: 80px;
    border: 2px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    font-size: 10px;
    color: #666;
    text-align: center;
  }

  .payslip-company-info h1 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 5px 0;
  }

  .payslip-company-info p {
    font-size: 11px;
    margin: 2px 0;
    color: #333;
  }

  .payslip-title {
    text-align: right;
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 2px;
  }

  /* Employee Info Grid Table */
  .payslip-info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    font-size: 12px;
  }

  .payslip-info-table td {
    border: 1px solid #666;
    padding: 8px 10px;
  }

  .payslip-info-table .label {
    background: #f0f0f0;
    font-weight: bold;
    width: 15%;
  }

  .payslip-info-table .value {
    background: white;
    width: 35%;
  }

  /* Combined Earnings & Deductions Table */
  .payslip-combined-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
    font-size: 12px;
  }

  .payslip-combined-table td {
    border: 1px solid #999;
    padding: 8px 10px;
  }

  .payslip-section-header {
    background: #333;
    color: white;
    font-weight: bold;
    text-align: center;
    padding: 10px;
    font-size: 13px;
    letter-spacing: 1px;
  }

  .payslip-combined-table tr:nth-child(even) td:not(.payslip-section-header) {
    background: #f9f9f9;
  }

  .payslip-combined-table tr:nth-child(odd) td:not(.payslip-section-header) {
    background: white;
  }

  .payslip-combined-table .item-label {
    font-weight: 500;
    width: 30%;
  }

  .payslip-combined-table .item-amount {
    text-align: right;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    width: 20%;
  }

  .payslip-subtotal-row {
    background: #e8e8e8 !important;
    font-weight: bold;
    border-top: 2px solid #333;
  }

  .payslip-subtotal-row td {
    padding: 10px !important;
    font-size: 13px !important;
    background: #e8e8e8 !important;
  }

  /* Summary Table */
  .payslip-summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    font-size: 13px;
  }

  .payslip-summary-table td {
    border: 1px solid #666;
    padding: 10px 15px;
  }

  .payslip-summary-table .summary-label {
    background: #f0f0f0;
    font-weight: bold;
    width: 30%;
  }

  .payslip-summary-table .summary-amount {
    text-align: right;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    width: 20%;
  }

  .payslip-net-pay-row {
    background: #333 !important;
    color: white;
    font-size: 16px;
    font-weight: bold;
  }

  .payslip-net-pay-row td {
    padding: 15px !important;
    border: 2px solid #000 !important;
    background: #333 !important;
  }

  /* Footer */
  .payslip-footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 1px solid #999;
    text-align: center;
    font-size: 10px;
    color: #666;
  }

  .payslip-footer p {
    margin: 3px 0;
  }

  /* Print styles */
  @media print {
    .payslip-preview-container {
      padding: 0;
      max-width: 100%;
    }
    .payslip-actions {
      display: none !important;
    }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .payslip-preview-container {
      padding: 12px;
    }

    .payslip-header {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .payslip-logo-box {
      margin: 0 auto;
    }

    .payslip-title {
      text-align: center;
      margin-top: 10px;
      font-size: 22px;
    }

    .payslip-info-table td {
      display: block;
      width: 100% !important;
      border: none;
      border-bottom: 1px solid #ddd;
      padding: 6px 8px;
    }

    .payslip-info-table tr {
      display: block;
      margin-bottom: 5px;
    }

    .payslip-combined-table td,
    .payslip-summary-table td {
      padding: 6px 8px;
      font-size: 11px;
    }

    .payslip-section-header {
      font-size: 12px;
      padding: 8px;
    }

    .payslip-net-pay-row td {
      font-size: 14px !important;
      padding: 12px !important;
    }
  }
`,m=c=>{if(c==null)return 0;const n=Number(c);return isNaN(n)?0:n},s=c=>`PHP ${m(c).toLocaleString("en-PH",{minimumFractionDigits:2})}`;function Me({entryId:c,open:n,onOpenChange:y}){const{toast:w}=we(),{data:Y,isLoading:q,error:_}=ue({queryKey:["payslip",c],queryFn:async()=>(await fe("GET",`/api/payroll/payslip/${c}`)).json(),enabled:n&&!!c,refetchOnWindowFocus:!0,refetchOnMount:"always",staleTime:0}),a=Y?.payslip||null,M=l=>{const e=new ye,r=e.internal.pageSize.getWidth(),u=[0,0,0],E=[51,51,51],S=[240,240,240],j=[153,153,153];let o=20;const Z=l.companyName||"PERO",ee=l.companyAddress||"Philippines",te=l.companyTin||"N/A",ae=l.companyEmail||"hr@thecafe.com.ph";e.setTextColor(...u),e.setFontSize(24),e.setFont("helvetica","bold"),e.text("PAYSLIP",r-20,o,{align:"right"}),e.setFontSize(16),e.text(Z.toUpperCase(),20,o),o+=8,e.setFontSize(10),e.setFont("helvetica","normal"),e.text(ee,20,o),o+=5,e.text(`TIN: ${te}`,20,o),o+=10,e.setDrawColor(...j),e.setLineWidth(.5),e.line(20,o,r-20,o),o+=10;const N=(i,b,p,P,C)=>{const h=(r-40-70)/2;e.setDrawColor(...j),e.setLineWidth(.3);let d=20;return e.setFillColor(...S),e.rect(d,i,35,8,"FD"),e.setFont("helvetica","bold"),e.setFontSize(9),e.text(b,d+2,i+5.5),d+=35,e.setFillColor(255,255,255),e.rect(d,i,h,8,"FD"),e.setFont("helvetica","normal"),e.text(p,d+2,i+5.5),d+=h,e.setFillColor(...S),e.rect(d,i,35,8,"FD"),e.setFont("helvetica","bold"),e.text(P,d+2,i+5.5),d+=35,e.setFillColor(255,255,255),e.rect(d,i,h,8,"FD"),e.setFont("helvetica","normal"),e.text(C,d+2,i+5.5),i+8},le=l.periodStart?g(new Date(l.periodStart),"MMMM d"):"",oe=l.periodEnd?g(new Date(l.periodEnd),"MMMM d, yyyy"):"";let F="";l.payDate?F=g(new Date(l.payDate),"MMMM d, yyyy"):l.periodEnd&&(F=g(O(l.periodEnd),"MMMM d, yyyy")),o=N(o,"EMPLOYEE:",l.employeeName,"PERIOD:",`${le} - ${oe}`),o=N(o,"POSITION:",l.position,"PAY DATE:",F),o=N(o,"EMP ID:",l.employeeId||"N/A","DEPT:",l.department||"Operations"),o=N(o,"TIN:",l.employeeTin||"—","SSS No.:",l.employeeSss||"—"),o=N(o,"PhilHealth:",l.employeePhilhealth||"—","Pag-IBIG:",l.employeePagibig||"—"),o+=10;const ie=i=>{const p=(r-40)/2;return e.setFillColor(...E),e.setTextColor(255,255,255),e.setDrawColor(...u),e.setLineWidth(.5),e.rect(20,i,p,10,"FD"),e.rect(20+p,i,p,10,"FD"),e.setFont("helvetica","bold"),e.setFontSize(11),e.text("EARNINGS",20+p/2,i+7,{align:"center"}),e.text("DEDUCTIONS",20+p+p/2,i+7,{align:"center"}),e.setTextColor(...u),i+10},se=(i,b,p,P,C,H)=>{const h=(r-40)/2,d=h*.6;return e.setDrawColor(...j),e.setLineWidth(.3),H?e.setFillColor(249,249,249):e.setFillColor(255,255,255),e.rect(20,i,h,7,"FD"),e.rect(20+h,i,h,7,"FD"),e.line(20+d,i,20+d,i+7),e.line(20+h+d,i,20+h+d,i+7),e.setFont("helvetica","normal"),e.setFontSize(10),b&&(e.text(b,22,i+5),e.text(p,20+h-2,i+5,{align:"right"})),P&&(e.text(P,20+h+2,i+5),e.text(C,r-22,i+5,{align:"right"})),i+7};o=ie(o);const ne=l.hourlyRate?` @ PHP ${m(l.hourlyRate).toFixed(2)}/hr`:"",re=m(l.nightDiffHours),f=[];f.push({label:`Regular Hours (${m(l.regularHours).toFixed(1)}h${ne}):`,value:s(l.basicPay)}),f.push({label:`OT Pay (${m(l.overtimeHours).toFixed(1)}h × 125%):`,value:s(l.overtimePay)}),f.push({label:`Night Diff (${re.toFixed(1)}h × +10%):`,value:s(l.nightDifferential)}),f.push({label:"Holiday Pay:",value:s(l.holidayPay)});const de=m(l.restDayPay);f.push({label:"Rest Day Premium:",value:s(de)});const x=[];x.push({label:"SSS (MSC Bracketed, ÷ 2):",value:s(l.sssContribution)}),x.push({label:"PhilHealth (5% / 2):",value:s(l.philHealthContribution)}),x.push({label:"Pag-IBIG (MFS Capped):",value:s(l.pagibigContribution)}),x.push({label:"BIR Tax (Annualized):",value:s(l.withholdingTax)}),l.sssLoan>0&&x.push({label:"SSS Loan:",value:s(l.sssLoan)}),l.pagibigLoan>0&&x.push({label:"Pag-IBIG Loan:",value:s(l.pagibigLoan)}),l.advances>0&&x.push({label:"Cash Advances:",value:s(l.advances)}),l.otherDeductions>0&&x.push({label:"Other Deductions:",value:s(l.otherDeductions)});const ce=Math.max(f.length,x.length);for(let i=0;i<ce;i++){const b=f[i],p=x[i];o=se(o,b?.label||"",b?.value||"",p?.label||"",p?.value||"",i%2===0)}const v=(r-40)/2;return o+=5,e.setFillColor(...S),e.setDrawColor(...u),e.setLineWidth(.5),e.rect(20,o,v,8,"FD"),e.rect(20+v,o,v,8,"FD"),e.setFont("helvetica","bold"),e.text("GROSS PAY:",22,o+5.5),e.text(s(l.grossPay),20+v-2,o+5.5,{align:"right"}),e.text("TOTAL DEDUCTIONS:",20+v+2,o+5.5),e.text(s(l.totalDeductions),r-22,o+5.5,{align:"right"}),o+=8,e.setFillColor(...E),e.setTextColor(255,255,255),e.rect(20,o,r-40,12,"FD"),e.setFontSize(14),e.text("NET PAY:",25,o+8),e.text(s(l.netPay),r-25,o+8,{align:"right"}),o+=20,e.setTextColor(...j),e.setFontSize(8),e.setFont("helvetica","normal"),e.text("This is a computer-generated document. No signature required.",r/2,o,{align:"center"}),o+=5,e.text(`For payroll inquiries: ${ae}`,r/2,o,{align:"center"}),e},Q=()=>{if(!a)return;const l=M(a),e=`payslip_${a.employeeName.replace(/\s+/g,"_")}_${g(new Date(a.period||new Date),"yyyy-MM-dd")}.pdf`;l.save(e),w({title:"PDF Downloaded",description:"Payslip saved as PDF"})},V=()=>{if(!a)return;const l=M(a);l.autoPrint(),window.open(l.output("bloburl"),"_blank")};if(q)return t.jsx(I,{open:n,onOpenChange:y,children:t.jsxs(A,{className:"max-w-3xl",children:[t.jsx(L,{className:"sr-only",children:"Loading"}),t.jsx(R,{className:"sr-only",children:"Loading payslip data..."}),t.jsx("div",{className:"flex justify-center p-12",children:t.jsx("div",{className:"animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"})})]})});if(_||!a)return null;const K=m(a.nightDiffHours),J=a.hourlyRate?`@ PHP ${m(a.hourlyRate).toFixed(2)}/hr`:"",T=[{label:`Basic Pay (${m(a.regularHours).toFixed(1)}h ${J})`,value:a.basicPay,isMoney:!0},{label:`Overtime Pay (${m(a.overtimeHours).toFixed(1)}h × 125%)`,value:a.overtimePay,isMoney:!0},{label:`Night Differential (${K.toFixed(1)}h × +10%)`,value:a.nightDifferential,isMoney:!0},{label:"Holiday Pay",value:a.holidayPay,isMoney:!0},{label:"Rest Day Premium",value:m(a.restDayPay),isMoney:!0}],D=[{label:"SSS (MSC Bracketed, ÷ 2)",value:a.sssContribution},{label:"PhilHealth (5% / 2)",value:a.philHealthContribution},{label:"Pag-IBIG (MFS Capped)",value:a.pagibigContribution},{label:"BIR Tax (Annualized)",value:a.withholdingTax},...a.sssLoan>0?[{label:"SSS Loan",value:a.sssLoan}]:[],...a.pagibigLoan>0?[{label:"Pag-IBIG Loan",value:a.pagibigLoan}]:[],...a.advances>0?[{label:"Cash Advances",value:a.advances}]:[],...a.otherDeductions>0?[{label:"Other Deductions",value:a.otherDeductions}]:[]],X=Math.max(T.length,D.length);return t.jsx(I,{open:n,onOpenChange:y,children:t.jsxs(A,{className:"sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden bg-white text-black border-0 rounded-xl",children:[t.jsx("style",{children:Ne}),t.jsx(B,{className:"max-h-[85vh] w-full",style:{background:"#f8f8f8"},children:t.jsxs("div",{className:"payslip-preview-container",children:[t.jsxs("div",{className:"payslip-header",children:[t.jsx("div",{className:"payslip-logo-box",children:a.companyLogoUrl?t.jsx("img",{src:a.companyLogoUrl,alt:"Company Logo",style:{width:"100%",height:"100%",objectFit:"cover"}}):"Company Logo"}),t.jsxs("div",{className:"payslip-company-info",children:[t.jsx("h1",{children:a.companyName||"PERO"}),t.jsx("p",{children:a.companyAddress||"Philippines"}),t.jsxs("p",{children:["TIN: ",a.companyTin||"N/A"]})]}),t.jsx("div",{className:"payslip-title",children:"PAYSLIP"})]}),t.jsx("table",{className:"payslip-info-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"EMPLOYEE NAME:"}),t.jsx("td",{className:"value",children:a.employeeName}),t.jsx("td",{className:"label",children:"PERIOD COVERED:"}),t.jsxs("td",{className:"value",children:[a.periodStart?g(new Date(a.periodStart),"MMMM d"):""," - ",a.periodEnd?g(new Date(a.periodEnd),"MMMM d, yyyy"):""]})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"POSITION:"}),t.jsx("td",{className:"value",children:a.position}),t.jsx("td",{className:"label",children:"PAY DATE:"}),t.jsx("td",{className:"value",children:a.payDate?g(new Date(a.payDate),"MMMM d, yyyy"):a.periodEnd?g(O(a.periodEnd),"MMMM d, yyyy"):""})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"EMPLOYEE ID:"}),t.jsx("td",{className:"value",children:a.employeeId||"N/A"}),t.jsx("td",{className:"label",children:"DEPARTMENT:"}),t.jsx("td",{className:"value",children:a.department||"Operations"})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"TIN:"}),t.jsx("td",{className:"value",children:a.employeeTin||"—"}),t.jsx("td",{className:"label",children:"SSS No.:"}),t.jsx("td",{className:"value",children:a.employeeSss||"—"})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"PhilHealth:"}),t.jsx("td",{className:"value",children:a.employeePhilhealth||"—"}),t.jsx("td",{className:"label",children:"Pag-IBIG:"}),t.jsx("td",{className:"value",children:a.employeePagibig||"—"})]})]})}),t.jsx("table",{className:"payslip-combined-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{colSpan:2,className:"payslip-section-header",children:"EARNINGS"}),t.jsx("td",{colSpan:2,className:"payslip-section-header",children:"DEDUCTIONS"})]}),Array.from({length:X}).map((l,e)=>{const r=T[e],u=D[e];return t.jsxs("tr",{children:[t.jsx("td",{className:"item-label",children:r?`${r.label}:`:""}),t.jsx("td",{className:"item-amount",children:r&&(r.isMoney!==!1?s(Number(r.value)):r.value)}),t.jsx("td",{className:"item-label",children:u?`${u.label}:`:""}),t.jsx("td",{className:"item-amount",children:u&&s(Number(u.value))})]},e)})]})}),t.jsx("table",{className:"payslip-summary-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{className:"summary-label",children:"GROSS PAY:"}),t.jsx("td",{className:"summary-amount",children:s(a.grossPay)}),t.jsx("td",{className:"summary-label",children:"TOTAL DEDUCTIONS:"}),t.jsx("td",{className:"summary-amount",children:s(a.totalDeductions)})]}),t.jsxs("tr",{className:"payslip-net-pay-row",children:[t.jsx("td",{colSpan:2,children:"NET PAY:"}),t.jsx("td",{colSpan:2,className:"summary-amount",children:s(a.netPay)})]})]})}),t.jsxs("div",{className:"payslip-footer",children:[t.jsx("p",{children:"This is a computer-generated document. No signature required."}),t.jsxs("p",{children:["For payroll inquiries: ",a.companyEmail||"hr@thecafe.com.ph"]})]}),t.jsxs("div",{className:"payslip-actions mt-6 flex gap-3 print:hidden",children:[t.jsxs(z,{className:"flex-1 bg-black hover:bg-gray-800 text-white",onClick:Q,children:[t.jsx(ge,{className:"h-4 w-4 mr-2"})," Download PDF"]}),t.jsxs(z,{onClick:V,className:"flex-1 bg-white text-gray-800 border border-gray-400 hover:bg-gray-100 hover:text-gray-900",style:{color:"#1a1a1a",backgroundColor:"#ffffff",borderColor:"#9ca3af"},children:[t.jsx(be,{className:"h-4 w-4 mr-2",style:{color:"#1a1a1a"}})," Print"]})]}),t.jsx(L,{className:"sr-only",children:"Payslip Details"}),t.jsx(R,{className:"sr-only",children:"Detailed breakdown of earnings and deductions"})]})})]})})}export{Me as P,O as g};
