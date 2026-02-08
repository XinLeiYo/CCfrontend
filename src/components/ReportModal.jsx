import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, message, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

const ReportModal = ({ open, onCancel, ccmId: initialCcmId = null }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const API_BASE_URL = "http://192.168.2.65:5172"; // 確保這是你的後端地址

    useEffect(() => {
        if (open) {
            form.resetFields();
            setFileList([]);
            // 如果從表格行傳入了 ccmId，則預設填入
            if (initialCcmId) {
                form.setFieldsValue({ ccm_id: initialCcmId });
            }
        }
    }, [open, form, initialCcmId]);

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        // 同步更新本地狀態，以控制 Upload 按鈕的顯示
        setFileList(e.fileList);
        return e && e.fileList;
    };

    const handleUpload = async (values) => {
        setUploading(true);
        try {
            const { images, ...otherValues } = values;
            if (!images || images.length === 0) {
                message.error("請上傳至少一張圖片！");
                setUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append("reporter_name", otherValues.reporter_name);
            formData.append("ccm_id", otherValues.ccm_id);
            formData.append("issue_type", otherValues.issue_type);
            formData.append("issue_description", otherValues.issue_description || "");
            
            // 遍歷所有檔案並添加到 FormData 中
            images.forEach(file => {
                formData.append('images', file.originFileObj);
            });

            const response = await axios.post(
                `${API_BASE_URL}/api/report/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.success) {
                message.success("回報上傳成功！");
                form.resetFields();
                setFileList([]);
                onCancel();
            } else {
                message.error(`回報上傳失敗: ${response.data.error}`);
            }
        } catch (error) {
            if (error.response) {
                message.error(
                    `提交失敗: ${error.response.data.error || "服務器錯誤"}`
                );
            } else if (error.request) {
                message.error("提交失敗: 無法連接到伺服器或網路錯誤");
            } else {
                message.error(`提交失敗: ${error.message}`);
            }
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上傳</div>
        </div>
    );

    return (
        <Modal
            title="上傳問題回報"
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()} // 💡 優化：使用 onOk 觸發表單提交
            okText="提交回報"
            cancelText="取消"
            confirmLoading={uploading}
        >
            <Form form={form} layout="vertical" onFinish={handleUpload}>
                
                <Form.Item
                    name="ccm_id"
                    label="器材ID"
                    rules={[{ required: true, message: "請輸入器材ID！" }]}
                >
                    <Input placeholder="輸入有問題的器材ID" />
                </Form.Item>
                <Form.Item
                    name="issue_type"
                    label="問題類型"
                    initialValue="髒污/破損"
                >
                    <Select placeholder="選擇問題類型">
                        <Option value="髒污/破損">髒污/破損</Option>
                        <Option value="遺失">遺失</Option>
                        <Option value="功能異常">功能異常</Option>
                        <Option value="其他">其他</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="issue_description" label="問題詳細描述/備註">
                    <TextArea rows={4} placeholder="請詳細描述問題..." />
                </Form.Item>
                <Form.Item
                    name="images"
                    label="問題圖片 (可上傳多張)"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "請上傳至少一張圖片！" }]}
                >
                    <Upload
                        action={`${API_BASE_URL}/upload`} // 阻止自動上傳，實際會在 onFinish 中處理
                        listType="picture-card"
                        multiple={true}
                        beforeUpload={() => false}
                    >
                        {fileList.length >= 8 ? null : uploadButton}
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReportModal;
