// src/components/SearchBar.jsx
import React from 'react';
import { Button, Input, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const SearchBar = ({
    searchKeyword,
    onSearchKeywordChange, // 搜尋關鍵字變化時的處理函數
    onSearch               // 點擊搜尋按鈕或回車時的處理函數
}) => {
    return (
        <Row gutter={[16, 16]}> 
            <Col span={20}>
                <Input
                    placeholder="搜尋器材編號或使用者名稱"
                    value={searchKeyword}
                    onChange={(e) => onSearchKeywordChange(e.target.value)}
                    onPressEnter={onSearch}
                    
                />
            </Col>
        </Row>
    );
};

export default SearchBar;