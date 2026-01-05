import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Modal, Image, message, Input, Space, Popconfirm, Select,Form } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from "moment"; // 確保導入 moment

const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL = "http://192.168.2.65:5000/api"; // 確保這是你的後端地址
const IMAGE_BASE_URL = "hhttp://192.168.2.65:5000";

const ReportListPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [currentImageUrls, setCurrentImageUrls] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [editForm] = Form.useForm();

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/reports`);
            if (response.data.success) {
                const formattedReports = response.data.reports.map(report => {
                    let imagePaths = [];
                    // 處理後端返回的 IMAGE_PATH，它可能是 JSON 字串
                    if (report.IMAGE_PATH) {
                        try {
                            // 嘗試解析 JSON 字串
                            imagePaths = JSON.parse(report.IMAGE_PATH);
                            // 確保解析後的結果是陣列
                            if (!Array.isArray(imagePaths)) {
                                imagePaths = [report.IMAGE_PATH]; // 如果不是陣列，就當作單一圖片路徑
                            }
                        } catch (e) {
                            console.error("解析 IMAGE_PATH 失敗:", e);
                            imagePaths = [report.IMAGE_PATH]; // 如果解析失敗，就當作單一圖片路徑
                        }
                    }

                    return {
                        ...report,
                        REPORT_TIME: report.REPORT_TIME ? moment(report.REPORT_TIME) : null,
                        PROCESS_TIME: report.PROCESS_TIME ? moment(report.PROCESS_TIME) : null,
                        IMAGE_PATH: imagePaths,
                    };
                });
                setReports(formattedReports);
            } else {
                message.error(`獲取回報資料失敗: ${response.data.error}`);
            }
        } catch (error) {
            message.error("獲取回報資料失敗，請檢查網路連接。");
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const showImagesModal = (imagePaths) => {
        // 💡 新增: 處理並設定模態視窗中的圖片 URL
        const urls = imagePaths.map(path => {
            let normalizedPath = path.replace(/\\/g, '/');
            if (!normalizedPath.startsWith('/')) {
                normalizedPath = '/' + normalizedPath;
            }
            return `${IMAGE_BASE_URL}${normalizedPath}`;
        });
        setCurrentImageUrls(urls);
        setIsImageModalVisible(true);
    };

    const handleImageModalCancel = () => {
        setIsImageModalVisible(false);
        setCurrentImageUrls([]);
    };

    const showEditModal = (record) => {
        setEditingReport(record);
        editForm.setFieldsValue({
            status: record.STATUS,
            processer: record.PROCESSER,
            process_notes: record.PROCESS_NOTES,
        });
        setIsEditModalVisible(true);
    };

    const handleEditModalOk = async () => {
        try {
            const values = await editForm.validateFields();
            if (!editingReport) return;

            const updates = {
                status: values.status,
                processer: values.processer,
                process_notes: values.process_notes,
                process_time: moment().format("YYYY-MM-DD HH:mm:ss") // 記錄處理時間
            };

            // 這裡需要一個新的後端接口來更新單一回報
            const response = await axios.put(`${API_BASE_URL}/report/${editingReport.ID}`, updates);

            if (response.data.success) {
                message.success("回報資料更新成功！");
                setIsEditModalVisible(false);
                setEditingReport(null);
                fetchReports(); // 重新載入數據
            } else {
                message.error(`更新失敗: ${response.data.error}`);
            }
        } catch (error) {
            console.error("Update failed:", error);
            message.error("更新回報資料失敗。");
        }
    };

    const handleDeleteReport = async (reportId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/report/${reportId}`);
            if (response.data.success) {
                message.success("回報已刪除！");
                fetchReports(); // 重新載入數據
            } else {
                message.error(`刪除失敗: ${response.data.error}`);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            message.error("刪除回報失敗。");
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "ID",
            key: "ID",
            width: 60,
            align: 'center',
            sorter: (a, b) => a.ID - b.ID,
        },
        {
            title: "器材ID",
            dataIndex: "CCM_ID_FK",
            key: "CCM_ID_FK",
            width: 100,
            align: 'center',
            sorter: (a, b) => a.CCM_ID_FK.localeCompare(b.CCM_ID_FK),
        },
        {
            title: "回報人",
            dataIndex: "REPORTER",
            key: "REPORTER",
            width: 100,
            align: 'center',
            sorter: (a, b) => a.REPORTER.localeCompare(b.REPORTER),
        },
        {
            title: "回報時間",
            dataIndex: "REPORT_TIME",
            key: "REPORT_TIME",
            width: 160,
            align: 'center',
            render: (text) => text ? text.format("YYYY-MM-DD HH:mm:ss") : "N/A",
            sorter: (a, b) => {
                if (!a.REPORT_TIME && !b.REPORT_TIME) return 0;
                if (!a.REPORT_TIME) return 1;
                if (!b.REPORT_TIME) return -1;
                return a.REPORT_TIME.valueOf() - b.REPORT_TIME.valueOf();
            },
        },
        {
            title: "問題類型",
            dataIndex: "ISSUE_TYPE",
            key: "ISSUE_TYPE",
            width: 100,
            align: 'center',
            sorter: (a, b) => a.ISSUE_TYPE.localeCompare(b.ISSUE_TYPE),
        },
        {
            title: "問題描述",
            dataIndex: "ISSUE_INFO",
            key: "ISSUE_INFO",
            width: 200,
            align: 'center',
            ellipsis: true,
            sorter: (a, b) => a.ISSUE_INFO.localeCompare(b.ISSUE_INFO || ""),
        },
        {
            title: "圖片",
            dataIndex: "IMAGE_PATH",
            key: "IMAGE_PATH",
            width: 120,
            align: 'center',
            render: (imagePaths) => (
                <Space>
                    {imagePaths && imagePaths.length > 0 ? (
                        <Button 
                            icon={<EyeOutlined />}
                            onClick={() => showImagesModal(imagePaths)}
                        >
                            查看圖片 ({imagePaths.length})
                        </Button>
                    ) : (
                        "無"
                    )}
                </Space>
            ),
        },
        {
            title: "狀態",
            dataIndex: "STATUS",
            key: "STATUS",
            width: 100,
            align: 'center',
            render: (status) => {
                let color;
                if (status === "待處理") {
                    color = "gold";
                } else if (status === "已處理") {
                    color = "green";
                } else if (status === "已忽略") {
                    color = "red";
                } else {
                    color = "grey";
                }
                return <Tag color={color}>{status}</Tag>;
            },
            sorter: (a, b) => a.STATUS.localeCompare(b.STATUS),
        },
        {
            title: "處理人",
            dataIndex: "PROCESSER",
            key: "PROCESSER",
            width: 100,
            align: 'center',
            sorter: (a, b) => a.PROCESSER?.localeCompare(b.PROCESSER || "") || 0,
        },
        {
            title: "處理時間",
            dataIndex: "PROCESS_TIME",
            key: "PROCESS_TIME",
            width: 160,
            align: 'center',
            render: (text) => text ? text.format("YYYY-MM-DD HH:mm:ss") : "N/A",
            sorter: (a, b) => {
                if (!a.PROCESS_TIME && !b.PROCESS_TIME) return 0;
                if (!a.PROCESS_TIME) return 1;
                if (!b.PROCESS_TIME) return -1;
                return a.PROCESS_TIME.valueOf() - b.PROCESS_TIME.valueOf();
            },
        },
        {
            title: "處理備註",
            dataIndex: "PROCESS_NOTES",
            key: "PROCESS_NOTES",
            width: 180,
            align: 'center',
            ellipsis: true,
            sorter: (a, b) => a.PROCESS_NOTES?.localeCompare(b.PROCESS_NOTES || "") || 0,
        },
        {
            title: "操作",
            key: "actions",
            width: 120,
            fixed: "right",
            align: 'center',
            render: (text, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        title="編輯處理狀態"
                    />
                    <Popconfirm
                        title="確定要刪除這條回報嗎？"
                        onConfirm={() => handleDeleteReport(record.ID)}
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            title="刪除回報"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h1>問題回報列表</h1>
            <Table
                dataSource={reports}
                columns={columns}
                loading={loading}
                rowKey="ID"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1500 }}
                bordered
            />

            {/* 圖片查看 Modal */}
            <Modal
                title="問題圖片"
                open={isImageModalVisible}
                onCancel={handleImageModalCancel}
                footer={null}
            >
                {currentImageUrls.length > 0 ? (
                    <Image.PreviewGroup>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {currentImageUrls.map((url, index) => (
                                <Image
                                    key={index}
                                    src={url}
                                    alt={`回報圖片 ${index + 1}`}
                                    style={{ maxWidth: "100%", height: "auto" }}
                                />
                            ))}
                        </Space>
                    </Image.PreviewGroup>
                ) : (
                    <p>沒有圖片可顯示。</p>
                )}
            </Modal>

            {/* 編輯處理狀態 Modal */}
            <Modal
                title="編輯回報處理狀態"
                open={isEditModalVisible}
                onOk={handleEditModalOk}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="status"
                        label="處理狀態"
                        rules={[{ required: true, message: '請選擇處理狀態！' }]}
                    >
                        <Select placeholder="選擇狀態">
                            <Option value="待處理">待處理</Option>
                            <Option value="已處理">已處理</Option>
                            <Option value="已忽略">已忽略</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="processer"
                        label="處理人"
                    >
                        <Input placeholder="輸入處理人姓名" />
                    </Form.Item>
                    <Form.Item
                        name="process_notes"
                        label="處理備註"
                    >
                        <TextArea rows={3} placeholder="輸入處理備註" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReportListPage;