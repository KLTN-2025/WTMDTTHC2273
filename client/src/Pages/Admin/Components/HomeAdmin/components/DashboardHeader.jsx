import classNames from 'classnames/bind';
import styles from '../HomeAdmin.module.scss';
import { Card, Row, Col, Typography, DatePicker, Select, Button, Space } from 'antd';
import { CalendarOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';

const cx = classNames.bind(styles);
const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

function DashboardHeader({
    selectedPreset,
    dateRange,
    isLoading,
    onPresetChange,
    onDateRangeChange,
    onApplyFilter,
    onResetFilter,
}) {
    return (
        <div className={cx('dashboard-header')}>
            <div className={cx('title-section')}>
                <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
                    Tổng quan
                </Title>
                <Text type="secondary">Theo dõi số liệu và hoạt động của cửa hàng</Text>
            </div>

            <Card
                className={cx('filter-card')}
                bodyStyle={{ padding: 16 }}
                bordered={false}
                style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                    borderRadius: 8,
                    marginTop: 16,
                    background: '#fafafa',
                }}
            >
                <Row gutter={[20, 16]} align="middle">
                    <Col xs={24} md={10}>
                        <div className={cx('filter-label')}>
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            <Text strong>Khoảng thời gian</Text>
                        </div>
                        <RangePicker
                            style={{ marginTop: 8, width: '100%' }}
                            value={dateRange}
                            onChange={onDateRangeChange}
                            allowClear={false}
                        />
                    </Col>

                    <Col xs={24} md={8}>
                        <div className={cx('filter-label')}>
                            <Text strong>Preset nhanh</Text>
                        </div>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            value={selectedPreset}
                            onChange={onPresetChange}
                            loading={isLoading}
                            size="large"
                        >
                            <Option value="today">Hôm nay</Option>
                            <Option value="yesterday">Hôm qua</Option>
                            <Option value="thisWeek">Tuần này</Option>
                            <Option value="lastWeek">Tuần trước</Option>
                            <Option value="thisMonth">Tháng này</Option>
                            <Option value="lastMonth">Tháng trước</Option>
                            <Option value="thisYear">Năm nay</Option>
                            <Option value="custom">Tùy chỉnh</Option>
                        </Select>
                    </Col>

                    <Col xs={24} md={6}>
                        <Space style={{ marginTop: 32 }} wrap>
                            <Button
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={onApplyFilter}
                                loading={isLoading}
                            >
                                Áp dụng
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={onResetFilter} disabled={isLoading}>
                                Đặt lại
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}

export default DashboardHeader;
