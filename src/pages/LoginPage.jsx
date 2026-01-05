// src/pages/LoginPage.jsx

import React, { useState } from "react";
import { Form, Input, Button, Card, message, Modal, Alert } from "antd";
import {
    UserOutlined,
    LockOutlined,
    CheckCircleOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useAuth } from "../context/useAuth.jsx"; // 確保路徑正確
import "./LoginPage.css"; // 我們稍後會創建這個 CSS 文件

const API_BASE_URL = "http://192.168.2.65:5000";

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [registerForm] = Form.useForm();
    const [isForgetPasswordModalVisible, setIsForgetPasswordModalVisible] =
        useState(false);
    const [forgetPasswordForm] = Form.useForm();
    const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false);
    const [forgetPasswordError, setForgetPasswordError] = useState(null);
    const [forgetPasswordSuccessMessage, setForgetPasswordSuccessMessage] =
        useState(null);
    const [forgetPasswordStep, setForgetPasswordStep] = useState(1);
    const [usernameToReset, setUsernameToReset] = useState(null);
    const [loginError, setLoginError] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/login`,
                values
            );
            if (response.data.success) {
                message.success("登入成功！");
                login(response.data.access_token, response.data.username);
            } else {
                setLoginError(response.data.error);
            }
        } catch (error) {
            console.error("Login failed:", error);
            setLoginError("登入失敗，請檢查使用者名稱或密碼。");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/register`,
                values
            );
            if (response.data.success) {
                message.success("註冊成功！請登入。");
                setIsRegisterModalVisible(false);
                registerForm.resetFields(); // 清空註冊表單
            } else {
                message.error(response.data.error);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            message.error("註冊失敗，請稍後再試。");
        }
    };

    const handleUsernameVerification = async (values) => {
        setForgetPasswordLoading(true);
        setForgetPasswordError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/verify_username`,
                {
                    username: values.username,
                }
            );

            if (response.data.success) {
                // 驗證成功，進入第二步
                setUsernameToReset(values.username);
                setForgetPasswordStep(2);
                forgetPasswordForm.resetFields([
                    "newPassword",
                    "confirmNewPassword",
                ]);
            } else {
                setForgetPasswordError(response.data.error);
            }
        } catch (error) {
            console.error("Username verification failed:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                setForgetPasswordError(error.response.data.error);
            } else {
                setForgetPasswordError("驗證使用者名稱失敗，請稍後再試。");
            }
        } finally {
            setForgetPasswordLoading(false);
        }
    };
    const handlePasswordReset = async (values) => {
        setForgetPasswordLoading(true);
        setForgetPasswordError(null);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/reset_password_no_auth`,
                {
                    username: usernameToReset, // 使用第一步驗證的使用者名稱
                    new_password: values.newPassword,
                }
            );

            if (response.data.success) {
                setForgetPasswordSuccessMessage(response.data.message);
                setForgetPasswordStep(3); // 成功後進入第三步顯示成功訊息
            } else {
                setForgetPasswordError(response.data.error);
            }
        } catch (error) {
            console.error("Password reset failed:", error);
            if (
                error.response &&
                error.response.data &&
                error.response.data.error
            ) {
                setForgetPasswordError(error.response.data.error);
            } else {
                setForgetPasswordError("重設密碼失敗，請稍後再試。");
            }
        } finally {
            setForgetPasswordLoading(false);
        }
    };

    const handleCloseForgetPasswordModal = () => {
        setIsForgetPasswordModalVisible(false);
        forgetPasswordForm.resetFields();
        setForgetPasswordSuccessMessage(null);
        setForgetPasswordError(null);
    };

    return (
        <div className="login-page">
            <Card title="系統登入" className="login-card">
                {loginError && (
                    <Alert
                        message="登入失敗"
                        description={loginError}
                        type="error"
                        showIcon
                        style={{ marginBottom: "16px" }}
                    />
                )}
                <Form
                    name="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: "請輸入使用者名稱！" },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="使用者名稱"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "請輸入密碼！" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="密碼"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            loading={loading}
                        >
                            登入
                        </Button>
                    </Form.Item>
                </Form>
                {/* 忘記密碼連結 */}
                <Button
                    type="link"
                    onClick={() => {
                        setIsForgetPasswordModalVisible(true);
                        setForgetPasswordStep(1); // 重新開啟時，強制回到第一步
                    }}
                    style={{ padding: 0 }}
                >
                    忘記密碼？
                </Button>
                {/* 註冊按鈕 */}
                <Button
                    type="link"
                    onClick={() => setIsRegisterModalVisible(true)}
                    style={{ float: "right" }}
                >
                    註冊新帳號
                </Button>
            </Card>

            {/* 新增註冊模態框 */}
            <Modal
                title="註冊新帳號"
                open={isRegisterModalVisible}
                onCancel={() => setIsRegisterModalVisible(false)}
                footer={null} // 不顯示預設的 OK 和 Cancel 按鈕
            >
                <Form
                    form={registerForm}
                    name="register-form"
                    onFinish={handleRegister}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="使用者名稱"
                        rules={[
                            { required: true, message: "請輸入使用者名稱！" },
                            {
                                min: 3,
                                message: "使用者名稱長度需至少為 3 個字元！",
                            },
                            {
                                // 直接在 validator 中使用 registerForm.getFieldValue()
                                validator: async (_, value) => {
                                    if (!value) {
                                        return Promise.resolve();
                                    }
                                    try {
                                        const response = await axios.post(
                                            `${API_BASE_URL}/auth/verify_username`,
                                            { username: value }
                                        );
                                        if (response.data.success) {
                                            return Promise.reject(
                                                "此使用者名稱已被註冊！"
                                            );
                                        } else {
                                            return Promise.resolve();
                                        }
                                    } catch (error) {
                                        if (
                                            error.response &&
                                            error.response.status === 404
                                        ) {
                                            return Promise.resolve();
                                        } else {
                                            return Promise.reject(
                                                "驗證使用者名稱時發生錯誤！"
                                            );
                                        }
                                    }
                                },
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密碼"
                        rules={[{ required: true, message: "請輸入密碼！" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="確認密碼"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "請再次輸入密碼！" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("兩次輸入的密碼不一致！")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            註冊
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* 忘記密碼模態框 */}
            <Modal
                title="重設密碼"
                open={isForgetPasswordModalVisible}
                onCancel={handleCloseForgetPasswordModal}
                footer={
                    forgetPasswordStep === 3
                        ? [
                                <Button
                                    key="close"
                                    onClick={handleCloseForgetPasswordModal}
                                >
                                    關閉
                                </Button>,
                            ]
                            : [
                                <Button
                                    key="back"
                                    onClick={() => setForgetPasswordStep(1)}
                                    icon={<LeftOutlined />}
                                    style={{
                                        display:
                                            forgetPasswordStep === 2
                                                ? "inline-block"
                                                : "none",
                                    }}
                                >
                                    上一步
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    loading={forgetPasswordLoading}
                                    onClick={() => forgetPasswordForm.submit()}
                                >
                                    {forgetPasswordStep === 1
                                        ? "下一步"
                                        : "重設密碼"}
                                </Button>,
                            ]
                }
            >
                {/* 步驟 3: 顯示成功訊息 */}
                {forgetPasswordStep === 3 && forgetPasswordSuccessMessage ? (
                    <Alert
                        message="成功"
                        description={forgetPasswordSuccessMessage}
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                    />
                ) : (
                    <Form
                        form={forgetPasswordForm}
                        name="forget-password-form"
                        onFinish={
                            forgetPasswordStep === 1
                                ? handleUsernameVerification
                                : handlePasswordReset
                        }
                    >
                        {forgetPasswordStep === 1 && (
                            <>
                                <p>請輸入您的使用者名稱以進行驗證。</p>
                                {forgetPasswordError && (
                                    <Alert
                                        message={forgetPasswordError}
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: "16px" }}
                                    />
                                )}
                                <Form.Item
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: "請輸入使用者名稱！",
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="使用者名稱"
                                    />
                                </Form.Item>
                            </>
                        )}
                        {forgetPasswordStep === 2 && (
                            <>
                                <p>使用者名稱已驗證。請輸入新密碼。</p>
                                {forgetPasswordError && (
                                    <Alert
                                        message={forgetPasswordError}
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: "16px" }}
                                    />
                                )}
                                <Form.Item
                                    name="newPassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: "請輸入新密碼！",
                                        },
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="新密碼"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="confirmNewPassword"
                                    dependencies={["newPassword"]}
                                    rules={[
                                        {
                                            required: true,
                                            message: "請再次輸入新密碼！",
                                        },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (
                                                    !value ||
                                                    getFieldValue(
                                                        "newPassword"
                                                    ) === value
                                                ) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(
                                                    new Error(
                                                        "兩次輸入的密碼不一致！"
                                                    )
                                                );
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="確認新密碼"
                                    />
                                </Form.Item>
                            </>
                        )}
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default LoginPage;
