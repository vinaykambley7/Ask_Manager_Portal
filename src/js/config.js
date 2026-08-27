/**
 * ASK EOD Manager - Configuration & Fixed Master Data
 */
const FIXED_MANAGERS = [
  { id: 1, name: "Ramesh Kumar", center: "Santosh Nagar", avatar: "RK" },
  { id: 2, name: "Mounika", center: "A.S. Rao Nagar", avatar: "MO" },
  { id: 3, name: "Shekar", center: "Gadwal", avatar: "SH" },
  { id: 4, name: "Naithika", center: "Vanasthalipuram", avatar: "NA" },
  { id: 5, name: "Khadher", center: "Khamam", avatar: "KH" }
];

const STORAGE_KEYS = {
  CURRENT_USER: "eodCurrentUser",
  OPERATORS: "operators",
  EOD_SUBMISSIONS: "eodSubmissions",
  ASSIGNED_WORK: "assignedWork",
  WORK_DONE: "workDone"
};
