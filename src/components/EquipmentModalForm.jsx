import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, message } from 'antd';
import moment from 'moment';
import { EQUIPMENT_STATUS_OPTIONS,MAINTENANCE_SUBSTATUS_OPTIONS } from '../utils/statusUtils'; // 引入狀態選項

const { Option } = Select;

const EquipmentModalForm = ({
    open,
    onCancel,
    onFinish, // 提交表單的函數
    currentEquipment, // 當前編輯的器材數據 (或 null 表示新增)
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (currentEquipment) {
                // 編輯模式，設置表單初始值
                form.setFieldsValue({
                    ...currentEquipment,
                    CC_STARTTIME: currentEquipment.CC_STARTTIME ? moment(currentEquipment.CC_STARTTIME) : null,
                });
            } else {
                // 新增模式，重置表單
                form.resetFields();
            }
        }
    }, [open, currentEquipment, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // 格式化日期時間
            const formattedValues = {
                CCM_ID: values.CCM_ID,
                CC_SIZE: values.CC_SIZE,
                BOX_ID: values.BOX_ID,
                USER_NAME: values.USER_NAME,
                CC_STARTTIME: values.CC_STARTTIME ? values.CC_STARTTIME.format("YYYY-MM-DD HH:mm:ss") : null,
                CC_STATUS: values.CC_STATUS,
                CC_SUBSTATUS: values.CC_SUBSTATUS,
                COMMENT: values.COMMENT,
            };
            onFinish(formattedValues); // 調用父組件傳入的 onFinish
        } catch (errorInfo) {
            console.log('Validate Failed:', errorInfo);
            message.error('請檢查表單輸入是否正確！');
        }
    };

    return (
        <Modal
            title={currentEquipment ? "編輯器材" : "新增器材"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            forceRender // 確保表單字段始終存在，以便 useEffect 可以設置值
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="CCM_ID"
                    label="器材編號"
                    rules={[{ required: true, message: '請輸入器材編號！' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="CC_SIZE" label="尺寸">
                    <Input />
                </Form.Item>
                <Form.Item name="BOX_ID" label="箱號">
                    <Input />
                </Form.Item>
                <Form.Item name="USER_NAME" label="使用者名稱">
                    <Input />
                </Form.Item>
                <Form.Item name="CC_STARTTIME" label="使用開始時間">
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="CC_STATUS"
                    label="狀態"
                    rules={[{ required: true, message: '請選擇器材狀態！' }]}
                >
                    <Select placeholder="選擇狀態">
                        {EQUIPMENT_STATUS_OPTIONS.map((status) => (
                            <Option key={status} value={status}>
                                {status}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    noStyle // 不渲染額外的 Form.Item 包裹，讓內部動態組件自行處理
                    shouldUpdate={(prevValues, currentValues) =>
                        prevValues.CC_STATUS !== currentValues.CC_STATUS
                    }
                >
                    {({ getFieldValue }) => {
                        const ccStatus = getFieldValue('CC_STATUS');
                        return (
                            <Form.Item name="CC_SUBSTATUS" label="描述">
                                {ccStatus === '維修' ? (
                                    <Select
                                        placeholder="選擇或輸入維修項目"
                                        allowClear
                                        showSearch // 允許搜尋
                                        // 這是一個關鍵：filterOption 設置為 false，
                                        // 這樣當用戶輸入不在 Option 中的內容時，它就不會被過濾掉
                                        filterOption={false}
                                        // 當用戶輸入時，將值設置到表單項中，而不是僅僅篩選
                                        onSearch={(value) => {
                                            form.setFieldsValue({ CC_SUBSTATUS: value });
                                        }}
                                        // 當用戶選擇下拉選項時
                                        onChange={(value) => {
                                            form.setFieldsValue({ CC_SUBSTATUS: value });
                                        }}
                                        // 確保 Select 的值是從 Form.Item 獲取的
                                        value={form.getFieldValue('CC_SUBSTATUS')}
                                        // 如果用戶輸入的值不在選項中，我們可以手動添加它，以便下拉列表仍然包含它
                                        // 這裡不需要額外的 `children` 狀態，Select 會自行處理
                                    >
                                        {MAINTENANCE_SUBSTATUS_OPTIONS.map((option) => (
                                            <Option key={option} value={option}>
                                                {option}
                                            </Option>
                                        ))}
                                    </Select>
                                ) : (
                                    <Input.TextArea placeholder="請輸入描述" />
                                )}
                            </Form.Item>
                        );
                    }}
                </Form.Item>

                <Form.Item name="COMMENT" label="備註">
                    <Input.TextArea />
                </Form.Item>
                {/* ID和UPD_CNT通常不允許編輯或新增時填寫，這裡作為隱藏字段或不顯示 */}
                {currentEquipment && (
                    <Form.Item name="ID" label="ID" hidden>
                        <Input />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default EquipmentModalForm;