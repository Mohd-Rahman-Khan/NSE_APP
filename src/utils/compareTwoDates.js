// export const compareTwoDates = (fromDate, toDate) => {
//   // Convert dd/mm/yyyy → Date object
//   const [sowDay, sowMonth, sowYear] = fromDate.split("/");
//   const [harvestDay, harvestMonth, harvestYear] = toDate.split("/");

//   const sowDateObj = new Date(`${sowYear}-${sowMonth}-${sowDay}`);
//   const harvestDateObj = new Date(
//     `${harvestYear}-${harvestMonth}-${harvestDay}`
//   );

//   if (sowDateObj < harvestDateObj) {
//     //alert("Sowing date is before harvest date");
//     //console.log("✅ Sowing date is before harvest date");
//     return 0;
//   } else if (sowDateObj > harvestDateObj) {
//     //alert("Sowing date is after harvest date");
//     //console.log("❌ Sowing date is after harvest date");
//     return 1;
//   } else {
//     //alert("Both dates are the same");
//     //console.log("⚠️ Both dates are the same");
//     return 2;
//   }
// };

export const compareTwoDates = (fromDate, toDate) => {
  // Convert dd/mm/yyyy → Date object
  const [fromDateDay, fromDateMonth, fromDateYear] = fromDate.split("/");
  const [toDateDay, toDateMonth, toDateYear] = toDate.split("/");

  const fromDateObj = new Date(
    `${fromDateYear}-${fromDateMonth}-${fromDateDay}`
  );
  const toDateObj = new Date(`${toDateYear}-${toDateMonth}-${toDateDay}`);

  if (fromDateObj < toDateObj) {
    //alert("Sowing date is before harvest date");
    //console.log("✅ Sowing date is before harvest date");
    return 0;
  } else if (fromDateObj > toDateObj) {
    //alert("Sowing date is after harvest date");
    //console.log("❌ Sowing date is after harvest date");
    return 1;
  } else {
    //alert("Both dates are the same");
    //console.log("⚠️ Both dates are the same");
    return 2;
  }
};
