import classNames from 'classnames/bind';
import styles from '../../HomeAdmin.module.scss';
import { Card, Typography } from 'antd';
import { Line } from 'react-chartjs-2';

const cx = classNames.bind(styles);
const { Text } = Typography;

function MonthlySalesChart({ stats, isLoading }) {
    const data = {
        labels: (stats.monthlySales || []).map((item) => item.month),
        datasets: [
            {
                label: 'Doanh số (VNĐ)',
                data: (stats.monthlySales || []).map((item) => item.sales),
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback(value) {
                        return (value / 1000000).toFixed(0) + ' tr';
                    },
                },
                grid: {
                    display: true,
                    drawBorder: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <Card
            hoverable
            className={cx('chart-card')}
            bodyStyle={{ padding: 20 }}
            loading={isLoading}
            bordered={false}
            title={
                <Text strong style={{ fontSize: 16 }}>
                    Xu hướng doanh số theo tháng
                </Text>
            }
            style={{
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                height: '100%',
            }}
        >
            <Line data={data} options={options} />
        </Card>
    );
}

export default MonthlySalesChart;
