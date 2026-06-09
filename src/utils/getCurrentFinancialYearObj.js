export const getCurrentFinancialYearObj = (financialYears) => {
  const today = new Date();

  return financialYears.find((fy) => {
    const from = new Date(fy.finYearFrom);
    const to = new Date(fy.finYearTo);

    return today >= from && today <= to;
  });
};
