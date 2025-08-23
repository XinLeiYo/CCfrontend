import React from 'react';
import { Card, Statistic, Tag, Flex, Space } from 'antd';
import { getStatusTagColor } from '../utils/statusUtils'; // 假設你把 getStatusTagColor 移到了這裡或 utils 文件

const StatusCards = ({ statusCounts, currentFilterStatus, handleStatusFilter }) => {
    // 確保 getStatusTagColor 函數可以從外部傳入或在內部定義
    // 這裡假設你將它移到了一個公共的 utils 文件中，例如 src/utils/statusUtils.js

    const totalEquipmentCount = Object.values(statusCounts || {}).reduce(
        (acc, count) => acc + count,
        0
    );

    return (
        <Flex style={{ height: "100%" }} gap={16} wrap="wrap" vertical>
            {/* 總計器材 Card */}
            <Card
                key="total-equipment-card"
                hoverable
                className={
                    currentFilterStatus === null
                        ? "status-card active"
                        : "status-card"
                }
                onClick={() => handleStatusFilter(null)}
            >
                <Flex vertical justify="center" align="center"> {/* 使用 Flex 使內容垂直和水平置中 */}
                    <Statistic
                        title={
                            <Flex justify="center">
                                總計器材
                            </Flex>
                        }
                        value={totalEquipmentCount}
                    />
                </Flex>
            </Card>

            {/* 各狀態器材 Card */}
            {Object.entries(statusCounts || {}).map(([status, count]) => (
                <Card
                    key={status}
                    hoverable
                    className={
                        currentFilterStatus === status
                            ? "status-card active"
                            : "status-card"
                    }
                    onClick={() => handleStatusFilter(status)}
                >
                    <Flex vertical justify="center" align="center"> {/* 使用 Flex 使內容垂直和水平置中 */}
                        <Statistic
                            title={
                                <Flex justify="center">
                                    <Tag color={getStatusTagColor(status)}>
                                        {status}
                                    </Tag>
                                </Flex>
                            }
                            value={count}
                        />
                    </Flex>
                </Card>
            ))}
        </Flex>
    );
};

export default StatusCards;