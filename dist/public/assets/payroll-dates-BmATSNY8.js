function getPaymentDate(periodEndDate) {
  const end = new Date(periodEndDate);
  if (isNaN(end.getTime())) {
    return /* @__PURE__ */ new Date();
  }
  const day = end.getUTCDate();
  if (day <= 15) {
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 25));
  } else {
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 10));
  }
}

export { getPaymentDate as g };
