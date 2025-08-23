import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Select,
    Input,
    DatePicker,
    Checkbox,
    message,
} from "antd";
import moment from "moment";
import { EQUIPMENT_STATUS_OPTIONS, MAINTENANCE_SUBSTATUS_OPTIONS } from "../utils/statusUtils";

const { Option } = Select;
const { TextArea } = Input;

const BatchEditModal = ({
    open,
    onCancel,
    onBatchSave,
    selectedEquipments,
}) => {
    const [form] = Form.useForm();
    const [fieldsToUpdate, setFieldsToUpdate] = useState({});

    useEffect(() => {
        if (open) {
            form.resetFields();
            setFieldsToUpdate({});
        }
    }, [open, form]);

    const handleFieldCheckboxChange = (fieldName, checked) => {
        setFieldsToUpdate((prev) => {
            const newState = {
                ...prev,
                [fieldName]: checked,
            };
            if (fieldName === "CC_STATUS" && !checked) {
                newState.CC_SUBSTATUS = false;
                form.setFieldsValue({ CC_SUBSTATUS: undefined });
            }
            return newState;
        });

        if (!checked) {
            form.setFieldsValue({ [fieldName]: undefined });
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const updates = {};

            for (const fieldName in fieldsToUpdate) {
                if (fieldsToUpdate[fieldName]) {
                    let value = values[fieldName];
                    if (fieldName === "CC_STARTTIME" && value) {
                        value = moment(value).format("YYYY-MM-DD HH:mm:ss");
                    }
                    updates[fieldName] = value;
                }
            }

            if (Object.keys(updates).length === 0) {
                message.warning("請選擇要更新的字段並輸入值！");
                return;
            }

            const batchUpdatePayload = {
                ccm_ids: selectedEquipments.map(item => item.CCM_ID), // 💡 假設每個器材對象都有一個唯一的 'id'
                updates: updates
            };
            console.log("正在準備發送以下批次更新資料:", batchUpdatePayload);

            onBatchSave(updates);
            onCancel();
        } catch (errorInfo) {
            console.log("Validate Failed:", errorInfo); // 保留這一個，因為錯誤通常需要被記錄
            message.error("請檢查輸入是否正確！");
        }
    };

    const ccStatus = Form.useWatch("CC_STATUS", form);
    const isMaintenanceStatus = ccStatus === "維修";

    return (
        <Modal
            title={`批次編輯器材 (${selectedEquipments.length} 項)`}
            open={open}
            onOk={handleModalOk}
            onCancel={onCancel}
            width={600}
            forceRender
        >
            <Form form={form} layout="vertical">
                {/* 狀態 */}
                <div style={{ marginBottom: 16 }}>
                    <Checkbox
                        checked={fieldsToUpdate.CC_STATUS || false}
                        onChange={(e) => {
                            handleFieldCheckboxChange(
                                "CC_STATUS",
                                e.target.checked
                            );
                        }}
                        style={{ 
                            marginBottom: 8, 
                            cursor: 'pointer',
                            userSelect: 'none',
                            pointerEvents: 'auto'
                        }}
                    >
                        狀態
                    </Checkbox>
                    <Form.Item name="CC_STATUS">
                        <Select
                            placeholder="選擇狀態"
                            disabled={!fieldsToUpdate.CC_STATUS}
                            allowClear
                        >
                            {EQUIPMENT_STATUS_OPTIONS.map((status) => (
                                <Option key={status} value={status}>
                                    {status}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                {/* 描述 */}
                <div style={{ marginBottom: 16 }}>
                    <Checkbox
                        checked={fieldsToUpdate.CC_SUBSTATUS || false}
                        onChange={(e) => {
                            handleFieldCheckboxChange(
                                "CC_SUBSTATUS",
                                e.target.checked
                            );
                        }}
                        style={{ 
                            marginBottom: 8,
                            cursor: 'pointer',
                            userSelect: 'none',
                            pointerEvents: 'auto'
                        }}
                    >
                        描述
                    </Checkbox>
                    <Form.Item name="CC_SUBSTATUS">
                        {/* 根據狀態顯示不同的輸入控件 */}
                        {isMaintenanceStatus && fieldsToUpdate.CC_SUBSTATUS ? (
                            <Select
                                placeholder="選擇維修項目"
                                disabled={!fieldsToUpdate.CC_SUBSTATUS}
                                allowClear
                                showSearch
                                options={MAINTENANCE_SUBSTATUS_OPTIONS.map(opt => ({
                                    value: opt,
                                    label: opt
                                }))}
                            />
                        ) : (
                            <TextArea
                                placeholder="請輸入描述"
                                disabled={!fieldsToUpdate.CC_SUBSTATUS}
                            />
                        )}
                    </Form.Item>
                </div>

                {/* 備註 */}
                <div style={{ marginBottom: 16 }}>
                    <Checkbox
                        checked={fieldsToUpdate.COMMENT || false}
                        onChange={(e) =>
                            handleFieldCheckboxChange(
                                "COMMENT",
                                e.target.checked
                            )
                        }
                        style={{ marginBottom: 8 }}
                    >
                        備註
                    </Checkbox>
                    <Form.Item name="COMMENT">
                        <TextArea
                            placeholder="輸入備註"
                            disabled={!fieldsToUpdate.COMMENT}
                        />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default BatchEditModal;