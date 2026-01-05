// components/LogHistoryModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, message, Spin, Tag } from 'antd'; // 增加 Spin 和 Tag 導入
import axios from 'axios';
import moment from 'moment'; // 導入 moment 庫

// 確保 API_BASE_URL 與 EquipmentPage.jsx 中的一致
const API_BASE_URL = "http://192.168.2.65:5000/api";

const getStatusTagColor = (status) => {
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
            case "已刪除": // 為軟刪除狀態添加顏色
                return "gray";
            case "強制刪除": // 為強制刪除日誌狀態添加顏色
                return "black";
            default:
                return "default";
        }
    };
const LogHistoryModal = ({ open, onClose, ccmId }) => {
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            // 修正 API 路徑以匹配後端路由
            // 後端是 /api/equipment/logs/<string:ccm_id_fk>
            const url = `${API_BASE_URL}/equipment/logs/${ccmId}`;
            const res = await axios.get(url);

            if (res.data.success) {
                // 將日期時間字串轉換為 moment 物件，並確保有 key
                const processedData = res.data.data.map(log => ({
                    ...log,
                    INPUT_DATE: log.INPUT_DATE ? moment(log.INPUT_DATE) : null,
                    UPDATE_TIME: log.UPDATE_TIME ? moment(log.UPDATE_TIME) : null,
                    key: log.CCL_ID, // 使用 CCL_ID 作為唯一鍵
                }));
                // 按 UPDATE_TIME 降序排序，最新的日誌在最上面
                processedData.sort((a, b) => {
                    const timeA = a.UPDATE_TIME ? a.UPDATE_TIME.valueOf() : 0;
                    const timeB = b.UPDATE_TIME ? b.UPDATE_TIME.valueOf() : 0;
                    return timeB - timeA;
                });
                setLogData(processedData);
            } else {
                message.error('日誌資料載入失敗: ' + (res.data.error || '未知錯誤'));
                setLogData([]); // 清空數據
            }
        } catch (err) {
            console.error('獲取日誌錯誤:', err.response ? err.response.data : err);
            message.error('伺服器錯誤，無法載入日誌');
            setLogData([]); // 清空數據
        } finally {
            setLoading(false);
        }
    }, [ccmId, setLoading, setLogData]); // fetchLogs 的依賴項，只有這些改變時才會重新創建 fetchLogs


    useEffect(() => {
        // 僅在 Modal 開啟且 ccmId 提供時獲取日誌
        if (open && ccmId) {
            fetchLogs();
        } else if (!open) {
            // Modal 關閉時清除資料，以防止顯示舊資料
            setLogData([]);
        }
    }, [open, ccmId,fetchLogs   ]); // 依賴於 open 和 ccmId，確保在項目改變時重新獲取

    // 欄位定義與 CC_LOG 表格結構匹配
    const columns = [
        { title: '日誌流水號', dataIndex: 'CCL_ID', key: 'CCL_ID', width: 100 },
        { title: '器材編號', dataIndex: 'CC_ID_FK', key: 'CC_ID_FK', width: 120 }, // 將「無塵衣編號」改為「器材編號」與 EquipmentPage 一致
        {
            title: '輸入日期',
            dataIndex: 'INPUT_DATE',
            key: 'INPUT_DATE',
            width: 180,
            render: (text) => (text ? text.format("YYYY-MM-DD HH:mm:ss") : 'N/A'), // 使用 moment 格式化
        },
        {
            title: '狀態', // 將「操作狀態」改為「狀態」與 EquipmentPage 一致
            dataIndex: 'CC_STATUS',
            key: 'CC_STATUS',
            width: 120,
            render: (status) => ( // 使用 Tag 渲染狀態
                <Tag color={getStatusTagColor(status)}>{status}</Tag>
            ),
        },
        { title: '描述', dataIndex: 'CC_SUBSTATUS', key: 'CC_SUBSTATUS', ellipsis: true }, // 將「描述狀態」改為「描述」
        { title: '操作者', dataIndex: 'UPDATE_BY', key: 'UPDATE_BY', width: 100 }, // 將「更改者」改為「操作者」
        {
            title: '更新時間',
            dataIndex: 'UPDATE_TIME',
            key: 'UPDATE_TIME',
            width: 180,
            render: (text) => (text ? text.format("YYYY-MM-DD HH:mm:ss") : 'N/A'), // 使用 moment 格式化
        },
        { title: '備註', dataIndex: 'COMMENT', key: 'COMMENT', ellipsis: true },
    ];

    return (
        <Modal
            title={`器材編號 ${ccmId || ''} 的操作歷史記錄`} // Modal 標題顯示 CCM_ID，將「無塵衣編號」改為「器材編號」
            open={open}
            onCancel={onClose}
            footer={null}
            width={1200} // 根據需要調整寬度
        >
            <Spin spinning={loading}> {/* 增加 Spin 組件 */}
                <Table
                    dataSource={logData}
                    columns={columns}
                    loading={loading}
                    rowKey="CCL_ID" // 使用 CCL_ID 作為日誌表格的唯一鍵
                    bordered
                    scroll={{ y: 400, x: 1000 }} // 增加 X 軸滾動條以適應較寬的表格
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: "暫無日誌數據" }} // 空數據提示
                />
            </Spin>
        </Modal>
    );
};

export default LogHistoryModal;