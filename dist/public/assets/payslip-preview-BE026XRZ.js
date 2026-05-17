import{r as k,Q as t,e4 as z,e5 as pe,e6 as he,e7 as W,e8 as me,bg as y,e9 as xe,ea as ue,eb as be}from"./vendor-CDhMo1Zk.js";import{u as ye}from"./vendor-query-B_HVS8Vb.js";import{g as ge}from"./payroll-dates-DN073uIB.js";import{D as A,a as I,c as L,d as O}from"./dialog-C3wIPPxj.js";import{B as R}from"./button-CAXXTPDQ.js";import{d as $,c as fe}from"./main-Dwora7Jh.js";import{u as we}from"./use-toast-TwMEY5hV.js";const _=k.forwardRef(({className:p,children:h,...f},j)=>t.jsxs(z,{ref:j,className:$("relative overflow-hidden",p),...f,children:[t.jsx(pe,{className:"h-full w-full rounded-[inherit]",children:h}),t.jsx(G,{}),t.jsx(he,{})]}));_.displayName=z.displayName;const G=k.forwardRef(({className:p,orientation:h="vertical",...f},j)=>t.jsx(W,{ref:j,orientation:h,className:$("flex touch-none select-none transition-colors",h==="vertical"&&"h-full w-2.5 border-l border-l-transparent p-[1px]",h==="horizontal"&&"h-2.5 flex-col border-t border-t-transparent p-[1px]",p),...f,children:t.jsx(me,{className:"relative flex-1 rounded-full bg-border"})}));G.displayName=W.displayName;const Ne=`
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
`,x=p=>{if(p==null)return 0;const h=Number(p);return isNaN(h)?0:h},r=p=>`PHP ${x(p).toLocaleString("en-PH",{minimumFractionDigits:2})}`;function Ce({entryId:p,open:h,onOpenChange:f}){const{toast:j}=we(),{data:U,isLoading:B,error:Y}=ye({queryKey:["payslip",p],queryFn:async()=>(await fe("GET",`/api/payroll/payslip/${p}`)).json(),enabled:h&&!!p,refetchOnWindowFocus:!0,refetchOnMount:"always",staleTime:0}),o=U?.payslip||null,C=i=>{const e=new be,s=e.internal.pageSize.getWidth(),c=[0,0,0],v=[51,51,51],w=[240,240,240],P=[153,153,153];let l=20;const J=i.companyName||"PERO",Z=i.companyAddress||"Philippines",ee=i.companyTin||"N/A",te=i.companyEmail||"hr@thecafe.com.ph";e.setTextColor(...c),e.setFontSize(24),e.setFont("helvetica","bold"),e.text("PAYSLIP",s-20,l,{align:"right"}),e.setFontSize(16),e.text(J.toUpperCase(),20,l),l+=8,e.setFontSize(10),e.setFont("helvetica","normal"),e.text(Z,20,l),l+=5,e.text(`TIN: ${ee}`,20,l),l+=10,e.setDrawColor(...P),e.setLineWidth(.5),e.line(20,l,s-20,l),l+=10;const S=(a,u,d,N,T)=>{const m=(s-40-70)/2;e.setDrawColor(...P),e.setLineWidth(.3);let n=20;return e.setFillColor(...w),e.rect(n,a,35,8,"FD"),e.setFont("helvetica","bold"),e.setFontSize(9),e.text(u,n+2,a+5.5),n+=35,e.setFillColor(255,255,255),e.rect(n,a,m,8,"FD"),e.setFont("helvetica","normal"),e.text(d,n+2,a+5.5),n+=m,e.setFillColor(...w),e.rect(n,a,35,8,"FD"),e.setFont("helvetica","bold"),e.text(N,n+2,a+5.5),n+=35,e.setFillColor(255,255,255),e.rect(n,a,m,8,"FD"),e.setFont("helvetica","normal"),e.text(T,n+2,a+5.5),a+8},le=i.periodStart?y(new Date(i.periodStart),"MMMM d"):"",ie=i.periodEnd?y(new Date(i.periodEnd),"MMMM d, yyyy"):"";let E="";i.runType?E=String(i.runType):i.periodEnd&&(E="Regular"),l=S(l,"EMPLOYEE:",i.employeeName,"PERIOD:",`${le} - ${ie}`),l=S(l,"POSITION:",i.position,"RUN TYPE:",E),l=S(l,"EMP ID:",i.employeeId||"N/A","DEPT:",i.department||"Operations"),l=S(l,"TIN:",i.employeeTin||"—","SSS No.:",i.employeeSss||"—"),l=S(l,"PhilHealth:",i.employeePhilhealth||"—","Pag-IBIG:",i.employeePagibig||"—"),l+=10;const oe=a=>{const d=(s-40)/2;return e.setFillColor(...v),e.setTextColor(255,255,255),e.setDrawColor(...c),e.setLineWidth(.5),e.rect(20,a,d,10,"FD"),e.rect(20+d,a,d,10,"FD"),e.setFont("helvetica","bold"),e.setFontSize(11),e.text("EARNINGS",20+d/2,a+7,{align:"center"}),e.text("DEDUCTIONS",20+d+d/2,a+7,{align:"center"}),e.setTextColor(...c),a+10},ae=(a,u,d,N,T,H)=>{const m=(s-40)/2,n=m*.6;return e.setDrawColor(...P),e.setLineWidth(.3),H?e.setFillColor(249,249,249):e.setFillColor(255,255,255),e.rect(20,a,m,7,"FD"),e.rect(20+m,a,m,7,"FD"),e.line(20+n,a,20+n,a+7),e.line(20+m+n,a,20+m+n,a+7),e.setFont("helvetica","normal"),e.setFontSize(10),u&&(e.text(u,22,a+5),e.text(d,20+m-2,a+5,{align:"right"})),N&&(e.text(N,20+m+2,a+5),e.text(T,s-22,a+5,{align:"right"})),a+7};l=oe(l);const se=i.hourlyRate?` @ PHP ${x(i.hourlyRate).toFixed(2)}/hr`:"",re=x(i.nightDiffHours),g=[];g.push({label:`Regular Hours (${x(i.regularHours).toFixed(1)}h${se}):`,value:r(i.basicPay)}),g.push({label:`OT Pay (${x(i.overtimeHours).toFixed(1)}h × 125%):`,value:r(i.overtimePay)}),g.push({label:`Night Diff (${re.toFixed(1)}h × +10%):`,value:r(i.nightDifferential)}),g.push({label:"Holiday Pay:",value:r(i.holidayPay)});const ne=x(i.restDayPay);g.push({label:"Rest Day Premium:",value:r(ne)}),i.has13thMonth&&g.push({label:"13th Month Pay:",value:r(parseFloat(i.thirteenthMonthAmount||"0"))});const b=[];b.push({label:"SSS (MSC Bracketed, ÷ 2):",value:r(i.sssContribution)}),b.push({label:"PhilHealth (5% / 2):",value:r(i.philHealthContribution)}),b.push({label:"Pag-IBIG (MFS Capped):",value:r(i.pagibigContribution)}),b.push({label:"BIR Tax (Annualized):",value:r(i.withholdingTax)}),i.sssLoan>0&&b.push({label:"SSS Loan:",value:r(i.sssLoan)}),i.pagibigLoan>0&&b.push({label:"Pag-IBIG Loan:",value:r(i.pagibigLoan)}),i.otherDeductions>0&&b.push({label:"Other Deductions:",value:r(i.otherDeductions)});const de=Math.max(g.length,b.length);for(let a=0;a<de;a++){const u=g[a],d=b[a];l=ae(l,u?.label||"",u?.value||"",d?.label||"",d?.value||"",a%2===0)}const F=(s-40)/2;return l+=5,e.setFillColor(...w),e.setDrawColor(...c),e.setLineWidth(.5),e.rect(20,l,F,8,"FD"),e.rect(20+F,l,F,8,"FD"),e.setFont("helvetica","bold"),e.text("GROSS PAY:",22,l+5.5),e.text(r(i.grossPay),20+F-2,l+5.5,{align:"right"}),e.text("TOTAL DEDUCTIONS:",20+F+2,l+5.5),e.text(r(i.totalDeductions),s-22,l+5.5,{align:"right"}),l+=8,e.setFillColor(...v),e.setTextColor(255,255,255),e.rect(20,l,s-40,12,"FD"),e.setFontSize(14),e.text("NET PAY:",25,l+8),e.text(r(i.netPay),s-25,l+8,{align:"right"}),l+=15,i.includedExceptions&&i.includedExceptions.length>0&&(l>240&&(e.addPage(),l=20),e.setFillColor(...w),e.setDrawColor(...c),e.setLineWidth(.5),e.rect(20,l,s-40,8,"FD"),e.setFont("helvetica","bold"),e.setTextColor(...c),e.setFontSize(10),e.text("EXCEPTION LOG ADDENDUM (Included in Calculation)",25,l+5.5),l+=8,e.setFillColor(...v),e.setTextColor(255,255,255),e.rect(20,l,s-40,7,"FD"),e.setFontSize(9),e.text("DATE",22,l+5),e.text("TYPE",50,l+5),e.text("DURATION",100,l+5),e.text("REMARKS",130,l+5),l+=7,e.setTextColor(...c),e.setFont("helvetica","normal"),e.setFontSize(8),i.includedExceptions.forEach((a,u)=>{l>270&&(e.addPage(),l=20),e.setDrawColor(...P),e.setLineWidth(.1),u%2===0?e.setFillColor(249,249,249):e.setFillColor(255,255,255),e.rect(20,l,s-40,6,"FD"),e.text(y(new Date(a.startDate),"MMM d, yyyy"),22,l+4.5);const d={late:"Lateness",undertime:"Undertime",absent:"Absence",overtime:"Overtime",rest_day_ot:"Rest Day OT",special_holiday_ot:"Special Hol OT",regular_holiday_ot:"Reg Hol OT",night_diff:"Night Diff",holiday_pay:"Holiday Premium"};e.text((d[a.type]||a.type).toUpperCase(),50,l+4.5);const N=["absent"].includes(a.type)?"days":["late","undertime"].includes(a.type)?"m":"h";if(e.text(`${a.value}${N}`,100,l+4.5),a.remarks){const T=a.remarks.length>50?a.remarks.substring(0,47)+"...":a.remarks;e.text(T,130,l+4.5)}l+=6}),e.setDrawColor(...c),e.line(20,l,s-20,l),l+=10),l+=10,e.setTextColor(...P),e.setFontSize(8),e.setFont("helvetica","normal"),e.text("This is a computer-generated document. No signature required.",s/2,l,{align:"center"}),l+=5,e.text(`For payroll inquiries: ${te}`,s/2,l,{align:"center"}),e},q=()=>{if(!o)return;const i=C(o),e=`payslip_${o.employeeName.replace(/\s+/g,"_")}_${y(new Date(o.period||new Date),"yyyy-MM-dd")}.pdf`;i.save(e),j({title:"PDF Downloaded",description:"Payslip saved as PDF"})},K=()=>{if(!o)return;const i=C(o);i.autoPrint(),window.open(i.output("bloburl"),"_blank")};if(B)return t.jsx(A,{open:h,onOpenChange:f,children:t.jsxs(I,{className:"max-w-3xl",children:[t.jsx(L,{className:"sr-only",children:"Loading"}),t.jsx(O,{className:"sr-only",children:"Loading payslip data..."}),t.jsx("div",{className:"flex justify-center p-12",children:t.jsx("div",{className:"animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"})})]})});if(Y||!o)return null;const Q=x(o.nightDiffHours),V=o.hourlyRate?`@ PHP ${x(o.hourlyRate).toFixed(2)}/hr`:"",M=[{label:`Basic Pay (${x(o.regularHours).toFixed(1)}h ${V})`,value:o.basicPay,isMoney:!0},{label:`Overtime Pay (${x(o.overtimeHours).toFixed(1)}h × 125%)`,value:o.overtimePay,isMoney:!0},{label:`Night Differential (${Q.toFixed(1)}h × +10%)`,value:o.nightDifferential,isMoney:!0},{label:"Holiday Pay",value:o.holidayPay,isMoney:!0},{label:"Rest Day Premium",value:x(o.restDayPay),isMoney:!0},...o.has13thMonth?[{label:"13th Month Pay",value:parseFloat(o.thirteenthMonthAmount||"0"),isMoney:!0}]:[]],D=[{label:"SSS (MSC Bracketed, ÷ 2)",value:o.sssContribution},{label:"PhilHealth (5% / 2)",value:o.philHealthContribution},{label:"Pag-IBIG (MFS Capped)",value:o.pagibigContribution},{label:"BIR Tax (Annualized)",value:o.withholdingTax},...o.sssLoan>0?[{label:"SSS Loan",value:o.sssLoan}]:[],...o.pagibigLoan>0?[{label:"Pag-IBIG Loan",value:o.pagibigLoan}]:[],...o.otherDeductions>0?[{label:"Other Deductions",value:o.otherDeductions}]:[]],X=Math.max(M.length,D.length);return t.jsx(A,{open:h,onOpenChange:f,children:t.jsxs(I,{className:"sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden bg-white text-black border-0 rounded-xl",children:[t.jsx("style",{children:Ne}),t.jsx(_,{className:"max-h-[85vh] w-full",style:{background:"#f8f8f8"},children:t.jsxs("div",{className:"payslip-preview-container",children:[t.jsxs("div",{className:"payslip-header",children:[t.jsx("div",{className:"payslip-logo-box",children:o.companyLogoUrl?t.jsx("img",{src:o.companyLogoUrl,alt:"Company Logo",style:{width:"100%",height:"100%",objectFit:"cover"}}):"Company Logo"}),t.jsxs("div",{className:"payslip-company-info",children:[t.jsx("h1",{children:o.companyName||"PERO"}),t.jsx("p",{children:o.companyAddress||"Philippines"}),t.jsxs("p",{children:["TIN: ",o.companyTin||"N/A"]})]}),t.jsx("div",{className:"payslip-title",children:"PAYSLIP"})]}),t.jsx("table",{className:"payslip-info-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"EMPLOYEE NAME:"}),t.jsx("td",{className:"value",children:o.employeeName}),t.jsx("td",{className:"label",children:"PERIOD COVERED:"}),t.jsxs("td",{className:"value",children:[o.periodStart?y(new Date(o.periodStart),"MMMM d"):""," - ",o.periodEnd?y(new Date(o.periodEnd),"MMMM d, yyyy"):""]})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"POSITION:"}),t.jsx("td",{className:"value",children:o.position}),t.jsx("td",{className:"label",children:"PAY DATE:"}),t.jsx("td",{className:"value",children:o.payDate?y(new Date(o.payDate),"MMMM d, yyyy"):o.periodEnd?y(ge(o.periodEnd),"MMMM d, yyyy"):""})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"EMPLOYEE ID:"}),t.jsx("td",{className:"value",children:o.employeeId||"N/A"}),t.jsx("td",{className:"label",children:"DEPARTMENT:"}),t.jsx("td",{className:"value",children:o.department||"Operations"})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"TIN:"}),t.jsx("td",{className:"value",children:o.employeeTin||"—"}),t.jsx("td",{className:"label",children:"SSS No.:"}),t.jsx("td",{className:"value",children:o.employeeSss||"—"})]}),t.jsxs("tr",{children:[t.jsx("td",{className:"label",children:"PhilHealth:"}),t.jsx("td",{className:"value",children:o.employeePhilhealth||"—"}),t.jsx("td",{className:"label",children:"Pag-IBIG:"}),t.jsx("td",{className:"value",children:o.employeePagibig||"—"})]})]})}),t.jsx("table",{className:"payslip-combined-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{colSpan:2,className:"payslip-section-header",children:"EARNINGS"}),t.jsx("td",{colSpan:2,className:"payslip-section-header",children:"DEDUCTIONS"})]}),Array.from({length:X}).map((i,e)=>{const s=M[e],c=D[e];return t.jsxs("tr",{children:[t.jsx("td",{className:"item-label",children:s?`${s.label}:`:""}),t.jsx("td",{className:"item-amount",children:s&&(s.isMoney!==!1?r(Number(s.value)):s.value)}),t.jsx("td",{className:"item-label",children:c?`${c.label}:`:""}),t.jsx("td",{className:"item-amount",children:c&&r(Number(c.value))})]},e)})]})}),t.jsx("table",{className:"payslip-summary-table",children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsx("td",{className:"summary-label",children:"GROSS PAY:"}),t.jsx("td",{className:"summary-amount",children:r(o.grossPay)}),t.jsx("td",{className:"summary-label",children:"TOTAL DEDUCTIONS:"}),t.jsx("td",{className:"summary-amount",children:r(o.totalDeductions)})]}),t.jsxs("tr",{className:"payslip-net-pay-row",children:[t.jsx("td",{colSpan:2,children:"NET PAY:"}),t.jsx("td",{colSpan:2,className:"summary-amount",children:r(o.netPay)})]})]})}),o.includedExceptions&&o.includedExceptions.length>0&&t.jsxs("div",{style:{marginTop:24,breakBefore:"auto"},children:[t.jsx("div",{style:{background:"#333",color:"white",padding:"8px 12px",fontSize:13,fontWeight:"bold"},children:"EXCEPTION LOG ADDENDUM (Included in Calculation)"}),t.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontSize:12},children:[t.jsx("thead",{children:t.jsxs("tr",{style:{background:"#555",color:"white"},children:[t.jsx("th",{style:{padding:"8px",border:"1px solid #999",textAlign:"left"},children:"DATE"}),t.jsx("th",{style:{padding:"8px",border:"1px solid #999",textAlign:"left"},children:"TYPE"}),t.jsx("th",{style:{padding:"8px",border:"1px solid #999",textAlign:"left"},children:"DURATION"}),t.jsx("th",{style:{padding:"8px",border:"1px solid #999",textAlign:"left"},children:"REMARKS"})]})}),t.jsx("tbody",{children:o.includedExceptions.map((i,e)=>{const s=e%2===0?"#f9f9f9":"white",v=({late:"Lateness",undertime:"Undertime",absent:"Absence",overtime:"Overtime",rest_day_ot:"Rest Day OT",special_holiday_ot:"Special Hol OT",regular_holiday_ot:"Reg Hol OT",night_diff:"Night Diff",holiday_pay:"Holiday Premium"}[i.type]||i.type).toUpperCase(),w=["absent"].includes(i.type)?"days":["late","undertime"].includes(i.type)?"m":"h";return t.jsxs("tr",{style:{background:s},children:[t.jsx("td",{style:{padding:"6px 8px",border:"1px solid #ccc"},children:y(new Date(i.startDate),"MMM d, yyyy")}),t.jsx("td",{style:{padding:"6px 8px",border:"1px solid #ccc"},children:v}),t.jsxs("td",{style:{padding:"6px 8px",border:"1px solid #ccc"},children:[i.value,w]}),t.jsx("td",{style:{padding:"6px 8px",border:"1px solid #ccc"},children:i.remarks||"—"})]},e)})})]})]}),t.jsxs("div",{className:"payslip-footer",children:[t.jsx("p",{children:"This is a computer-generated document. No signature required."}),t.jsxs("p",{children:["For payroll inquiries: ",o.companyEmail||"hr@thecafe.com.ph"]})]}),t.jsxs("div",{className:"payslip-actions mt-6 flex gap-3 print:hidden",children:[t.jsxs(R,{className:"flex-1 bg-black hover:bg-gray-800 text-white",onClick:q,children:[t.jsx(xe,{className:"h-4 w-4 mr-2"})," Download PDF"]}),t.jsxs(R,{onClick:K,className:"flex-1 bg-white text-gray-800 border border-gray-400 hover:bg-gray-100 hover:text-gray-900",style:{color:"#1a1a1a",backgroundColor:"#ffffff",borderColor:"#9ca3af"},children:[t.jsx(ue,{className:"h-4 w-4 mr-2",style:{color:"#1a1a1a"}})," Print"]})]}),t.jsx(L,{className:"sr-only",children:"Payslip Details"}),t.jsx(O,{className:"sr-only",children:"Detailed breakdown of earnings and deductions"})]})})]})})}export{Ce as PayslipPreview,Ce as default};
