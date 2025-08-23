import React from "react";
import { Table, Button, Space, Dropdown, Popconfirm, Modal, Tag } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    HistoryOutlined,
    MoreOutlined,
    BugOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { getStatusTagColor } from "../utils/statusUtils"; // 引入狀態顏色工具

const { confirm } = Modal; // 從 Modal 中解構出 confirm 方法

const EquipmentTable = ({
    equipmentData,
    loading,
    pagination,
    onShowModal, // 編輯按鈕觸發
    onForceDelete, // 強制刪除按鈕觸發
    onShowLogHistory, // 日誌按鈕觸發
    selectedRowKeys, // 選中行的 keys
    onSelectRowChange, // 選中行變化的處理函數
    onShowReportModal, // 回報按鈕觸發
}) => {
    const columns = [
        // {
        //     title: "ID",
        //     dataIndex: "ID",
        //     key: "ID",
        //     width: "2vw",
        //     align: "center",
        //     sorter: (a, b) => a.ID - b.ID,
        // },
        {
            title: "器材編號",
            dataIndex: "CCM_ID",
            key: "CCM_ID",
            width: "3vw",
            align: "center",
            sorter: (a, b) => a.CCM_ID.localeCompare(b.CCM_ID),
        },
        {
            title: "尺寸",
            dataIndex: "CC_SIZE",
            key: "CC_SIZE",
            width: "2vw",
            align: "center",
            sorter: (a, b) => a.CC_SIZE.localeCompare(b.CC_SIZE || ""),
        },
        {
            title: "箱號",
            dataIndex: "BOX_ID",
            key: "BOX_ID",
            width: "2vw",
            align: "center",
            sorter: (a, b) => a.BOX_ID.localeCompare(b.BOX_ID || ""),
        },
        {
            title: "使用者名稱",
            dataIndex: "USER_NAME",
            key: "USER_NAME",
            width: "3vw",
            align: "center",
            sorter: (a, b) => a.USER_NAME.localeCompare(b.USER_NAME || ""),
        },
        {
            title: "使用開始時間",
            dataIndex: "CC_STARTTIME",
            key: "CC_STARTTIME",
            render: (text) =>
                text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "N/A",
            width: "4vw",
            align: "center",
            sorter: (a, b) => {
                if (!a.CC_STARTTIME && !b.CC_STARTTIME) return 0;
                if (!a.CC_STARTTIME) return 1;
                if (!b.CC_STARTTIME) return -1;
                return a.CC_STARTTIME.valueOf() - b.CC_STARTTIME.valueOf();
            },
        },
        {
            title: "狀態",
            dataIndex: "CC_STATUS",
            key: "CC_STATUS",
            render: (status) => (
                <Tag color={getStatusTagColor(status)}>{status}</Tag>
            ),
            width: "2.5vw",
            align: "center",
        },
        {
            title: "描述",
            dataIndex: "CC_SUBSTATUS",
            key: "CC_SUBSTATUS",
            width: "5vw",
            align: "center",
        },
        {
            title: "更新者",
            dataIndex: "UPDATE_BY",
            key: "UPDATE_BY",
            width: "4vw",
            align: "center",
            sorter: (a, b) => a.UPDATE_BY.localeCompare(b.UPDATE_BY || ""),
        },
        {
            title: "更新時間",
            dataIndex: "UPDATE_TIME",
            key: "UPDATE_TIME",
            render: (text) =>
                text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "N/A",
            width: "4vw",
            align: "center",
            sorter: (a, b) => {
                // 需要確保 UPDATE_TIME 也是 moment 對象，否則需要轉換
                const timeA = a.UPDATE_TIME ? moment(a.UPDATE_TIME) : null;
                const timeB = b.UPDATE_TIME ? moment(b.UPDATE_TIME) : null;
                if (!timeA && !timeB) return 0;
                if (!timeA) return 1;
                if (!timeB) return -1;
                return timeA.valueOf() - timeB.valueOf();
            },
        },
        {
            title: "備註",
            dataIndex: "COMMENT",
            key: "COMMENT",
            ellipsis: true,
            width: "5vw",
            align: "center",
        },
        {
            title: "更新次數",
            dataIndex: "UPD_CNT",
            key: "UPD_CNT",
            width: "2.5vw",
            align: "center",
            sorter: (a, b) => (a.UPD_CNT || 0) - (b.UPD_CNT || 0),
        },
        {
            title: "操作",
            key: "actions",
            render: (text, record) => {
                const items = [
                    {
                        key: "edit",
                        label: "編輯",
                        icon: <EditOutlined />,
                        onClick: () => onShowModal(record),
                    },
                    {
                        key: "report",
                        label: "回報問題",
                        icon: <BugOutlined />,
                        onClick: () => onShowReportModal(record.CCM_ID),
                    },
                    {
                        key: "forceDelete",
                        label: <span style={{ color: "red" }}>強制刪除</span>,
                        icon: <DeleteOutlined style={{ color: "red" }} />,
                        onClick: () => {
                            confirm({
                                title: `確定要永久刪除器材 ${record.CCM_ID} 嗎？`,
                                content:
                                    "此操作將永久移除該器材的所有記錄，且無法恢復。",
                                okText: "確定",
                                cancelText: "取消",
                                okType: "danger",
                                onOk: () => onForceDelete(record),
                            });
                        },
                    },
                    {
                        key: "logHistory",
                        label: "日誌",
                        icon: <HistoryOutlined />,
                        onClick: () => onShowLogHistory(record.CCM_ID),
                    },
                ];

                return (
                    <Dropdown menu={{ items }} trigger={["click"]}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
            width: "2vw",
            align: "center",
        },
    ];

    // 計算所有列寬度的總和，用於 Table 的 scroll.x
    const totalColumnsWidth = columns.reduce(
        (acc, col) => acc + (col.width || 0),
        0
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectRowChange, // 當選中行變化時的處理函數
        getCheckboxProps: (record) => ({
            disabled: record.CC_STATUS === "報廢", // 禁用報廢狀態的行
        }),
    };

    return (
        <Table
            columns={columns}
            dataSource={equipmentData} // 從 props 接收數據
            rowKey="CCM_ID"
            loading={loading} // 從 props 接收 loading 狀態
            pagination={pagination} // 從 props 接收分頁屬性
            scroll={{ x: totalColumnsWidth }}
            rowSelection={rowSelection} // 添加行選擇功能
        />
    );
};

export default EquipmentTable;
