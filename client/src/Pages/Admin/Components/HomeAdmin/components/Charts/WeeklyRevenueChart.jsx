import classNames from 'classnames/bind';
import styles from '../../HomeAdmin.module.scss';
import { Card, Typography } from 'antd';
import { Bar } from 'react-chartjs-2';

const cx = classNames.bind(styles);
const { Text } = Typography;

function WeeklyRevenueChart({ stats, isLoading }) {
    const data = {
        labels: (stats.weeklyRevenue || []).map((d) => d._id),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: (stats.weeklyRevenue || []).map((d) => d.dailyRevenue),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 4,
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
                        return value.toLocaleString() + ' đ';
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
                    Doanh thu 7 ngày gần nhất
                </Text>
            }
            style={{
                borderRadius: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)',
                height: '100%',
            }}
        >
            <Bar data={data} options={options} />
        </Card>
    );
}

export default WeeklyRevenueChart;
