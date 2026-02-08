import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Modal, message, Flex, Row, Col, Button } from "antd";
import moment from "moment";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import EquipmentModalForm from "../components/EquipmentModalForm";
import StatusCards from "../components/StatusCards";
import EquipmentTable from "../components/EquipmentTable";
import LogHistoryModal from "../components/LogHistoryModal";
import SearchBar from "../components/SearchBar";
import BatchEditModal from "../components/BatchEditModal";
import ReportModal from "../components/ReportModal";
import ReportListPage from "./ReportListPage";
import { useAuth } from "../context/useAuth";

import {
    EditOutlined,
    BugOutlined,
    RollbackOutlined,
    FileTextOutlined,
    PlusOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";

import "./EquipmentPage.css";

const { confirm } = Modal;

const EquipmentPage = () => {
    // 器材數據狀態
    const [equipmentData, setEquipmentData] = useState([]);
    // 狀態統計數據
    const [loading, setLoading] = useState(false);
    // 編輯/新增模態框狀態
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 當前編輯的器材數據
    const [currentEquipment, setCurrentEquipment] = useState(null);
    // 編輯/新增模態框狀態
    const [selectedCcmIdForHistory, setSelectedCcmIdForHistory] =
        useState(null);
    // 日誌歷史模態框狀態
    const [isLogHistoryModalVisible, setIsLogHistoryModalVisible] =
        useState(false);
    // 狀態統計數據
    const [statusCounts, setStatusCounts] = useState({});
    // 當前篩選的狀態
    const [currentFilterStatus, setCurrentFilterStatus] = useState(null);
    // 分頁當前頁碼狀態
    const [currentPage, setCurrentPage] = useState(1);
    // 分頁大小狀態
    const [pageSize, setPageSize] = useState(10);
    // 搜尋關鍵字狀態
    const [searchTerm, setSearchTerm] = useState("");
    // 新增批次編輯相關狀態
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // 選中的行的 key (ID)
    const [selectedEquipments, setSelectedEquipments] = useState([]); // 選中的行數據
    const [isBatchEditModalVisible, setIsBatchEditModalVisible] =
        useState(false); // 批次編輯模態框狀態
    // 回報模態框狀態
    const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 回報模態框狀態
    // 回報器材ID狀態
    const [ccmIdForReport, setCcmIdForReport] = useState(null); // 用於回報的器材ID
    // 當前頁面狀態
    const [currentTable, setCurrentTable] = useState("equipmentList");

    const { token, logout } = useAuth();

    const API_BASE_URL = "http://192.168.2.65:5172";

    const fetchEquipmentData = useCallback(
        async (status = null) => {
            if (!token) {
                console.log("Token is missing, skipping API call.");
                setEquipmentData([]);
                setLoading(false);
                return;
            }
            console.log("Token is present, fetching data...");

            setLoading(true);
            try {
                const url = status
                    ? `${API_BASE_URL}/api/equipment?status=${status}`
                    : `${API_BASE_URL}/api/equipment`;

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const rawData = Array.isArray(response.data)
                    ? response.data
                    : [];
                const processedData = rawData.map((item) => ({
                    ...item,
                    CC_STARTTIME: item.CC_STARTTIME
                        ? moment(item.CC_STARTTIME)
                        : null,
                    key: item.CCM_ID,
                }));
                setEquipmentData(processedData);
            } catch (error) {
                message.error("獲取器材資料失敗！");
                console.error(
                    "Error fetching equipment data:",
                    error.response ? error.response.data : error
                );
                if (error.response && error.response.status === 401) {
                    logout();
                    message.error("認證資訊已過期，請重新登入。");
                }
                setEquipmentData([]);
            } finally {
                setLoading(false);
            }
        },
        [token, logout]
    ); // 依賴項：確保 token 和 logout 是最新的

    const fetchStatusCounts = useCallback(async () => {
        if (!token) {
            setStatusCounts({});
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/equipment/status_counts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setStatusCounts(response.data || {});
        } catch (error) {
            console.error(
                "Error fetching status counts:",
                error.response ? error.response.data : error
            );
            message.error("獲取狀態統計失敗！");
            if (error.response && error.response.status === 401) {
                logout();
            }
            setStatusCounts({});
        }
    }, [token, logout]); // 依賴項：確保 token 和 logout 是最新的

    useEffect(() => {
        fetchEquipmentData();
        fetchStatusCounts();
    }, [fetchEquipmentData, fetchStatusCounts, token]); // 依賴項是這兩個函式

    const handleStatusFilter = (status) => {
        if (currentFilterStatus === status) {
            setCurrentFilterStatus(null);
            fetchEquipmentData(); // 清除篩選，獲取所有數據
        } else {
            setCurrentFilterStatus(status);
            fetchEquipmentData(status); // 應用狀態篩選
        }
        setCurrentPage(1); // 篩選後回到第一頁
    };

    // 顯示編輯/新增模態框
    const showModal = (equipment = null) => {
        setCurrentEquipment(equipment);
        setIsModalOpen(true);
    };

    // 當模態框打開時，根據是否有當前設備來設置表單值
    const handleOk = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
            };

            if (currentEquipment) {
                await axios.put(
                    `${API_BASE_URL}/api/equipment/${currentEquipment.CCM_ID}`,
                    payload
                );
                message.success("器材更新成功！");
            } else {
                await axios.post(`${API_BASE_URL}/equipment`, payload);
                message.success("器材新增成功！");
            }
            setIsModalOpen(false);
            setCurrentEquipment(null);
            fetchEquipmentData(currentFilterStatus);
            setSelectedRowKeys([]);
            setSelectedEquipments([]);
        } catch (error) {
            message.error("操作失敗，請檢查資料或網路！");
            console.error(
                "Error during equipment operation:",
                error.response ? error.response.data : error
            );
        } finally {
            setLoading(false);
        }
    };

    // 關閉模態框
    const handleCancel = () => {
        setIsModalOpen(false);
        setCurrentEquipment(null);
    };

    // 處理永久刪除器材
    const handleForceDelete = async (equipment) => {
        confirm({
            title: `確定要永久刪除器材 ${equipment.CCM_ID} 嗎？`,
            content: "此操作將永久移除該器材的所有記錄，且無法恢復。",
            okText: "確定",
            cancelText: "取消",
            okType: "danger",
            onOk: async () => {
                try {
                    setLoading(true);
                    await axios.delete(
                        `${API_BASE_URL}/api/equipment/${equipment.ID}`,
                        {
                            data: { updateBy: "Admin" }, // 或從用戶會話中獲取
                        }
                    );
                    message.success("器材已成功永久刪除！");
                    fetchEquipmentData(currentFilterStatus);
                    setSelectedRowKeys([]);
                    setSelectedEquipments([]);
                } catch (error) {
                    message.error("永久刪除失敗！");
                    console.error(
                        "Error during force delete:",
                        error.response ? error.response.data : error
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // 顯示日誌歷史模態框
    const showLogHistory = (ccmId) => {
        setSelectedCcmIdForHistory(ccmId);
        setIsLogHistoryModalVisible(true);
    };

    // 關閉日誌歷史模態框
    const handleLogHistoryModalClose = () => {
        setIsLogHistoryModalVisible(false);
        setSelectedCcmIdForHistory(null);
    };

    // 處理搜尋輸入框的變化
    const handleSearchKeywordChange = (value) => {
        setSearchTerm(value.toLowerCase()); // 轉為小寫以便不區分大小寫搜尋
    };

    // 實際執行搜尋操作 (由 SearchBar 按鈕點擊或回車觸發)
    const handleSearchButtonClick = () => {
        // 當用戶點擊搜尋按鈕時，通常會希望重新從後端獲取數據 (如果後端支援搜尋API)
        // 或者只是重置分頁
        setCurrentPage(1); // 搜尋後回到第一頁
        // 如果你的後端支持 /api/equipment?search=keyword，你可以在這裡調用
        // fetchEquipmentData(currentFilterStatus, searchTerm);
        // 但目前你的邏輯是前端篩選，所以這裡僅重置分頁
    };

    // 批次選擇處理函數
    const onSelectRowChange = (newSelectedRowKeys, newSelectedRows) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setSelectedEquipments(newSelectedRows);
    };

    // 顯示批次編輯模態框
    const showBatchEditModal = () => {
        if (selectedEquipments.length === 0) {
            message.warning("請至少選擇一項器材進行批次編輯！");
            return;
        }
        setIsBatchEditModalVisible(true);
    };

    // 關閉批次編輯模態框
    const handleBatchEditModalCancel = () => {
        setIsBatchEditModalVisible(false);
    };

    // 處理批次保存
    const handleBatchSave = async (updates) => {
        setLoading(true);
        try {
            // 構建一個包含所有要更新器材的陣列
            // 後端 API 期望 'CCM_ID' 和其他更新欄位
            const batchPayload = selectedEquipments
                .filter((equipment) => equipment && equipment.CCM_ID)
                .map((equipment) => ({
                    CCM_ID: equipment.CCM_ID,
                    ...updates, // 這裡包含了 CC_STATUS, CC_SUBSTATUS, COMMENT 等
                }));

            if (batchPayload.length === 0) {
                message.warning("沒有可更新的有效器材。");
                setLoading(false);
                return;
            }

            // 只發送一個 PUT 請求到新的批次更新路由
            await axios.put(`${API_BASE_URL}/api/equipment/batch`, batchPayload);

            message.success(`成功更新 ${batchPayload.length} 項器材！`);
            setIsBatchEditModalVisible(false);
            setSelectedRowKeys([]); // 清空選中項
            setSelectedEquipments([]);
            fetchEquipmentData(currentFilterStatus); // 重新獲取數據
        } catch (error) {
            message.error("批次更新失敗！請檢查網路或數據。");
            console.error("Batch update error:", error);
            // 可以在這裡進一步處理錯誤，例如顯示哪些特定項目更新失敗
        } finally {
            setLoading(false);
        }
    };

    // 篩選邏輯：結合狀態過濾和關鍵字搜尋
    const filteredEquipmentData = equipmentData.filter((equipment) => {
        // 先進行狀態篩選 (如果 currentFilterStatus 不為 null)
        const statusMatch =
            currentFilterStatus === null ||
            equipment.CC_STATUS === currentFilterStatus;

        // 再進行關鍵字搜尋 (如果 searchTerm 不為空)
        const searchMatch =
            searchTerm === "" ||
            Object.values(equipment).some((value) =>
                String(value).toLowerCase().includes(searchTerm)
            );

        return statusMatch && searchMatch;
    });

    // 顯示回報模態框
    const showReportModal = (ccmId = null) => {
        setCcmIdForReport(ccmId);
        setIsReportModalOpen(true);
    };

    // 關閉回報模態框
    const handleReportModalCancel = () => {
        setIsReportModalOpen(false);
        setCcmIdForReport(null);
    };

    // 匯出 Excel 檔案的處理函式
    const handleExportToExcel = () => {
        if (filteredEquipmentData.length === 0) {
            message.warning("沒有資料可以匯出。");
            return;
        }

        // 定義表格標題
        const headers = [
            "器材編號",
            "設備尺寸",
            "箱號",
            "使用者名稱",
            "使用開始時間",
            "狀態",
            "描述",
            "更新者",
            "更新時間",
            "備註",
            "更新次數"
        ];
        
        // 將數據轉換為適合 Excel 的格式
        const dataForExport = filteredEquipmentData.map(item => [
            item.CCM_ID,
            item.CC_SIZE,
            item.BOX_ID,
            item.USER_NAME,
            item.CC_STARTTIME ? moment(item.CC_STARTTIME).format('YYYY-MM-DD HH:mm:ss') : '',
            item.CC_STATUS,
            item.CC_SUBSTATUS,
            item.UPDATE_BY,
            item.UPDATE_TIME ? moment(item.UPDATE_TIME).format('YYYY-MM-DD HH:mm:ss') : '',
            item.COMMENT,
            item.UPD_CNT
        ]);

        // 創建一個新的工作簿
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataForExport]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "器材列表");

        // 將工作簿寫入檔案並下載
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), "器材列表.xlsx");
        message.success("檔案已成功匯出！");
    };



    // 分頁配置
    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: filteredEquipmentData.length,
        onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
        },
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
    };

    const renderContent = () => {
        if (currentTable === "reportList") {
            return (
                <div style={{ padding: 24 }}>
                    <Button
                        type="primary"
                        icon={<RollbackOutlined />}
                        onClick={() => setCurrentTable("equipmentList")}
                        style={{ marginBottom: 16 }}
                    >
                        返回器材列表
                    </Button>
                    <ReportListPage />
                </div>
            );
        } else {
            return (
                <>
                    <h1>器材管理</h1>
                    <Flex
                        className="equipment-page-container-flex"
                        gap={16}
                        wrap="wrap"
                    >
                        {/* 狀態統計卡片區 */}
                        <Flex
                            className="equipment-page-container-flex-card"
                            gap={16}
                            wrap="wrap"
                        >
                            <StatusCards
                                statusCounts={statusCounts}
                                currentFilterStatus={currentFilterStatus}
                                handleStatusFilter={handleStatusFilter}
                            />
                        </Flex>

                        {/* 器材列表和操作區 */}
                        <Flex
                            className="equipment-page-container-flex-table"
                            gap={16}
                            vertical
                        >
                            <Flex vertical key="equipment-details-section">
                                {/* 搜尋和新增按鈕所在的行 */}
                                <Row
                                    style={{ width: "100%", marginBottom: 16 }} // 這裡可以加回 margin-bottom
                                >
                                    <Col span={16}>
                                        <SearchBar
                                            searchKeyword={searchTerm}
                                            onSearchKeywordChange={
                                                handleSearchKeywordChange
                                            }
                                            onSearch={handleSearchButtonClick} // 點擊搜尋按鈕
                                        />
                                    </Col>
                                    <Col
                                        span={8}
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        {/* 匯出Excel按鈕 */}
                                        <Button
                                            type="default"
                                            icon={<FileExcelOutlined />}
                                            onClick={handleExportToExcel}
                                            style={{ marginRight: 8 }}
                                        >
                                            匯出EXCEL
                                        </Button>
                                        {/* 批次編輯按鈕 */}
                                        <Button
                                            type="default"
                                            icon={<EditOutlined />}
                                            onClick={showBatchEditModal}
                                            disabled={
                                                selectedRowKeys.length === 0
                                            } // 沒有選中項目時禁用
                                            style={{ marginRight: 8 }}
                                        >
                                            批次編輯 ({selectedRowKeys.length})
                                        </Button>
                                        {/* 回報問題按鈕 */}
                                        <Button
                                            type="default"
                                            icon={<BugOutlined />}
                                            onClick={() =>
                                                showReportModal(ccmIdForReport)
                                            }
                                            style={{ marginRight: 8 }}
                                        >
                                            回報問題
                                        </Button>
                                        {/* 查看回報列表按鈕 */}
                                        <Button
                                            type="primary"
                                            icon={<FileTextOutlined />}
                                            onClick={() =>
                                                setCurrentTable("reportList")
                                            }
                                            style={{ marginRight: 8 }}
                                        >
                                            查看問題回報
                                        </Button>
                                        {/* 新增器材按鈕 */}
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => showModal()}
                                            style={{ marginRight: 8 }}
                                        >
                                            新增器材
                                        </Button>
                                        <Button onClick={logout}>登出</Button>
                                    </Col>
                                </Row>

                                {/* 器材列表表格 */}
                                <EquipmentTable
                                    equipmentData={filteredEquipmentData}
                                    loading={loading}
                                    pagination={paginationConfig}
                                    onShowModal={showModal}
                                    onForceDelete={handleForceDelete}
                                    onShowLogHistory={showLogHistory}
                                    selectedRowKeys={selectedRowKeys}
                                    onSelectRowChange={onSelectRowChange}
                                    onShowReportModal={showReportModal}
                                />

                                {/* 編輯/新增模態框 */}
                                <EquipmentModalForm
                                    open={isModalOpen}
                                    onCancel={handleCancel}
                                    onFinish={handleOk}
                                    currentEquipment={currentEquipment}
                                />

                                {/* 日誌歷史模態框 */}
                                <LogHistoryModal
                                    open={isLogHistoryModalVisible}
                                    onClose={handleLogHistoryModalClose}
                                    ccmId={selectedCcmIdForHistory}
                                />

                                {/* 批次編輯模態框 */}
                                <BatchEditModal
                                    open={isBatchEditModalVisible}
                                    onCancel={handleBatchEditModalCancel}
                                    onBatchSave={handleBatchSave}
                                    selectedEquipments={selectedEquipments} // 傳遞選中的器材數據
                                />

                                {/* 回報模態框 */}
                                <ReportModal
                                    open={isReportModalOpen}
                                    onCancel={handleReportModalCancel}
                                    ccmId={ccmIdForReport}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                </>
            );
        }
    };
    return <div className="equipment-page-container">{renderContent()}</div>;
};

export default EquipmentPage;
