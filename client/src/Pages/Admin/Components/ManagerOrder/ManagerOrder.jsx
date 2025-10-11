import classNames from 'classnames/bind';
import styles from './ManagerOrder.module.scss';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useEffect, useState } from 'react';
import { requestGetAllOrder, requestUpdateStatusOrder } from '../../../../config/request';

import toast, { Toaster } from 'react-hot-toast';

const cx = classNames.bind(styles);

function ManagerOder() {
    const [statusOrder, setStatusOrder] = useState('pending');
    const [dataOrder, setDataOrder] = useState([]);
    const fetchData = async () => {
        const res = await requestGetAllOrder(statusOrder);
        setDataOrder(res.metadata.orders);
    };
    useEffect(() => {
        fetchData();
    }, [statusOrder]);

    const handleUpdateStatusOrder = async (orderId, status) => {
        const data = {
            orderId,
            statusOrder: status,
        };
        try {
            const res = await requestUpdateStatusOrder(data);
            toast.success(res.message);
            await fetchData();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleChange = (event) => {
        setStatusOrder(event.target.value);
    };

    const getStatusClass = (status) => {
        return cx('status-badge', status.toLowerCase());
    };

    const getPaymentClass = (type) => {
        return cx('payment-type', type);
    };

    return (
        <div className={cx('wrapper')}>
            <Toaster />
            <header className={cx('header')}>
                <h4>Quản lý đơn hàng</h4>
                <Box sx={{ minWidth: 200 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="demo-simple-select-label">Trạng thái đơn hàng</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={statusOrder}
                            label="Trạng thái đơn hàng"
                            onChange={handleChange}
                        >
                            <MenuItem value={'pending'}>Chờ xác nhận</MenuItem>
                            <MenuItem value={'completed'}>Đã xác nhận</MenuItem>
                            <MenuItem value={'shipping'}>Đang giao</MenuItem>
                            <MenuItem value={'delivered'}>Đã hoàn thành</MenuItem>
                            <MenuItem value={'cancelled'}>Đã huỷ</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </header>
            <div>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell align="center">Sản phẩm</TableCell>
                                <TableCell align="center">Tổng tiền</TableCell>
                                <TableCell align="center">Trạng thái thanh toán</TableCell>
                                <TableCell align="center">Trạng thái đơn hàng</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dataOrder.map((order) => (
                                <TableRow
                                    key={order.orderId}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {order.orderId}
                                    </TableCell>
                                    <TableCell className={cx('product-cell')}>
                                        {order.products.map((product, index) => (
                                            <div key={index} className={cx('product-item')}>
                                                <img src={product.image} alt={product.name} />
                                                <div className={cx('product-info')}>
                                                    <div className={cx('product-name')}>{product.name}</div>
                                                    <div className={cx('product-quantity')}>
                                                        Số lượng: {product.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className={cx('price')}>
                                            {order.totalPrice?.toLocaleString('vi-VN')}đ
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className={getPaymentClass(order.typePayments)}>
                                            {order.typePayments}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className={getStatusClass(order.statusOrder)}>
                                            {order.statusOrder === 'pending'
                                                ? 'Chờ xác nhận'
                                                : order.statusOrder === 'completed'
                                                ? 'Đã xác nhận'
                                                : order.statusOrder === 'shipping'
                                                ? 'Đang giao'
                                                : order.statusOrder === 'delivered'
                                                ? 'Đã hoàn tất'
                                                : 'Đã huy'}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <button className={cx('action-button')}>
                                            {order.statusOrder === 'pending' && (
                                                <span
                                                    onClick={() => handleUpdateStatusOrder(order.orderId, 'completed')}
                                                >
                                                    Xác nhận
                                                </span>
                                            )}
                                            {order.statusOrder === 'completed' && (
                                                <span
                                                    onClick={() => handleUpdateStatusOrder(order.orderId, 'shipping')}
                                                >
                                                    Giao hàng
                                                </span>
                                            )}
                                            {order.statusOrder === 'shipping' && (
                                                <span
                                                    onClick={() => handleUpdateStatusOrder(order.orderId, 'delivered')}
                                                >
                                                    Hoàn tất
                                                </span>
                                            )}
                                            {order.statusOrder === 'delivered' && <span>Đã hoàn tất</span>}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
}

export default ManagerOder;
