import classNames from 'classnames/bind';
import styles from '../../HomeAdmin.module.scss';
import { Card, Typography, Progress } from 'antd';

const cx = classNames.bind(styles);
const { Text } = Typography;

function ConversionChart({ stats, isLoading }) {
    return (
        <Card
            hoverable
            title={
                <Text strong style={{ fontSize: 16 }}>
                    Tỷ lệ chuyển đổi
                </Text>
            }
            className={cx('conversion-card')}
            loading={isLoading}
            bordered={false}
            style={{
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                height: '100%',
            }}
        >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Progress
                    type="dashboard"
                    percent={stats.conversion || 0}
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    width={180}
                />
                <div style={{ marginTop: 20 }}>
                    <Text strong style={{ fontSize: 16 }}>
                        Tỷ lệ chuyển đổi khách hàng
                    </Text>
                    <div style={{ fontSize: 14, color: '#8c8c8c', marginTop: 8 }}>
                        Tỷ lệ khách truy cập chuyển đổi thành đơn hàng
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default ConversionChart;
