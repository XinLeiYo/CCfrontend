export const getStatusTagColor = (status) => {
    switch (status) {
        case "清洗":
            return "blue";
        case "在廠":
            return "green";
        case "報廢":
            return "red";
        case "維修":
            return "orange";
        case "特污處理":
            return "purple";
        case "刪除":
            return "black";
        default:
            return "default";
    }
};

export const EQUIPMENT_STATUS_OPTIONS = [
    "清洗",
    "在廠",
    "報廢",
    "維修",
    "特污處理",
];
export const MAINTENANCE_SUBSTATUS_OPTIONS = [
    "頭部修補",
    "前胸修補",
    "後背修補",
    "手部修補",
    "腳部修補",
    "換拉鍊",
    "換拉鍊頭",
];
